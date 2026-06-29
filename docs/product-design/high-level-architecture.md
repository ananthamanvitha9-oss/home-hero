# HomeHero - High-Level Architecture (HLA)

This document maps out the high-level system architecture, client-server communications, and deployment targets for the HomeHero platform.

---

## 1. High-Level Blueprint

```
┌──────────────────────────────────────────────────────────────┐
│                      CLIENT LAYER (Vercel)                   │
│          React Client Portal (Web Application / PWA)         │
└──────────────┬──────────────────────────────┬────────────────┘
               │ (HTTPS REST)                 │ (WebSockets)
               ▼                              ▼
┌──────────────────────────────────────────────────────────────┐
│                     SERVICE LAYER (Render)                   │
│         Express API Server  │  Socket.io Telemetry Node      │
└──────────────┬──────────────────────────────┬────────────────┘
               │ (Mongoose Driver)            │ (Third-Party APIs)
               ▼                              ▼
┌──────────────────────────────┐ ┌─────────────────────────────┐
│    DATABASE LAYER (Atlas)    │ │      INTEGRATIONS LAYER     │
│       MongoDB Database       │ │ Razorpay, Cloudinary, FCM   │
└──────────────────────────────┘ └─────────────────────────────┘
```

---

## 2. Component Design & Roles

### 2.1 Client Layer
- Built using **React, Vite, and Tailwind CSS**.
- Hosted on **Vercel** for fast edge delivery.
- Uses standard REST client wrappers (Axios) for secure JSON API communications and `socket.io-client` for live tracking.

### 2.2 Application Service Layer
- Built using **Node.js and Express.js**.
- Hosted on **Render** (using persistent instances to support active WebSocket connections).
- Express routers handle authentication, booking lifecycles, payments, and admin dashboard queries.
- Socket.io manages real-time communication rooms (e.g. `booking_${id}`) to sync technician locations and checklists.

### 2.3 Database & Integration Layers
- **MongoDB Atlas**: Managed multi-region database cluster storing users, technicians, bookings, payments, and ratings.
- **Razorpay**: Direct payment gateway API checking sign-offs and holding escrow funds.
- **Firebase Admin Cloud Messaging**: Dispatches push alerts to Android/iOS client apps.
- **Cloudinary**: Object storage bucket for profile pictures and post-repair proof photos.
