# HomeHero - MVP Product Scope & Launch Plan

**Prepared by**: Senior Product Manager  
**Target Audience**: Engineering Teams, Stakeholders, & Design Leads  
**Focus**: Feature Prioritization, Development Sprints, & Release Milestones

---

## 1. Feature Prioritization Matrix (MoSCoW)

This matrix determines which features are critical for the Minimal Viable Product (MVP) and which are deferred to future releases.

```
┌─────────────────────────────────────────────────────────────┐
│                   FEATURE PRIORITIZATION                    │
├──────────────────────────────┬──────────────────────────────┤
│ MUST HAVE (MVP Release)      │ SHOULD HAVE (Post-MVP)       │
│ - Secure JWT Credentials     │ - Address labels ('Home')    │
│ - 15km Proximity Matchmaker  │ - Post-job checklist uploads │
│ - Razorpay Payment Escrow    │ - Dynamic surcharge pricing  │
│ - Socket.io Live Telemetry   │                              │
├──────────────────────────────┼──────────────────────────────┤
│ COULD HAVE (v2 Backlog)      │ WON'T HAVE (Future Scale)    │
│ - Integrated Text Chatting   │ - Multi-city expansions      │
│ - Multi-language support     │ - AI Smart pricing estimates │
└──────────────────────────────┴──────────────────────────────┘
```

---

## 2. MVP Development Timeline (12-Week Roadmap)

```
Sprints 1-2: Foundation ──> Sprints 3-4: Booking ──> Sprints 5-6: Payment ──> Sprints 7-8: Telemetry ──> Sprints 9-10: Vetting ──> Sprints 11-12: QA & Launch
```

### Sprints 1–2: Foundation & User Credentials (Weeks 1–4)
*   Deploy Express monorepo routing architecture and MongoDB Atlas database.
*   Implement JWT user registration and login pathways (customers & technicians).
*   Integrate secure cookie sessions and Joi validation middleware.

### Sprints 3–4: Core Service & Booking Engine (Weeks 5–8)
*   Construct active service category directories (Electrician, Plumber, AC, Carpenter).
*   Build the matching engine matching customers with the nearest online technician.
*   Configure socket server connections to manage dispatch notification alerts.

### Sprints 5–6: Razorpay Escrow Payments (Weeks 9–12)
*   Integrate Razorpay SDK checkout scripts.
*   Build signature checkers, verify transaction holds, and write escrow release routers.
*   Generate automated billing invoices on job completion.

---

## 3. Launch & Deployment Milestones

```
Milestone 1: Alpha (Week 8) ──> Milestone 2: Beta (Week 10) ──> Milestone 3: Public Release (Week 12)
```

1.  **Milestone 1 (Alpha Release - Week 8)**: Internal end-to-end booking matches and database transactions pass testing on staging servers.
2.  **Milestone 2 (Beta Trial - Week 10)**: Onboard 20 trusted, local technicians for real-world dispatch test runs in Madhapur, Hyderabad.
3.  **Milestone 3 (Public Rollout - Week 12)**: Release client apps, start local digital ads, and go live.

---

## 4. Product Success Metrics (KPIs)

To evaluate HomeHero's success post-launch, the platform tracks:
- **Match Fulfilled Ratio**: Goal is $>85\%$ of emergency requests successfully accepted by a nearby technician.
- **Average Dispatch Latency**: Target is $<18$ minutes from initial booking to technician arrival.
- **Technician Churn**: Keep monthly technician account deletion/inactivity rate $<5\%$.
- **Review Averages**: Maintain platform-wide average rating of $>4.5$ stars.

---

## 5. Risks & Mitigation Plans

*   **Risk 1: Dispatch Liquidity Gaps**
    *   *Symptom*: Low number of online technicians during peak hours (e.g. night shifts) leads to long wait times.
    *   *Mitigation*: Implement dynamic night surge surcharges, directing 100% of the surge markup directly to the technician's payout.
*   **Risk 2: Disintermediation (Offline Payments)**
    *   *Symptom*: Customers and technicians transact cash offline to bypass platform fees on future visits.
    *   *Mitigation*: Protect bookings with platform-backed repair warranties. If the customer pays offline, they forfeit the warranty.
*   **Risk 3: Safety Incidents**
    *   *Symptom*: Unvetted or suspended technicians gain access to customers' homes.
    *   *Mitigation*: Enforce strict, mandatory background check status approvals in `adminController.js` before activating accounts.
