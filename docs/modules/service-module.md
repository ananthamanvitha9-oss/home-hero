# Service Module Documentation

## Overview
The **Service Module** provides all API endpoints related to service catalog management in the HomeHero platform. It handles fetching the full list of active services, retrieving individual service details, and filtering services by professional category (e.g., Electrician, Plumber, Carpenter, AC Repair).

## Endpoints
| Method | Path | Description | Auth | Role |
|--------|------|-------------|------|------|
| `GET` | `/services` | Returns all active services. | None (public) | — |
| `GET` | `/services/:id` | Returns details of a single service by its MongoDB `_id`. | None (public) | — |
| `GET` | `/services/category/:slug` | Returns all active services belonging to a specific category slug (e.g., `electrician`, `plumber`). | None (public) | — |

### 1️⃣ List Services (`GET /services`)
**Response Example (200 OK)**
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
```

### 2️⃣ Get Service Detail (`GET /services/:id`)
**Response Example (200 OK)**
```json
{
  "success": true,
  "service": {
    "id": "651f8a2e3f4e5a6b7c8d9e04",
    "name": "Plumber",
    "description": "Standard piping, valve leakage repairs, tap installations, and bathroom drainage resolution.",
    "pricingRules": {
      "basePrice": 500,
      "hourlyRate": 250
    }
  }
}
```

### 3️⃣ List Services by Category (`GET /services/category/:slug`)
**Path Parameter**: `slug` – category identifier (e.g., `electrician`, `plumber`, `carpenter`, `ac-repair`).

**Response Example (200 OK)**
```json
{
  "success": true,
  "services": [
    {
      "id": "651f8a2e3f4e5a6b7c8d9e07",
      "name": "Electrician",
      "pricingRules": { "basePrice": 400, "hourlyRate": 200 }
    },
    {
      "id": "651f8a2e3f4e5a6b7c8d9e08",
      "name": "Plumber",
      "pricingRules": { "basePrice": 500, "hourlyRate": 250 }
    }
  ]
}
```

## Implementation Details
- **Controller**: [`serviceController.js`](file:///c:/Users/manvi/OneDrive/Desktop/homehero/backend/src/controllers/serviceController.js)
  - `exports.getServices` – fetches all active services, optional `category` query filter.
  - `exports.getServiceById` – fetches a single service by ID.
  - `exports.getServicesByCategory` – resolves a category slug, then returns its services.
- **Routes**: [`serviceRoutes.js`](file:///c:/Users/manvi/OneDrive/Desktop/homehero/backend/src/routes/serviceRoutes.js)
  - Public routes for the three endpoints above.
- **Database Models**: `Service` and `Category` schemas live under `src/models/`.

## Notes & Future Enhancements
- The category‑filter endpoint (`/services/category/:slug`) was added to support the professional‑scope view required by the frontend.
- Consider adding pagination/query‑parameter support for large catalogs.
- Documentation should stay in sync with any future changes to controller logic or response shapes.

---
*Generated on 2026‑06‑17 at 21:38:18 (Asia/Kolkata).*
