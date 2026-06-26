# HomeHero REST API Specification
**Author:** Principal Backend Architect & API Designer  
**Version:** 1.7.0  
**Base URL**: `https://api.homehero.com/api` (or `http://localhost:5000/api`)  
**Default Content Type**: `application/json`

This document defines the REST API endpoints, request/response models, validation rules, authorization requirements, and error codes for the **HomeHero** hyperlocal marketplace application.

---

## 1. Global Authentication & Security Standards

### 1.1 Headers
All authenticated endpoints require a JSON Web Token (JWT) sent via the HTTP `Authorization` header:
```http
Authorization: Bearer <jwt_access_token>
```

### 1.2 Common Error Response Format
```json
{
  "success": false,
  "errorCode": "VALIDATION_FAILED",
  "message": "One or more input validation parameters failed.",
  "errors": [
    {
      "field": "email",
      "issue": "Must be a valid email format"
    }
  ]
}
```

---

## 2. API Endpoint specifications

### 2.1 Authentication Module

#### A. Register Account
* **Endpoint Name**: User/Technician Registration
* **HTTP Method**: `POST`
* **URL**: `/auth/register`
* **Purpose**: Register a new Customer, Technician, or Admin account.
* **Authentication Requirement**: None (Public)
* **Authorization Requirement**: None (Public)
* **Validation Rules**:
  * `email`: String (Required, valid email format).
  * `phone`: String (Required, unique, E.164 format).
  * `password`: String (Required, min 8 characters, at least 1 uppercase, 1 number, 1 special).
  * `role`: String (Required, enum: `customer`, `technician`, `admin`).
  * `firstName`: String (Required, min 1 char).
  * `lastName`: String (Required, min 1 char).
* **Request Body**:
  ```json
  {
    "email": "sarah.chen@example.com",
    "phone": "+919876543210",
    "password": "SecurePassword123!",
    "role": "customer",
    "firstName": "Sarah",
    "lastName": "Chen"
  }
  ```
* **Query Parameters**: None.
* **Path Parameters**: None.
* **Response Example (201 Created)**:
  ```json
  {
    "success": true,
    "message": "Account registered successfully.",
    "user": {
      "id": "651f8a2e3f4e5a6b7c8d9e01",
      "email": "sarah.chen@example.com",
      "phone": "+919876543210",
      "role": "customer",
      "isVerified": false
    }
  }
  ```
* **Error Responses**:
  * `400 Bad Request` (`INVALID_PAYLOAD`): Validation check failed.
  * `409 Conflict` (`EMAIL_ALREADY_EXISTS`, `PHONE_ALREADY_EXISTS`): Unique credential constraint violation.

#### B. User Login
* **Endpoint Name**: User Login
* **HTTP Method**: `POST`
* **URL**: `/auth/login`
* **Purpose**: Authenticate using credentials to generate a JWT token.
* **Authentication Requirement**: None (Public)
* **Authorization Requirement**: None (Public)
* **Validation Rules**:
  * `email`: String (Required).
  * `password`: String (Required).
* **Request Body**:
  ```json
  {
    "email": "sarah.chen@example.com",
    "password": "SecurePassword123!"
  }
  ```
* **Query Parameters**: None.
* **Path Parameters**: None.
* **Response Example (200 OK)**:
  ```json
  {
    "success": true,
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "651f8a2e3f4e5a6b7c8d9e01",
      "email": "sarah.chen@example.com",
      "role": "customer",
      "isVerified": true
    }
  }
  ```
* **Error Responses**:
  * `401 Unauthorized` (`INVALID_CREDENTIALS`): Email or password incorrect.

---

### 2.2 Services Module

#### A. List Services
* **Endpoint Name**: Get Services Catalog
* **HTTP Method**: `GET`
* **URL**: `/services`
* **Purpose**: Retrieve all active service offerings.
* **Authentication Requirement**: None (Public)
* **Authorization Requirement**: None (Public)
* **Request Body**: None.
* **Query Parameters**: None.
* **Path Parameters**: None.
* **Response Example (200 OK)**:
  ```json
  {
    "success": true,
    "services": [
      {
        "id": "651f8a2e3f4e5a6b7c8d9e04",
        "name": "Plumber",
        "pricingRules": {
          "basePrice": 500,
          "hourlyRate": 250
        }
      }
    ]
  }
  ```\n```\n\n#### C. List Services by Category\n* **Endpoint Name**: Get Services By Category\n* **HTTP Method**: `GET`\n* **URL**: `/services/category/:slug`\n* **Purpose**: Retrieve all active service offerings for a specific professional category (e.g., electrician, plumber, carpenter, ac-repair).\n* **Authentication Requirement**: None (Public)\n* **Authorization Requirement**: None (Public)\n* **Path Parameters**:\n  * `slug` – Category slug (e.g., `electrician`).\n* **Response Example (200 OK)**:\n```json\n{\n  "success": true,\n  "services": [\n    {\n      "id": "651f8a2e3f4e5a6b7c8d9e04",\n      "name": "Plumber",\n      "description": "Standard piping and leak repair service.",\n      "category": "Plumber",\n      "categorySlug": "plumber",\n      "pricingRules": {\n        "basePrice": 500,\n        "hourlyRate": 250\n      }\n    }\n  ]\n}\n```

#### B. Get Service Detail
* **Endpoint Name**: Fetch Single Service
* **HTTP Method**: `GET`
* **URL**: `/services/:id`
* **Purpose**: Retrieve details for a specific service item.
* **Authentication Requirement**: None (Public)
* **Authorization Requirement**: None (Public)
* **Request Body**: None.
* **Query Parameters**: None.
* **Path Parameters**:
  * `id`: String (Required, service ObjectId).
* **Response Example (200 OK)**:
  ```json
  {
    "success": true,
    "service": {
      "id": "651f8a2e3f4e5a6b7c8d9e04",
      "name": "Plumber",
      "description": "Standard piping and leak repair service.",
      "pricingRules": {
        "basePrice": 500,
        "hourlyRate": 250
      }
    }
  }
  ```
* **Error Responses**:
  * `404 Not Found` (`SERVICE_NOT_FOUND`): Service ID does not exist.

---

### 2.3 Technicians Module

#### A. Search Nearby Technicians
* **Endpoint Name**: Query Online Technicians
* **HTTP Method**: `GET`
* **URL**: `/technicians`
* **Purpose**: Locate active online technicians sorted by distance.
* **Authentication Requirement**: Yes (JWT Access Token)
* **Authorization Requirement**: Restricted to `customer` and `admin` roles.
* **Request Body**: None.
* **Query Parameters**:
  * `lat`: Float (Required, Latitude).
  * `lng`: Float (Required, Longitude).
  * `skill`: String (Required, e.g. `Plumber`).
* **Path Parameters**: None.
* **Response Example (200 OK)**:
  ```json
  {
    "success": true,
    "results": [
      {
        "id": "651f8a2e3f4e5a6b7c8d9e02",
        "name": "Suresh Kumar",
        "distanceMeter": 450.5,
        "rating": 4.9,
        "skills": ["Plumber"]
      }
    ]
  }
  ```
* **Error Responses**:
  * `400 Bad Request` (`MISSING_PARAMS`): Required coordinates are missing.

#### B. Get Technician Profile Details
* **Endpoint Name**: Fetch Single Technician
* **HTTP Method**: `GET`
* **URL**: `/technicians/:id`
* **Purpose**: Retrieve a technician's profile details.
* **Authentication Requirement**: Yes (JWT Access Token)
* **Authorization Requirement**: Open to all authenticated users.
* **Request Body**: None.
* **Query Parameters**: None.
* **Path Parameters**:
  * `id`: String (Required, Technician ObjectId).
* **Response Example (200 OK)**:
  ```json
  {
    "success": true,
    "technician": {
      "id": "651f8a2e3f4e5a6b7c8d9e02",
      "name": "Suresh Kumar",
      "skills": ["Plumber"],
      "rating": 4.9,
      "isOnline": true
    }
  }
  ```
* **Error Responses**:
  * `404 Not Found` (`TECHNICIAN_NOT_FOUND`): Technician profile not found.

---

### 2.4 Bookings Module

#### A. Create Booking
* **Endpoint Name**: Book a Service Request
* **HTTP Method**: `POST`
* **URL**: `/bookings`
* **Purpose**: Register a service booking and trigger matchmaking.
* **Authentication Requirement**: Yes (JWT Access Token)
* **Authorization Requirement**: Restricted to `customer` role.
* **Validation Rules**:
  * `serviceId`: String (Required).
  * `scheduledTime`: Date (Required, ISO8601).
  * `street`: String (Required).
  * `city`: String (Required).
  * `pincode`: String (Required, 6 digits).
  * `lat`/`lng`: Float (Required).
  * `totalAmount`: Float (Required).
* **Request Body**:
  ```json
  {
    "serviceId": "651f8a2e3f4e5a6b7c8d9e04",
    "scheduledTime": "2026-06-20T14:00:00.000Z",
    "street": "Flat 202, Sector 4, HSR Layout",
    "city": "Bengaluru",
    "pincode": "560102",
    "lat": 12.910382,
    "lng": 77.641201,
    "totalAmount": 750.00
  }
  ```
* **Query Parameters**: None.
* **Path Parameters**: None.
* **Response Example (201 Created)**:
  ```json
  {
    "success": true,
    "message": "Booking created. Searching for available technicians.",
    "booking": {
      "id": "651f8a2e3f4e5a6b7c8d9e05",
      "bookingCode": "BKG-20261109",
      "status": "searching"
    }
  }
  ```

#### B. Fetch Booking Details
* **Endpoint Name**: Get Booking Details
* **HTTP Method**: `GET`
* **URL**: `/bookings/:id`
* **Purpose**: Retrieve details for a specific booking.
* **Authentication Requirement**: Yes (JWT Access Token)
* **Authorization Requirement**: Restricted to the associated Customer, Technician, or an Admin.
* **Request Body**: None.
* **Query Parameters**: None.
* **Path Parameters**:
  * `id`: String (Required, Booking ObjectId).
* **Response Example (200 OK)**:
  ```json
  {
    "success": true,
    "booking": {
      "id": "651f8a2e3f4e5a6b7c8d9e05",
      "bookingCode": "BKG-20261109",
      "status": "active",
      "scheduledTime": "2026-06-20T14:00:00.000Z",
      "address": {
        "street": "Flat 202, Sector 4, HSR Layout",
        "city": "Bengaluru",
        "pincode": "560102"
      }
    }
  }
  ```
* **Error Responses**:
  * `403 Forbidden` (`ACCESS_DENIED`): User is not a party to this booking.
  * `404 Not Found` (`BOOKING_NOT_FOUND`): Booking does not exist.

#### C. Update Booking Status
* **Endpoint Name**: Modify Booking
* **HTTP Method**: `PUT`
* **URL**: `/bookings/:id`
* **Purpose**: Update a booking's status or checklist details.
* **Authentication Requirement**: Yes (JWT Access Token)
* **Authorization Requirement**: Associated Customer (for cancellations) or Technician (for status changes).
* **Validation Rules**:
  * `status`: String (Optional, enum: `en_route`, `active`, `completed`, `cancelled`).
* **Request Body**:
  ```json
  {
    "status": "active"
  }
  ```
* **Query Parameters**: None.
* **Path Parameters**:
  * `id`: String (Required, Booking ObjectId).
* **Response Example (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Booking updated successfully.",
    "booking": {
      "id": "651f8a2e3f4e5a6b7c8d9e05",
      "status": "active"
    }
  }
  ```

#### D. Delete Booking
* **Endpoint Name**: Cancel/Delete Booking
* **HTTP Method**: `DELETE`
* **URL**: `/bookings/:id`
* **Purpose**: Remove a pending or unassigned booking request from the queue.
* **Authentication Requirement**: Yes (JWT Access Token)
* **Authorization Requirement**: Restricted to the associated Customer or an Admin.
* **Request Body**: None.
* **Query Parameters**: None.
* **Path Parameters**:
  * `id`: String (Required, Booking ObjectId).
* **Response Example (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Booking cancelled and deleted successfully."
  }
  ```

---

### 2.5 Payments Module

#### A. Create Order
* **Endpoint Name**: Create Razorpay Order hold
* **HTTP Method**: `POST`
* **URL**: `/payments/create-order`
* **Purpose**: Create a Razorpay Order ID to initiate the payment hold on checkout.
* **Authentication Requirement**: Yes (JWT Access Token)
* **Authorization Requirement**: Restricted to `customer` role.
* **Validation Rules**:
  * `bookingId`: String (Required, valid booking ID).
* **Request Body**:
  ```json
  {
    "bookingId": "651f8a2e3f4e5a6b7c8d9e05"
  }
  ```
* **Query Parameters**: None.
* **Path Parameters**: None.
* **Response Example (200 OK)**:
  ```json
  {
    "success": true,
    "orderId": "order_PK8490aBcd10fd",
    "amount": 75000,
    "currency": "INR",
    "key": "rzp_live_abcdef123456"
  }
  ```

#### B. Verify Payment
* **Endpoint Name**: Verify Payment
* **HTTP Method**: `POST`
* **URL**: `/payments/verify`
* **Purpose**: Cryptographically verify the transaction payment signature.
* **Authentication Requirement**: None (Webhook/Callback verification)
* **Authorization Requirement**: None
* **Validation Rules**:
  * `razorpay_order_id`: String (Required).
  * `razorpay_payment_id`: String (Required).
  * `razorpay_signature`: String (Required).
* **Request Body**:
  ```json
  {
    "razorpay_order_id": "order_PK8490aBcd10fd",
    "razorpay_payment_id": "pay_PK8529f3d6a2e4",
    "razorpay_signature": "4fa8d9e18b82c3f4e5a6b7c8d9e01f..."
  }
  ```
* **Query Parameters**: None.
* **Path Parameters**: None.
* **Response Example (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Payment signature verified. Escrow held successfully."
  }
  ```

---

### 2.6 Reviews Module

#### A. Submit Review
* **Endpoint Name**: Submit Rating and Review
* **HTTP Method**: `POST`
* **URL**: `/reviews`
* **Purpose**: Submit a rating and review for a completed service.
* **Authentication Requirement**: Yes (JWT Access Token)
* **Authorization Requirement**: Restricted to the Customer who placed the booking.
* **Validation Rules**:
  * `bookingId`: String (Required).
  * `rating`: Integer (Required, range 1 to 5).
  * `comment`: String (Required, max 1000 characters).
* **Request Body**:
  ```json
  {
    "bookingId": "651f8a2e3f4e5a6b7c8d9e05",
    "rating": 5,
    "comment": "Fast and clean work."
  }
  ```
* **Query Parameters**: None.
* **Path Parameters**: None.
* **Response Example (201 Created)**:
  ```json
  {
    "success": true,
    "message": "Review registered successfully."
  }
  ```

#### B. Get Technician Reviews
* **Endpoint Name**: List Reviews
* **HTTP Method**: `GET`
* **URL**: `/reviews/:technicianId`
* **Purpose**: Fetch all reviews submitted for a specific technician.
* **Authentication Requirement**: None
* **Authorization Requirement**: None
* **Request Body**: None.
* **Query Parameters**: None.
* **Path Parameters**:
  * `technicianId`: String (Required, Technician userId).
* **Response Example (200 OK)**:
  ```json
  {
    "success": true,
    "averageRating": 4.85,
    "reviews": [
      {
        "rating": 5,
        "comment": "Fast and clean work.",
        "createdAt": "2026-06-17T12:00:00.000Z"
      }
    ]
  }
  ```

---

### 2.7 Admin Module

#### A. Admin Dashboard Metrics
* **Endpoint Name**: Get Stats Overview
* **HTTP Method**: `GET`
* **URL**: `/admin/dashboard`
* **Purpose**: Retrieve system performance and revenue metrics.
* **Authentication Requirement**: Yes (JWT Access Token)
* **Authorization Requirement**: Restricted to `admin` role.
* **Request Body**: None.
* **Query Parameters**: None.
* **Path Parameters**: None.
* **Response Example (200 OK)**:
  ```json
  {
    "success": true,
    "metrics": {
      "totalUsers": 12050,
      "verifiedHeroes": 340,
      "activeJobs": 48,
      "commissionsEarned": 482910
    }
  }
  ```

#### B. List Users Audit
* **Endpoint Name**: List Users
* **HTTP Method**: `GET`
* **URL**: `/admin/users`
* **Purpose**: Audit and list registered platform user profiles.
* **Authentication Requirement**: Yes (JWT Access Token)
* **Authorization Requirement**: Restricted to `admin` role.
* **Request Body**: None.
* **Query Parameters**:
  * `role`: String (Optional, e.g. `customer` or `technician`).
* **Path Parameters**: None.
* **Response Example (200 OK)**:
  ```json
  {
    "success": true,
    "users": [
      {
        "id": "651f8a2e3f4e5a6b7c8d9e01",
        "email": "sarah.chen@example.com",
        "role": "customer",
        "createdAt": "2026-06-17T10:00:00.000Z"
      }
    ]
  }
  ```

#### C. List Bookings Audit
* **Endpoint Name**: List Bookings
* **HTTP Method**: `GET`
* **URL**: `/admin/bookings`
* **Purpose**: Audit and list platform bookings.
* **Authentication Requirement**: Yes (JWT Access Token)
* **Authorization Requirement**: Restricted to `admin` role.
* **Request Body**: None.
* **Query Parameters**:
  * `status`: String (Optional, filter by status).
* **Path Parameters**: None.
* **Response Example (200 OK)**:
  ```json
  {
    "success": true,
    "bookings": [
      {
        "id": "651f8a2e3f4e5a6b7c8d9e05",
        "bookingCode": "BKG-20261109",
        "status": "completed",
        "amount": 750.00
      }
    ]
  }
  ```
