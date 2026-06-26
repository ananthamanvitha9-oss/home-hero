# HomeHero - Hyperlocal Home Services Platform (India)
**Tech Stack:** MongoDB Atlas, Express.js, React.js (Vite + Tailwind CSS), Node.js (MERN)  

Welcome to the **HomeHero** monorepo workspace. HomeHero is a hyperlocal on-demand home services platform designed to connect urban households (customers) in India with verified professionals (Heroes).

---

## 📂 Workspace Structure

The project follows an enterprise MERN stack layout managed via npm workspaces:

*   📂 **[backend/](file:///c:/Users/manvi/OneDrive/Desktop/homehero/backend)**: Express API backend server with MongoDB Atlas models, JWT authentication, geofencing controllers, and Razorpay split payment escrow.
*   📂 **[frontend/](file:///c:/Users/manvi/OneDrive/Desktop/homehero/frontend)**: Vite React client application styled with Tailwind CSS, utilizing React 19, SocketContext, and clean modular pages.
*   📂 **[docs/](file:///c:/Users/manvi/OneDrive/Desktop/homehero/docs)**: Startup-grade system specifications, PRDs, database specs, API documents, and user research.
    *   📋 **[docs/prd/homehero-prd.md](file:///c:/Users/manvi/OneDrive/Desktop/homehero/docs/prd/homehero-prd.md)**: Product Requirements Document.
    *   🔌 **[docs/api-docs/api-documentation.md](file:///c:/Users/manvi/OneDrive/Desktop/homehero/docs/api-docs/api-documentation.md)**: REST API Endpoint Specifications.
    *   🗄️ **[docs/database/database-design.md](file:///c:/Users/manvi/OneDrive/Desktop/homehero/docs/database/database-design.md)**: MongoDB design, schemas, and compound index plans.
    *   🎨 **[docs/ui-ux/ui-design.md](file:///c:/Users/manvi/OneDrive/Desktop/homehero/docs/ui-ux/ui-design.md)**: Typography, HSL colors, responsive grids, and senior-friendly wireframe systems.

---

## 🛠️ Installation & Environment Setup

### 1. Prerequisites
*   **Node.js:** `>= 18.0.0`
*   **npm:** `>= 9.0.0`
*   **MongoDB:** Running locally or a MongoDB Atlas connection URI string.

### 2. Configure Environment Variables
Copy `.env.example` at the root workspace to `.env` files in both root and workspace subdirectories:
```bash
cp .env.example .env
cp .env.example backend/.env
```
Fill in the credentials in the respective `.env` files (specifically `MONGO_URI`, `JWT_SECRET`, and `RAZORPAY_KEY_*`).

### 3. Install Workspace Dependencies
Installs all dependencies for the root package, backend, and frontend concurrently:
```bash
npm run install:all
```

---

## 🚀 Running the Project

All tasks are managed via concurrent scripts from the root directory:

### Start Development Server
Starts the Node API server (port 5000) and Vite React app (port 5174) concurrently:
```bash
npm run dev
```

### Seed Database
Seeds categories, services, and technician profile mock geolocations (mapped in Hyderabad, India):
```bash
npm run seed
```

### Code Quality Actions
Run ESLint check across all workspace subfolders:
```bash
npm run lint
```
Auto-format files using Prettier:
```bash
npm run format
```

---

## 🛡️ Core Value Pillars & Architecture Highlights
1.  **UPI Escrow Payments:** Razorpay integration holds payment funds in escrow and releases split payouts (85% net payload to Hero, 15% platform commissions) on successful job checklists.
2.  **Geofenced Matchmaker Loop:** Locates online technicians within a 3km geofence radius in under 45 seconds using MongoDB `$near` indexing.
3.  **Simple Mode Accessibility:** A persistent high-contrast toggle that doubles font sizes, expands touch target boxes, and enables audio voice-note bookings for senior citizens.
