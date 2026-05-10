/* eslint-disable @typescript-eslint/no-require-imports */
const { Client } = require('pg');
const { requireDatabaseUrl } = require('./database-url');

async function main() {
  const client = new Client({ connectionString: requireDatabaseUrl('DATABASE_URL') });
  await client.connect();
  const { rows } = await client.query(
    `SELECT column_name FROM information_schema.columns WHERE table_name = 'payload_locked_documents_rels' ORDER BY ordinal_position`
  );
  console.log('Columns in payload_locked_documents_rels:');
  for (const r of rows) {
    console.log('  -', r.column_name);
  }
  await client.end();
}
main().catch(e => { console.error(e); process.exit(1); });
