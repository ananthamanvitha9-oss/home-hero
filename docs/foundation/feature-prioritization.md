# HomeHero - Feature Prioritization & Sprint Planning

**Prepared by**: Technical Product Owner  
**Target Audience**: Engineering Leads, Scrum Master, & Product Stakeholders  
**Focus**: MoSCoW Backlog, Development Sprints, & Release Planning

---

## 1. MoSCoW Feature Backlog

This framework maps features to core launch segments based on priority:

### 1.1 Must-Have (Critical for MVP Launch)
*   **Secure Authentication & Session Limits**: JWT access tokens (15-min) and refresh tokens (7-day HTTP-Only cookies).
*   **Proximity-Based Matchmaking**: Live geospatial queries finding the nearest online technician within a 15 km radius.
*   **Razorpay Escrow Holdings**: Hold customer payments upon order creation and verify hashes before matching.
*   **Booking Lifecycle State Machine**: Clear transitions (pending → accepted → active/in-progress → completed).
*   **Real-time Socket Telemetry**: Socket.io connections updating coordinates and synchronizing check-lists.

### 1.2 Should-Have (Important but not Critical)
*   **Technician Profile & Vetting System**: Profiles for skills, experience, and background check verifications.
*   **Cloudinary File Uploads**: Image uploads for avatars, certifications, and post-job verification photos.
*   **Dynamic pricing surge**: Surcharges for monsoon, night shifts, and holiday periods.

### 1.3 Could-Have (Enhancements for Post-MVP)
*   **Integrated Customer-Technician Chat**: Socket-based text chat inside active booking rooms.
*   **Address Label Profiles**: Custom addressing templates (e.g. Home, Office) for fast checkouts.
*   **Dynamic Maps Route Drawings**: Map polyline routes showing path details on active tracking maps.

### 1.4 Won't-Have (Deferred to v2.0+)
*   **Multi-City Multi-Region Operations**: Confining v1 strictly to Hyderabad.
*   **Automated Dispute Mediation**: Support agents will handle disputes manually in v1.
*   **Annual Maintenance Contracts (AMC)**: Subscription packages will be launched in post-MVP phases.

---

## 2. Release Plan & Estimated Development Times

| Feature | MoSCoW | Development Order | Est. Time | Risk Level | Release Target |
| :--- | :--- | :--- | :--- | :--- | :--- |
| JWT Authentication | Must-Have | 1. Security Core | 2 Weeks | Low | Alpha (Week 4) |
| Booking matching engine | Must-Have | 2. Dispatch Core | 3 Weeks | High | Alpha (Week 7) |
| Razorpay Escrow | Must-Have | 3. Financial Core | 2 Weeks | High | Beta (Week 9) |
| Socket live tracking | Must-Have | 4. Telemetry Core | 2 Weeks | Medium | Beta (Week 11) |
| Admin Dashboard | Should-Have | 5. Admin Panels | 1 Week | Low | v1.0 Launch (Week 12) |
| Cloudinary Uploads | Should-Have | 6. Media Service | 1 Week | Low | v1.0 Launch (Week 12) |
| Reviews & Ratings | Should-Have | 7. Feedback Core | 1 Week | Low | v1.0 Launch (Week 12) |

---

## 3. Sprint Plan (12-Week Execution Calendar)

### Sprint 1: Security & Workspace Foundations (Weeks 1–2)
*   *Goal*: Establish secure, verified developer sessions.
*   *Tasks*: 
    *   Set up monorepo config files, ESLint, and Mongoose connection configurations.
    *   Build `User` and `Technician` models, register JWT authorization middleware, and implement Joi auth validation schemas.

### Sprint 2: Core Booking Lifecycle (Weeks 3–4)
*   *Goal*: Construct the state machine logic for booking orders.
*   *Tasks*:
    *   Build `Booking` schema, implement `/bookings/create` matching engine, and write status history transition rules.

### Sprint 3: Razorpay Escrow Holds (Weeks 5–6)
*   *Goal*: Secure payments.
*   *Tasks*:
    *   Integrate Razorpay order creations, build SHA-256 signature verifications, and write wallet accrual algorithms for escrow releases.

### Sprint 4: Socket.io Telemetry (Weeks 7–8)
*   *Goal*: Enable real-time updates.
*   *Tasks*:
    *   Mount Socket.io servers, bind location updates, and build real-time checklist synchronization triggers.

### Sprint 5: Profiles, Reviews, & Admin (Weeks 9–10)
*   *Goal*: Complete administrative and feedback features.
*   *Tasks*:
    *   Build review submission controllers, calculate average rating aggregates, and implement admin verification endpoints.

### Sprint 6: End-to-End QA, Testing, & Deploy (Weeks 11–12)
*   *Goal*: Project sign-off.
*   *Tasks*:
    *   Run Playwright E2E suites, verify webhook reliability, deploy to Vercel/Render, and launch.
    
