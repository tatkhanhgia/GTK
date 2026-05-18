# GTKBlog Test Matrix

This file maps accepted product behavior to proof. It starts with current
GTKBlog domains and should become more granular as story packets are created.

## Status Values

| Status | Meaning |
| --- | --- |
| planned | Accepted as intended behavior, not implemented |
| in_progress | Actively being built |
| implemented | Implemented and proof exists |
| changed | Contract changed after earlier implementation |
| retired | No longer part of the product contract |

## Matrix

| Story | Contract | Unit | Integration | E2E | Platform | Status | Evidence |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Current auth helpers | Better Auth session helpers and route protection | yes | partial | no | no | implemented | `tests/lib/auth/auth-helpers.test.ts`, middleware docs |
| Member account settings | Members can view saved settings, update display name/bio, and change password | partial | no | no | no | implemented | `npx tsc --noEmit`, `npm run test`; service-specific tests still needed |
| Admin site members | Payload admins can manage Better Auth site members separately from CMS users | no | no | no | no | in_progress | Manual QA required for `/admin/site-users`; DB-backed build blocked locally |
| Admin email settings | Payload global stores provider-neutral mail config, encrypted provider secrets, env fallback, and Resend/Zoho/Cloudflare adapter selection | yes | no | no | no | implemented | `tests/globals/email-settings-access.test.ts`, `tests/lib/email/email-settings-service.test.ts`, `tests/lib/email/send-email-provider-selection.test.ts`, `tests/lib/admin/site-user-admin-service.test.ts`, `npx tsc --noEmit` |
| Current payment downloads | Paid orders receive secure short-lived download tokens | yes | partial | no | no | implemented | `tests/lib/payment/download-token.test.ts`, webhook tests |
| Current webhooks | Stripe and SePay webhook handlers validate provider input | yes | partial | no | no | implemented | `tests/api/webhooks/*` |
| Current i18n | Public site uses vi/en routing with DB-backed translations | partial | partial | no | no | implemented | `src/i18n/request.ts`, admin translation tests/docs |
| Future stories | Add a row when a story packet is created | no | no | no | no | planned | none |

## Evidence Rules

- Unit proof covers pure domain and application rules.
- Integration proof covers backend enforcement, data integrity, provider
  behavior, jobs, or service contracts.
- E2E proof covers user-visible browser flows.
- Platform proof covers only shell, deployment, mobile, desktop, or runtime
  behavior that cannot be proven in lower layers.
- A story can be implemented without every proof column if the story packet
  explains why.
