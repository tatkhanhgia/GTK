# GTKBlog Codebase Summary

> Full-stack Next.js 15 personal tech/AI blog + digital product store with embedded Payload CMS 3, Better Auth 1.5.6, and Stripe + SePay payments.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Framework** | Next.js 15.x (App Router, Turbopack) |
| **Database** | PostgreSQL + Drizzle ORM |
| **CMS** | Payload CMS 3.x (embedded in Next.js) |
| **Auth** | Better Auth 1.5.6 (email/password + Google + GitHub OAuth) |
| **UI Framework** | shadcn/ui (@base-ui/react) + Tailwind CSS v4 |
| **i18n** | next-intl v4 (vi/en routing: `/vi/*`, `/en/*`) |
| **Payment** | Stripe + SePay (VietQR/bank transfer) dual checkout |
| **Email** | Resend + React Email (4 localized templates) |
| **Rich Text Editor** | Payload Lexical (built-in) |
| **Icons** | Lucide React |
| **Testing** | Vitest + React Testing Library |
| **Deployment** | PM2 + Node.js + Docker + Cloudflare CDN |

## Directory Structure

```
src/
├── app/                          # Next.js App Router pages & routes
│   ├── (auth)/                   # Auth routes (no locale prefix)
│   │   ├── login/page.tsx
│   │   ├── register/page.tsx
│   │   ├── forgot-password/page.tsx
│   │   └── reset-password/page.tsx
│   ├── (payload)/                # Payload admin & API (no locale prefix)
│   │   ├── admin/[[...segments]]/page.tsx
│   │   └── api/[...slug]/route.ts
│   ├── api/                      # Custom API routes
│   │   ├── auth/[...all]/route.ts       # Better Auth catch-all
│   │   ├── contact/route.ts             # Contact form (POST, rate-limited 3/60s)
│   │   ├── webhooks/stripe/route.ts     # Stripe webhook handler
│   │   ├── webhooks/sepay/route.ts      # SePay webhook handler
│   │   ├── download/[token]/route.ts    # Secure file download
│   │   ├── payment/status/route.ts      # Payment status polling
│   │   ├── payment/create-sepay-order/route.ts
│   │   └── newsletter/
│   │       ├── subscribe/route.ts
│   │       ├── unsubscribe/route.ts
│   │       └── confirm/route.ts
│   ├── [locale]/                 # Locale-prefixed routes (vi/en)
│   │   ├── blog/                 # Editorial blog hub, post pages, legacy category redirect
│   │   │   ├── page.tsx
│   │   │   ├── [slug]/page.tsx
│   │   │   ├── category/[slug]/page.tsx  # Redirects to ?category={slug}
│   │   │   └── feed.xml/route.ts  # RSS feed
│   │   ├── products/             # Product listing & checkout
│   │   │   ├── page.tsx
│   │   │   ├── [slug]/page.tsx
│   │   │   └── checkout/success/page.tsx
│   │   ├── profile/              # User dashboard (protected)
│   │   │   ├── page.tsx          # Overview
│   │   │   ├── orders/page.tsx   # Order history
│   │   │   ├── downloads/page.tsx # Download manager
│   │   │   └── settings/page.tsx # User settings
│   │   ├── me/                   # Author profile page
│   │   │   └── page.tsx          # Bio, skills, timeline, contact form
│   │   ├── about/page.tsx        # Editorial About page with blog mission, topics, author card
│   │   └── layout.tsx            # Locale layout wrapper
│   ├── layout.tsx                # Root layout
│   ├── page.tsx                  # Home page redirect
│   ├── robots.ts                 # SEO robots.txt
│   └── sitemap.ts                # Dynamic sitemap
│
├── collections/                  # Payload CMS collections
│   ├── users.ts                  # CMS admin users (separate from site users)
│   ├── posts.ts                  # Blog articles
│   ├── categories.ts             # Blog categories
│   ├── products.ts               # Products
│   ├── media.ts                  # Image/file uploads
│   ├── pages.ts                  # Custom pages
│   └── index.ts                  # Collection exports
│
├── globals/                      # Payload CMS globals (singletons)
│   ├── author-profile.ts         # Author bio, skills, timeline, social links
│   └── index.ts                  # Global exports
│
├── scripts/                      # Development & utility scripts
│   ├── seed.ts                   # Seed database with dev data (Payload CMS)
│   └── seed-data.ts              # Bilingual seed data definitions
│
├── components/
│   ├── about/                    # About page editorial sections
│   │   ├── about-hero-section.tsx
│   │   └── topics-grid.tsx
│   ├── blog/                     # Blog-specific components
│   │   ├── rich-text-renderer.tsx
│   │   ├── table-of-contents.tsx
│   │   ├── share-buttons.tsx
│   │   ├── comment-section.tsx
│   │   └── featured-post-hero.tsx
│   ├── me/                       # Author profile page components
│   │   ├── bio-section.tsx       # Author bio with avatar
│   │   ├── skills-grid.tsx       # Skills in grid layout
│   │   ├── timeline-section.tsx  # Career/milestone timeline
│   │   └── contact-form.tsx      # Contact form with rate limit feedback
│   ├── products/                 # Product components
│   │   ├── payment-buttons.tsx   # Stripe + SePay toggles
│   │   └── sepay-qr-modal.tsx    # QR code display
│   ├── layout/                   # Layout components
│   │   ├── navbar.tsx            # Sticky header (includes /me link)
│   │   ├── sidebar.tsx           # Content sidebar (categories, TOC)
│   │   └── footer.tsx            # Footer
│   └── ui/                       # shadcn-based components
│       ├── button.tsx
│       ├── card.tsx
│       ├── input.tsx
│       ├── form.tsx
│       ├── dialog.tsx
│       ├── theme-toggle.tsx      # Dark/light mode
│       ├── author-mini-card.tsx  # Shared author summary CTA for about/blog
│       ├── blog-card.tsx         # Blog listing card
│       ├── category-badge.tsx    # Category links for query-param filtering
│       ├── newsletter-section.tsx # Subscription CTA wired to newsletter API
│       ├── product-card.tsx      # Product grid card
│       ├── search-input.tsx      # Client-side blog search field shell
│       └── ...
│
├── admin/                        # Payload admin custom surface
│   ├── styles/                   # Anthropic-inspired theme vars & overrides
│   │   ├── admin-theme.css        # CSS variables for dark/light tokens
│   │   └── component-overrides.css # Payload component overrides for sidebar, tables, forms
│   ├── hooks/                    # Theme utilities
│   │   └── use-system-theme.ts    # System theme detection hook (prefers-color-scheme)
│   ├── components/               # Theme-aware UI primitives & layouts
│   │   ├── providers/
│   │   │   └── theme-provider.tsx # Theme context provider toggling .admin-dark
│   │   ├── layout/
│   │   │   ├── custom-sidebar.tsx
│   │   │   └── custom-header.tsx
│   │   ├── ui/
│   │   │   └── card.tsx
│   │   └── views/
│   │       └── custom-dashboard.tsx # Anthropic-style dashboard home view
│   └── testing-checklist.md      # QA checklist for admin UI (colors, layout, accessibility)
│
├── db/
│   ├── index.ts                  # Drizzle client
│   └── schema/                   # Custom tables (non-Payload)
│       ├── orders.ts             # E-commerce orders
│       ├── order-items.ts        # Order line items
│       ├── comments.ts           # Blog comments
│       ├── newsletter.ts         # Newsletter subscribers
│       ├── user-profiles.ts      # Extended user data
│       ├── download-tokens.ts    # Secure download links
│       └── index.ts              # Schema exports
│
├── lib/                          # Business logic & utilities
│   ├── auth/
│   │   ├── auth-config.ts        # Better Auth instance
│   │   ├── auth-client.ts        # Client-side auth hooks
│   │   └── auth-helpers.ts       # Session helpers, role checks
│   ├── blog/
│   │   ├── get-posts.ts          # Fetch posts from Payload
│   │   ├── get-post-by-slug.ts   # Single post with comments
│   │   ├── get-categories.ts     # Categories with post counts
│   │   └── comments-actions.ts   # Server actions for comments
│   ├── products/
│   │   ├── get-products.ts       # Fetch products from Payload
│   │   └── get-product-by-slug.ts
│   ├── payment/
│   │   ├── stripe-checkout.ts    # Stripe session creation
│   │   ├── sepay-qr.ts           # SePay QR code generation
│   │   ├── create-order.ts       # Store order in DB
│   │   ├── fulfill-order.ts      # Process after payment
│   │   └── download-token.ts     # Secure token generation (48h expiry)
│   ├── profile/
│   │   ├── get-user-orders.ts    # Order history
│   │   ├── get-user-downloads.ts # Available downloads
│   │   └── update-profile-action.ts
│   ├── author/
│   │   └── get-author-profile.ts # Fetch author-profile global from Payload
│   ├── email/
│   │   ├── resend-client.ts      # Resend email service
│   │   ├── send-email.ts         # Generic email function (supports replyTo param)
│   │   └── newsletter-actions.ts # Subscribe/unsubscribe
│   ├── seo/
│   │   ├── structured-data.ts    # JSON-LD helpers
│   │   └── metadata-helpers.ts   # Dynamic metadata
│   ├── rate-limit.ts             # Upstash rate limiting (auth, payment, contact)
│   └── utils.ts                  # Common helpers (cn, formatDate, etc.)
│
├── i18n/
│   ├── config.ts                 # Supported locales & routing
│   ├── routing.ts                # next-intl routing config
│   ├── request.ts                # Server-side i18n request
│   └── navigation.ts             # Locale-aware navigation helpers
│
├── middleware.ts                 # Auth + i18n middleware chain
│
├── email/                        # Email templates (React Email)
│   ├── welcome-email.tsx         # Localized welcome
│   ├── order-confirmation-email.tsx
│   ├── password-reset-email.tsx
│   ├── newsletter-post-email.tsx
│   └── contact-notification.tsx  # Contact form notification to author
│
└── types/                        # Shared TypeScript types
    ├── auth.ts
    ├── blog.ts
    ├── payment.ts
    └── index.ts

messages/
├── vi.json                       # Vietnamese translations
└── en.json                       # English translations

tests/
├── lib/auth/auth-helpers.test.ts
├── lib/payment/download-token.test.ts
├── api/webhooks/stripe-webhook.test.ts
└── ...                           # ~37 total tests

Configuration Files
├── payload.config.ts             # Payload CMS config (PostgreSQL, collections, globals)
├── next.config.ts                # Next.js config + Payload integration
├── drizzle.config.ts             # Drizzle migrations
├── tailwind.config.ts            # Tailwind + custom theme
├── tsconfig.json                 # TypeScript config
├── vitest.config.ts              # Test runner config
├── .env.example                  # Required environment variables
├── Dockerfile                    # Multi-stage Node.js 22 image
├── docker-compose.yml            # PostgreSQL + app containers
└── ecosystem.config.js           # PM2 cluster config (2 instances)
```

## Key Architecture Decisions

### 1. **Embedded Payload CMS**
- Payload runs within Next.js server (no separate CMS server)
- Single PostgreSQL database for both Payload and custom tables
- Payload collections: Users (CMS admins), Posts, Products, Categories, Media, Pages
- Admin dashboard at `/admin`

### 2. **Dual Database Layer**
- **Payload DB:** Uses internal Drizzle adapter via `@payloadcms/db-postgres`
  - Manages Payload collections (posts, products, users, categories, etc.)
  - Access via Payload SDK in server components
- **Custom Tables:** Direct Drizzle client at `src/db/index.ts`
  - Orders, comments, newsletter, user profiles, download tokens
  - Direct SQL queries for high-performance reads
  - Reasoning: Avoid dual-version Drizzle conflict; use Payload's internal ORM for CMS

### 3. **Better Auth Separation**
- Better Auth manages completely separate tables (`ba_users`, `ba_sessions`, etc.)
- Site users ≠ CMS admin users
- Payload `Users` collection is CMS-only
- Better Auth handles customer login/registration
- Cookie prefix: `gtkblog` (for domain isolation)

### 4. **Middleware Chain**
- `src/middleware.ts`: Auth + i18n orchestration
  1. Detects protected routes (`/profile`, `/checkout`, `/downloads`)
  2. Checks for Better Auth session cookie
  3. Redirects to locale-aware login if missing
  4. Delegates i18n routing (locale detection, prefix enforcement) to `next-intl`
- Respects locale prefix: `/vi/profile`, `/en/checkout`
- Skips auth for: `/admin/*`, `/api/*`, `/_next/*`, static assets

### 5. **Author Content Reuse**
- `src/lib/author/get-author-profile.ts` fetches the Payload `author-profile` global for localized author metadata
- `/[locale]/me`, `/[locale]/about`, and `/[locale]/blog` reuse the same author source instead of duplicating profile content
- `AuthorMiniCard` standardizes the author CTA in compact and full variants

### 6. **Editorial Content Routing**
- `/[locale]/about` combines static editorial sections with rich text pulled from the `pages` collection slug `about`
- `/[locale]/blog` now acts as the canonical category-browsing surface via `?category={slug}` query params
- Legacy `/[locale]/blog/category/[slug]` requests are redirected server-side to the query-param listing URL

### 7. **i18n Architecture**
- **Routing:** `/vi/*` for Vietnamese, `/en/*` for English
- **Default:** Vietnamese (`vi`)
- **Fallback:** Enable (use vi if en missing)
- **Server-side:** `getRequestConfig()` from `src/i18n/request.ts`
- **Client-side:** `next-intl` translation hooks in locale-aware React components
- **Messages:** Separate JSON files in `messages/`

### 8. **Payment Strategy**
- **Stripe:** Primary USD/foreign currency checkout
  - Server-side session creation
  - Webhook at `/api/webhooks/stripe`
- **SePay:** Secondary VietQR/bank transfer
  - QR modal on product page
  - Webhook at `/api/webhooks/sepay`
- **Download Security:** Opaque tokens (not JWT)
  - 48-hour expiry
  - Single-use per token request
  - Stored in `download_tokens` table with `created_at`, `expires_at`

### 9. **Authentication Flow**
```
User Login → Better Auth → ba_users table → Session Cookie (gtkblog.session_token)
  ↓
Middleware checks cookie on protected routes
  ↓
User Profile → user_profiles table (extended data, preferences)
  ↓
Orders/Downloads → Linked via user ID
```

### 10. **Email & Localization**
- **Resend service:** Single API for all email
- **React Email templates:** Four types
  1. Welcome (on signup)
  2. Order confirmation (after payment)
  3. Password reset (reset flow)
  4. Newsletter notification (new posts)
- **Language:** Matched to user's locale preference
- **Send from:** Single verified sender (env: `RESEND_FROM_EMAIL`)

## Design System Integration

- **Color Palette:** Warm coral (#D97757), terracotta accents (#C4713E), cream backgrounds
- **Typography:** Space Grotesk (headings), Be Vietnam Pro (body), JetBrains Mono (code)
- **Spacing:** 4px base unit (4, 8, 12, 16, 20, 24, 32, 48, 64, 80px)
- **Breakpoints:** sm (640), md (768), lg (1024), xl (1280), 2xl (1536)
- **Accessibility:** 4.5:1 contrast, 44px touch targets, focus rings, semantic HTML

See `design-guidelines.md` for comprehensive style documentation.

## Development Workflow

```bash
# Install dependencies
npm install

# Set up environment
cp .env.example .env.local
# Fill in: DATABASE_URL, PAYLOAD_SECRET, OAuth keys, payment keys, email key

# Run database migrations (Payload + custom tables)
npm run drizzle:migrate

# Seed development data (categories, posts, products, pages)
npm run seed

# Start dev server (with Turbopack)
npm run dev

# Run tests
npm test

# Build for production
npm run build

# Start PM2 cluster (2 instances)
pm2 start ecosystem.config.js --env production
```

### Development Scripts

| Script | Command | Purpose |
|--------|---------|---------|
| **seed** | `npm run seed` (via `tsx src/scripts/seed.ts`) | Populate development database with bilingual sample data (categories, blog posts, products, pages, author profile) |
| **dev** | `npm run dev` | Start Next.js dev server with Turbopack |
| **build** | `npm run build` | Production build with Turbopack optimization |
| **test** | `npm run test` | Run unit tests with Vitest |
| **test:watch** | `npm run test:watch` | Run tests in watch mode |
| **test:coverage** | `npm run test:coverage` | Run tests with coverage report |
| **lint** | `npm run lint` | Run ESLint code quality checks |

## Performance & Security

- **Build:** Turbopack for fast dev iteration
- **Edge:** Middleware at network edge (locale detection, auth checks)
- **Rate Limiting:** Upstash for API endpoints (auth, newsletter, payments)
- **SQL Injection:** Parameterized queries via Drizzle
- **CSRF:** Built-in Next.js Server Actions
- **Password:** Argon2 (Better Auth default)
- **Download Tokens:** Cryptographically secure, short-lived, non-reusable

## Deployment Architecture

```
┌─ Docker Build
│  ├─ Stage 1: Prod dependencies (package.json)
│  ├─ Stage 2: Full build with Turbopack
│  └─ Stage 3: Minimal runtime (node_modules + .next/standalone)
├─ Node.js 22 Alpine
├─ PM2 Cluster (2 instances, auto-restart, memory limit 512MB)
└─ CDN: Cloudflare (static assets, caching)
```

- Non-root user: `nextjs` (uid 1001)
- Port: 3000 (configurable via NODE_PORT)
- Logs: PM2 writes to `./logs/pm2-*.log`

See `deployment-guide.md` for step-by-step setup.
