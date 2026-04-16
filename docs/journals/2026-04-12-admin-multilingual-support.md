# Admin Multilingual VI/EN Support Implementation

**Date**: 2026-04-12
**Severity**: Medium
**Component**: Admin UI, i18n, Language Switching
**Status**: Resolved

## What Happened

Implemented bilingual (VI/EN) support across GTKBlog's Payload admin interface. Created language switcher component and translated all hardcoded English strings in custom admin cells and fields to dynamic i18n keys.

## The Brutal Truth

The implementation exposed a critical misconception about Payload v3's i18n API. Spent initial development time trying to call a non-existent `i18n.changeLanguage()` method — it doesn't exist on `I18nClient`. The real API is `switchLanguage(lang)` returned directly from `useTranslation()` context. Once discovered, implementation was straightforward. This should have been checked in Payload docs BEFORE writing code.

## Technical Details

**Phase 1 — Language Switcher + Field Fixes:**
- Created `src/admin/components/ui/language-switcher-client.tsx` with VI/EN toggle button (uses Payload's `switchLanguage` server action)
- Added `langSwitcherLabel/Vi/En` keys to `customHeader` namespace in `custom-translations.ts`
- Fixed `platform-select-field.tsx`: option labels now resolve using `i18n.language` instead of hardcoded EN strings
- Inserted switcher in `custom-header-client.tsx` before theme toggle

**Phase 2 — Translation Audit:**
- Created `customCells` + `customFields` namespaces in `custom-translations.ts`
- Migrated 3 cells (`status-cell`, `type-cell`, `price-vnd-cell`) from hardcoded strings to `useAdminTranslation()`
- Added i18n placeholder + noOptionsMessage to ReactSelect in `platform-select-field`

**Critical API Fix:**
Payload v3's `switchLanguage` is optional and typed as `(lang: AcceptedLanguages) => Promise<void>`. Must check existence before calling to avoid runtime errors on servers with i18n disabled.

## What We Tried

1. Used `i18n.changeLanguage()` — failed, method doesn't exist on `I18nClient`
2. Read Payload type definitions — found `switchLanguage` at context root level, not nested under `i18n`
3. Implemented with proper null check guard — now works reliably

## Root Cause Analysis

Assumptions made without API verification. Should have: (a) read Payload's `useTranslation()` hook return type before implementing, (b) checked documentation for exact method names, (c) tested type signature early in dev cycle.

## Lessons Learned

1. **Type-driven development pays dividends** — Payload's TypeScript exports revealed the real API immediately once we looked at the actual return type
2. **Don't assume method names** — `changeLanguage` is common in i18n libraries but Payload uses `switchLanguage` at the context root
3. **Initial language flash prevention** — Read `payload-lng` cookie synchronously on mount to avoid EN flash for VI users
4. **Memory optimization** — Wrapped label maps in `useMemo([t])` to prevent 20-100 object allocations per list-view render cycle

## Next Steps

- Phase 3 (slug localization for collections) remains pending as separate PR
- Cookie-based language persistence already working via Payload's built-in mechanism
- Code review fixes applied and merged
- All TypeScript errors resolved (pre-existing yazi warnings unrelated to this work)

**Commit**: `feat(admin-i18n): add VI/EN language switcher and translate all custom admin strings`
