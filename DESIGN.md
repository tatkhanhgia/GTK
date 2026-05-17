---
name: GTKBlog
description: Warm technical publishing system for developers and AI builders.
colors:
  warm-paper: "#F5F0E8"
  warm-ink: "#141413"
  surface-white: "#FFFFFF"
  surface-cream: "#FAF9F5"
  muted-clay: "#F0EBE4"
  border-stone: "#DDD4C8"
  coral-primary: "#D97757"
  terracotta-accent: "#C86C4D"
  sage-success: "#3D8B6E"
  amber-warning: "#D4952B"
  red-destructive: "#D94F4F"
  dark-paper: "#141413"
  dark-surface: "#1A1A18"
  dark-muted: "#242422"
  dark-border: "#38342F"
  dark-coral: "#E09070"
typography:
  display:
    fontFamily: "Space Grotesk, sans-serif"
    fontSize: "clamp(2.25rem, 5vw, 3.5rem)"
    fontWeight: 700
    lineHeight: 1.1
    letterSpacing: "-0.025em"
  headline:
    fontFamily: "Space Grotesk, sans-serif"
    fontSize: "clamp(1.875rem, 3vw, 2.5rem)"
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: "-0.025em"
  title:
    fontFamily: "Space Grotesk, sans-serif"
    fontSize: "1.5rem"
    fontWeight: 600
    lineHeight: 1.3
    letterSpacing: "-0.025em"
  body:
    fontFamily: "Be Vietnam Pro, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.65
    letterSpacing: "normal"
  label:
    fontFamily: "Be Vietnam Pro, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 500
    lineHeight: 1.5
    letterSpacing: "normal"
  code:
    fontFamily: "JetBrains Mono, monospace"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.6
rounded:
  sm: "8px"
  md: "12px"
  lg: "16px"
  pill: "9999px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "16px"
  lg: "24px"
  xl: "32px"
  section: "64px"
  hero: "80px"
components:
  button-primary:
    backgroundColor: "{colors.coral-primary}"
    textColor: "{colors.surface-white}"
    rounded: "{rounded.sm}"
    padding: "0 10px"
    height: "32px"
    typography: "{typography.label}"
  button-secondary:
    backgroundColor: "{colors.surface-cream}"
    textColor: "{colors.warm-ink}"
    rounded: "{rounded.sm}"
    padding: "0 10px"
    height: "32px"
    typography: "{typography.label}"
  input-default:
    backgroundColor: "{colors.surface-white}"
    textColor: "{colors.warm-ink}"
    rounded: "{rounded.sm}"
    padding: "4px 10px"
    height: "32px"
    typography: "{typography.body}"
  card-default:
    backgroundColor: "{colors.surface-white}"
    textColor: "{colors.warm-ink}"
    rounded: "{rounded.md}"
    padding: "16px"
  badge-primary:
    backgroundColor: "{colors.coral-primary}"
    textColor: "{colors.surface-white}"
    rounded: "{rounded.pill}"
    padding: "2px 8px"
    height: "20px"
    typography: "{typography.label}"
---

# Design System: GTKBlog

## 1. Overview

**Creative North Star: "The Warm Technical Notebook"**

GTKBlog should feel like a careful technical notebook turned into a bilingual publishing and commerce system. The public surfaces are brand-led: calm, warm, editorial, and credible for developers and AI builders. The operational surfaces are product-led: checkout, profile, downloads, settings, and admin should get quieter, denser, and more task-focused.

The system's current voice is professional, simple, and Anthropic-style. Warm paper, coral, terracotta, and restrained dark surfaces create a human technical atmosphere without drifting into decorative SaaS gloss. The brand should feel authored, not generated.

It rejects generic SaaS visual language, decorative glassmorphism, excessive gradients, fake complexity, noisy dashboards, and UI that feels more like a template than a personal technical publication.

**Key Characteristics:**
- Warm technical credibility for developer and AI Builder readers.
- Bilingual readability for Vietnamese and English content.
- Editorial confidence on public pages, operational calm in workflows.
- Restrained coral accents, cream surfaces, and warm dark mode.
- Concrete previews, author context, and useful metadata over vague marketing copy.

## 2. Colors

The palette is warm, restrained, and Anthropic-adjacent: paper neutrals carry most surfaces, coral marks action, terracotta adds emphasis, and sage/amber/red handle status.

### Primary

- **Coral Primary**: The main action color for CTAs, focus rings, links, and highlights. Use it sparingly so it keeps authority.
- **Dark Coral**: The dark-mode action counterpart. It is lighter and warmer so controls remain legible on dark surfaces.

### Secondary

- **Terracotta Accent**: Secondary emphasis for badges, category accents, and brand details. It should support coral, not compete with it.
- **Sage Success**: Success and confirmed states. Use for payment success, completed downloads, and positive status badges.
- **Amber Warning**: Warnings and attention states. Use where the user needs caution, not alarm.
- **Red Destructive**: Destructive and error states. Keep it functional, never decorative.

### Neutral

- **Warm Paper**: Primary light background. This is the default canvas for public reading surfaces.
- **Warm Ink**: Primary text. It is warm black, never pure black.
- **Surface White**: Elevated card and form surface in light mode.
- **Surface Cream**: Secondary navigation, tags, filters, and low-emphasis panels.
- **Muted Clay**: Muted backgrounds and soft grouped areas.
- **Border Stone**: Dividers, card rings, and input borders.
- **Dark Paper**: Primary dark background. It is warm graphite, not cold black.
- **Dark Surface**: Dark card and popover surface.
- **Dark Muted**: Dark secondary surface.
- **Dark Border**: Dark dividers and input borders.

### Named Rules

**The Coral Rarity Rule.** Coral is for action and orientation. If it appears everywhere, it stops guiding users.

**The Warm Neutral Rule.** Never use pure white or pure black as a design decision. GTKBlog's authority comes from warm paper and warm ink.

**The Status Means Status Rule.** Sage, amber, and red are reserved for state. Do not use them as decorative palette fillers.

## 3. Typography

**Display Font:** Space Grotesk, sans-serif
**Body Font:** Be Vietnam Pro, sans-serif
**Label/Mono Font:** Be Vietnam Pro for labels, JetBrains Mono for code

**Character:** The pairing is geometric and readable, with enough technical sharpness for AI/developer content and enough warmth for Vietnamese long-form reading. JetBrains Mono is reserved for code, tokens, command snippets, and technical identifiers.

### Hierarchy

- **Display** (700, clamp 36-56px, 1.1 line height): Homepage and major campaign headlines only.
- **Headline** (700, clamp 30-40px, 1.2 line height): Page titles, article hero titles, and major section leads.
- **Title** (600, 24px, 1.3 line height): Card titles, panel headings, product sections, and dashboard section headers.
- **Body** (400, 16px, 1.65 line height): Article excerpts, product copy, forms, checkout explanation, and profile copy. Cap long-form lines at 65-75ch.
- **Label** (500, 14px, 1.5 line height): Navigation, badges, form labels, metadata, and compact UI.
- **Code** (400, 14px, 1.6 line height): Inline code, command snippets, and developer artifacts.

### Named Rules

**The Vietnamese Breathing Rule.** Body text must keep generous line height. Vietnamese diacritics need vertical room, especially in rich text and admin editors.

**The Mono Is Evidence Rule.** Mono is allowed for code and identifiers only. Do not use monospace as lazy shorthand for "developer".

**The No Uppercase Body Rule.** Use uppercase only for tiny labels when necessary. Never uppercase Vietnamese body copy.

## 4. Elevation

GTKBlog uses a hybrid of tonal layering, thin borders, and soft shadows. Public pages should feel almost flat at rest, with lift appearing on hover or focused interaction. Admin and product surfaces can use more structural separation, but still avoid heavy shadows.

### Shadow Vocabulary

- **Card Rest** (`0 1px 3px rgba(26,23,21,0.06), 0 1px 2px rgba(26,23,21,0.04)`): Quiet separation for public cards.
- **Warm Glow** (`0 0 20px rgba(217,119,87,0.12)`): Rare accent response for brand emphasis and hover polish.
- **Admin Low** (`0 1px 2px rgba(24,21,18,0.05), 0 10px 24px rgba(24,21,18,0.04)`): Baseline admin panel lift.
- **Admin Medium** (`0 16px 38px rgba(24,21,18,0.09), 0 6px 14px rgba(24,21,18,0.06)`): Menus, drawers, and active admin panels.
- **Admin High** (`0 24px 54px rgba(24,21,18,0.14), 0 12px 28px rgba(24,21,18,0.08)`): Modals and high-priority overlays.

### Named Rules

**The Flat Until Invited Rule.** Surfaces are calm at rest. Elevation appears when the user interacts or when hierarchy must be unmistakable.

**The No Plastic Shadow Rule.** If a shadow feels gray, cold, or like a 2014 app card, remove it or warm it.

## 5. Components

### Buttons

- **Shape:** Gently curved rectangle (8px radius), pill only when the surrounding pattern already uses pills.
- **Primary:** Coral background with surface-white text, 32px default height, compact horizontal padding. Use for login, checkout, subscribe, buy, and primary submit actions.
- **Hover / Focus:** Hover darkens or softens the coral response. Focus uses a 3px ring at 50% primary opacity and a visible border shift.
- **Secondary / Ghost / Outline:** Secondary uses warm cream; ghost is transparent until hover; outline uses the border token. Use these for navigation, filters, language switchers, and low-risk actions.

### Chips

- **Style:** Pill shape, 20px height, small label typography. Primary chips use coral; secondary chips use cream and warm secondary text.
- **State:** Selected filters should change background and text together. Do not rely on color alone; pair with text, count, icon, or position.

### Cards / Containers

- **Corner Style:** Soft rounded corners (12px). Hero media may use 16px when it needs a stronger editorial frame.
- **Background:** Public cards use surface white on warm paper; grouped sections use surface cream or muted clay.
- **Shadow Strategy:** Ring and tonal layering first, shadow second. Hover can translate up slightly but should not become bouncy.
- **Border:** Thin warm stone borders or rings. Avoid colored side-stripe borders.
- **Internal Padding:** 16px for compact cards, 24px for editorial cards and product cards.

### Inputs / Fields

- **Style:** 32px default input height in compact components, 44px target height in forms that users complete directly. Border uses border-stone, background stays transparent or surface white depending on density.
- **Focus:** Border changes to coral ring and a 3px translucent focus halo.
- **Error / Disabled:** Error uses destructive red with a translucent red ring. Disabled fields lower opacity and remove pointer interaction.

### Navigation

Navigation is sticky, warm, and translucent: 64px desktop height, border-bottom, background at 80% opacity, and backdrop blur. Desktop keeps the logo left, nav center, and actions right. Mobile collapses to a drawer with large touch targets.

Active and hover states must stay quiet. Use muted backgrounds and foreground shifts before adding more coral.

### Signature Component

**Editorial Resource Card.** Blog cards, product cards, author mini-cards, and newsletter modules should reveal concrete value: title, category, product type, excerpt, useful metadata, and one clear next action. Avoid generic icon-heading-text grids.

## 6. Do's and Don'ts

### Do:

- **Do** use warm paper, warm ink, coral, and terracotta as the default brand vocabulary.
- **Do** switch to a product register for checkout, profile, downloads, settings, and admin.
- **Do** keep Vietnamese and English text comfortable with generous line height and stable layout.
- **Do** use real article/product metadata, previews, author context, and concrete technical details.
- **Do** keep focus rings visible and touch targets at least 44px where users are completing tasks.
- **Do** respect reduced motion. Article bodies, code blocks, and checkout steps must stay stable.

### Don't:

- **Don't** use generic SaaS visual language.
- **Don't** use decorative glassmorphism.
- **Don't** use excessive gradients.
- **Don't** fake complexity with noisy dashboards or meaningless metrics.
- **Don't** create UI that feels more like a template than a personal technical publication.
- **Don't** let Anthropic-style become an excuse for bland cream cards everywhere.
- **Don't** use gradient text.
- **Don't** use colored side-stripe borders thicker than 1px.
- **Don't** nest cards inside cards.
- **Don't** use modals as the first answer when inline or progressive disclosure would work.
