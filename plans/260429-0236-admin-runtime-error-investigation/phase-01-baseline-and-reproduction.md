# Phase 1: Baseline and Reproduction

## Context Links

- Plan: `plan.md`
- Current Docker runtime from previous work shows `/admin` 200 plus server log error.

## Overview

Priority: P1  
Status: completed  
Captured a clean reproducible baseline: `/admin` returned usable HTML with create-first-user/login markers while fresh server logs still emitted one Payload `routes` destructure error per request.

## Requirements

- Do not implement fixes in this phase.
- Reproduce error from a clean app container restart.
- Separate old logs from fresh request logs.
- Preserve current working tree; record relevant diffs before changes.

## Implementation Steps

1. Capture git diff for current admin-related files:
   - `payload.config.ts`
   - `src/app/(payload)/admin/[[...segments]]/page.tsx`
   - `src/app/(payload)/layout.tsx`
2. Restart only app container without deleting DB volume.
3. Wait for `Ready` and bootstrap completion.
4. Request `/admin` once.
5. Capture logs since restart.
6. Capture response traits:
   - HTTP status
   - whether HTML contains `Application error`
   - whether HTML contains create-first-user/login UI
7. If possible, collect source map or inspect container `.next/server/app/(payload)/admin/[[...segments]]/page.js` around the failing offset.

## Success Criteria

- Exact current failure is reproducible from fresh logs.
- Error count per request is known.
- Metadata path vs render path status is known.
- No code changed in this phase.

## Risk Assessment

- Low risk: read-only verification.
- Avoid `docker compose down -v`; DB reset not needed.

## Security Considerations

- Do not print secrets from environment.
- Do not read `.env.local` unless explicitly approved.

## Todo List

- [x] Capture current diffs.
- [x] Restart app container.
- [x] Request `/admin` once.
- [x] Save exact logs and response traits.

## Unresolved Questions

- None.
