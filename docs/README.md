# GTKBlog Documentation Map

This directory holds both GTKBlog product/engineering documentation and the
Harness v0 workflow imported from `hoangnb24/harness-experimental`.

GTKBlog already has application code, tests, deployment docs, and architecture.
The harness files are an operating layer for future work: intake, story
packets, decisions, and validation proof.

## Main Files

- `HARNESS.md`: how humans and agents collaborate.
- `FEATURE_INTAKE.md`: how prompts become tiny, normal, or high-risk work.
- `ARCHITECTURE.md`: harness boundary rules adapted to GTKBlog.
- `TEST_MATRIX.md`: living map of behavior to proof.
- `HARNESS_BACKLOG.md`: improvements discovered while working.
- `../scripts/harness`: local CLI for queryable harness state.
- `GLOSSARY.md`: shared terms.
- `codebase-summary.md`: current GTKBlog implementation map.
- `system-architecture.md`: concrete Next.js/Payload/Better Auth architecture.
- `deployment-guide.md`: production deployment and rollback guidance.
- `design-guidelines.md`: UI and brand rules.
- `project-changelog.md`: release and change history.

## Folders

- `product/`: current product truth and domain contract pointers.
- `stories/`: feature packets and backlog.
- `decisions/`: durable decisions and tradeoffs.
- `templates/`: reusable spec-intake, story, decision, and validation formats.

## Current State

GTKBlog is implemented. Harness v0 is used from this point forward to keep
future changes smaller, classified by risk, and tied to validation evidence.
