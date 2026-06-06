import { MigrateDownArgs, MigrateUpArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "posts_locales"
      ADD COLUMN IF NOT EXISTS "slug" varchar;

    UPDATE "posts_locales" "pl"
      SET "slug" = "p"."slug"
      FROM "posts" "p"
      WHERE "pl"."_parent_id" = "p"."id"
        AND "pl"."slug" IS NULL
        AND "p"."slug" IS NOT NULL;

    INSERT INTO "posts_locales" ("_locale", "_parent_id", "slug")
    SELECT 'vi'::_locales, "p"."id", "p"."slug"
      FROM "posts" "p"
      WHERE "p"."slug" IS NOT NULL
        AND NOT EXISTS (
          SELECT 1
          FROM "posts_locales" "pl"
          WHERE "pl"."_parent_id" = "p"."id"
            AND "pl"."_locale" = 'vi'::_locales
        );

    CREATE UNIQUE INDEX IF NOT EXISTS "posts_locales_locale_slug_unique"
      ON "posts_locales" USING btree ("_locale", "slug")
      WHERE "slug" IS NOT NULL;

    CREATE INDEX IF NOT EXISTS "posts_locales_slug_idx"
      ON "posts_locales" USING btree ("slug");

    ALTER TABLE "_posts_v_locales"
      ADD COLUMN IF NOT EXISTS "version_slug" varchar;

    UPDATE "_posts_v_locales" "pvl"
      SET "version_slug" = "pv"."version_slug"
      FROM "_posts_v" "pv"
      WHERE "pvl"."_parent_id" = "pv"."id"
        AND "pvl"."version_slug" IS NULL
        AND "pv"."version_slug" IS NOT NULL;

    CREATE INDEX IF NOT EXISTS "_posts_v_locales_version_slug_idx"
      ON "_posts_v_locales" USING btree ("version_slug");

    DROP INDEX IF EXISTS "posts_slug_idx";
    ALTER TABLE "posts"
      DROP COLUMN IF EXISTS "slug";

    DROP INDEX IF EXISTS "_posts_v_version_version_slug_idx";
    ALTER TABLE "_posts_v"
      DROP COLUMN IF EXISTS "version_slug";
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "posts"
      ADD COLUMN IF NOT EXISTS "slug" varchar;

    UPDATE "posts" "p"
      SET "slug" = COALESCE(
        (
          SELECT "pl"."slug"
          FROM "posts_locales" "pl"
          WHERE "pl"."_parent_id" = "p"."id"
            AND "pl"."_locale" = 'vi'::_locales
          LIMIT 1
        ),
        (
          SELECT "pl"."slug"
          FROM "posts_locales" "pl"
          WHERE "pl"."_parent_id" = "p"."id"
            AND "pl"."slug" IS NOT NULL
          ORDER BY "pl"."_locale"
          LIMIT 1
        )
      )
      WHERE "p"."slug" IS NULL
        AND COALESCE(
          (
            SELECT "pl"."slug"
            FROM "posts_locales" "pl"
            WHERE "pl"."_parent_id" = "p"."id"
              AND "pl"."_locale" = 'vi'::_locales
            LIMIT 1
          ),
          (
            SELECT "pl"."slug"
            FROM "posts_locales" "pl"
            WHERE "pl"."_parent_id" = "p"."id"
              AND "pl"."slug" IS NOT NULL
            ORDER BY "pl"."_locale"
            LIMIT 1
          )
        ) IS NOT NULL;

    CREATE UNIQUE INDEX IF NOT EXISTS "posts_slug_idx"
      ON "posts" USING btree ("slug");

    ALTER TABLE "_posts_v"
      ADD COLUMN IF NOT EXISTS "version_slug" varchar;

    UPDATE "_posts_v" "pv"
      SET "version_slug" = COALESCE(
        (
          SELECT "pvl"."version_slug"
          FROM "_posts_v_locales" "pvl"
          WHERE "pvl"."_parent_id" = "pv"."id"
            AND "pvl"."_locale" = 'vi'::_locales
          LIMIT 1
        ),
        (
          SELECT "pvl"."version_slug"
          FROM "_posts_v_locales" "pvl"
          WHERE "pvl"."_parent_id" = "pv"."id"
            AND "pvl"."version_slug" IS NOT NULL
          ORDER BY "pvl"."_locale"
          LIMIT 1
        )
      )
      WHERE "pv"."version_slug" IS NULL
        AND COALESCE(
          (
            SELECT "pvl"."version_slug"
            FROM "_posts_v_locales" "pvl"
            WHERE "pvl"."_parent_id" = "pv"."id"
              AND "pvl"."_locale" = 'vi'::_locales
            LIMIT 1
          ),
          (
            SELECT "pvl"."version_slug"
            FROM "_posts_v_locales" "pvl"
            WHERE "pvl"."_parent_id" = "pv"."id"
              AND "pvl"."version_slug" IS NOT NULL
            ORDER BY "pvl"."_locale"
            LIMIT 1
          )
        ) IS NOT NULL;

    CREATE INDEX IF NOT EXISTS "_posts_v_version_version_slug_idx"
      ON "_posts_v" USING btree ("version_slug");

    DROP INDEX IF EXISTS "_posts_v_locales_version_slug_idx";

    DROP INDEX IF EXISTS "posts_locales_slug_idx";
    DROP INDEX IF EXISTS "posts_locales_locale_slug_unique";

    ALTER TABLE "_posts_v_locales"
      DROP COLUMN IF EXISTS "version_slug";

    ALTER TABLE "posts_locales"
      DROP COLUMN IF EXISTS "slug";
  `)
}
