# HomeHero Backend Architecture Setup Document
**Author:** Principal Node.js Architect  
**Version:** 1.4.0  
**Design Paradigm:** Clean Architecture (Modular Layer Isolation)  
**Core Technologies:** Node.js, Express.js, MongoDB Atlas (Mongoose), JWT, Razorpay, Winston Logger

This document defines the complete backend architecture layout and codebase implementation for the **HomeHero** hyperlocal services platform.

---

## 1. Complete Folder Structure

```
backend/
├── src/
│   ├── config/
│   │   ├── db.js                     # MongoDB connection pool settings
│   │   └── logger.js                 # Winston logger configuration
│   ├── middleware/
│   │   ├── authMiddleware.js         # JWT validation & RBAC authorization
│   │   ├── errorMiddleware.js        # Centralized exception interceptor
│   │   ├── validationMiddleware.js   # Request body validation gate
│   │   └── securityHeaders.js        # Helmet, cors, and rate limit rules
│   ├── models/
│   │   ├── userModel.js              # Customer, technician, and admin auth records
│   │   ├── technicianModel.js        # Geospatial coordinates & vetting metadata
│   │   ├── serviceModel.js           # Catalog items and base pricing rules
│   │   ├── categoryModel.js          # Main service categories
│   │   ├── bookingModel.js           # Dispatch state-machine and checklists
│   │   └── paymentModel.js           # Razorpay escrow details
│   ├── controllers/
│   │   ├── authController.js         # Signup, login, and OTP verifications
│   │   ├── bookingController.js      # Upfront estimate and geospatial matchmaker
│   │   └── paymentController.js      # Razorpay order holds and wallet release
│   ├── routes/
│   │   ├── authRoutes.js             # Authentication paths
│   │   ├── bookingRoutes.js          # Booking & estimate paths
│   │   └── paymentRoutes.js          # Payment transaction paths
│   ├── services/
│   │   ├── mapsService.js            # GMaps API wrapper for routes & ETAs
│   │   └── pushNotification.js       # Firebase FCM Admin SDK messaging client
│   └── utils/
│       ├── otpUtil.js                # Secure OTP code generator
│       └── surgeUtil.js              # Surge pricing multiplier calculator
├── .env.example                      # Template for configuration keys
├── index.js                          # Express app bootstrap
└── package.json                      # Server dependencies specifications
```

---

## 2. Dependencies Specification (`package.json`)

```json
{
  "name": "homehero-backend",
  "version": "1.0.0",
  "description": "On-demand hyperlocal home services platform backend",
  "main": "index.js",
  "scripts": {
    "start": "node index.js",
    "dev": "nodemon index.js"
  },
  "dependencies": {
    "bcryptjs": "^2.4.3",
    "cors": "^2.8.5",
    "dotenv": "^16.4.5",
    "express": "^4.19.2",
    "express-mongo-sanitize": "^2.2.0",
    "express-rate-limit": "^7.2.0",
    "helmet": "^7.1.0",
    "jsonwebtoken": "^9.0.2",
    "mongoose": "^8.2.1",
    "morgan": "^1.10.0",
    "razorpay": "^2.9.2",
    "winston": "^3.12.0"
  },
  "devDependencies": {
    "nodemon": "^3.1.0"
  },
  "engines": {
    "node": ">=18.0.0"
  },
  "private": true
}
```

---

## 3. Environment Variables Configuration (`.env.example`)

```ini
# Execution Context
PORT=5000
NODE_ENV=production

# Database Connection (MongoDB Atlas)
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/homehero?retryWrites=true&w=majority

# Security Keys
JWT_SECRET=super_secure_jwt_sign_key_do_not_share_in_public
JWT_EXPIRES_IN=24h

# Razorpay Configuration
RAZORPAY_KEY_ID=rzp_live_xxxxxxxxxxxxxx
RAZORPAY_KEY_SECRET=xxxxxxxxxxxxxxxxxxxxxxxx

# Google Maps API Credentials
GOOGLE_MAPS_API_KEY=AIzaSyxxxxxxxxxxxxxxxxxxxx

# Firebase Services (FCM)
FIREBASE_PROJECT_ID=homehero-fcm
FIREBASE_CLIENT_EMAIL=firebase-adminsdk@homehero.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQC..."
```

---

## 4. Connection Layer & Loggers

### 4.1 Database Connection (`src/config/db.js`)
```javascript
const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      maxPoolSize: 100,             // Maintain up to 100 hot connections
      minPoolSize: 10,              // Keep minimum 10 connections alive
      socketTimeoutMS: 45000,       // Terminate inactive sockets after 45 seconds
      serverSelectionTimeoutMS: 5000 // Timeout fast if MongoDB Atlas is unreachable
    });

    console.log(`[Database] Connected to host: ${conn.connection.host}`);
  } catch (error) {
    console.error(`[Database] Connection failure: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
```

### 4.2 Logging Utility (`src/config/logger.js`)
```javascript
const winston = require('winston');

const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'development' ? 'debug' : 'info',
  format: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'homehero-backend' },
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      )
    })
  ]
});

module.exports = logger;
```

---

## 5. Security & Validation Middleware Layer

### 5.1 Security HTTP Headers & Rate Limits (`src/middleware/securityHeaders.js`)
```javascript
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const rateLimit = require('express-rate-limit');

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per window
  message: {
    success: false,
    message: 'Too many requests from this IP. Please try again later.'
  }
});

const applySecurity = (app) => {
  app.use(helmet());
  app.use(mongoSanitize());
  app.use('/api', apiLimiter);
};

module.exports = { applySecurity };
```

### 5.2 JWT Auth and Role-Based Access Control (`src/middleware/authMiddleware.js`)
```javascript
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');

const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'homehero_jwt_secret');

      req.user = await User.findById(decoded.id).select('-passwordHash');
      if (!req.user) {
        return res.status(401).json({ success: false, message: 'Authenticated user account not found' });
      }

      return next();
    } catch (error) {
      return res.status(401).json({ success: false, message: 'Invalid or expired access token' });
    }
  }

  if (!token) {
    return res.status(401).json({ success: false, message: 'Authorization token is missing' });
  }
};

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `User role '${req.user ? req.user.role : 'Guest'}' is not authorized to access this resource.`
      });
    }
    next();
  };
};

module.exports = { protect, authorize };
```

### 5.3 Request Validation Middleware (`src/middleware/validationMiddleware.js`)
```javascript
const validateBody = (requiredFields) => {
  return (req, res, next) => {
    const missingFields = [];
    requiredFields.forEach(field => {
      if (req.body[field] === undefined || req.body[field] === null) {
        missingFields.push(field);
      }
    });

    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        errorCode: 'VALIDATION_FAILED',
        message: `Missing required body fields: ${missingFields.join(', ')}`
      });
    }
    next();
  };
};

module.exports = { validateBody };
```

### 5.4 Global Exception Interceptor (`src/middleware/errorMiddleware.js`)
```javascript
const logger = require('../config/logger');

const errorHandler = (err, req, res, next) => {
  logger.error(err.message, { stack: err.stack });

  let statusCode = err.statusCode || 500;
  let message = err.message || 'An unexpected server error occurred.';

  // MongoDB Cast Error (Invalid ID)
  if (err.name === 'CastError') {
    statusCode = 400;
    message = `Resource not found with ID: ${err.value}`;
  }

  // MongoDB Duplicate Key Error
  if (err.code === 11000) {
    statusCode = 409;
    const field = Object.keys(err.keyValue)[0];
    message = `Duplicate entry: '${err.keyValue[field]}' already exists.`;
  }

  // Mongoose Validation Error
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = Object.values(err.errors).map(val => val.message).join(', ');
  }

  res.status(statusCode).json({
    success: false,
    message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
};

module.exports = errorHandler;
```

---

## 6. Mongoose Models Specification

### 6.1 User Schema (`src/models/userModel.js`)
```javascript
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email']
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    unique: true,
    trim: true,
    match: [/^\+?[1-9]\d{1,14}$/, 'Please provide a valid phone number']
  },
  passwordHash: {
    type: String,
    required: [true, 'Password hash is required']
  },
  role: {
    type: String,
    required: true,
    enum: ['customer', 'technician', 'admin'],
    default: 'customer'
  },
  firstName: {
    type: String,
    required: [true, 'First name is required']
  },
  lastName: {
    type: String,
    required: [true, 'Last name is required']
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  otpCode: String,
  otpExpiry: Date
}, {
  timestamps: true
});

module.exports = mongoose.model('User', userSchema);
```

### 6.2 Technician Schema (`src/models/technicianModel.js`)
```javascript
const mongoose = require('mongoose');

const technicianSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  skills: {
    type: [String],
    required: true
  },
  rating: {
    type: mongoose.Schema.Types.Decimal128,
    default: 4.8
  },
  verification: {
    status: {
      type: String,
      enum: ['unverified', 'pending', 'verified'],
      default: 'unverified'
    },
    licenseVerified: { type: Boolean, default: false },
    backgroundCheckStatus: {
      type: String,
      enum: ['pending', 'passed', 'failed'],
      default: 'pending'
    }
  },
  currentLocation: {
    type: { type: String, enum: ['Point'], required: true },
    coordinates: { type: [Number], required: true } // [longitude, latitude]
  },
  isOnline: { type: Boolean, default: false },
  serviceRadiusKm: { type: Number, default: 10 },
  wallet: {
    balance: { type: mongoose.Schema.Types.Decimal128, default: 0.00 },
    razorpayAccountId: String
  }
}, {
  timestamps: true
});

technicianSchema.index({ currentLocation: '2dsphere' });

module.exports = mongoose.model('Technician', technicianSchema);
```

---

## 7. Controllers

### 7.1 Booking & Dispatch matchmaking (`src/controllers/bookingController.js`)
```javascript
const Booking = require('../models/bookingModel');
const Technician = require('../models/technicianModel');
const Service = require('../models/serviceModel');
const surgeUtil = require('../utils/surgeUtil');

exports.createBooking = async (req, res, next) => {
  try {
    const { serviceId, scheduledTime, street, city, pincode, lat, lng, totalAmount } = req.body;

    const bookingCode = `BKG-${Math.floor(10000000 + Math.random() * 90000000)}`;

    const newBooking = new Booking({
      bookingCode,
      customerId: req.user._id,
      serviceId,
      scheduledTime,
      billing: {
        totalAmount,
        platformCommission: (totalAmount * 0.15).toFixed(2),
        netToHero: (totalAmount * 0.85).toFixed(2)
      },
      address: {
        street,
        city,
        pincode,
        geoPoint: {
          type: 'Point',
          coordinates: [lng, lat]
        }
      }
    });

    await newBooking.save();

    // Trigger matchmaking proximity search in the background
    dispatchProximityMatching(newBooking._id, [lng, lat]);

    res.status(201).json({
      success: true,
      message: 'Booking created. Searching for nearby available technicians.',
      booking: newBooking
    });
  } catch (error) {
    next(error);
  }
};

async function dispatchProximityMatching(bookingId, coordinates) {
  try {
    // Locate the nearest online technician within a 10km radius
    const technicians = await Technician.find({
      isOnline: true,
      currentLocation: {
        $near: {
          $geometry: { type: 'Point', coordinates },
          $maxDistance: 10000 // 10 kilometers
        }
      }
    });

    if (technicians.length > 0) {
      await Booking.findByIdAndUpdate(bookingId, {
        status: 'matched',
        technicianId: technicians[0]._id
      });
      console.log(`[Matching] Booking ${bookingId} matched to technician ${technicians[0]._id}`);
    }
  } catch (err) {
    console.error(`[Matching] Matchmaking process failed for booking ${bookingId}: ${err.message}`);
  }
}
```

### 7.2 Escrow Payments Controller (`src/controllers/paymentController.js`)
```javascript
const Booking = require('../models/bookingModel');
const Payment = require('../models/paymentModel');
const Technician = require('../models/technicianModel');
const razorpay = require('../config/razorpay');

exports.createOrder = async (req, res, next) => {
  try {
    const { bookingId } = req.body;
    const booking = await Booking.findById(bookingId);

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    const amountPaise = Math.round(parseFloat(booking.billing.totalAmount.toString()) * 100);

    // Create a Razorpay order but defer capture (hold escrow)
    const rpOrder = await razorpay.orders.create({
      amount: amountPaise,
      currency: 'INR',
      payment_capture: 0
    });

    const payment = new Payment({
      bookingId,
      razorpayOrderId: rpOrder.id,
      amount: booking.billing.totalAmount,
      escrowStatus: 'held_in_escrow'
    });

    await payment.save();

    res.status(200).json({
      success: true,
      orderId: rpOrder.id,
      amount: amountPaise,
      currency: 'INR',
      key: process.env.RAZORPAY_KEY_ID
    });
  } catch (error) {
    next(error);
  }
};
```

---

## 8. Server Bootstrap (`index.js`)

```javascript
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
require('dotenv').config();

const connectDB = require('./src/config/db');
const { applySecurity } = require('./src/middleware/securityHeaders');
const errorHandler = require('./src/middleware/errorMiddleware');
const logger = require('./src/config/logger');

const bookingRoutes = require('./src/routes/bookingRoutes');
const paymentRoutes = require('./src/routes/paymentRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB Atlas
connectDB();

// Setup Morgan to pipe to Winston log files
app.use(morgan('combined', { stream: { write: message => logger.info(message.trim()) } }));

app.use(cors());
app.use(express.json({ limit: '10kb' }));

// Apply Helmet & Injection Sanitizers
applySecurity(app);

// Mount API Routes
app.use('/api/v1/bookings', bookingRoutes);
app.use('/api/v1/payments', paymentRoutes);

// Catch-all route handler for unmatched endpoints (404)
app.use('*', (req, res, next) => {
  res.status(404).json({
    success: false,
    message: `API Route '${req.originalUrl}' not found.`
  });
});

// Global Error Handler Middleware
app.use(errorHandler);

app.listen(PORT, () => {
  logger.info(`[Server] Running in ${process.env.NODE_ENV || 'production'} mode on port ${PORT}`);
});
```
