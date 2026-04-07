#!/usr/bin/env node

/**
 * Startup Check Script
 * Warns about pending migrations before starting the app
 */

const { execSync } = require('child_process');
const { Client } = require('pg');

const YELLOW = '\x1b[1;33m';
const RED = '\x1b[0;31m';
const GREEN = '\x1b[0;32m';
const NC = '\x1b[0m'; // No Color

function log(message) {
  console.log(message);
}

async function checkDatabase() {
  log('⏳ Checking database connection...');

  const client = new Client({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    await client.connect();
    await client.query('SELECT 1');
    await client.end();
    log(`${GREEN}✓ Database connected${NC}`);
    return true;
  } catch (error) {
    log(`${RED}✗ Could not connect to database${NC}`);
    return false;
  }
}

async function checkMigrations() {
  log('');
  log('⏳ Checking for pending migrations...');

  try {
    // Try to get migration status using Payload CLI
    const output = execSync('npx payload migrate:status 2>&1', {
      encoding: 'utf-8',
      timeout: 30000,
    });

    const pendingCount = (output.match(/Pending/g) || []).length;

    if (pendingCount > 0) {
      log('');
      log(`${RED}╔════════════════════════════════════════════════════════════╗${NC}`);
      log(`${RED}║  ⛔ CRITICAL: PENDING DATABASE MIGRATIONS DETECTED!        ║${NC}`);
      log(`${RED}╠════════════════════════════════════════════════════════════╣${NC}`);
      log(`${RED}║                                                            ║${NC}`);
      log(`${RED}║  You have ${pendingCount} migration(s) that MUST be applied.            ║${NC}`);
      log(`${RED}║                                                            ║${NC}`);
      log(`${RED}║  The application CANNOT start until migrations are run.    ║${NC}`);
      log(`${RED}║                                                            ║${NC}`);
      log(`${RED}║  Run this command to fix:                                  ║${NC}`);
      log(`${RED}║                                                            ║${NC}`);
      log(`${YELLOW}║     docker-compose run --rm app npx payload migrate        ${NC}`);
      log(`${RED}║                                                            ║${NC}`);
      log(`${RED}║  Then restart:                                             ║${NC}`);
      log(`${YELLOW}║     docker-compose restart app                             ${NC}`);
      log(`${RED}║                                                            ║${NC}`);
      log(`${RED}║  Or set AUTO_MIGRATE=true to auto-apply (use with care!)   ║${NC}`);
      log(`${RED}║                                                            ║${NC}`);
      log(`${RED}╚════════════════════════════════════════════════════════════╝${NC}`);
      log('');

      if (process.env.AUTO_MIGRATE === 'true') {
        log(`${YELLOW}AUTO_MIGRATE is enabled. Applying migrations now...${NC}`);
        try {
          execSync('npx payload migrate', {
            stdio: 'inherit',
            timeout: 60000,
          });
          log(`${GREEN}✓ Migrations applied successfully${NC}`);
          log(`${GREEN}✓ Continuing with application startup...${NC}`);
          return true;
        } catch (migrateError) {
          log(`${RED}✗ Migration failed!${NC}`);
          log(`${RED}✗ Application cannot start.${NC}`);
          process.exit(1);
        }
      } else {
        log(`${RED}⛔ Application startup ABORTED due to pending migrations.${NC}`);
        log(`${RED}⛔ Exit code: 1${NC}`);
        process.exit(1);
      }
    } else {
      log(`${GREEN}✓ All migrations up to date${NC}`);
      return true;
    }
  } catch (error) {
    // If payload migrate:status fails, it might mean no migrations table yet
    // which is fine for fresh installs
    if (error.message.includes('relation') || error.message.includes('does not exist')) {
      log(`${YELLOW}⚠️  Migrations table not found. Fresh install or schema not initialized.${NC}`);
      return true;
    }
    log(`${YELLOW}⚠️  Could not check migration status: ${error.message}${NC}`);
    return true;
  }
}

async function main() {
  log('==========================================');
  log('  GTKBlog Startup Check');
  log('==========================================');
  log('');

  if (!process.env.DATABASE_URL) {
    log(`${RED}ERROR: DATABASE_URL not set${NC}`);
    process.exit(1);
  }

  const dbConnected = await checkDatabase();
  if (!dbConnected) {
    process.exit(1);
  }

  await checkMigrations();

  log('');
  log('==========================================');
  log('  Starting Application...');
  log('==========================================');
  log('');

  // Start the actual application
  const { spawn } = require('child_process');
  const args = process.argv.slice(2);
  const child = spawn(args[0], args.slice(1), {
    stdio: 'inherit',
    shell: false,
  });

  child.on('exit', (code) => {
    process.exit(code);
  });
}

main().catch((error) => {
  console.error('Startup check failed:', error);
  process.exit(1);
});
