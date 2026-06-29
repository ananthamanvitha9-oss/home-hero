# HomeHero - Visual Design System & Screen Specifications

**Prepared by**: Senior UI/UX Designer  
**Target Audience**: Frontend Engineers, Design Leads, & Product Managers  
**Focus**: Screen Layouts, Design Tokens, Accessibility (a11y), and Dark Mode Guides

---

## 1. Visual Design Tokens

### 1.1 Color Systems (Vibrant Dark Mode Theme)
- **Backgrounds**:
  - Primary Dark Base: `#0b0f19` (Slate-950)
  - Card & Overlay Containers: `#1e293b` (Slate-800)
- **Accents**:
  - Brand Indigo Violet: `#6366f1` (Indigo-500)
  - CTA Interactive Hover: `#4f46e5` (Indigo-600)
- **Status Indicators**:
  - Online / Success: `#22c55e` (Green-500)
  - Busy / Hold: `#eab308` (Yellow-500)
  - Offline / Cancelled: `#f43f5e` (Rose-500)

### 1.2 Spacing & Grid System (4px Base)
- **Sizing Scales**: Enforce a strict 4px grid system:
  - `4px` (xxs) | `8px` (xs) | `16px` (sm) | `24px` (md) | `32px` (lg) | `48px` (xl)
- **Layout Margins**:
  - Mobile: `16px` (1rem) side padding.
  - Desktop: Max width container set to `1280px` centered with auto margins.

### 1.3 Typography
- **Headings (Brand titles, cards headers)**: **Outfit** (Google Fonts).
- **Body & Forms copy**: **Inter** (Google Fonts).

---

## 2. Screen-by-Screen Specifications

### 2.1 Splash Screen
- **Layout**: Centered branding grid on `#0b0f19` canvas.
- **Components**:
  - 96px custom vertical **Hero Shield** SVG icon centered.
  - Slogan wordmark: *"Household Emergencies, Resolved Instantly"* in Outfit, Slate-400.
  - Bottom spinner loader.

### 2.2 Login & Register Screens
- **Layout**: Centered card layout with single-column input form.
- **Components**:
  - Title header: *"Welcome Back"* / *"Create Account"*.
  - Input field for 10-digit mobile number with national flag selector prefix (`+91`).
  - SMS OTP verification modal overlay containing 6 distinct input cells for the code.

### 2.3 Home Screen (Service Directory)
- **Layout**: Header with geolocation picker pin, category grid, and active tracking banner.
- **Components**:
  - Geolocation Address Picker: Shows current street name with a chevron selector.
  - Trade Category Cards: 4-column grid (Electrician, Plumber, Carpenter, AC Repair) with custom SVG icons.
  - Promotional Banner: Eco-friendly/safety value propositions.

### 2.4 Service Details Screen
- **Layout**: Two-column layout on desktop, single-column scroll on mobile.
- **Components**:
  - Service Hero Banner: Service description and upfront base fees (`₹399`).
  - Surcharge indicators (monsoon surge, night shift warnings).
  - Price Calculator widget: Adjusts rates based on hours or rooms.
  - "Book Now" primary CTA button.

### 2.5 Technician Profile Screen
- **Layout**: Split profile page.
- **Components**:
  - Avatar badge: Verified checkmark overlay, name, average rating score (e.g. `⭐ 4.9`), and experience count.
  - Skill Tags: Active categories list (e.g. `Wiring`, `Geyser Repair`).
  - Bio section and customer feedback comments log.

### 2.6 Booking (Checkout) Screen
- **Layout**: Structured checkout funnel.
- **Components**:
  - Scheduled Time picker (date/time selectors).
  - Address selection card.
  - Pricing breakdown list (Base + Est. Hourly + Tax + Surge Surcharges).
  - Escrow validation note: *"Your payment is held in escrow until completion."*

### 2.7 Payment (Razorpay Interface)
- **Layout**: Custom Razorpay checkout modal overlay.
- **Components**:
  - Payment options list (UPI, Cards, NetBanking).
  - Security badges indicating SSL secure transaction holding.

### 2.8 Booking Tracking Screen
- **Layout**: Map-centric viewport with slide-up bottom drawer.
- **Components**:
  - Google Map canvas showing routing path and real-time technician GPS coordinates marker.
  - Action card: Technician avatar, contact button, and ETA countdown.
  - 4-digit start OTP display card.

### 2.9 Notifications Screen
- **Layout**: Vertical timeline log.
- **Components**:
  - Category filters: All, Bookings, Payments.
  - Notification items: Icon indicator, title, timestamp, and unread dot badge.

### 2.10 Reviews Screen
- **Layout**: Rating submission card.
- **Components**:
  - Interactive 5-star rating selector.
  - Review comment text area with character counter (0/500).
  - Cloudinary proof image uploader drag-and-drop zone.

### 2.11 Profile Screen
- **Layout**: Tabbed user profile center.
- **Components**:
  - Avatar editor widget (with hover edit overlay).
  - Personal details form (name, email, phone).
  - Saved addresses book manager (Add/Delete options).

### 2.12 Admin Dashboard Screen
- **Layout**: Left navigation sidebar with main stats canvas.
- **Components**:
  - Metrics cards (Total Users, Verified Heroes, Active Jobs, Platform Commission).
  - Native SVG Charts (Weekly commissions line charts, category pie charts).
  - Technician vetting queue table with document PDF view drawer.

---

## 3. Accessibility (a11y) & Responsive Behavior

- **Contrast**: Maintain minimum AA standards (contrast ratio $>4.5:1$ for text inputs on cards).
- **Keyboard Navigation**: Enforce focus states (`outline-none ring-2 ring-indigo-500`) on all buttons and inputs.
- **Screen Readers**: Add descriptive `aria-label` tags to all icon-only buttons (e.g. map pins, calling widgets).
- **Responsive Breakpoints**:
  - Mobile: $<640\text{px}$ (single-column cards, sticky bottom CTA buttons).
  - Tablet: $640\text{px}$ to $1024\text{px}$ (2-column grids).
  - Desktop: $>1024\text{px}$ (sidebar navigation, multi-column metrics tables).
