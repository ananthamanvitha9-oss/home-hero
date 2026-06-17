# HomeHero - UI/UX Design System & Layout Specification

## 1. Design System Foundation (Style Guide)
To build a premium, trustworthy, and modern application, HomeHero utilizes a clean styling philosophy featuring soft gradients, glassmorphism card overlays, clear typography, and subtle micro-animations.

### 1.1 Color Palette
We avoid generic web colors in favor of a curated, high-end theme:

| Token | HSL / Hex Code | Usage |
| :--- | :--- | :--- |
| **Primary (Royal Indigo)** | `hsl(245, 75%, 45%)` | Primary buttons, active state highlights, headings. |
| **Accent (Hero Violet)** | `hsl(270, 80%, 60%)` | Secondary action paths, brand accents, dynamic borders. |
| **Success (Verified Mint)** | `hsl(155, 60%, 45%)` | Verification badges, completed status logs, correct checks. |
| **Warning (Alert Amber)** | `hsl(38, 90%, 55%)` | Cancellation notices, pending payment reminders. |
| **Background (Slate Dark)** | `hsl(220, 20%, 10%)` | Main background (with HSL 220, 20%, 97% for Light Mode fallback). |

### 1.2 Typography
*   **Primary Typeface:** *Outfit* (Google Fonts) - Clean, round geometric lines for headings and titles.
*   **Secondary Typeface:** *Inter* - Optimized for readability in text-heavy lists, prices, and forms.
*   **Scale Hierarchy:**
    *   `h1` (Page Title): `2rem (32px)` / Semibold
    *   `h2` (Card Titles): `1.25rem (20px)` / Medium
    *   `body` (Paragraph text): `1rem (16px)` / Regular
    *   `caption` (Subtext & details): `0.85rem (13.6px)` / Light

---

## 2. Customer Portal Layouts (Mobile Web / Native iOS)

### 2.1 Screen 1: Home / Service Selector
A clean, visual layout grouping categories into tiles.
*   **Header:** Dynamic greeting ("Good Morning, Sarah") with a dropdown showing the current saved address and a notification bell.
*   **Hero Section:** Search bar ("What helper does your home need?") overlaying a subtle violet gradient.
*   **Grid Tiles:** Square glassmorphic cards for:
    *   🧹 *Cleaning* (Deep clean, sanitization)
    *   🔧 *Handyman* (Mounting, furniture assembly)
    *   🚰 *Plumbing* (Faucets, leaks)
    *   ⚡ *Electrical* (Outlets, light fixtures)
*   **Promotional Banner:** "Subscribe to **Hero+** for free inspections and 10% off today!"

### 2.2 Screen 2: Dynamic Pricing Estimator & Schedule
An interactive screen where options compile prices in real-time.
*   **Interactive Controls:** Incrementor buttons for count variables (e.g., "Number of Bedrooms [ - ] **2** [ + ]").
*   **Toggle Elements:** "Add eco-friendly supplies (+$10)" / "Pet in home? [Yes / No]".
*   **Schedule Picker:** Standard calendar grid displaying next 7 days, highlighting 1-hour hourly booking slots (e.g., "10:00 AM - 11:00 AM" with a **Recommended** tag).
*   **Footer Banner:** Sticky bar displaying total price (`$78.00`) and a large "Proceed to Secure Escrow Hold" button.

### 2.3 Screen 3: Live Dispatch & Hero Tracking
A high-excitement screen showcasing proximity matching.
*   **Upper Half:** Interactive Leaflet/Map view. Shows the customer's home icon, a moving Hero vehicle pin (updated every 3 seconds), and a dotted route projection line.
*   **Lower Half (Profile Card Overlay):**
    *   Hero photo (Marcus) with a badge: `✓ Verified Hero (140+ jobs completed)`.
    *   Star Rating (`★ 4.9`).
    *   Dynamic ETA label: `"Arriving in 8 minutes (1.2 miles away)"`.
    *   Quick buttons: `[ Call via In-App VoIP ]` & `[ Text Chat ]`.

---

## 3. Hero (Service Provider) Portal Layouts

### 3.1 Screen 1: Dashboard & Queue Switch
*   **Top Bar:** Large toggle switch to set availability: `[ OFFLINE ] <---> [ ONLINE (Ready for Jobs) ]`.
*   **Status Panel:** Displays current coordinate location and target work radius (e.g., `10 miles`).
*   **Queue Card:** An overlay card flashing when a job matches:
    *   Title: `"New deep cleaning match found!"`
    *   Distance: `"1.4 miles away (Downtown)"`
    *   Gross Pay: `"$62.40 (Hero cut)"`
    *   Accept Timer: A circular countdown ring ticking down from `90 seconds`.

### 3.2 Screen 2: Active Job Checklist & Completion Verification
*   **Job Tasks Panel:** Simple, large checkboxes for required items:
    *   `[ ] Take pre-job inspection photos`
    *   `[ ] Complete deep clean kitchen surfaces`
    *   `[ ] Mop floors and wipe down windows`
    *   `[ ] Take post-job completion photos`
*   **Checkout Verification:** An upload panel requiring at least 2 post-job photo uploads. Once uploaded, displays a "Request Customer Sign-off" button.

---

## 4. Accessibility Options & UX Best Practices

### 4.1 Senior-Friendly Accessibility Toggle
*   **Feature:** A persistent icon in settings or onboarding called "Simple View" designed for elderly customers (Evelyn):
    *   Enforces double body font size (`1.5rem / 24px`).
    *   Changes buttons to full-screen width with high-contrast borders.
    *   Allows booking with voice descriptions (auto-matching using audio-recorded descriptions instead of dropdown configurations).

### 4.2 Security Trust Prompts
*   Throughout the booking flow, display small micro-copy tags reminding the user of safety steps:
    *   *"Every Hero undergoes background check checks and holds $1M in general liability coverage."*
    *   *"Your money is held securely in escrow and only released after you verify the completed task."*
