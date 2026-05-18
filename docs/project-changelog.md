# Project Changelog

All significant changes to the GTK Blog project are documented here.

## [0.1.10] - 2026-05-18

### Added
- Completed email provider delivery with Zoho ZeptoMail and Cloudflare Email Service adapters, encrypted provider secrets, env fallback, migration, and tests.
- Added SMTP email provider support for Zoho Mail/Admin mailbox delivery, including encrypted SMTP password storage, env fallback, migration, and tests.

### Fixed
- Scoped Payload admin checkbox styling so email sending and welcome email toggles keep stable sizing.
- Fixed SMTP env fallback precedence so Payload field defaults do not block `SMTP_HOST`, `SMTP_PORT`, and `SMTP_SECURE`.

## [0.1.9] - 2026-05-18

### Added
- Shipped the homepage experience refresh with new start-here and featured-content sections, session-scoped entry loader, refreshed shared cards, localized copy, and supporting seed/script updates.

### Fixed
- Validated homepage entry-loader storage fallback and preserved clean lint/test/build verification for the refreshed public UI.

## [0.1.8] - 2026-05-16

### Added
- Expanded development seed data to make local UI review more representative: 14 published posts, 8 digital products, 10 categories, bilingual copy, and richer topic/product variety.
- Added a session-scoped homepage entry loader with warm technical notebook art direction, short brand motion, reduced-motion fallback, and automatic handoff to the existing homepage.

### Fixed
- Guarded the homepage entry loader's session storage access so blocked browser storage no longer crashes the public homepage.
- Excluded local `.agents` / `.impeccable` tooling from project lint and git tracking, restored `npm run lint -- --max-warnings=0`, and persisted the homepage entry loader after first display per browser session.
- Shipped dependency lockfile sync and high-severity audit remediation for the Next.js security update path so clean `npm ci` installs and Docker builds can run from fresh checkout.

## [0.1.7] - 2026-05-15

### Added
- **Provider-neutral email delivery settings:** Added a provider selector to the Payload `email-settings` global, introduced an internal email provider adapter boundary, kept Resend as the only selectable implemented provider, and added an additive migration for `email_settings.provider`.
  - Existing Resend env fallback remains supported through `RESEND_API_KEY` and `RESEND_FROM_EMAIL`
  - Unsupported provider values fail closed before sending instead of silently falling back
  - Added resolver, provider-selection, secret masking, and migration coverage
- **Member registration, account settings, and admin mail controls:** Added a Payload-managed `email-settings` global with encrypted Resend key storage, env fallback, configurable welcome email copy, and signup welcome email sending through Better Auth user-create hooks.
  - Profile settings now preload saved user data, sync display name back to `ba_users.name`, keep email read-only, and wire password change through Better Auth client flow
  - Added `/admin/site-users` for Payload admins to list, filter, edit, deactivate/reactivate, and generate reset links for Better Auth site members without mixing them with CMS admin users
  - Added Better Auth admin-state columns (`status`, `banned`, `ban_reason`, `ban_expires`, `impersonated_by`) and migration `20260514_003500_member_email_settings_site_users`
- **Dedicated digital download file storage:** Added a separate Payload `digital-downloads` upload collection for paid deliverables with private disk storage and token-gated serving.
  - Product downloads now resolve through `/api/download/[token]`, which validates the existing opaque token and streams the file as an attachment
  - New downloads are read from private `/app/digital-downloads`, while legacy product assets can still fall back to `public/media`
  - Migration `20260513_160500_add_digital_downloads` creates the new table, backfills product-linked media rows, and repoints product/version foreign keys for backward-compatible rollout
  - Docker Compose now persists private paid files in a dedicated `digital_downloads_data` volume alongside `media_data`
- **About Mission Section Polish:** Balanced the `/about` mission section with supporting intro copy, subtle topic labels, stronger heading scale, and a more editorial quote card treatment across desktop and mobile.
- **Admin Editable Homepage Marquee:** Moved homepage topic marquee content into the Payload `author-profile` global so admins can edit localized eyebrow text, ordered topic labels, enable/disable state, and animation speed.
  - Added `homepageMarquee` fields and a production migration for the new global columns/tables
  - Homepage now reads marquee data from `authorProfile`, filters empty labels, clamps speed to 12-180 seconds, and falls back to static vi/en defaults when admin content is missing
  - Removed blog statistics labels from the marquee; live counts remain in the Achievements section
- **Homepage Intelligence Background:** Added a professional AI/tech ambient effect behind the homepage hero using lightweight CSS/SVG-style layers, signal lines, pointer-reactive spotlight, warm brand glows, and reduced-motion fallback.
- **Editorial Scroll Reveal Polish:** Added Anthropic-style reveal presets for sections, headings, and cards, then applied them to homepage content so below-fold elements enter with clearer hierarchy and subtler card settling.
- **Anthropic-inspired footer refresh:** Reworked public footer into a warm dark block with stronger contrast, clearer link hierarchy, accessible focus states, and larger social touch targets.
- **Warm Editorial Motion System:** Centralized public-site motion presets and replay behavior for section reveals, counters, and reduced-motion users
  - Added `src/lib/motion/motion-presets.ts` for shared Motion durations, easing, viewport defaults, reveal variants, stagger variants, and counter transitions
  - `ScrollReveal` now defaults to one reveal per mount, replays naturally on route/remount, and exposes explicit `replayOnScroll` / `viewportMargin` controls
  - `AnimatedCounter` now uses shared counter transitions and remains once-per-mount with static values for reduced-motion users
  - `/me`, blog, and products pages now use section-level `ScrollReveal` wrappers instead of visual lazy fades or uncoordinated page motion
  - Consolidated duplicate reduced-motion CSS and removed the mobile global transition-duration override that conflicted with component-level motion timing
- **Harness v0 workflow integration:** Imported `hoangnb24/harness-experimental` docs/templates in merge mode without overwriting GTKBlog source files
  - Added feature intake, story packet, decision, validation report, and high-risk story templates under `docs/`
  - Added `docs/TEST_MATRIX.md` as behavior-to-proof tracker seeded with current GTKBlog domains
  - Adapted harness architecture notes to reference existing Next.js/Payload/Better Auth architecture instead of generic greenfield guidance
- **Anthropic-Inspired Motion Refresh:** Added shared public/admin motion tokens, smoother scroll/card/surface motion, and a meaningful homepage topic marquee with hover/focus pause plus reduced-motion static fallback.
- **Safer Production CI/CD Phase 1:** Manual-only production workflow with validate → backup → explicit DB deploy → source deploy → `/api/health` verification → curl smoke tests
  - Added `npm run db:deploy` to run Payload schema sync and app DB bootstrap explicitly before app rebuild
  - Added `scripts/backup-production-db.sh` for timestamped Compose PostgreSQL dumps under git-ignored `backups/`
  - Production workflow now verifies `${PRODUCTION_URL}/api/health` with `jq`, requiring `ok: true`, `database: "ok"`, and `version == github.sha`
  - Production workflow now deploys a known commit SHA and injects `GIT_COMMIT_SHA` into Docker runtime
  - Deployment guide now documents manual trigger, failure stop points, rollback commands, and DB rollback caveat
- **Unified DB-Driven Translations:** Replaced static JSON message files with a live `Translations` collection in Payload CMS
  - New collection: `translations` (`src/collections/translations.ts`) with fields `key`, `vi`, `en`, `group`, and `context`
  - New grouping collection: `translationGroups` (`src/collections/translation-groups.ts`) for organizing translation keys
  - Public site i18n (`src/i18n/request.ts`) now loads messages at request time via direct DB query through `getPayload` (no HTTP loopback)
  - Admin custom components fetch runtime translations via `useDbTranslations` hook (`src/admin/i18n/use-db-translations.ts`)
  - Admin core/framework strings are generated at build time via `npm run prebuild` into `src/admin/i18n/generated-translations.ts`
  - Seed script `scripts/seed-translations.ts` migrates legacy `messages/*.json` and `src/admin/i18n/custom-translations.ts` keys into the DB
  - 228 translation keys seeded successfully; `messages/*.json` remain as static fallbacks only
  - `payload.config.ts` updated to register both new collections and inject DB translations into Payload's i18n registry
- **Admin Multilingual (VI/EN):** Full bilingual support across Payload admin UI
  - New `LanguageSwitcherClient` component in `src/admin/components/ui/language-switcher-client.tsx` with VI/EN toggle in custom header
  - Expanded `custom-translations.ts` with new namespaces: `customCells` (statusDraft, statusPublished, typeEbook/Template/Code, priceAriaLabel) and `customFields` (platformNoOptions, platformPlaceholder)
  - `platform-select-field.tsx`: locale-aware label resolution + translated placeholder/noOptionsMessage
  - Custom cells (`status-cell.tsx`, `type-cell.tsx`, `price-vnd-cell.tsx`) migrated to `useAdminTranslation()` instead of hardcoded English
  - All collections updated with bilingual StaticLabels where missing
- **Portfolio-style Achievements Section (Homepage + About):** Stats block inspired by lehuythai.com — but with real, live numbers instead of hardcoded career stats
  - New `AchievementsSection` component (`src/components/sections/achievements-section.tsx`) with staggered scroll reveal, per-item count-up animation, hover lift + gradient glow; `AchievementItem` / `AchievementIcon` types exported from the same file
  - `ScrollReveal` wrapper (`src/components/ui/scroll-reveal.tsx`) — fade + slide-up on intersection, honors `prefers-reduced-motion`
  - `AnimatedCounter` (`src/components/ui/animated-counter.tsx`) — ease-out-expo count-up on view
  - `getBlogStats` data helper (`src/lib/author/get-blog-stats.ts`) — computes 4 live metrics in parallel via `Promise.allSettled`: published posts (Payload), blog topics (categories), digital products, and active newsletter subscribers (raw SQL via `payload.db.drizzle`). Degrades to `0` on query failure; `+` suffix only appended when count > 0.
  - Career stats (`yearsOfExperience`, `projectsCompleted`) intentionally kept on `/me` via the pre-existing `QuickStats` component; homepage/about stay content-focused
  - Homepage: new section between Hero and Featured Posts; existing `LazySection` wrappers migrated to SSR-friendly `ScrollReveal`
  - About page: new Achievements block (`variant="contained"`) after Hero; every major section wrapped with `ScrollReveal`
  - i18n keys added under `home.achievements.{eyebrow,title,subtitle}` for vi + en
  - New dependency: `motion@^12.38.0` (framer-motion v12) — tree-shakeable animation library
- **Page Loading UX System:** Implemented 2-layer loading experience for site routes
  - **Layer 1:** Global top progress bar (`nextjs-toploader` v3.9.17) on all site navigations
  - **Layer 2:** Route-specific skeleton screens (9 layouts: blog list/detail, products list/detail, profile pages, orders, downloads, me page, home page)
  - Skeletons exported from `src/components/ui/skeleton-page-layouts.tsx`
  - `loading.tsx` files at 9 route locations provide visual fallback during data fetching
- Build script optimization: `NODE_OPTIONS=--max-old-space-size=4096` for larger heap allocation

### Fixed
- **Next.js security advisory remediation:** Upgraded Next.js to `16.2.6` with compatible Payload CMS `3.84.1`, updated related auth/i18n packages, and added npm overrides for patched transitive dependencies (`postcss`, `uuid`, `fast-uri`, `hono`, `@hono/node-server`, `express-rate-limit`, `ip-address`).
  - Restricted `next/image` remote hosts from wildcard `https://**` to known hosts used by the app
  - Added regression coverage for patched Next version and image optimizer host restrictions
  - Updated ESLint flat config for native `eslint-config-next@16` exports and disabled the new React hooks set-state-in-effect rule to preserve current hydration patterns
- **Homepage hydration mismatch and reveal lifecycle:** Rendered static markup for SSR/first hydration, then mounted Motion reveal elements after client mount so `/vi` and `/en` stay hydration-clean while scroll reveal animations still run. Newsletter email input now uses deterministic `newsletter-email` id/name/autocomplete.
- **Admin translation fallback regression:** Restored committed generated admin translations and updated generation to seed from static custom admin labels before applying DB overrides, preserving localized admin UI copy when `SKIP_ADMIN_TRANSLATION_GENERATION=true`.
- **Login build and Payload runtime import blockers:** Wrapped `/login` search-param handling in Suspense and changed the runtime-loaded `email-settings` global to use a relative crypto import.
- **Docker startup and auth callback regressions:** Runtime image now copies the email-settings global's crypto dependency for `tsx` Payload sync startup, and the login page now honors sanitized `callbackUrl` values for email and social sign-in.
- **Admin member reset and email settings rollout blockers:** Fixed admin-generated Better Auth reset tokens to use Better Auth's expected verification lookup shape, added the missing migration-backed `email_settings` table, and corrected invalid `/admin/site-users` table form markup.
- **Private download endpoint bypass:** `digital-downloads` now rejects Payload's direct `/api/digital-downloads/file/:filename` serving path, so paid binaries can only be streamed through the token-validated `/api/download/[token]` route.
- **Payload media upload permissions in Docker:** Runtime image now creates `/app/public/media`, assigns it to the non-root `nextjs` user, and Compose persists uploads in a `media_data` volume so saving Media no longer fails with `EACCES: permission denied, mkdir 'public/media'`.
- **Production deploy disk exhaustion:** Scoped VPS Docker cleanup to old `ghcr.io/*/gtkblog` images before/after pull, pruned build cache, and added default 14-day database backup retention.
- **Locale-aware logo home navigation:** Header logo now links to the active locale home path (`/vi` or `/en`) instead of `/`, preventing English sessions from falling back to Vietnamese.
- **PR CI typecheck for DB guard tests:** Imported Vitest test APIs explicitly in `database-url.test.ts` so `npx tsc --noEmit` can typecheck the test file without relying on global test runner types.
- **Manual Payload harness and destructive test DB reset guards:** Fixed `tests/manual/test-config.mts` so the direct `npx tsx` command resolves project source modules, and tightened `recreate-test-db.js` so destructive resets require a `_test` database name or exact confirmation env.
- **DB check script safety:** Removed hardcoded PostgreSQL credentials and fixed destructive database targets from `scripts/db-checks`
  - DB check scripts now read connection details from `DATABASE_URL` or `TEST_DATABASE_URL`
  - Test DB create/recreate scripts require `TEST_DATABASE_NAME`, require it to match `TEST_DATABASE_URL`, and refuse protected database names
  - `create-test-db.js` now creates only; destructive reset behavior stays in `recreate-test-db.js`
- **ESLint v9 flat-config breakage:** `eslint.config.mjs` previously imported `eslint-config-next/core-web-vitals` as if it were a flat-config array, but `eslint-config-next@15.4.x` still ships legacy `.eslintrc`-style configs → ESLint failed to start, CI lint step was dead.
  - Rewired via `@eslint/eslintrc` `FlatCompat` bridge (the pattern Next.js itself recommends until a native flat-config export lands)
  - Added explicit override for `**/*.cjs` disabling `@typescript-eslint/no-require-imports` (CommonJS files legitimately use `require()`)
  - Cleaned up 7 pre-existing errors and 9 warnings exposed once the config started working: unused imports (`Locale`, `Section`, `MigrateDownArgs`), unused destructured params in Payload migrations, unused map index, `<a href="/login">` swapped for `<Link>` in `comment-section.tsx`, and `test-seed.ts` dead binding

## [1.0.0] - Initial Release

### Features
- Full-stack Next.js 15 blog + e-commerce platform
- Embedded Payload CMS 3 for content management
- Better Auth 1.5.6 for customer authentication
- Dual payment processors (Stripe + SePay)
- Bilingual i18n (Vietnamese/English) with next-intl v4
- PostgreSQL + Drizzle ORM
- Email system (Resend + React Email templates)
- Responsive design with shadcn/ui + Tailwind CSS v4
