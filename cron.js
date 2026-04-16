const { createClient } = require('@supabase/supabase-js');
const SUPPLIERS = require('./suppliers');

const supabase = createClient(
  'https://awzbegybkjfyobilvpgc.supabase.co',
  process.env.SUPABASE_KEY
);

const APIFY_TOKEN = process.env.APIFY_TOKEN;

// ── Upsert par batch de 500 ───────────────────────────────────────────────────
async function upsertProducts(products) {
  const BATCH = 500;
  for (let i = 0; i < products.length; i += BATCH) {
    const { error } = await supabase
      .from('produits')
      .upsert(products.slice(i, i + BATCH), { onConflict: 'url' });
    if (error) throw error;
  }
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

  // Poll toutes les 10s, max 10 minutes
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

// ── Pipeline principal ────────────────────────────────────────────────────────
async function main() {
  console.log(`\n🚀 Pipeline démarré — ${new Date().toISOString()}\n`);

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
          ...supplier.mapProduct(p),
          fournisseur: supplier.name,
          scraped_at: now,
        }));

      await upsertProducts(products);
      console.log(`  ✅ ${products.length} produits importés`);
    } catch (e) {
      console.error(`  ❌ Erreur: ${e.message}`);
    }
  }

  console.log('\n✅ Pipeline terminé.');
}

main();
