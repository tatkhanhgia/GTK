# Journal — 2026-04-13

## Unified DB-Driven Translations Plan

After a brainstorm session with the user, we identified that **content** (posts/products) already shares the same Payload DB locale-aware data, but **UI strings** are split between admin (`custom-translations.ts`) and user site (`messages/*.json`).

### Decision
Adopt a **hybrid DB-driven** approach:
- Create a `Translations` collection in Payload CMS.
- User site fetches async via `next-intl` (real-time, no rebuild).
- Admin custom components fetch at runtime via a custom hook.
- Admin core/framework strings rely on a build-time script because Payload CMS does not support async translations for internal UI.

### Key Constraints Discovered
1. Payload `i18n.translations` accepts only static objects at build time.
2. Custom providers cannot wrap Payload's internal `TranslationProvider`.
3. Therefore, build-time generation is unavoidable for core admin strings.

### Plan Created
`plans/260413-1557-unified-db-translations-admin-user/`
- 6 phases, 6 hydrated tasks with dependency chain.
- Tasks 2→3→4/5→6 (sequential + parallel mid-phase).

### Next Action
Begin implementation via `/ck:cook plans/260413-1557-unified-db-translations-admin-user`.
