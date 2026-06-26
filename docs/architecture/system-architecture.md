# System Architecture Document: HomeHero

**Author:** Principal Software Architect, HomeHero Technologies Pvt. Ltd.  
**Version:** 1.0.0  
**Date:** June 26, 2026  

---

## 1. High-Level Architecture Overview
HomeHero employs a decoupled client-server architecture designed to handle real-time geospatial matches and secure payments at scale. The platform uses a React SPA frontend, a Node.js/Express backend API gateway, and MongoDB with geospatial indexing.

```mermaid
graph TD
    subgraph Frontend Client Applications
        A[Customer App]
        B[Technician App]
        C[Admin Console]
    end
    
    subgraph Load Balancing & Routing
        LB[Cloudflare WAF / NGINX Gateway]
    end
    
    subgraph Backend Services Layer
        API[Express.js REST APIs]
        WS[Socket.io Matching Server]
    end
    
    subgraph Datastores
        DB[(MongoDB Primary)]
        Cache[(Redis Coordinates Cache)]
    end
    
    subgraph Integrations
        PG[Razorpay Gateway]
        FCM[Firebase Push Notifications]
    end

    A & B & C --> LB
    LB --> API & WS
    API & WS --> DB & Cache
    API --> PG & FCM
```

---

## 2. Frontend Architecture
The frontend is constructed as a React Single Page Application (SPA) compiled via Vite, ensuring fast hot module replacement and small bundles.

*   **State Management:** Built on top of React Context APIs (`AuthContext` for credentials, `SocketContext` for active WebSocket lifecycles).
*   **Networking Layer:** Uses Axios with global interceptors to attach bearer JWT tokens to every outgoing request and auto-refresh expired sessions.
*   **Map Integrations:** Implements Google Maps JS APIs for client location geocoding, autocomplete search, and real-time technician route tracking.

---

## 3. Backend Architecture
The backend is a Node.js monolith structured for eventual microservices separation, leveraging Express.js for REST endpoints and Socket.io for WebSocket handshakes.

*   **REST Gateways:** Modular routers handling auth, user profiles, technicians matching parameters, booking cycles, and payment webhooks.
*   **Geospatial matching Loop:** An event-driven service that queries MongoDB using `$near` filters to find online technicians and broadcasts job offers via Socket.io rooms.
*   **Task Checklists Engine:** Verification logic that audits file uploads and saves completion photos to secure object storage.

---

## 4. Database Architecture
The primary database is MongoDB, chosen for its native support for GeoJSON geospatial operations.

### Data Models & Schemas:
1.  **User Model:** Holds authentication credentials (`email`, `phone`, `passwordHash`), role guards (`customer`, `provider`, `admin`), and saved addresses arrays.
2.  **Technician Model:** Maps to `userId`, contains skills arrays, wallet details (balance ledger), ratings averages, and telemetry points:
    ```javascript
    location: {
      type: { type: String, default: 'Point' },
      coordinates: { type: [Number], index: '2dsphere' } // [lng, lat]
    }
    ```
3.  **Booking Model:** Tracks job states (`searching`, `matched`, `en_route`, `active`, `completed`, `cancelled`), booking codes, task checklists, and billing objects.
4.  **Payment Model:** Secure transaction ledger mapping Razorpay Order IDs to payment verification statuses and escrow states (`held_in_escrow`, `released`, `refunded`).
5.  **Setting Model:** Simple key-value store managing dynamic pricing surge parameters system-wide.

---

## 5. Authentication Flow (OTP & JWT)

```mermaid
sequenceDiagram
    autonumber
    actor User as Client Application
    participant API as Express.js Auth Router
    participant DB as MongoDB User Collection

    User->>API: POST /api/auth/register (Credentials + Role)
    API->>DB: Save User (isVerified: false, passwordHash: bcrypt)
    API->>User: Respond with OTP Request
    User->>API: POST /api/auth/verify-otp (Phone + OTP Code)
    API->>DB: Set User isVerified = true
    API->>User: Return 24h JWT Access Token + HttpOnly Refresh Token
```

---

## 6. Geospatial Booking & Matching Flow

```mermaid
sequenceDiagram
    autonumber
    actor Customer as Customer Client
    actor Hero as Technician Client
    participant Server as Express Server (SocketHub)
    participant DB as MongoDB (2dsphere)

    Customer->>Server: POST /bookings (Category, Coordinates)
    Server->>DB: Search for nearest online technicians (skills matches)
    DB->>Server: Returns sorted list of 5 nearest Heroes
    loop 90-Second Match Window
        Server->>Hero: Emit "new_job_offer" (WebSocket)
        Note over Hero: 90 seconds to accept or pass
        alt Hero Accepts
            Hero->>Server: Emit "accept_offer"
            Server->>Customer: Emit "job_matched" (Tracking Page active)
        else Hero Declines or Timeout
            Server->>Server: Move to next nearest technician in queue
        end
    end
```

---

## 7. Payments & Escrow Payout Flow
HomeHero guarantees secure transactions using an upfront payment authorization model:

1.  **Authorization:** When a booking is created, the client pays the estimate via Razorpay.
2.  **Hold:** The webhook verifies the payment signature, updates the booking status to `matched`, and logs the funds as `held_in_escrow`.
3.  **Completion Verification:** Upon arrival and completion of the pre/post work checklists, the customer verifies the work.
4.  **Release:** The server releases the escrow hold: credits 85% of the total to the technician’s wallet balance, records 15% platform commission revenue, and issues the invoice.
5.  **Withdrawal:** The technician can trigger a payout to transfer their wallet balance to their bank account via UPI.

---

## 8. Security Design
*   **Transport Layer:** Strict HTTPS enforcement with TLS 1.3 across all client-server handshakes.
*   **API Security:** CORS policies restricting cross-origin requests to trusted client subdomains. Inputs are sanitized using express-validator to prevent SQL/NoSQL injections.
*   **Database Security:** MongoDB collection validation, IP-restricted clusters, and encrypted environment variables for credentials.

---

## 9. Deployment Architecture
*   **Containerization:** Multi-stage Dockerfiles compiling React into an NGINX container and packaging Express APIs for Node production runtimes.
*   **Cluster Scale:** Express services are orchestrated using PM2 cluster mode to utilize all available vCPU cores, running behind NGINX reverse proxies.
*   **CDN & Firewall:** Cloudflare acts as the DNS gateway, caching static client assets, handling SSL termination, and mitigating DDoS attacks.
