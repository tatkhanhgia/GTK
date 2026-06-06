# 0005 SQLite Harness Durable Layer

Date: 2026-05-25

## Status

Accepted

## Context

GTKBlog already uses Harness v0 docs for intake, story packets, decisions, and
validation proof. That paper trail is useful, but manual markdown updates become
fragile as more agents work in the repository.

The reviewed upstream source is `hoangnb24/harness-experimental` at
`harness-cli-v0.1.3` / `82c0e30b23823f0a436dcaa0ab824bd2cd75b297`.

## Decision

Adopt the Harness durable layer selectively:

- Add `scripts/harness` as the stable repo-local command.
- Add `scripts/schema/001-init.sql` for the local SQLite schema.
- Ignore `harness.db`, WAL/SHM files, and `scripts/bin/harness-cli`.
- Keep GTKBlog-specific docs as the human-readable source of project context.

The local database stores operational records only:

- intake classifications
- story proof status
- decision records
- harness backlog items
- task traces and friction reports

This does not change GTKBlog runtime architecture, Payload data, PostgreSQL
schema, package scripts, CI, or deployment behavior.

## Alternatives Considered

1. Keep docs only. Safe, but keeps all operational state in manually edited
   markdown.
2. Full upstream override. Rejected because it would replace GTKBlog-specific
   docs and agent rules.
3. Add an app database table. Rejected because harness state is local agent
   workflow data, not product data.

## Consequences

Positive:

- Agents can query current harness state without parsing every markdown file.
- Future tasks can record friction and validation evidence consistently.
- The database is local-only and can be regenerated from docs when needed.

Tradeoffs:

- Markdown and SQLite can drift if agents update only one side.
- Brownfield import is a useful seed, not a perfect migration; future stories
  should use stable IDs such as `US-###`.
- The database is trusted local state. Do not import or execute decision
  verification commands from untrusted sources.

## Follow-Up

- Use `scripts/harness init` and `scripts/harness import brownfield` after
  install or when the local DB is missing.
- Prefer stable story IDs for new matrix rows.
- Keep important product and architecture decisions in markdown ADRs.
