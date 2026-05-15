---
type: journal
created: 2026-05-13
topic: digital-download-files
---

# Digital Download Files Planning

## Context

User asked what Payload `media` data does, then approved planning for proper product download file support.

## What Happened

- Scouted `media`, `products`, order fulfillment, download token, profile downloads, deployment docs.
- Found mismatch: `products.downloadFile` points to image-only `media`.
- Compared three options: expand `media`, add dedicated collection, or use private object storage now.
- User approved dedicated collection approach.
- User confirmed expected file types: PDF, ZIP, image.

## Decisions

- Keep `media` image-only.
- Plan `digital-downloads` collection for paid product files.
- Keep existing payment/token flow.
- Defer R2/S3 unless direct URL risk must be eliminated immediately.

## Next

- Implement from `plans/260513-1513-digital-download-files/plan.md`.
- Confirm direct-file privacy requirement and current production data before migration.

## Unresolved Questions

- Must first release block direct URLs completely?
- Existing production `download_file_id` data present?
