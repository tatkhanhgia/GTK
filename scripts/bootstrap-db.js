#!/usr/bin/env node
/**
 * Idempotent app-owned DB bootstrap.
 *
 * Runs AFTER Payload schema sync and BEFORE the Next.js server starts.
 * Creates/verifies Better Auth tables, custom Drizzle tables, and
 * targeted compatibility fixes that sit outside Payload's migration
 * boundary.
 *
 * Ownership boundary (keep separate from Payload internals):
 *   - Payload-managed schema  → handled by scripts/payload-db-sync.ts
 *   - App-managed schema      → handled by this file
 *
 * This script talks to Postgres directly via `pg` (a transitive prod dep
 * of @payloadcms/db-postgres). Each fix is idempotent — already-applied
 * fixes report `up-to-date` and continue.
 */
'use strict'

const { Client } = require('pg')
const fs = require('fs/promises')
const path = require('path')

const PRIVATE_DOWNLOAD_DIR = path.resolve(process.cwd(), 'digital-downloads')
const LEGACY_MEDIA_DIR = path.resolve(process.cwd(), 'public/media')

async function loadLocalEnvIfNeeded() {
  if (process.env.DATABASE_URL) return

  let content
  try {
    content = await fs.readFile(path.resolve(process.cwd(), '.env.local'), 'utf8')
  } catch {
    return
  }

  for (const rawLine of content.split(/\r?\n/)) {
    const line = rawLine.trim()
    if (!line || line.startsWith('#')) continue

    const separatorIndex = line.indexOf('=')
    if (separatorIndex <= 0) continue

    const key = line.slice(0, separatorIndex).trim()
    let value = line.slice(separatorIndex + 1).trim()

    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1)
    }

    process.env[key] = process.env[key] || value
  }
}

async function moveFileAcrossVolumes(sourcePath, targetPath) {
  try {
    await fs.rename(sourcePath, targetPath)
    return
  } catch (err) {
    if (err && err.code === 'EXDEV') {
      await fs.copyFile(sourcePath, targetPath)
      await fs.unlink(sourcePath)
      return
    }
    throw err
  }
}

const AUTH_SCHEMA_SQL = `
CREATE TABLE IF NOT EXISTS ba_users (
  id text PRIMARY KEY NOT NULL,
  name text NOT NULL,
  email text NOT NULL,
  email_verified boolean NOT NULL DEFAULT false,
  image text,
  role text NOT NULL DEFAULT 'user',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS ba_sessions (
  id text PRIMARY KEY NOT NULL,
  expires_at timestamp with time zone NOT NULL,
  token text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  ip_address text,
  user_agent text,
  user_id text NOT NULL,
  CONSTRAINT ba_sessions_user_id_fk FOREIGN KEY (user_id) REFERENCES ba_users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS ba_accounts (
  id text PRIMARY KEY NOT NULL,
  account_id text NOT NULL,
  provider_id text NOT NULL,
  user_id text NOT NULL,
  access_token text,
  refresh_token text,
  id_token text,
  access_token_expires_at timestamp with time zone,
  refresh_token_expires_at timestamp with time zone,
  scope text,
  password text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT ba_accounts_user_id_fk FOREIGN KEY (user_id) REFERENCES ba_users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS ba_verifications (
  id text PRIMARY KEY NOT NULL,
  identifier text NOT NULL,
  value text NOT NULL,
  expires_at timestamp with time zone NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS ba_users_email_unique ON ba_users (email);
CREATE UNIQUE INDEX IF NOT EXISTS ba_sessions_token_unique ON ba_sessions (token);
CREATE INDEX IF NOT EXISTS ba_sessions_user_id_idx ON ba_sessions (user_id);
CREATE INDEX IF NOT EXISTS ba_sessions_expires_at_idx ON ba_sessions (expires_at);
CREATE UNIQUE INDEX IF NOT EXISTS ba_accounts_provider_account_unique ON ba_accounts (provider_id, account_id);
CREATE INDEX IF NOT EXISTS ba_accounts_user_id_idx ON ba_accounts (user_id);
CREATE INDEX IF NOT EXISTS ba_verifications_identifier_idx ON ba_verifications (identifier);

ALTER TABLE ba_users
  ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'active',
  ADD COLUMN IF NOT EXISTS banned boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS ban_reason text,
  ADD COLUMN IF NOT EXISTS ban_expires timestamp with time zone;

ALTER TABLE ba_sessions
  ADD COLUMN IF NOT EXISTS impersonated_by text;
`;

const CUSTOM_SCHEMA_SQL = `
DO $$ BEGIN
  CREATE TYPE order_status AS ENUM ('pending', 'paid', 'fulfilled', 'refunded', 'cancelled');
EXCEPTION WHEN duplicate_object THEN null;
END $$;
DO $$ BEGIN
  CREATE TYPE payment_method AS ENUM ('stripe', 'sepay');
EXCEPTION WHEN duplicate_object THEN null;
END $$;
DO $$ BEGIN
  CREATE TYPE comment_status AS ENUM ('pending', 'approved', 'rejected', 'deleted');
EXCEPTION WHEN duplicate_object THEN null;
END $$;
DO $$ BEGIN
  CREATE TYPE subscriber_status AS ENUM ('pending', 'active', 'unsubscribed');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS orders (
  id text PRIMARY KEY NOT NULL,
  user_id text NOT NULL,
  total integer NOT NULL,
  currency text NOT NULL DEFAULT 'USD',
  payment_method payment_method NOT NULL,
  payment_id text,
  status order_status NOT NULL DEFAULT 'pending',
  created_at timestamp NOT NULL DEFAULT now(),
  updated_at timestamp NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS order_items (
  id text PRIMARY KEY NOT NULL,
  order_id text NOT NULL,
  product_id text NOT NULL,
  product_name text NOT NULL,
  price integer NOT NULL,
  currency text NOT NULL DEFAULT 'USD',
  quantity integer NOT NULL DEFAULT 1
);

CREATE TABLE IF NOT EXISTS comments (
  id text PRIMARY KEY NOT NULL,
  post_id text NOT NULL,
  user_id text NOT NULL,
  content text NOT NULL,
  parent_id text,
  status comment_status NOT NULL DEFAULT 'approved',
  created_at timestamp NOT NULL DEFAULT now(),
  updated_at timestamp NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS newsletter_subscribers (
  id text PRIMARY KEY NOT NULL,
  email text NOT NULL UNIQUE,
  locale text NOT NULL DEFAULT 'vi',
  status subscriber_status NOT NULL DEFAULT 'pending',
  confirm_token text,
  subscribed_at timestamp,
  unsubscribed_at timestamp,
  created_at timestamp NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS user_profiles (
  id text PRIMARY KEY NOT NULL,
  user_id text NOT NULL UNIQUE,
  display_name text,
  bio text,
  avatar_url text,
  locale_preference text NOT NULL DEFAULT 'vi',
  created_at timestamp NOT NULL DEFAULT now(),
  updated_at timestamp NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS download_tokens (
  id text PRIMARY KEY NOT NULL,
  token text NOT NULL UNIQUE,
  order_id text NOT NULL,
  order_item_id text NOT NULL,
  product_id text NOT NULL,
  user_id text NOT NULL,
  expires_at timestamp NOT NULL,
  revoked boolean NOT NULL DEFAULT false,
  download_count text NOT NULL DEFAULT '0',
  created_at timestamp NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS translations (
  id serial PRIMARY KEY NOT NULL,
  key text NOT NULL UNIQUE,
  vi text NOT NULL,
  en text NOT NULL,
  context text,
  "group" text,
  updated_at timestamp(3) with time zone DEFAULT now() NOT NULL,
  created_at timestamp(3) with time zone DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS translations_created_at_idx ON translations (created_at);
CREATE INDEX IF NOT EXISTS translations_key_idx ON translations (key);
`

const ADMIN_AI_SCHEMA_SQL = `
CREATE TABLE IF NOT EXISTS admin_ai_profiles (
  id serial PRIMARY KEY NOT NULL,
  name varchar NOT NULL,
  provider_type varchar NOT NULL DEFAULT 'openai-compatible',
  base_url varchar NOT NULL,
  api_key_encrypted varchar NOT NULL,
  default_model varchar NOT NULL,
  agent_role varchar,
  communication_style varchar,
  operational_context varchar,
  tool_usage_rules varchar,
  custom_instructions varchar,
  enabled boolean DEFAULT true,
  notes varchar,
  updated_at timestamp(3) with time zone DEFAULT now() NOT NULL,
  created_at timestamp(3) with time zone DEFAULT now() NOT NULL
);

ALTER TABLE admin_ai_profiles
  ADD COLUMN IF NOT EXISTS agent_role varchar,
  ADD COLUMN IF NOT EXISTS communication_style varchar,
  ADD COLUMN IF NOT EXISTS operational_context varchar,
  ADD COLUMN IF NOT EXISTS tool_usage_rules varchar,
  ADD COLUMN IF NOT EXISTS custom_instructions varchar;

CREATE TABLE IF NOT EXISTS admin_ai_profiles_model_options (
  _order integer NOT NULL,
  _parent_id integer NOT NULL,
  id varchar PRIMARY KEY NOT NULL,
  model varchar NOT NULL
);

CREATE TABLE IF NOT EXISTS admin_ai_action_confirmations (
  id serial PRIMARY KEY NOT NULL,
  tool_name varchar NOT NULL,
  status varchar NOT NULL DEFAULT 'pending',
  admin_user_id varchar NOT NULL,
  admin_user_email varchar,
  input jsonb NOT NULL,
  summary varchar NOT NULL,
  expires_at timestamp(3) with time zone NOT NULL,
  executed_at timestamp(3) with time zone,
  cancelled_at timestamp(3) with time zone,
  result jsonb,
  updated_at timestamp(3) with time zone DEFAULT now() NOT NULL,
  created_at timestamp(3) with time zone DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS admin_ai_audit_logs (
  id serial PRIMARY KEY NOT NULL,
  event varchar NOT NULL,
  tool_name varchar,
  admin_user_id varchar,
  admin_user_email varchar,
  input jsonb,
  result jsonb,
  updated_at timestamp(3) with time zone DEFAULT now() NOT NULL,
  created_at timestamp(3) with time zone DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS admin_ai_sessions (
  id serial PRIMARY KEY NOT NULL,
  title varchar NOT NULL,
  admin_user_id varchar NOT NULL,
  admin_user_email varchar,
  profile_id varchar,
  model varchar,
  messages jsonb NOT NULL,
  last_message_at timestamp(3) with time zone NOT NULL,
  updated_at timestamp(3) with time zone DEFAULT now() NOT NULL,
  created_at timestamp(3) with time zone DEFAULT now() NOT NULL
);

ALTER TABLE admin_ai_profiles_model_options
  DROP CONSTRAINT IF EXISTS admin_ai_profiles_model_options_parent_id_fk;

ALTER TABLE admin_ai_profiles_model_options
  ADD CONSTRAINT admin_ai_profiles_model_options_parent_id_fk
  FOREIGN KEY (_parent_id) REFERENCES public.admin_ai_profiles(id)
  ON DELETE cascade ON UPDATE no action;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.tables
    WHERE table_schema = 'public'
      AND table_name = 'payload_locked_documents_rels'
  ) THEN
    ALTER TABLE payload_locked_documents_rels
      ADD COLUMN IF NOT EXISTS admin_ai_profiles_id integer,
      ADD COLUMN IF NOT EXISTS admin_ai_action_confirmations_id integer,
      ADD COLUMN IF NOT EXISTS admin_ai_audit_logs_id integer,
      ADD COLUMN IF NOT EXISTS admin_ai_sessions_id integer;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS admin_ai_profiles_model_options_order_idx
  ON admin_ai_profiles_model_options USING btree (_order);
CREATE INDEX IF NOT EXISTS admin_ai_profiles_model_options_parent_id_idx
  ON admin_ai_profiles_model_options USING btree (_parent_id);
CREATE INDEX IF NOT EXISTS admin_ai_profiles_updated_at_idx
  ON admin_ai_profiles USING btree (updated_at);
CREATE INDEX IF NOT EXISTS admin_ai_profiles_created_at_idx
  ON admin_ai_profiles USING btree (created_at);
CREATE INDEX IF NOT EXISTS admin_ai_confirmations_status_idx
  ON admin_ai_action_confirmations USING btree (status);
CREATE INDEX IF NOT EXISTS admin_ai_confirmations_expires_at_idx
  ON admin_ai_action_confirmations USING btree (expires_at);
CREATE INDEX IF NOT EXISTS admin_ai_audit_logs_created_at_idx
  ON admin_ai_audit_logs USING btree (created_at);
CREATE INDEX IF NOT EXISTS admin_ai_sessions_admin_user_id_idx
  ON admin_ai_sessions USING btree (admin_user_id);
CREATE INDEX IF NOT EXISTS admin_ai_sessions_last_message_at_idx
  ON admin_ai_sessions USING btree (last_message_at);
`

const ADMIN_AI_FILE_UPLOAD_SCHEMA_SQL = `
CREATE TABLE IF NOT EXISTS admin_ai_files (
  id serial PRIMARY KEY NOT NULL,
  checksum varchar NOT NULL,
  original_filename varchar NOT NULL,
  mime_type varchar NOT NULL,
  byte_size numeric NOT NULL,
  status varchar DEFAULT 'ready' NOT NULL,
  deleted_at timestamp(3) with time zone,
  updated_at timestamp(3) with time zone DEFAULT now() NOT NULL,
  created_at timestamp(3) with time zone DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS admin_ai_file_references (
  id serial PRIMARY KEY NOT NULL,
  file_id integer NOT NULL,
  admin_user_id varchar NOT NULL,
  admin_user_email varchar,
  session_id varchar,
  display_name varchar NOT NULL,
  deleted_at timestamp(3) with time zone,
  updated_at timestamp(3) with time zone DEFAULT now() NOT NULL,
  created_at timestamp(3) with time zone DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS admin_ai_file_chunks (
  id serial PRIMARY KEY NOT NULL,
  file_id integer NOT NULL,
  chunk_index numeric NOT NULL,
  content varchar NOT NULL,
  char_start numeric NOT NULL,
  char_end numeric NOT NULL,
  checksum varchar NOT NULL,
  updated_at timestamp(3) with time zone DEFAULT now() NOT NULL,
  created_at timestamp(3) with time zone DEFAULT now() NOT NULL
);

DO $$
BEGIN
  ALTER TABLE admin_ai_file_references
    ADD CONSTRAINT admin_ai_file_references_file_id_admin_ai_files_id_fk
    FOREIGN KEY (file_id) REFERENCES public.admin_ai_files(id)
    ON DELETE cascade ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN
  NULL;
END $$;

DO $$
BEGIN
  ALTER TABLE admin_ai_file_chunks
    ADD CONSTRAINT admin_ai_file_chunks_file_id_admin_ai_files_id_fk
    FOREIGN KEY (file_id) REFERENCES public.admin_ai_files(id)
    ON DELETE cascade ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN
  NULL;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.tables
    WHERE table_schema = 'public'
      AND table_name = 'payload_locked_documents_rels'
  ) THEN
    ALTER TABLE payload_locked_documents_rels
      ADD COLUMN IF NOT EXISTS admin_ai_files_id integer,
      ADD COLUMN IF NOT EXISTS admin_ai_file_references_id integer,
      ADD COLUMN IF NOT EXISTS admin_ai_file_chunks_id integer;
  END IF;
END $$;

DROP INDEX IF EXISTS admin_ai_files_checksum_idx;
CREATE UNIQUE INDEX admin_ai_files_checksum_idx
  ON admin_ai_files USING btree (checksum)
  WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS admin_ai_files_deleted_at_idx
  ON admin_ai_files USING btree (deleted_at);
CREATE INDEX IF NOT EXISTS admin_ai_file_references_admin_user_id_idx
  ON admin_ai_file_references USING btree (admin_user_id);
CREATE INDEX IF NOT EXISTS admin_ai_file_references_session_id_idx
  ON admin_ai_file_references USING btree (session_id);
CREATE INDEX IF NOT EXISTS admin_ai_file_references_deleted_at_idx
  ON admin_ai_file_references USING btree (deleted_at);
CREATE INDEX IF NOT EXISTS admin_ai_file_chunks_file_id_chunk_index_idx
  ON admin_ai_file_chunks USING btree (file_id, chunk_index);
`


const FIXES = [
  {
    name: 'better-auth tables',
    async run(client) {
      const { rows } = await client.query(
        `SELECT table_name
         FROM information_schema.tables
         WHERE table_schema = 'public'
           AND table_name IN (
             'ba_users',
             'ba_sessions',
             'ba_accounts',
             'ba_verifications'
           )`,
      )
      if (rows.length === 4) {
        const { rows: columnRows } = await client.query(
          `SELECT column_name
           FROM information_schema.columns
           WHERE table_schema = 'public'
             AND (
               (table_name = 'ba_users' AND column_name IN ('status', 'banned', 'ban_reason', 'ban_expires'))
               OR (table_name = 'ba_sessions' AND column_name = 'impersonated_by')
             )`,
        )
        if (columnRows.length === 5) {
          return { status: 'up-to-date' }
        }
      }
      await client.query(AUTH_SCHEMA_SQL)
      return { status: 'applied' }
    },
  },
  {
    name: 'custom Drizzle tables',
    async run(client) {
      const { rows } = await client.query(
        `SELECT table_name
         FROM information_schema.tables
         WHERE table_schema = 'public'
           AND table_name IN (
             'orders',
             'order_items',
             'comments',
             'newsletter_subscribers',
             'user_profiles',
             'download_tokens',
             'translations'
           )`,
      )
      if (rows.length === 7) {
        return { status: 'up-to-date' }
      }
      await client.query(CUSTOM_SCHEMA_SQL)
      return { status: 'applied' }
    },
  },
  {
    name: 'admin AI tables',
    async run(client) {
      const { rows } = await client.query(
        `SELECT 'table:' || table_name AS item
         FROM information_schema.tables
         WHERE table_schema = 'public'
           AND table_name IN (
             'admin_ai_profiles',
             'admin_ai_profiles_model_options',
             'admin_ai_action_confirmations',
             'admin_ai_audit_logs',
             'admin_ai_sessions'
           )
         UNION
         SELECT 'profile-column:' || column_name AS item
         FROM information_schema.columns
         WHERE table_schema = 'public'
           AND table_name = 'admin_ai_profiles'
           AND column_name IN (
             'agent_role',
             'communication_style',
             'operational_context',
             'tool_usage_rules',
             'custom_instructions'
           )
         UNION
         SELECT 'column:' || column_name AS item
         FROM information_schema.columns
         WHERE table_schema = 'public'
           AND table_name = 'payload_locked_documents_rels'
           AND column_name IN (
             'admin_ai_profiles_id',
             'admin_ai_action_confirmations_id',
             'admin_ai_audit_logs_id',
             'admin_ai_sessions_id'
           )`,
      )
      if (rows.length === 14) {
        return { status: 'up-to-date' }
      }
      await client.query(ADMIN_AI_SCHEMA_SQL)
      return { status: 'applied' }
    },
  },
  {
    name: 'admin AI file upload tables',
    async run(client) {
      const { rows } = await client.query(
        `SELECT 'table:' || table_name AS item
         FROM information_schema.tables
         WHERE table_schema = 'public'
           AND table_name IN (
             'admin_ai_files',
             'admin_ai_file_references',
             'admin_ai_file_chunks'
           )
         UNION
         SELECT 'column:' || column_name AS item
         FROM information_schema.columns
         WHERE table_schema = 'public'
           AND table_name = 'payload_locked_documents_rels'
           AND column_name IN (
             'admin_ai_files_id',
             'admin_ai_file_references_id',
             'admin_ai_file_chunks_id'
           )
         UNION
         SELECT 'index:admin_ai_files_checksum_idx_active' AS item
         FROM pg_indexes
         WHERE schemaname = 'public'
           AND indexname = 'admin_ai_files_checksum_idx'
           AND indexdef ILIKE '%WHERE (deleted_at IS NULL)%'`,
      )
      if (rows.length === 7) {
        return { status: 'up-to-date' }
      }
      await client.query(ADMIN_AI_FILE_UPLOAD_SCHEMA_SQL)
      return { status: 'applied' }
    },
  },
  {
    name: 'pages_locales.content varchar -> jsonb',
    async run(client) {
      const { rows } = await client.query(
        `SELECT data_type
         FROM information_schema.columns
         WHERE table_name = 'pages_locales' AND column_name = 'content'`,
      )
      if (rows.length === 0) {
        return { status: 'skipped', reason: 'column does not exist yet' }
      }
      const currentType = rows[0].data_type
      if (currentType === 'jsonb') {
        return { status: 'up-to-date' }
      }
      if (currentType !== 'character varying' && currentType !== 'text') {
        return {
          status: 'error',
          reason: `unexpected column type "${currentType}"; refusing to cast automatically`,
        }
      }
      // `USING "content"::jsonb` tells Postgres how to translate the text
      // into jsonb. Payload has always stored the Lexical editor state as
      // a valid JSON string in this column, so the cast is lossless.
      await client.query(
        `ALTER TABLE "pages_locales"
           ALTER COLUMN "content" SET DATA TYPE jsonb USING "content"::jsonb`,
      )
      return { status: 'applied' }
    },
  },
  {
    name: 'payload_locked_documents_rels.translations_id',
    async run(client) {
      const tableCheck = await client.query(
        `SELECT 1
         FROM information_schema.tables
         WHERE table_schema = 'public'
           AND table_name = 'payload_locked_documents_rels'`,
      )
      if (tableCheck.rows.length === 0) {
        return { status: 'skipped', reason: 'table does not exist yet' }
      }

      const { rows } = await client.query(
        `SELECT column_name
         FROM information_schema.columns
         WHERE table_schema = 'public'
           AND table_name = 'payload_locked_documents_rels'
           AND column_name = 'translations_id'`,
      )
      if (rows.length > 0) {
        return { status: 'up-to-date' }
      }

      await client.query(`
        ALTER TABLE "payload_locked_documents_rels"
          ADD COLUMN "translations_id" integer
      `)

      await client.query(`
        ALTER TABLE "payload_locked_documents_rels"
          ADD CONSTRAINT "payload_locked_documents_rels_translations_fk"
          FOREIGN KEY ("translations_id") REFERENCES "public"."translations"("id")
          ON DELETE cascade ON UPDATE no action
      `)

      await client.query(`
        CREATE INDEX "payload_locked_documents_rels_translations_id_idx"
          ON "payload_locked_documents_rels" USING btree ("translations_id")
      `)

      return { status: 'applied' }
    },
  },
  {
    name: 'payload_locked_documents_rels.digital_downloads_id',
    async run(client) {
      const tableCheck = await client.query(
        `SELECT 1
         FROM information_schema.tables
         WHERE table_schema = 'public'
           AND table_name = 'payload_locked_documents_rels'`,
      )
      if (tableCheck.rows.length === 0) {
        return { status: 'skipped', reason: 'table does not exist yet' }
      }

      const { rows } = await client.query(
        `SELECT column_name
         FROM information_schema.columns
         WHERE table_schema = 'public'
           AND table_name = 'payload_locked_documents_rels'
           AND column_name = 'digital_downloads_id'`,
      )
      if (rows.length > 0) {
        return { status: 'up-to-date' }
      }

      await client.query(`
        ALTER TABLE "payload_locked_documents_rels"
          ADD COLUMN "digital_downloads_id" integer
      `)

      const digitalDownloadsTable = await client.query(
        `SELECT 1
         FROM information_schema.tables
         WHERE table_schema = 'public'
           AND table_name = 'digital_downloads'`,
      )

      if (digitalDownloadsTable.rows.length > 0) {
        await client.query(`
          ALTER TABLE "payload_locked_documents_rels"
            ADD CONSTRAINT "payload_locked_documents_rels_digital_downloads_fk"
            FOREIGN KEY ("digital_downloads_id") REFERENCES "public"."digital_downloads"("id")
            ON DELETE cascade ON UPDATE no action
        `)
      }

      await client.query(`
        CREATE INDEX "payload_locked_documents_rels_digital_downloads_id_idx"
          ON "payload_locked_documents_rels" USING btree ("digital_downloads_id")
      `)

      return { status: 'applied' }
    },
  },
  {
    name: 'digital download files relocated to private storage',
    async run(client) {
      const tableCheck = await client.query(
        `SELECT 1
         FROM information_schema.tables
         WHERE table_schema = 'public'
           AND table_name = 'digital_downloads'`,
      )
      if (tableCheck.rows.length === 0) {
        return { status: 'skipped', reason: 'digital_downloads table does not exist yet' }
      }

      const { rows } = await client.query(
        `SELECT id, filename, url
         FROM digital_downloads
         WHERE url LIKE '/media/%'`,
      )

      if (rows.length === 0) {
        return { status: 'up-to-date' }
      }

      await fs.mkdir(PRIVATE_DOWNLOAD_DIR, { recursive: true })

      for (const row of rows) {
        const sourceFilename = path.basename(row.filename || '')
        if (!sourceFilename || sourceFilename !== row.filename) {
          return {
            status: 'error',
            reason: `unsafe legacy filename for digital_downloads.id=${row.id}`,
          }
        }

        const sourcePath = path.resolve(LEGACY_MEDIA_DIR, sourceFilename)
        const targetFilename = `${row.id}-${sourceFilename}`
        const targetPath = path.resolve(PRIVATE_DOWNLOAD_DIR, targetFilename)

        try {
          await fs.access(targetPath)
        } catch {
          try {
            await moveFileAcrossVolumes(sourcePath, targetPath)
          } catch (err) {
            if (err && err.code !== 'ENOENT') {
              throw err
            }
            try {
              await fs.access(targetPath)
            } catch {
              console.error(
                `[bootstrap-db] missing legacy source file for digital_downloads.id=${row.id}; leaving row unchanged`,
              )
              continue
            }
          }
        }

        await client.query(
          `UPDATE digital_downloads
           SET filename = $1,
               url = $2
           WHERE id = $3`,
          [targetFilename, `/digital-downloads/${targetFilename}`, row.id],
        )
      }

      return { status: 'applied' }
    },
  },
  // Add new fixes here. Template:
  // {
  //   name: 'short description',
  //   async run(client) {
  //     // 1. check current state via information_schema / pg_catalog
  //     // 2. return { status: 'up-to-date' } if already fixed
  //     // 3. otherwise apply ALTER ... and return { status: 'applied' }
  //   },
  // },
]

async function main() {
  await loadLocalEnvIfNeeded()

  if (process.env.SKIP_BOOTSTRAP === 'true') {
    console.log('[bootstrap-db] SKIP_BOOTSTRAP=true, skipping all fixes')
    return 0
  }

  const connectionString = process.env.DATABASE_URL
  if (!connectionString) {
    console.error('[bootstrap-db] DATABASE_URL is not set')
    return 2
  }

  const client = new Client({ connectionString })

  try {
    await client.connect()
  } catch (err) {
    console.error('[bootstrap-db] could not connect to Postgres:', err.message)
    return 1
  }

  console.log(`[bootstrap-db] connected (${FIXES.length} fix${FIXES.length === 1 ? '' : 'es'} to check)`)

  let errorCount = 0

  try {
    for (const fix of FIXES) {
      let result
      try {
        result = await fix.run(client)
      } catch (err) {
        console.error(`[bootstrap-db] FAILED: ${fix.name} — ${err.message}`)
        errorCount++
        continue
      }

      switch (result.status) {
        case 'applied':
          console.log(`[bootstrap-db] applied:    ${fix.name}`)
          break
        case 'up-to-date':
          console.log(`[bootstrap-db] up-to-date: ${fix.name}`)
          break
        case 'skipped':
          console.log(`[bootstrap-db] skipped:    ${fix.name} (${result.reason})`)
          break
        case 'error':
          console.error(`[bootstrap-db] ERROR:     ${fix.name} — ${result.reason}`)
          errorCount++
          break
        default:
          console.error(`[bootstrap-db] unknown status "${result.status}" for ${fix.name}`)
          errorCount++
      }
    }
  } finally {
    await client.end()
  }

  if (errorCount > 0) {
    console.error(`[bootstrap-db] ${errorCount} fix(es) failed — aborting startup`)
    return 1
  }

  console.log('[bootstrap-db] all fixes complete')
  return 0
}

if (require.main === module) {
  main()
    .then((code) => process.exit(code))
    .catch((err) => {
      console.error('[bootstrap-db] unexpected failure:', err)
      process.exit(1)
    })
}

module.exports = { main, FIXES }
