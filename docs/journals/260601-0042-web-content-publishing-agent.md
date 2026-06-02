# Web Content Publishing Agent

**Date**: 2026-06-01 00:42
**Severity**: Medium
**Component**: Admin AI publishing + web research
**Status**: Resolved

## What Happened

Built the web-only publishing path for Admin AI: post/page draft, publish, and schedule tools. Added a source ledger trust boundary so only server-signed source receipts are accepted as authoritative. Hardened web research against SSRF. Scheduled content stays hidden from public access and query filters until `publishedAt` is due.

## The Brutal Truth

This was security work disguised as content tooling. The whole thing falls apart if client input is trusted, if web research can hit internal hosts, or if scheduled drafts leak early. That is the kind of bug that feels small in code and ugly in production.

## Technical Details

- Admin AI tools are web-only and limited to post/page draft, publish, schedule.
- Source ledger entries now trust server-signed source receipts, not raw client claims.
- Web research fetches are SSRF-hardened; private/internal targets are blocked.
- Public access/query filters exclude scheduled content until `publishedAt` is reached.

## Validation

- `npm test` - 47 files / 168 tests
- `tsc` passed
- `lint` passed
- skipped-DB build passed

## Unresolved Questions

- None.
