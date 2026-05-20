const fs = require('fs');
const path = require('path');

const SUPABASE_KEY = process.env.SUPABASE_KEY;
const PROJECT_REF = 'awzbegybkjfyobilvpgc';

if (!SUPABASE_KEY) {
  console.error('Erreur : la variable SUPABASE_KEY n\'est pas définie.');
  console.error('Définissez-la avec votre Supabase Access Token (app.supabase.com/account/tokens)');
  process.exit(1);
}

const sql = fs.readFileSync(
  path.join(__dirname, 'migrations', 'create_subscribers.sql'),
  'utf-8'
);

async function createTable() {
  const res = await fetch(`https://api.supabase.com/v1/projects/${PROJECT_REF}/database/query`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${SUPABASE_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query: sql }),
  });

  const data = await res.json().catch(() => null);

  if (!res.ok) {
    console.error(`Erreur HTTP ${res.status}:`, data);
    process.exit(1);
  }

  console.log('Table subscribers créée avec succès.');
  if (data) console.log('Réponse:', JSON.stringify(data, null, 2));
}

createTable().catch(err => {
  console.error('Erreur inattendue:', err.message);
  process.exit(1);
});
