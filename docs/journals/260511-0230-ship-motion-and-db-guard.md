---
date: 2026-05-11
topic: ship-motion-and-db-guard
---

# Ship Motion And DB Guard

## Context

Shipping `fix/rich-text-editor-format-state` to `main` after merging latest `origin/main`.

## What Happened

- Merged current `main` into the feature branch.
- Validated public/admin motion refresh and warm footer changes.
- Included DB check guard changes so destructive test DB recreation requires `_test` suffix or exact confirmation env.
- Fixed manual Payload config imports for direct `tsx` execution.
- Added unit coverage for recreate database name guard.
- Bumped package version from `0.1.1` to `0.1.2`.

## Reflection

The important risk was database safety, not visual polish. The extra guard keeps local and CI reset scripts from silently targeting production-like names.

## Decisions

- Use patch bump because this is a release hardening and UI polish ship, no breaking API.
- Keep docs update scoped to changelog and journal.

## Next

- Review PR visuals manually before merge.
- Keep lint warnings as non-blocking; lint has 0 errors.

## Unresolved Questions

None.
