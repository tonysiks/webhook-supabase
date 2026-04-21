const { createClient } = require('@supabase/supabase-js');
const { spawn } = require('child_process');
const path = require('path');
const SUPPLIERS = require('./suppliers');

const supabase = createClient(
  'https://awzbegybkjfyobilvpgc.supabase.co',
  process.env.SUPABASE_KEY
);

const APIFY_TOKEN = process.env.APIFY_TOKEN;

// ── Dictionnaire de traductions multilingues ──────────────────────────────────
const TRANSLATIONS = {
  // Types de vêtements
  'tshirt': 't-shirt camiseta maglietta t-shirt camisa tshirt top',
  'shirt': 'chemise camisa camicia hemd shirt blouse',
  'jacket': 'veste chaqueta giacca jacke jaqueta jacket manteau',
  'coat': 'manteau abrigo cappotto mantel casaco coat veste',
  'hoodie': 'hoodie sweat sudadera felpa kapuzenpullover moletom pull sweatshirt',
  'sweatshirt': 'sweatshirt pull sudadera felpa sweatshirt moletom hoodie',
  'jumper': 'pull jersey maglione pullover jersey jumper sweatshirt',
  'sweater': 'pull jersey maglione pullover jersey sweater sweatshirt',
  'knitwear': 'tricot punto maglia strick malha knitwear pull knit',
  'jeans': 'jeans vaqueros jeans jeans jeans calça denim',
  'trousers': 'pantalon pantalón pantaloni hose calça trousers pants',
  'shorts': 'short pantalón corto pantaloncini shorts bermuda short',
  'dress': 'robe vestido abito kleid vestido dress',
  'skirt': 'jupe falda gonna rock saia skirt',
  'top': 'top top top top top top',
  'polo': 'polo polo polo polo polo polo shirt',
  'tracksuit': 'survêtement chándal tuta trainingsanzug agasalho tracksuit jogging',
  'leggings': 'legging leggins leggings leggings leggings leggings',
  'vest': 'gilet chaleco gilet weste colete vest',
  'blazer': 'blazer blazer blazer blazer blazer blazer veste',
  'cardigan': 'cardigan cardigan cardigan cardigan cardigan cardigan',
  'dungarees': 'salopette peto salopette latzhose jardineira dungarees overall',
  'windbreaker': 'coupe-vent cortavientos giacca a vento windbreaker corta-vento windbreaker',
  'fleece': 'polaire forro polar pile fleece velo fleece',
  'denim': 'denim denim denim denim denim denim jeans',
  'leather': 'cuir cuero pelle leder couro leather',
  'vintage': 'vintage vintage vintage vintage vintage vintage retro',
  'mix': 'mélange mezcla misto mix mistura mix assortiment',
  'bale': 'balle fardo balla ballen fardo bale',
  'bundle': 'lot lote lotto bündel lote bundle pack',
  'grade': 'grade grade qualità qualität qualidade grade qualité',

  // Genres
  'men': 'homme hombre uomo herren homem men masculin',
  'women': 'femme mujer donna damen mulher women féminin',
  'kids': 'enfant niño bambino kinder criança kids enfants',
  'unisex': 'unisexe unisex unisex unisex unissex unisex',

  // Marques courantes
  'ralph lauren': 'ralph lauren polo',
  'nike': 'nike swoosh',
  'adidas': 'adidas trois bandes',
  'carhartt': 'carhartt workwear',
  'levi': 'levis denim jeans',
  'tommy hilfiger': 'tommy hilfiger tommy',
  'north face': 'north face the north face',
  'champion': 'champion',
  'lacoste': 'lacoste crocodile',
  'wrangler': 'wrangler denim',
  'dickies': 'dickies workwear',
  'patagonia': 'patagonia outdoor',
  'hugo boss': 'hugo boss boss',
  'calvin klein': 'calvin klein ck',
  'guess': 'guess',
  'fila': 'fila',
  'reebok': 'reebok',
  'puma': 'puma',
  'under armour': 'under armour ua',
  'columbia': 'columbia outdoor',
  'timberland': 'timberland',
  'levi strauss': 'levis denim',
};

// ── Générer les tags pour un titre ───────────────────────────────────────────
function generateTags(title) {
  if (!title) return '';
  const titleLower = title.toLowerCase();
  const tags = new Set();

  // Ajouter le titre original en mots
  title.split(/\s+/).forEach(w => { if (w.length > 2) tags.add(w.toLowerCase()); });

  // Chercher les correspondances dans le dictionnaire
  for (const [keyword, translations] of Object.entries(TRANSLATIONS)) {
    if (titleLower.includes(keyword)) {
      translations.split(' ').forEach(t => tags.add(t));
    }
  }

  return Array.from(tags).join(' ');
}

// ── Upsert par batch de 500 ───────────────────────────────────────────────────
async function upsertProducts(products) {
  // Deduplicate by URL — duplicate URLs in one batch cause ON CONFLICT DO UPDATE to fail
  const seen = new Map();
  for (const p of products) {
    if (p.url) seen.set(p.url, p);
  }
  const deduped = [...seen.values()];

  const BATCH = 500;
  for (let i = 0; i < deduped.length; i += BATCH) {
    const { error } = await supabase
      .from('produits')
      .upsert(deduped.slice(i, i + BATCH), { onConflict: 'url' });
    if (error) throw error;
  }
}

// ── Générer les tags manquants en base ───────────────────────────────────────
async function fillMissingTags() {
  console.log('\n🏷️  Génération des tags manquants...');
  const { data, error } = await supabase
    .from('produits')
    .select('id, title')
    .or('tags.is.null,tags.eq.');

  if (error) { console.error('Erreur récupération produits sans tags:', error.message); return; }
  if (!data || data.length === 0) { console.log('  Tous les produits ont des tags ✅'); return; }

  console.log(`  ${data.length} produits sans tags à traiter`);
  const BATCH = 500;
  for (let i = 0; i < data.length; i += BATCH) {
    const batch = data.slice(i, i + BATCH);
    for (const p of batch) {
      const tags = generateTags(p.title);
      await supabase.from('produits').update({ tags }).eq('id', p.id);
    }
    console.log(`  ${Math.min(i + BATCH, data.length)}/${data.length} tags générés`);
  }
  console.log('  ✅ Tags manquants générés');
}

// ── Lancer une task Apify et attendre le résultat ────────────────────────────
async function runTask(taskId) {
  console.log(`  Lancement task ${taskId}...`);
  const runRes = await fetch(`https://api.apify.com/v2/actor-tasks/${taskId}/runs?token=${APIFY_TOKEN}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({})
  });
  if (!runRes.ok) throw new Error(`Impossible de lancer la task: ${runRes.status}`);
  const runId = (await runRes.json()).data.id;
  console.log(`  Run lancé: ${runId}`);

  for (let i = 0; i < 60; i++) {
    await sleep(10000);
    const s = await (await fetch(`https://api.apify.com/v2/actor-runs/${runId}?token=${APIFY_TOKEN}`)).json();
    const status = s.data.status;
    console.log(`  Status: ${status}`);
    if (status === 'SUCCEEDED') return runId;
    if (['FAILED', 'ABORTED', 'TIMED-OUT'].includes(status)) throw new Error(`Run échoué: ${status}`);
  }
  throw new Error('Timeout — run trop long');
}

// ── Récupérer les items du dataset ───────────────────────────────────────────
async function fetchItems(runId) {
  const url = `https://api.apify.com/v2/actor-runs/${runId}/dataset/items?token=${APIFY_TOKEN}&format=json&limit=10000`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Erreur dataset: ${res.status}`);
  return res.json();
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

// ── Taux de change USD → EUR ──────────────────────────────────────────────────
async function fetchUSDtoEUR() {
  try {
    const res = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    const rate = data.rates?.EUR;
    if (!rate) throw new Error('Taux EUR introuvable');
    console.log(`  💱 Taux USD/EUR : ${rate}`);
    return rate;
  } catch (e) {
    console.warn(`  ⚠️  fetchUSDtoEUR échoué (${e.message}), fallback 0.92`);
    return 0.92;
  }
}

// ── Pipeline principal ────────────────────────────────────────────────────────
async function main() {
  console.log(`\n🚀 Pipeline démarré — ${new Date().toISOString()}\n`);

  const usdToEur = await fetchUSDtoEUR();

  for (const [key, supplier] of Object.entries(SUPPLIERS)) {
    if (!supplier.taskId) {
      console.log(`⚠️  [${supplier.name}] Pas de taskId, skip.`);
      continue;
    }
    console.log(`\n📦 [${supplier.name}]`);
    try {
      const runId = await runTask(supplier.taskId);
      const items = await fetchItems(runId);
      console.log(`  ${items.length} items récupérés`);

      const now = new Date().toISOString();
      const products = items
        .filter(p => p.title)
        .map(p => ({
          ...supplier.mapProduct(p, usdToEur),
          fournisseur: supplier.name,
          scraped_at: now,
          tags: generateTags(p.title),
        }))
        .filter(p => p.url);

      await upsertProducts(products);
      console.log(`  ✅ ${products.length} produits importés avec tags`);
    } catch (e) {
      console.error(`  ❌ Erreur: ${e.message}`);
    }
  }

  // Générer les tags manquants pour les anciens produits
  await fillMissingTags();

  // Régénérer tous les tags via le script Python (logique multilingue complète)
  await runGenerateTags();

  console.log('\n✅ Pipeline terminé.');
}

function runGenerateTags() {
  return new Promise((resolve, reject) => {
    console.log('\n🏷️  Régénération des tags (generate_tags.py)...');
    const script = path.join(__dirname, 'generate_tags.py');
    const proc = spawn('python', [script], { stdio: 'inherit' });
    proc.on('close', code => {
      if (code === 0) resolve();
      else reject(new Error(`generate_tags.py exited with code ${code}`));
    });
    proc.on('error', err => {
      // Fallback python3 si python n'est pas disponible
      const proc3 = spawn('python3', [script], { stdio: 'inherit' });
      proc3.on('close', code => code === 0 ? resolve() : reject(new Error(`generate_tags.py exited with code ${code}`)));
      proc3.on('error', reject);
    });
  });
}

main();
