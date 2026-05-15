/* eslint-disable @typescript-eslint/no-require-imports */
const { Client } = require('pg');
const { getDatabaseName, requireTestDatabaseUrl } = require('./database-url');

async function main() {
  const connectionString = requireTestDatabaseUrl();
  const client = new Client({ connectionString });
  await client.connect();
  const { rows } = await client.query(`SELECT name, batch FROM payload_migrations ORDER BY batch, name`);
  console.log(`Migrations in ${getDatabaseName(connectionString)}:`);
  for (const r of rows) {
    console.log('  -', r.name, '(batch:', r.batch + ')');
  }
  await client.end();
}
main().catch(e => { console.error(e); process.exit(1); });
