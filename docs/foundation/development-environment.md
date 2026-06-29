# HomeHero - Core Development Environment Specification

**Prepared by**: Senior Software Architect  
**Target Audience**: Engineering Teams, Devops Architects, & New Onboarders  
**Focus**: Monorepo setups, environmental configs, and coding guidelines

---

## 1. System Requirements

Ensure the local developer machine satisfies these baseline specifications:
- **Node.js**: `v18.x` (LTS) or higher.
- **npm**: `v9.x` or higher.
- **Database**: MongoDB Atlas account (free tier cluster) or local MongoDB Community Server `v6.0+`.
- **System OS**: Windows 11, macOS (Ventura+), or Linux (Ubuntu 22.04+).

---

## 2. Monorepo Installation & Bootstrapping Guide

To configure the workspace and launch backend and frontend servers locally, execute:

```bash
# 1. Clone the repository
git clone https://github.com/ananthamanvitha9-oss/home-hero.git
cd home-hero

# 2. Install workspace dependencies
npm install

# 3. Initialize env files
cp .env.example backend/.env
cp .env.example frontend/.env

# 4. Bootstrap database schemas (seeds initial categories)
cd backend
npm run db:setup
cd ..

# 5. Launch both servers concurrently in development mode
npm run dev
```

---

## 3. Environment Variables Reference

### 3.1 Backend Environment Configurations (`backend/.env`)
```ini
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb+srv://admin:pass@cluster-homehero.mongodb.net/homehero_dev
JWT_SECRET=super_secret_jwt_key_of_64_characters
JWT_REFRESH_SECRET=super_secret_refresh_jwt_key_of_64_characters
RAZORPAY_KEY_ID=rzp_test_mockkeyid123
RAZORPAY_KEY_SECRET=mocksecretkey456
GOOGLE_MAPS_API_KEY=AIzaSyMockMapsKeyForLocalDevelopment
```

### 3.2 Frontend Environment Configurations (`frontend/.env`)
```ini
VITE_API_URL=http://localhost:5000/api
VITE_WS_URL=http://localhost:5000
VITE_GOOGLE_MAPS_API_KEY=AIzaSyMockMapsKeyForLocalDevelopment
```

---

## 4. Coding & Clean Code Standards

To keep the codebase uniform:
*   **Variable Naming**: Standardize on `camelCase` for JavaScript variables and functions, and `PascalCase` for React components.
*   **Database naming**: Use `snake_case` or `camelCase` uniformly within schemas. Always define relationships explicitly using Mongoose Ref properties.
*   **Commit Format**: Prefix all commits using Conventional Commits tags (e.g. `feat(auth): ...`).

---

## 5. Security & Verification Best Practices

- **Zero Hardcoded Secrets**: Secrets must never be committed to git. Always use environment variable references.
- **Query Sanitations**: Enforce `express-mongo-sanitize` on all Express payloads to protect against NoSQL Injection.
- **Strict CORS Rules**: Restrict origins to localhost in development, and to designated domains in production.

---

## 6. Local Troubleshooting Guide

### 6.1 Mongoose Buffering Timeout
*   *Symptom*: API requests to search services or verify login hang indefinitely.
*   *Cause*: MongoDB server is offline, and Mongoose is buffering queries until a connection is established.
*   *Solution*: Start your local MongoDB service, or verify your Atlas cluster's IP Access List allows `0.0.0.0/0` (anywhere).

### 6.2 Port 5000 / 5173 Collision
*   *Symptom*: Server crashes during bootstrap with `EADDRINUSE: port already in use`.
*   *Solution*: Kill the conflicting process or change the port value in your `.env` configuration file:
    ```bash
    # Kill process on port 5000 (Windows)
    Stop-Process -Id (Get-NetTCPConnection -LocalPort 5000).OwningProcess -Force
    ```
