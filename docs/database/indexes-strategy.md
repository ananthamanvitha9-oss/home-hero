# MongoDB Indexing Strategy & Performance Specification - HomeHero

**Prepared by**: MongoDB Performance Engineer  
**Target Audience**: Database Administrators, Backend Engineers, & Operations Teams  
**Focus**: Index definitions, geospatial lookups, query optimization, and execution speeds

---

## 1. Core Indexing Matrix

To prevent collection scans (`COLLSCAN`) and ensure sub-second query performance as customer and technician volumes scale, HomeHero enforces these index types:

| Collection Name | Index Fields | Index Type | Target Query |
| :--- | :--- | :--- | :--- |
| **`users`** | `{ email: 1 }` | Unique | User authentication lookup. |
| **`users`** | `{ phone: 1 }` | Unique | OTP login verification lookup. |
| **`technicians`** | `{ currentLocation: "2dsphere" }` | Geospatial | Proximity matchmaking. |
| **`technicians`** | `{ isOnline: 1, skills: 1 }` | Compound | Filter available service pros. |
| **`bookings`** | `{ bookingCode: 1 }` | Unique | Invoice reference lookup. |
| **`otp_verifications`**| `{ createdAt: 1 }` | TTL | Auto-expire SMS tokens in 5 mins. |

---

## 2. Detailed Index Specifications with Examples

### 2.1 Geospatial Indexes (`2dsphere`)
- **Use Case**: Find verified, online plumbers within a 15 km radius of a customer's location.
- **Index Definition**:
  ```javascript
  db.technicians.createIndex({ "currentLocation": "2dsphere" })
  ```
- **Example Query**:
  ```javascript
  db.technicians.find({
    isOnline: true,
    skills: "Plumber",
    currentLocation: {
      $near: {
        $geometry: { type: "Point", coordinates: [78.3728, 17.4485] },
        $maxDistance: 15000
      }
    }
  })
  ```

### 2.2 TTL (Time-to-Live) Indexes
- **Use Case**: Automatically clean up temporary SMS login tokens after 5 minutes to prevent database bloating.
- **Index Definition**:
  ```javascript
  db.otp_verifications.createIndex(
    { "createdAt": 1 },
    { expireAfterSeconds: 300 }
  )
  ```

### 2.3 Partial Indexes
- **Use Case**: Index only active (non-soft-deleted) bookings to reduce index size and memory usage.
- **Index Definition**:
  ```javascript
  db.bookings.createIndex(
    { "customerId": 1, "createdAt": -1 },
    { partialFilterExpression: { isDeleted: false } }
  )
  ```

---

## 3. Query Optimization & Explaining Queries

Before releasing any new backend query to staging, developers must run the query with the `.explain("executionStats")` method to verify it uses the correct index:

```javascript
db.bookings.find({ bookingCode: "BKG-101" }).explain("executionStats")
```

### Key Metrics to Audit:
- **`stage`**: Must be `IXSCAN` (Index Scan) followed by `FETCH`. It must never be `COLLSCAN` (Collection Scan).
- **`totalKeysExamined`**: Should match the number of returned documents (`nReturned`). A high keys-to-documents ratio indicates an inefficient index.

---

## 4. Expected Performance Improvements

Implementing this indexing strategy yields significant query speed improvements as the database grows:

| Query Type | Without Index (COLLSCAN) | With Index (IXSCAN) | Performance Gain |
| :--- | :--- | :--- | :--- |
| **Proximity Match (15km)** | $1250\text{ ms}$ (full scan of 50k pros) | $< 15\text{ ms}$ | **~83x faster** |
| **User Sign-in Lookup** | $450\text{ ms}$ (scan of 500k users) | $< 2\text{ ms}$ | **~225x faster** |
| **Booking History Search** | $850\text{ ms}$ (scan of 1M bookings) | $< 5\text{ ms}$ | **~170x faster** |
