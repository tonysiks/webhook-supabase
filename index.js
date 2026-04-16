const express = require('express');
const { createClient } = require('@supabase/supabase-js');
const SUPPLIERS = require('./suppliers');

const app = express();
app.use(express.json({ limit: '50mb' }));

const supabase = createClient(
  'https://awzbegybkjfyobilvpgc.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF3emJlZ3lia2pmeW9iaWx2cGdjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU5NjM3MjcsImV4cCI6MjA5MTUzOTcyN30.NENJdd9sZiyoh7vR4j-msWJ8u0uLFxnz4s-6qYmUkuM'
);

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

// ── Route générique : POST /webhook?supplier=vws ──────────────────────────────
app.post('/webhook', async (req, res) => {
  const supplierKey = req.query.supplier;

  // Vérifier que le fournisseur existe dans la config
  if (!supplierKey || !SUPPLIERS[supplierKey]) {
    return res.status(400).json({
      error: `Fournisseur inconnu : "${supplierKey}". Fournisseurs disponibles : ${Object.keys(SUPPLIERS).join(', ')}`
    });
  }

  const supplier = SUPPLIERS[supplierKey];
  const items = req.body;

  if (!Array.isArray(items)) {
    return res.status(400).json({ error: 'Le body doit être un tableau JSON' });
  }

  try {
    const now = new Date().toISOString();
    const products = items
      .filter(p => p.title)
      .map(p => ({
        ...supplier.mapProduct(p),
        fournisseur: supplier.name,
        scraped_at: now,
      }));

    await upsertProducts(products);
    console.log(`[${supplier.name}] ${products.length} produits importés`);
    res.status(200).json({ ok: true, supplier: supplier.name, count: products.length });

  } catch (e) {
    console.error(`[${supplier.name}] Erreur:`, e.message);
    res.status(500).json({ error: e.message });
  }
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
