# HomeHero - Design System & UI Components

This document specifies the design system foundation, typography rules, color tokens, and Tailwind variables for the HomeHero platform.

---

## 1. Color Palette

```
┌─────────────────────────────────────────────────────────────┐
│                      CORE BRAND COLORS                      │
├──────────────────┬──────────────────┬───────────────────────┤
│ Dark Background  │ #0b0f19          │ Dark Slate Slate-950  │
│ Primary Violet   │ #6366f1          │ Indigo Violet-500     │
│ Dark Accent      │ #1e293b          │ Slate-800             │
│ Body Text        │ #f8fafc          │ Slate-50              │
│ Support Gray     │ #94a3b8          │ Slate-400             │
└──────────────────┴──────────────────┴───────────────────────┘
```

---

## 2. Typography

We use Google Web Fonts to achieve a premium look and feel:
*   **Header Font**: **Outfit** (sans-serif)
    - Enforced on all `h1`, `h2`, `h3`, and button text.
    - Promotes a modern, bold brand identity.
*   **Body Font**: **Inter** (sans-serif)
    - Enforced on all body copy, descriptions, input placeholders, and help text.
    - Optimizes readability on mobile devices.

---

## 3. Tailwind Configuration Integration

Add these design system extensions to your `tailwind.config.js` file:

```javascript
module.exports = {
  theme: {
    extend: {
      colors: {
        darkBg: '#0b0f19',
        accentIndigo: '#6366f1',
        slateSlate: '#94a3b8',
        cardDark: '#1e293b'
      },
      fontFamily: {
        outfit: ['Outfit', 'sans-serif'],
        inter: ['Inter', 'sans-serif']
      }
    }
  }
}
```
