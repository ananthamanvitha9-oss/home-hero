# HomeHero - Express/Node.js Backend Architecture Specification

**Document Version:** 1.0 (Production-Ready Architecture Guide)  
**Author:** Senior Backend Architect  
**Date:** June 17, 2026  
**Status:** Approved for Implementation  

---

## 1. Directory Structure Blueprint
Below is the modular directory structure designed to isolate concerns, enable testability, and support scaling:

```
backend/
├── src/
│   ├── config/
│   │   ├── db.js                 # Database connection pools (PG/MongoDB)
│   │   └── schema.sql            # PostgreSQL DDL migrations
│   ├── middleware/
│   │   ├── authMiddleware.js     # JWT authorization checking
│   │   ├── errorMiddleware.js    # Global error handlers
│   │   └── validationMiddleware.js # Input sanitization and validators
│   ├── models/
│   │   ├── userModel.js          # User queries / DB projections
│   │   ├── bookingModel.js       # Booking operations
│   │   └── reviewModel.js        # Review records queries
│   ├── controllers/
│   │   ├── authController.js     # Registration / Login controllers
│   │   ├── bookingController.js  # Estimation / Dispatch controllers
│   │   ├── reviewController.js   # Ratings controller logic
│   │   └── notificationController.js # Alerts logs fetch
│   └── routes/
│       ├── authRoutes.js         # /api/v1/auth
│       ├── bookingRoutes.js      # /api/v1/bookings
│       ├── reviewRoutes.js       # /api/v1/reviews
│       └── notificationRoutes.js # /api/v1/notifications
├── index.js                      # App bootstrap server entry
├── package.json                  # Dependencies manifest
└── .env                          # Configuration properties
```

---

## 2. Component Design & Responsibilities

### 2.1 Bootstrapping (`index.js`)
Configures middleware (CORS, JSON parser), maps routing entries to `/api/v1/`, and binds the app to port `5000`. Sets up global unhandled rejection hooks.

### 2.2 Routing Layer (`/routes`)
Acts as a strict entry gate. Defines path parameters and binds validation rules before calling controllers.
*Example routing signature:*
```javascript
router.post('/register', validateRegister, authController.register);
```

### 2.3 Controller Layer (`/controllers`)
Responsible for HTTP protocol logic. Extracts arguments from request payloads, triggers model queries, coordinates side effects (like sending notifications), and returns HTTP status codes (200, 201, 400, 404, 500).

### 2.4 Model Layer (`/models`)
Encapsulates all raw database queries. No HTTP references exist here. Models return structured objects or throw database exceptions up to controllers.

---

## 3. Middleware Architecture

### 3.1 Authentication Middleware (`authMiddleware.js`)
*   **Behavior:** intercepts requests, extracts Bearer tokens from authorization headers, and verifies JWT signatures.
*   **JWT Config:** Uses a secure secret key, utilizing RS256 or HS256 algorithms. Attaches decoded user payloads (`{ id, email, role }`) to `req.user` for downstream handlers.

### 3.2 Input Validation Middleware (`validationMiddleware.js`)
*   **Behavior:** Intercepts parameters prior to controller logic. Validates constraints:
    *   Emails are validated using standard regex rules.
    *   Phones must match standard mobile length (+91 prefix).
    *   Ratings must fall strictly in the range of `1-5` integer stars.
*   If validation fails, immediately returns `400 Bad Request` containing an array of field errors.

### 3.3 Global Error Handling Middleware (`errorMiddleware.js`)
*   Catch-all handler registered at the very end of the Express application stack.
*   Intercepts thrown exceptions, logs call stacks to standard logging pipelines, and formats a generic clean error response to clients:
```json
{
  "success": false,
  "message": "An unexpected server error occurred."
}
```

---

## 4. Scalability & DB Connection Pool Guidelines
1.  **Connection Limits:** Keep pool sizing configured (e.g. `max: 20` clients in Postgres `pg` pools) to prevent connection saturation during matching spikes.
2.  **Transactions (ACID):** Escrow payouts and booking wallet deduction routines must use explicit SQL Transactions (`BEGIN`, `COMMIT`, `ROLLBACK`) to guarantee data integrity.
3.  **Graceful Shutdown:** The server must listen for termination signals (`SIGTERM`, `SIGINT`) to drain database pools before terminating the main Node process.
