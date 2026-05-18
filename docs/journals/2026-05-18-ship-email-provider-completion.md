# 2026-05-18 - Email Provider Completion Ship

## Shipped
- Added Zoho ZeptoMail and Cloudflare Email Service delivery beside Resend.
- Added encrypted provider secrets, env fallback, migration, and provider selection tests.
- Fixed Payload admin checkbox sizing for email sending and welcome email toggles.
- Updated release docs, deployment env notes, architecture docs, and test matrix.

## Review Notes
- Cloudflare endpoint corrected to `/email/sending/send`.
- Provider request body assertions added for Zoho and Cloudflare.
- New provider/migration files included before ship.

## Validation
- `npm test`: 22 files, 91 tests passed.
- `npx tsc --noEmit`: passed.
- `npm run lint`: passed.

## Unresolved Questions
- Need real provider smoke test with production/staging credentials after merge.
