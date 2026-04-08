<div align="center">
  <a href="#">
    <img src="public/logo-gtkblog-v4.svg" alt="GTKBlog Logo" width="120" height="120">
  </a>

  <h1 align="center">GTKBlog</h1>

  <p align="center">
    <b>Full-stack personal tech blog & digital product store</b>
    <br />
    Built with Next.js 15, Payload CMS 3, and modern web technologies
    <br />
    <a href="#features">Features</a>
    ·
    <a href="#tech-stack">Tech Stack</a>
    ·
    <a href="#getting-started">Getting Started</a>
    ·
    <a href="#architecture">Architecture</a>
  </p>

  <p align="center">
    <img src="https://img.shields.io/badge/Next.js%2015-black?style=for-the-badge&logo=next.js&logoColor=white" alt="Next.js 15">
    <img src="https://img.shields.io/badge/Payload%20CMS%203-black?style=for-the-badge&logo=payloadcms&logoColor=white" alt="Payload CMS 3">
    <img src="https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript">
    <img src="https://img.shields.io/badge/PostgreSQL-4169E1?style=for-the-badge&logo=postgresql&logoColor=white" alt="PostgreSQL">
    <img src="https://img.shields.io/badge/Tailwind%20CSS-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white" alt="Tailwind CSS">
  </p>

  <p align="center">
    <img src="https://img.shields.io/badge/i18n-Vietnamese%20%7C%20English-orange?style=flat-square" alt="i18n">
    <img src="https://img.shields.io/badge/Auth-Better%20Auth-green?style=flat-square" alt="Better Auth">
    <img src="https://img.shields.io/badge/Payment-Stripe%20%7C%20SePay-blueviolet?style=flat-square" alt="Payment">
    <img src="https://img.shields.io/badge/Tests-Vitest-6E9F18?style=flat-square" alt="Vitest">
  </p>
</div>

---

## Features

| Feature | Description |
|---------|-------------|
| **Dual Blog Platform** | Editorial blog hub with featured posts, categories, search, and RSS feed |
| **Digital Store** | Sell digital products with secure downloads and order management |
| **Dual Payment** | Stripe (global) + SePay (VietQR/bank transfer) for maximum flexibility |
| **Multi-language** | Full Vietnamese & English support with `next-intl` |
| **Modern Auth** | Email/password + Google/GitHub OAuth via Better Auth |
| **Admin Dashboard** | Custom Anthropic-inspired Payload admin theme |
| **Email System** | Transactional emails with React Email + Resend |
| **Newsletter** | Subscribe/unsubscribe with email confirmation |
| **Dark Mode** | System-aware dark/light theme throughout |
| **SEO Optimized** | Structured data, sitemap, metadata, and Open Graph |

---

## Tech Stack

### Core Framework
- **[Next.js 15](https://nextjs.org/)** - React framework with App Router & Turbopack
- **[Payload CMS 3](https://payloadcms.com/)** - Headless CMS embedded in Next.js
- **[TypeScript](https://www.typescriptlang.org/)** - Type-safe development

### Database & ORM
- **[PostgreSQL](https://www.postgresql.org/)** - Primary database
- **[Drizzle ORM](https://orm.drizzle.team/)** - Type-safe SQL queries
- **[Better Auth](https://www.better-auth.com/)** - Authentication with separate user tables

### UI & Styling
- **[Tailwind CSS v4](https://tailwindcss.com/)** - Utility-first styling
- **[shadcn/ui](https://ui.shadcn.com/)** - Accessible component primitives
- **[Lucide React](https://lucide.dev/)** - Beautiful icons

### Payments & Services
- **[Stripe](https://stripe.com/)** - International payment processing
- **[SePay](https://sepay.vn/)** - Vietnamese QR/bank transfer
- **[Resend](https://resend.com/)** - Transactional email API
- **[React Email](https://react.email/)** - Type-safe email templates

### Testing & DevOps
- **[Vitest](https://vitest.dev/)** - Fast unit testing
- **[Docker](https://www.docker.com/)** - Containerized deployment
- **[PM2](https://pm2.keymetrics.io/)** - Production process manager

---

## Getting Started

### Prerequisites
- Node.js 22+
- PostgreSQL 14+
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/gtkblog.git
   cd gtkblog
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment**
   ```bash
   cp .env.example .env.local
   ```
   Edit `.env.local` with your credentials:
   ```env
   # Database
   DATABASE_URL=postgresql://user:pass@localhost:5432/gtkblog
   
   # Payload
   PAYLOAD_SECRET=your-secret-key
   
   # Better Auth
   BETTER_AUTH_SECRET=your-auth-secret
   
   # OAuth (optional)
   GOOGLE_CLIENT_ID=your-google-client-id
   GOOGLE_CLIENT_SECRET=your-google-secret
   GITHUB_CLIENT_ID=your-github-client-id
   GITHUB_CLIENT_SECRET=your-github-secret
   
   # Payments
   STRIPE_SECRET_KEY=sk_test_...
   STRIPE_WEBHOOK_SECRET=whsec_...
   SEPAY_API_KEY=your-sepay-key
   SEPAY_WEBHOOK_SECRET=your-sepay-webhook-secret
   
   # Email
   RESEND_API_KEY=re_...
   RESEND_FROM_EMAIL=noreply@yourdomain.com
   ```

4. **Run database migrations**
   ```bash
   npx drizzle-kit migrate
   ```

5. **Seed development data** (optional)
   ```bash
   npm run seed
   ```

6. **Start development server**
   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) - Vietnamese locale
   
   Open [http://localhost:3000/en](http://localhost:3000/en) - English locale
   
   Admin: [http://localhost:3000/admin](http://localhost:3000/admin)

---

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server with Turbopack |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run test` | Run unit tests |
| `npm run test:coverage` | Run tests with coverage report |
| `npm run lint` | Run ESLint |
| `npm run seed` | Seed database with sample data |

---

## Architecture

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
    ├─ Payload tables (posts, products, categories)
    ├─ Better Auth tables (ba_users, ba_sessions)
    └─ Custom tables (orders, comments, newsletter)
    ↓
External Services
    ├─ Stripe (payment processing)
    ├─ SePay (VietQR/bank transfers)
    ├─ Resend (transactional email)
    └─ Google/GitHub OAuth
```

### Key Architecture Decisions

1. **Embedded Payload CMS** - Payload runs within Next.js, no separate CMS server
2. **Dual Database Layer** - Payload uses internal Drizzle, custom tables use direct Drizzle
3. **Better Auth Separation** - Site users ≠ CMS admin users for security
4. **i18n Routing** - `/vi/*` and `/en/*` locale-prefixed routes
5. **Payment Strategy** - Stripe for global, SePay for local Vietnamese payments

Read more in [docs/system-architecture.md](docs/system-architecture.md)

---

## Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Auth routes (login, register)
│   ├── (payload)/         # Payload admin & API
│   ├── (site)/            # Customer-facing routes
│   └── api/               # Custom API routes
├── collections/           # Payload CMS collections
├── components/            # React components
├── db/                    # Drizzle ORM & custom tables
├── lib/                   # Business logic & utilities
├── i18n/                  # Internationalization config
└── email/                 # React Email templates

messages/                  # Translation files
├── vi.json
└── en.json

docs/                      # Documentation
├── codebase-summary.md
├── system-architecture.md
├── deployment-guide.md
└── design-guidelines.md
```

---

## Deployment

### Docker (Recommended)

```bash
# Build and run with Docker Compose
docker-compose up -d
```

### PM2 (Production)

```bash
# Build the application
npm run build

# Start with PM2
pm2 start ecosystem.config.js --env production
```

See [docs/deployment-guide.md](docs/deployment-guide.md) for detailed setup.

---

## Screenshots

| Home | Blog | Product |
|------|------|---------|
| *Homepage with featured content* | *Blog listing with categories* | *Product detail with checkout* |

| Admin Dashboard | Profile | Dark Mode |
|-----------------|---------|-----------|
| *Payload admin with custom theme* | *User dashboard & orders* | *Dark theme throughout* |

---

## Roadmap

- [x] Core blog functionality
- [x] Digital product store
- [x] Dual payment integration (Stripe + SePay)
- [x] Multi-language support (vi/en)
- [x] Better Auth with OAuth
- [x] Newsletter system
- [x] Custom Payload admin theme
- [ ] Mobile app (React Native)
- [ ] Advanced analytics dashboard
- [ ] AI-powered content suggestions

See [docs/project-roadmap.md](docs/project-roadmap.md) for full details.

---

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'feat: add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## Acknowledgments

- [Next.js](https://nextjs.org/) team for the amazing framework
- [Payload CMS](https://payloadcms.com/) for the headless CMS
- [Better Auth](https://www.better-auth.com/) for the authentication solution
- [shadcn/ui](https://ui.shadcn.com/) for the beautiful UI components

---

<div align="center">
  <sub>Built with ❤️ by GTKBlog Team</sub>
</div>
