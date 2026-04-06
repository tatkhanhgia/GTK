# GTKBlog System Architecture

> Embedded Next.js 15 + Payload CMS 3 with Better Auth, dual payment processors, and i18n-aware middleware.

## High-Level Architecture

```
Client (Browser)
    ↓
Cloudflare CDN (static assets)
    ↓
Next.js Server (Node.js 22)
    ├─ Middleware (auth + i18n)
    ├─ App Router (pages & routes)
    ├─ Payload Admin & API
    └─ Better Auth (session management)
    ↓
PostgreSQL Database
    ├─ Payload tables (posts, products, categories, users)
    ├─ Better Auth tables (ba_users, ba_sessions, etc.)
    └─ Custom tables (orders, comments, newsletter, download_tokens)
    ↓
External Services
    ├─ Stripe (payment processing)
    ├─ SePay (VietQR, bank transfers)
    ├─ Resend (transactional email)
    └─ Google/GitHub OAuth
```

## Authentication & Authorization

### Better Auth Flow

```
POST /api/auth/register
    ↓
Better Auth validates credentials
    ↓
Hash password (Argon2), create ba_users record
    ↓
Generate session, set gtkblog.session_token cookie
    ↓
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
/[locale]/profile/*          → Requires session
/[locale]/checkout/*         → Requires session
/[locale]/downloads/*        → Requires session
/api/auth/change-password    → Requires session
/api/newsletter/unsubscribe  → Requires email (from query param)
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
├─ id, email, password_hash, role, created_at
├─ Keys: PK(id), UNIQUE(email)

author-profile (singleton global)
├─ bio, avatar_url, email, skills (array), social_links (array)
├─ timeline (array: year, title, description)
├─ Keys: PK(id), single record

posts
├─ id, title, slug, content (Lexical), excerpt
├─ published, published_at, updated_at
├─ category_id (FK → categories.id)
├─ author_id (FK → users.id)
├─ meta_description, canonical_url
├─ Keys: PK(id), UNIQUE(slug), INDEX(published_at, category_id)

products
├─ id, title, slug, description, price_usd, price_vnd
├─ stripe_product_id, featured, active
├─ downloads (media array reference)
├─ Keys: PK(id), UNIQUE(slug), INDEX(stripe_product_id)

categories
├─ id, name, slug, description
├─ Keys: PK(id), UNIQUE(slug)

media (uploaded files)
├─ id, filename, url, size, mime_type
├─ created_at, updated_at
├─ Keys: PK(id)

pages (custom static pages)
├─ id, title, slug, content, published
├─ Keys: PK(id), UNIQUE(slug)
```

#### Better Auth Tables
Managed by Better Auth plugin; separate from Payload:
```
ba_users
├─ id, email, name, emailVerified, image, role
├─ created_at, updated_at
├─ Keys: PK(id), UNIQUE(email)

ba_sessions
├─ id, userId (FK → ba_users.id), token, expiresAt
├─ Keys: PK(id), FK(userId), INDEX(expiresAt)

ba_accounts (OAuth)
├─ id, userId (FK → ba_users.id), provider, providerAccountId
├─ Keys: PK(id), FK(userId), UNIQUE(provider, providerAccountId)

ba_verifications
├─ id, identifier, value, expiresAt
├─ Keys: PK(id)
```

#### Custom Tables (Drizzle)
Direct queries via `src/db/index.ts`:
```
user_profiles (extended user data)
├─ id (FK → ba_users.id)
├─ bio, avatar_url, locale (vi|en), theme (light|dark)
├─ stripe_customer_id, newsletter_subscribed
├─ created_at, updated_at
├─ Keys: PK(id), UNIQUE(stripe_customer_id)

orders
├─ id, user_id (FK → ba_users.id)
├─ total_usd, total_vnd, currency (usd|vnd)
├─ payment_method (stripe|sepay), status (pending|completed|failed)
├─ stripe_payment_intent_id, sepay_transaction_id
├─ created_at, completed_at
├─ Keys: PK(id), FK(user_id), INDEX(user_id, created_at), UNIQUE(stripe_payment_intent_id)

order_items
├─ id, order_id (FK → orders.id), product_id (FK → products.id)
├─ quantity, price_usd, price_vnd
├─ Keys: PK(id), FK(order_id, product_id)

comments
├─ id, post_id (FK → posts.id), user_id (FK → ba_users.id)
├─ content, approved, created_at, updated_at
├─ Keys: PK(id), FK(post_id, user_id), INDEX(post_id, approved)

download_tokens
├─ id (nanoid), user_id (FK → ba_users.id), product_id (FK → products.id)
├─ token (crypto-secure), created_at, expires_at
├─ downloaded_at (nullable)
├─ Keys: PK(id), FK(user_id), UNIQUE(token), INDEX(expires_at)

newsletter
├─ id, email, subscribed_at, unsubscribed_at, confirmed_at
├─ locale (vi|en), created_at, updated_at
├─ Keys: PK(id), UNIQUE(email), INDEX(subscribed_at)
```

### Data Access Patterns

| Layer | Method | Usage |
|-------|--------|-------|
| **Payload Collections** | Payload SDK in server components | Blog posts, products, categories, media, about-page content |
| **Payload Global** | `getAuthorProfile(locale)` helper | Localized author identity reused across `/me`, `/about`, and `/blog` |
| **Custom Tables** | Drizzle ORM in server actions/functions | Orders, comments, profiles, tokens |
| **Direct SQL** | `db.execute()` for complex queries | Aggregations (post counts, order totals) |

## Request Routing

### Locale-Aware Routing

```
/              → Detect browser locale → Redirect to /vi or /en
/vi/blog       → Vietnamese editorial blog hub (?category=slug, featured hero, newsletter CTA)
/en/blog       → English editorial blog hub
/vi/blog/category/[slug] → Legacy category URL, redirected to /vi/blog?category={slug}
/en/blog/category/[slug] → Legacy category URL, redirected to /en/blog?category={slug}
/vi/about      → About page with editorial sections, CMS rich text, and author CTA
/en/about      → About page (English)
/vi/products   → Vietnamese products
/vi/me         → Author profile (bio, skills, timeline, contact)
/en/me         → Author profile (English)
/admin         → Payload admin (no locale)
/api/auth      → Better Auth (no locale)
```

**Middleware Flow:**
```typescript
1. Request arrives → middleware.ts
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

## Payment Processing

### Stripe Checkout Flow

```
User clicks "Buy with Stripe"
    ↓
Server creates Stripe session
    ├─ product_id, user_id, locale
    ├─ success_url: /[locale]/products/checkout/success
    ├─ cancel_url: /[locale]/products/[slug]
    ↓
Redirect to Stripe Hosted Checkout
    ↓
User completes payment
    ↓
Stripe sends webhook → /api/webhooks/stripe
    ├─ Verify signature (STRIPE_WEBHOOK_SECRET)
    ├─ Create order in orders table
    ├─ Generate download_token with 48h expiry
    ├─ Send order confirmation email (localized)
    ↓
User sees success page, can download immediately
```

### SePay QR Flow

```
User selects "VietQR / Bank Transfer"
    ↓
Modal shows SePay-generated QR code
    ├─ Account: SEPAY_BANK_ACCOUNT
    ├─ Amount: product price in VND
    ├─ Message: "Order {orderId}"
    ↓
User scans with banking app
    ↓
Webhook → /api/webhooks/sepay
    ├─ Verify signature (SEPAY_WEBHOOK_SECRET)
    ├─ Update order status to completed
    ├─ Generate download_token
    ├─ Send email
    ↓
Polling endpoint /api/payment/status
    └─ Client checks every 5s if payment received
```

**Payment Status Flow:**
```
pending → [webhook received] → completed → [token valid until 48h]
        → [webhook not received] → expires (7-day default)
```

## Email Architecture

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
    ↓
lib/email/send-email.ts
    ├─ Load template component
    ├─ Render to HTML
    ├─ Call Resend API
    ├─ Log result
    ↓
Resend sends via RESEND_FROM_EMAIL
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
/vi/*   → Vietnamese
/en/*   → English
/       → Detect locale → Redirect to /vi or /en
        → Fallback to /vi if unrecognized
```

### Translation File Structure

```
messages/
├── vi.json          # Vietnamese strings (all keys)
└── en.json          # English strings (can have subset if fallback enabled)
```

**Keys Example:**
```json
{
  "nav.home": "Trang chủ",
  "nav.blog": "Blog",
  "blog.no-posts": "Chưa có bài viết",
  "payment.stripe": "Thanh toán bằng Stripe",
  "email.welcome-subject": "Chào mừng bạn đến với GTKBlog"
}
```

### Server-side Translation

```typescript
import { getTranslations } from 'next-intl/server'

export default async function Page() {
  const t = await getTranslations('blog')
  return <h1>{t('title')}</h1>  // "Danh sách bài viết"
}
```

### Client-side Translation

```typescript
'use client'
import { useTranslations } from 'next-intl'

export function BlogCard() {
  const t = useTranslations('blog')
  return <h2>{t('read-more')}</h2>  // "Đọc tiếp"
}
```

## Download Security

### Token Generation & Verification

```
User completes payment
    ↓
Webhook generates nanoid (21 chars)
    ├─ Stored in download_tokens table
    ├─ created_at: now
    ├─ expires_at: now + 48 hours
    ├─ downloaded_at: null
    ↓
Email sent with link: /api/download/[token]
    ↓
GET /api/download/[token]
    ├─ Verify token exists
    ├─ Verify not expired (expires_at > now)
    ├─ Verify user owns product
    ├─ Set downloaded_at = now
    ├─ Return file stream
    ↓
Token can be used only once (downloaded_at check)
```

**Security Measures:**
- Opaque tokens (not JWTs — can't be decoded/forged)
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
├─ Cache static assets forever (images, fonts, CSS, JS)
├─ Cache HTML pages 1 hour
├─ Don't cache /api/*, /admin/*, /[locale]/profile/*
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
POST /api/auth/register       → 5 per day per IP
POST /api/auth/login          → 10 per hour per IP
POST /api/newsletter/subscribe → 100 per day per IP
POST /api/payment/create-*    → 50 per hour per user
POST /api/contact             → 3 per 60 seconds per IP
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
┌─ DNS (Cloudflare)
│  └─ CNAME → Load Balancer (or direct IP)
│
├─ Load Balancer (optional)
│  ├─ Health check: GET /
│  └─ Route to PM2 instances
│
├─ PM2 Cluster (2 instances)
│  ├─ Instance 1: Node.js 22 Alpine
│  │  └─ `next start` (port 3000, internal)
│  └─ Instance 2: Node.js 22 Alpine
│     └─ `next start` (port 3000, internal)
│
├─ Reverse Proxy (Nginx or similar)
│  └─ Port 80/443 → PM2 instances (localhost:3000)
│
├─ PostgreSQL (AWS RDS / DigitalOcean / Self-hosted)
│  └─ Connection pooling (optional: pgBouncer)
│
└─ CDN (Cloudflare)
   └─ Cache static assets
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
| **Resend + React Email** | Type-safe email templates, preview mode, full localization |
| **Tailwind + shadcn/ui** | Composable components, accessible, consistent design system |
| **Vitest** | Fast, ESM-native, lower overhead than Jest, good TypeScript support |

