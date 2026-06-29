# HomeHero - Wireframe Specifications

This document outlines the layout structure, input fields, and UI widgets for HomeHero's primary screens.

---

## 1. Customer Live Tracking Map View (`/booking-status/:id`)

```
┌─────────────────────────────────────────────────────────────┐
│ [← Back]              HomeHero Tracking             [Status]│
├─────────────────────────────────────────────────────────────┤
│                                                             │
│                                                             │
│                      [Google Map Frame]                     │
│               (Technician Marker -> Customer Marker)        │
│                                                             │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│  Technician: Ramesh Kumar           ETA: 12 mins            │
│  Phone: +91 90000 00000             [Call Hero]             │
├─────────────────────────────────────────────────────────────┤
│  Start OTP: [ 7 ][ 4 ][ 2 ][ 9 ]                            │
│  Provide this code to the technician to begin the repair.   │
└─────────────────────────────────────────────────────────────┘
```

- **Top Bar**: Navigation back button and the current booking status (e.g. `accepted`, `en_route`).
- **Map Container**: Embeds Google Map JS SDK, rendering paths and real-time technician markers via Socket coordinates.
- **Hero Card**: Displays matched technician's name, profile photo, and an action button to trigger direct calls.
- **OTP Banner**: A high-visibility card showing the 4-digit start OTP required to unlock job progression.

---

## 2. Technician Job Queue Panel (`/technician-dashboard`)

```
┌─────────────────────────────────────────────────────────────┐
│ [Menu]            Technician Portal          [Online Switch]│
├─────────────────────────────────────────────────────────────┤
│  ACTIVE JOB: Plumbing Repair (BKG-48271)                    │
│  Client: Priya Iyer                                         │
│  Address: Flat 4B, Gachibowli                               │
│  Payout: ₹450                                               │
├─────────────────────────────────────────────────────────────┤
│  JOB CHECKLIST:                                             │
│  [x] Pre-job photo upload             [Upload Photo]        │
│  [ ] Perform repairs                  [Completed]           │
│  [ ] Post-job photo upload & signoff  [Upload Photo]        │
├─────────────────────────────────────────────────────────────┤
│                                   [Complete Service]        │
└─────────────────────────────────────────────────────────────┘
```

- **Online Switch Toggle**: In-header control updating the technician's availability (`isOnline`).
- **Dispatch Detail Card**: Renders active job data, customer contact, and payout details.
- **Checklist Sync**: A list of mandatory tasks that must be checked off before the technician can click "Complete Service".
