# Harness Architecture Rules For GTKBlog

GTKBlog already uses Next.js 15, Payload CMS 3, Better Auth, PostgreSQL,
Drizzle, Stripe, SePay, Resend, and next-intl. The concrete architecture lives
in `docs/system-architecture.md`; this file adds harness rules for future
changes.

## Discovery Before Shape

Before proposing implementation shape, identify:

- Product surfaces: public site, Payload admin, API routes, webhooks, email,
  database, scripts, CI/CD, or deployment.
- Runtime stack impact: Next.js server/client boundary, Payload collection,
  Drizzle custom table, middleware, provider SDK, or Docker/PM2 runtime.
- Core domains: the product concepts that deserve stable names and contracts.
- Boundary inputs: user input, API requests, webhooks, jobs, files, credentials,
  provider payloads, and environment configuration.
- Validation ladder: the smallest checks that prove the changed GTKBlog surface.

Record stack choices in `docs/decisions/` when they meaningfully constrain
future work.

## Layering

```text
domain
  <- application
      <- infrastructure
          <- interface
              <- app surfaces
```

## GTKBlog Structure Mapping

| Harness layer | GTKBlog locations |
| --- | --- |
| domain/application | `src/lib/*`, `src/db/schema/*`, typed helpers |
| infrastructure | `src/db/*`, provider clients under `src/lib/*`, scripts |
| interface | `src/app/api/*`, middleware, Payload collection config |
| app surfaces | `src/app/[locale]/*`, `src/components/*`, Payload admin overrides |

Do not create a parallel architecture folder. Use existing GTKBlog directories
unless a story proves a new boundary is needed.

## Dependency Rule

Inner layers must not depend on outer layers.

| Layer | May depend on | Must not depend on |
| --- | --- | --- |
| domain | nothing project-external except tiny pure utilities | framework, database, UI, provider, process/env |
| application | domain | framework, UI, provider, database concrete clients |
| infrastructure | domain, application | interface controllers or UI |
| interface | all backend layers | UI state or platform shell assumptions |
| app surfaces | API contracts and app-facing clients | domain internals directly |

## Parse-First Boundary Rule

Unknown data must be parsed at boundaries before it enters inner code.

Boundaries include:

- HTTP request bodies, params, and query strings.
- Session payloads and identity claims.
- Environment variables.
- Database rows returned from external clients.
- Download tokens and payment status identifiers.
- Stripe and SePay webhooks, events, and async payloads.

Target flow:

```text
unknown input
  -> parser
  -> typed DTO or command
  -> application use case
  -> domain object/value object
```

Inner layers should work with meaningful product types such as `UserId`,
`OrderId`, `DownloadToken`, `Locale`, `PaymentProvider`, and domain-specific
IDs rather than repeatedly validating raw strings.

## Command/Query Boundary

If the product area has both reads and writes, keep command/query separation
clear at the code level even when the storage layer is simple:

- Commands mutate state and own audit side effects.
- Queries read state and format for consumers.
- Shared domain rules live in domain/application, not controllers.

## Observability Contract

Server and script changes should preserve useful operational evidence. When a
story touches observability, prefer canonical structured log fields:

- timestamp
- level
- request_id
- user_id when known
- action
- duration_ms
- status_code
- message

Audit logs are product records. Application logs are operational records. Do not
use one as a substitute for the other.
