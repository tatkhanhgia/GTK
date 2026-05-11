# Editorial Scroll Reveal Polish

## Summary

Shipped homepage and profile motion refinements for the public site. Added shared reveal presets for sections, headings, and cards, then applied them to featured content, newsletter, quick stats, and achievements surfaces.

## Key Decisions

- Kept motion logic centralized in `src/lib/motion/motion-presets.ts`.
- Extended `ScrollReveal` with a preset API while preserving direct override props.
- Used subtle card scale settling only for item/card reveals.
- Preserved reduced-motion behavior by rendering static content without motion wrappers.

## Validation

- `npm test`: 43 tests passed across 8 files.
- `npm run lint`: passed with existing warnings in scripts.
- `npx tsc --noEmit`: passed.
- `npm run build`: blocked by local Postgres connection refusal during `prebuild`.

## Unresolved Questions

- None.
