const { Client } = require('pg');
const { requireDatabaseUrl } = require('./database-url');

async function main() {
  const client = new Client({ connectionString: requireDatabaseUrl('DATABASE_URL') });
  await client.connect();

  // Get columns for translations
  console.log('=== translations columns ===');
  let { rows } = await client.query(`SELECT column_name, data_type, column_default, is_nullable FROM information_schema.columns WHERE table_name = 'translations' ORDER BY ordinal_position`);
  for (const r of rows) {
    console.log(' ', r.column_name, r.data_type, r.column_default, r.is_nullable);
  }

  // Get columns for translations_locales
  console.log('=== translations_locales columns ===');
  ({ rows } = await client.query(`SELECT column_name, data_type, column_default, is_nullable FROM information_schema.columns WHERE table_name = 'translations_locales' ORDER BY ordinal_position`));
  for (const r of rows) {
    console.log(' ', r.column_name, r.data_type, r.column_default, r.is_nullable);
  }

  // Get indexes
  console.log('=== translations indexes ===');
  ({ rows } = await client.query(`SELECT indexname, indexdef FROM pg_indexes WHERE tablename = 'translations'`));
  for (const r of rows) {
    console.log(' ', r.indexname);
    console.log('   ', r.indexdef);
  }

  console.log('=== translations_locales indexes ===');
  ({ rows } = await client.query(`SELECT indexname, indexdef FROM pg_indexes WHERE tablename = 'translations_locales'`));
  for (const r of rows) {
    console.log(' ', r.indexname);
    console.log('   ', r.indexdef);
  }

  // Get FKs
  console.log('=== translations foreign keys ===');
  ({ rows } = await client.query(`
    SELECT tc.constraint_name, kcu.column_name, ccu.table_name AS foreign_table, ccu.column_name AS foreign_column
    FROM information_schema.table_constraints tc
    JOIN information_schema.key_column_usage kcu ON tc.constraint_name = kcu.constraint_name
    JOIN information_schema.constraint_column_usage ccu ON ccu.constraint_name = tc.constraint_name
    WHERE tc.table_name = 'translations' AND tc.constraint_type = 'FOREIGN KEY'
  `));
  for (const r of rows) {
    console.log(' ', r.constraint_name, r.column_name, '->', r.foreign_table + '.' + r.foreign_column);
  }

  console.log('=== translations_locales foreign keys ===');
  ({ rows } = await client.query(`
    SELECT tc.constraint_name, kcu.column_name, ccu.table_name AS foreign_table, ccu.column_name AS foreign_column
    FROM information_schema.table_constraints tc
    JOIN information_schema.key_column_usage kcu ON tc.constraint_name = kcu.constraint_name
    JOIN information_schema.constraint_column_usage ccu ON ccu.constraint_name = tc.constraint_name
    WHERE tc.table_name = 'translations_locales' AND tc.constraint_type = 'FOREIGN KEY'
  `));
  for (const r of rows) {
    console.log(' ', r.constraint_name, r.column_name, '->', r.foreign_table + '.' + r.foreign_column);
  }

  await client.end();
}
main().catch(e => { console.error(e); process.exit(1); });
