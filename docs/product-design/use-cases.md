# HomeHero - Use Cases Specification

This document maps all core system interactions using use case specifications.

---

## 1. Actor Definitions
- **Customer**: Books service requests, holds payments in escrow, tracks technician telemetry, and submits ratings.
- **Technician (Hero)**: Toggles availability, accepts/rejects jobs, performs checklist tasks, and withdraws wallet funds.
- **Admin**: Suspends accounts, approves technician credentials in vetting queues, and manages surge pricing settings.

---

## 2. Core Use Cases Diagram (UML Representation)

```mermaid
leftToRightDirection
actor Customer
actor Technician
actor Admin

rectangle HomeHero_System {
  Customer --> (Book Service & Pay Escrow)
  Customer --> (Track Live GPS Location)
  Customer --> (Review & Rate Service)
  
  (Match Proximity Hero) .> (Book Service & Pay Escrow) : include
  
  Technician --> (Accept / Reject Job Offer)
  Technician --> (Complete Checklist Tasks)
  Technician --> (Withdraw Wallet Balance)
  
  Admin --> (Vet Technician Profile)
  Admin --> (Update Surge Pricing Surcharges)
}
```

---

## 3. Detailed Use Case: Match Proximity Hero

*   **Primary Actor**: System matching engine.
*   **Preconditions**: Customer pre-authorized the escrow payment hold; at least one technician with matching skills is online within a 15 km radius.
*   **Happy Path Flow**:
    1. Customer completes checkout and the payment changes to `held_in_escrow`.
    2. System queries the database for online technicians near the customer's coordinates.
    3. The nearest available technician is selected and receives a dispatch notification.
    4. The technician accepts the job, and the booking changes to `accepted`.
*   **Alternate Flow (No Technicians Online)**:
    1. If no online technician is found within 15 km, the search radius expands to 25 km.
    2. If still unmatched after 3 minutes, the booking changes to `cancelled` and the payment is refunded.
