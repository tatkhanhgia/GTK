# Decisions

Decision records explain why important product, architecture, or harness choices
were made.

Use `docs/templates/decision.md` when adding a new decision.

Add a decision when:

- A locked technical choice changes.
- A product rule changes meaningfully.
- A validation requirement is added, removed, or weakened.
- A high-risk feature chooses one design over another.
- The source-of-truth hierarchy changes.

GTKBlog also mirrors decision metadata into the local Harness database when
`scripts/harness import brownfield` runs. The markdown ADR remains the
reviewable source of the decision.
