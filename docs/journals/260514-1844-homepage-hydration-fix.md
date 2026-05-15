# Homepage Hydration Fix

## Context

`/vi` showed React hydration mismatch warnings in homepage motion wrappers and the newsletter email input. Console evidence showed server HTML with hidden Motion styles while the client hydrated visible state, plus a Base UI generated input id mismatch.

## Changes

- Deferred `ScrollReveal` Motion `initial` and `whileInView` props until after client mount.
- Switched `ScrollReveal` and `AchievementsSection` to render static SSR/first-hydration markup, then mount Motion elements after client mount so reveal animations still get a fresh hidden initial state.
- Set newsletter email input `id="newsletter-email"`, `name="email"`, and `autoComplete="email"`.
- Restored generated admin translation fallbacks and changed admin translation generation to seed from `customTranslations` before DB overrides.
- Added regression tests for SSR style stability, deterministic newsletter id, and post-mount reveal enablement.
- Updated `docs/project-changelog.md`.

## Verification

- `npm test -- tests/components/ui/hydration-stability.test.tsx tests/components/ui/scroll-reveal-animation-enable.test.tsx` passed.
- `npm test -- tests/admin/admin-translation-fallbacks.test.ts tests/components/ui/hydration-stability.test.tsx tests/components/ui/scroll-reveal-animation-enable.test.tsx` passed.
- `npx tsc --noEmit` passed.
- `npm test` passed: 16 files, 65 tests.
- Browser console checks for `http://localhost:3000/vi` and `/en` returned zero `error`/`pageerror` messages.
- Browser interaction found `#newsletter-email` and accepted `test@example.com`.
- `SKIP_ADMIN_TRANSLATION_GENERATION=true npm run build` passed. It still logs local Postgres auth errors during static generation, but exits 0 and bundles existing fallbacks.

## Blocked

- `npm run build` without `SKIP_ADMIN_TRANSLATION_GENERATION=true` still stops in prebuild because local Postgres rejects configured user `thinknote`.

## Unresolved Questions

- None.
