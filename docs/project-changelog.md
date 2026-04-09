# Project Changelog

All significant changes to the GTK Blog project are documented here.

## [Unreleased]

### Added
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
