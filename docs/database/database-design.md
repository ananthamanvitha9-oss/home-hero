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
