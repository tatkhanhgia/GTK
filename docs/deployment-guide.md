# GTKBlog Deployment Guide

> Production setup for Next.js 15 + Payload CMS 3 on Node.js 22 with PM2 cluster, Docker, and Cloudflare CDN.

## Pre-Deployment Checklist

- [ ] PostgreSQL database provisioned (AWS RDS, DigitalOcean, self-hosted)
- [ ] Environment variables configured (see **Environment Setup**)
- [ ] Stripe account + API keys obtained
- [ ] SePay API keys obtained (if using VietQR)
- [ ] Google OAuth credentials set up (optional)
- [ ] GitHub OAuth credentials set up (optional)
- [ ] Resend email account verified + API key
- [ ] SSL certificate obtained (Let's Encrypt recommended)
- [ ] Domain configured with DNS (Cloudflare recommended)
- [ ] All tests passing locally (`npm test`)
- [ ] Build succeeds (`npm run build`)

## Environment Setup

### 1. Create `.env.production` on Server

```bash
# Database
DATABASE_URL=postgresql://user:password@db-host:5432/gtkblog

# Payload CMS
PAYLOAD_SECRET=your-payload-secret-min-32-chars-use-openssl-rand-hex-32

# Better Auth
BETTER_AUTH_SECRET=your-better-auth-secret-min-32-chars
BETTER_AUTH_URL=https://yourdomain.com

# Auth - Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Auth - GitHub OAuth
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret

# Payment - Stripe
STRIPE_SECRET_KEY=sk_live_... (not sk_test_)
STRIPE_PUBLISHABLE_KEY=pk_live_... (not pk_test_)
STRIPE_WEBHOOK_SECRET=whsec_... (from Stripe Dashboard → Webhooks)

# Payment - SePay
SEPAY_API_KEY=your-sepay-api-key
SEPAY_WEBHOOK_SECRET=your-sepay-webhook-secret
SEPAY_BANK_ACCOUNT=account-number-for-qr-generation

# Email - Resend
RESEND_API_KEY=re_... (from Resend Dashboard)
RESEND_FROM_EMAIL=noreply@yourdomain.com

# App Configuration
NEXT_PUBLIC_APP_URL=https://yourdomain.com
NODE_ENV=production
```

### 2. Generate Secure Secrets

```bash
# On your local machine (before deployment)
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
# Use output for PAYLOAD_SECRET and BETTER_AUTH_SECRET
```

### 3. Verify `.env.local` (Git-ignored)

Ensure `.env.local` is NOT tracked in git:
```bash
git check-ignore .env.local
# Should return: .env.local
```

## Docker Deployment

### Option A: Docker Compose (Single Machine — recommended)

Routine production releases should use the manual GitHub Actions workflow in **Production CI/CD Phase 2** below. `docker-compose.yml` still keeps a startup safety net: the `app` container's entrypoint is `scripts/startup-check.js`, which:

1. Waits until Postgres accepts connections (30 retries × 2 s = 1 min).
2. Runs `scripts/payload-db-sync.ts` — loads Payload programmatically
   and applies pending `prodMigrations` so internal tables/columns
   (e.g. `payload_locked_documents_rels.translations_id`) are fully
   aligned with the current config. Dev-mode DBs (`batch: -1`) are
   detected and skipped safely.
3. Runs `scripts/bootstrap-db.js` — an idempotent, plain-JS script that
   creates/verifies app-owned schema (Better Auth tables, custom Drizzle
   tables) and applies targeted compatibility fixes (e.g. casting
   `pages_locales.content` from `varchar` to `jsonb`). Re-running is
   safe: already-applied fixes report `up-to-date` and the script
   continues.
4. Exec's `node server.js` (Next.js standalone output).

**You never need to `psql` or `exec` into the container to migrate.**

## Production CI/CD Phase 2

Production deploys are manual-only through the `Deploy Production` GitHub Actions workflow. Pushes to `main` do not auto-deploy. GitHub Actions builds and pushes the app image to GHCR; the VPS only pulls and starts that image.

Required GitHub Secrets:

- `VPS_HOST`
- `VPS_USER`
- `VPS_SSH_KEY`
- `VPS_KNOWN_HOSTS` (pinned `known_hosts` line for the VPS, not runtime `ssh-keyscan` output)
- `VPS_PROJECT_PATH`
- `PRODUCTION_URL`
- `GHCR_USERNAME` (account that can read `ghcr.io/<owner>/gtkblog`)
- `GHCR_TOKEN` (package read access for the VPS pull; GitHub-side publish uses the built-in `GITHUB_TOKEN`)

Release order:

1. Validate on GitHub runner: install, DB bootstrap, typecheck, lint, tests, Next build, Docker build.
2. Build and push `ghcr.io/<owner>/gtkblog:<commit-sha>` from GitHub Actions.
3. SSH to VPS and reset the deployment checkout to the workflow commit SHA.
4. Run `bash scripts/backup-production-db.sh` from repo root. Dumps are written to `backups/gtkblog-YYYYMMDD-HHMMSS.sql` and ignored by git.
5. Write `APP_IMAGE` and `GIT_COMMIT_SHA`, then run `docker compose pull app` and `docker compose up -d --no-build app`.
6. Container startup runs Payload schema sync and app DB bootstrap before Next.js starts.
7. Verify `${PRODUCTION_URL}/api/health`, then smoke test `/`, `/en`, and `/admin`.

Failure stop points:

- Validate fails: no VPS deploy starts.
- Image publish fails: no VPS deploy starts.
- Backup fails: release stops before app restart.
- GHCR login/pull fails: old app container remains running.
- Container startup DB sync/bootstrap fails: new app container exits and health check fails.
- Health or smoke fails: inspect app logs and decide whether app rollback is needed.

The VPS project path must be a deployment checkout only. The workflow runs `git reset --hard` there. Production compose operations must source `.env.deploy` or export `APP_IMAGE` and `GIT_COMMIT_SHA`; otherwise Compose falls back to the local placeholder image.

#### App rollback by commit image

```bash
cd /path/to/gtkblog
cat .env.deploy
git fetch origin main
git reset --hard <known-good-commit-sha>
cat > .env.deploy <<'DEPLOY_ENV'
APP_IMAGE=ghcr.io/<owner>/gtkblog:<known-good-commit-sha>
GIT_COMMIT_SHA=<known-good-commit-sha>
DEPLOY_ENV
set -a
. ./.env.deploy
set +a
docker compose pull app
docker compose up -d --no-build app
curl --fail --silent --show-error https://yourdomain.com/api/health
```

DB rollback is not automatic. Prefer backward-compatible migrations. Restore a backup only after deciding data loss/compatibility impact is acceptable, then run a restore command appropriate for the dump format and current container names.

#### Deploy / update (manual fallback)

```bash
cd /path/to/gtkblog
git fetch origin main
git reset --hard <commit-sha>
export APP_IMAGE=ghcr.io/<owner>/gtkblog:<commit-sha>
export GIT_COMMIT_SHA=<commit-sha>
docker compose pull app
docker compose up -d --no-build app
```

That's the whole deploy flow. Watch the logs if you want:

```bash
docker compose logs -f app
```

Expected on first boot or after a schema-drift fix:

```
GTKBlog Startup Check
==========================================
⏳ Checking database connection…
✓ Database reachable

⏳ Running Payload schema sync…
[payload-db-sync] Checking migration state…
[payload-db-sync] Loading Payload config…
[payload-db-sync] Initializing Payload (migrations mode)…
[payload-db-sync] Running migrations…
[payload-db-sync] Migrations complete
[payload-db-sync] Disconnected
[payload-db-sync] Done
✓ Payload schema sync complete

⏳ Running DB bootstrap…
[bootstrap-db] connected (4 fixes to check)
[bootstrap-db] up-to-date: better-auth tables
[bootstrap-db] up-to-date: custom Drizzle tables
[bootstrap-db] applied:    pages_locales.content varchar -> jsonb
[bootstrap-db] up-to-date: payload_locked_documents_rels.translations_id
[bootstrap-db] all fixes complete
✓ DB bootstrap complete

==========================================
  Starting Application…
==========================================
```

Subsequent restarts show `up-to-date` for every fix and migration.

#### Adding a new schema fix

**Payload-managed schema** (internal tables, migrations, relations):
- Create a migration in `src/migrations/` using Payload's migration format.
- Register it in `src/migrations/index.ts`.
- On next deploy, `payload-db-sync.ts` applies it automatically.

**App-owned schema** (Better Auth tables, custom Drizzle tables,
targeted compatibility fixes):
- Edit `scripts/bootstrap-db.js` and append an entry to the `FIXES`
  array. Each entry must:
  - Check current DB state via `information_schema` / `pg_catalog`.
  - Return `{ status: 'up-to-date' }` if already applied.
  - Otherwise run its `ALTER` / `CREATE` / `UPDATE` and return
    `{ status: 'applied' }`.

The next production deploy applies both layers before the app starts.
No manual SQL required.

#### Escape hatches

- Skip Payload sync (emergencies only — bypasses migration safety):
  ```bash
  docker compose run --rm -e SKIP_PAYLOAD_SYNC=true app node server.js
  ```
- Skip bootstrap entirely (emergencies only):
  ```bash
  docker compose run --rm -e SKIP_BOOTSTRAP=true app node server.js
  ```
- Inspect the DB manually if a fix errors out:
  ```bash
  docker compose exec postgres psql -U gtkblog -d gtkblog
  ```
- Raw SQL for the current single drift:
  ```bash
  docker compose exec postgres psql -U gtkblog -d gtkblog \
    -c 'ALTER TABLE "pages_locales" ALTER COLUMN "content" SET DATA TYPE jsonb USING "content"::jsonb;'
  ```

**Why not `npx payload migrate`?** The Payload 3.81 CLI loader hits a
`require(esm)` cycle under Node 22+ with extensionless relative imports.
Instead, the runtime image runs `payload-db-sync.ts` via `tsx`
(`tsx` is a production dependency) using Payload's programmatic
`getPayload` API, which avoids the CLI loader entirely. App-owned fixes
remain in `bootstrap-db.js` talking directly to Postgres with `pg`.

**Dockerfile breakdown:**
- **Stage 1 (deps):** Install production dependencies only
- **Stage 2 (builder):** Full build with all dev dependencies + Turbopack
- **Stage 3 (runner):** Minimal runtime image (prod deps + `.next/standalone` + entrypoint scripts)

### Option B: Kubernetes (Multi-Machine)

See `deployment-guide-k8s.md` (future) for Kubernetes manifests.

## PM2 Cluster Deployment

### Prerequisites

- Node.js 22.x installed
- PM2 installed globally: `npm install -g pm2`
- PostgreSQL accessible
- All env vars in `.env.production`

### 1. Clone & Install

```bash
git clone https://github.com/yourusername/gtkblog.git
cd gtkblog

# Install production dependencies
npm ci --omit=dev

# Or full install (for development)
npm install
```

### 2. Build for Production

```bash
npm run build

# Verify build succeeded
ls -la .next/standalone/
```

### 3. Start PM2 Cluster

```bash
# Load ecosystem config (2 instances in cluster mode)
pm2 start ecosystem.config.js --env production

# Verify
pm2 status

# Expected output:
# ┌────┬──────────┬──────────┬──────┬───────┬────────┐
# │ id │ name     │ mode     │ ↺    │ status│ cpu    │
# ├────┼──────────┼──────────┼──────┼───────┼────────┤
# │ 0  │ gtkblog  │ cluster  │ 0    │ online│ 0%     │
# │ 1  │ gtkblog  │ cluster  │ 0    │ online│ 0%     │
# └────┴──────────┴──────────┴──────┴───────┴────────┘
```

### 4. Configure PM2 Auto-Start

```bash
# Generate startup script for your init system
pm2 startup

# (Runs a command like:)
# sudo env PATH=$PATH:/path/to/node pm2 startup -u username --hp /home/username

# Save PM2 process list to auto-start
pm2 save
```

### 5. Monitor PM2 Instances

```bash
# View real-time dashboard
pm2 monit

# Tail logs
pm2 logs gtkblog

# Watch specific instance
pm2 logs gtkblog --lines 100

# Check health
pm2 describe 0  # Instance 0 details
```

### 6. Graceful Restart/Reload

```bash
# Zero-downtime reload (one instance restarts at a time)
pm2 reload gtkblog

# Restart with downtime
pm2 restart gtkblog

# Restart all apps
pm2 kill && pm2 start ecosystem.config.js --env production
```

### 7. PM2 Log Rotation (Optional)

```bash
# Install log rotation
pm2 install pm2-logrotate

# Configure
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 30
```

## Reverse Proxy Setup (Nginx)

### Configuration

```nginx
upstream gtkblog_cluster {
  server 127.0.0.1:3000;
  server 127.0.0.1:3000;  # Both PM2 instances on same port (PM2 load balances)
  keepalive 64;
}

server {
  listen 80;
  server_name yourdomain.com;

  # Redirect HTTP to HTTPS
  return 301 https://$server_name$request_uri;
}

server {
  listen 443 ssl http2;
  server_name yourdomain.com;

  # SSL certificates (Let's Encrypt)
  ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
  ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;

  # Security headers
  add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
  add_header X-Content-Type-Options "nosniff" always;
  add_header X-Frame-Options "SAMEORIGIN" always;
  add_header X-XSS-Protection "1; mode=block" always;
  add_header Referrer-Policy "strict-origin-when-cross-origin" always;

  # Gzip compression
  gzip on;
  gzip_types text/plain text/css application/json application/javascript text/xml application/xml;
  gzip_min_length 1000;

  # Client upload limit (e.g., for media uploads to Payload)
  client_max_body_size 50M;

  location / {
    proxy_pass http://gtkblog_cluster;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_cache_bypass $http_upgrade;
  }

  # Static asset caching (let browser cache)
  location ~* \.(js|css|png|jpg|jpeg|gif|ico|woff|woff2|ttf|svg)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
  }
}
```

### Enable Nginx Configuration

```bash
# Symlink to sites-enabled
sudo ln -s /etc/nginx/sites-available/gtkblog /etc/nginx/sites-enabled/gtkblog

# Test configuration
sudo nginx -t

# Reload Nginx
sudo systemctl reload nginx
```

## SSL/TLS Certificate Setup

### Let's Encrypt with Certbot

```bash
# Install Certbot
sudo apt-get install certbot python3-certbot-nginx

# Generate certificate (auto-renew via cron)
sudo certbot certonly --webroot -w /var/www/yourdomain -d yourdomain.com -d www.yourdomain.com

# Auto-renewal (runs twice daily)
sudo systemctl enable certbot.timer
sudo systemctl start certbot.timer
```

## Database Migrations

### Initial Setup

```bash
# Run all pending migrations (Payload + custom tables)
npm run drizzle:migrate

# Or with environment variable
DATABASE_URL="postgresql://..." npm run drizzle:migrate
```

### Payload CMS Migrations

```bash
# Payload migrations are automatic on startup
# But can force with:
npm run payload:migrate  # (if script exists in package.json)
```

### Custom Table Migrations (Drizzle)

```bash
# Create new migration
npm run drizzle:generate

# Review migration file in drizzle/ folder
cat drizzle/*.sql

# Apply migrations
npm run drizzle:migrate
```

## Health Checks & Monitoring

### Basic Health Check Endpoint

```bash
curl --fail --silent --show-error https://yourdomain.com/api/health
# The production workflow expects JSON that satisfies:
# {"ok":true,"database":"ok","version":"<deployed-commit-sha>"}
```

### PM2 Dashboard (Web UI)

```bash
# Install PM2 Plus (optional, paid)
pm2 install pm2-auto-pull

# Or use free web dashboard
pm2 web
# Access at http://localhost:9615
```

### Database Connection Check

```bash
# From app server
psql -h db-host -U user -d gtkblog -c "SELECT version();"

# Or test from Node
node -e "
const { drizzle } = require('drizzle-orm/postgres-js');
const postgres = require('postgres');
const sql = postgres(process.env.DATABASE_URL);
const db = drizzle(sql);
db.execute(sql\`SELECT 1\`).then(() => console.log('✓ DB OK')).catch(e => console.log('✗ DB FAIL', e.message));
"
```

### CPU & Memory Monitoring

```bash
# View in real-time
pm2 monit

# Or via PM2 logs
pm2 logs gtkblog | grep -i memory

# View historical data
pm2 describe gtkblog
```

## Backup & Recovery

### Database Backups (PostgreSQL)

```bash
# Full backup (daily via cron)
pg_dump -h db-host -U user -F c gtkblog > backups/gtkblog-$(date +%Y%m%d).dump

# Or with AWS RDS
aws rds create-db-snapshot \
  --db-instance-identifier gtkblog-db \
  --db-snapshot-identifier gtkblog-$(date +%Y%m%d)

# Restore from backup
pg_restore -h db-host -U user -d gtkblog backups/gtkblog-20240101.dump
```

### Automated Backup (Cron)

```bash
# Add to crontab
0 2 * * * /usr/bin/pg_dump -h db-host -U user -F c gtkblog > /backups/gtkblog-$(date +\%Y\%m\%d).dump

# Keep last 30 days
30 2 * * * find /backups -name "gtkblog-*.dump" -mtime +30 -delete
```

## Deployment Workflow (Recommended)

### 1. Pre-Deployment

```bash
# On your local machine
npm test                    # Run tests
npm run lint               # Check linting
npm run build             # Build locally
git push origin main      # Push to main
```

### 2. Pull & Build on Server

```bash
cd /var/www/gtkblog
git pull origin main
npm ci --omit=dev         # Install prod dependencies
npm run build             # Build Next.js
```

### 3. Database Migrations

```bash
npm run drizzle:migrate   # Apply migrations (safe if no pending)
```

### 4. Restart PM2

```bash
pm2 reload gtkblog       # Zero-downtime reload (instances restart one-by-one)
pm2 save                 # Persist to auto-restart on reboot
```

### 5. Verify

```bash
pm2 status               # Check all instances online
curl -I https://yourdomain.com
pm2 logs gtkblog | tail  # Check for errors
```

## Rollback Procedure

For Docker production, use **App rollback by commit image** in the Production CI/CD Phase 2 section. Do not rely on app rollback alone if the failed release applied a non-backward-compatible DB change.

For PM2 deployments:

```bash
# If new deployment has issues, rollback to previous commit
git log --oneline | head  # View recent commits
git revert <bad-commit>   # Create revert commit
git push origin main

# On server
git pull origin main
npm run build
npm run db:deploy         # Ensure schema is compatible before restart
pm2 reload gtkblog
```

## Common Issues & Troubleshooting

### PM2 Instance Stuck in "Stopping" State

```bash
# Force kill and restart
pm2 kill
pm2 start ecosystem.config.js --env production
```

### Database Connection Pool Exhausted

**Symptoms:** `error: remaining connection slots reserved for non-replication superuser connections`

**Fix:**
```bash
# Check active connections
psql -h db-host -U user -d gtkblog -c "SELECT count(*) FROM pg_stat_activity;"

# Increase pool size (in auth-config.ts)
const sql = postgres(process.env.DATABASE_URL, {
  max: 20,  // Increase from default
})

# Or at database level
ALTER DATABASE gtkblog SET max_connections = 200;
```

### High Memory Usage

```bash
# Check PM2 memory limit
pm2 describe gtkblog | grep memory

# Increase limit in ecosystem.config.js
max_memory_restart: '1G'  // Increase from 512M

# Restart
pm2 restart gtkblog
```

### Slow API Requests

```bash
# Check if database is slow
npm run db:analyze-queries

# Or manually check Payload collections
# In Payload admin: Dashboard → Performance metrics

# Check Stripe/SePay API response times
# Review PM2 logs for slow routes
pm2 logs gtkblog | grep "took.*ms"
```

### Email Not Sending

```bash
# Verify Resend API key is valid
curl -H "Authorization: Bearer $RESEND_API_KEY" https://api.resend.com/emails

# Check if email is in allowed domain (for Resend trial)
# On production: use verified domain

# Review email logs in app
pm2 logs gtkblog | grep -i email
```

### Download Token Expired

```bash
# Check download_tokens table
psql -h db-host -U user -d gtkblog -c "
  SELECT id, created_at, expires_at, downloaded_at 
  FROM download_tokens 
  ORDER BY created_at DESC LIMIT 10;
"

# Manually extend token (for support)
UPDATE download_tokens SET expires_at = NOW() + INTERVAL '48 hours' WHERE id = '<token-id>';
```

## Performance Optimization

### Next.js Build Optimization

Already configured in `next.config.ts`:
- Turbopack for fast dev
- SWC minification (default)
- Dynamic imports for large components
- Image optimization (next/image)

### Database Optimization

```sql
-- Create indexes for common queries
CREATE INDEX idx_posts_published_at ON posts(published_at DESC) WHERE published = true;
CREATE INDEX idx_posts_category_id ON posts(category_id) WHERE published = true;
CREATE INDEX idx_orders_user_id_created_at ON orders(user_id, created_at DESC);
CREATE INDEX idx_comments_post_id_approved ON comments(post_id, approved) WHERE approved = true;

-- Analyze query performance
EXPLAIN ANALYZE SELECT * FROM posts WHERE published = true ORDER BY published_at DESC LIMIT 20;
```

### Caching Strategy

```typescript
// In app/[locale]/blog/page.tsx
export const revalidate = 3600  // 1 hour ISR
```

```typescript
// In Nginx config
location ~* \.(js|css|svg|woff2)$ {
  expires 1y;
  add_header Cache-Control "public, immutable";
}
```

## Security Checklist

- [ ] `.env.production` not in git
- [ ] HTTPS/TLS enabled (Let's Encrypt or paid)
- [ ] Security headers set (Nginx config above)
- [ ] Database password is strong (20+ chars, random)
- [ ] Stripe/SePay webhook secrets rotate periodically
- [ ] API keys not logged (check PM2 logs)
- [ ] Rate limiting enabled (Upstash configured)
- [ ] Payload admin password is strong
- [ ] PostgreSQL runs with restricted user (not root)
- [ ] Firewall: Only ports 80, 443 open to public
- [ ] Firewall: Port 5432 (PostgreSQL) restricted to app server only

## Post-Deployment Steps

1. **Test Login Flow**
   ```bash
   curl -X POST https://yourdomain.com/api/auth/register \
     -H "Content-Type: application/json" \
     -d '{"email":"test@example.com","password":"Test1234"}'
   ```

2. **Test Blog**
   ```bash
   curl https://yourdomain.com/en/blog
   ```

3. **Test Payment (Stripe Test Mode)**
   - Use test card: `4242 4242 4242 4242`
   - Any future date, any CVC

4. **Test Email (Resend Test)**
   - Check email logs in PM2

5. **Test Download Token**
   - Complete test order
   - Verify download link works
   - Verify token expires in 48 hours

6. **Monitor for 24 Hours**
   - Watch error logs
   - Monitor CPU/memory
   - Check slow query log
   - Review Stripe webhook deliveries

## Monitoring & Alerting (Optional)

### Sentry (Error Tracking)

```bash
npm install @sentry/nextjs

# Configure in next.config.ts
import * as Sentry from "@sentry/nextjs";
Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: 'production',
});
```

### New Relic (APM)

```bash
npm install newrelic

# Create newrelic.js and require at app startup
```

### Uptime Monitoring

- **UptimeRobot:** Free HTTP/HTTPS monitoring
- **Healthchecks.io:** Lightweight ping checks

Configure to hit: `https://yourdomain.com/health` every 5 minutes

## Next Steps

1. Deploy staging environment (same setup, different domain)
2. Test all workflows (auth, payments, email, downloads)
3. Load test with k6 or Artillery
4. Set up monitoring/alerting
5. Create runbook for common operations
6. Document your infrastructure (IaC with Terraform optional)
7. Schedule regular security audits and backups

