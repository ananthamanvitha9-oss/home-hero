# MongoDB Performance Tuning & Optimization Guide - HomeHero

**Prepared by**: MongoDB Performance Architect  
**Target Audience**: Database Administrators, Backend Engineers, & Site Reliability Engineers  
**Focus**: Connection pooling, pagination designs, cache lifecycles, and aggregation pipelines

---

## 1. Connection Pooling & Resource Configuration

To prevent connection spikes during high-traffic matchmaking events, HomeHero configures the Mongoose connection pool parameters:

```javascript
const mongoose = require('mongoose');

const options = {
  maxPoolSize: 50,             // Maintain up to 50 concurrent socket channels
  minPoolSize: 10,             // Keep 10 idle channels warm to prevent connection handshake delays
  socketTimeoutMS: 45000,      // Terminate inactive sockets after 45 seconds
  serverSelectionTimeoutMS: 5000 // Return error if connection fails within 5 seconds
};

mongoose.connect(process.env.MONGO_URI, options);
```

---

## 2. Aggregation Best Practices

To prevent out-of-memory errors and optimize aggregation pipelines, enforce these rules:

1.  **Filter Early (`$match` first)**: Always place `$match` and `$sort` stages at the very beginning of the pipeline to leverage index scans and reduce the dataset size.
2.  **Optimize Projections (`$project` last)**: Place `$project` stages at the end of the pipeline. Only request the specific fields needed by the client.
3.  **Prevent Memory Overflow**: Aggregation stages must run within the 100MB RAM limit. For large-scale data processing (such as admin transaction reports), enable disk swapping:
    ```javascript
    db.bookings.aggregate(pipeline, { allowDiskUse: true })
    ```

---

## 3. Pagination Strategy (Keyset vs. Offset)

To prevent performance degradation during history lookups, HomeHero prohibits high-offset pagination:

-  **Prohibited (Offset)**: Avoid `{ $skip: 10000, $limit: 20 }`. High offsets force MongoDB to scan and discard thousands of records.
-  **Enforced (Keyset/Cursor)**: Filter queries using the ID of the last processed record:
   ```javascript
   // Fetch next page of bookings using keyset pagination
   db.bookings.find({
     customerId: customerObjectId,
     createdAt: { $lt: lastRecordCreatedAt } // Keyset filter
   })
   .sort({ createdAt: -1 })
   .limit(20)
   ```

---

## 4. Caching & Read/Write Optimization

*   **Read-Through Cache (Redis)**: Store service catalogs, static base rates, and active surge pricing configurations in Redis. Set a TTL of 1 hour to reduce database read traffic.
*   **Write Concatenation**: GPS coordinates are sent by technicians every 10 seconds. Use `$set` updates to modify only the location coordinates, avoiding full document write locks:
    ```javascript
    db.technicians.updateOne(
      { userId: technicianId },
      { $set: { "currentLocation.coordinates": [lng, lat] } }
    )
    ```

---

## 5. Slow Query Analysis & Monitoring Metrics

*   **Profiler Threshold**: Configure the MongoDB Atlas Profiler to log all queries taking longer than **100ms** to the slow query log.
*   **Key Monitoring Metrics**:
    - **Document Scan Ratio (`docsExamined / nReturned`)**: Target ratio is **1.0**. A ratio $> 5.0$ indicates an inefficient index.
    - **Memory Usage**: Monitor the Atlas dashboard to ensure the active index working set fits entirely within the server's RAM.
