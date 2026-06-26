# HomeHero Enterprise Project Structure Design
**Author:** Principal MERN Stack Architect  
**Version:** 1.0.0  
**Design Standards:** Feature-Based Atomic React Client & Clean Architecture Core Server  

This document outlines the directory structure and orchestrations for the **HomeHero** hyperlocal services platform.

---

## 1. Root Folder Structure
The root workspace orchestrates CI/CD scripts, local dockerised environments, presentations, and developer workspace profiles:

```
homehero/                              # Project Root
├── .github/                           # CI/CD Workflows
│   └── workflows/
│       ├── frontend-ci.yml            # Frontend Linting & Build checks
│       └── backend-ci.yml             # Backend Linting & Test suites
├── assets/                            # Global shared static branding files
├── backend/                           # Node.js + Express.js API Workspace
├── docs/                              # Project Documentation Folder
├── frontend/                          # React + Vite Client Workspace
├── .dockerignore                      # Root level docker ignore patterns
├── .gitignore                         # System-wide git ignore patterns
├── docker-compose.yml                 # Local container environment orchestration
├── package.json                       # Root workspace runner configuration
└── README.md                          # Quickstart developer onboarding guide
```

---

## 2. Frontend Folder Structure
The React workspace follows a feature-modular atomic design layout:

```
frontend/
├── public/                           # Static assets served directly
├── src/
│   ├── assets/                       # Global visual resources (SVGs, logos)
│   ├── components/                   # Shared UI primitives (Design System)
│   │   ├── ui/                       # Atom elements (Button, Input, Badge)
│   │   ├── feedback/                 # User notification widgets (ErrorBoundary, Toast, Spinner)
│   │   ├── layout/                   # Page structural frames (Navbar, Footer, PageWrapper)
│   │   └── navigation/               # Routing guards (ProtectedRoute)
│   ├── context/                      # Core global state engines (Auth, Socket, Theme)
│   ├── hooks/                        # Shared custom hooks (useAuth, useSocket, useGeolocation)
│   ├── services/                     # External integration layer (api.js, socket.js)
│   ├── features/                     # Domain business logic capsules
│   │   ├── auth/                     # login forms, OTP verifications
│   │   ├── booking/                  # service grids, price calculation panels
│   │   ├── payment/                  # Razorpay payment triggers
│   │   └── review/                   # ratings and reviews modules
│   ├── pages/                        # Screen entrypoints bound to routes
│   │   ├── HomePage.jsx
│   │   ├── LoginPage.jsx
│   │   ├── TrackingPage.jsx
│   │   ├── ProviderDashboard.jsx
│   │   └── AdminDashboardPage.jsx
│   ├── utils/                        # Data formatters, validation utilities
│   ├── App.css                       # Layout CSS variables
│   ├── App.jsx                       # Routing mappings mapping
│   ├── index.css                     # Tailwind CSS entrypoint with design system HSL tokens
│   └── main.jsx                      # Client mount bootstrapping entrypoint
├── eslint.config.js                  # ESLint code styling configurations
├── postcss.config.js                 # PostCSS plugin mappings
├── tailwind.config.js                # Tailwind CSS custom theme mappings
├── vite.config.js                    # Vite dev server and build compiler setups
└── package.json                      # Client package configurations
```

---

## 3. Backend Folder Structure
The backend codebase implements Clean Architecture layers decoupling framework models, router entries, and service layers:

```
backend/
├── src/
│   ├── config/                       # Connections pool managers
│   │   ├── db.js                     # MongoDB connection pool setup
│   │   ├── logger.js                 # Winston logger initialization
│   │   ├── razorpay.js               # Razorpay API client setup
│   │   └── firebase.js               # Firebase Cloud Messaging SDK initialization
│   ├── core/                         # Enterprise business rules
│   │   ├── errors/                   # Centrally captured error classes (AppError.js)
│   │   └── constants/                # Enums, static codes, status maps
│   ├── middleware/                   # HTTP middleware pipelines
│   │   ├── authMiddleware.js         # JWT validation & role controls
│   │   ├── errorMiddleware.js        # Global Express exception capturer
│   │   ├── validationMiddleware.js   # Request schema validator gateway
│   │   └── securityMiddleware.js     # Helmet, CORS policy, rate limits
│   ├── models/                       # Mongoose Database schemas (12 Collections)
│   │   ├── userModel.js
│   │   ├── technicianModel.js
│   │   ├── serviceModel.js
│   │   ├── categoryModel.js
│   │   ├── bookingModel.js
│   │   ├── paymentModel.js
│   │   ├── reviewModel.js
│   │   └── notificationModel.js
│   ├── repositories/                 # MongoDB queries encapsulation
│   │   ├── baseRepository.js
│   │   ├── userRepository.js
│   │   └── bookingRepository.js
│   ├── services/                     # Core workflows coordinators
│   │   ├── authService.js
│   │   ├── bookingService.js
│   │   └── paymentService.js
│   ├── validation/                   # Input Joi validation rules
│   │   ├── authValidation.js
│   │   └── bookingValidation.js
│   ├── utils/                        # File handlers, otp utilities
│   ├── routes/                       # Controllers to endpoints binding
│   │   ├── authRoutes.js
│   │   ├── serviceRoutes.js
│   │   ├── technicianRoutes.js
│   │   ├── bookingRoutes.js
│   │   ├── paymentRoutes.js
│   │   └── adminRoutes.js
│   └── app.js                        # Express app and loader setup
├── Dockerfile                        # Multi-stage container file
├── pm2.config.js                     # PM2 cluster run configurations
├── index.js                          # Production server runner
└── package.json                      # Server package configurations
```

---

## 4. Documentation Structure
Project documentation is systematically segmented inside `docs/` to provide clear implementation blueprints:

```
docs/
├── api-docs/
│   ├── api-documentation.md          # OpenAPI / Swagger REST API specifications
│   └── enterprise-api-specification.md
├── architecture/
│   └── system-architecture.md        # Monolith to Microservices transition plan & diagrams
├── business-model/
│   └── business-model-canvas.md      # Market capture, customer segments, value prop
├── customer-research/
│   └── customer-interviews.md        # User survey insights
├── database/
│   ├── database-design.md            # ERDs, schema specs (12 Collections), indices
│   ├── mongodb-production-architecture.md
│   └── mongodb-validation-schemas.md # MongoDB production scaling, sizing & index maps
├── development/
│   ├── backend-architecture.md       # 20-point backend structural design
│   ├── frontend-architecture.md      # 13-point frontend structural design
│   ├── backend-setup-guide.md        # Running backend local environment guide
│   └── mvp-roadmap.md                # Phase 1, Phase 2, and Scale roadmaps
└── UI-UX/
    └── design-specifications.md      # Color tokens, glassmorphism templates, wireframes
```

---

## 5. Environment Configuration Files

### Frontend Environment (`frontend/.env.example`)
```ini
VITE_API_URL=http://localhost:5000/api
VITE_WS_URL=http://localhost:5000
VITE_GOOGLE_MAPS_API_KEY=AIzaSyxxxxxxxxxxxxxxxxx
```

### Backend Environment (`backend/.env.example`)
```ini
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://localhost:27017/homehero
JWT_SECRET=super_secret_jwt_sign_key_do_not_share
JWT_EXPIRES_IN=24h
RAZORPAY_KEY_ID=rzp_test_mockkeyid123
RAZORPAY_KEY_SECRET=mocksecretkey456
GOOGLE_MAPS_API_KEY=AIzaSyxxxxxxxxxxxxxxxxx
FIREBASE_SERVICE_ACCOUNT_JSON={"type": "service_account", ...}
```

---

## 6. Key Configuration Files

### A. Root Docker Orchestration (`docker-compose.yml`)
```yaml
version: '3.8'

services:
  database:
    image: mongo:latest
    container_name: homehero-db
    ports:
      - "27017:27017"
    volumes:
      - mongo-data:/data/db
    networks:
      - homehero-network

  backend:
    build: ./backend
    container_name: homehero-api
    ports:
      - "5000:5000"
    environment:
      - MONGO_URI=mongodb://database:27017/homehero
    depends_on:
      - database
    networks:
      - homehero-network

volumes:
  mongo-data:

networks:
  homehero-network:
    driver: bridge
```

### B. Frontend Compiler Config (`frontend/vite.config.js`)
```javascript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    open: true,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true
      }
    }
  },
  build: {
    outDir: 'dist',
    sourcemap: false
  }
});
```

### C. Backend Cluster Runner (`backend/pm2.config.js`)
```javascript
module.exports = {
  apps: [
    {
      name: 'homehero-backend',
      script: 'index.js',
      instances: 'max',
      exec_mode: 'cluster',
      env_production: {
        NODE_ENV: 'production'
      }
    }
  ]
};
```
