# HomeHero - Product Requirements Document (PRD)
**Document Version:** 2.0 (Senior Product Manager Edition)  
**Author:** Senior Product Manager  
**Date:** June 26, 2026  
**Status:** Approved for Technical Design & Architecture Scaffolding  

---

## 1. Introduction & Objectives

### 1.1 Product Vision
To build India's most reliable and accessible hyperlocal home services platform, standardizing quality, transparency, and safety while offering skilled service professionals ("Heroes") a fair, sustainable gig-economy livelihood.

### 1.2 Objective of this Document
This PRD outlines the functional and non-functional specifications, user stories, acceptance criteria, and system features for Phase 1 (MVP) and future phases. It serves as the single source of truth for the engineering, design, and QA teams.

---

## 2. Product Scope Matrix

### 2.1 MVP Features (Phase 1)
The MVP focus is on building a reliable transactional loop for four initial service lines: **Electrician, Plumber, Carpenter, and AC Repair** in a single pilot metro area.

| Feature Area | Description | Target User |
| :--- | :--- | :--- |
| **Catalog & Booking** | • Upfront itemized pricing catalog.<br>• 1-hour scheduling slots up to 7 days ahead.<br>• Senior-friendly "Simple Mode" UI toggle. | Customer |
| **Matching & Dispatch**| • Geofenced matching engine linking jobs to nearby Heroes.<br>• 90-second booking acceptance ring.<br>• Live GPS tracker for matched jobs. | Hero / Admin |
| **KYC & Onboarding** | • Digital Aadhaar/PAN validation and trade license uploads.<br>• Background verification dashboard for admin approvals. | Hero / Admin |
| **Payments & Escrow** | • UPI-first payment escrow gateway integration (Razorpay).<br>• Automated split-payments and wallet instant cashouts. | Customer / Hero |
| **Quality Control** | • Pre/Post-job photo upload checklists.<br>• Post-job rating and customer feedback loop. | Customer / Hero |

### 2.2 Future Features (Phase 2 & 3)
*   **Hero+ Subscription (AMC):** Annual maintenance packages with quarterly inspections and priority scheduling.
*   **Daily Support Services:** On-demand house cleaning, maid, cook, babysitter, and elder care.
*   **B2B Tool Micro-Leasing:** In-app equipment rentals and hardware procurement integrations.
*   **Multilingual Voice Assistant:** Support for local regional languages (Hindi, Kannada, Telugu, Tamil, etc.) for search and booking.
*   **AI Predictive Dispatch:** Route grouping and predictive matching to optimize travel times and fuel usage.

---

## 3. User Stories & Detailed Acceptance Criteria

### 3.1 User Stories

| ID | Role | User Story Statement | So That... |
| :--- | :--- | :--- | :--- |
| **US-01** | Customer | As a customer, I want to see a flat-rate upfront cost for my specific service needs (e.g., "Install Ceiling Fan"). | I can book with financial predictability and avoid haggling. |
| **US-02** | Customer | As a customer, I want to book a precise 1-hour slot (e.g., 2:00 PM - 3:00 PM) for the service. | I do not have to waste half a day waiting at home for the technician. |
| **US-03** | Customer | As an elderly customer, I want to toggle a "Simple View" accessibility mode. | I can read clear text, see high-contrast buttons, and book easily. |
| **US-04** | Hero | As a service professional, I want to receive job alerts within a 3km geofence radius. | I can minimize my travel overheads and complete more jobs per day. |
| **US-05** | Hero | As a service professional, I want to take and upload pre/post-job photos. | I am protected from false customer claims of pre-existing damage. |
| **US-06** | Admin | As an operations admin, I want to review submitted KYC documents and verify profiles. | I can approve only qualified and safe professionals for platform dispatch. |

### 3.2 Acceptance Criteria (Gherkin Format)

#### US-01: Upfront Pricing Engine
*   **Scenario: Customer selects standard repair items in the catalog**
    *   *Given* the customer is browsing the "Electrician" category on the HomeHero app.
    *   *When* they select "Ceiling Fan Installation" and specify quantity "2".
    *   *Then* the system displays a fixed rate of ₹400 (₹200 per fan) plus a ₹49 platform fee.
    *   *And* no warning of "price subject to technician review" is shown for this standard service.

#### US-02: Precise Scheduling
*   **Scenario: Customer selects scheduling slot**
    *   *Given* the customer has chosen their service items and proceeded to scheduling.
    *   *When* they view the availability calendar.
    *   *Then* they must see a grid of 1-hour slots (e.g., 10 AM - 11 AM, 11 AM - 12 PM).
    *   *And* only slots with at least one available, unassigned Hero in a 5km radius are shown as selectable.

#### US-03: Simple View Mode
*   **Scenario: Customer toggles Simple View**
    *   *Given* the customer is on any screen of the booking funnel.
    *   *When* they slide the "Simple Mode" toggle at the top of the interface.
    *   *Then* the font sizes double, color contrast shifts to AAA standards, and all non-essential tertiary fields are hidden.
    *   *And* a prominent "Voice-Note Booking" button appears.

#### US-04: Geofenced Dispatch Acceptance
*   **Scenario: Hero receives booking dispatch alert**
    *   *Given* the matching engine has selected the Hero based on location and proximity.
    *   *When* the Hero app receives the notification.
    *   *Then* a full-screen circular card appears displaying: job type, customer distance (e.g., "1.8 km away"), and gross earnings.
    *   *And* the Hero has exactly 90 seconds to tap "Accept" before the request expires and routes to the next best match.

---

## 4. Functional Requirements

### 4.1 Authentication & KYC Module
*   **FR-1.1:** The platform must support OTP-based login (via SMS and WhatsApp) for both Customers and Heroes.
*   **FR-1.2:** The Hero onboarding portal must require uploads of Aadhaar card, PAN card, bank account details, and trade certifications.
*   **FR-1.3:** The system must interface with a background verification API (AuthBridge/IDfy) to automatically validate Aadhaar data and check for criminal history.

### 4.2 Booking & Scheduling Engine
*   **FR-2.1:** The database must block double-bookings. Once a Hero is matched to a slot, that slot must be marked busy.
*   **FR-2.2:** Real-time geofenced query (PostGIS) must run upon checkout to check Hero availability within a 5km radius of the user's coordinates.
*   **FR-2.3:** Customers must be able to cancel bookings up to 12 hours before the start time for free. Within 12 hours, a cancellation fee of ₹150 is charged.

### 4.3 Payments & Escrow Module
*   **FR-3.1:** Integrate Razorpay gateway supporting UPI Intent, credit/debit cards, and Netbanking.
*   **FR-3.2:** Funds must be authorized at booking and held in a secure escrow account.
*   **FR-3.3:** The platform must split payments upon customer release: 80-85% routed to the Hero’s Razorpay Route account, and 15-20% take-rate plus platform fees routed to HomeHero's operational account.
*   **FR-3.4:** Heroes must be able to trigger "Instant Payout" to transfer funds to their registered bank accounts within 10 minutes.

### 4.4 Job Execution Checklist
*   **FR-4.1:** The partner app must prevent the Hero from marking a job "Started" until they are within 100 meters of the customer's coordinates (enforced via GPS geofencing).
*   **FR-4.2:** The Hero must upload at least one "Before" photo of the repair area to proceed.
*   **FR-4.3:** The Hero must upload at least one "After" photo and check off the cleanup statement to complete the job.

---

## 5. Non-Functional Requirements (NFRs)

### 5.1 Performance & Reliability
*   **NFR-1.1 (Latency):** The core matching engine must process geolocation matching and alert the first Hero within **45 seconds** of customer payment authorization.
*   **NFR-1.2 (Availability):** The platform must maintain a **99.9% uptime** across customer and partner-facing APIs.
*   **NFR-1.3 (Load Time):** The catalog page must load in under **2.0 seconds** on a standard 4G network connection.

### 5.2 Scalability & Database
*   **NFR-2.1 (Concurrent Users):** The backend architecture must handle up to **10,000 concurrent active users** (customers browsing and GPS pings from Heroes) without database lockouts.
*   **NFR-2.2 (Geospatial Indexing):** Spatial database tables (PostgreSQL/PostGIS) must index Hero coordinates with updates sent every **15 seconds** when Heroes are "Online".

### 5.3 Safety & Data Security
*   **NFR-3.1 (Compliance):** The platform must comply with the Indian **Digital Personal Data Protection Act (DPDPA) 2023**. Customer phone numbers must be masked; Heroes and customers connect via in-app VoIP calling or masked proxy numbers.
*   **NFR-3.2 (Encryption):** All personal identifiable information (PII) like Aadhaar numbers, PAN cards, and bank details must be encrypted at rest using AES-256 and in transit using TLS 1.3.

### 5.4 Accessibility
*   **NFR-4.1 (WCAG Compliance):** The "Simple Mode" interface must strictly comply with **WCAG 2.1 Level AAA** standards for contrast ratios (minimum 7:1 for body text) and touch-target sizes (minimum 48x48 dp).

---

## 6. Success Metrics & Telemetry

```
+-----------------------------------------------------------------------------------+
| TELEMETRY AND ANALYTICS PIPELINE                                                  |
|                                                                                   |
|  [User Actions] ------> [Mixpanel Event Capture] ------> [Fulfillment Tracking]   |
|                                                                  |
|  [App Performance] ---> [Sentry Crash Reports]   ------> [SLA Compliance Checks]  |
+-----------------------------------------------------------------------------------+
```

### 6.1 Product Success Metrics (KPIs)
*   **Booking Success Rate:** Goal of **>92%** (successfully matched and completed bookings).
*   **Disintermediation Alert Index:** Tracks when customers cancel a job within 5 minutes of the Hero arriving at the location (potential offline bypass indicator).
*   **Average Dispatch Latency:** Tracked from payment authorization to Hero acceptance (Target: < 45 seconds).
*   **App Crash Rate:** Must remain below **0.1%** of active sessions across both Customer and Partner apps.
*   **Escrow Dispute Rate:** Goal of **<1.2%** of total transactions.
