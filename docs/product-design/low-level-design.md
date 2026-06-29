# HomeHero - Low-Level Design (LLD) Specification

**Prepared by**: Senior Software Engineer  
**Target Audience**: Backend Engineers, Technical Leads, & Database Administrators  
**Focus**: Schema definitions, class structures, API sequence diagrams, and folder layouts

---

## 1. Monorepo Backend Folder Structure

The Express API backend utilizes a MVC-inspired service layer architecture:

```
backend/
├── src/
│   ├── config/            # Database, socket, logger configurations
│   ├── controllers/       # HTTP Request routers and response mappings
│   ├── core/              # Custom exceptions and core domain logic
│   │   └── errors/        # Operational error classes (AppError.js)
│   ├── middleware/        # Authentication and validation intercepts
│   ├── models/            # Mongoose schemas and database models
│   ├── routes/            # REST API endpoints mappings
│   ├── validation/        # Joi schema payloads definitions
│   └── utils/             # Helper utilities (Haversine calculations)
├── app.js                 # App configuration and middlware stack
└── index.js               # Server bootstrap entry point
```

---

## 2. API Sequence Workflows

This diagram maps out the client-server database interactions for creating a booking and matching a technician:

```mermaid
sequenceDiagram
  autonumber
  actor Customer
  participant Client as React Client (Vercel)
  participant API as Express API Server (Render)
  participant DB as MongoDB Atlas Cluster
  participant Gateway as Razorpay Gateway API

  Customer->>Client: Click Book Service
  Client->>API: POST /api/payments/create-order
  API->>DB: Create payment record ('created')
  API->>Client: Return Razorpay Order Details
  Client->>Gateway: Trigger Checkout Overlay
  Gateway-->>Client: Return Success Signatures
  Client->>API: POST /api/payments/verify
  API->>API: Verify Signature HMAC-SHA256
  API->>DB: Update Payment ('successful') & Booking ('matched')
  API->>Client: Redirection to Tracking Panel
```

---

## 3. Database Schema Models & Class Diagram

This diagram maps out the database relationships and properties:

```mermaid
classDiagram
  class User {
    +String email
    +String phone
    +String passwordHash
    +String role
    +Boolean isVerified
    +Array savedAddresses
    +preSaveHashPassword()
    +comparePassword(pwd)
  }

  class Technician {
    +ObjectId userId
    +Array skills
    +Number experienceYears
    +Boolean isOnline
    +Number rating
    +Object currentLocation
    +Object verification
    +updateAvailability(status)
  }

  class Booking {
    +String bookingCode
    +ObjectId customerId
    +ObjectId technicianId
    +ObjectId serviceId
    +String status
    +Object billing
    +Array checklist
    +appendStatusHistory(status, note)
  }

  class Payment {
    +String paymentId
    +ObjectId bookingId
    +ObjectId customerId
    +ObjectId technicianId
    +String paymentStatus
    +String escrowStatus
    +Number amount
    +String invoiceNumber
    +releaseEscrow()
  }

  User "1" --> "0..1" Technician : is_a
  User "1" --> "0..*" Booking : creates
  Technician "1" --> "0..*" Booking : fulfills
  Booking "1" --> "1" Payment : billed_by
```

---

## 4. Middleware & Validation Layers

1.  **Authentication Middleware (`protect`)**: Reads the HTTP Authorization Bearer token header, decodes the JWT using `process.env.JWT_SECRET`, checks if the user document exists in MongoDB, and attaches it to `req.user`.
2.  **Role Guard Middleware (`authorize(...roles)`)**: Checks `req.user.role` against the list of authorized roles. If unauthorized, returns a `403 Forbidden` response.
3.  **Validation Middleware (`validate`)**: Intercepts incoming requests and validates the payload using Joi schemas (e.g. `registerSchema` or `createBookingSchema`) before passing execution to the controller.

---

## 5. Database Interaction Hooks

### 5.1 Pre-Save Password Hashing
```javascript
userSchema.pre('save', async function (next) {
  if (!this.isModified('passwordHash')) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.passwordHash = await bcrypt.hash(this.passwordHash, salt);
    next();
  } catch (err) {
    next(err);
  }
});
```

### 5.2 Technician Search Geospatial Query
```javascript
const nearbyTechnician = await Technician.findOne({
  isOnline: true,
  currentLocation: {
    $near: {
      $geometry: { type: 'Point', coordinates: [longitude, latitude] },
      $maxDistance: 15000 // 15 km limit
    }
  }
});
```

---

## 6. Centralized Error Handling

The application uses a custom operational error class `AppError` to classify errors:
*   **Operational Errors**: Trusted errors (validation failures, expired JWTs, missing funds) are handled cleanly and returned to the client using custom HTTP status codes.
*   **Programmer Bugs / System Errors**: Unknown exceptions (uncaught database connection drops, syntax crashes) are masked under generic `500 Internal Server Error` responses in production, while logging detailed stack traces via Winston.
