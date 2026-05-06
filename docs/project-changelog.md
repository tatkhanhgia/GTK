# Project Changelog

All significant changes to the GTK Blog project are documented here.

## [Unreleased]

### Added
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
