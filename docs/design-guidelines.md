# GTKBlog Design Guidelines

> Personal tech/AI blog + digital product store. Warm, professional, Anthropic-inspired — approachable yet authoritative.

## 1. Color System

### Light Mode
| Token | Value | Usage |
|-------|-------|-------|
| `--background` | `#FAF8F5` | Page background (warm off-white/cream) |
| `--foreground` | `#1A1715` | Primary text (warm dark) |
| `--card` | `#FFFFFF` | Card/surface background |
| `--card-foreground` | `#2C2825` | Card text |
| `--primary` | `#D97757` | Brand coral — CTAs, links, highlights |
| `--primary-foreground` | `#FFFFFF` | Text on primary |
| `--secondary` | `#F0EBE4` | Secondary surfaces, tags |
| `--secondary-foreground` | `#5C554D` | Secondary text |
| `--accent` | `#C4713E` | Accent terracotta — badges, emphasis |
| `--accent-foreground` | `#FFFFFF` | Text on accent |
| `--muted` | `#F0EBE4` | Muted backgrounds |
| `--muted-foreground` | `#8A817A` | Muted text, captions |
| `--border` | `#E5DED5` | Borders, dividers |
| `--ring` | `#D97757` | Focus rings |
| `--destructive` | `#D94F4F` | Errors, delete actions |
| `--success` | `#3D8B6E` | Success states |
| `--warning` | `#D4952B` | Warning states, ratings |

### Dark Mode
| Token | Value | Usage |
|-------|-------|-------|
| `--background` | `#1A1614` | Page background (warm dark) |
| `--foreground` | `#F0EBE4` | Primary text |
| `--card` | `#241F1C` | Card/surface background |
| `--card-foreground` | `#E0D8CF` | Card text |
| `--primary` | `#E09070` | Brand coral (lighter for dark) |
| `--primary-foreground` | `#1A1614` | Text on primary |
| `--secondary` | `#2E2824` | Secondary surfaces |
| `--secondary-foreground` | `#A69E96` | Secondary text |
| `--accent` | `#E0955E` | Accent terracotta (lighter for dark) |
| `--accent-foreground` | `#1A1614` | Text on accent |
| `--muted` | `#2E2824` | Muted backgrounds |
| `--muted-foreground` | `#7A726A` | Muted text |
| `--border` | `#3A332E` | Borders |
| `--ring` | `#E09070` | Focus rings |

### Gradient Accents
- Hero gradient: `linear-gradient(135deg, #D97757 0%, #C4713E 100%)`
- Card hover glow: `0 0 20px rgba(217, 119, 87, 0.12)`
- Text gradient (brand): `linear-gradient(135deg, #D97757, #C4713E)` with `-webkit-background-clip: text`
- Warm ambient glow: `radial-gradient(circle, rgba(217,119,87,0.06) 0%, transparent 70%)`

## 2. Typography

### Font Stack
- **Heading:** `Space Grotesk` (400, 500, 600, 700) — Distinctive geometric, tech-forward, Vietnamese support
- **Body:** `Be Vietnam Pro` (300, 400, 500, 600) — Neo-grotesk, optimized Vietnamese diacritics
- **Code:** `JetBrains Mono` (400, 500) — Developer-oriented monospace

### Google Fonts Import
```
https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Be+Vietnam+Pro:ital,wght@0,300;0,400;0,500;0,600;1,400&family=JetBrains+Mono:wght@400;500&display=swap&subset=vietnamese
```

### Type Scale (Desktop / Mobile)
| Level | Size (D/M) | Weight | Line Height | Font |
|-------|-----------|--------|-------------|------|
| Display | 56/36px | 700 | 1.1 | Space Grotesk |
| H1 | 40/30px | 700 | 1.2 | Space Grotesk |
| H2 | 32/24px | 600 | 1.25 | Space Grotesk |
| H3 | 24/20px | 600 | 1.3 | Space Grotesk |
| H4 | 20/18px | 500 | 1.4 | Space Grotesk |
| Body LG | 18/16px | 400 | 1.7 | Be Vietnam Pro |
| Body | 16/15px | 400 | 1.65 | Be Vietnam Pro |
| Body SM | 14/13px | 400 | 1.6 | Be Vietnam Pro |
| Caption | 12/12px | 500 | 1.5 | Be Vietnam Pro |
| Code | 14/13px | 400 | 1.6 | JetBrains Mono |

### Vietnamese Typography Notes
- Line height 1.6-1.7 for body text — Vietnamese diacritics need vertical breathing room
- Avoid `text-transform: uppercase` on Vietnamese text (breaks diacritics stacking)
- Test all weights with: `Ắ ằ Ẵ ẵ Ặ ặ Ế ế Ồ ồ Ứ ứ Ự ự`

## 3. Spacing & Grid

### Base Unit: 4px
| Token | Value | Usage |
|-------|-------|-------|
| `--space-1` | 4px | Tight gaps, icon padding |
| `--space-2` | 8px | Inline spacing, small gaps |
| `--space-3` | 12px | Form element padding |
| `--space-4` | 16px | Standard component padding |
| `--space-5` | 20px | Card padding |
| `--space-6` | 24px | Section inner padding |
| `--space-8` | 32px | Component gaps |
| `--space-10` | 40px | Section gaps |
| `--space-12` | 48px | Large section spacing |
| `--space-16` | 64px | Page section breaks |
| `--space-20` | 80px | Hero/feature sections |

### Layout Grid
- **Container max-width:** 1200px (content), 1400px (wide)
- **Columns:** 12-column grid
- **Gutter:** 24px (desktop), 16px (mobile)
- **Side padding:** 24px (desktop), 16px (mobile)

### Breakpoints
| Name | Min-width | Usage |
|------|-----------|-------|
| `sm` | 640px | Large phones landscape |
| `md` | 768px | Tablets |
| `lg` | 1024px | Small desktops |
| `xl` | 1280px | Standard desktops |
| `2xl` | 1536px | Large screens |

## 4. Components

### Buttons
- **Primary:** `bg-primary text-primary-foreground` — rounded-lg, px-6 py-3, font-medium
- **Secondary:** `bg-secondary text-secondary-foreground` — same sizing
- **Ghost:** transparent bg, primary text, hover: secondary bg
- **Border radius:** 8px (default), 12px (large), 9999px (pill)
- **Hover:** Scale 1.02, warm shadow lift, 200ms ease
- **Focus:** 2px ring offset-2, ring-primary
- **Disabled:** opacity-50, cursor-not-allowed

### Cards
- **Border radius:** 12px
- **Shadow (light):** `0 1px 3px rgba(26,23,21,0.06), 0 1px 2px rgba(26,23,21,0.04)`
- **Shadow (dark):** `0 1px 3px rgba(0,0,0,0.3)`
- **Hover:** Translate Y -2px, shadow increase, border-primary/20, 250ms ease
- **Padding:** 24px (desktop), 16px (mobile)

### Form Elements
- **Input height:** 44px (touch-friendly)
- **Border radius:** 8px
- **Border:** 1px solid var(--border), focus: var(--ring)
- **Padding:** 12px 16px

### Navigation
- **Height:** 64px (desktop), 56px (mobile)
- **Style:** Sticky, backdrop-blur-lg, bg-background/80
- **Layout:** Logo left, nav links center, actions right (Anthropic-style)
- **Active link:** Primary color, font-weight 600
- **Mobile:** Hamburger menu with slide-out drawer

### Sidebar (Content)
- **Blog pages:** Categories, popular posts, tags, newsletter
- **Product pages:** Category filters, price range
- **Blog detail:** Sticky table of contents
- **Width:** 280-320px desktop, collapses on mobile

### Tags / Badges
- **Border radius:** 9999px (pill)
- **Padding:** 4px 12px
- **Font size:** 12px, weight 500
- **Variants:** Default (muted bg), Primary (primary/10 bg), Accent (accent/10 bg)

## 5. Icons
- **Library:** Lucide React (shadcn/ui default)
- **Sizes:** 16px (inline), 20px (default), 24px (large), 32px (hero)
- **Stroke width:** 1.75 (default), 2 (emphasis)
- **Color:** Inherit from parent text color

## 6. Animation & Transitions

### Durations
| Token | Value | Usage |
|-------|-------|-------|
| `--duration-fast` | 150ms | Focus, pressed states |
| `--duration-micro` | 200ms | Hover states, toggles |
| `--duration-normal` | 250ms | Cards, links, shared UI |
| `--duration-surface` | 280ms | Sheets, menus, modals |
| `--duration-route` | 320ms | Theme/page view transitions |
| `--duration-section` | 440ms | Section reveal |
| `--duration-reveal` | 380ms | Card/item reveal |
| `--duration-marquee` | 48s | Meaningful ambient strips only |

### Easing
- **Default:** `cubic-bezier(0.4, 0, 0.2, 1)` — smooth deceleration
- **Enter:** `cubic-bezier(0, 0, 0.2, 1)` — elements appearing
- **Exit:** `cubic-bezier(0.4, 0, 1, 1)` — elements leaving

### Standard Animations
- **Section reveal:** opacity 0 to 1, translateY 24px to 0, 440ms
- **Heading reveal:** opacity 0 to 1, translateY 16px to 0, 360ms
- **Card reveal:** opacity 0 to 1, translateY 18px to 0, scale 0.985 to 1, 380ms
- **Card hover:** translateY -2px or subtle opacity/scale response, 250ms; avoid animating shadow on scroll-linked surfaces
- **Button hover:** scale 1.02, warm shadow lift, 200ms
- **Page transition:** opacity crossfade, 300ms
- **Skeleton loading:** pulse animation, 1.5s infinite

### Public Site Motion Contract
- Use `src/lib/motion/motion-presets.ts` for shared Motion values; avoid hardcoded easing/duration in feature components.
- `ScrollReveal` is the default section-level entrance wrapper. It reveals once per component mount and replays naturally when routes remount after reload/navigation.
- Use `preset="heading"` for section headers and `preset="card"` for cards/items so content enters with editorial hierarchy instead of one uniform fade.
- Do not enable scroll-loop replay unless the interaction specifically needs it; use `replayOnScroll` as an explicit opt-in.
- Counters animate once per mount when visible. Under reduced motion, render the final value with no tween.
- Keep editorial reading surfaces stable: avoid animating article paragraphs, code blocks, table-of-contents items, and long body content.

Motion rules: use `cubic-bezier(0.16, 1, 0.3, 1)` for calm editorial entrances. Marquee is allowed only for real topic/resource content, must pause on hover/focus, and must not appear in article bodies.

Avoid `transition-all`, layout property animation, and decorative infinite loops.

### Reduced Motion
```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

Marquee strips become static/wrapping under reduced motion.

## 7. Imagery & Media

### Placeholder Strategy
- Blog thumbnails: 16:9 ratio
- Product images: 4:3 or 1:1 ratio
- Author avatars: 1:1 ratio, rounded-full
- Hero images: Full-width, max-height 600px

### Image Treatment
- Border radius: 12px (cards), 16px (hero)
- Hover: Scale 1.03, 400ms ease
- Lazy loading with skeleton placeholder

### Category Image Gradients (warm tones)
- AI: `linear-gradient(135deg, #D97757, #C4713E)` (coral-terracotta)
- Tech: `linear-gradient(135deg, #5B8C7B, #3D8B6E)` (sage-green)
- Tutorial: `linear-gradient(135deg, #8B7355, #6B5B3E)` (warm brown)
- Opinion: `linear-gradient(135deg, #D4952B, #B8822A)` (warm amber)

## 8. Tailwind Config Reference
```js
// tailwind.config.ts excerpt
{
  theme: {
    extend: {
      fontFamily: {
        heading: ['Space Grotesk', 'sans-serif'],
        body: ['Be Vietnam Pro', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      colors: {
        primary: { DEFAULT: '#D97757', foreground: '#FFFFFF' },
        accent: { DEFAULT: '#C4713E', foreground: '#FFFFFF' },
      },
      borderRadius: {
        DEFAULT: '8px',
        lg: '12px',
        xl: '16px',
      },
    },
  },
}
```

## 9. Accessibility Checklist
- [ ] Color contrast 4.5:1+ (normal text), 3:1+ (large text, UI components)
- [ ] Focus indicators visible on all interactive elements
- [ ] Touch targets minimum 44x44px
- [ ] Alt text on all images
- [ ] Semantic HTML (headings hierarchy, landmarks, ARIA when needed)
- [ ] Skip-to-content link
- [ ] Keyboard navigable
- [ ] prefers-reduced-motion respected
- [ ] Vietnamese diacritics render correctly across all weights
- [ ] prefers-color-scheme for auto dark mode detection
