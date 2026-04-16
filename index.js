const express = require('express');
const { createClient } = require('@supabase/supabase-js');
const SUPPLIERS = require('./suppliers');

const app = express();
app.use(express.json({ limit: '50mb' }));

const supabase = createClient(
  'https://awzbegybkjfyobilvpgc.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF3emJlZ3lia2pmeW9iaWx2cGdjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU5NjM3MjcsImV4cCI6MjA5MTUzOTcyN30.NENJdd9sZiyoh7vR4j-msWJ8u0uLFxnz4s-6qYmUkuM'
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

// ── Route webhook : appelée par Apify après chaque run ────────────────────────
app.post('/webhook', async (req, res) => {
  const supplierKey = req.query.supplier;

  if (!supplierKey || !SUPPLIERS[supplierKey]) {
    return res.status(400).json({
      error: `Fournisseur inconnu : "${supplierKey}". Disponibles : ${Object.keys(SUPPLIERS).join(', ')}`
    });
  }

  const supplier = SUPPLIERS[supplierKey];

  // Récupérer l'ID du run depuis le payload Apify
  const runId = req.body?.resource?.id || req.body?.eventData?.actorRunId;
  if (!runId) {
    return res.status(400).json({ error: 'Impossible de trouver le runId dans le payload' });
  }

  // Répondre immédiatement à Apify pour éviter le timeout
  res.status(200).json({ ok: true, message: 'Import en cours...' });

  // Traitement en arrière-plan
  (async () => {
    try {
      console.log(`[${supplier.name}] Récupération du dataset pour le run ${runId}...`);

      const url = `https://api.apify.com/v2/actor-runs/${runId}/dataset/items?token=${APIFY_TOKEN}&format=json&limit=10000`;
      const response = await fetch(url);
      if (!response.ok) throw new Error(`Apify API error: ${response.status}`);
      const items = await response.json();

      if (!Array.isArray(items) || items.length === 0) {
        console.log(`[${supplier.name}] Aucun item dans le dataset`);
        return;
      }

      const now = new Date().toISOString();
      const products = items
        .filter(p => p.title)
        .map(p => ({
          ...supplier.mapProduct(p),
          fournisseur: supplier.name,
          scraped_at: now,
        }));

      await upsertProducts(products);
      console.log(`[${supplier.name}] ✅ ${products.length} produits importés`);
    } catch (e) {
      console.error(`[${supplier.name}] ❌ Erreur:`, e.message);
    }
  })();
});

// ── Health check ──────────────────────────────────────────────────────────────
app.get('/', (req, res) => {
  res.json({
    status: 'ok',
    suppliers: Object.keys(SUPPLIERS),
    usage: 'POST /webhook?supplier=<key>'
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Serveur démarré sur le port ${PORT}`));
