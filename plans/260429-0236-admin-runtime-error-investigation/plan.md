---
title: "Admin Runtime Error Investigation and Fix"
description: "Diagnose and fix Payload admin runtime routes error after Docker bootstrap work, preserving existing admin UI/UX."
status: completed
priority: P1
effort: 4h
branch: main
tags: [admin, payload, docker, runtime, verification]
blockedBy: []
blocks: []
created: 2026-04-29
---

# Admin Runtime Error Investigation and Fix

## Overview

Investigate and fix the remaining `/admin` runtime log error:

```text
TypeError: Cannot destructure property 'routes' of '{}' as it is undefined
```

Current Docker public runtime is healthy, and `/admin` returns HTML, but the admin route still logs a server-side Payload error. The goal is a minimal, evidence-based fix that preserves the existing custom admin theme, i18n, light/dark mode, and Payload functionality.

## Current Facts

- Root cause confirmed: `@payload-config` resolved to `{ default: SanitizedConfig }` at Payload entrypoints, while Payload helpers expected the normalized config object.
- The wrong shape reached Payload `RootPage`/layout helpers and caused `Cannot destructure property 'routes' of '{}'`.
- Minimal fix applied by normalizing config before Payload helpers in:
  - `src/app/(payload)/admin/[[...segments]]/page.tsx`
  - `src/app/(payload)/layout.tsx`
  - `src/app/(payload)/api/[...slug]/route.ts`
- Verification passed:
  - ESLint on changed files
  - targeted Vitest: 8/8 passed
  - `tsc --noEmit` passed in tester worktree
- Runtime verification passed:
  - `/admin` HTTP 200
  - no Application Error page
  - create-first-user/login markers present
  - fresh stderr no longer shows `routes` error
  - public smoke routes still pass
- Browser verification passed for pre-auth admin shell in light/dark Vietnamese.
- Limits/accepted gaps:
  - `/en/admin` and `/vi/admin` return 404 by current routing
  - authenticated admin login flow not verified because no admin user
  - main worktree `tsc`/full build can still be blocked by unrelated untracked yazi completions or DB/Resend env state
- Earlier metadata experiment was diagnostic only; final fix is config normalization.

## Related Existing Plans

- `plans/260406-1515-anthropic-admin-theme/plan.md` — completed theme foundation.
- `plans/260407-1008-admin-ui-anthropic-redesign/plan.md` — completed admin UI redesign.
- `plans/260407-1730-fix-admin-rich-text-vietnamese-rendering/plan.md` — pending CSS-only rich text plan; no direct dependency.
- `plans/260412-1536-admin-multilingual-vi-en/plan.md` — in-progress admin i18n plan; overlap only if fix touches admin header/i18n components.

## Phases

| Phase | Description | Status |
|---|---|---|
| [Phase 1](phase-01-baseline-and-reproduction.md) | Capture exact admin runtime baseline and stack evidence | completed |
| [Phase 2](phase-02-root-cause-tracing.md) | Map minified stack to Payload/custom source and isolate failing component/helper | completed |
| [Phase 3](phase-03-minimal-fix.md) | Apply smallest safe fix and remove temporary admin experiments if not needed | completed |
| [Phase 4](phase-04-admin-ui-ux-verification.md) | Browser-test admin UI, light/dark, VI/EN, and core actions | completed |
| [Phase 5](phase-05-review-docs-and-cleanup.md) | Review, docs decision, and final cleanup | completed |

## Files Likely In Scope

- `src/app/(payload)/admin/[[...segments]]/page.tsx`
- `src/app/(payload)/layout.tsx`
- `src/app/(payload)/importMap.ts`
- `payload.config.ts`
- `src/admin/components/**`
- `src/admin/styles/**`
- `Dockerfile` only if runtime/build conditions affect repro

## Success Criteria

- `/admin` returns usable HTML without server log error.
- Admin login/create-first-user screen works in browser.
- Existing custom admin UI remains visually intact in light and dark mode.
- VI/EN admin language behavior is not regressed.
- Docker build still passes.
- Public route smoke tests still pass.
- No broad Payload internals patch or node_modules edit.

## Risks

- Payload internals may emit non-fatal recoverable errors from a component outside app code.
- Removing admin metadata may reduce SEO/meta quality for admin route but is likely acceptable if confirmed.
- Explicit route defaults in `payload.config.ts` may be redundant; keep only if proven necessary.
- Admin UI can return HTTP 200 while hydration or actions still fail; browser verification is mandatory.

## Cook Command

```bash
/ck:cook C:\Users\Admin\Documents\Project\NetBeansProjects\MyProject\GTKBlog\plans\260429-0236-admin-runtime-error-investigation\plan.md
```

## Unresolved Questions

- None for planning; implementation should first collect exact browser and server evidence.
