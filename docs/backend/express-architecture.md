# HomeHero Hyperlocal Services Platform - Backend Architecture

**Author:** Principal Node.js Architect, HomeHero Technologies Pvt. Ltd.  
**Version:** 2.0.0  
**Date:** June 26, 2026  
**Status:** Approved for Production Deployments

---

## 1. Executive Summary & Design Philosophy

The HomeHero backend is a production-ready, high-throughput REST API and real-time event server built on **Node.js** and **Express.js**. The architecture is designed to support hyperlocal on-demand service matching, secure payment escrow handling via Razorpay, real-time location telemetry tracking via WebSockets (Socket.io), and multi-channel push notification delivery.

### 1.1 Architectural Pillars

1. **Separation of Concerns (MVC-S Pattern):**
   * **Models:** Define the schemas, type controls, and database indexes using Mongoose.
   * **Views / Serializers:** REST API JSON envelopes returning standardized success/error structures.
   * **Controllers:** Coordinate HTTP request extraction, call appropriate services, and compile JSON responses.
   * **Services:** Houses pure business logic (e.g., Razorpay verification, Firebase Push notification workers, location radial queries, WebSocket matchmaking loops).
2. **Robust Operational Stability:**
   * Centralized global error handling catches all asynchronous and synchronous exceptions, formatting them cleanly while preventing database stack leaks in production.
   * Centralized logging via Winston uses daily rotating file streams to prevent server disk overflow.
3. **Hyperlocal Matchmaking Loop (Event-Driven):**
   * Real-time location tracking and match notifications use a WebSocket state engine to alert nearby technicians within a 15km radius of a booking location, implementing a 90-second acceptance ring.

---

## 2. Directory & Folder Layout

The project layout divides modules cleanly to simplify testing, dependency injection, and future migration to microservices.

```
homehero-backend/
│
├── logs/                          # Daily rotated log archives (Winston output)
├── src/
│   ├── config/                    # System configurations & connection layers
│   │   ├── db.js                  # MongoDB Mongoose connection handler
│   │   ├── logger.js              # Winston daily file rotation logging setup
│   │   ├── mockDb.js              # Mock databases when running offline/demo modes
│   │   ├── notificationHelper.js  # Firebase Admin Cloud Messaging helper methods
│   │   └── socket.js              # Socket.io real-time matching server and rooms
│   │
│   ├── core/                      # Global core helpers & error classes
│   │   └── errors/
│   │       └── AppError.js        # Custom Operational Error Class
│   │
│   ├── models/                    # Mongoose Database Models & Indexes
│   │   ├── userModel.js           # Customers, Admins, and Technician accounts
│   │   ├── technicianModel.js     # Professional profiles, KYC details, & tracking
│   │   ├── categoryModel.js       # High-level service categories (e.g. AC Repair)
│   │   ├── serviceModel.js        # Specific services & flat pricing formulas
│   │   ├── bookingModel.js        # Service order records, checklists, & audits
│   │   ├── paymentModel.js        # Razorpay payments, commissions, and escrow
│   │   ├── reviewModel.js         # Post-job ratings & feedback
│   │   ├── messageModel.js        # Chat logs between clients and technicians
│   │   ├── notificationModel.js   # Ephemeral push notification records
│   │   └── settingModel.js        # Global configuration parameters
│   │
│   ├── middleware/                # Express Middlewares
│   │   ├── authMiddleware.js      # JWT parsing & RBAC authorization guards
│   │   ├── errorMiddleware.js     # Centralized global Express error interceptor
│   │   ├── securityMiddleware.js  # Rate limiters, Cors rules, & Helmet headers
│   │   └── validationMiddleware.js# Joi request parameter verification
│   │
│   ├── controllers/               # Express route controller handlers
│   │   ├── authController.js      # Register, Login, OTP verification
│   │   ├── technicianController.js# Status updates & public profile lookups
│   │   ├── serviceController.js   # Catalog queries
│   │   ├── bookingController.js   # Order CRUD & technician matching triggers
│   │   ├── paymentController.js   # Razorpay orders, webhooks, and payouts
│   │   ├── reviewController.js    # Comments and ratings handlers
│   │   ├── notificationController.# Unread notifications trackers
│   │   └── adminController.js     # Analytics, KYC approvals, & dynamic pricing
│   │
│   ├── routes/                    # Express routing endpoints mapping
│   │   ├── authRoutes.js          # Authentication paths (/api/auth)
│   │   ├── technicianRoutes.js    # Technician paths (/api/technicians)
│   │   ├── serviceRoutes.js       # Catalog paths (/api/services)
│   │   ├── bookingRoutes.js       # Booking paths (/api/bookings)
│   │   ├── paymentRoutes.js       # Payment paths (/api/payments)
│   │   ├── reviewRoutes.js        # Review paths (/api/reviews)
│   │   ├── notificationRoutes.js  # Notification paths (/api/notifications)
│   │   └── adminRoutes.js         # Operations console paths (/api/admin)
│   │
│   ├── validation/                # Joi validation schema declarations
│   │   ├── authValidation.js      # Registrations & credentials parameters
│   │   └── bookingValidator.js    # Bookings creation & status rules
│   │
│   └── scripts/
│       └── seed.js                # Database catalog seeder script
│
├── app.js                         # Main Express application initialization
├── server.js                      # Server port binding & WebSocket initialization
├── Dockerfile                     # Multi-stage container file
└── package.json                   # Project scripts and library dependencies
```

---

## 3. Configuration & Bootstrap Layer

The application separates process bootstrapping (`server.js`) from route configuration (`app.js`) to simplify testing.

### 3.1 Server Process Bootstrap (`server.js`)
Handles environmental configurations, uncaught exception handling, database setups, and HTTP/WebSocket bindings.

* **Key Implementation Details:**
  * Imports `.env` configurations using `dotenv`.
  * Installs listeners on `uncaughtException` and `unhandledRejection` to log errors via Winston and shut down cleanly.
  * Connects to MongoDB via `connectDB()`.
  * Creates an HTTP Server wrapper to attach Socket.io via `initSocket(server)`.
  * Binds to `process.env.PORT || 5000`.

### 3.2 Express Application Setup (`app.js`)
Configures HTTP security headers, CORS policies, parser limits, API routing paths, and global error middleware.

* **Routing Table Configuration:**
  ```javascript
  app.use('/api/auth', authRoutes);
  app.use('/api/services', serviceRoutes);
  app.use('/api/technicians', technicianRoutes);
  app.use('/api/bookings', bookingRoutes);
  app.use('/api/reviews', reviewRoutes);
  app.use('/api/notifications', notificationRoutes);
  app.use('/api/payments', paymentRoutes);
  app.use('/api/admin', adminRoutes);
  ```
  *(Note: Backward compatibility is maintained by supporting legacy route endpoints prefix `/api/v1/*` mapping to the same router entries).*

### 3.3 Database Connection Setup (`src/config/db.js`)
Initializes connection sessions using Mongoose. If the database connection fails, it catches the exception, logs it, and starts the server in **Demo/Offline Mode**, allowing testing to proceed with mock databases rather than crashing the process.

* **Key File:** [db.js](file:///c:/Users/manvi/OneDrive/Desktop/homehero/backend/src/config/db.js)

### 3.4 WebSocket Configuration (`src/config/socket.js`)
Initializes the Socket.io server, applies a custom JWT handshake middleware, manages room allocations, and tracks coordinate telemetry events.

* **Handshake Verification:**
  ```javascript
  const token = socket.handshake.auth?.token || socket.handshake.headers?.authorization?.split(' ')[1];
  if (token) {
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      socket.user = decoded;
    } catch (err) {
      console.warn('[Socket Auth] Authentication failed:', err.message);
    }
  }
  ```
* **Event Handlers:**
  * `join_booking`: Binds socket clients (customers and technicians) to booking-specific rooms (`booking_<bookingId>`).
  * `accept_job`: Allows online technicians to accept pending bookings. Updates database booking states, populates user fields, and broadcasts updates via `booking_matched` events.
  * `technician_location_update`: Receives coordinates from technicians, updates location coordinates in the database, and broadcasts updates via `location_updated` events.
  * `update_checklist`: Syncs job checklists. Completing the first item transitions the booking state to `active`, while completing all items transitions the booking state to `completed`.
  * `send_message`: Saves messages to the database and broadcasts them to the booking room.

---

## 4. Models Layer

Mongoose models enforce schema validation and define database indexes.

### 4.1 `User` Model (`src/models/userModel.js`)
* **Role Enums:** `['customer', 'provider', 'technician', 'admin']` (default: `'customer'`).
* **Pre-Save Hooks:** Automatically hashes passwords using `bcryptjs` with a salt factor of `10` before saving.
* **Instance Methods:** `comparePassword(enteredPassword)` compares entered passwords against stored hashes using `bcrypt.compare`.
* **Embedded Array:** `savedAddresses` stores multiple addresses (capped at 10 items) directly within the user document to reduce `$lookup` query costs.

### 4.2 `Technician` Model (`src/models/technicianModel.js`)
* **Linkage:** Contains a 1:1 referenced `userId` pointing to `User`.
* **Geospatial coordinates:** Stores location as a GeoJSON Point:
  ```javascript
  currentLocation: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number], default: [78.382021, 17.426210] } // [longitude, latitude]
  }
  ```
* **Indexes:** Specifies a `"2dsphere"` spatial index on `currentLocation` to enable geospatial query operators like `$near` and `$geoWithin`.
* **Verification object:** Manages KYC verification status (`unverified`, `pending`, `verified`), background checks, and Aadhaar validation flags.

### 4.3 `Booking` Model (`src/models/bookingModel.js`)
* **Workflow States:** `['pending', 'accepted', 'rejected', 'assigned', 'in_progress', 'completed', 'cancelled']`.
* **State Audit Logs:** `statusHistory` embeds historical changes to track transitions, notes, and the user who modified the status.
* **Embedded snapshots:** Snapshot of the target address coordinates (`address.geoPoint` with `2dsphere` indexing) and billing details are embedded directly to preserve booking data.

### 4.4 `Payment` Model (`src/models/paymentModel.js`)
* **Paise Pricing:** Currency amounts are stored in paise (e.g. ₹649.00 = `64900` paise) to prevent floating-point calculation errors.
* **Integrations:** Tracks Razorpay Order ID (`razorpayOrderId`), Payment ID (`razorpayPaymentId`), and Signature verification parameters.
* **Escrow States:** Tracks payment status (`created`, `successful`, `failed`, `refunded`) to manage payments during disputes or cancellations.

---

## 5. Controllers & Routing Layer

Controllers coordinate HTTP request extraction, call services, and compile JSON responses.

### 5.1 Route Mapping Specification
All routing files are bound to the Express app via specialized router modules under `src/routes/`:
* `authRoutes.js`: Maps login, registration, OTP validation, profile, and refresh token endpoints.
* `technicianRoutes.js`: Manages telemetry, coordinates, and professional profiles.
* `serviceRoutes.js`: Returns category taxonomies and services lists.
* `bookingRoutes.js`: Handles pricing calculations, booking creation, completions, and technician match configurations.
* `paymentRoutes.js`: Handles payment pre-authorizations, Razorpay callbacks, and escrow payouts.
* `reviewRoutes.js`: Submits user feedback ratings.
* `notificationRoutes.js`: Returns system-wide push alerts.
* `adminRoutes.js`: Provides analytics, KYC vetting controls, and surge pricing multiplier sliders.

### 5.2 Controller Architecture Example (`authController.js`)
Handles tokens issuance by signing short-lived Access Tokens (JWT payload signed with `JWT_SECRET` expiring in 15 minutes) and long-lived Refresh Tokens (signed with `JWT_REFRESH_SECRET` expiring in 7 days). Refresh tokens are returned to clients inside secure, HttpOnly, Lax SameSite cookie payloads to mitigate Cross-Site Scripting (XSS) risks.

---

## 6. Middleware Stack (Security & Traffic Safeguards)

Requests are intercepted and validated before reaching controller business logic.

```
       Incoming Request
              │
              ▼
    [ securityMiddleware ]  --> Cors check, Rate Limiter (100 req / 15m), Sanitizer
              │
              ▼
      [ authMiddleware ]    --> JWT parsing & RBAC role permission checks
              │
              ▼
    [ validationMiddleware ]--> Joi schema check (email formats, coordinate values)
              │
              ▼
         Controller
```

1. **`securityMiddleware.js`:**
   * **Helmet:** Adds secure HTTP headers.
   * **CORS:** Restricts requests to allowed frontend origins.
   * **Sanitization:** Removes keys starting with `$` or `.` from request bodies, queries, and parameters to prevent NoSQL injection.
   * **Rate Limiter:** Limits each IP address to 100 requests per 15 minutes.
2. **`authMiddleware.js`:**
   * **`protect`:** Extracts Bearer tokens from the `Authorization` header, verifies the signature, and attaches the active `req.user` payload to the request object.
   * **`authorize(...roles)`:** Restricts route access to specific roles.
3. **`validationMiddleware.js`:**
   * Compares incoming payloads against Joi schemas (e.g. validating email formats, Aadhaar digits, coordinate structures, ISO dates) before routing requests to controllers.

---

## 7. Business Logic Services Layer

Services run core backend business logic, independent of Express routing layers:

1. **WebSocket Dispatch Matcher (`config/socket.js`):**
   * Emits booking matches to online technicians within a 15km service radius, implementing a 90-second acceptance ring. If the offer is rejected or expires, it rings the next nearest technician.
2. **Razorpay Escrow holds (`controllers/paymentController.js`):**
   * Creates pre-authorized holding orders using the Razorpay Node SDK. Confirms payment signatures using HMAC-SHA256 verification on webhook callbacks.
3. **Escrow Releases:**
   * Releases escrowed funds upon completion of the service checklist. Retains 15% platform commission and credits 85% to the technician's wallet balance.
4. **Push Notification workers (`config/notificationHelper.js`):**
   * Sends multi-channel alerts (Firebase Cloud Messaging push alerts, WebSocket emissions, SMS fallbacks) based on recipient preferences.

---

## 8. Centralized Error Handling & Logging Systems

### 8.1 Error Interceptor Setup (`src/core/errors/AppError.js`)
Extends the native `Error` class and flags the error as operational (`isOperational = true`), formatting status tags based on HTTP codes:
* `4xx` = `fail` (e.g. client validation error)
* `5xx` = `error` (e.g. internal server issue)

### 8.2 Global Error Middleware (`src/middleware/errorMiddleware.js`)
All route errors are routed to this central error handler middleware.

* **Development vs. Production Modes:**
  * **Development:** Returns full error details, HTTP status code, message, error stack traces, and details for debugging.
  * **Production:** Hides stack traces. If the error is operational (`isOperational = true`), it returns the error message. Otherwise, it logs a critical error trace to the server logs and returns a generic `'Something went very wrong!'` message to prevent leaking system information.
* **Database Errors Handling:** Captures database errors (like `CastError` or `DuplicateKey` code `11000`) and translates them into operational errors.

### 8.3 Winston Logging Engine (`src/config/logger.js`)
Winston is used for application logging, dividing logs into development console output and daily rotating files in production.

* **Daily Log Rotation:** Automates daily log rotation, keeping files for a maximum of 30 days to protect disk storage.
* **Unified Format Configuration:** Formats log entries with timestamps, error stacks, and system metadata tags:
  ```javascript
  const formatConfig = winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.errors({ stack: true }),
    winston.format.json()
  );
  ```
* **Colorized Console Streams:** Development logs are colorized and simplified for CLI debugging.
