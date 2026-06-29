# HomeHero - Complete Development Playbook

This master playbook serves as the structural reference map for **HomeHero**, aligning startup strategy, architectural designs, engineering implementations, QA testing, and launch plans.

---

## 📚 Volume 1 – Startup Foundation

- [ ] **Startup Idea Validation**: Hyperlocal demand loops matching licensed technicians (heroes) to households within a 15 km radius.
- [ ] **Market Research**: Primary indicators in tier-1/tier-2 cities show service-brokerage lag and pricing opacity.
- [ ] **Competitor Analysis**: Reviewing existing platforms (Urban Company, TaskRabbit) to define value differentiators (real-time matching, escrow holdings).
- [ ] **Customer Interviews**: Defining friction points (untimely arrival, unsafe workers, surprise bills).
- [ ] **Business Model Canvas**:
  - *Key Partners*: Local trade associations, parts providers, vetting boards.
  - *Revenue Model*: 15% platform commission on completed jobs, dynamic holiday/surge pricing.
- [ ] **MVP planning**: Gated customer/technician workflows, Razorpay payment holdings, location checkins, and review logs.
- [ ] **GitHub Workflows**: Standardizing on **Git Flow** branches (`main`, `develop`, `feature/*`, `bugfix/*`, `hotfix/*`).

---

## 📚 Volume 2 – Product Design

- [ ] **PRD (Product Requirement Document)**: Gated under [docs/prd/](file:///c:/Users/manvi/OneDrive/Desktop/homehero/docs/prd/). Defines the core matching state machine.
- [ ] **User Journeys**: Customer service discovery → checkout → OTP checkin → review.
- [ ] **System Architecture**:
  - *High-Level*: React client on Vercel, Node/Express on Render, MongoDB Atlas database, Socket.io telemetry connections.
  - *Low-Level*: Detailed under [docs/architecture/system-architecture.md](file:///c:/Users/manvi/OneDrive/Desktop/homehero/docs/system-architecture.md).

---

## 📚 Volume 3 – Database Design

- [ ] **MongoDB Schemas**: Details defined in models:
  - [userModel.js](file:///c:/Users/manvi/OneDrive/Desktop/homehero/backend/src/models/userModel.js) (user accounts, addresses)
  - [technicianModel.js](file:///c:/Users/manvi/OneDrive/Desktop/homehero/backend/src/models/technicianModel.js) (verification, ratings, coordinates index)
  - [bookingModel.js](file:///c:/Users/manvi/OneDrive/Desktop/homehero/backend/src/models/bookingModel.js) (billing state, checklist, location)
- [ ] **Geospatial Indexes**: 2dsphere index on `currentLocation` for location matching.
- [ ] **Backup Strategies**: Configuring Atlas weekly snapshot routines.

---

## 📚 Volume 4 – Backend Development

- [ ] **API Controller Patterns**:
  - Auth: JWT token refresh controllers, secure cookies.
  - Booking: State machine guards (pending → accepted → active → completed).
  - Admin: Surges settings, user suspension controls.
- [ ] **Winston + Morgan Logs**: Streams HTTP requests and error stack logs to rotated files.
- [ ] **Operational Error Handling**: Central middleware formatting database validation checks.

---

## 📚 Volume 5 – Frontend Development

- [ ] **React Client Application**: Under `frontend/`.
- [ ] **Session Contexts**: Context wrappers handling local token refresh loops.
- [ ] **Interface Components**:
  - Service directory with categories (Electrician, Plumber, AC Repair, Carpenter).
  - Booking progress visualizer.
  - Admin metrics dashboard.

---

## 📚 Volume 6 – Integrations

- [ ] **Razorpay Payment Gateway**: Escrow pre-authorization holds and automated commission disbursements.
- [ ] **Google Maps SDK**: Location picker pins and route tracking overlays.
- [ ] **Firebase FCM**: Real-time push dispatches for service matches.
- [ ] **Multi-channel fallbacks**: SMTP Nodemailer email templates and Twilio SMS.

---

## 📚 Volume 7 – Quality Testing

- [ ] **Unit Tests**: Mock bcrypt hashes and Joi validators (Jest).
- [ ] **API Integration Tests**: Supertest loops verifying authorization headers.
- [ ] **End-to-End browser Tests**: Playwright scripts simulating customer logins.
- [ ] **Performance Stress Profile**: Artillery load curves targeting booking dispatch bottlenecks.

---

## 📚 Volume 8 – Cloud Deployment

- [ ] **Infrastructure Hosting**: Backend on Render, Client on Vercel.
- [ ] **GitHub Actions Pipelines**: Automated quality lint check steps on push.
- [ ] **Secrets Keys**: Managing environment variables securely (Atlas URIs, Razorpay keys).

---

## 📚 Volume 9 – Launch & Operations

- [ ] **Beta Testing**: Running private onboarding trials with 20 vetted providers.
- [ ] **User Onboarding Playbooks**: Simplified technician verification scripts.
- [ ] **Crash Telemetry**: Configuring error capturing (Sentry client integrations).

---

## 📚 Volume 10 – Growth & Funding

- [ ] **KPI Dashboard**: Monitoring Customer Acquisition Cost (CAC), Lifetime Value (LTV), and booking density.
- [ ] **Investor Pitch Deck**: Pitch blueprint located in [docs/presentations/pitch-deck.md](file:///c:/Users/manvi/OneDrive/Desktop/homehero/docs/presentations/pitch-deck.md).
- [ ] **Roadmap v2**: Moving from basic matches to AI-driven dynamic surge pricing.
