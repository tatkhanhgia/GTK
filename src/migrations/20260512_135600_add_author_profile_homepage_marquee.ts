import { MigrateDownArgs, MigrateUpArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "author_profile"
      ADD COLUMN IF NOT EXISTS "homepage_marquee_enabled" boolean DEFAULT true,
      ADD COLUMN IF NOT EXISTS "homepage_marquee_duration_seconds" numeric DEFAULT 48;

    ALTER TABLE "author_profile_locales"
      ADD COLUMN IF NOT EXISTS "homepage_marquee_eyebrow" varchar;

    CREATE TABLE IF NOT EXISTS "author_profile_homepage_marquee_items" (
      "_order" integer NOT NULL,
      "_parent_id" integer NOT NULL,
      "id" varchar PRIMARY KEY NOT NULL
    );

    CREATE TABLE IF NOT EXISTS "author_profile_homepage_marquee_items_locales" (
      "label" varchar NOT NULL,
      "id" serial PRIMARY KEY NOT NULL,
      "_locale" "_locales" NOT NULL,
      "_parent_id" varchar NOT NULL
    );

    DO $$
    BEGIN
      ALTER TABLE "author_profile_homepage_marquee_items"
        ADD CONSTRAINT "author_profile_homepage_marquee_items_parent_id_fk"
        FOREIGN KEY ("_parent_id") REFERENCES "public"."author_profile"("id")
        ON DELETE cascade ON UPDATE no action;
    EXCEPTION WHEN duplicate_object THEN
      NULL;
    END $$;

    DO $$
    BEGIN
      ALTER TABLE "author_profile_homepage_marquee_items_locales"
        ADD CONSTRAINT "author_profile_homepage_marquee_items_locales_parent_id_fk"
        FOREIGN KEY ("_parent_id") REFERENCES "public"."author_profile_homepage_marquee_items"("id")
        ON DELETE cascade ON UPDATE no action;
    EXCEPTION WHEN duplicate_object THEN
      NULL;
    END $$;

    CREATE INDEX IF NOT EXISTS "author_profile_homepage_marquee_items_order_idx"
      ON "author_profile_homepage_marquee_items" USING btree ("_order");

    CREATE INDEX IF NOT EXISTS "author_profile_homepage_marquee_items_parent_id_idx"
      ON "author_profile_homepage_marquee_items" USING btree ("_parent_id");

    CREATE UNIQUE INDEX IF NOT EXISTS "author_profile_homepage_marquee_items_locales_locale_parent"
      ON "author_profile_homepage_marquee_items_locales" USING btree ("_locale","_parent_id");
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    DROP TABLE IF EXISTS "author_profile_homepage_marquee_items_locales" CASCADE;
    DROP TABLE IF EXISTS "author_profile_homepage_marquee_items" CASCADE;

    ALTER TABLE "author_profile_locales"
      DROP COLUMN IF EXISTS "homepage_marquee_eyebrow";

    ALTER TABLE "author_profile"
      DROP COLUMN IF EXISTS "homepage_marquee_enabled",
      DROP COLUMN IF EXISTS "homepage_marquee_duration_seconds";
  `)
}
