# Product Requirements Document (PRD): HomeHero

**Document Status:** Approved  
**Author:** Senior Product Manager, HomeHero Technologies Pvt. Ltd.  
**Target Release:** MVP (Phase 1)  
**Date:** June 26, 2026  

---

## 1. Product Overview & Objectives
HomeHero is a hyperlocal, on-demand home services platform for India. It connects customers in high-density urban residential areas with background-verified service professionals ("Heroes") in under 30 minutes.

### Objectives:
*   Standardize pricing and service quality for emergency repairs (Electrician, Plumber, Carpenter, AC Repair).
*   Create a secure transaction loop using Razorpay payment escrow holds.
*   Enforce service accountability via mandatory photo verification checklists in the client and partner apps.
*   Empower gig workers with lower commissions (15%) and same-day UPI payouts.

---

## 2. User Roles
1.  **Customer:** Urban residents who need home services, book dispatches, pay upfront escrow holds, track technician arrival, and sign off on completion.
2.  **Technician (Hero):** Independent service professionals who toggle online status, accept job broadcasts, follow task checklists, upload verification photos, and withdraw earnings.
3.  **Administrator:** Operations team members who verify technician credentials in a vetting queue, adjust pricing surge settings, and resolve billing disputes.

---

## 3. Functional Requirements

| ID | Module | Feature Description | Priority |
| :--- | :--- | :--- | :--- |
| **FR-1** | User Auth | Secure mobile sign-up with OTP verification and JWT role-based session guards. | P0 |
| **FR-2** | Estimation | Real-time billing estimation based on service categories, base rates, and active surge multipliers. | P0 |
| **FR-3** | Payments | Integrate Razorpay Checkout to hold payment in escrow upon booking creation. | P0 |
| **FR-4** | Dispatcher | Geospatial broadcast loop (Socket.io) targeting active technicians within a 5km radius. | P0 |
| **FR-5** | Telemetry | Real-time GPS location tracking of matched technicians on the customer map interface. | P1 |
| **FR-6** | Checklists | Mandatory pre-work and post-work checklist items with photo upload verification. | P0 |
| **FR-7** | Payouts | Release escrow funds to the partner wallet upon customer confirmation, allowing instant UPI withdrawals. | P0 |
| **FR-8** | Vetting Console | Admin dashboard showing pending technician Aadhaar uploads for manual approval. | P0 |
| **FR-9** | Surge Controls | Admin panel sliders to adjust holiday, monsoon rain, and night surcharge pricing. | P1 |

---

## 4. Non-Functional Requirements

### 1. Performance & Latency
*   **Matching Latency:** Geospatial dispatch query must select and send offers to nearby technicians in under 3 seconds.
*   **GPS Refresh Rate:** Technician location coordinates must update on the customer tracking map every 5 seconds.
*   **Page Load SLA:** Main dashboard views must render in under 1.5 seconds on a standard 3G connection.

### 2. Security & Compliance
*   **KYC Encryption:** Aadhaar numbers and verification files must be encrypted in transit (HTTPS) and at rest (AES-256).
*   **Session Guards:** Restrict access to technician and admin dashboard controllers using role-based JWT validations.
*   **Escrow Security:** All payouts and refunds must be authenticated via HMAC-SHA256 signature verification.

### 3. Scalability & Availability
*   **System Availability:** Core API servers must maintain 99.9% uptime.
*   **Concurrent Bookings:** The geospatial engine must support up to 5,000 active matching loops per city.

---

## 5. Detailed User Stories & Acceptance Criteria

### User Story 1: Pre-Authorized Escrow Checkout
**As a** customer,  
**I want to** pay the service estimate upfront via UPI or Card,  
**So that** my booking is secured and held in escrow while a technician is matched.

#### Acceptance Criteria:
1.  **Given** the customer completes their service configuration,  
    **When** they click "Pre-authorize Booking",  
    **Then** the app must open the Razorpay Checkout overlay for the estimated total.
2.  **Given** the Razorpay signature verification is successful,  
    **When** the webhook triggers,  
    **Then** the database booking status must update to `matched` and create an escrow record with status `held_in_escrow`.

---

### User Story 2: Geospatial Dispatch Broadcast
**As a** technician,  
**I want to** receive a real-time job offer alert when I am online and near a customer request,  
**So that** I can review the earnings and accept the work.

#### Acceptance Criteria:
1.  **Given** the technician's working mode switch is toggled "Online",  
    **When** a nearby booking is created,  
    **Then** the app must show a 90-second countdown alert showing service type, customer address, and payout amount.
2.  **Given** the technician accepts the job within 90 seconds,  
    **When** the server processes the response,  
    **Then** the dispatch loop must end, lock the booking to this technician, and update the status to `accepted`.

---

### User Story 3: Verification Checklist Photo Uploads
**As a** technician,  
**I want to** upload pre-work and post-work photos for required tasks,  
**So that** the work is verified and I am protected against false complaints.

#### Acceptance Criteria:
1.  **Given** the booking status is `in_progress`,  
    **When** the technician performs the service,  
    **Then** they must upload at least one photo for each milestone (e.g. pre-inspection, completed repair).
2.  **Given** any checklist task is incomplete,  
    **When** the technician tries to click "Complete Service",  
    **Then** the app must block the action and show a validation warning.

---

### User Story 4: Manual Escrow Release Control
**As an** administrator,  
**I want to** manually release escrow payouts or trigger refunds,  
**So that** I can quickly resolve customer billing disputes.

#### Acceptance Criteria:
1.  **Given** the booking is in `completed` status but the payout is still held,  
    **When** the admin clicks "Release Payout",  
    **Then** the system must invoke the payment gateway, update the escrow status to `released`, and credit the technician’s wallet.

---

## 6. Release Feature Matrix

| Feature Module | MVP (Phase 1) | Future Release (Phase 2+) |
| :--- | :--- | :--- |
| **Emergency Services** | Electrician, Plumber, Carpenter, AC Repair | Maid, Cook, Babysitter, Deep Cleaning, Elder Care |
| **Escrow Management** | Auto-release on customer sign-off | 24h auto-release fallback rules |
| **Surge Pricing** | Holiday, monsoon rain, night multipliers | Real-time demand and technician density surge |
| **Work Vetting** | Manual Aadhaar verification queues | Automated UIDAI (Aadhaar) API integrations |
| **Safety Integration** | Local map tracking | Safety SOS panic button (Police + Security alert) |
| **Customer Loyalty** | Simple referral credits | Subscription plan passes ("HeroPass") |
