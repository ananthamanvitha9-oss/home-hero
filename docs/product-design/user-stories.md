# HomeHero - User Stories & Acceptance Criteria

This document details the user stories and Gherkin-style acceptance tests for the core **HomeHero** MVP modules.

---

## 1. Epic: Authentication & Session Access

### US-1.1: Customer Mobile Verification
**As a** customer,  
**I want to** register and authenticate using my mobile number and OTP,  
**So that** my profile is securely verified.

- **Acceptance Criteria**:
  - **Given** the customer lands on the signup form page,  
    **When** they enter their mobile phone number,  
    **Then** the server must generate and send a 6-digit OTP code to their phone.
  - **Given** the customer receives the OTP,  
    **When** they submit the code within the 5-minute validity window,  
    **Then** their account is marked `isVerified: true` and a session token is issued.

---

## 2. Epic: Geospatial Matchmaker Dispatching

### US-2.1: Nearest Technician matching
**As a** customer,  
**I want the system to** automatically match my emergency request with the nearest online technician,  
**So that** my repairs are addressed as quickly as possible.

- **Acceptance Criteria**:
  - **Given** a customer submits a booking checkout request,  
    **When** the geospatial matching query runs,  
    **Then** the query must find technicians who are `isOnline: true` within a 15 km radius.
  - **Given** a technician is matched,  
    **When** they accept the job request,  
    **Then** the booking is locked to them and the status changes to `accepted`.

---

## 3. Epic: Escrow Payments Checkout

### US-3.1: Pre-authorized Escrow Hold
**As a** customer,  
**I want my payment to** be held in escrow upon booking,  
**So that** I know my funds are secure until the service is complete.

- **Acceptance Criteria**:
  - **Given** the customer initiates checkout,  
    **When** the Razorpay modal opens and they complete payment,  
    **Then** the transaction status changes to `held_in_escrow` in the database.
  - **Given** the booking status changes to `completed` and the customer signs off,  
    **When** the release endpoint is called,  
    **Then** the escrow funds are released and credited to the technician's wallet.
