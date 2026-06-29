# HomeHero - User Journeys Mapping

This document maps the user journeys for the primary personas of the HomeHero platform.

---

## 1. Customer Emergency Booking Journey

```
[Need Plumber] ──> [Select Category] ──> [Estimate Price] ──> [Checkout (Escrow)] ──> [Track Arrival] ──> [OTP Checkin] ──> [Job Sign-off]
```

*   **Step 1: Need Identification**: Priya experiences an active pipe leak under her sink. She feels stressed and needs an immediate solution.
*   **Step 2: Category Discovery**: She opens the HomeHero app, clicks "Plumber", and sees the transparent base and hourly rates.
*   **Step 3: Pre-Authorized Checkout**: Priya agrees to the estimate. She pays upfront via UPI; her funds are held securely in escrow.
*   **Step 4: Real-time Dispatch**: The system matches the nearest plumber (Ramesh). Priya tracks Ramesh's real-time arrival on the map.
*   **Step 5: Check-in**: Ramesh arrives, inspects the leak, and Priya provides the 4-digit start OTP to begin the job.
*   **Step 6: Completion & Feedback**: Ramesh resolves the leak. Priya signs off on the checklist, releasing the escrow payment, and leaves a 5-star review.

---

## 2. Technician (Hero) Dispatch Fulfillment Journey

```
[Go Online] ──> [Receive Alert] ──> [Accept Job] ──> [Navigate (GPS)] ──> [Start with OTP] ──> [Complete & Upload] ──> [Instant Cashout]
```

*   **Step 1: Go Online**: Ramesh toggles the availability switch in his partner app to "Online".
*   **Step 2: Receive Job Alert**: Ramesh receives a push notification and audio alert for a plumbing job 2.5 km away, showing a ₹450 estimated payout.
*   **Step 3: Accept Job**: Ramesh clicks "Accept" within the 90-second window.
*   **Step 4: Navigate**: The app opens Google Maps navigation directing Ramesh to Priya's address.
*   **Step 5: Verify & Begin**: Upon arrival, Ramesh gets the start OTP from Priya, enters it, and the status changes to `active`.
*   **Step 6: Resolve & Release**: Ramesh completes the repair, uploads a post-job photo, and submits the checklist. The customer signs off, and the funds are instantly deposited into Ramesh's wallet.
