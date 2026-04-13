const express = require('express');
const { createClient } = require('@supabase/supabase-js');

const app = express();
app.use(express.json());

const supabase = createClient(
  'https://awzbegybkjfyobilvpgc.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF3emJlZ3lia2pmeW9iaWx2cGdjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU5NjM3MjcsImV4cCI6MjA5MTUzOTcyN30.NENJdd9sZiyoh7vR4j-msWJ8u0uLFxnz4s-6qYmUkuM'
);

app.post('/webhook', async (req, res) => {
  try {
    const items = req.body;
    if (!Array.isArray(items)) return res.status(400).send('Invalid data');

    const products = items.map(p => ({
      title: p.title || null,
      'categories/0': p.categories?.[0] || null,
      'medias/0/url': p.images?.[0] || null,
      fournisseur: 'Vintage Wholesale Supply'
    }));

    await supabase.from('VWS').delete().neq('id', 0);
    const { error } = await supabase.from('VWS').insert(products);

    if (error) throw error;
    res.status(200).send('OK');
  } catch(e) {
    console.error(e);
    res.status(500).send('Error');
  }
});

app.get('/', (req, res) => res.send('Webhook actif !'));

app.listen(3000, () => console.log('Serveur démarré'));
