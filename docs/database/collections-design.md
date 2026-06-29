# MongoDB Collections Design Specification - HomeHero

**Prepared by**: MongoDB Database Architect  
**Target Audience**: Backend Developers, Data Engineers, & DevOps Engineers  
**Focus**: Collection design, indexing strategy, sizing metrics, and database growth rules

---

## 1. Users Collection (`users`)
- **Purpose**: Stores authentication credentials, contact details, profile verification status, and security states for all platform roles.
- **Schema Overview**:
  - `_id` (ObjectId)
  - `email` (String)
  - `phone` (String)
  - `passwordHash` (String)
  - `roleId` (ObjectId - Ref to `roles`)
  - `savedAddresses` (Array of embedded address objects)
  - `isVerified` (Boolean)
  - `isDeleted` (Boolean)
- **Relationships**:
  - Reference to `roles` (1:1).
  - Embeds `savedAddresses` (1:N denormalized, max 10 entries).
- **Indexes Required**:
  - `{ email: 1 }` (Unique)
  - `{ phone: 1 }` (Unique)
- **Estimated Document Size**: ~500 bytes (assuming 2 saved addresses).
- **Growth Strategy & Best Practices**: Growth is linear based on signups. Set unique constraints to prevent duplicate logins.

---

## 2. Technicians Collection (`technicians`)
- **Purpose**: Houses trade categories, verified status, geographical telemetry coordinates, ratings, and wallet balances.
- **Schema Overview**:
  - `_id` (ObjectId)
  - `userId` (ObjectId - Ref to `users`)
  - `skills` (Array of Strings)
  - `experienceYears` (Number)
  - `isOnline` (Boolean)
  - `rating` (Number)
  - `currentLocation` (GeoJSON Point)
  - `walletBalance` (Number)
- **Relationships**:
  - Reference to `users` (1:1).
- **Indexes Required**:
  - `{ userId: 1 }` (Unique)
  - `{ currentLocation: "2dsphere" }` (Geospatial lookup)
- **Estimated Document Size**: ~600 bytes.
- **Growth Strategy**: Supply-side growth. Clean `isOnline` toggling keeps active searches fast.

---

## 3. Services Collection (`services`)
- **Purpose**: Defines active categories (Electrician, Plumber, Carpenter, AC Repair) and standard rate rules.
- **Schema Overview**:
  - `_id` (ObjectId)
  - `name` (String)
  - `category` (String)
  - `basePrice` (Number)
  - `hourlyRate` (Number)
  - `isActive` (Boolean)
- **Indexes Required**:
  - `{ category: 1 }`
- **Estimated Document Size**: ~300 bytes.
- **Growth Strategy**: Under 100 documents total. Cache permanently in Redis.

---

## 4. Bookings Collection (`bookings`)
- **Purpose**: Orchestrates state transitions, billing audits, start OTPs, and checklist verifications.
- **Schema Overview**:
  - `_id` (ObjectId)
  - `bookingCode` (String)
  - `customerId` (ObjectId - Ref to `users`)
  - `technicianId` (ObjectId - Ref to `technicians`)
  - `serviceCategory` (String)
  - `status` (Enum)
  - `billing` (Embedded: base, surge, total)
  - `startOtp` (String)
  - `checklist` (Array of embedded task objects with photo URLs)
- **Relationships**:
  - References to `users` (Customer) and `technicians`.
- **Indexes Required**:
  - `{ bookingCode: 1 }` (Unique)
  - `{ customerId: 1, createdAt: -1 }` (History lookup)
  - `{ technicianId: 1, status: 1 }`
- **Estimated Document Size**: ~1.5 KB (with photo URLs).
- **Growth Strategy**: High growth. Archive completed bookings older than 2 years to colder storage.

---

## 5. Payments Collection (`payments`)
- **Purpose**: Manages payment gateway order IDs, held escrow status, and split clearances.
- **Schema Overview**:
  - `_id` (ObjectId)
  - `bookingId` (ObjectId - Ref to `bookings`)
  - `paymentStatus` (Enum: created, successful, failed)
  - `escrowStatus` (Enum: held_in_escrow, released, refunded)
  - `amount` (Number)
  - `invoiceNumber` (String)
- **Relationships**:
  - Reference to `bookings` (1:1).
- **Indexes Required**:
  - `{ bookingId: 1 }` (Unique)
- **Estimated Document Size**: ~400 bytes.
- **Growth Strategy**: Linear matching with bookings. Maintain immutable audit entries.

---

## 6. Reviews Collection (`reviews`)
- **Purpose**: Customer feedback ratings and proof photos for completed bookings.
- **Schema Overview**:
  - `_id` (ObjectId)
  - `bookingId` (ObjectId - Ref to `bookings`)
  - `customerId` (ObjectId - Ref to `users`)
  - `technicianId` (ObjectId - Ref to `technicians`)
  - `rating` (Number)
  - `comment` (String)
- **Indexes Required**:
  - `{ technicianId: 1, rating: -1 }`
- **Estimated Document Size**: ~500 bytes.
- **Growth Strategy**: Linked directly to completed bookings. Use text indexing for keyword searches.

---

## 7. Notifications Collection (`notifications`)
- **Purpose**: Ephemeral message log for FCM notifications and SMS alerts.
- **Schema Overview**:
  - `_id` (ObjectId)
  - `recipientId` (ObjectId - Ref to `users`)
  - `title` (String)
  - `body` (String)
  - `isRead` (Boolean)
  - `createdAt` (Date)
- **Indexes Required**:
  - `{ recipientId: 1, isRead: 1 }`
  - `{ createdAt: 1 }` (TTL index of 30 days)
- **Estimated Document Size**: ~350 bytes.
- **Growth Strategy**: High transaction rate. Clean database size automatically using a 30-day TTL index.

---

## 8. Addresses Collection (`addresses`)
- **Purpose**: Denormalized address definitions embedded inside the `users` collection to optimize read latency.
- **Schema Overview**:
  - Label, Street, Area, City, Pincode, coordinates.
- **Estimated Document Size**: ~150 bytes per address entry.
- **Best Practices**: Cap the array length to 10 entries per user to prevent document bloating.

---

## 9. Roles Collection (`roles`)
- **Purpose**: Maps user roles to permission scopes.
- **Schema Overview**:
  - `_id` (ObjectId)
  - `name` (String: customer, technician, admin)
  - `permissions` (Array of Strings)
- **Estimated Document Size**: ~200 bytes.
- **Best Practices**: Keep values static. Cache collections in memory on server start.

---

## 10. Permissions Collection (`permissions`)
- **Purpose**: Static resource lookup listing permission names.
- **Schema Overview**:
  - `_id` (ObjectId)
  - `name` (String: e.g. `booking:create`, `technician:vet`)
- **Estimated Document Size**: ~100 bytes.
- **Best Practices**: Used as a static reference for role matrices.

---

## 11. OTP Verification Collection (`otp_verifications`)
- **Purpose**: Ephemeral stores holding temporary SMS login tokens.
- **Schema Overview**:
  - `_id` (ObjectId)
  - `phone` (String)
  - `code` (String)
  - `createdAt` (Date)
- **Indexes Required**:
  - `{ phone: 1 }`
  - `{ createdAt: 1 }` (TTL index of 5 minutes)
- **Estimated Document Size**: ~150 bytes.
- **Growth Strategy**: Fast cycles. Clean collections automatically using a 5-minute TTL index.

---

## 12. Support Tickets Collection (`support_tickets`)
- **Purpose**: Log dispute tickets for failed check-ins or billing complaints.
- **Schema Overview**:
  - `_id` (ObjectId)
  - `bookingId` (ObjectId - Ref to `bookings`)
  - `userId` (ObjectId - Ref to `users`)
  - `issue` (String)
  - `status` (Enum: open, closed)
- **Indexes Required**:
  - `{ status: 1, createdAt: -1 }`
- **Estimated Document Size**: ~800 bytes.
- **Growth Strategy**: Keep log references historical.
