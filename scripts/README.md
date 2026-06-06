# Scripts

This directory already contains GTKBlog operational scripts such as database
bootstrap, Payload sync, screenshots, and build helpers. Harness automation may
live here only when it supports the existing project workflow and does not
replace application scripts.

## Installer

The upstream installer applies the Harness v0 operating files and folder
structure to a target project directory. It defaults to the current directory,
accepts a target path, and asks interactive users whether to `1. Merge`,
`2. Override`, or `3. Stop` when the target already contains `AGENTS.md`,
`docs/`, or `scripts/`.
Non-interactive installs stop on those protected paths unless `--merge` or
`--override` is provided.

For GTKBlog, do not install from moving `latest` behavior. Review and pin the
upstream release first. The current accepted pin is
`harness-cli-v0.1.3` / `82c0e30b23823f0a436dcaa0ab824bd2cd75b297`.

```bash
git clone --branch harness-cli-v0.1.3 --depth 1 \
  https://github.com/hoangnb24/harness-experimental /tmp/harness-experimental

test "$(git -C /tmp/harness-experimental rev-parse HEAD)" = \
  "82c0e30b23823f0a436dcaa0ab824bd2cd75b297"

HARNESS_CLI_BASE_URL="https://github.com/hoangnb24/harness-experimental/releases/download/harness-cli-v0.1.3" \
  /tmp/harness-experimental/scripts/install-harness.sh --merge --yes
```

The installer must stay limited to harness files. In GTKBlog, use merge mode
and do not use it to scaffold application source folders, package scripts, CI,
tests, platform shells, or fake validation commands. The installer script is
not part of the installed project payload.

Never use `--override` in this repository. GTKBlog already has project-specific
agent rules, docs, and scripts.

## Harness CLI

The tracked command is:

```bash
scripts/harness <command>
```

Use it to initialize and query local harness state:

```bash
scripts/harness init
scripts/harness import brownfield
scripts/harness query matrix
scripts/harness query decisions
```

The local database and downloaded binary stay out of git:

```text
harness.db
harness.db-wal
harness.db-shm
scripts/bin/harness-cli
```

Treat `scripts/harness decision verify` and `scripts/harness query sql` as
trusted-local tools. `decision verify` is disabled unless
`HARNESS_ALLOW_DECISION_VERIFY=1` is set. Do not run verification commands
imported from untrusted databases or external markdown.

Normal GTKBlog use goes through the pinned Rust binary at
`scripts/bin/harness-cli`. If the binary is missing, the shell fallback requires
`sqlite3`.

GTKBlog treats `partial` cells in `docs/TEST_MATRIX.md` as incomplete proof.
After `scripts/harness import brownfield`, those cells must appear as `no` in
`scripts/harness query matrix`.

## Future Command Contract

Expected future checks:

```text
validate:quick
  format, lint, typecheck, unit tests, architecture check

test:integration
  backend contract and integration checks

test:e2e
  user-visible end-to-end flows

test:platform
  platform shell smoke checks, if the project has a native shell

test:release
  full suite, log checks, and performance smoke
```
