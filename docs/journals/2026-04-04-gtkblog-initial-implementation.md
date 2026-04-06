# GTKBlog: Full Greenfield Implementation in Parallel

**Date**: 2026-04-04 09:30
**Severity**: Low (positive closure)
**Component**: Full-stack: Next.js 15, Payload CMS, Better Auth, Drizzle, Stripe
**Status**: Resolved

## What Happened

Completed full GTKBlog implementation in ~1 hour using 10-phase parallel execution with 5 subagent groups. 119 files created, 18,442 insertions, all 37 Vitest tests passing. Deployed to git main.

## The Brutal Truth

This worked because we hammered the orchestration protocol hard: clear phase boundaries, zero overlapping file ownership, aggressive parallelization where it mattered. The 10 phases executed in 5 sequential groups with groups 1-3 running parallel. No merge conflicts, no rework. The pain usually lives in integration — we killed it by encoding constraints upfront.

The real win: discovering three architectural gotchas in real time and documenting them prevents months of debugging later.

## Technical Details

**Tailwind v4 surprise**: `create-next-app` installed v4, not v3. Design tokens moved from `tailwind.config.ts` to `@theme` directives in `globals.css`. Agents had to adapt on first CSS write — would've cost 2 hours discovering this in week 3.

**Drizzle dual-version conflict**: Payload CMS bundles its own drizzle-orm. Having both versions created import hell. Solution: use raw SQL via `sql` from `@payloadcms/db-postgres` throughout codebase. Payload's internal schema handling stays untouched.

**shadcn/ui asChild limitation**: This installation uses `@base-ui/react` (not headless-ui). No `asChild` prop on components. Workaround: use `buttonVariants()` helper to apply button styling to arbitrary elements.

## What We Tried

- Initial approach: naive parallel execution without phase definitions → caught early, restructured into 10 explicit phases
- Drizzle conflict: attempted co-importing both versions → failed, pivoted to raw SQL
- shadcn/ui Button.asChild → doesn't exist, switched to utility pattern

## Root Cause Analysis

Greenfield projects succeed because there's no legacy code pulling in opposite directions. But we got lucky: pre-planning the phases eliminated guesswork. The three surprises (Tailwind v4, Drizzle bundling, shadcn/ui variant) are environmental, not design issues. They would've exploded across distributed teams — caught them because orchestration forced us to document assumptions.

## Lessons Learned

1. **Phase clarity pays**: Explicit boundaries (P1 setup → P2-3 parallel DB+UI → P4-5 auth → etc.) enabled honest parallelization. Every phase independent. This is reproducible.

2. **Framework versions matter**: Don't assume defaults. Tailwind v4 breaking tokens into CSS variables was invisible until first stylesheet write. Document framework versions in phase 1.

3. **Library bundling creates silent conflicts**: Payload bundling Drizzle isn't an error, it's a constraint. Architectural clarity upfront (SQL-only access to Payload's DB) prevented import hell.

4. **Middleware composition order is load-bearing**: next-intl middleware must wrap auth checks. Getting this backwards breaks locale-aware redirects. Document this in orchestration, not as afterthought.

## Next Steps

1. **Wire newsletter hook**: newsletter POST unread data but doesn't hit Payload `afterChange` hook yet. 30 min task, low priority.

2. **Comment GET endpoint**: Optimistic UI working, no backend read. Add `/api/comments?postId=X` to surface stored comments.

3. **Password change UI**: Better Auth handles backend; client needs shadcn form to drive the mutation.

4. **Test coverage on edge cases**: 37 tests passing on happy path. Need tests for token expiry, revocation, locale switching under auth state change.

5. **Document framework constraints**: Create `./docs/framework-decisions.md` listing Tailwind v4 tokens, Drizzle dual-version approach, shadcn/ui utilities pattern.

---

**Files**: C:\Users\Admin\Documents\Project\NetBeansProjects\MyProject\GTKBlog — 119 files, main branch
**Tests**: 37/37 passing (Vitest)
**Commits**: 1 (initial implementation)
