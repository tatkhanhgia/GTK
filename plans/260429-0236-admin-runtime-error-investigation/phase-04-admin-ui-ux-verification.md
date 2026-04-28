# Phase 4: Admin UI/UX Verification

## Context Links

- Fix from Phase 3.
- Existing admin UI plans:
  - `plans/260406-1515-anthropic-admin-theme/plan.md`
  - `plans/260407-1008-admin-ui-anthropic-redesign/plan.md`
  - `plans/260412-1536-admin-multilingual-vi-en/plan.md`

## Overview

Priority: P1  
Status: completed  
Verified pre-auth admin UI works, not just HTTP 200: `/admin` renders without Application Error, no fresh `routes` stderr, public smoke routes pass, and browser checks confirmed light/dark Vietnamese create-first-user shell.

## Requirements

- Test in browser if possible.
- Verify design edge cases from memory/preferences:
  - light mode
  - dark mode
  - VI language
  - EN language
  - cross-feature regression
- Check browser console and network errors.

## Verification Matrix

| Area | Check |
|---|---|
| Initial admin route | `/admin` renders login or create-first-user without server error |
| Theme | light/dark toggle or persisted theme works |
| Language | VI/EN admin labels still render |
| Layout | header/sidebar/dashboard not broken |
| Forms | login/create-first-user form visible and usable |
| Collections | after auth if available, collection list route renders |
| Console | no hydration/runtime errors from custom admin components |
| Logs | no `routes` destructure error after admin requests |

## Implementation Steps

1. Start/reuse Docker app.
2. Open `/admin` in browser or use available UI tooling.
3. Capture screenshot if UI changed.
4. Check console errors.
5. Toggle/inspect light and dark mode if accessible pre-auth.
6. Check VI/EN behavior where possible.
7. Re-run public route smoke tests.

## Success Criteria

- Admin visual shell is intact.
- No new console/hydration errors.
- No admin server `routes` error.
- Public site still passes smoke tests.

## Risk Assessment

- Medium: create-first-user/admin auth state depends on current DB. If auth data unavailable, verify pre-auth route and document limitation.

## Security Considerations

- Do not create real production admin credentials during verification unless user approves.
- Do not expose credentials in logs/screenshots.

## Todo List

- [x] Verify `/admin` in browser.
- [x] Check console/network.
- [x] Verify light/dark.
- [x] Verify VI/EN where possible.
- [x] Re-run smoke routes.

## Unresolved Questions

- Authenticated admin login/collection verification still depends on an available approved admin user.
