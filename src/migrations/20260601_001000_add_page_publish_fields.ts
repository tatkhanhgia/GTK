import { MigrateDownArgs, MigrateUpArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "pages"
      ADD COLUMN IF NOT EXISTS "status" varchar DEFAULT 'draft' NOT NULL,
      ADD COLUMN IF NOT EXISTS "published_at" timestamp(3) with time zone;

    CREATE INDEX IF NOT EXISTS "pages_status_idx"
      ON "pages" USING btree ("status");
    CREATE INDEX IF NOT EXISTS "pages_published_at_idx"
      ON "pages" USING btree ("published_at");

    UPDATE "pages"
      SET "status" = 'published',
          "published_at" = COALESCE("published_at", "created_at", now())
      WHERE "slug" IN ('about', 'privacy');
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    DROP INDEX IF EXISTS "pages_published_at_idx";
    DROP INDEX IF EXISTS "pages_status_idx";

    ALTER TABLE "pages"
      DROP COLUMN IF EXISTS "published_at",
      DROP COLUMN IF EXISTS "status";
  `)
}
