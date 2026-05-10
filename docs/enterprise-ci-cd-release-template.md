# Enterprise CI/CD Release Template

Tài liệu này là format học và triển khai CI/CD theo hướng doanh nghiệp cho GTKBlog. Mục tiêu là có một quy trình cố định để mọi thay đổi đều đi qua validate, build, migration, deploy, verify, và rollback rõ ràng.

## Mental model

```txt
Code change
  -> CI validate
  -> Build immutable artifact
  -> Plan/Run DB migration
  -> Deploy
  -> Health check
  -> Smoke test
  -> Monitor
  -> Rollback ready
```

GitHub Actions không nên tự đoán khi nào cần migrate DB. Migration nên là một bước release rõ ràng, có version/audit/rollback plan.

## Practical VPS flow

```txt
validate
  -> npm ci
  -> typecheck
  -> lint
  -> tests with temporary Postgres
  -> npm build
  -> docker build

production deploy
  -> backup DB
  -> run migration step
  -> deploy app
  -> health check
  -> smoke test
```

## Phase 1: CI validate

Mục tiêu: code không được deploy nếu còn lỗi.

Checklist:

```txt
- Checkout code
- Install dependencies
- Typecheck
- Lint
- Unit tests
- Integration tests with temporary Postgres
- App build
- Docker image build
```

GitHub Actions job nên gọi là:

```txt
validate
```

Deploy job phải phụ thuộc vào validate:

```yaml
deploy:
  needs: validate
```

## Phase 2: Build artifact

Doanh nghiệp thường build một artifact/image cố định rồi deploy cùng artifact đó qua các môi trường.

Target cuối cùng nên hướng tới:

```txt
docker build -> docker tag with commit SHA -> docker push registry -> VPS pulls exact image tag
```

Ví dụ registry:

```txt
- GitHub Container Registry (GHCR)
- Docker Hub
- AWS ECR
- GCP Artifact Registry
```

Ở giai đoạn hiện tại, VPS có thể vẫn chạy:

```bash
docker compose up -d --build
```

Nhưng mục tiêu dài hạn là:

```txt
Build once -> deploy same artifact everywhere
```

## Phase 3: DB migration plan

Mỗi thay đổi DB phải trả lời được:

```txt
1. Có migration không?
2. Migration có backward-compatible không?
3. Có cần backup trước khi chạy không?
4. Migration có lock table lâu không?
5. Rollback DB thế nào?
6. App cũ có chạy được với schema mới không?
7. App mới có chạy được nếu migration fail giữa chừng không?
```

Rule doanh nghiệp hay dùng:

```txt
Expand -> Deploy -> Contract
```

Ví dụ:

```txt
Release A: add nullable column
Release B: app đọc/ghi column mới
Release C: drop column cũ sau khi chắc chắn không còn dùng
```

Tránh làm trong cùng một release:

```txt
drop old column + deploy app mới phụ thuộc schema mới
```

Vì rollback sẽ khó.

## Phase 4: Backup DB

Trước production migration cần backup/snapshot.

Với Docker Compose Postgres:

```bash
mkdir -p backups
docker compose exec -T postgres pg_dump -U gtkblog gtkblog > backups/gtkblog-$(date +%Y%m%d-%H%M%S).sql
```

Rule:

```txt
Không backup thì không migration production.
```

## Phase 5: Run migration as a separate step

Doanh nghiệp thường không để app tự migrate âm thầm nếu hệ thống đã nghiêm túc.

Preferred flow:

```txt
run migration job
if migration pass -> deploy app
if migration fail -> stop release
```

Docker Compose examples:

```bash
docker compose run --rm app npm run db:deploy
```

Hoặc tách service riêng:

```bash
docker compose run --rm migrate
```

Với GTKBlog hiện tại, Docker startup đang có `scripts/startup-check.js`. Có thể dùng tạm, nhưng hướng tốt hơn là tách migration thành command riêng như:

```json
{
  "scripts": {
    "db:deploy": "tsx scripts/payload-db-sync.ts && node scripts/bootstrap-db.js"
  }
}
```

## Phase 6: Deploy app

Nếu deploy bằng source trên VPS:

```bash
git fetch origin main
git reset --hard origin/main
docker compose up -d --build
```

Nếu deploy bằng image tag từ registry:

```bash
docker compose pull
docker compose up -d
```

Chuẩn hơn là image-tag deploy vì rollback rõ ràng hơn.

## Phase 7: Health check

Health check nên kiểm tra cả app và DB.

Endpoint nên có:

```txt
/api/health
```

Response gợi ý:

```json
{
  "ok": true,
  "database": "ok",
  "version": "commit_sha"
}
```

Không nên chỉ check homepage vì homepage có thể trả 200 dù DB lỗi một phần.

## Phase 8: Smoke test

Smoke test là kiểm tra các luồng quan trọng sau deploy.

GTKBlog smoke checklist:

```txt
- Homepage loads
- /en/me loads
- /admin login page loads
- Blog page loads
- Product page loads
```

Có thể bắt đầu bằng `curl`, sau đó nâng cấp lên Playwright.

## Phase 9: Monitor

Sau deploy cần xem trạng thái container và log:

```bash
docker compose ps
docker compose logs app --tail=100
```

Khi hệ thống lớn hơn, cân nhắc:

```txt
- Sentry
- Grafana
- Prometheus
- Cloudflare Analytics
- Uptime monitoring
```

## Phase 10: Rollback plan

Rollback app nếu deploy bằng git:

```bash
git reset --hard <previous_commit>
docker compose up -d --build
```

Rollback app nếu deploy bằng image tag:

```bash
APP_IMAGE=ghcr.io/user/app:<previous_sha> docker compose up -d
```

DB rollback khó hơn app rollback. Vì vậy migration production nên backward-compatible.

## Release note template

Dùng template này cho PR/release quan trọng:

```md
## Summary
- What changed

## Risk
- Low / Medium / High
- Why

## DB changes
- None / Migration required
- Backward compatible: yes/no
- Backup required: yes/no

## Deploy plan
1. Validate CI
2. Backup DB
3. Run migration
4. Deploy app
5. Health check

## Smoke test
- [ ] Homepage
- [ ] /en/me
- [ ] Admin login
- [ ] Critical API

## Rollback
- App rollback:
- DB rollback:
```

## GTKBlog implementation roadmap

### Level 1: Current practical flow

```txt
validate -> deploy VPS -> docker compose up -d --build -> health check
```

Good enough to start.

### Level 2: Safer VPS production flow

```txt
validate -> backup DB -> run migration step -> deploy -> /api/health DB check
```

Needed additions:

```txt
- /api/health with DB check
- npm run db:deploy
- backup command in GitHub Actions deploy step
```

### Level 3: More enterprise-grade flow

```txt
validate -> build Docker image -> push GHCR -> SSH VPS -> backup DB -> migrate -> pull image -> deploy image tag -> smoke test
```

This gives better rollback, auditability, and consistency.

## Target GitHub Actions structure

```yaml
jobs:
  validate:
    steps:
      - npm ci
      - typecheck
      - lint
      - test
      - build

  build-image:
    needs: validate
    steps:
      - docker build
      - docker push ghcr.io/...:${{ github.sha }}

  deploy-staging:
    needs: build-image
    steps:
      - migrate staging
      - deploy staging
      - smoke test staging

  deploy-production:
    needs: deploy-staging
    environment: production
    steps:
      - backup production DB
      - migrate production DB
      - deploy production image
      - health check
      - smoke test
```

`environment: production` can be configured in GitHub for manual approval before production deploy.

## Key rule

```txt
Do not let deployment be just “SSH and restart”.
A production release should always answer: validated, backed up, migrated, deployed, verified, rollback-ready.
```
