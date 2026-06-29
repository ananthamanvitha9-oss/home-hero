# HomeHero - UI/UX Design & User Flows

This document details the interface layouts, typography styles, color palettes, and routing paths for the HomeHero frontend.

---

## 1. Visual Aesthetics & Design System Tokens

HomeHero uses a sleek dark mode theme with vibrant status accents:
- **Primary Background**: Dark Gray (`#0b0f19`).
- **Primary Indigo Accent**: Royal Violet (`#6366f1` / Indigo-500).
- **Secondary Slate Tint**: Cool Slate (`#94a3b8` / Slate-400).
- **Alert Colors**:
  - Success Indicator: Neon Green (`#22c55e`).
  - Warning/Failure Indicator: Rose Red (`#f43f5e`).
- **Typography Fonts**:
  - Brand Titles & Headers: **Outfit** (Google Fonts).
  - Body Text & Form Labels: **Inter** (Google Fonts).

---

## 2. Frontend Navigation Routing Map

```
[/] Landing Home Page
 │
 ├── [/login] Account Login
 ├── [/register] Account Signup
 │
 ├── [/services] Service Category Directory
 │    └── [/checkout] Escrow Payment Checkout (Standard Razorpay)
 │
 ├── [/profile] Profile & Addresses Manager (Shared Portal)
 │
 ├── [/booking-status/:id] Live Tracking Map Panel (WebSocket streams)
 │
 ├── [/technician-dashboard] Technician Job queue (Vetted provider view)
 │
 └── [/admin] Administrative Console (Vetting status & surcharge controls)
```

---

## 3. Core Component Layouts

### 3.1 Customer Booking Checkout Flow
1. **Search**: Customer enters their search term or selects a category (e.g. "Electrician").
2. **Select & Estimate**: The app shows upfront rates and estimates total labor costs.
3. **Escrow Hold Checkout**: Customer pays via the Razorpay checkout overlay.
4. **Proximity Search**: The matching engine runs and matches the nearest technician.
5. **Real-time Tracking**: Redirection to `/booking-status/:id` showing a Google map pin, real-time technician movement, and an ETA countdown.
