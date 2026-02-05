# Monarch Gallery Design System

A comprehensive design system for maintaining visual consistency across the platform.

## Core Principles

1. **Editorial Aesthetic** - Museum-grade, cinematic presentation
2. **Semantic Tokens** - Never use raw colors; always reference design tokens
3. **Purposeful Animation** - Every motion serves UX, not decoration
4. **Typography Hierarchy** - Serif for headings, sans-serif for body

---

## Colors

All colors use HSL format and are defined in `src/index.css`. Never use hardcoded colors in components.

### Light Mode

| Token | Purpose | CSS Variable |
|-------|---------|--------------|
| `background` | Page background | `--background: 40 20% 98%` |
| `foreground` | Primary text | `--foreground: 30 10% 12%` |
| `primary` | CTAs, links | `--primary: 30 10% 12%` |
| `secondary` | Secondary actions | `--secondary: 35 10% 94%` |
| `muted` | Disabled states | `--muted: 35 8% 92%` |
| `accent` | Highlights (bronze) | `--accent: 32 35% 42%` |
| `destructive` | Errors, warnings | `--destructive: 0 65% 50%` |

### Dark Mode

| Token | Purpose | CSS Variable |
|-------|---------|--------------|
| `background` | Page background | `--background: 30 8% 8%` |
| `foreground` | Primary text | `--foreground: 35 12% 92%` |
| `primary` | CTAs, links | `--primary: 35 12% 92%` |
| `accent` | Highlights (gold) | `--accent: 35 28% 48%` |

### Usage

```tsx
// ✅ Correct - Use semantic tokens
<div className="bg-background text-foreground" />
<button className="bg-primary text-primary-foreground" />

// ❌ Wrong - Never use raw colors
<div className="bg-white text-black" />
<div className="bg-[#1a1a1a]" />
```

---

## Typography

### Font Families

| Type | Font | Tailwind Class |
|------|------|----------------|
| Headings | Playfair Display | `font-serif` |
| Body | Inter | `font-sans` |

### Type Scale

```css
/* Headings - Always use font-serif */
h1: text-5xl md:text-7xl (letter-spacing: -0.03em)
h2: text-3xl md:text-4xl (letter-spacing: -0.02em)
h3: text-2xl md:text-3xl
h4: text-xl md:text-2xl

/* Body - Use font-sans */
body: text-base (16px)
small: text-sm (14px)
caption: text-xs (12px)
```

### Usage

```tsx
// Hero heading
<h1 className="font-serif text-5xl md:text-7xl tracking-tight">
  Title Here
</h1>

// Section heading
<h2 className="font-serif text-3xl tracking-tight">
  Section Title
</h2>

// Body text
<p className="font-sans text-muted-foreground leading-relaxed">
  Body content here
</p>

// Museum label style
<span className="museum-label">Artist Name</span>
```

---

## Spacing

Use Tailwind's spacing scale consistently:

| Size | Value | Usage |
|------|-------|-------|
| `1` | 4px | Tight gaps |
| `2` | 8px | Icon padding |
| `3` | 12px | Button padding |
| `4` | 16px | Card padding |
| `6` | 24px | Section gaps |
| `8` | 32px | Large gaps |
| `12` | 48px | Section margins |
| `16` | 64px | Page sections |
| `24` | 96px | Hero spacing |

---

## Border Radius

Only 3 values allowed:

| Token | Value | Usage |
|-------|-------|-------|
| `rounded-sm` | 2px | Subtle rounding |
| `rounded-md` | 4px | Cards, buttons |
| `rounded-lg` | 6px | Dialogs, modals |

```tsx
// ✅ Correct
<div className="rounded-sm" />

// ❌ Wrong - No arbitrary values
<div className="rounded-xl" />
<div className="rounded-[20px]" />
```

---

## Shadows

Defined as CSS variables for consistent depth:

```css
--shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.03);
--shadow-md: 0 4px 12px -2px rgb(0 0 0 / 0.06);
--shadow-lg: 0 12px 24px -4px rgb(0 0 0 / 0.08);
```

---

## Animations & Transitions

### Timing Functions

Always use easing curves, never linear:

```css
--ease-out: cubic-bezier(0.4, 0, 0.2, 1);
--duration-fast: 200ms;
--duration-normal: 300ms;
--duration-slow: 500ms;
```

### Usage

```tsx
// ✅ Correct - Eased transitions
<div className="transition-all duration-300 ease-out" />

// Hover states (2-4px lift max)
<div className="hover:translate-y-[-2px] transition-transform duration-300" />

// ❌ Wrong - No bouncy or excessive animations
<div className="hover:scale-110" /> // Too much
```

### Staggered Animations

Use intentional delays for lists:

```tsx
{items.map((item, i) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: i * 0.1, duration: 0.3 }}
  />
))}
```

---

## Components

### Buttons

Always use shadcn/ui Button with variants:

```tsx
import { Button } from "@/components/ui/button";

// Primary action
<Button>Submit</Button>

// Secondary action
<Button variant="outline">Cancel</Button>

// Ghost (minimal)
<Button variant="ghost">Learn More</Button>

// With loading state (REQUIRED for async actions)
<Button disabled={isLoading}>
  {isLoading && <LoadingSpinner size="sm" className="mr-2" />}
  Submit
</Button>
```

### Cards

```tsx
import { Card, CardContent, CardHeader } from "@/components/ui/card";

<Card className="hover:shadow-md transition-shadow duration-300">
  <CardHeader>Title</CardHeader>
  <CardContent>Content</CardContent>
</Card>
```

### Loading States

**REQUIRED** for all async actions:

```tsx
import { LoadingSpinner } from "@/components/ui/loading-spinner";

// Button loading
<Button disabled={loading}>
  {loading && <LoadingSpinner size="sm" className="mr-2" />}
  Save
</Button>

// Page loading
<div className="flex items-center justify-center min-h-[200px]">
  <LoadingSpinner size="lg" />
</div>
```

---

## Icons

Use Lucide React icons with proportional sizing:

```tsx
import { ArrowRight, Heart } from "lucide-react";

// Inline with text - match text size
<span className="text-sm">
  <Heart className="w-4 h-4 inline mr-1" /> Save
</span>

// Standalone - slightly larger
<Button size="icon">
  <ArrowRight className="w-5 h-5" />
</Button>

// ❌ Wrong - Disproportionate
<span className="text-sm">
  <Heart className="w-12 h-12" /> // Way too big
</span>
```

---

## Anti-Patterns (Vibe-Coding)

### ❌ Never Do

1. **Purple gradients** - Unless brand-specific
2. **Sparkles/emojis** in headings
3. **Glowing hover effects**
4. **"Sarah Chen"** placeholder names - Use "Your name" or "Artist Name"
5. **Fake testimonials**
6. **Generic phrases** - "Build your dreams", "Launch faster"
7. **Em-dash overuse** in copy
8. **Non-functional social icons**
9. **Inconsistent border-radius**
10. **Missing loading states**

### ✅ Always Do

1. Use semantic color tokens
2. Add loading spinners to async buttons
3. Use cubic-bezier easing
4. Keep hover lifts to 2-4px max
5. Maintain typography hierarchy
6. Write specific, purposeful copy

---

## File Organization

```
src/
├── components/
│   ├── ui/           # shadcn/ui base components
│   └── [Feature].tsx # Feature-specific components
├── hooks/            # Custom React hooks
├── pages/            # Route pages
├── contexts/         # React contexts
├── lib/              # Utilities
└── index.css         # Design tokens & global styles
```
