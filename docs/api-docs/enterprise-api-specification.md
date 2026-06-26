# HomeHero Enterprise-Grade REST API Specification
**Author:** Principal Backend Architect  
**Version:** 1.5.0  
**Base URL**: `https://api.homehero.com/api/v1`  
**Default Content Type**: `application/json`

This specification details the complete REST API interface for the **HomeHero** hyperlocal marketplace, detailing the authorization, payload constraints, and error codes for every endpoint.

---

## 1. Global Authentication & Security Standards

### 1.1 Headers
Every authenticated request must include the following header:
```http
Authorization: Bearer <jwt_access_token>
```

### 1.2 Common Error Response (JSON)
All API errors return a standardized format for clean parsing by clients:
```json
{
  "success": false,
  "errorCode": "RESOURCE_NOT_FOUND",
  "message": "The requested booking does not exist.",
  "errors": []
}
```

---

## 2. API Endpoints Reference

### 2.1 Authentication Module (`/auth`)

#### A. Register Account
* **Method & URL**: `POST /auth/register`
* **Description**: Register a new Customer or Technician account.
* **Request Body**:
  ```json
  {
    "email": "sarah.chen@gmail.com",
    "phone": "+919876543210",
    "password": "SecurePassword123!",
    "role": "customer",
    "firstName": "Sarah",
    "lastName": "Chen"
  }
  ```
* **Validation Rules**:
  * `email`: String (Required, valid email format).
  * `phone`: String (Required, E.164 format).
  * `password`: String (Required, min 8 chars, 1 uppercase, 1 number, 1 special).
  * `role`: String (Required, enum: `customer`, `technician`).
* **Auth & Authorization**: None.
* **Response (201 Created)**:
  ```json
  {
    "success": true,
    "message": "Account registered. Verification OTP sent via SMS.",
    "user": {
      "id": "651f8a2e3f4e5a6b7c8d9e01",
      "email": "sarah.chen@gmail.com",
      "role": "customer",
      "isVerified": false
    }
  }
  ```
* **Error Responses**:
  * `400 Bad Request` (`INVALID_PAYLOAD`) - Validation rules failed.
  * `409 Conflict` (`EMAIL_ALREADY_EXISTS`, `PHONE_ALREADY_EXISTS`) - Email or phone registered.

#### B. Verify OTP Code
* **Method & URL**: `POST /auth/verify-otp`
* **Description**: Validate the 6-digit registration OTP to verify the account and issue a JWT.
* **Request Body**:
  ```json
  {
    "phone": "+919876543210",
    "otpCode": "123456"
  }
  ```
* **Validation Rules**:
  * `phone`: String (Required).
  * `otpCode`: String (Required, 6 digits).
* **Auth & Authorization**: None.
* **Response (200 OK)**:
  ```json
  {
    "success": true,
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "651f8a2e3f4e5a6b7c8d9e01",
      "email": "sarah.chen@gmail.com",
      "role": "customer",
      "isVerified": true
    }
  }
  ```
* **Error Responses**:
  * `400 Bad Request` (`OTP_EXPIRED_OR_INVALID`) - Incorrect or expired OTP.
  * `404 Not Found` (`USER_NOT_FOUND`) - Account not found.

#### C. Login (Credentials fallback)
* **Method & URL**: `POST /auth/login`
* **Description**: Authenticate using email and password.
* **Request Body**:
  ```json
  {
    "email": "sarah.chen@gmail.com",
    "password": "SecurePassword123!"
  }
  ```
* **Validation Rules**:
  * `email`: String (Required).
  * `password`: String (Required).
* **Auth & Authorization**: None.
* **Response (200 OK)**:
  ```json
  {
    "success": true,
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "651f8a2e3f4e5a6b7c8d9e01",
      "email": "sarah.chen@gmail.com",
      "role": "customer",
      "isVerified": true
    }
  }
  ```
* **Error Responses**:
  * `401 Unauthorized` (`INVALID_CREDENTIALS`) - Email/password incorrect.

---

### 2.2 Customers Module (`/customers`)

#### A. Get Profile
* **Method & URL**: `GET /customers/profile`
* **Description**: Retrieve the current customer's profile details.
* **Request Body**: None.
* **Auth & Authorization**: Yes (JWT required, role: `customer`).
* **Response (200 OK)**:
  ```json
  {
    "success": true,
    "profile": {
      "id": "651f8a2e3f4e5a6b7c8d9e01",
      "email": "sarah.chen@gmail.com",
      "phone": "+919876543210",
      "firstName": "Sarah",
      "lastName": "Chen",
      "avatarUrl": ""
    }
  }
  ```

#### B. Save Address
* **Method & URL**: `POST /customers/addresses`
* **Description**: Save an address to the customer's profile address book.
* **Request Body**:
  ```json
  {
    "label": "Office",
    "street": "102, building A, Gachibowli Tech Park",
    "area": "Gachibowli",
    "city": "Hyderabad",
    "pincode": "500032",
    "lat": 17.4431,
    "lng": 78.3752
  }
  ```
* **Validation Rules**:
  * `label`: String (Required, e.g. `Home`, `Office`).
  * `street`: String (Required).
  * `city`: String (Required).
  * `pincode`: String (Required, 6 digits).
  * `lat`: Float (Required, -90.0 to 90.0).
  * `lng`: Float (Required, -180.0 to 180.0).
* **Auth & Authorization**: Yes (JWT required, role: `customer`).
* **Response (201 Created)**:
  ```json
  {
    "success": true,
    "message": "Address saved successfully.",
    "address": {
      "id": "651f8a2e3f4e5a6b7c8d9e99",
      "label": "Office",
      "street": "102, building A, Gachibowli Tech Park"
    }
  }
  ```

---

### 2.3 Technicians Module (`/technicians`)

#### A. Get Technician Profile
* **Method & URL**: `GET /technicians/profile`
* **Description**: Retrieve the logged-in technician's profile, including rating and wallet metrics.
* **Request Body**: None.
* **Auth & Authorization**: Yes (JWT required, role: `technician`).
* **Response (200 OK)**:
  ```json
  {
    "success": true,
    "profile": {
      "id": "651f8a2e3f4e5a6b7c8d9e02",
      "skills": ["Plumber"],
      "rating": 4.9,
      "isOnline": true,
      "walletBalance": 5200.00
    }
  }
  ```

#### B. Update Telemetry GPS Location
* **Method & URL**: `PUT /technicians/location`
* **Description**: Update the technician's current coordinates.
* **Request Body**:
  ```json
  {
    "lat": 12.910382,
    "lng": 77.641201
  }
  ```
* **Validation Rules**:
  * `lat`: Double (Required, latitude).
  * `lng`: Double (Required, longitude).
* **Auth & Authorization**: Yes (JWT required, role: `technician`).
* **Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Location telemetry coordinates updated."
  }
  ```

---

### 2.4 Services Module (`/services`)

#### A. List Services
* **Method & URL**: `GET /services`
* **Description**: Retrieve active service items, optionally filtered by category.
* **Request Parameters**: `?category=ac-repair` (Optional).
* **Auth & Authorization**: None.
* **Response (200 OK)**:
  ```json
  {
    "success": true,
    "services": [
      {
        "id": "651f8a2e3f4e5a6b7c8d9e04",
        "name": "AC Condenser Repair",
        "pricingRules": {
          "basePrice": 850,
          "hourlyRate": 300
        }
      }
    ]
  }
  ```

---

### 2.5 Categories Module (`/categories`)

#### A. List Categories
* **Method & URL**: `GET /categories`
* **Description**: Retrieve all active service categories slug paths.
* **Auth & Authorization**: None.
* **Response (200 OK)**:
  ```json
  {
    "success": true,
    "categories": [
      {
        "id": "651f8a2e3f4e5a6b7c8d9e08",
        "name": "AC Repair",
        "slug": "ac-repair",
        "iconUrl": "https://cdn.homehero.com/categories/ac-repair.svg"
      }
    ]
  }
  ```

---

### 2.6 Bookings Module (`/bookings`)

#### A. Upfront Estimation
* **Method & URL**: `POST /bookings/estimate`
* **Description**: Compute the final pricing estimate before booking.
* **Request Body**:
  ```json
  {
    "serviceId": "651f8a2e3f4e5a6b7c8d9e04",
    "hours": 2
  }
  ```
* **Validation Rules**:
  * `serviceId`: String (Required, valid ObjectId).
  * `hours`: Integer (Required, min 1).
* **Auth & Authorization**: None.
* **Response (200 OK)**:
  ```json
  {
    "success": true,
    "pricing": {
      "basePrice": 850.00,
      "hourlyRate": 300.00,
      "subtotal": 1450.00,
      "surgeApplied": 0.00,
      "totalAmount": 1450.00
    }
  }
  ```

#### B. Create Booking Request
* **Method & URL**: `POST /bookings`
* **Description**: Initialize a booking request and trigger the matchmaking process.
* **Request Body**:
  ```json
  {
    "serviceId": "651f8a2e3f4e5a6b7c8d9e04",
    "scheduledTime": "2026-06-18T11:00:00.000Z",
    "street": "Flat 402, Sector 2",
    "city": "Bengaluru",
    "pincode": "560102",
    "lat": 12.910382,
    "lng": 77.641201,
    "totalAmount": 1450.00
  }
  ```
* **Validation Rules**:
  * `serviceId`: String (Required).
  * `scheduledTime`: Date (Required, ISO8601).
  * `street`: String (Required).
  * `city`: String (Required).
  * `pincode`: String (Required, 6 digits).
  * `lat`/`lng`: Float (Required).
  * `totalAmount`: Float (Required).
* **Auth & Authorization**: Yes (JWT required, role: `customer`).
* **Response (201 Created)**:
  ```json
  {
    "success": true,
    "message": "Booking registered. Searching for available technicians.",
    "booking": {
      "id": "651f8a2e3f4e5a6b7c8d9e05",
      "bookingCode": "BKG-20261109",
      "status": "searching"
    }
  }
  ```

#### C. Get Booking Messages
* **Method & URL**: `GET /bookings/:id/messages`
* **Description**: Retrieve the chat history for a specific booking.
* **Auth & Authorization**: Yes (JWT required, must be the associated customer, technician, or an admin).
* **Response (200 OK)**:
  ```json
  {
    "success": true,
    "messages": [
      {
        "senderId": "651f8a2e3f4e5a6b7c8d9e01",
        "senderName": "Rohan Das",
        "message": "Hi, I have arrived at the location.",
        "createdAt": "2026-06-18T11:05:00.000Z"
      }
    ]
  }
  ```

---

### 2.7 Payments Module (`/payments`)

#### A. Generate Razorpay Order
* **Method & URL**: `POST /payments/order`
* **Description**: Create a Razorpay Order ID to initiate the payment hold on checkout.
* **Request Body**:
  ```json
  {
    "bookingId": "651f8a2e3f4e5a6b7c8d9e05"
  }
  ```
* **Validation Rules**:
  * `bookingId`: String (Required).
* **Auth & Authorization**: Yes (JWT required, role: `customer`).
* **Response (200 OK)**:
  ```json
  {
    "success": true,
    "orderId": "order_PK8490aBcd10fd",
    "amount": 145000,
    "currency": "INR",
    "key": "rzp_live_abcdef123456"
  }
  ```

#### B. Verify Signature
* **Method & URL**: `POST /payments/verify`
* **Description**: Cryptographically verify the transaction payment signature and set the status to `held_in_escrow`.
* **Request Body**:
  ```json
  {
    "razorpay_order_id": "order_PK8490aBcd10fd",
    "razorpay_payment_id": "pay_PK8529f3d6a2e4",
    "razorpay_signature": "4fa8d9e18b82c3f4e5a6b7c8d9e01f..."
  }
  ```
* **Auth & Authorization**: None.
* **Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Payment verified successfully."
  }
  ```

#### C. Release Escrow
* **Method & URL**: `POST /payments/release/:bookingId`
* **Description**: Release held funds to the technician's wallet after customer confirmation.
* **Auth & Authorization**: Yes (JWT required, role: `customer`).
* **Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Funds released successfully.",
    "releasedAmount": 1450.00,
    "netToHero": 1232.50,
    "platformFee": 217.50
  }
  ```
* **Error Responses**:
  * `422 Unprocessable Entity` (`PAYOUT_PREMATURE`) - Booking not completed.

---

### 2.8 Reviews Module (`/reviews`)

#### A. Submit Review
* **Method & URL**: `POST /reviews`
* **Description**: Submit a review and rating for a completed booking.
* **Request Body**:
  ```json
  {
    "bookingId": "651f8a2e3f4e5a6b7c8d9e05",
    "rating": 5,
    "comment": "Outstanding repair work."
  }
  ```
* **Validation Rules**:
  * `bookingId`: String (Required).
  * `rating`: Integer (Required, range 1 to 5).
  * `comment`: String (Required, max 1000 characters).
* **Auth & Authorization**: Yes (JWT required, role: `customer`).
* **Response (201 Created)**:
  ```json
  {
    "success": true,
    "message": "Review submitted successfully."
  }
  ```

---

### 2.9 Notifications Module (`/notifications`)

#### A. Get Notifications
* **Method & URL**: `GET /notifications`
* **Description**: Retrieve the notification history for the authenticated user.
* **Auth & Authorization**: Yes (JWT required).
* **Response (200 OK)**:
  ```json
  {
    "success": true,
    "notifications": [
      {
        "id": "651f8a2e3f4e5a6b7c8d9e10",
        "title": "AC Tech Matched",
        "body": "Amit is assigned and is preparing tools.",
        "isRead": false,
        "createdAt": "2026-06-17T19:50:10.000Z"
      }
    ]
  }
  ```

---

### 2.10 Admin Module (`/admin`)

#### A. Get Stats
* **Method & URL**: `GET /admin/stats`
* **Description**: Retrieve aggregated platform performance metrics.
* **Auth & Authorization**: Yes (JWT required, role: `admin`).
* **Response (200 OK)**:
  ```json
  {
    "success": true,
    "stats": {
      "totalUsers": 15004,
      "totalHeroes": 850,
      "activeBookings": 420,
      "platformRevenue": 4850020
    }
  }
  ```

#### B. Verify Technician Vetting Profile
* **Method & URL**: `PUT /admin/heroes/:id/verify`
* **Description**: Verify and activate a technician's profile.
* **Auth & Authorization**: Yes (JWT required, role: `admin`).
* **Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Technician profile has been verified and activated."
  }
  ```
