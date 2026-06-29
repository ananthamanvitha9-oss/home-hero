# MongoDB Schema Design Specification - HomeHero

**Prepared by**: Principal Database Architect  
**Status**: Approved for Production  
**Scope**: Primary OLTP database schemas  

---

## 1. Database Overview

HomeHero uses a hybrid document database architecture built on MongoDB Atlas. High-frequency operations like proximity matchmaking and real-time state transitions require a design that minimizes network calls and lookup costs. 

To achieve this, HomeHero uses:
- **References** for high-growth entities (Users, Bookings, Payments) to prevent unbounded documents.
- **Embedding (Denormalization)** for static snapshots (e.g., customer addresses at the time of booking) to prevent historical price alterations.

---

## 2. Collections & Entity Outlines

### 2.1 Core Collections Matrix
| Collection Name | Document Scope | Storage Strategy |
| :--- | :--- | :--- |
| **`users`** | Customer, Technician, and Admin account credentials. | Referenced (Root profile). |
| **`technicians`** | Trade skills, availability flags, and geo-locations. | Referenced (1:1 with `users`). |
| **`bookings`** | Transaction logs, checklists, and state coordinates. | Referenced (High growth). |
| **`payments`** | Escrow logs, invoices, and split metadata. | Referenced (1:1 with `bookings`). |
| **`messages`** | Support chats and coordinator updates. | Referenced (1:N with `bookings`). |

---

## 3. Document Structures & Schema Specifications

### 3.1 `users` Collection Document Structure
```json
{
  "_id": "ObjectId('60c72b2f9b1d8b2bad000001')",
  "firstName": "Amit",
  "lastName": "Sharma",
  "email": "amit.sharma@email.com",
  "phone": "+919876543210",
  "passwordHash": "$2b$10$xyz123abc456...",
  "role": "customer",
  "isVerified": true,
  "savedAddresses": [
    {
      "label": "Home",
      "street": "Flat 402, Building A, Cyber Towers",
      "area": "Gachibowli",
      "city": "Hyderabad",
      "pincode": "500081",
      "isDefault": true
    }
  ],
  "isDeleted": false,
  "createdAt": "2026-06-26T10:00:00Z",
  "updatedAt": "2026-06-26T10:05:00Z"
}
```

### 3.2 `technicians` Collection Document Structure
```json
{
  "_id": "ObjectId('60c72b2f9b1d8b2bad000002')",
  "userId": "ObjectId('60c72b2f9b1d8b2bad000001')",
  "skills": ["Electrician", "Wiring", "AC Repair"],
  "experienceYears": 5,
  "isOnline": true,
  "rating": 4.8,
  "currentLocation": {
    "type": "Point",
    "coordinates": [78.3728, 17.4485]
  },
  "verification": {
    "status": "verified",
    "aadhaarNumber": "123456789012"
  },
  "walletBalance": 1250.50,
  "isDeleted": false,
  "createdAt": "2026-06-26T10:00:00Z",
  "updatedAt": "2026-06-26T10:15:00Z"
}
```

### 3.3 `bookings` Collection Document Structure
```json
{
  "_id": "ObjectId('60c72b2f9b1d8b2bad000003')",
  "bookingCode": "BKG-20260626-001",
  "customerId": "ObjectId('60c72b2f9b1d8b2bad000001')",
  "technicianId": "ObjectId('60c72b2f9b1d8b2bad000002')",
  "serviceCategory": "AC Repair",
  "status": "matched",
  "billing": {
    "basePrice": 399.00,
    "surgePrice": 120.00,
    "totalPrice": 519.00
  },
  "startOtp": "4827",
  "checklist": [
    {
      "task": "Pre-repair inspection check",
      "isCompleted": true,
      "photoUrl": "https://cloudinary.com/proofs/pre.jpg"
    }
  ],
  "isDeleted": false,
  "createdAt": "2026-06-26T10:10:00Z",
  "updatedAt": "2026-06-26T10:12:00Z"
}
```

---

## 4. Soft Delete Strategy

To preserve historical metrics and financial transaction audits, HomeHero prohibits raw `remove` database queries.
*   **Active Flag**: Every collection includes an `isDeleted` boolean field (defaults to `false`).
*   **Query Interception**: All read queries must filter by `isDeleted: false` to hide soft-deleted records:
    ```javascript
    // Filter active profiles
    db.users.find({ email: "user@domain.com", isDeleted: false })
    ```

---

## 5. Future Scalability & Sharding Key Strategy

*   **Regional Sharding Key**: As operations expand nationally, shard the `bookings` collection using a hashed key combining the city name and booking code:
    $$\text{Shard Key} = \{ \text{"city"}: 1, \text{"bookingCode"}: \text{"hashed"} \}$$
*   **Geospatial Optimization**: Keep `currentLocation` indexed via `2dsphere` on technicians to allow local servers to query only regional shards.
