# GTKBlog Product Docs

GTKBlog already has product and engineering truth in the root `README.md` and
the top-level `docs/*.md` files. This folder is reserved for smaller product
contract files created by future harness stories.

Use this folder when a feature needs a durable domain contract, for example:

- `blog.md`
- `products-and-checkout.md`
- `auth-and-profile.md`
- `admin-content-management.md`
- `newsletter-and-email.md`

## Update Rule

When behavior changes:

1. Update the affected product doc.
2. Update or create the story packet.
3. Update `docs/TEST_MATRIX.md`.
4. Record a decision if the change affects architecture, scope, risk, or a
   previously settled product rule.
