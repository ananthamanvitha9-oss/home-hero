# HomeHero - 30-Day MVP Development Roadmap

**Product Phase:** Phase 1 (MVP Launch Only)  
**Strict Domain Scope:**  
*   **BUILD ONLY:** Electrician, Plumber, Carpenter, AC Repair.  
*   **EXCLUDE (Later Phases):** Maid, Cook, Apartment Management, Expense Tracker, Medicine Reminder.  

---

## 📅 Roadmap Overview

```
Week 1: Authentication & User/Hero Onboarding (Days 1-7)
Week 2: Service Listings & Dynamic Pricing Estimators (Days 8-15)
Week 3: Booking Logic & Geofenced Match Radar (Days 16-22)
Week 4: Escrow Payments, Ratings, & Launch (Days 23-30)
```

---

## 🛠️ Week-by-Week Detailed Task Plan

### Week 1: Authentication & Security (Days 1 - 7)
*Focus: Environment initialization, database provisioning, and OTP/JWT security structures.*

*   **Day 1: Environment & Boilerplate Setup**
    *   Initialize backend Express environment and frontend React/Vite folders.
    *   Set up `.gitignore` and `.env` local configurations.
*   **Day 2: Database Setup & DDL Schema**
    *   Provision PostgreSQL database and run `schema.sql` to compile tables.
    *   Enable PostGIS extensions and set up spatial indexing on locations.
*   **Day 3: User Registration API**
    *   Code `POST /api/v1/auth/register` endpoints.
    *   Implement bcrypt password hashing.
*   **Day 4: User Login & JWT Issuer**
    *   Code `POST /api/v1/auth/login` returning 24-hour expiration tokens.
    *   Implement token verification middlewares.
*   **Day 5: Mock OTP Service Integration**
    *   Implement `POST /api/v1/auth/verify-otp` routing to validate phone details.
*   **Day 6: Technician Onboarding & Background Verification Setup**
    *   Create profile models with verification tracking statuses (`unverified`, `pending`, `verified`).
*   **Day 7: Authentication Testing & Validation**
    *   Write unit tests using Postman/Jest to verify registration constraints.

---

### Week 2: Service Listings & Pricing Engine (Days 8 - 15)
*Focus: Fetching categories (Electrician, Plumber, Carpenter, AC Repair) and computing flat-rate prices.*

*   **Day 8: Category Seeding**
    *   Seed database with core services and baseline rates.
*   **Day 9: Category Fetching API**
    *   Code `GET /api/v1/services` to retrieve active categories.
*   **Day 10: Dynamic Pricing Estimator API**
    *   Code `POST /api/v1/bookings/estimate` to calculate pricing dynamically (e.g. rooms multiplier, pet fees, surcharge coefficients).
*   **Day 11: Pricing Edge-Case Tests**
    *   Add validation tests for estimator parameters.
*   **Day 12: UI Layout - Home Dashboard Grid**
    *   Scaffold React views for category cards.
*   **Day 13: UI Layout - Price Calculator**
    *   Build selectors for room counts, hours of work, and dynamic detail checkboxes.
*   **Day 14: Frontend-Backend Pricing Integration**
    *   Connect React forms to fetch calculations from `/bookings/estimate` in real-time.
*   **Day 15: Styling & Polish**
    *   Refine responsive layouts and glassmorphism style rules.

---

### Week 3: Booking Logic & Geofenced Matching (Days 16 - 22)
*Focus: Booking models, dispatch logic, and WebSockets tracking.*

*   **Day 16: Booking Creation API**
    *   Code `POST /api/v1/bookings` creating records in `pending_match` state.
*   **Day 17: Booking Retrieval API**
    *   Code `GET /api/v1/bookings/:id` to retrieve details and status updates.
*   **Day 18: PostGIS Geofencing Query**
    *   Implement matching routines: query online technicians within a 15-mile radius of the booking location.
*   **Day 19: Match Dispatch Alert Flow**
    *   Set up a 90-second accept timer loop for dispatches.
*   **Day 20: WebSockets Server Setup**
    *   Configure Socket.io to support real-time coordinate coordinates updates from Heroes.
*   **Day 21: Live Tracking Map Page**
    *   Develop React mapping components updating technician vehicle pins.
*   **Day 22: Dispatch & Match Testing**
    *   Simulate technician matching processes and track status transition pipelines.

---

### Week 4: Escrow Payments, Ratings, & Launch (Days 23 - 30)
*Focus: Stripe connections, review feedback, and product verification.*

*   **Day 23: Stripe Payment Intent (Hold)**
    *   Code `POST /payments/hold` to place a pre-authorization hold on payments.
*   **Day 24: Stripe Escrow Transfer (Release)**
    *   Code `POST /payments/:booking_id/release` to split earnings: 85% to Hero, 15% to platform.
*   **Day 25: Reviews & Ratings API**
    *   Code `POST /api/v1/reviews` and update the technician's average score.
*   **Day 26: Reviews UI Page**
    *   Build customer review panels (stars, feedback text inputs).
*   **Day 27: Senior Accessibility Mode ("Simple View")**
    *   Develop the React toggle switch and implement font-scaling styling rules.
*   **Day 28: Hero Checklist Integration**
    *   Build photo upload controls for checklists.
*   **Day 29: End-to-End System Validation**
    *   Run full booking flows from Splash screens to escrow sign-offs.
*   **Day 30: Production Build & Staging Release**
    *   Deploy Express backend and React frontend production assets.
