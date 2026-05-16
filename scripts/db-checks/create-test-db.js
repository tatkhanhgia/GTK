/* eslint-disable @typescript-eslint/no-require-imports */
const { Client } = require('pg');
const {
  getMaintenanceDatabaseUrl,
  quoteIdentifier,
  requireMatchingTestDatabaseName,
  requireTestDatabaseUrl,
} = require('./database-url');

async function main() {
  const testDatabaseUrl = requireTestDatabaseUrl();
  const databaseName = requireMatchingTestDatabaseName(testDatabaseUrl);
  const client = new Client({ connectionString: getMaintenanceDatabaseUrl(testDatabaseUrl) });

  await client.connect();
  await client.query(`CREATE DATABASE ${quoteIdentifier(databaseName)}`);
  console.log(`Created ${databaseName}`);
  await client.end();
}
main().catch(e => { console.error(e); process.exit(1); });
