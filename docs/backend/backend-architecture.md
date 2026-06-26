# HomeHero Hyperlocal Services Platform - Backend Architecture

**Author:** Principal Node.js Architect, HomeHero Technologies Pvt. Ltd.  
**Version:** 1.0.0  
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

## 3. Core Connection Configuration Layers

### 3.1 MongoDB Database Connection Layer (`config/db.js`)
Configured to handle connection failures gracefully. If the database connection fails, the server starts in **Demo/Offline Mode**, allowing testing to proceed with mock databases rather than crashing the process.

* **Key File:** [db.js](file:///c:/Users/manvi/OneDrive/Desktop/homehero/backend/src/config/db.js)
* **Implementation Pattern:**
  ```javascript
  const mongoose = require('mongoose');
  const logger = require('./logger');

  const connectDB = async () => {
    try {
      const conn = await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/homehero');
      logger.info(`[MongoDB] Connected successfully to host: ${conn.connection.host}`);
    } catch (error) {
      logger.error(`[MongoDB] Database connection failed: ${error.message}`);
      logger.warn(`[MongoDB] WARNING: Server is starting in DEMO/OFFLINE mode. Database operations will be mocked or throw errors, but Express endpoints will remain active.`);
    }
  };

  module.exports = connectDB;
  ```

### 3.2 Real-Time Event WebSocket Server (`config/socket.js`)
Manages live connections, user rooms, and coordinates matching loops. Connects active technician and customer client connections to coordinate dispatch offers.

* **Key Socket Rooms:**
  * `room_user_<userId>`: Targeted messages, chat transcripts, and status updates.
  * `room_booking_<bookingId>`: Room for active clients and technicians assigned to a job.
* **Proximity Matching Loop:** Matches open service bookings to active, available technicians within a 15km service radius, emitting matching requests sequentially.

---

## 4. Middleware & Traffic Protection Stack

Security, request scrubbing, and inputs verification are managed before routing requests to controller modules.

### 4.1 Route Guarding & RBAC (`middleware/authMiddleware.js`)
1. **`protect` Middleware:** Parses the `Authorization: Bearer <token>` header, verifies the JWT signature, and attaches the active `req.user` payload to the request object.
2. **`authorize(...roles)` Middleware:** Restricts access based on the user's role:
   ```javascript
   exports.authorize = (...roles) => {
     return (req, res, next) => {
       if (!roles.includes(req.user.role)) {
         return next(new AppError('You do not have permission to perform this action', 403));
       }
       next();
     };
   };
   ```

### 4.2 Security Headers & Rate Limiters (`middleware/securityMiddleware.js`)
* **Helmet:** Adds secure HTTP headers to mitigate cross-site scripting (XSS) and injection attacks.
* **Mongo Sanitize:** Prevents NoSQL query injection by stripping keys starting with `$` or `.`.
* **Cors Validation:** Restricts request access to trusted origins.
* **Express Rate Limit:** Restricts API abuse by limiting each IP to 100 requests per 15 minutes.

### 4.3 Central Validation Interceptors (`middleware/validationMiddleware.js`)
Validates incoming payload structures using Joi schemas before processing the request in controllers, returning standardized validation error responses on failure.

---

## 5. Centralized Error Handling Architecture

Operational errors (expected failures, validation issues, payment failures) are distinguished from programming errors (unexpected syntax issues, memory leaks, connection drops) to maintain application stability.

### 5.1 Operational Error Definition (`core/errors/AppError.js`)
* **Key File:** [AppError.js](file:///c:/Users/manvi/OneDrive/Desktop/homehero/backend/src/core/errors/AppError.js)
* **Structure:** Extends the native `Error` class and flags the error as operational (`isOperational = true`), formatting status tags based on HTTP codes:
  * `4xx` = `fail` (e.g. client validation error)
  * `5xx` = `error` (e.g. internal server issue)

### 5.2 Express Global Interceptor (`middleware/errorMiddleware.js`)
All route errors are routed to this central error handler middleware.

* **Development vs. Production Modes:**
  * **Development:** Returns full error details, HTTP status code, message, error stack traces, and details for debugging.
  * **Production:** Hides stack traces. If the error is operational (`isOperational = true`), it returns the error message. Otherwise, it logs a critical error trace to the server logs and returns a generic `'Something went very wrong!'` message to prevent leaking system information.
* **Database Errors Handling:** Captures database errors (like `CastError` or `DuplicateKey` code `11000`) and translates them into operational errors.

---

## 6. Centralized Logging Engine (`config/logger.js`)

Winston is used for application logging, dividing logs into development console output and daily rotating files in production.

* **Key File:** [logger.js](file:///c:/Users/manvi/OneDrive/Desktop/homehero/backend/src/config/logger.js)
* **Features:**
  * **Winston Daily Rotate File:** Automates daily log rotation, keeping files for a maximum of 30 days to protect disk storage.
  * **Unified Format Configuration:** Formats log entries with timestamps, error stacks, and system metadata tags:
    ```javascript
    const formatConfig = winston.format.combine(
      winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
      winston.format.errors({ stack: true }),
      winston.format.json()
    );
    ```
  * **Colorized Console Streams:** Development logs are colorized and simplified for CLI debugging.
