const { Client } = require('pg');
const { requireDatabaseUrl } = require('./database-url');

async function main() {
  const client = new Client({ connectionString: requireDatabaseUrl('DATABASE_URL') });
  await client.connect();
  const { rows } = await client.query(`SELECT name, batch FROM payload_migrations ORDER BY batch, name`);
  console.log('Migrations:');
  for (const r of rows) {
    console.log('  -', r.name, '(batch:', r.batch + ')');
  }
  await client.end();
}
main().catch(e => { console.error(e); process.exit(1); });
