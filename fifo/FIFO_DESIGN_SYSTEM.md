# VISUAL DESIGN SYSTEM & INTERACTION STANDARDS

This document defines the complete visual and interaction standards for the app. Follow these specifications exactly. Do not fall back on generic defaults.

---

## Color System

### Palette (5 colors + neutrals)

| Role | Hex | Usage | Max Surface Coverage |
|------|-----|-------|---------------------|
| Primary | #2C3E50 | Headers, nav, primary buttons, active tab indicators | 15% |
| Danger/Urgent | #C0392B | Expiring ≤7 days, "EAT NOW" labels, destructive actions | 10% |
| Warning/Amber | #E67E22 | Expiring ≤30 days, "SOON" labels, caution states | 10% |
| Success/Green | #27AE60 | Eaten confirmation, success toasts, positive states | 5% |
| Background | #FAFAFA | Page background, card backgrounds | 60%+ |

### Neutrals

| Role | Hex | Usage |
|------|-----|-------|
| Text Primary | #333333 | All body text, headings |
| Text Secondary | #777777 | Subtitles, helper text, timestamps |
| Text Disabled | #BBBBBB | Eaten item text, placeholder text |
| Border | #E0E0E0 | Card borders, dividers, input borders |
| Surface | #FFFFFF | Cards, modals, input backgrounds |
| Stripe | #F5F5F5 | Alternating row backgrounds |

### Usage Rules
- Never use pure black (#000000) for text — it's harsh on screen and wastes ink if printed
- Accent colors are for signals, not decoration — they highlight urgency, not fill space
- Background should always be white or near-white — dark mode is not in scope
- Contrast ratios: all text must meet WCAG AA minimum (4.5:1 for body, 3:1 for large text)

---

## Typography System

### Font Stack
```css
--font-primary: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
--font-mono: "SF Mono", "Fira Code", "Fira Mono", "Roboto Mono", monospace;
```

No custom font files. System fonts load instantly, look native on every platform, and keep the bundle at zero KB for typography.

### Type Scale

| Element | Size | Weight | Line Height | Letter Spacing |
|---------|------|--------|-------------|----------------|
| Page Title | 24px / 1.5rem | 700 | 1.2 | -0.02em |
| Section Header | 18px / 1.125rem | 700 | 1.3 | -0.01em |
| Card Title / Item Name | 16px / 1rem | 600 | 1.4 | 0 |
| Body Text | 14px / 0.875rem | 400 | 1.5 | 0 |
| Small / Helper Text | 12px / 0.75rem | 400 | 1.4 | 0.01em |
| Label / Overline | 11px / 0.6875rem | 600 | 1.3 | 0.05em |
| Badge / Tag | 11px / 0.6875rem | 700 | 1 | 0.03em |

### Typography Rules
- Headings use weight 600–700, never 800 or 900 (too heavy for this brand)
- Body text uses weight 400, never 300 (too thin for readability under stress)
- All caps is allowed ONLY for labels, badges, and overline text — never for headings or body
- Maximum line length: 65 characters for body text (roughly 600px)
- Never center-align body text. Left-align everything except badges and single-line status labels.

---

## Spacing System

### Base Unit: 4px

All spacing derives from a 4px base on an 8-point grid:

```css
--space-1: 4px;    /* Tight: between icon and label */
--space-2: 8px;    /* Compact: padding inside badges, between related items */
--space-3: 12px;   /* Default: padding inside inputs, between form fields */
--space-4: 16px;   /* Standard: card padding, section gaps */
--space-5: 20px;   /* Comfortable: between cards in a list */
--space-6: 24px;   /* Generous: section padding on mobile */
--space-8: 32px;   /* Spacious: section padding on desktop, modal padding */
--space-10: 40px;  /* Large: page top/bottom padding */
--space-12: 48px;  /* Extra: gap between major page sections */
```

### Spacing Rules
- Padding inside interactive elements (buttons, inputs): minimum 12px vertical, 16px horizontal
- Card padding: 16px on mobile, 24px on desktop
- Gap between list items: 8px (tight list) or 12px (comfortable list)
- Never use inconsistent spacing — if two elements are siblings, they get the same gap
- Whitespace is a feature, not wasted space. When in doubt, add more.

---

## Border Radius

```css
--radius-sm: 4px;    /* Inputs, small buttons, badges */
--radius-md: 8px;    /* Cards, modals, large buttons */
--radius-lg: 12px;   /* Bottom sheet, floating action button */
--radius-full: 9999px; /* Pills, circular icons, toggle thumbs */
```

### Radius Rules
- Pick ONE radius per element type and use it everywhere. Cards are always 8px. Buttons are always 4px. No exceptions.
- Never use border-radius above 12px on rectangular elements — it starts looking toy-like
- Checkboxes use 2px radius (barely rounded, not circular)

---

## Shadow System (Elevation)

```css
--shadow-1: 0 1px 2px rgba(0, 0, 0, 0.05);
  /* Subtle: cards at rest, input fields */

--shadow-2: 0 2px 4px rgba(0, 0, 0, 0.08);
  /* Raised: cards on hover, dropdowns */

--shadow-3: 0 4px 12px rgba(0, 0, 0, 0.10);
  /* Floating: modals, floating action button */

--shadow-4: 0 8px 24px rgba(0, 0, 0, 0.12);
  /* Overlay: modal backdrop shadow, toast notifications */

--shadow-5: 0 12px 36px rgba(0, 0, 0, 0.16);
  /* Max: only for the Add Item modal when open */
```

### Shadow Rules
- Cards at rest use shadow-1 or no shadow (border only). Not both.
- Shadow increases on hover/focus as feedback, not as decoration
- Never stack multiple shadows on one element
- Modals use shadow-4 or shadow-5. Nothing in between.
- The floating action button uses shadow-3 at rest, shadow-4 on press

---

## Icon Standards

- **Style:** Outline only, not filled. Consistent 1.5px stroke width.
- **Size variants:** 16px (inline with text), 20px (inside buttons), 24px (standalone/nav)
- **Corner radius on icon shapes:** 1px (barely rounded, not hard corners, not bubbly)
- **Color:** Icons inherit text color. Never use colored icons except for status indicators.
- **Library:** Use Lucide icons if importing a library. Otherwise, inline SVGs matching these specs.
- **No emoji in UI.** Emoji is acceptable only in empty state messages (e.g. "Nothing expiring this week").

---

## Animation & Micro-Interactions

### Timing Curves

```css
--ease-out: cubic-bezier(0.25, 0, 0.25, 1);
  /* Default for most transitions — quick start, gentle stop */

--ease-in-out: cubic-bezier(0.42, 0, 0.58, 1);
  /* For modals opening/closing, route transitions */

--ease-spring: cubic-bezier(0.34, 1.56, 0.64, 1);
  /* For small celebratory moments — toast appearing, checkmark bounce */
```

### Duration Scale

| Interaction | Duration | Easing |
|-------------|----------|--------|
| Button hover/active state | 100ms | ease-out |
| Input focus ring | 150ms | ease-out |
| Checkbox toggle | 150ms | ease-out |
| Toast appear | 200ms | ease-spring |
| Toast disappear | 150ms | ease-out |
| Modal open | 250ms | ease-in-out |
| Modal close | 200ms | ease-out |
| List item fade on mark-eaten | 300ms | ease-out |
| Tab switch content | 150ms | ease-out |
| Color change (hover, state) | 100ms | ease-out |

### Animation Rules
- All animations must respect `prefers-reduced-motion: reduce` — if set, disable all transitions and animations, show content immediately
- Never animate layout properties (width, height, top, left) — use transform and opacity only
- No bounce effects except on toast/success moments
- No loading spinners longer than 100ms — if data is local, it's instant
- No skeleton screens — the data is in IndexedDB, it loads in milliseconds
- Page transitions: content fades in with opacity 0→1 over 150ms. No sliding, no scaling.
- Eaten items: checkbox fills with green (#27AE60) over 150ms, then the row fades to gray over 300ms

### Hover States (desktop only — no hover on mobile)
- Buttons: background lightens 8%, transition 100ms
- Cards/rows: background shifts to --space-stripe (#F5F5F5), transition 100ms
- Links: color shifts to Primary, no underline animation
- Checkboxes: border color shifts to Primary

### Focus States
- All focusable elements get a 2px offset outline in Primary (#2C3E50) with 2px gap
- Focus ring uses `outline: 2px solid #2C3E50; outline-offset: 2px;`
- Never remove focus outlines without replacement — keyboard users depend on them
- Tab order follows visual order, top to bottom, left to right

### Form Interactions
- Input focus: border transitions from #E0E0E0 to #2C3E50 over 150ms
- Validation error: border turns #C0392B, helper text appears below in #C0392B, subtle 2px horizontal shake (transform: translateX) over 200ms
- Success on submit: green checkmark fades in over 200ms with ease-spring

---

## Component Behavior

### Buttons
- Primary: #2C3E50 background, white text. Hover: lighten 10%. Active: darken 5%.
- Danger: #C0392B background, white text. Same hover/active behavior.
- Ghost: transparent background, #2C3E50 text and border. Hover: #F5F5F5 fill.
- Disabled: #E0E0E0 background, #BBBBBB text. No hover state. Cursor: not-allowed.
- Minimum height: 44px. Minimum width: 44px (icon-only) or auto with 16px horizontal padding.
- Text inside buttons: 14px, weight 600, no uppercase unless it's a single short word.

### Cards / List Rows
- Background: white. Border: 1px solid #E0E0E0 OR shadow-1. Not both.
- No inner borders between elements — use spacing to separate content
- Active/selected state: left border accent (3px solid Primary) or subtle background tint

### Modals
- Centered on desktop, bottom-sheet style on mobile (slides up from bottom)
- Backdrop: rgba(0, 0, 0, 0.4)
- Modal surface: white, radius-md, shadow-5
- Close via X button in top right, tap on backdrop, or Escape key
- Focus trapped inside modal while open
- On open: content below is inert (not tabbable, not clickable)

### Toast Notifications
- Position: bottom center on mobile, bottom right on desktop
- Background: #333333, text: white, radius-sm
- Appears with ease-spring, 200ms. Auto-dismisses after 3 seconds.
- No close button needed — they're ephemeral
- Maximum one toast visible at a time — new toasts replace old ones

---

## Responsive Breakpoints

```css
--mobile: 0px;        /* Default — design mobile first */
--tablet: 640px;      /* Side padding increases, cards get more breathing room */
--desktop: 1024px;    /* Max content width kicks in, layout can shift to 2-column */
--max-width: 640px;   /* Content never stretches wider than this — it's a tool, not a dashboard */
```

### Responsive Rules
- Mobile is the primary design target. Desktop is a bonus, not the goal.
- Content max-width is 640px centered on desktop — this is a focused tool, not a wide dashboard
- No horizontal scrolling anywhere, ever
- Touch targets: minimum 44x44px on mobile for all tappable elements
- Bottom navigation bar: fixed at bottom on mobile, standard top nav on desktop
- Modal becomes bottom-sheet on mobile (attached to bottom of viewport, slides up)

---

## Anti-Patterns — DO NOT DO THESE

These are explicit design choices to avoid. If the output includes any of these, it's wrong.

1. **Generic SaaS dashboard aesthetic** — no gradient headers, no card grids with identical drop shadows, no "dashboard" layout with sidebar navigation. This is a focused single-purpose tool.

2. **Rounded-corner-everything** — do not apply large border radius (16px+) to cards, containers, or sections. It looks toy-like and undermines the serious, competent brand.

3. **Colorful icon sets** — icons are monochrome, inheriting text color. No multicolor icons, no filled icons, no icon backgrounds with colored circles.

4. **Bouncy/playful animations** — no spring physics on page loads, no wobble effects, no confetti. The one exception is a subtle spring ease on toast notifications and success checkmarks. Everything else is businesslike.

5. **Skeleton loading screens** — the data is local. It loads in milliseconds. Skeleton screens would make it feel slower than it is. If something takes time (CSV import), use a simple progress indicator.

6. **Thin, low-contrast text** — no font-weight 300, no light gray (#AAAAAA or lighter) for body text, no low-contrast placeholder text. Everything must be readable by someone who is tired, stressed, or in low light.

7. **Decorative elements** — no background patterns, no illustrations, no hero images, no gradients, no decorative dividers. Every visual element must be functional.

8. **Modal overuse** — the Add Item form is a modal because rapid entry demands it. Nothing else should be a modal. Confirmations use inline UI or simple browser confirms. Don't modal-ify settings, help text, or navigation.

9. **Hover-dependent interactions** — nothing should be accessible ONLY via hover. Every hover interaction must have a tap/click equivalent. Mobile users have no hover state.

10. **Over-labeling** — don't put "Food Inventory" as a heading when the tab already says "Inventory." Don't label a search box "Search" if it has placeholder text. Don't add "Click here to..." on buttons. Respect the user's intelligence.

---

## Accessibility Baseline

- Semantic HTML: use `<nav>`, `<main>`, `<section>`, `<button>`, `<dialog>` — not divs with click handlers
- All form inputs have associated `<label>` elements (visible, not `aria-label` only)
- All images/icons have `alt` text or `aria-hidden="true"` if decorative
- Keyboard navigation works for every feature: Tab, Shift+Tab, Enter, Escape, Space
- Focus is managed on modal open/close (focus moves into modal on open, returns to trigger on close)
- ARIA live regions for toast notifications so screen readers announce them
- Color is never the ONLY indicator of state — always pair with text or icon (e.g. red background + "EAT NOW" label)
- `prefers-reduced-motion` respected on all animations
- `prefers-color-scheme` — ignored for v1 (no dark mode), but don't hardcode white in ways that would block future dark mode
