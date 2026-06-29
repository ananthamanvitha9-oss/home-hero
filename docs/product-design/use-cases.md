# HomeHero - System Use Cases Specification

**Prepared by**: Systems & Software Analyst  
**Target Audience**: Design, Development, & QA Engineering Teams  
**Focus**: Use Case Scenarios, Flow Paths, and System Exceptions

---

## 1. Authentication Module

### UC-1: Register Account & Verify Phone Number
*   **Actors**: User (Customer or Technician), SMS Gateway API.
*   **Preconditions**: User is not authenticated; phone number is not registered in the system.
*   **Main Flow**:
    1. User enters their phone number, email, password, and first/last name.
    2. System validates fields and calls SMS Gateway to send a 6-digit OTP.
    3. User enters the received OTP code.
    4. System verifies the OTP and sets account status to `isVerified: true`.
*   **Alternative Flow (Incorrect OTP)**:
    1. If the user enters an incorrect OTP, the system returns a validation error.
    2. User clicks "Resend OTP" to generate and dispatch a new code.
*   **Exceptions**:
    1. SMS Gateway is down: System returns a 500 error and logs the connection exception.
*   **Postconditions**: A new verified user account document is saved in MongoDB.

---

## 2. Booking Module

### UC-2: Book Proximity Handyman
*   **Actors**: Customer, Technician (Hero), Mapping System.
*   **Preconditions**: Customer is authenticated; customer has selected a service category.
*   **Main Flow**:
    1. Customer enters service details and sets booking address coordinates.
    2. Customer pays upfront (held in escrow).
    3. System queries online technicians within 15 km coordinates.
    4. Proximity Matchmaker dispatches job alerts to the nearest technician.
    5. Technician accepts the request; booking status changes to `accepted`.
*   **Alternative Flow (No Technicians Online)**:
    1. If no technician is found within 15 km, the search radius expands to 25 km.
    2. If still unmatched after 3 minutes, the booking changes to `cancelled` and the payment is refunded.
*   **Exceptions**:
    1. Geospatial indexing error occurs: System logs error and triggers immediate payment refund.
*   **Postconditions**: Booking record is locked to a technician; live map markers are initialized.

### UC-3: Check-in with Start OTP
*   **Actors**: Customer, Technician (Hero).
*   **Preconditions**: Booking status is `accepted`; technician has arrived at the customer's location.
*   **Main Flow**:
    1. Customer opens the app, views the 4-digit start OTP, and provides it to the technician.
    2. Technician enters the OTP in the partner app.
    3. System verifies the code and transitions status to `active` (In-Progress).
*   **Alternative Flow (OTP Mismatch)**:
    1. If the OTP is invalid, the technician's app displays an error.
    2. Customer views the OTP again and provides the correct code.
*   **Exceptions**:
    1. Offline coverage: Technician cannot contact server. System saves verification locally.
*   **Postconditions**: Booking status updates to `active` in the database.

---

## 3. Payments Module

### UC-4: Hold Escrow Payment
*   **Actors**: Customer, Razorpay API.
*   **Preconditions**: Customer is at checkout; booking has not been dispatched.
*   **Main Flow**:
    1. Customer clicks "Pay Upfront" and completes payment in the Razorpay overlay.
    2. Razorpay returns signature credentials.
    3. System verifies signature authenticity using SHA-256 HMAC.
    4. Payment record is created with `escrowStatus: 'held_in_escrow'`.
*   **Exceptions**:
    1. Signature verification fails: System logs warning, blocks booking, and alerts support.
*   **Postconditions**: Funds are secured in escrow; matchmaking query begins.

### UC-5: Release Escrow Payout
*   **Actors**: Customer, Technician (Hero), Admin, Razorpay API.
*   **Preconditions**: Booking status is `completed`; payment is currently held in escrow.
*   **Main Flow**:
    1. Customer clicks "Approve Completion" in the app (or Admin overrides in a dispute).
    2. System updates the payment status to `released`.
    3. System credits the technician’s wallet balance.
*   **Postconditions**: Wallet balance increases; invoice receipts are sent.

---

## 4. Review & Rating Module

### UC-6: Submit Job Review
*   **Actors**: Customer.
*   **Preconditions**: Booking status is `completed`; customer has not reviewed this booking before.
*   **Main Flow**:
    1. Customer enters rating (1-5 stars) and writes review comments.
    2. System saves the review document.
    3. System recalculates the average rating for the technician and updates their profile.
*   **Postconditions**: New review record is saved; technician's profile rating is updated.

---

## 5. Notifications Module

### UC-7: Dispatch Push Alerts
*   **Actors**: Customer or Technician, Firebase FCM API.
*   **Preconditions**: A system event occurred (booking matched, cancelled, or completed).
*   **Main Flow**:
    1. System registers the status update.
    2. System fetches recipient's FCM token and dispatches a push notification.
*   **Exceptions**:
    1. FCM token is stale or missing: System falls back to SMS or email channels.
*   **Postconditions**: Alert message is delivered to the device and logged in the database.

---

## 6. Admin Control Module

### UC-8: Verify Provider Profile
*   **Actors**: Admin.
*   **Preconditions**: Technician has uploaded verification documents; status is `pending`.
*   **Main Flow**:
    1. Admin reviews Aadhaar details in the vetting queue.
    2. Admin clicks "Verify Technician".
    3. System sets status to `verified` and enables booking dispatches.
*   **Postconditions**: Technician is now active and discoverable.

---

## 7. Technician Portal Module

### UC-9: Toggle Online Status
*   **Actors**: Technician (Hero).
*   **Preconditions**: Technician profile is verified and active.
*   **Main Flow**:
    1. Technician switches the online toggle on their dashboard.
    2. System updates `isOnline` in the database.
*   **Postconditions**: Technician is marked active and starts receiving dispatch requests.

---

## 8. Customer Profile Module

### UC-10: Update Personal Addresses
*   **Actors**: Customer.
*   **Preconditions**: Customer is authenticated.
*   **Main Flow**:
    1. Customer adds a new street, area, city, and pincode in their address book.
    2. Customer marks the new address as default.
    3. System saves the address list.
*   **Postconditions**: Customer profile document is updated in MongoDB.
