# Seed Data Script Implementation Complete

**Date**: 2026-04-05
**Severity**: Low
**Component**: Database seeding, development tooling
**Status**: Resolved

## What Happened

Implemented idempotent seed data script with bilingual (VN/EN) fixture data: 6 categories, 6 posts, 3 products, 2 pages. All TypeScript compilation passes.

## The Brutal Truth

This should have been straightforward — it was. Modularization (seed-data.ts + seed.ts) kept both files under 200 LOC and separated concerns cleanly. Used Payload's Local API to avoid HTTP overhead, which made the code simpler than a REST-based approach would have been.

## Technical Details

- Created `src/scripts/seed-data.ts` (143 LOC) — data definitions with Lexical richtext for posts
- Created `src/scripts/seed.ts` (87 LOC) — runner with idempotency via `draft: true` in find queries
- Updated `package.json`: added `tsx` devDependency, `"seed"` script
- Code review (7.5/10) → All fixes applied:
  - `NODE_ENV` guard: allowlist instead of blacklist
  - Added `draft: true` to versioned collection queries (prevents duplicates on re-runs)
  - Removed redundant `_status` field (Payload handles automatically)
  - Proper process.exit cleanup via `.then()`

## What We Tried

Considered REST seeding initially — rejected. Local API is faster, simpler, and doesn't require a running server during seed operations.

## Root Cause Analysis

None. The implementation worked as intended. Vietnamese text stored without diacritics for ASCII safety in development environments.

## Lessons Learned

- Modularization at 200 LOC boundary worked well — easier to maintain and test separately
- Idempotency (`draft: true` on find queries) prevents duplicate seed data on script re-runs — essential for safe local development
- Separating data shape from seeding logic improves readability

## Next Steps

Seed script ready for dev environment setup. No blockers.

---

**Commit**: `8b5f7f8` — feat: implement idempotent seed data script with bilingual fixtures
