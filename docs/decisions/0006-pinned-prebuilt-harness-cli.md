# 0006 Pinned Prebuilt Harness CLI

Date: 2026-05-25

## Status

Accepted

## Context

The Harness durable layer now ships a Rust CLI with a shell wrapper at
`scripts/harness`. The installer can download `latest`, but GTKBlog needs
reproducible agent tooling and should not let a moving upstream release mutate
local workflow behavior without review.

## Decision

Use the prebuilt Harness CLI from pinned upstream release
`harness-cli-v0.1.3`, commit
`82c0e30b23823f0a436dcaa0ab824bd2cd75b297`.

The command contract is:

```bash
scripts/harness <command>
```

The downloaded binary lives at `scripts/bin/harness-cli` and is intentionally
ignored by git. The tracked shell wrapper remains the stable entrypoint. If the
binary is missing or cannot execute, the wrapper can fall back to the shell
implementation. The shell fallback requires `sqlite3`; normal GTKBlog usage
should prefer the pinned Rust binary. Local development binaries are not used
automatically; operators must set `HARNESS_RUST_CLI` explicitly when testing a
non-pinned binary.

## Alternatives Considered

1. Use upstream `latest`. Rejected because it is not reproducible.
2. Vendor Rust source and build locally. Rejected for now because GTKBlog does
   not need a Rust toolchain for app development.
3. Fork the CLI. Deferred until Harness becomes mandatory daily infrastructure
   or upstream behavior diverges from GTKBlog needs.
4. Use docs only. Safe, but misses durable query and trace capabilities.

## Consequences

Positive:

- Agents get a stable local command.
- GTKBlog avoids a Rust build dependency.
- Upstream updates can be reviewed before changing the pinned release.

Tradeoffs:

- Checksum verification proves transfer integrity, not independent artifact
  provenance.
- Native Windows is not covered by the upstream binary release; GTKBlog uses
  this command through WSL/Linux.
- `scripts/harness decision verify` runs shell commands stored in local DB.
  It is disabled unless `HARNESS_ALLOW_DECISION_VERIFY=1` is set. Treat that
  feature as trusted-local only.
- Brownfield import must preserve proof semantics. GTKBlog treats `partial`
  proof cells as not complete, so the wrapper normalizes those imported values
  to `no` even when the pinned Rust binary imports them too optimistically.

## Follow-Up

- Re-review upstream before changing the pinned release.
- Consider forking or vendoring only if the CLI becomes critical release
  infrastructure.
