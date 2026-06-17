# HomeHero - Database Schema & Design Document

## 1. Database Architecture & Technology Decision
For **HomeHero**, we are using **PostgreSQL** as the primary relational database. This decision is driven by:
*   **ACID Compliance:** Transactions (escrow payment releases, wallet payouts) require absolute consistency.
*   **PostGIS Extension:** Critical for running fast geographic query operators (e.g., finding online Heroes within 15 miles of a booking location).
*   **Rich JSONB Support:** Allows flexibility in storing service-specific configurations (e.g., distinct fields for Deep Cleaning vs. HVAC repairs).

---

## 2. Entity-Relationship Diagram (ERD)

```mermaid
erDiagram
    USERS ||--|| PROFILES : "has one"
    USERS ||--o[ BOOKINGS : "places as customer"
    USERS ||--o[ BOOKINGS : "fulfills as provider (Hero)"
    USERS ||--o[ SUBSCRIPTIONS : "subscribes to Hero+"
    BOOKINGS ||--|| DISPATCHES : "has status"
    BOOKINGS ||--o| REVIEWS : "receives"
    BOOKINGS ||--|| TRANSACTIONS : "generates payment"
    SERVICES ||--o{ BOOKINGS : "categorizes"
    SERVICES ||--o{ PRICING_RULES : "uses"

    USERS {
        uuid id PK
        varchar email UK
        varchar phone UK
        varchar password_hash
        varchar role "customer | provider | admin"
        timestamp created_at
        timestamp updated_at
    }

    PROFILES {
        uuid id PK
        uuid user_id FK
        varchar first_name
        varchar last_name
        varchar avatar_url
        geometry location_lat_long
        varchar verification_status "unverified | pending | verified"
        jsonb meta_details
        timestamp updated_at
    }

    SERVICES {
        uuid id PK
        varchar name UK "Cleaning, Handyman, etc."
        varchar description
        boolean is_active
        timestamp created_at
    }

    PRICING_RULES {
        uuid id PK
        uuid service_id FK
        numeric base_price
        numeric hourly_rate
        jsonb dynamic_modifiers "extra bedroom multiplier, etc."
        timestamp updated_at
    }

    BOOKINGS {
        uuid id PK
        uuid customer_id FK
        uuid provider_id FK
        uuid service_id FK
        varchar status "pending | matched | en_route | active | completed | cancelled"
        numeric total_amount
        numeric platform_commission
        timestamp scheduled_time
        geometry service_location
        timestamp created_at
        timestamp updated_at
    }

    DISPATCHES {
        uuid id PK
        uuid booking_id FK
        uuid provider_id FK
        varchar status "offered | accepted | declined | timeout"
        timestamp sent_at
        timestamp responded_at
    }

    REVIEWS {
        uuid id PK
        uuid booking_id FK
        uuid reviewer_id FK
        uuid reviewee_id FK
        integer rating "1-5 stars"
        text comment
        timestamp created_at
    }

    TRANSACTIONS {
        uuid id PK
        uuid booking_id FK
        varchar stripe_payment_intent_id UK
        varchar stripe_transfer_id UK
        numeric gross_amount
        numeric net_to_provider
        numeric platform_fee
        varchar status "held_in_escrow | released | refunded | failed"
        timestamp created_at
    }

    SUBSCRIPTIONS {
        uuid id PK
        uuid user_id FK
        varchar stripe_subscription_id UK
        varchar plan_status "active | trialing | cancelled | past_due"
        timestamp current_period_end
        timestamp created_at
    }
```

---

## 3. Data Dictionary & Table Schemas

### 3.1 `users` Table
Stores primary accounts and credentials.

| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `UUID` | `PRIMARY KEY`, `DEFAULT gen_random_uuid()` | Unique identifier. |
| `email` | `VARCHAR(255)` | `UNIQUE`, `NOT NULL` | User's email address. |
| `phone` | `VARCHAR(20)` | `UNIQUE`, `NOT NULL` | Mobile number for OTP validation. |
| `password_hash` | `VARCHAR(255)` | `NOT NULL` | Bcrypt hashed password. |
| `role` | `VARCHAR(20)` | `NOT NULL`, `CHECK(role IN ('customer', 'provider', 'admin'))` | Defines account type. |
| `created_at` | `TIMESTAMP` | `DEFAULT NOW()` | Record creation time. |
| `updated_at` | `TIMESTAMP` | `DEFAULT NOW()` | Last update timestamp. |

### 3.2 `profiles` Table
Stores user demographic profiles and status information.

| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `UUID` | `PRIMARY KEY` | Unique profile ID. |
| `user_id` | `UUID` | `FOREIGN KEY REFERENCES users(id) ON DELETE CASCADE` | Link to user account. |
| `first_name` | `VARCHAR(100)` | `NOT NULL` | First name. |
| `last_name` | `VARCHAR(100)` | `NOT NULL` | Last name. |
| `avatar_url` | `VARCHAR(255)` | | Profile picture URL. |
| `location_lat_long` | `GEOGRAPHY(Point, 4326)` | | PostGIS geolocation coordinates. |
| `verification_status` | `VARCHAR(20)` | `DEFAULT 'unverified'` | Identity/license vetting state. |
| `meta_details` | `JSONB` | `DEFAULT '{}'` | Metadata (car details, cleaner preferences). |

### 3.3 `bookings` Table
Core transactional table holding client bookings and matching states.

| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `UUID` | `PRIMARY KEY` | Booking identifier. |
| `customer_id` | `UUID` | `FOREIGN KEY REFERENCES users(id)` | Customer placing order. |
| `provider_id` | `UUID` | `FOREIGN KEY REFERENCES users(id) NULL` | Service provider assigned (null initially). |
| `service_id` | `UUID` | `FOREIGN KEY REFERENCES services(id)` | Core service category booked. |
| `status` | `VARCHAR(25) | `NOT NULL DEFAULT 'pending'` | Booking lifecycle state. |
| `total_amount` | `NUMERIC(10,2)`| `NOT NULL` | Total cost of work. |
| `platform_commission`| `NUMERIC(10,2)`| `NOT NULL` | HomeHero's take slice. |
| `scheduled_time` | `TIMESTAMP` | `NOT NULL` | Date/time of scheduled appointment. |
| `service_location` | `GEOGRAPHY(Point, 4326)`| `NOT NULL` | Job execution coordinate. |

---

## 4. Indexes & Performance Optimization

### 4.1 PostGIS Spatial Index
To locate online Service Providers (Heroes) nearby within milliseconds, we must index geographic points:
```sql
CREATE INDEX idx_profiles_location ON profiles USING GIST (location_lat_long);
```

### 4.2 Composite & Lookup Indexes
To speed up query joins across the relational structures:
```sql
-- Indexes for active searches & bookings dashboard loading
CREATE INDEX idx_bookings_customer_id ON bookings(customer_id);
CREATE INDEX idx_bookings_provider_id ON bookings(provider_id);
CREATE INDEX idx_bookings_status ON bookings(status);

-- Unique index for stripe search mapping
CREATE UNIQUE INDEX idx_transactions_stripe_pi ON transactions(stripe_payment_intent_id);
```

---

## 5. Security Policies (RLS)
Since HomeHero handles private geographical tracking data and transactions, PostgreSQL **Row Level Security (RLS)** is enabled:
*   **Customer Profile Access:** Customers can only read profiles of Heroes matched to their current active bookings, and their own profile details.
*   **Transaction Isolation:** Users can only view payment items referencing bookings they are party to (customer or provider).

---

## 6. Alternative NoSQL Architecture: MongoDB Schema Design
For scaling to hundreds of thousands of concurrent location matches and handling highly dynamic, non-uniform service configurations, a **Document Database (MongoDB)** is an excellent fit. Below is the startup-grade MongoDB schema design.

### 6.1 Architectural Rationale
*   **Flexible Service Payload:** Different service types (e.g., Deep Cleaning vs. AC Repair) require completely different forms/details. JSON documents avoid sparse columns in SQL.
*   **Geospatial Tracking:** MongoDB has native support for GeoJSON and `2dsphere` indexes, allowing efficient spherical geometry queries.
*   **High Write Performance:** Rapid GPS updates from active technicians can be written to MongoDB with sub-millisecond latencies.

---

### 6.2 Collections & BSON Schemas

#### A. `users` Collection
Stores credential records and basic profile information.
```json
{
  "_id": ObjectId("60d5ec9f8f1b2c3d4e5f6g71"),
  "email": "sarah.chen@example.com",
  "phone": "+919876543210",
  "passwordHash": "$2a$10$X7eR...",
  "role": "customer",
  "firstName": "Sarah",
  "lastName": "Chen",
  "avatarUrl": "https://cdn.homehero.com/avatars/sarah.png",
  "createdAt": ISODate("2026-06-17T10:00:00Z"),
  "updatedAt": ISODate("2026-06-17T10:00:00Z")
}
```

#### B. `technicians` Collection
Stores professional profiles, skills, verification state, and live telemetry data.
```json
{
  "_id": ObjectId("60d5ec9f8f1b2c3d4e5f6g72"),
  "userId": ObjectId("60d5ec9f8f1b2c3d4e5f6g73"),
  "skills": ["cleaning", "plumbing"],
  "rating": 4.9,
  "verification": {
    "status": "verified",
    "licenseVerified": true,
    "backgroundCheckStatus": "passed",
    "verifiedAt": ISODate("2026-05-10T12:00:00Z")
  },
  "currentLocation": {
    "type": "Point",
    "coordinates": [78.382021, 17.426210] 
  },
  "isOnline": true,
  "serviceRadiusKm": 15,
  "wallet": {
    "balance": 4850.00,
    "stripeAccountId": "acct_1H62bL..."
  },
  "updatedAt": ISODate("2026-06-17T10:08:00Z")
}
```

#### C. `services` Collection
Stores categories and dynamic pricing coefficients.
```json
{
  "_id": ObjectId("60d5ec9f8f1b2c3d4e5f6g74"),
  "name": "Cleaning",
  "isActive": true,
  "pricingRules": {
    "basePrice": 1200.00,
    "hourlyRate": 400.00,
    "modifiers": {
      "roomMultiplier": 1.2,
      "petSurcharge": 300.00,
      "ecoSuppliesPremium": 200.00
    }
  }
}
```

#### D. `bookings` Collection
Maps transactions, schedules, and active checklist tracking.
```json
{
  "_id": ObjectId("60d5ec9f8f1b2c3d4e5f6g75"),
  "bookingCode": "BKG-849021",
  "customerId": ObjectId("60d5ec9f8f1b2c3d4e5f6g71"),
  "technicianId": ObjectId("60d5ec9f8f1b2c3d4e5f6g72"),
  "serviceId": ObjectId("60d5ec9f8f1b2c3d4e5f6g74"),
  "status": "en_route",
  "billing": {
    "totalAmount": 1700.00,
    "platformCommission": 255.00,
    "taxAmount": 150.00,
    "netToHero": 1295.00
  },
  "scheduledTime": ISODate("2026-06-20T14:00:00Z"),
  "address": {
    "street": "Flat 402, Block C, Whitehouse Apts",
    "area": "Gachibowli",
    "city": "Hyderabad",
    "pincode": "500032",
    "geoPoint": {
      "type": "Point",
      "coordinates": [78.384010, 17.428100]
    }
  },
  "checklist": [
    { "task": "Pre-job photo upload", "completed": true, "timestamp": ISODate("2026-06-20T13:45:00Z") },
    { "task": "Kitchen surfaces sanitization", "completed": false },
    { "task": "Post-job signoff signature", "completed": false }
  ],
  "createdAt": ISODate("2026-06-17T10:05:00Z"),
  "updatedAt": ISODate("2026-06-17T10:08:00Z")
}
```

#### E. `reviews` Collection
Stores customer reviews.
```json
{
  "_id": ObjectId("60d5ec9f8f1b2c3d4e5f6g76"),
  "bookingId": ObjectId("60d5ec9f8f1b2c3d4e5f6g75"),
  "reviewerId": ObjectId("60d5ec9f8f1b2c3d4e5f6g71"),
  "revieweeId": ObjectId("60d5ec9f8f1b2c3d4e5f6g72"),
  "rating": 5,
  "comment": "Marcus did an excellent cleaning job on our balcony windows. Highly recommended!",
  "createdAt": ISODate("2026-06-20T15:30:00Z")
}
```

#### F. `payments` Collection
Escrow transaction logs.
```json
{
  "_id": ObjectId("60d5ec9f8f1b2c3d4e5f6g77"),
  "bookingId": ObjectId("60d5ec9f8f1b2c3d4e5f6g75"),
  "stripePaymentIntentId": "pi_3M2hLf2eZvKYlo2C1x...",
  "stripeTransferId": "tr_1H62bL...",
  "amount": 1700.00,
  "escrowStatus": "held_in_escrow",
  "updatedAt": ISODate("2026-06-17T10:05:10Z")
}
```

#### G. `notifications` Collection
History of sent notifications.
```json
{
  "_id": ObjectId("60d5ec9f8f1b2c3d4e5f6g78"),
  "recipientId": ObjectId("60d5ec9f8f1b2c3d4e5f6g71"),
  "type": "push",
  "title": "Hero Matched!",
  "body": "Marcus has accepted your cleaning booking and is en route.",
  "status": "delivered",
  "readAt": null,
  "createdAt": ISODate("2026-06-17T10:05:05Z")
}
```

---

### 6.3 MongoDB Indexing Strategy
To maintain low queries latencies (<50ms) as the collections scale:

1.  **Geospatial Query Indexing:**
    Required to query active technicians within a geofenced area:
    ```javascript
    db.technicians.createIndex({ "currentLocation": "2dsphere" })
    ```
2.  **Compound Query Indexing:**
    Speeds up customer dashboard matching lookups:
    ```javascript
    db.bookings.createIndex({ "customerId": 1, "status": 1, "scheduledTime": -1 })
    ```
3.  **Unique Stripe Indexing:**
    Prevents duplicate payment entries:
    ```javascript
    db.payments.createIndex({ "stripePaymentIntentId": 1 }, { unique: true })
    ```
4.  **TTL (Time-To-Live) Notification Indexing:**
    Prunes notification logs older than 30 days to control memory consumption:
    ```javascript
    db.notifications.createIndex({ "createdAt": 1 }, { expireAfterSeconds: 2592000 })
    ```

---

### 6.4 Referencing vs. Embedding (Denormalization Trade-offs)
*   **Embed Profiles inside `users`?** *No.* Profile locations and active coordinates change constantly. Keeping `users` lean allows fast auth lookups without loading coordinates into memory.
*   **Embed Checklist inside `bookings`?** *Yes.* The checklist is strictly bounded (less than 15 items per booking) and is always read/written alongside the booking details. This saves joint operations.

---

### 6.5 Sharding & Scalability Recommendations
When scaling to millions of bookings across multiple cities:
*   **Shard Key for `bookings`:** **`address.city` + `createdAt`** (hashed sharding). This divides bookings by city clusters, ensuring that geospatial queries don't scatter across global clusters.
*   **Shard Key for `technicians`:** **`isOnline` + `currentLocation`** (geospatial range sharding). Enables fast query distribution for dispatcher systems.
*   **Read Replicas:** Read-heavy dashboards (e.g. browsing historical reviews or category details) should read from secondary nodes (`readPreference=secondaryPreferred`), preserving primary nodes for transactional updates.
