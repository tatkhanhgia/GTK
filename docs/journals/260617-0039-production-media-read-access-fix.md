# Production Thumbnails Missing: Media Collection Read Access

**Date**: 2026-06-17 00:39
**Severity**: High
**Component**: Media collection, Public homepage, Next.js image optimizer
**Status**: Resolved

## What Happened

Production homepage https://gtk.ai.vn/en stopped showing post thumbnails. The page rendered text but all image slots were blank. Root cause: the Media collection in Payload CMS had no explicit `read` access configuration, so it defaulted to blocking anonymous requests. Every `/api/media/file/:filename` request returned 403, which caused Next.js image optimizer to return 400, breaking all public images.

## The Brutal Truth

This is the kind of bug that makes you want to scream into a pillow. We shipped a change that tightened access controls but forgot that public images need to be, well, public. The homepage looked broken to every visitor for an unknown period. The real kick in the teeth is that this was a one-line fix (`access.read: () => true`) that took seconds to write but who-knows-how-long to discover in production. We need to stop treating access control as an afterthought.

## Technical Details

- **Error**: `403 Forbidden` on `/api/media/file/:filename` for anonymous users.
- **Downstream effect**: Next.js `<Image>` optimizer returned `400 Bad Request` because it could not fetch the source image.
- **File**: `src/collections/media.ts` — lacked `access.read` property.
- **Fix commit**: `4abdc9c` — added `access.read: () => true`, kept `create/update/delete` restricted to `isPayloadAdminUser`.
- **Tests added**: `tests/collections/media.test.ts` — 54 lines covering anonymous read success and admin-only write restrictions.
- **Changelog**: `docs/project-changelog.md` updated.

## What We Tried

Not applicable — this was a straightforward root-cause fix once the 403 pattern was identified in production logs.

## Root Cause Analysis

We added or modified access control on the Media collection without considering that public-facing images must allow anonymous reads. The default Payload behavior when `access.read` is omitted is not "allow all"; it falls back to whatever the global auth strategy is, which in our case blocked unauthenticated users. Any change to collection access must explicitly state intent for read, create, update, and delete.

## Lessons Learned

1. **Explicit access beats implicit defaults**. Always declare `access.read`, `access.create`, `access.update`, `access.delete` on every collection. Never rely on Payload defaults for public-facing data.
2. **Test anonymous paths in CI**. Our test suite now covers unauthenticated media reads. We should extend this to any collection that serves public assets.
3. **Visual regression for production homepages**. A simple smoke test that checks for image load failures on `/en` and `/vi` would have caught this before deploy.
4. **Changelog discipline**. The fix was documented immediately, which helps future debugging when similar symptoms appear.

## Next Steps

- [x] Fix merged to `main` (commit `4abdc9c`).
- [x] Regression tests added and passing.
- [x] Changelog updated.
- [ ] **Rebuild and redeploy production** to apply the fix. Owner: devops. ETA: next production deploy window.
- [ ] Add anonymous-read smoke test for homepage images to CI pipeline. Owner: QA. ETA: within 1 week.

**Status:** DONE
**Summary:** Journal entry written for commit 4abdc9c; production rebuild/redeploy is the remaining follow-up.
**Concerns/Blockers:** None.
