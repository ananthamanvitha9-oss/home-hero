# HomeHero Frontend Architecture Design (Enterprise Edition)
**Author:** Principal React Architect & Senior Frontend Engineer  
**Version:** 2.0.0  
**Technology Stack:** React 19, Vite, Tailwind CSS, React Router v6, Axios, Context API, Socket.io Client

This document defines the complete, production-ready frontend architecture specification for the **HomeHero** hyperlocal services platform.

---

## 1. Folder Structure

To scale to dozens of developers and support high-quality modular builds, the frontend application follows a clean feature-based directory structure:

```
frontend/
├── public/                           # Static assets directory
│   └── favicon.ico
├── src/
│   ├── assets/                       # Global images, SVGs, and brand files
│   │   └── logo.svg
│   ├── components/                   # Global reusable design system primitives
│   │   ├── ui/                       # Atomic UI elements (Buttons, Inputs, Badges)
│   │   │   ├── Button.jsx
│   │   │   ├── Input.jsx
│   │   │   ├── Card.jsx
│   │   │   └── Spinner.jsx
│   │   ├── feedback/                 # Error Boundary, Toast, Skeleton loaders
│   │   │   ├── ErrorBoundary.jsx
│   │   │   ├── Toast.jsx
│   │   │   └── Skeleton.jsx
│   │   ├── layout/                   # Navbar, Footer, Sidebar, Page wrappers
│   │   │   ├── Navbar.jsx
│   │   │   └── Footer.jsx
│   │   └── navigation/               # Route guards
│   │       └── ProtectedRoute.jsx
│   ├── context/                      # Core global state providers
│   │   ├── AuthContext.jsx           # Identity, session, and portal roles
│   │   ├── SocketContext.jsx         # Singleton WebSocket socket client
│   │   └── ThemeContext.jsx          # User UI styling rules
│   ├── hooks/                        # Global custom React hooks
│   │   ├── useAuth.js
│   │   ├── useSocket.js
│   │   └── useGeolocation.js         # Fetch client coordinates telemetry
│   ├── services/                     # HTTP client and Socket configurations
│   │   ├── api.js                    # Axios client instance
│   │   └── socket.js                 # Socket events listener registry
│   ├── features/                     # Feature-specific pages and components
│   │   ├── auth/                     # Auth login forms and verify OTP views
│   │   │   ├── components/LoginForm.jsx
│   │   │   └── components/OtpVerify.jsx
│   │   ├── booking/                  # Service catalog, pricing, and matching
│   │   │   ├── components/ServiceCard.jsx
│   │   │   ├── components/PricingEstimate.jsx
│   │   │   └── components/RadarMap.jsx
│   │   ├── payment/                  # Razorpay checkout handler
│   │   │   └── components/CheckoutButton.jsx
│   │   └── review/                   # Feedback form
│   │       └── components/ReviewForm.jsx
│   ├── pages/                        # Main router page views
│   │   ├── HomePage.jsx              # Customer landing catalogue
│   │   ├── LoginPage.jsx             # Onboarding screen
│   │   ├── TrackingPage.jsx          # Real-time tracking and live messenger
│   │   ├── ProviderDashboard.jsx     # Technician portal
│   │   └── AdminDashboardPage.jsx    # Admin metrics and SVG graphs
│   ├── utils/                        # Core helper functions
│   │   ├── formatter.js              # Currency, dates, coordinates formatters
│   │   └── storage.js                # LocalStorage secure client wrapper
│   ├── App.css                       # Design system styles
│   ├── App.jsx                       # Routing mappings setup
│   ├── index.css                     # Tailwind bindings and HSL custom tokens
│   └── main.jsx                      # Mount bootstrap loader
├── eslint.config.js                  # Linter policies
├── tailwind.config.js                # Design system rules
├── vite.config.js                    # Build configurations
└── package.json                      # Modules lists
```

---

## 2. Page Structure

The system exposes five major page entry-points mapped to different user personas:

| Page | URL Path | Persona | Primary Responsibilities |
| :--- | :--- | :--- | :--- |
| **`LoginPage`** | `/login` | Public | Auth forms, OTP validations, role selection, JWT capture. |
| **`HomePage`** | `/` | Customer | Services catalog grid, address picker, geospatial estimates. |
| **`TrackingPage`** | `/tracking/:bookingId` | Customer | Real-time map matching, technician en-route telemetry, messenger. |
| **`ProviderDashboard`** | `/provider` | Technician | Online/Offline telemetry toggles, nearby dispatch requests, wallets. |
| **`AdminDashboardPage`**| `/admin` | Admin | System-wide performance metrics, user/booking audits, SVG charts. |

---

## 3. Component Structure

To avoid visual inconsistencies, components are designed using a strict hierarchy:

```
┌────────────────────────────────────────────────────────┐
│                      Layout/Navbar                     │
├────────────────────────────────────────────────────────┤
│                                                        │
│   ┌───────────────────┐        ┌───────────────────┐   │
│   │  Booking/RadarMap │        │ Booking/Estimate  │   │
│   │  (Geospatial map) │        │ (Pricing panel)   │   │
│   └───────────────────┘        └───────────────────┘   │
│                                                        │
│   ┌────────────────────────────────────────────────┐   │
│   │                 UI/Button Card                 │   │
│   │                 (Atom widgets)                 │   │
│   └────────────────────────────────────────────────┘   │
└────────────────────────────────────────────────────────┘
```

---

## 4. API Integration Layer (`src/services/api.js`)

Axios is used as our HTTP client. Request interceptors automatically inject the JWT token, while response interceptors handle centralized error parsing:

```javascript
import axios from 'axios';
import { secureStorage } from '../utils/storage';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request Interceptor: Attach JWT bearer token
api.interceptors.request.use(
  (config) => {
    const token = secureStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Standardize payload returns and capture 401s
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const customError = {
      message: error.response?.data?.message || 'A network error occurred. Please try again.',
      statusCode: error.response?.status || 500,
      errors: error.response?.data?.errors || []
    };

    // Auto-logout user on expired or invalid JWT sessions
    if (customError.statusCode === 401) {
      secureStorage.removeItem('token');
      window.location.href = '/login';
    }

    return Promise.reject(customError);
  }
);

export default api;
```

---

## 5. Authentication Flow

Authentication is managed via a state machine that handles login credentials, OTP codes, verification status, and redirection routes.

```
 [ Enter Credentials ] ──► (Verify OTP) ──► [ Generate JWT ] ──► [ Check Role & Route ]
```

### Auth Actions in API Client (`src/features/auth/authApi.js`)
```javascript
import api from '../../services/api';

export const authApi = {
  register: (userData) => api.post('/auth/register', userData),
  login: (credentials) => api.post('/auth/login', credentials),
  verifyOtp: (phone, otpCode) => api.post('/auth/verify-otp', { phone, otp_code: otpCode })
};
```

---

## 6. State Management Strategy (`src/context/AuthContext.jsx`)

Global shared states (such as user profiles, JWTs, and portal modes) are managed using the **Context API**. Non-global state stays local to the respective components to prevent unnecessary component renders.

```javascript
import { createContext, useState, useEffect, useCallback } from 'react';
import { secureStorage } from '../utils/storage';

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => secureStorage.getItem('token'));
  const [portalMode, setPortalMode] = useState('customer');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      secureStorage.setItem('token', token);
    } else {
      secureStorage.removeItem('token');
      setUser(null);
    }
    setLoading(false);
  }, [token]);

  const login = useCallback((userData, accessToken) => {
    setUser(userData);
    setToken(accessToken);
    setPortalMode(userData.role);
  }, []);

  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
    secureStorage.removeItem('token');
  }, []);

  return (
    <AuthContext.Provider value={{ user, token, portalMode, setPortalMode, login, logout, loading, setUser }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
```

---

## 7. Protected Routes (`src/components/navigation/ProtectedRoute.jsx`)

Route access is restricted using a Wrapper Component that checks active tokens and authorization roles.

```javascript
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import Spinner from '../ui/Spinner';

export function ProtectedRoute({ children, allowedRoles }) {
  const { user, token, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <Spinner size="lg" />
      </div>
    );
  }

  // Redirect unauthenticated requests to login page
  if (!token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Authorization checks
  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
}
```

---

## 8. Booking Flow

The booking flow handles service selection, pricing calculation, matchmaking, and real-time status updates:

```
Select Category ──► Calculate Price ──► Dispatch Matchmaking ──► Listen on Socket ──► Technician Assigned
```

### Real-Time Socket Connection Provider (`src/context/SocketContext.jsx`)
```javascript
import { createContext, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from '../hooks/useAuth';

export const SocketContext = createContext(null);

export function SocketProvider({ children }) {
  const { token } = useAuth();
  const socketRef = useRef(null);

  useEffect(() => {
    if (!token) {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
      return;
    }

    // Initialize real-time connection using WS
    socketRef.current = io(import.meta.env.VITE_WS_URL || 'http://localhost:5000', {
      auth: { token },
      transports: ['websocket']
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [token]);

  return (
    <SocketContext.Provider value={{ socket: socketRef.current }}>
      {children}
    </SocketContext.Provider>
  );
}
```

---

## 9. Payment Flow

HomeHero implements an Escrow Hold and Payout Release flow integrated with Razorpay:

```
Create Order Hold ──► Launch Checkout SDK ──► Capture Signature ──► Capture Complete ──► Verify callback
```

### Razorpay Handler Hook (`src/features/payment/useRazorpay.js`)
```javascript
import { useState } from 'react';
import api from '../../services/api';

export function useRazorpay() {
  const [paying, setPaying] = useState(false);

  const initPay = async (bookingId, onComplete, onError) => {
    setPaying(true);
    try {
      // 1. Create order hold record on server
      const { orderId, amount, currency, key } = await api.post('/payments/create-order', { bookingId });

      // 2. Configure checkout script parameters
      const options = {
        key,
        amount,
        currency,
        name: 'HomeHero platform',
        description: 'Hyperlocal Escrow Hold Payment',
        order_id: orderId,
        handler: async (response) => {
          try {
            // Verify payment signature
            const verifyRes = await api.post('/payments/verify', {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature
            });
            onComplete(verifyRes);
          } catch (err) {
            onError(err);
          } finally {
            setPaying(false);
          }
        },
        theme: { color: '#6366f1' }
      };

      const rzpInstance = new window.Razorpay(options);
      rzpInstance.open();
    } catch (error) {
      onError(error);
      setPaying(false);
    }
  };

  return { initPay, paying };
}
```

---

## 10. Error Handling Strategy

### Reusable Error Boundary Wrapper (`src/components/feedback/ErrorBoundary.jsx`)
```javascript
import React from 'react';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('[ErrorBoundary] Captured Exception:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-8 text-center bg-slate-900 text-white rounded-lg border border-slate-700">
          <h2 className="text-xl font-bold text-red-400">Something went wrong.</h2>
          <p className="mt-2 text-gray-400">Failed to render dashboard view. Please reload page.</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-4 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 rounded text-sm transition"
          >
            Reload Client
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
```

---

## 11. Loading States (`src/components/feedback/Skeleton.jsx`)

To ensure a smooth user experience, skeleton loaders are displayed while data is being fetched. This reduces perceived load times and improves visual transitions.

```javascript
export default function Skeleton({ className, count = 1 }) {
  return (
    <>
      {Array.from({ length: count }).map((_, idx) => (
        <div 
          key={idx} 
          className={`animate-pulse bg-slate-800 rounded-md ${className}`} 
        />
      ))}
    </>
  );
}
```

---

## 12. Reusable Components (`src/components/ui/Button.jsx`)

Our component library provides modular UI elements styled using Tailwind CSS classes.

```javascript
import PropTypes from 'prop-types';

export default function Button({ children, onClick, variant = 'primary', size = 'md', disabled = false, className = '' }) {
  const baseStyle = 'inline-flex items-center justify-center font-medium rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-offset-2';
  
  const variants = {
    primary: 'bg-indigo-600 hover:bg-indigo-700 text-white focus:ring-indigo-500',
    secondary: 'bg-slate-700 hover:bg-slate-600 text-white focus:ring-slate-500',
    danger: 'bg-red-600 hover:bg-red-700 text-white focus:ring-red-500'
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg'
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled || variant === 'disabled'}
      className={`${baseStyle} ${variants[variant]} ${sizes[size]} ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
    >
      {children}
    </button>
  );
}

Button.propTypes = {
  children: PropTypes.node.isRequired,
  onClick: PropTypes.func,
  variant: PropTypes.oneOf(['primary', 'secondary', 'danger', 'disabled']),
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
  disabled: PropTypes.bool,
  className: PropTypes.string
};
```

---

## 13. Mobile Responsive Design Strategy

Hyperlocal services platforms are primarily used on mobile devices. To accommodate this, our interface design is mobile-first, using Tailwind's responsive grid systems.

```
┌────────────────────────────────────────────────────────┐
│ Grid Containers: grid-cols-1 md:grid-cols-3            │
│ (One column on mobile screen, three columns on tablet) │
├────────────────────────────────────────────────────────┤
│ Padding & Margin Spacing: px-4 md:px-8                 │
│ (Compact mobile margins, comfortable desktop margins)  │
├────────────────────────────────────────────────────────┤
│ Interactive Targets: Touch target min-height of 44px   │
│ (Optimized for mobile finger taps)                    │
└────────────────────────────────────────────────────────┘
```
- **Interactive Targets**: Critical items (like checkboxes, slide overlays, and navigation tabs) are configured with a minimum touch height of 48px to prevent accidental taps.
- **Glassmorphism Panels**: Overlays use blur levels of `backdrop-filter: blur(12px)` and borders to maintain text contrast and visibility across all screen resolutions.
