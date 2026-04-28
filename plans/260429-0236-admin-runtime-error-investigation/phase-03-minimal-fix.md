# Phase 3: Minimal Fix

## Context Links

- Root cause from Phase 2.

## Overview

Priority: P1  
Status: completed  
Applied the smallest safe fix: normalize `@payload-config` before Payload admin/layout/API helpers so they receive `SanitizedConfig`, removing the server error without changing admin UI/UX behavior.

## Requirements

- Preserve Payload admin functionality.
- Preserve custom admin theme, dark mode, and i18n unless root cause proves one part is broken.
- Remove experimental changes that are not part of the confirmed fix.
- Do not patch `node_modules`.

## Candidate Fix Patterns

Choose only after Phase 2 evidence:

1. **Admin wrapper fix**
   - Adjust `src/app/(payload)/admin/[[...segments]]/page.tsx` to match Payload/Next expected contract.
   - Keep or remove `generatePageMetadata` based on evidence.

2. **Config shape fix**
   - Keep explicit route defaults in `payload.config.ts` only if Payload config defaults are unavailable in standalone runtime.
   - Avoid duplicating defaults if not needed.

3. **Custom component fix**
   - If a custom component receives incomplete props, guard only that boundary.
   - Do not add broad fallback props through unrelated components.

4. **Layout/importMap fix**
   - If `RootLayout` receives wrong children/provider shape, align with Payload template.

## Related Code Files

Potentially modified:
- `src/app/(payload)/admin/[[...segments]]/page.tsx`
- `src/app/(payload)/layout.tsx`
- `src/app/(payload)/api/[...slug]/route.ts`

## Success Criteria

- Docker build passes.
- `/admin` request produces no `routes` destructure log.
- No public route regression.
- Diff is minimal and explainable.

## Risk Assessment

- High: changing Payload wrapper can break admin navigation/hydration.
- Medium: removing metadata export may be acceptable, but should be intentional.
- Medium: config default duplication can hide framework issue; keep only with evidence.

## Security Considerations

- No auth bypass.
- Do not weaken admin route access checks.

## Todo List

- [x] Apply confirmed minimal fix.
- [x] Remove unneeded experimental changes.
- [ ] Run Docker build.
- [x] Run `/admin` log verification.

## Unresolved Questions

- Depends on Phase 2 root cause.
