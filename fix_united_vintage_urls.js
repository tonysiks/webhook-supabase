// One-shot script: fix United Vintage URLs not starting with 'http'
// Usage: SUPABASE_KEY=xxx node fix_united_vintage_urls.js

const SUPABASE_URL = 'https://awzbegybkjfyobilvpgc.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_KEY;

if (!SUPABASE_KEY) {
  console.error('SUPABASE_KEY manquant');
  process.exit(1);
}

const headers = {
  apikey: SUPABASE_KEY,
  Authorization: `Bearer ${SUPABASE_KEY}`,
  'Content-Type': 'application/json',
  Prefer: 'return=minimal',
};

async function main() {
  console.log('Récupération des produits United Vintage avec URL mal formée...');

  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/produits?select=id,url&fournisseur=eq.United%20Vintage&url=not.like.http%25`,
    { headers }
  );
  if (!res.ok) throw new Error(`Fetch échoué: ${res.status} ${await res.text()}`);

  const rows = await res.json();
  console.log(`${rows.length} produits à corriger`);

  let fixed = 0;
  let errors = 0;
  for (const row of rows) {
    const newUrl = `https://www.${row.url}`;
    const patch = await fetch(
      `${SUPABASE_URL}/rest/v1/produits?id=eq.${row.id}`,
      { method: 'PATCH', headers, body: JSON.stringify({ url: newUrl }) }
    );
    if (patch.ok) {
      fixed++;
      if (fixed % 50 === 0) console.log(`  ${fixed}/${rows.length} corrigés...`);
    } else {
      console.error(`  ❌ id=${row.id}: ${patch.status}`);
      errors++;
    }
  }

  console.log(`\n✅ ${fixed} URLs corrigées, ${errors} erreurs`);
}

main().catch(e => { console.error(e.message); process.exit(1); });
