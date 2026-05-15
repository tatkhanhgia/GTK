/* eslint-disable @typescript-eslint/no-require-imports */
const { Client } = require('pg');
const { getDatabaseName, requireTestDatabaseUrl } = require('./database-url');

async function main() {
  const connectionString = requireTestDatabaseUrl();
  const client = new Client({ connectionString });
  await client.connect();
  const { rows } = await client.query(`SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name`);
  console.log(`Tables in ${getDatabaseName(connectionString)}:`);
  for (const r of rows) {
    console.log('  -', r.table_name);
  }
  await client.end();
}
main().catch(e => { console.error(e); process.exit(1); });
