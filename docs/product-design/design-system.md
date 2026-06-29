# HomeHero - Visual Design System Specification

**Prepared by**: Design System Architect  
**Target Audience**: UI Engineers, Frontend Developers, & Product Designers  
**Focus**: Design Tokens, CSS Variables, Core Components UI/UX Specifications, & naming conventions

---

## 1. Foundation Tokens

### 1.1 Color Palette (Slate-Dark System)

```ini
/* CSS Variable tokens definitions */
--bg-primary: #0b0f19;       /* Dark base canvas */
--bg-secondary: #1e293b;     /* Card background */
--color-indigo: #6366f1;     /* Primary brand violet accent */
--color-indigo-hover: #4f46e5;
--text-primary: #f8fafc;     /* White/slate body text */
--text-muted: #94a3b8;       /* Muted gray annotations */

/* Status Indicators */
--status-success: #22c55e;   /* Online / verified checkmarks */
--status-warning: #eab308;   /* Pending hold status */
--status-error: #f43f5e;     /* Cancelled / rejected states */
```

### 1.2 Spacing & Grid Scale
All spacing coordinates are built upon an 8px multiplier grid:
- **`space-xs`**: `8px` (padding inside badges, micro-margins).
- **`space-sm`**: `16px` (spacing inside standard inputs/buttons).
- **`space-md`**: `24px` (padding inside cards, margins between sections).
- **`space-lg`**: `32px` (gutters between layout columns).
- **Grid Layout**: 12-column grid system with `24px` gutters on desktop, collapsing to 1-column with `16px` outer margins on mobile devices.

### 1.3 Typography
- **Font Stack**:
  - Headers & CTA Buttons: **Outfit** (sans-serif).
  - Body Copy & Form Fields: **Inter** (sans-serif).
- **Sizing Scales**:
  - Page Titles (`h1`): `32px` | Semibold | Line-Height: `1.2`
  - Section Headers (`h2`): `24px` | Medium | Line-Height: `1.3`
  - Card Titles (`h3`): `18px` | Medium | Line-Height: `1.4`
  - Body Text: `14px` | Regular | Line-Height: `1.5`

---

## 2. Component Core Library

### 2.1 Buttons (`.btn`)
- **Primary Action**: Solid Indigo (`#6366f1`), text color `#ffffff`. On hover: transition background to `#4f46e5` in 200ms.
- **Secondary Action**: Background `#1e293b` (Slate-800) with a `1px` border of Slate-700.
- **Interactive State**: Enforce outline rings: `focus:ring-2 focus:ring-indigo-500 focus:outline-none`.

### 2.2 Inputs (`.input-field`)
- **Visuals**: Dark background (`#1e293b`), border `1px` Slate-700, rounded corners `8px` (`rounded-lg`).
- **Placeholder**: Slate-500 (`#64748b`).
- **Validation Error state**: Border color shifts to Rose Red (`#f43f5e`) and appends a `12px` descriptive error label below the input.

### 2.3 Cards (`.card-layout`)
- **Visuals**: Background Slate-800 (`#1e293b`), border `1px` Slate-750, rounded corners `12px` (`rounded-xl`), padding `24px`.

### 2.4 Badges (`.badge`)
- **Verified status**: Green background (`#22c55e` with `0.15` opacity), text color `#22c55e` (Green-500).
- **Pending/Hold**: Yellow background (`#eab308` with `0.15` opacity), text color `#eab308`.

### 2.5 Alerts (`.alert-box`)
- **Design**: Full-width banners with left-border indicators matching status colors (e.g. `border-l-4 border-rose-500` for warnings).

### 2.6 Modals (`.modal-overlay`)
- **Design**: Dark backdrop (`#020617` with `0.6` opacity). Center card container utilizes slide-up transitions (`duration-300`).

---

## 3. Accessibility Standards (a11y)

*   **Contrast Bounds**: Color pairings must comply with WCAG 2.1 AA standards, requiring text-to-background contrast ratios of at least **$4.5:1$** ($3.0:1$ for large text).
*   **Focus Ring Indicators**: Interactive elements must show visible focus states when tabbed: `focus:outline-none focus:ring-2 focus:ring-indigo-500`.
*   **Screen Readers (ARIA)**: Provide `aria-label` tags for all visual icon triggers (e.g. `aria-label="Call technician"` on phone dial icons).
