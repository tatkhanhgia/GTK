# GTKBlog System Architecture

> Embedded Next.js 15 + Payload CMS 3 with Better Auth, dual payment processors, and i18n-aware middleware.

## High-Level Architecture

```
Client (Browser)
    â†“
Cloudflare CDN (static assets)
    â†“
Next.js Server (Node.js 22)
    â”œâ”€ Middleware (auth + i18n)
    â”œâ”€ App Router (pages & routes)
    â”œâ”€ Payload Admin & API
    â””â”€ Better Auth (session management)
    â†“
PostgreSQL Database
    â”œâ”€ Payload tables (posts, products, categories, users)
    â”œâ”€ Better Auth tables (ba_users, ba_sessions, etc.)
    â””â”€ Custom tables (orders, comments, newsletter, download_tokens)
    â†“
External Services
    â”œâ”€ Stripe (payment processing)
    â”œâ”€ SePay (VietQR, bank transfers)
    â”œâ”€ Resend (transactional email)
    â””â”€ Google/GitHub OAuth
```

## Payload Admin Customizations

- Payload boots inside the App Router group `(payload)` whose layout (`src/app/(payload)/layout.tsx`) now wraps `RootLayout` with a custom `ThemeProvider`, pulls in `src/admin/styles/admin-theme.css`, and loads `src/admin/styles/component-overrides.css` so the Anthropic variables and overrides can reach Payload's DOM.
- `ThemeProvider` (`src/admin/components/providers/theme-provider.tsx`) exposes a context with `theme`, `setTheme`, and `resolvedTheme`, toggles the global `admin-dark` class, and listens for `prefers-color-scheme` changes while the `use-system-theme` helper (`src/admin/hooks/use-system-theme.ts`) keeps the resolved theme in sync with the user preference.
- Custom layout pieces (`custom-header.tsx`, `custom-sidebar.tsx`) plus the reusable `Card` component (`src/admin/components/ui/card.tsx`) keep the navigation, header actions, and metric surfaces consistent with the new theme tokens, while `component-overrides.css` hides Payload's native sidebar/nav, restyles tables/forms/buttons, and applies the theme tokens to typography, borders, shadows, and animations.
- The Anthropic-inspired dashboard view (`src/admin/components/views/custom-dashboard.tsx`) becomes the default admin landing page thanks to the `Dashboard` override in `payload.config.ts`, offering stat cards, quick actions, and activity/status regions that stay in sync with the dark/light palette.

## Authentication & Authorization

### Site Member Administration

- Payload `users` remains CMS admin accounts only.
- Better Auth `ba_users` remains source of truth for site members.
- Custom admin route `/admin/site-users` is guarded by Payload admin auth and edits Better Auth users through `site-user-admin-service`.
- Deactivation writes both custom `status = deactivated` and Better Auth admin plugin fields (`banned`, `ban_reason`, `ban_expires`) and revokes sessions.
- Admin member email edits normalize lowercase and enforce uniqueness before update.

### Better Auth Flow

```
POST /api/auth/register
    â†“
Better Auth validates credentials
    â†“
Hash password (Argon2), create ba_users record
    â†“
Generate session, set gtkblog.session_token cookie
    â†“
Redirect to profile or checkout
```

### Session Management

| Component | Responsibility |
|-----------|-----------------|
| **Better Auth** | Session creation, password hashing, OAuth flow |
| **Cookie** | `gtkblog.session_token` (30-day expiry) |
| **Middleware** | Lightweight cookie check on protected routes |
| **Auth Helpers** | `getSession()`, `requireAuth()`, `requireAdmin()` |

### Protected Routes

```
/[locale]/profile/*          â†’ Requires session
/[locale]/checkout/*         â†’ Requires session
/[locale]/downloads/*        â†’ Requires session
/api/auth/change-password    â†’ Requires session
/api/newsletter/unsubscribe  â†’ Requires email (from query param)
```

**Route Protection Pattern:**
```typescript
// In middleware.ts
if (isProtected && !sessionCookie?.value) {
  return NextResponse.redirect(new URL(`/${locale}/login`, request.url))
}
```

## Database Architecture

### PostgreSQL Schema (Logical View)

#### Payload CMS Tables
Managed internally by Payload; accessed via Payload SDK:
```
users (CMS admins only)
â”œâ”€ id, email, password_hash, role, created_at
â”œâ”€ Keys: PK(id), UNIQUE(email)

author-profile (singleton global)
â”œâ”€ bio, avatar_url, email, skills (array), social_links (array)
â”œâ”€ timeline (array: year, title, description)
â”œâ”€ Keys: PK(id), single record

posts
â”œâ”€ id, title, slug, content (Lexical), excerpt
â”œâ”€ published, published_at, updated_at
â”œâ”€ category_id (FK â†’ categories.id)
â”œâ”€ author_id (FK â†’ users.id)
â”œâ”€ meta_description, canonical_url
â”œâ”€ Keys: PK(id), UNIQUE(slug), INDEX(published_at, category_id)

products
â”œâ”€ id, title, slug, description, price_usd, price_vnd
â”œâ”€ stripe_product_id, featured, active
â”œâ”€ download_file_id (FK -> digital_downloads.id)
â”œâ”€ Keys: PK(id), UNIQUE(slug), INDEX(stripe_product_id)

categories
â”œâ”€ id, name, slug, description
â”œâ”€ Keys: PK(id), UNIQUE(slug)

media (uploaded files)
â”œâ”€ id, filename, url, size, mime_type
â”œâ”€ created_at, updated_at
â”œâ”€ Keys: PK(id)

digital_downloads (paid product files)
- id, title, description, version
- filename, mime_type, filesize, created_at, updated_at
- Stored on private disk under /app/digital-downloads
- Keys: PK(id)

pages (custom static pages)
- id, title, slug, content, status, published_at
- Keys: PK(id), UNIQUE(slug)
```

#### Better Auth Tables
Managed by Better Auth plugin; separate from Payload:
```
ba_users
â”œâ”€ id, email, name, emailVerified, image, role
â”œâ”€ created_at, updated_at
â”œâ”€ Keys: PK(id), UNIQUE(email)

ba_sessions
â”œâ”€ id, userId (FK â†’ ba_users.id), token, expiresAt
â”œâ”€ Keys: PK(id), FK(userId), INDEX(expiresAt)

ba_accounts (OAuth)
â”œâ”€ id, userId (FK â†’ ba_users.id), provider, providerAccountId
â”œâ”€ Keys: PK(id), FK(userId), UNIQUE(provider, providerAccountId)

ba_verifications
â”œâ”€ id, identifier, value, expiresAt
â”œâ”€ Keys: PK(id)
```

#### Custom Tables (Drizzle)
Direct queries via `src/db/index.ts`:
```
user_profiles (extended user data)
â”œâ”€ id (FK â†’ ba_users.id)
â”œâ”€ bio, avatar_url, locale (vi|en), theme (light|dark)
â”œâ”€ stripe_customer_id, newsletter_subscribed
â”œâ”€ created_at, updated_at
â”œâ”€ Keys: PK(id), UNIQUE(stripe_customer_id)

orders
â”œâ”€ id, user_id (FK â†’ ba_users.id)
â”œâ”€ total_usd, total_vnd, currency (usd|vnd)
â”œâ”€ payment_method (stripe|sepay), status (pending|completed|failed)
â”œâ”€ stripe_payment_intent_id, sepay_transaction_id
â”œâ”€ created_at, completed_at
â”œâ”€ Keys: PK(id), FK(user_id), INDEX(user_id, created_at), UNIQUE(stripe_payment_intent_id)

order_items
â”œâ”€ id, order_id (FK â†’ orders.id), product_id (FK â†’ products.id)
â”œâ”€ quantity, price_usd, price_vnd
â”œâ”€ Keys: PK(id), FK(order_id, product_id)

comments
â”œâ”€ id, post_id (FK â†’ posts.id), user_id (FK â†’ ba_users.id)
â”œâ”€ content, approved, created_at, updated_at
â”œâ”€ Keys: PK(id), FK(post_id, user_id), INDEX(post_id, approved)

download_tokens
â”œâ”€ id (nanoid), user_id (FK â†’ ba_users.id), product_id (FK â†’ products.id)
â”œâ”€ token (crypto-secure), created_at, expires_at
â”œâ”€ downloaded_at (nullable)
â”œâ”€ Keys: PK(id), FK(user_id), UNIQUE(token), INDEX(expires_at)

newsletter
â”œâ”€ id, email, subscribed_at, unsubscribed_at, confirmed_at
â”œâ”€ locale (vi|en), created_at, updated_at
â”œâ”€ Keys: PK(id), UNIQUE(email), INDEX(subscribed_at)
```

### Data Access Patterns

| Layer | Method | Usage |
|-------|--------|-------|
| **Payload Collections** | Payload SDK in server components | Blog posts, products, categories, media, digital-downloads, about-page content |
| **Payload Global** | `getAuthorProfile(locale)` helper | Localized author identity reused across `/me`, `/about`, and `/blog` |
| **Custom Tables** | Drizzle ORM in server actions/functions | Orders, comments, profiles, tokens |
| **Direct SQL** | `db.execute()` for complex queries | Aggregations (post counts, order totals) |

## Request Routing

### Locale-Aware Routing

```
/              â†’ Detect browser locale â†’ Redirect to /vi or /en
/vi/blog       â†’ Vietnamese editorial blog hub (?category=slug, featured hero, newsletter CTA)
/en/blog       â†’ English editorial blog hub
/vi/blog/category/[slug] â†’ Legacy category URL, redirected to /vi/blog?category={slug}
/en/blog/category/[slug] â†’ Legacy category URL, redirected to /en/blog?category={slug}
/vi/about      â†’ About page with editorial sections, CMS rich text, and author CTA
/en/about      â†’ About page (English)
/vi/products   â†’ Vietnamese products
/vi/me         â†’ Author profile (bio, skills, timeline, contact)
/en/me         â†’ Author profile (English)
/admin         â†’ Payload admin (no locale)
/api/auth      â†’ Better Auth (no locale)
```

**Middleware Flow:**
```typescript
1. Request arrives â†’ middleware.ts
2. Check if route needs auth protection
3. If protected, verify gtkblog.session_token
4. Pass to next-intl middleware for locale routing
5. Route to appropriate handler
```

### Route Groups

| Group | Purpose | Auth | Locale |
|-------|---------|------|--------|
| `(auth)` | Login, register, password reset | None | None |
| `(payload)` | Admin dashboard, Payload API | Payload only | None |
| `[locale]` | All customer-facing routes, including editorial About/Blog surfaces | Optional | Required |
| `api/auth` | Better Auth catch-all | Varies | None |
| `api/webhooks` | Payment webhooks | Verify signature | None |

### Editorial Surface Composition

- `/[locale]/about` combines hard-coded section components (`AboutHeroSection`, `TopicsGrid`), localized author data from the `author-profile` global, and rich text from the Payload `pages` collection entry with slug `about`.
- `/[locale]/blog` resolves category state from `searchParams.category`, highlights the first post as a featured hero on the default listing, and appends `AuthorMiniCard` plus `NewsletterSection` below the post grid.
- `AuthorMiniCard` provides a shared CTA path from editorial surfaces back to `/[locale]/me`.
- Blog article pages emit `Article` JSON-LD with `dateModified` set from `updatedAt` when available, otherwise `publishedAt`.

### Publication Visibility

- Blog listing, RSS feed, and sitemap all use `publishedNowWhere()` so only published posts with no future `publishedAt` or `publishedAt <= now` are public.
- Scheduled posts stay queryable in admin, but they are hidden from public discovery until due.

## Payment Processing

### Stripe Checkout Flow

```
User clicks "Buy with Stripe"
    â†“
Server creates Stripe session
    â”œâ”€ product_id, user_id, locale
    â”œâ”€ success_url: /[locale]/products/checkout/success
    â”œâ”€ cancel_url: /[locale]/products/[slug]
    â†“
Redirect to Stripe Hosted Checkout
    â†“
User completes payment
    â†“
Stripe sends webhook â†’ /api/webhooks/stripe
    â”œâ”€ Verify signature (STRIPE_WEBHOOK_SECRET)
    â”œâ”€ Create order in orders table
    â”œâ”€ Generate download_token with 48h expiry
    â”œâ”€ Send order confirmation email (localized)
    â†“
User sees success page, can download immediately
```

### SePay QR Flow

```
User selects "VietQR / Bank Transfer"
    â†“
Modal shows SePay-generated QR code
    â”œâ”€ Account: SEPAY_BANK_ACCOUNT
    â”œâ”€ Amount: product price in VND
    â”œâ”€ Message: "Order {orderId}"
    â†“
User scans with banking app
    â†“
Webhook â†’ /api/webhooks/sepay
    â”œâ”€ Verify signature (SEPAY_WEBHOOK_SECRET)
    â”œâ”€ Update order status to completed
    â”œâ”€ Generate download_token
    â”œâ”€ Send email
    â†“
Polling endpoint /api/payment/status
    â””â”€ Client checks every 5s if payment received
```

**Payment Status Flow:**
```
pending â†’ [webhook received] â†’ completed â†’ [token valid until 48h]
        â†’ [webhook not received] â†’ expires (7-day default)
```

## Email Architecture

### Admin-managed Email Settings

- Payload global: `email-settings`.
- Provider scope: provider-neutral settings with Resend, Zoho ZeptoMail, SMTP, and Cloudflare Email Service adapters.
- Secret storage: provider tokens/passwords encrypted server-side with `EMAIL_SETTINGS_ENCRYPTION_KEY`; admin reads show only a mask.
- Fallback path: if no Payload settings exist, delivery can use provider env vars (`RESEND_API_KEY`, `ZOHO_ZEPTOMAIL_TOKEN`, `SMTP_HOST`, `SMTP_USER`, `SMTP_PASSWORD`, `CLOUDFLARE_EMAIL_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID`) plus `RESEND_FROM_EMAIL`.
- Provider boundary: `send-email.ts` resolves settings, selects an email provider adapter, then sends through the adapter. Unsupported provider values fail closed before any external call.
- Welcome email: Better Auth `databaseHooks.user.create.after` calls `sendWelcomeEmailForUser`; failures are logged and do not block signup.

## Admin AI Architecture

- Admin route: `/admin/ai` is Payload-admin gated and uses JSON APIs under `/api/admin/ai/*`.
- Provider profiles: Payload collection `admin-ai-profiles` stores name, OpenAI-compatible base URL, default model, optional model list, enabled flag, encrypted API key, and admin-editable agent behavior instructions.
- Agent behavior: each profile can define role/persona, communication style, operational context, tool usage rules, and custom instructions. The server merges these with non-removable safety guardrails before calling the provider.
- Secret storage: provider API keys are encrypted server-side with `ADMIN_AI_ENCRYPTION_KEY` or `PAYLOAD_SECRET` fallback; admin/browser reads receive only a mask.
- Chat route: `POST /api/admin/ai/chat` loads the selected profile server-side, decrypts the key, calls `{baseUrl}/chat/completions`, and returns only assistant content, usage, tool results, and pending confirmations.
- Session history: Payload collection `admin-ai-sessions` stores per-admin chat transcripts, profile/model metadata, title, and last-message time. Admin APIs under `/api/admin/ai/sessions` support list, create, reopen, and delete, with ownership checked by `adminUserId`.
- File attachments: `/api/admin/ai/files` accepts admin-only Markdown, HTML, and text uploads for chat context. Payload stores unique file metadata in `admin-ai-files`, per-admin references in `admin-ai-file-references`, and cleaned bounded chunks in `admin-ai-file-chunks`.
- Attachment safety: uploads are UTF-8 text only, default to a 1 MB per-file cap (`ADMIN_AI_FILE_UPLOAD_MAX_BYTES`, max 5 MB), share a 5 GB global unique-file quota, dedupe by SHA-256 checksum, and inject bounded text context into the provider request without storing raw content in session messages.
- Tool contract: read tools can execute during chat; write tools create `admin-ai-action-confirmations` records and require explicit admin confirmation through `/api/admin/ai/actions/confirm`.
- Content tools: Admin AI can list blog categories, list recent draft posts, prepare localized post creation, and prepare post SEO updates. Post creation writes Vietnamese content first, optionally updates English content, and defaults to draft unless the confirmed action requests publish.
- Audit trail: tool attempts and confirmations write redacted records to `admin-ai-audit-logs`.
- Ops boundary: Docker/server operations are permanently excluded from Admin AI scope. Do not add a Docker socket mount or Admin AI `ops-runner`.

### Web Content Publishing Agent

- Web-only boundary: publish tools act on Payload posts and pages only; they do not cover Docker or server ops.
- Source ledger: web, uploaded-file, and existing-post summaries are normalized into sanitized source ledger entries, instruction-like text is stripped, and returned source text is treated as untrusted.
- Source receipts: read tools mint server-signed receipts tied to the admin; publish/schedule policy accepts only verified receipts, not model-supplied confidence claims.
- Web research boundary: only public HTTPS source URLs are recorded in MVP; live fetching arbitrary URLs is disabled until a hardened egress client/proxy can validate the final connected IP and redirects.
- Policy: server-side checks block high-risk text, require verified sources for publish/schedule, gate new long-form content behind admin confirmation, and limit auto-publish to approved-content refresh, approved-source translation, and typo fixes.
- Content packs: structured content packs are converted to Payload Lexical server-side, with unsafe or unsupported blocks rejected before save.
- Publishing: approved publish/schedule tools set `status: 'published'` and `publishedAt`; scheduled content uses a future `publishedAt` and stays hidden from public routes and Payload public reads until due.

### Templates (React Email)

| Template | Trigger | Variables |
|----------|---------|-----------|
| `welcome-email.tsx` | After registration | name, locale, login_url |
| `order-confirmation-email.tsx` | After payment | order_id, items[], total, download_urls, locale |
| `password-reset-email.tsx` | Password reset flow | reset_url, expires_at, locale |
| `newsletter-post-email.tsx` | New post published | post_title, excerpt, read_more_url, locale |
| `contact-notification.tsx` | Contact form submission via /me | sender_name, sender_email, message, locale |

### Localization

```typescript
// Template receives locale param
// Renders text in correct language
// Uses messages/[locale].json for strings
```

### Sending

```
Server action or webhook
    â†“
lib/email/send-email.ts
    â”œâ”€ Load template component
    â”œâ”€ Resolve provider settings
    â”œâ”€ Select email provider adapter
    â”œâ”€ Call Resend adapter
    â†“
Resend sends via configured from address
```

**Rate Limiting:** 100 emails/min per IP via Upstash

## i18n Implementation

### Configuration

```typescript
// src/i18n/config.ts
locales: ['vi', 'en']
defaultLocale: 'vi'
fallback: true  // Fall back to vi if en string missing
```

### Routing Strategy

```
/vi/*   â†’ Vietnamese
/en/*   â†’ English
/       â†’ Detect locale â†’ Redirect to /vi or /en
        â†’ Fallback to /vi if unrecognized
```

### Translation File Structure

```
messages/
â”œâ”€â”€ vi.json          # Vietnamese strings (all keys)
â””â”€â”€ en.json          # English strings (can have subset if fallback enabled)
```

**Keys Example:**
```json
{
  "nav.home": "Trang chá»§",
  "nav.blog": "Blog",
  "blog.no-posts": "ChÆ°a cÃ³ bÃ i viáº¿t",
  "payment.stripe": "Thanh toÃ¡n báº±ng Stripe",
  "email.welcome-subject": "ChÃ o má»«ng báº¡n Ä‘áº¿n vá»›i GTKBlog"
}
```

### Server-side Translation

```typescript
import { getTranslations } from 'next-intl/server'

export default async function Page() {
  const t = await getTranslations('blog')
  return <h1>{t('title')}</h1>  // "Danh sÃ¡ch bÃ i viáº¿t"
}
```

### Client-side Translation

```typescript
'use client'
import { useTranslations } from 'next-intl'

export function BlogCard() {
  const t = useTranslations('blog')
  return <h2>{t('read-more')}</h2>  // "Äá»c tiáº¿p"
}
```

## Download Security

### Token Generation & Verification

```
User completes payment
    â†“
Webhook generates nanoid (21 chars)
    â”œâ”€ Stored in download_tokens table
    â”œâ”€ created_at: now
    â”œâ”€ expires_at: now + 48 hours
    â”œâ”€ downloaded_at: null
    â†“
Email sent with link: /api/download/[token]
    â†“
GET /api/download/[token]
    â”œâ”€ Verify token exists
    â”œâ”€ Verify not expired (expires_at > now)
    â”œâ”€ Load product + digital download metadata server-side
    â”œâ”€ Resolve private /app/digital-downloads path
    â”œâ”€ Fallback to legacy public/media path for migrated records when needed
    - Stream file as attachment with safe headers
    â†“
Token is validated on every request; download_count or single-use enforcement remains a future enhancement
```

**Security Measures:**
- Opaque tokens (not JWTs â€” can't be decoded/forged)
- Crypto-secure random generation
- Short 48-hour expiry
- Single-use enforcement
- Database validation on each request

## Caching & Performance

### Static Generation

```typescript
// Blog listing (ISR)
export const revalidate = 3600  // 1 hour

// Product listing (ISR)
export const revalidate = 1800  // 30 minutes

// Blog post (ISR)
export const revalidate = 86400  // 1 day
```

### Dynamic Content

```typescript
// User profile (always fresh)
export const dynamic = 'force-dynamic'

// Checkout (always fresh)
export const dynamic = 'force-dynamic'
```

### CDN Caching

```
Cloudflare rules
â”œâ”€ Cache static assets forever (images, fonts, CSS, JS)
â”œâ”€ Cache HTML pages 1 hour
â”œâ”€ Don't cache /api/*, /admin/*, /[locale]/profile/*
```

## Security Considerations

### Input Validation

| Layer | Method |
|-------|--------|
| **API Routes** | Zod schema validation in server actions |
| **Database** | Parameterized queries (Drizzle ORM) |
| **Client** | Form validation with `react-hook-form` + Zod |

### CSRF Protection

- Built-in Next.js Server Actions (secure by default)
- No explicit CSRF tokens needed

### Rate Limiting

```typescript
// Upstash Redis-backed limits
POST /api/auth/register       â†’ 5 per day per IP
POST /api/auth/login          â†’ 10 per hour per IP
POST /api/newsletter/subscribe â†’ 100 per day per IP
POST /api/payment/create-*    â†’ 50 per hour per user
POST /api/contact             â†’ 3 per 60 seconds per IP
```

### Password Security

- Argon2 hashing (Better Auth default)
- Minimum 8 characters
- Email verification optional (disabled for launch)

### Data Privacy

| Data | Storage | Retention |
|------|---------|-----------|
| Password hash | ba_users.password | Until delete account |
| Session token | ba_sessions.token | 30 days |
| Download token | download_tokens.token | 48 hours |
| Order data | orders, order_items | Indefinite (audit) |
| Newsletter email | newsletter | Until unsubscribe |

## Error Handling

### Server-side

```typescript
// Try-catch with specific error handling
try {
  const result = await action()
} catch (error) {
  if (error instanceof ValidationError) {
    return { error: 'Invalid input' }
  }
  if (error instanceof NotFoundError) {
    return { error: 'Not found', status: 404 }
  }
  // Log unexpected errors
  console.error(error)
  return { error: 'Internal error', status: 500 }
}
```

### Client-side

```typescript
// Toast notifications for user feedback
toast.error('Payment failed')
toast.success('Download started')

// Fallback UI for errors
<ErrorBoundary fallback={<ErrorPage />}>
  <YourComponent />
</ErrorBoundary>
```

### Logging

- Console logs in development
- PM2 logs in production (`./logs/pm2-*.log`)
- Third-party (optional): Sentry, LogRocket for error tracking

## Deployment Architecture

See `deployment-guide.md` for detailed setup, but here's the architecture:

```
â”Œâ”€ DNS (Cloudflare)
â”‚  â””â”€ CNAME â†’ Load Balancer (or direct IP)
â”‚
â”œâ”€ Load Balancer (optional)
â”‚  â”œâ”€ Health check: GET /
â”‚  â””â”€ Route to PM2 instances
â”‚
â”œâ”€ PM2 Cluster (2 instances)
â”‚  â”œâ”€ Instance 1: Node.js 22 Alpine
â”‚  â”‚  â””â”€ `next start` (port 3000, internal)
â”‚  â””â”€ Instance 2: Node.js 22 Alpine
â”‚     â””â”€ `next start` (port 3000, internal)
â”‚
â”œâ”€ Reverse Proxy (Nginx or similar)
â”‚  â””â”€ Port 80/443 â†’ PM2 instances (localhost:3000)
â”‚
â”œâ”€ PostgreSQL (AWS RDS / DigitalOcean / Self-hosted)
â”‚  â””â”€ Connection pooling (optional: pgBouncer)
â”‚
â””â”€ CDN (Cloudflare)
   â””â”€ Cache static assets
```

**Container Deployment (Docker):**

```dockerfile
# Multi-stage build
FROM node:22-alpine AS builder
WORKDIR /app
RUN npm ci && npm run build

FROM node:22-alpine
WORKDIR /app
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public
EXPOSE 3000
CMD ["node", "server.js"]
```

## Monitoring & Observability

### Health Checks

```bash
curl http://localhost:3000/health  # Returns 200 if up
```

### Key Metrics

| Metric | Tool | Action if Alert |
|--------|------|-----------------|
| Response time > 1s | PM2 monitoring | Check slow queries, DB connections |
| Memory > 512MB | PM2 monitoring | Auto-restart instance |
| Database connections > 80% | pgAdmin / Logs | Increase pool size |
| Error rate > 1% | Application logs | Review recent changes |

### PM2 Monitoring

```bash
pm2 status              # Show all instances
pm2 logs gtkblog        # Tail logs
pm2 monit               # Real-time dashboard
```

## Technology Justification

| Choice | Why |
|--------|-----|
| **Next.js 15** | Turbopack for fast dev, RSC for server-side data, App Router standard |
| **Payload CMS 3** | Headless, TypeScript-first, built-in Postgres, same Next.js server |
| **Better Auth** | Modern auth, fewer dependencies, OAuth + email support, session management |
| **Drizzle ORM** | Type-safe, lightweight, direct SQL when needed, no N+1 queries |
| **Stripe + SePay** | Global + local payment options, webhooks, dispute handling |
| **Provider-neutral Email + Resend + React Email** | Resend implemented now, adapter boundary for future providers, type-safe templates, full localization |
| **Tailwind + shadcn/ui** | Composable components, accessible, consistent design system |
| **Vitest** | Fast, ESM-native, lower overhead than Jest, good TypeScript support |
