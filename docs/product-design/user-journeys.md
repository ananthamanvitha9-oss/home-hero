# HomeHero - User Journeys & Flowchart Specifications

This document defines the end-to-end user journeys for the **Customer**, **Technician**, and **Administrator** personas.

---

## 1. Customer User Journey

### 1.1 Customer Flow Diagram
```mermaid
flowchart TD
  A[First Visit / Landing] --> B[Enter Phone Number]
  B --> C{OTP Verified?}
  C -- No --> B
  C -- Yes --> D[Select Service Category]
  D --> E[Configure Address & Details]
  E --> F[Generate Estimate Quote]
  F --> G{Accept Estimate?}
  G -- No --> D
  G -- Yes --> H[Razorpay Escrow Payment Checkout]
  H --> I{Payment Successful?}
  I -- No --> H
  I -- Yes --> J[Dispatched Search Matchmaker]
  J --> K{Technician Found?}
  K -- No --> L[Automated Escrow Refund]
  K -- Yes --> M[Live Tracking & OTP Generation]
  M --> N[Provide OTP to Technician]
  N --> O[Repairs Complete & Sign-off]
  O --> P[Release Escrow & Rate Service]
```

### 1.2 Customer Pain Points, Decisions, & Edge Cases
*   **Edge Case: No Match Found**: If no technician accepts the job within 3 minutes, the platform cancels the booking and triggers an automatic refund to prevent funds from being locked in escrow.
*   **Error Recovery: Invalid OTP**: If the technician enters an incorrect OTP, the customer app prompts the customer to regenerate or view their secure start OTP on screen.

---

## 2. Technician (Hero) User Journey

### 2.1 Technician Flow Diagram
```mermaid
flowchart TD
  A[Open App & Log in] --> B[Toggle Online Status]
  B --> C[Standby State]
  C --> D{Job Dispatched Nearby?}
  D -- Yes --> E[90-second Countdown Alert]
  E --> F{Accept Job?}
  F -- No --> G[Re-dispatch to Next Hero]
  F -- Yes --> H[Open Maps Navigation]
  H --> I[Arrive & Input Customer OTP]
  I --> J{OTP Verified?}
  J -- No --> I
  J -- Yes --> K[Perform Checklist Tasks]
  K --> L[Upload Post-job Photos]
  L --> M[Customer Sign-off Confirmation]
  M --> N[Instant Wallet Payout Deposit]
  N --> O[Withdraw to UPI]
```

### 2.2 Technician Edge Cases & Decisions
*   **Edge Case: Customer Absent**: If the technician arrives but the customer is absent and does not answer their phone, the technician can trigger a "Customer No-Show" cancellation request after waiting 10 minutes, collecting a flat inconvenience fee.
*   **Error Recovery: Upload Failures**: If poor network coverage blocks checklist photo uploads, the app saves the media locally and syncs it automatically once the connection is restored.

---

## 3. Administrator User Journey

### 3.1 Admin Flow Diagram
```mermaid
flowchart TD
  A[Log in to Admin Console] --> B[Dashboard Overview]
  B --> C{Action Needed?}
  C -- Approve Provider --> D[Review Aadhaar Upload Queue]
  D --> E{Details Valid?}
  E -- Yes --> F[Approve Status to Verified]
  E -- No --> G[Reject & Request Re-upload]
  C -- Set Surge Multiplier --> H[Open Pricing Settings]
  H --> I[Update Surcharge Sliders]
  C -- Resolve Dispute --> J[Open Escrow Journal]
  J --> K[Initiate Refund or Manual Payout]
```

### 3.2 Admin Edge Cases
*   **Edge Case: Fraudulent Document Uploads**: If a technician uploads a forged Aadhaar card, the admin suspends the account, logs the IP address, and blocks future registration attempts from that phone number.
