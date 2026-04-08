import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres';

/**
 * Safely cast `pages_locales.content` from `varchar` to `jsonb` for environments
 * whose database was created (via Payload's dev-mode schema push) before
 * migration 20260406_073308 existed. That earlier migration already declares
 * the column as `jsonb` in its `CREATE TABLE`, so any database built from a
 * fresh migration run is already correct — this one is a no-op there.
 *
 * Payload's implicit push attempts `ALTER TABLE … SET DATA TYPE jsonb` without
 * a `USING` clause, which Postgres refuses for `varchar → jsonb` because the
 * cast is not assignment-safe. The `USING content::jsonb` clause below forces
 * the text→jsonb cast explicitly; it is safe because Payload always stores the
 * Lexical editor state as a valid JSON string in this column.
 */
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    DO $$
    BEGIN
      IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'pages_locales'
          AND column_name = 'content'
          AND data_type = 'character varying'
      ) THEN
        ALTER TABLE "pages_locales"
          ALTER COLUMN "content" SET DATA TYPE jsonb USING "content"::jsonb;
      END IF;
    END $$;
  `);
}

/**
 * Intentionally no-op: reverting `jsonb → varchar` would lose the structured
 * JSON representation for no benefit, and Payload can always read `jsonb` as
 * text if needed.
 */
export async function down(_args: MigrateDownArgs): Promise<void> {
  /* no-op */
}
