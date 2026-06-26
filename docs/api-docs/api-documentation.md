# HomeHero REST API Specifications & Documentation

**Author:** Principal Backend Architect, HomeHero Technologies Pvt. Ltd.  
**Version:** 1.0.0  
**Date:** June 26, 2026  
**Base URL:** `http://localhost:5000/api`

---

## 1. Global Specifications

### 1.1 Authentication Scheme
Authentication is handled using stateless **JWT (JSON Web Tokens)**.
* Clients must include the access token in the `Authorization` header for protected endpoints:
  ```http
  Authorization: Bearer <access_token>
  ```
* Standard expiration times:
  * **Access Token:** 15 minutes (`JWT_EXPIRES_IN=15m`)
  * **Refresh Token:** 7 days (`JWT_REFRESH_EXPIRES_IN=7d`), stored securely via HTTP-Only, SameSite cookies.

### 1.2 Global Response Envelope
All API responses return a structured JSON envelope.

#### Success Response Envelope (2xx)
```json
{
  "success": true,
  "data": { ... } // May also contain fields like "token", "user", "bookings", etc. depending on route
}
```

#### Error Response Envelope (4xx / 5xx)
```json
{
  "success": false,
  "status": "fail", // "fail" for 4xx errors, "error" for 5xx errors
  "message": "Human-readable error description here."
}
```

---

## 2. API Endpoints Catalog

### 2.1 Authentication & Profile APIs

#### `POST /auth/register`
Creates a new customer, technician, or admin account.
* **Authentication:** None (Public)
* **Request Header:** `Content-Type: application/json`
* **Request Body:**
  ```json
  {
    "email": "priya.sharma@example.com",
    "phone": "+919876543210",
    "password": "SecurePassword123",
    "role": "customer", // Options: "customer", "technician", "admin"
    "firstName": "Priya",
    "lastName": "Sharma"
  }
  ```
* **Response (201 Created):**
  ```json
  {
    "success": true,
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "60d5ec4b1f48c34f3b2591a1",
      "email": "priya.sharma@example.com",
      "role": "customer",
      "first_name": "Priya",
      "last_name": "Sharma",
      "is_verified": false
    }
  }
  ```
* **Common Errors:**
  * `400 Bad Request` - Validation failed (e.g., password too short, invalid email format, missing fields).
  * `400 Bad Request` - Duplicate email or phone number in database.

---

#### `POST /auth/login`
Authenticates user credentials and sets an HTTP-Only Refresh Token cookie.
* **Authentication:** None (Public)
* **Request Body:**
  ```json
  {
    "email": "priya.sharma@example.com",
    "password": "SecurePassword123"
  }
  ```
* **Response (200 OK):**
  ```json
  {
    "success": true,
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "60d5ec4b1f48c34f3b2591a1",
      "email": "priya.sharma@example.com",
      "role": "customer",
      "first_name": "Priya",
      "last_name": "Sharma",
      "is_verified": true
    }
  }
  ```
* **Common Errors:**
  * `401 Unauthorized` - Incorrect email or password.
  * `400 Bad Request` - Missing email or password fields.

---

#### `POST /auth/verify-otp`
Verifies registration or transaction OTP.
* **Authentication:** None (Public)
* **Request Body:**
  ```json
  {
    "phone": "+919876543210",
    "otp_code": "123456"
  }
  ```
* **Response (200 OK):**
  ```json
  {
    "success": true,
    "message": "OTP verified successfully. User is now verified."
  }
  ```
* **Common Errors:**
  * `400 Bad Request` - Invalid OTP code or expired OTP.
  * `404 Not Found` - User with phone number not found.

---

#### `POST /auth/refresh`
Generates a new short-lived access token using the HTTP-only refresh cookie.
* **Authentication:** Refresh Token Cookie required.
* **Response (200 OK):**
  ```json
  {
    "success": true,
    "token": "new_access_token_here..."
  }
  ```
* **Common Errors:**
  * `401 Unauthorized` - Refresh token missing, invalid, or expired.

---

#### `POST /auth/logout`
Logs user out by clearing the refresh token cookie.
* **Authentication:** None (Public)
* **Response (200 OK):**
  ```json
  {
    "success": true,
    "message": "Logged out successfully"
  }
  ```

---

#### `GET /auth/profile`
Fetches user details and saved address book coordinates.
* **Authentication:** JWT Bearer (Protected)
* **Response (200 OK):**
  ```json
  {
    "success": true,
    "user": {
      "id": "60d5ec4b1f48c34f3b2591a1",
      "email": "priya.sharma@example.com",
      "phone": "+919876543210",
      "role": "customer",
      "firstName": "Priya",
      "lastName": "Sharma",
      "isVerified": true,
      "savedAddresses": [
        {
          "label": "Home",
          "street": "Flat 402, Oakwood Towers",
          "area": "Jubilee Hills",
          "city": "Hyderabad",
          "pincode": "500081",
          "isDefault": true
        }
      ]
    }
  }
  ```

---

#### `PUT /auth/profile`
Updates profile information or adds/removes addresses.
* **Authentication:** JWT Bearer (Protected)
* **Request Body:**
  ```json
  {
    "firstName": "Priyanka",
    "lastName": "Sharma",
    "savedAddresses": [
      {
        "label": "Home",
        "street": "Flat 402, Oakwood Towers",
        "area": "Jubilee Hills",
        "city": "Hyderabad",
        "pincode": "500081",
        "isDefault": true
      },
      {
        "label": "Office",
        "street": "10th Floor, Building 12C, Mindspace",
        "area": "Madhapur",
        "city": "Hyderabad",
        "pincode": "500081",
        "isDefault": false
      }
    ]
  }
  ```
* **Response (200 OK):**
  ```json
  {
    "success": true,
    "user": { ... updated user profile object ... }
  }
  ```

---

### 2.2 Notification APIs

#### `GET /notifications`
Retrieves push notifications triggered for the authenticated user.
* **Authentication:** JWT Bearer (Protected)
* **Response (200 OK):**
  ```json
  {
    "success": true,
    "notifications": [
      {
        "_id": "60d5ec4b1f48c34f3b259211",
        "title": "Booking Assigned!",
        "body": "AC technician Rajesh Kumar has accepted your booking code HH-2026-9831.",
        "isRead": false,
        "createdAt": "2026-06-26T10:05:01.000Z"
      }
    ]
  }
  ```

---

#### `PUT /notifications/:id/read`
Marks a specific notification as read.
* **Authentication:** JWT Bearer (Protected)
* **Response (200 OK):**
  ```json
  {
    "success": true,
    "message": "Notification marked as read."
  }
  ```

---

### 2.3 Technician APIs

#### `GET /technicians`
Searches available nearby technicians for a booking based on geospatial coordinates.
* **Authentication:** JWT Bearer (Protected). Roles allowed: `customer`, `admin`.
* **Query Parameters:**
  * `lat` (required) - Latitude (e.g. `17.426210`)
  * `lng` (required) - Longitude (e.g. `78.382021`)
  * `category` (required) - Service vertical (e.g., `AC Repair`, `Electrician`)
  * `radius` (optional) - Maximum search distance in KM (default: `15`)
* **Response (200 OK):**
  ```json
  {
    "success": true,
    "technicians": [
      {
        "id": "60d5ec4b1f48c34f3b2591b1",
        "fullName": "Rajesh Kumar",
        "phone": "+918765432109",
        "serviceCategory": "AC Repair",
        "rating": 4.88,
        "experienceYears": 6,
        "isOnline": true,
        "distanceKm": 1.4
      }
    ]
  }
  ```

---

#### `GET /technicians/:id`
Fetches the public profile of a technician (for customer review panels).
* **Authentication:** JWT Bearer (Protected)
* **Response (200 OK):**
  ```json
  {
    "success": true,
    "technician": {
      "id": "60d5ec4b1f48c34f3b2591b1",
      "fullName": "Rajesh Kumar",
      "profilePhoto": "https://assets.homehero.in/avatars/hero_rajesh.webp",
      "serviceCategory": "AC Repair",
      "rating": 4.88,
      "experienceYears": 6,
      "skills": ["AC Installation", "Gas Refilling", "Split AC Servicing"],
      "bio": "Experienced AC technician certified by Daikin."
    }
  }
  ```

---

#### `POST /technicians/status`
Toggles online/offline status and updates live tracking coordinates.
* **Authentication:** JWT Bearer (Protected). Roles allowed: `provider`, `technician`.
* **Request Body:**
  ```json
  {
    "isOnline": true,
    "lat": 17.4483,
    "lng": 78.3489
  }
  ```
* **Response (200 OK):**
  ```json
  {
    "success": true,
    "status": {
      "isOnline": true,
      "availabilityStatus": "available",
      "currentLocation": {
        "type": "Point",
        "coordinates": [78.3489, 17.4483]
      }
    }
  }
  ```

---

#### `GET /technicians/profile`
Retrieves own professional profile details for a logged-in technician.
* **Authentication:** JWT Bearer (Protected). Roles allowed: `provider`, `technician`.
* **Response (200 OK):**
  ```json
  {
    "success": true,
    "technician": {
      "id": "60d5ec4b1f48c34f3b2591b1",
      "fullName": "Rajesh Kumar",
      "serviceCategory": "AC Repair",
      "wallet": {
        "balance": 1850
      },
      "verification": {
        "status": "verified",
        "backgroundCheckStatus": "passed"
      }
    }
  }
  ```

---

#### `PUT /technicians/profile`
Updates professional details for the logged-in technician.
* **Authentication:** JWT Bearer (Protected). Roles allowed: `provider`, `technician`.
* **Request Body:**
  ```json
  {
    "skills": ["Split AC Servicing", "Window AC Cleaning", "Gas Charging"],
    "bio": "Certified by Daikin & Voltas with 6+ years experience.",
    "serviceRadiusKm": 10
  }
  ```
* **Response (200 OK):**
  ```json
  {
    "success": true,
    "technician": { ... updated technician object ... }
  }
  ```

---

### 2.4 Service Catalog APIs

#### `GET /services`
Lists all active services.
* **Authentication:** None (Public)
* **Response (200 OK):**
  ```json
  {
    "success": true,
    "services": [
      {
        "_id": "60d5ec4b1f48c34f3b2591c0",
        "name": "Split AC Deep Cleaning",
        "categoryId": "60d5ec4b1f48c34f3b2591a5",
        "description": "Jet wash servicing for indoor & outdoor units.",
        "pricingRules": {
          "basePrice": 499,
          "hourlyRate": 150
        }
      }
    ]
  }
  ```

---

#### `GET /services/category/:slug`
Retrieves services associated with a specific category slug.
* **Authentication:** None (Public)
* **Response (200 OK):**
  ```json
  {
    "success": true,
    "categoryName": "AC Repair & Service",
    "services": [ ... filtered services list ... ]
  }
  ```

---

#### `GET /services/:id`
Retrieves the details of a single service.
* **Authentication:** None (Public)
* **Response (200 OK):**
  ```json
  {
    "success": true,
    "service": {
      "_id": "60d5ec4b1f48c34f3b2591c0",
      "name": "Split AC Deep Cleaning",
      "pricingRules": {
        "basePrice": 499,
        "hourlyRate": 150
      }
    }
  }
  ```

---

### 2.5 Booking APIs

#### `POST /bookings/estimate`
Calculates pricing estimates based on base rate, duration, and time-based surge factors.
* **Authentication:** None (Public)
* **Request Body:**
  ```json
  {
    "category": "AC Repair",
    "hoursEstimated": 2,
    "scheduledTime": "2026-06-26T22:00:00.000Z" // Late-night triggers nightSurge
  }
  ```
* **Response (200 OK):**
  ```json
  {
    "success": true,
    "estimate": {
      "basePrice": 499,
      "hourlyRate": 150,
      "hoursEstimated": 2,
      "surgeApplied": 100, // Night shift surcharge
      "subtotal": 899,
      "discount": 0,
      "tax": 162,
      "totalAmount": 1061
    }
  }
  ```

---

#### `POST /bookings`
Creates a service booking. Initiates the Socket.io matching sequence.
* **Authentication:** JWT Bearer (Protected). Roles allowed: `customer`, `admin`.
* **Request Body:**
  ```json
  {
    "serviceId": "60d5ec4b1f48c34f3b2591c0",
    "scheduledTime": "2026-06-27T10:30:00.000Z",
    "address": {
      "street": "Flat 402, Oakwood Towers",
      "area": "Jubilee Hills",
      "city": "Hyderabad",
      "pincode": "500081"
    },
    "coordinates": {
      "lat": 17.4321,
      "lng": 78.3824
    },
    "totalAmount": 649,
    "notes": "AC cooling is weak."
  }
  ```
* **Response (201 Created):**
  ```json
  {
    "success": true,
    "booking": {
      "id": "60d5ec4b1f48c34f3b2591d1",
      "bookingCode": "HH-2026-9831",
      "status": "pending",
      "billing": {
        "totalAmount": 649,
        "platformCommission": 97,
        "netToHero": 534,
        "isPaid": false
      }
    }
  }
  ```

---

#### `GET /bookings`
Returns a list of bookings for the logged-in user.
* **Authentication:** JWT Bearer (Protected)
* **Response (200 OK):**
  ```json
  {
    "success": true,
    "bookings": [
      {
        "id": "60d5ec4b1f48c34f3b2591d1",
        "bookingCode": "HH-2026-9831",
        "serviceName": "Split AC Deep Cleaning",
        "scheduledTime": "2026-06-27T10:30:00.000Z",
        "status": "assigned",
        "totalAmount": 649
      }
    ]
  }
  ```

---

#### `GET /bookings/:id`
Retrieves full details of a specific booking.
* **Authentication:** JWT Bearer (Protected)
* **Response (200 OK):**
  ```json
  {
    "success": true,
    "booking": {
      "id": "60d5ec4b1f48c34f3b2591d1",
      "bookingCode": "HH-2026-9831",
      "customerId": "60d5ec4b1f48c34f3b2591a1",
      "technicianId": "60d5ec4b1f48c34f3b2591b0",
      "status": "completed",
      "billing": {
        "totalAmount": 649,
        "platformCommission": 97,
        "netToHero": 534,
        "isPaid": true
      },
      "address": {
        "street": "Flat 402, Oakwood Towers",
        "area": "Jubilee Hills",
        "city": "Hyderabad",
        "pincode": "500081"
      },
      "checklist": [
        { "task": "Pre-service photo uploaded", "completed": true },
        { "task": "Duct cleaning completed", "completed": true }
      ]
    }
  }
  ```

---

#### `PUT /bookings/:id`
Updates the booking (e.g. scheduling details, checking off service tasks).
* **Authentication:** JWT Bearer (Protected)
* **Request Body (Example: Complete checklist task):**
  ```json
  {
    "checklist": [
      { "task": "Pre-service photo uploaded", "completed": true },
      { "task": "Duct cleaning completed", "completed": true, "timestamp": "2026-06-26T10:55:00.000Z" }
    ]
  }
  ```
* **Response (200 OK):**
  ```json
  {
    "success": true,
    "booking": { ... updated booking object ... }
  }
  ```

---

#### `POST /bookings/:id/cancel`
Cancels the booking. Charges a cancellation fee if the technician was already en-route.
* **Authentication:** JWT Bearer (Protected)
* **Request Body:**
  ```json
  {
    "reason": "Family emergency."
  }
  ```
* **Response (200 OK):**
  ```json
  {
    "success": true,
    "message": "Booking cancelled successfully.",
    "cancellationFee": 50 // Cancellation fee charged in INR
  }
  ```

---

#### `POST /bookings/:id/technician-response`
Accepts or rejects an incoming job matching ring.
* **Authentication:** JWT Bearer (Protected). Roles allowed: `provider`, `technician`.
* **Request Body:**
  ```json
  {
    "response": "accept" // Options: "accept", "reject"
  }
  ```
* **Response (200 OK):**
  ```json
  {
    "success": true,
    "message": "Booking assigned to technician successfully.",
    "status": "assigned"
  }
  ```

---

#### `GET /bookings/:id/messages`
Retrieves chat logs associated with the booking.
* **Authentication:** JWT Bearer (Protected)
* **Response (200 OK):**
  ```json
  {
    "success": true,
    "messages": [
      {
        "_id": "60d5ec4b1f48c34f3b259201",
        "senderId": "60d5ec4b1f48c34f3b2591a1",
        "senderName": "Priya Sharma",
        "message": "Hi Rajesh, you can ring bell 402 directly.",
        "createdAt": "2026-06-26T10:18:22.000Z"
      }
    ]
  }
  ```

---

### 2.6 Payment APIs

#### `POST /payments/create-order`
Creates a pre-authorized order with Razorpay.
* **Authentication:** JWT Bearer (Protected)
* **Request Body:**
  ```json
  {
    "bookingId": "60d5ec4b1f48c34f3b2591d1"
  }
  ```
* **Response (200 OK):**
  ```json
  {
    "success": true,
    "order": {
      "id": "order_O1h83hf20kdh1",
      "entity": "order",
      "amount": 64900, // Amount in paise (649 INR)
      "currency": "INR",
      "receipt": "receipt_booking_9831"
    }
  }
  ```

---

#### `POST /payments/verify`
Receives payment verification parameters from Razorpay Checkout success callbacks.
* **Authentication:** None (Public / Callback signature verified internally via HMAC-SHA256)
* **Request Body:**
  ```json
  {
    "razorpay_order_id": "order_O1h83hf20kdh1",
    "razorpay_payment_id": "pay_O1h92kfh293k",
    "razorpay_signature": "82f93d4a0db2a554a938c82de940fa3214e9f029c",
    "bookingId": "60d5ec4b1f48c34f3b2591d1"
  }
  ```
* **Response (200 OK):**
  ```json
  {
    "success": true,
    "message": "Payment verified and booking updated to paid successfully.",
    "payment": {
      "paymentId": "pay_O1h92kfh293k",
      "amount": 64900,
      "paymentStatus": "successful"
    }
  }
  ```

---

#### `POST /payments/release/:bookingId`
Releases escrowed funds to the technician's wallet upon completion of the service checklist.
* **Authentication:** JWT Bearer (Protected)
* **Response (200 OK):**
  ```json
  {
    "success": true,
    "message": "Escrow released successfully.",
    "walletBalance": 2384, // Updated wallet balance in INR
    "split": {
      "platformCommission": 97.00,
      "netToHero": 534.00
    }
  }
  ```

---

#### `GET /payments/invoice/:paymentId`
Fetches billing details and receipt lines for a completed transaction.
* **Authentication:** JWT Bearer (Protected)
* **Response (200 OK):**
  ```json
  {
    "success": true,
    "invoice": {
      "invoiceNumber": "INV-2026-48312",
      "paymentId": "pay_O1h92kfh293k",
      "amount": 649,
      "platformCommission": 97,
      "technicianAmount": 534,
      "customerName": "Priya Sharma",
      "technicianName": "Rajesh Kumar",
      "date": "2026-06-26T10:00:05.000Z"
    }
  }
  ```

---

#### `POST /payments/refund/:paymentId`
Initiates a refund for cancelled services.
* **Authentication:** JWT Bearer (Protected). Roles allowed: `admin`, `customer`.
* **Request Body:**
  ```json
  {
    "amount": 64900 // Refund amount in paise
  }
  ```
* **Response (200 OK):**
  ```json
  {
    "success": true,
    "message": "Refund processed successfully.",
    "refund": {
      "refundId": "rfnd_P34823kfjg29",
      "amount": 64900,
      "status": "processed"
    }
  }
  ```

---

### 2.7 Review APIs

#### `POST /reviews`
Submits a service rating and comment.
* **Authentication:** JWT Bearer (Protected).
* **Request Body:**
  ```json
  {
    "bookingId": "60d5ec4b1f48c34f3b2591d1",
    "rating": 5,
    "comment": "Excellent service! Clean and quick work.",
    "photos": [
      "https://assets.homehero.in/reviews/bookings_9831_complete1.webp"
    ]
  }
  ```
* **Response (201 Created):**
  ```json
  {
    "success": true,
    "review": {
      "id": "60d5ec4b1f48c34f3b2591f1",
      "rating": 5,
      "comment": "Excellent service! Clean and quick work."
    }
  }
  ```

---

#### `GET /reviews/:technicianId`
Fetches reviews written for a technician.
* **Authentication:** None (Public)
* **Response (200 OK):**
  ```json
  {
    "success": true,
    "reviews": [
      {
        "id": "60d5ec4b1f48c34f3b2591f1",
        "rating": 5,
        "comment": "Excellent service! Clean and quick work.",
        "reviewerName": "Priya Sharma",
        "createdAt": "2026-06-26T11:30:00.000Z"
      }
    ]
  }
  ```

---

### 2.8 Admin APIs

#### `GET /admin/stats`
Retrieves system-wide KPI metrics for the analytics graphs.
* **Authentication:** JWT Bearer (Protected). Roles allowed: `admin`.
* **Response (200 OK):**
  ```json
  {
    "success": true,
    "stats": {
      "totalUsers": 1284,
      "totalTechnicians": 142,
      "activeBookings": 18,
      "totalRevenuePaise": 59384900,
      "totalCommissionPaise": 8907700
    }
  }
  ```

---

#### `GET /admin/dashboard`
Returns aggregated graph datasets.
* **Authentication:** JWT Bearer (Protected). Roles allowed: `admin`.
* **Response (200 OK):**
  ```json
  {
    "success": true,
    "analytics": {
      "revenueTrajectory": [
        { "date": "2026-06-20", "amount": 8450 },
        { "date": "2026-06-21", "amount": 9200 }
      ],
      "categoryShares": [
        { "name": "Electrician", "value": 38 },
        { "name": "AC Repair", "value": 42 }
      ]
    }
  }
  ```

---

#### `GET /admin/users`
Lists registered customer profiles with verification status toggles.
* **Authentication:** JWT Bearer (Protected). Roles allowed: `admin`.
* **Response (200 OK):**
  ```json
  {
    "success": true,
    "users": [
      {
        "_id": "60d5ec4b1f48c34f3b2591a1",
        "name": "Priya Sharma",
        "email": "priya.sharma@example.com",
        "phone": "+919876543210",
        "isVerified": true,
        "createdAt": "2026-06-20T08:30:00.000Z"
      }
    ]
  }
  ```

---

#### `PUT /admin/users/:id/status`
Suspends or reactivates a customer or technician user account.
* **Authentication:** JWT Bearer (Protected). Roles allowed: `admin`.
* **Request Body:**
  ```json
  {
    "isVerified": false // Suspends verification status
  }
  ```
* **Response (200 OK):**
  ```json
  {
    "success": true,
    "message": "User status updated successfully.",
    "user": {
      "id": "60d5ec4b1f48c34f3b2591a1",
      "isVerified": false
    }
  }
  ```

---

#### `GET /admin/heroes/pending`
Fetches technician profiles awaiting KYC validation.
* **Authentication:** JWT Bearer (Protected). Roles allowed: `admin`.
* **Response (200 OK):**
  ```json
  {
    "success": true,
    "pendingHeroes": [
      {
        "id": "60d5ec4b1f48c34f3b2591bf",
        "fullName": "Amit Patel",
        "phone": "+917654321098",
        "serviceCategory": "Plumber",
        "aadhaarNumber": "893019283748",
        "verification": {
          "status": "pending",
          "backgroundCheckStatus": "pending"
        }
      }
    ]
  }
  ```

---

#### `PUT /admin/heroes/:id/verify`
Manually completes KYC audit, changing statuses.
* **Authentication:** JWT Bearer (Protected). Roles allowed: `admin`.
* **Request Body:**
  ```json
  {
    "status": "verified", // Options: "verified", "unverified", "pending"
    "licenseVerified": true,
    "backgroundCheckStatus": "passed"
  }
  ```
* **Response (200 OK):**
  ```json
  {
    "success": true,
    "message": "Technician credentials verified successfully."
  }
  ```

---

#### `GET /admin/bookings`
List all bookings inside the platform.
* **Authentication:** JWT Bearer (Protected). Roles allowed: `admin`.
* **Response (200 OK):**
  ```json
  {
    "success": true,
    "bookings": [ ... list of all booking objects ... ]
  }
  ```

---

#### `GET /admin/pricing/multipliers`
Fetches current surge configurations.
* **Authentication:** JWT Bearer (Protected). Roles allowed: `admin`.
* **Response (200 OK):**
  ```json
  {
    "success": true,
    "multipliers": {
      "holidayMultiplier": 1.25,
      "monsoonMultiplier": 1.15,
      "nightShiftMultiplier": 1.20
    }
  }
  ```

---

#### `PUT /admin/pricing/multipliers`
Updates surge multipliers dynamically.
* **Authentication:** JWT Bearer (Protected). Roles allowed: `admin`.
* **Request Body:**
  ```json
  {
    "holidayMultiplier": 1.30,
    "monsoonMultiplier": 1.20,
    "nightShiftMultiplier": 1.25
  }
  ```
* **Response (200 OK):**
  ```json
  {
    "success": true,
    "message": "Surge multipliers updated successfully."
  }
  ```
