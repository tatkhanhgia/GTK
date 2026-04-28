# Phase 2: Root Cause Tracing

## Context Links

- Phase 1 baseline: `phase-01-baseline-and-reproduction.md`

## Overview

Priority: P1  
Status: completed  
Confirmed root cause: at Payload entrypoints `@payload-config` resolved as `{ default: SanitizedConfig }`; without normalization Payload helpers received the wrong shape and `RootPage`/layout flow threw `Cannot destructure property 'routes' of '{}'`.

## Key Insights

Known disproven hypothesis: simply awaiting `params/searchParams` before `RootPage` is wrong for Next 15/Payload types. Payload helpers expect promise-shaped props.

Confirmed evidence: config shape, not route params, was the failure source. Normalizing `@payload-config` before `RootPage`, `RootLayout`, and REST route helpers removed the error.

## Requirements

- No guessing fixes.
- Identify whether error comes from:
  - `generatePageMetadata`
  - `RootPage`
  - `RootLayout`
  - custom provider/header/dashboard/sidebar
  - Payload UI component receiving bad props
- Map failing minified function to source by reading package dist files and container bundle.

## Implementation Steps

1. Read relevant Payload source/dist files:
   - `node_modules/@payloadcms/next/dist/views/Root/index.js`
   - `node_modules/@payloadcms/next/dist/layouts/Root/index.js`
   - `node_modules/@payloadcms/ui/dist/**` files that destructure `routes`.
2. Search for destructuring patterns that match the runtime error.
3. Temporarily run controlled experiments only after baseline:
   - metadata export on/off
   - default admin components vs custom components if needed
   - provider on/off if needed
4. For each experiment, rebuild only when required and compare fresh logs.
5. Determine exact minimal source file to change.

## Related Code Files

Likely read-only:
- `payload.config.ts`
- `src/app/(payload)/admin/[[...segments]]/page.tsx`
- `src/app/(payload)/layout.tsx`
- `src/app/(payload)/importMap.ts`
- `src/admin/components/layout/custom-header*.tsx`
- `src/admin/components/providers/admin-theme-provider*.tsx`
- `src/admin/components/views/custom-dashboard*.tsx`

## Success Criteria

- One confirmed root cause with evidence.
- Failed hypotheses documented briefly.
- Minimal fix target identified.

## Risk Assessment

- Medium: repeated Docker rebuilds are slow. Prefer read-only source tracing first.
- Medium: disabling custom admin components can mask UI regressions. Use only as diagnostic experiment.

## Security Considerations

- Do not expose env values.

## Todo List

- [x] Search package dist for `routes` destructures.
- [x] Map stack/bundle offset to module.
- [x] Run minimal experiments if tracing is inconclusive.
- [x] State confirmed root cause.

## Unresolved Questions

- None.
