const { createClient } = require('@supabase/supabase-js');
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');
const { Resend } = require('resend');
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

// ── Taux de change X → EUR ────────────────────────────────────────────────────
async function fetchRate(base, fallback) {
  if (base === 'EUR') return 1;
  try {
    const res = await fetch(`https://api.exchangerate-api.com/v4/latest/EUR`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    const rate = data.rates?.[base];
    if (!rate) throw new Error('Taux introuvable');
    const eurRate = 1 / rate;
    console.log(`  💱 Taux ${base}/EUR : ${eurRate}`);
    return eurRate;
  } catch (e) {
    console.warn(`  ⚠️  fetchRate(${base}) échoué (${e.message}), fallback ${fallback}`);
    return fallback;
  }
}

// ── Envoi du rapport email ────────────────────────────────────────────────────
async function sendReport(results) {
  const failures = results.filter(r => !r.ok);
  const subject = failures.length === 0
    ? '✅ Cron OK'
    : `⚠️ Cron — ${failures.length} échec(s)`;

  const supplierLines = results.map(r =>
    r.ok
      ? `✅ ${r.name} : ${r.count} produit(s) inséré(s)/mis à jour`
      : `❌ ${r.name} : ${r.error ? r.error : '0 produits'}`
  );

  const failureLines = failures.length > 0
    ? ['', '── Fournisseurs en échec ──', ...failures.map(r => `• ${r.name}${r.error ? ` — ${r.error}` : ' — 0 produits'}`)]
    : [];

  const body = [
    `Rapport du ${new Date().toISOString()}`,
    '',
    '── Résultats par fournisseur ──',
    ...supplierLines,
    ...failureLines,
  ].join('\n');

  const resend = new Resend(process.env.RESEND_API_KEY);
  await resend.emails.send({
    from: 'contact@the-good.one',
    to: 'contact@the-good.one',
    subject,
    text: body,
  });

  console.log(`\n📧 Email envoyé : ${subject}`);
}

// ── Vérification et envoi des alertes stock ──────────────────────────────────
async function checkPriceAlerts() {
  console.log('\n🔔 Vérification des alertes stock...');
  const resend = new Resend(process.env.RESEND_API_KEY);

  const { data: alerts, error } = await supabase
    .from('price_alerts')
    .select('id, user_id, product_url, product_title, fournisseur');

  if (error) { console.error('  Erreur récupération alertes:', error.message); return; }
  if (!alerts || alerts.length === 0) { console.log('  Aucune alerte active.'); return; }

  console.log(`  ${alerts.length} alerte(s) à vérifier`);

  for (const alert of alerts) {
    try {
      // Vérifier stockStatus strictement 'InStock' et données récentes (< 25h)
      const { data: product } = await supabase
        .from('produits')
        .select('url, stockStatus, scraped_at')
        .eq('url', alert.product_url)
        .limit(1)
        .single();

      if (!product) continue;
      if (product.stockStatus !== 'InStock') continue;
      const ageHours = (Date.now() - new Date(product.scraped_at).getTime()) / 3_600_000;
      if (ageHours > 25) continue;

      // Récupérer l'email via auth admin
      const { data: userData, error: userErr } = await supabase.auth.admin.getUserById(alert.user_id);
      if (userErr || !userData?.user?.email) {
        console.warn(`  ⚠️  Email introuvable pour user ${alert.user_id}`);
        continue;
      }
      const email = userData.user.email;

      // Envoyer l'email
      await resend.emails.send({
        from: 'The Good One <contact@the-good.one>',
        to: email,
        subject: '🔔 Un produit que vous suivez est de retour en stock !',
        html: `<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#0a0a0a;font-family:Arial,sans-serif;">
  <div style="max-width:580px;margin:0 auto;background:#0a0a0a;padding:40px 32px;">
    <div style="text-align:center;margin-bottom:36px;">
      <img src="https://the-good.one/assets/logo-blanc.png" alt="The Good One" style="height:100px;width:auto;">
    </div>
    <div style="background:#111;border-top:3px solid #0070F3;padding:28px 28px 24px;margin-bottom:8px;">
      <div style="font-family:'Arial Black',Arial,sans-serif;font-size:19px;font-weight:900;text-transform:uppercase;letter-spacing:1px;color:#ffffff;margin-bottom:18px;">🔔 Retour en stock !</div>
      <p style="font-size:15px;color:#bbb;line-height:1.75;margin:0 0 16px 0;">
        Le produit que vous suivez est de nouveau disponible :
      </p>
      <p style="font-size:18px;color:#fff;font-weight:700;margin:0 0 6px 0;">${alert.product_title || 'Produit'}</p>
      <p style="font-size:13px;color:#888;margin:0;">Fournisseur : ${alert.fournisseur || ''}</p>
    </div>
    <div style="text-align:center;margin:28px 0;">
      <a href="${alert.product_url}" style="background:#0070F3;color:#ffffff;text-decoration:none;padding:16px 40px;font-family:'Arial Black',Arial,sans-serif;font-size:14px;font-weight:900;letter-spacing:2px;text-transform:uppercase;display:inline-block;">VOIR LE PRODUIT</a>
    </div>
    <div style="margin-top:40px;padding-top:20px;border-top:1px solid #161616;text-align:center;">
      <a href="mailto:contact@the-good.one" style="font-size:13px;color:#0070F3;text-decoration:none;font-weight:600;">contact@the-good.one</a>
      <div style="margin-top:10px;font-size:11px;color:#2a2a2a;letter-spacing:1px;text-transform:uppercase;">The Good One · Le moteur du wholesale fripe</div>
    </div>
  </div>
</body>
</html>`,
      });

      // Supprimer l'alerte après envoi
      await supabase.from('price_alerts').delete().eq('id', alert.id);

      console.log(`  ✅ Alerte envoyée pour ${alert.product_title} → ${email}`);
    } catch (e) {
      console.error(`  ❌ Erreur alerte ${alert.id}: ${e.message}`);
    }
  }
}

// ── Pipeline principal ────────────────────────────────────────────────────────
const LOCK_FILE = '/tmp/cron.lock';

async function main() {
  if (fs.existsSync(LOCK_FILE)) {
    console.log('Pipeline déjà en cours, abandon.');
    process.exit(0);
  }
  fs.writeFileSync(LOCK_FILE, String(process.pid));

  try {
    console.log(`\n🚀 Pipeline démarré — ${new Date().toISOString()}\n`);

    const [usdToEur, gbpToEur] = await Promise.all([
      fetchRate('USD', 0.92),
      fetchRate('GBP', 1.17),
    ]);
    const rates = { USD: usdToEur, GBP: gbpToEur, EUR: 1 };

    const results = [];

    for (const [key, supplier] of Object.entries(SUPPLIERS)) {
      if (!supplier.taskId) {
        console.log(`⚠️  [${supplier.name}] Pas de taskId, skip.`);
        continue;
      }
      console.log(`\n📦 [${supplier.name}] (${supplier.currency || 'EUR'})`);
      try {
        const runId = await runTask(supplier.taskId);
        const items = await fetchItems(runId);
        console.log(`  ${items.length} items récupérés`);

        // Prix réels pour TAGZ via products.json
        let tagzPrices = null;
        if (key === 'tagz') {
          try {
            const r = await fetch('https://tagz.now/products.json?limit=250');
            const d = await r.json();
            tagzPrices = {};
            d.products.forEach(p => {
              tagzPrices[p.handle] = parseFloat(p.variants?.[0]?.price ?? 0);
            });
            console.log(`  💰 ${Object.keys(tagzPrices).length} prix TAGZ récupérés via products.json`);
          } catch (e) {
            console.warn(`  ⚠️  Impossible de fetch les prix TAGZ: ${e.message}`);
          }
        }

        const rate = rates[supplier.currency] ?? 1;
        const now = new Date().toISOString();
        const products = items
          .map(p => {
            const mapped = supplier.mapProduct(p, tagzPrices);
            return {
              ...mapped,
              price: mapped.price != null ? Math.round(mapped.price * rate * 100) / 100 : null,
              fournisseur: supplier.name,
              scraped_at: now,
              tags: generateTags(mapped.title),
            };
          })
          .filter(p => p.title && p.url);

        await upsertProducts(products);
        console.log(`  ✅ ${products.length} produits importés avec tags`);
        results.push({ name: supplier.name, count: products.length, ok: products.length > 0 });
      } catch (e) {
        console.error(`  ❌ Erreur: ${e.message}`);
        results.push({ name: supplier.name, count: 0, ok: false, error: e.message });
      }
    }

    // Générer les tags manquants pour les anciens produits
    await fillMissingTags();

    // Régénérer tous les tags via le script Python (logique multilingue complète)
    await runGenerateTags();

    // Vérifier les alertes stock et envoyer les notifications
    try {
      await checkPriceAlerts();
    } catch (e) {
      console.error(`  ⚠️  checkPriceAlerts échoué: ${e.message}`);
    }

    console.log('\n✅ Pipeline terminé.');

    try {
      await sendReport(results);
    } catch (e) {
      console.error(`  ⚠️  Envoi email échoué: ${e.message}`);
    }
  } finally {
    if (fs.existsSync(LOCK_FILE)) fs.unlinkSync(LOCK_FILE);
  }
}

function pipInstall(pip) {
  return new Promise((resolve, reject) => {
    const req = path.join(__dirname, 'requirements.txt');
    const proc = spawn(pip, ['install', '-r', req, '--break-system-packages'], { stdio: 'inherit' });
    proc.on('close', code => code === 0 ? resolve() : reject(new Error(`pip install exited with code ${code}`)));
    proc.on('error', reject);
  });
}

async function runGenerateTags() {
  console.log('\n📦 Installation des dépendances Python...');
  try {
    await pipInstall('pip');
  } catch {
    await pipInstall('pip3');
  }

  console.log('\n🏷️  Régénération des tags (generate_tags.py)...');
  const script = path.join(__dirname, 'generate_tags.py');
  console.log(`  [generate_tags.py] chemin: ${script}`);
  console.log(`  [generate_tags.py] existe: ${fs.existsSync(script)}`);

  function spawnPython(bin) {
    return new Promise((resolve, reject) => {
      const proc = spawn(bin, [script], { stdio: ['inherit', 'inherit', 'pipe'] });
      proc.stderr.on('data', chunk => {
        process.stderr.write(chunk);
        console.error(chunk.toString());
      });
      proc.on('close', code => {
        console.log(`  [generate_tags.py] exit code: ${code}`);
        if (code === 0) resolve();
        else reject(new Error(`generate_tags.py exited with code ${code}`));
      });
      proc.on('error', reject);
    });
  }

  try {
    await spawnPython('python');
  } catch (e) {
    if (e.code === 'ENOENT') await spawnPython('python3');
    else throw e;
  }
}

main();
