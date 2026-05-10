# 0004 Adopt Harness v0 For GTKBlog Workflow

## Status

Accepted

## Context

GTKBlog already has a working Next.js/Payload codebase and local project rules.
Future changes still need a clearer intake, story, decision, and validation
surface so agents can keep work small and evidence-based.

`hoangnb24/harness-experimental` provides that workflow as documentation and
templates rather than runtime code.

## Decision

Adopt Harness v0 in merge mode:

- Keep existing GTKBlog source, `.claude` rules, root `README.md`, and app
  architecture as source of truth.
- Add harness docs/templates under `docs/`.
- Adapt generic harness architecture and test matrix docs to current GTKBlog
  domains.
- Use `docs/FEATURE_INTAKE.md`, `docs/stories/`, `docs/TEST_MATRIX.md`, and
  `docs/decisions/` for future feature planning and validation evidence.

## Consequences

- No runtime dependency added.
- No app code path changed.
- Future work gets a stronger paper trail before implementation.
- Harness docs must stay synchronized with project-specific rules.
