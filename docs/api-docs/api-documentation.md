# HomeHero - REST API Specification & Developer Guide

## 1. Global API Configuration
*   **Base URL:** `https://api.homehero.com/v1`
*   **Default Format:** `application/json`
*   **Authentication:** Bearer token authentication via standard JWT (JSON Web Tokens). Passed via the header `Authorization: Bearer <JWT_TOKEN>`.

---

## 2. Authentication & Onboarding

### 2.1 Register User/Hero
Creates a new client or service provider account.
*   **Endpoint:** `POST /auth/register`
*   **Request Body:**
```json
{
  "email": "sarah.pm@example.com",
  "phone": "+15550199",
  "password": "SecurePassword123!",
  "role": "customer",
  "first_name": "Sarah",
  "last_name": "Chen"
}
```
*   **Response (201 Created):**
```json
{
  "success": true,
  "message": "User registered successfully. An OTP verification code has been sent.",
  "user": {
    "id": "e43b17d0-1cfa-42f5-b286-63ad5ff50b8c",
    "email": "sarah.pm@example.com",
    "role": "customer",
    "is_verified": false
  }
}
```

### 2.2 Verify OTP
Validates the user's mobile number via OTP.
*   **Endpoint:** `POST /auth/verify-otp`
*   **Request Body:**
```json
{
  "phone": "+15550199",
  "otp_code": "489210"
}
```
*   **Response (200 OK):**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "message": "Phone number successfully verified."
}
```

---

## 3. Booking Engine

### 3.1 Fetch Service Options
Retrieves pricing variables and categories.
*   **Endpoint:** `GET /services`
*   **Response (200 OK):**
```json
{
  "services": [
    {
      "id": "a25b17d0-1cfa-42f5-b286-63ad5ff50b8c",
      "name": "Deep Cleaning",
      "base_price": 50.00,
      "hourly_rate": 25.00,
      "is_active": true
    },
    {
      "id": "b78b17d0-1cfa-42f5-b286-63ad5ff50b8c",
      "name": "General Handyman",
      "base_price": 60.00,
      "hourly_rate": 35.00,
      "is_active": true
    }
  ]
}
```

### 3.2 Create Booking (With Pricing Estimator)
Calculates and books a flat-rate service.
*   **Endpoint:** `POST /bookings`
*   **Headers:** `Authorization: Bearer <token>`
*   **Request Body:**
```json
{
  "service_id": "a25b17d0-1cfa-42f5-b286-63ad5ff50b8c",
  "scheduled_time": "2026-06-20T14:00:00Z",
  "address": "123 Main St, Metro City",
  "coordinates": {
    "lat": 37.774929,
    "lng": -122.419418
  },
  "custom_details": {
    "bedrooms": 2,
    "bathrooms": 1,
    "has_pets": true
  }
}
```
*   **Response (201 Created):**
```json
{
  "success": true,
  "booking_id": "f51c17d0-1cfa-42f5-b286-63ad5ff50b8c",
  "summary": {
    "base_price": 50.00,
    "pet_surcharge": 15.00,
    "bedroom_multiplier": 1.2,
    "calculated_total": 78.00,
    "status": "pending_match"
  }
}
```

---

## 4. Location Tracking & Dispatch

### 4.1 Update Hero Availability & Location
Used by the Hero mobile app to stream real-time coordinate coordinates and toggle working status.
*   **Endpoint:** `POST /heroes/status`
*   **Headers:** `Authorization: Bearer <token>`
*   **Request Body:**
```json
{
  "is_online": true,
  "current_coordinates": {
    "lat": 37.775822,
    "lng": -122.420110
  }
}
```
*   **Response (200 OK):**
```json
{
  "success": true,
  "status": "online",
  "assigned_job_id": null
}
```

### 4.2 Track En-Route Hero Location
Retrieves the real-time location and ETA of an assigned Hero.
*   **Endpoint:** `GET /bookings/:id/track`
*   **Headers:** `Authorization: Bearer <token>`
*   **Response (200 OK):**
```json
{
  "booking_id": "f51c17d0-1cfa-42f5-b286-63ad5ff50b8c",
  "status": "en_route",
  "hero_details": {
    "first_name": "Marcus",
    "avatar_url": "https://cdn.homehero.com/avatars/marcus.jpg",
    "rating": 4.9
  },
  "location": {
    "lat": 37.775822,
    "lng": -122.420110
  },
  "estimated_arrival": "2026-06-20T13:52:10Z"
}
```

---

## 5. Escrow Payment & Releases

### 5.1 Authorize Pre-Payment Hold
*   **Endpoint:** `POST /payments/hold`
*   **Request Body:**
```json
{
  "booking_id": "f51c17d0-1cfa-42f5-b286-63ad5ff50b8c",
  "payment_method_id": "pm_1H62bL2eZvKYlo2C5..."
}
```
*   **Response (200 OK):**
```json
{
  "success": true,
  "charge_status": "authorized",
  "stripe_payment_intent": "pi_1H62bL2eZvKYlo2C5..."
}
```

### 5.2 Release Escrow Payout (Job Complete)
Called when the user confirms completion, releasing payment to the provider.
*   **Endpoint:** `POST /payments/:booking_id/release`
*   **Request Body:**
```json
{
  "client_signature_base64": "iVBORw0KGgoAAAANSUhEUgAAADIA..."
}
```
*   **Response (200 OK):**
```json
{
  "success": true,
  "transaction_id": "tx_821b17d0-1cfa-42f5-b286-63ad5ff50b8c",
  "released_amount": 78.00,
  "net_to_provider": 62.40,
  "platform_fee": 15.60,
  "status": "transferred"
}
```
