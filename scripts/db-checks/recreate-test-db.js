const { Client } = require('pg');
const {
  getMaintenanceDatabaseUrl,
  quoteIdentifier,
  requireRecreatableTestDatabaseName,
  requireTestDatabaseUrl,
} = require('./database-url');

async function main() {
  const testDatabaseUrl = requireTestDatabaseUrl();
  const databaseName = requireRecreatableTestDatabaseName(testDatabaseUrl);
  const client = new Client({ connectionString: getMaintenanceDatabaseUrl(testDatabaseUrl) });

  await client.connect();
  await client.query(
    'SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = $1 AND pid <> pg_backend_pid()',
    [databaseName]
  );
  await client.query(`DROP DATABASE IF EXISTS ${quoteIdentifier(databaseName)}`);
  await client.query(`CREATE DATABASE ${quoteIdentifier(databaseName)}`);
  console.log(`Recreated ${databaseName}`);
  await client.end();
}
main().catch(e => { console.error(e); process.exit(1); });
