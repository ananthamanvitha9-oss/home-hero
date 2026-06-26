# HomeHero Backend Architecture Design (Enterprise Edition)
**Author:** Principal Software Architect & Senior Node.js Engineer  
**Version:** 2.0.0  
**Target Scalability:** 10,000,000+ Users | 500,000+ Daily Transactions  
**Design Paradigm:** Clean Architecture (DDD & Repository Pattern)

This document provides the complete, production-ready backend architecture specification for **HomeHero**, a hyperlocal on-demand home services platform.

---

## 1. Complete Folder Structure

To scale to millions of users and maintain high code maintainability, the codebase is structured according to Clean Architecture principles. It divides concerns into distinct layers: Domain (Entities), Infrastructure (Database, HTTP clients), Interface (Routes, Controllers), and Application (Services, Repositories).

```
backend/
├── src/
│   ├── config/                       # System-wide configuration files
│   │   ├── db.js                     # MongoDB connection pool setup
│   │   ├── logger.js                 # Winston logger initialization
│   │   ├── razorpay.js               # Razorpay API client setup
│   │   └── firebase.js               # Firebase Admin SDK setup
│   ├── core/                         # Enterprise business logic layer
│   │   ├── errors/                   # Custom error handler classes
│   │   │   └── AppError.js
│   │   └── constants/                # Enums, statuses, error codes
│   │       └── bookingStatus.js
│   ├── middleware/                   # Express HTTP pipeline interceptors
│   │   ├── authMiddleware.js         # JWT authorization & RBAC checks
│   │   ├── errorMiddleware.js        # Global error interceptor
│   │   ├── validationMiddleware.js   # Joi payload validation checker
│   │   └── securityMiddleware.js     # Rate limiters & header sanitizers
│   ├── models/                       # Mongoose Database schema files
│   │   ├── userModel.js
│   │   ├── technicianModel.js
│   │   ├── serviceModel.js
│   │   ├── categoryModel.js
│   │   ├── bookingModel.js
│   │   ├── paymentModel.js
│   │   ├── reviewModel.js
│   │   └── notificationModel.js
│   ├── repositories/                 # Database access abstraction layer
│   │   ├── baseRepository.js
│   │   ├── userRepository.js
│   │   ├── bookingRepository.js
│   │   └── technicianRepository.js
│   ├── services/                     # Business logic coordinators
│   │   ├── authService.js
│   │   ├── bookingService.js
│   │   ├── paymentService.js
│   │   └── notificationService.js
│   ├── validation/                   # Request body validation schemas
│   │   ├── authValidation.js
│   │   ├── bookingValidation.js
│   │   └── reviewValidation.js
│   ├── utils/                        # Shared utility modules
│   │   ├── uploadHelper.js           # Multer file upload setup
│   │   └── mapHelper.js              # Google Maps API utility
│   ├── routes/                       # Express routing controllers binding
│   │   ├── authRoutes.js
│   │   ├── serviceRoutes.js
│   │   ├── technicianRoutes.js
│   │   ├── bookingRoutes.js
│   │   ├── paymentRoutes.js
│   │   ├── reviewRoutes.js
│   │   └── adminRoutes.js
│   └── app.js                        # Express application loader
├── .env.example                      # Configuration template keys
├── Dockerfile                        # Multi-stage production container setup
├── pm2.config.js                     # PM2 cluster configuration
├── index.js                          # Process supervisor bootstrap entry
└── package.json                      # Server package specification
```

---

## 2. package.json Dependencies

```json
{
  "name": "homehero-backend",
  "version": "2.0.0",
  "description": "On-demand hyperlocal home services platform backend",
  "main": "index.js",
  "scripts": {
    "start": "node index.js",
    "dev": "nodemon index.js",
    "lint": "eslint . --ext .js",
    "test": "jest --runInBand --detectOpenHandles"
  },
  "dependencies": {
    "bcryptjs": "^2.4.3",
    "cors": "^2.8.5",
    "dotenv": "^16.4.5",
    "express": "^4.19.2",
    "express-mongo-sanitize": "^2.2.0",
    "express-rate-limit": "^7.2.0",
    "firebase-admin": "^12.0.0",
    "helmet": "^7.1.0",
    "joi": "^17.12.1",
    "jsonwebtoken": "^9.0.2",
    "mongoose": "^8.2.1",
    "morgan": "^1.10.0",
    "multer": "^1.4.5-lts.1",
    "razorpay": "^2.9.2",
    "socket.io": "^4.8.1",
    "winston": "^3.12.0",
    "winston-daily-rotate-file": "^5.0.0"
  },
  "devDependencies": {
    "jest": "^29.7.0",
    "nodemon": "^3.1.0",
    "supertest": "^6.3.4"
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
# Core Configuration
PORT=5000
NODE_ENV=production

# Database Connection
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/homehero?retryWrites=true&w=majority

# JWT Configurations
JWT_SECRET=super_secret_jwt_sign_key_do_not_share_in_public_production
JWT_EXPIRES_IN=24h

# Third-party Integrations
RAZORPAY_KEY_ID=rzp_live_xxxxxxxxxxxxxx
RAZORPAY_KEY_SECRET=xxxxxxxxxxxxxxxxxxxxxxxx
GOOGLE_MAPS_API_KEY=AIzaSyxxxxxxxxxxxxxxxxxxxx
FIREBASE_SERVICE_ACCOUNT_JSON={"type": "service_account", "project_id": "homehero-fcm", ...}

# Storage Configurations
UPLOAD_DIR=uploads/
MAX_FILE_SIZE=5242880 # 5MB in bytes
```

---

## 4. MongoDB Connection Layer (`src/config/db.js`)

Our MongoDB connection layer manages a robust Mongoose pool optimized for high throughput.

```javascript
const mongoose = require('mongoose');
const logger = require('./logger');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      maxPoolSize: 100,             // Connect up to 100 concurrent sockets
      minPoolSize: 10,              // Keep 10 hot connections ready in reserve
      socketTimeoutMS: 45000,       // Terminate inactive connection sockets after 45s
      serverSelectionTimeoutMS: 5000 // Timeout fast if Atlas database is unreachable
    });
    logger.info(`[Database] Connected successfully to host: ${conn.connection.host}`);
  } catch (error) {
    logger.error(`[Database] Connection failure: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
```

---

## 5. Express Application Setup (`src/app.js`)

```javascript
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const { applySecurity } = require('./middleware/securityMiddleware');
const errorHandler = require('./middleware/errorMiddleware');
const logger = require('./config/logger');

// Routes Import
const authRoutes = require('./routes/authRoutes');
const serviceRoutes = require('./routes/serviceRoutes');
const technicianRoutes = require('./routes/technicianRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const adminRoutes = require('./routes/adminRoutes');

const app = express();

// Log HTTP requests through winston
app.use(morgan('combined', { stream: { write: message => logger.info(message.trim()) } }));

// Parser
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// Setup Security Rules (cors, helmet, rate limits)
applySecurity(app);

// Mount API routes
app.use('/api/auth', authRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/technicians', technicianRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/admin', adminRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'UP', timestamp: new Date() });
});

// Fallback 404 Route
app.all('*', (req, res, next) => {
  res.status(404).json({ success: false, message: `Route '${req.originalUrl}' not found.` });
});

// Central Error Interceptor
app.use(errorHandler);

module.exports = app;
```

---

## 6. Route Structure (`src/routes/bookingRoutes.js` Example)

Routes are kept minimal, passing request mapping to controllers while validating schemas and roles.

```javascript
const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');
const { protect, authorize } = require('../middleware/authMiddleware');
const { validateSchema } = require('../middleware/validationMiddleware');
const { createBookingSchema, updateBookingSchema } = require('../validation/bookingValidation');

router.post(
  '/',
  protect,
  authorize('customer'),
  validateSchema(createBookingSchema),
  bookingController.createBooking
);

router.get('/:id', protect, bookingController.getBooking);
router.put('/:id', protect, validateSchema(updateBookingSchema), bookingController.updateBooking);
router.delete('/:id', protect, authorize('customer', 'admin'), bookingController.deleteBooking);

module.exports = router;
```

---

## 7. Controller Structure (`src/controllers/bookingController.js` Example)

Controllers extract request inputs, pass them down to services, and format responses.

```javascript
const bookingService = require('../services/bookingService');

exports.createBooking = async (req, res, next) => {
  try {
    const bookingData = { ...req.body, customerId: req.user.id };
    const booking = await bookingService.create(bookingData);
    
    res.status(201).json({
      success: true,
      message: 'Booking created and matchmaking initialized.',
      booking
    });
  } catch (error) {
    next(error);
  }
};

exports.getBooking = async (req, res, next) => {
  try {
    const booking = await bookingService.getById(req.params.id, req.user);
    res.status(200).json({ success: true, booking });
  } catch (error) {
    next(error);
  }
};
```

---

## 8. Service Layer Architecture (`src/services/bookingService.js` Example)

Services coordinate the application workflow, checking business rules and orchestrating side effects.

```javascript
const bookingRepository = require('../repositories/bookingRepository');
const technicianRepository = require('../repositories/technicianRepository');
const notificationService = require('./notificationService');
const AppError = require('../core/errors/AppError');

exports.create = async (bookingData) => {
  // 1. Resolve nearest online technician
  const nearbyTech = await technicianRepository.findNearestOnline(
    bookingData.lng,
    bookingData.lat,
    15000 // 15km matching threshold
  );

  const finalBookingData = {
    ...bookingData,
    technicianId: nearbyTech ? nearbyTech.userId : null,
    status: nearbyTech ? 'matched' : 'searching',
    bookingCode: 'BKG-' + Math.floor(10000000 + Math.random() * 90000000)
  };

  const booking = await bookingRepository.create(finalBookingData);

  // 2. Fire Async notification alerts
  if (nearbyTech) {
    await notificationService.sendPush(
      nearbyTech.userId,
      'New Job Assigned!',
      `You have been assigned to job ${finalBookingData.bookingCode}`
    );
  }

  return booking;
};
```

---

## 9. Repository Pattern (`src/repositories/baseRepository.js` & `bookingRepository.js`)

Repositories isolate database querying details. This keeps the application testable and database-agnostic.

### Base Repository (`src/repositories/baseRepository.js`)
```javascript
class BaseRepository {
  constructor(model) {
    this.model = model;
  }

  async findById(id) {
    return this.model.findById(id);
  }

  async create(data) {
    return this.model.create(data);
  }

  async update(id, data) {
    return this.model.findByIdAndUpdate(id, data, { new: true, runValidators: true });
  }

  async delete(id) {
    return this.model.findByIdAndDelete(id);
  }
}

module.exports = BaseRepository;
```

### Booking Repository (`src/repositories/bookingRepository.js`)
```javascript
const BaseRepository = require('./baseRepository');
const Booking = require('../models/bookingModel');

class BookingRepository extends BaseRepository {
  constructor() {
    super(Booking);
  }

  async findActiveByCustomer(customerId) {
    return Booking.find({ customerId, status: { $ne: 'completed' } }).populate('technicianId');
  }
}

module.exports = new BookingRepository();
```

---

## 10. Middleware Architecture

Middlewares process HTTP requests before they hit the controller. This establishes filters for authorization, logs, security, and payload checks.

```
Incoming Request
  │
  ├──► Security Middleware (Cors, Helmet, Rate Limiter)
  │
  ├──► Auth Middleware (JWT Token Validation)
  │
  ├──► RBAC Middleware (Role Checks)
  │
  ├──► Validation Middleware (Joi check schemas)
  │
  ▼
Controller Execute
  │
  └──► Error Interceptor (Centrally formatted response output)
```

---

## 11. Validation Layer (`src/validation/bookingValidation.js` Example)

Input validation runs on Joi schemas, preventing dirty payloads from hitting the database layers.

```javascript
const Joi = require('joi');

exports.createBookingSchema = Joi.object({
  serviceId: Joi.string().required().regex(/^[0-9a-fA-F]{24}$/),
  scheduledTime: Joi.date().iso().required(),
  street: Joi.string().required().min(3),
  city: Joi.string().required(),
  pincode: Joi.string().required().length(6),
  lat: Joi.number().required().min(-90).max(90),
  lng: Joi.number().required().min(-180).max(180),
  totalAmount: Joi.number().positive().required()
});

exports.updateBookingSchema = Joi.object({
  status: Joi.string().valid('en_route', 'active', 'completed', 'cancelled'),
  checklist: Joi.array().items(
    Joi.object({
      task: Joi.string().required(),
      completed: Joi.boolean().required()
    })
  )
});
```

---

## 12. Authentication & Authorization Flow

### JWT Token Verification (`src/middleware/authMiddleware.js`)
```javascript
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const AppError = require('../core/errors/AppError');

exports.protect = async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next(new AppError('Authentication required. Missing token.', 401));
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-passwordHash');
    
    if (!user) {
      return next(new AppError('Token payload invalid. User account deleted.', 401));
    }

    req.user = user;
    next();
  } catch (error) {
    return next(new AppError('Invalid or expired authentication credentials.', 401));
  }
};

exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(new AppError(`Forbidden. Role '${req.user.role}' lacks permissions.`, 403));
    }
    next();
  };
};
```

---

## 13. Error Handling Strategy

### Global Custom AppError (`src/core/errors/AppError.js`)
```javascript
class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = AppError;
```

### Global Express Interceptor (`src/middleware/errorMiddleware.js`)
```javascript
const logger = require('../config/logger');

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  // Log detailed error stack traces
  logger.error(`${err.message} - Stack: ${err.stack}`);

  if (process.env.NODE_ENV === 'development') {
    res.status(err.statusCode).json({
      status: err.status,
      error: err,
      message: err.message,
      stack: err.stack
    });
  } else {
    // Production Mode: Do not leak database internals
    res.status(err.statusCode).json({
      success: false,
      message: err.isOperational ? err.message : 'An unexpected server error occurred.'
    });
  }
};
```

---

## 14. Logging Strategy (`src/config/logger.js`)

Winston is configured to write JSON logs locally with log rotation, and format them nicely on the console.

```javascript
const winston = require('winston');
require('winston-daily-rotate-file');

const formatConfig = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.json()
);

const transports = [
  new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.simple()
    )
  })
];

// Production rotates log files daily to save disk capacity
if (process.env.NODE_ENV === 'production') {
  transports.push(
    new winston.transports.DailyRotateFile({
      filename: 'logs/error-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      level: 'error',
      maxFiles: '30d' // Keep logs for 30 days
    }),
    new winston.transports.DailyRotateFile({
      filename: 'logs/combined-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      maxFiles: '14d'
    })
  );
}

const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'development' ? 'debug' : 'info',
  format: formatConfig,
  defaultMeta: { service: 'homehero-backend' },
  transports
});

module.exports = logger;
```

---

## 15. Security Best Practices (`src/middleware/securityMiddleware.js`)

To guard against injection, Cross-Site Scripting (XSS), Parameter Pollution, and brute force requests, security controls are applied via Helmet, CORS, Sanitizers, and Rate Limiters.

```javascript
const helmet = require('helmet');
const cors = require('cors');
const mongoSanitize = require('express-mongo-sanitize');
const rateLimit = require('express-rate-limit');

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15-minute window
  max: 100,                 // Max 100 requests per IP per window
  message: {
    success: false,
    message: 'Too many requests from this client. Please try again after 15 minutes.'
  }
});

const applySecurity = (app) => {
  // Apply Helmet secure HTTP headers
  app.use(helmet());

  // CORS Setup
  app.use(cors({
    origin: process.env.NODE_ENV === 'production' ? 'https://homehero.com' : '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
  }));

  // Sanitize MongoDB payloads against injection query keys
  app.use(mongoSanitize());

  // Bind limiter to API routes
  app.use('/api', apiLimiter);
};

module.exports = { applySecurity };
```

---

## 16. File Upload Architecture (`src/utils/uploadHelper.js`)

Our Multer configuration enforces restrictions on file size and limits types to images (JPEG, PNG). This protects local storage directories against malicious file executions.

```javascript
const multer = require('multer');
const path = require('path');
const AppError = require('../core/errors/AppError');

// Storage layout setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, process.env.UPLOAD_DIR || 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// Enforce image checks
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png/;
  const mimetype = allowedTypes.test(file.mimetype);
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());

  if (mimetype && extname) {
    return cb(null, true);
  }
  cb(new AppError('Only images (JPEG, JPG, PNG) are permitted.', 400), false);
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: parseInt(process.env.MAX_FILE_SIZE) || 5242880 } // Default: 5MB limit
});

module.exports = upload;
```

---

## 17. Notification Architecture (`src/services/notificationService.js`)

Notifications are dispatched to Firebase Cloud Messaging (FCM) using the Firebase Admin SDK. Every dispatch is backed up in the MongoDB notifications collection.

```javascript
const admin = require('firebase-admin');
const Notification = require('../models/notificationModel');
const logger = require('../config/logger');

let fcmInitialized = false;

if (process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
  try {
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON);
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
    fcmInitialized = true;
    logger.info('[FCM] Firebase cloud messaging successfully initialized.');
  } catch (err) {
    logger.error('[FCM] Initialization failure:', err);
  }
}

exports.sendPush = async (recipientId, title, body) => {
  try {
    // 1. Back up notification inside DB
    const notif = await Notification.create({
      recipientId,
      title,
      body,
      isRead: false
    });

    // 2. Dispatch FCM Push alert
    if (fcmInitialized) {
      const message = {
        notification: { title, body },
        topic: `user_${recipientId}`
      };
      await admin.messaging().send(message);
      logger.info(`[FCM] Push dispatched successfully to topic: user_${recipientId}`);
    } else {
      logger.info(`[FCM Mock] Push alert logged for user_${recipientId}`);
    }

    return notif;
  } catch (error) {
    logger.error(`[Notification Service] Failed to send push: ${error.message}`);
    throw error;
  }
};
```

---

## 18. Booking Architecture

The booking process operates as a finite state machine, handling state transitions while running geospatial queries to locate online technicians.

```
 [ searching ] ──► (Technician Found?)
       │                    │
       │ (No)               │ (Yes)
       ▼                    ▼
 [ searching ] ◄──── [ matched ]
                            │
                            ▼
                       [ en_route ]
                            │
                            ▼
                        [ active ]
                            │
                            ▼
                       [ completed ] (Escrow released)
```

### Geospatial Technician Matching (`src/repositories/technicianRepository.js` Example)
```javascript
const Technician = require('../models/technicianModel');

class TechnicianRepository {
  async findNearestOnline(longitude, latitude, maxDistanceMeters) {
    return Technician.findOne({
      isOnline: true,
      currentLocation: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [parseFloat(longitude), parseFloat(latitude)]
          },
          $maxDistance: maxDistanceMeters
        }
      }
    });
  }
}

module.exports = new TechnicianRepository();
```

---

## 19. Payment Architecture (`src/services/paymentService.js` Example)

Payments are integrated with Razorpay via an escrow model:
1. **Hold**: Payment is captured upfront via Razorpay Orders and logged as `held_in_escrow`.
2. **Release**: Funds are split (15% platform commission, 85% net payload payouts to technician) upon successful job completion.

```javascript
const Razorpay = require('razorpay');
const Payment = require('../models/paymentModel');
const Booking = require('../models/bookingModel');
const Technician = require('../models/technicianModel');
const AppError = require('../core/errors/AppError');

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || 'rzp_mock',
  key_secret: process.env.RAZORPAY_KEY_SECRET || 'rzp_secret'
});

exports.createOrder = async (bookingId) => {
  const booking = await Booking.findById(bookingId);
  if (!booking) throw new AppError('Booking not found.', 404);

  const amountInPaise = Math.round(booking.billing.totalAmount * 100);

  const options = {
    amount: amountInPaise,
    currency: 'INR',
    receipt: `rcpt_${booking.bookingCode}`,
    payment_capture: 1
  };

  const order = await razorpay.orders.create(options);

  await Payment.create({
    bookingId: booking._id,
    razorpayOrderId: order.id,
    amount: booking.billing.totalAmount,
    escrowStatus: 'held_in_escrow'
  });

  return order;
};

exports.releaseEscrow = async (bookingId) => {
  const booking = await Booking.findById(bookingId);
  if (booking.status !== 'completed') {
    throw new AppError('Cannot release escrow for incomplete jobs.', 400);
  }

  const payment = await Payment.findOne({ bookingId: booking._id });
  if (!payment || payment.escrowStatus !== 'held_in_escrow') {
    throw new AppError('No matching active escrow transaction found.', 404);
  }

  payment.escrowStatus = 'released';
  await payment.save();

  // Update Technician Wallet balance
  await Technician.findOneAndUpdate(
    { userId: booking.technicianId },
    { $inc: { 'wallet.balance': booking.billing.netToHero } }
  );

  return payment;
};
```

---

## 20. Deployment Preparation

### Docker Multi-Stage Build (`Dockerfile`)
```dockerfile
# Stage 1: Build Dependencies
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

# Stage 2: Final Production Image
FROM node:18-alpine
WORKDIR /app
COPY --from=builder /app/node_modules ./node_modules
COPY . .
ENV NODE_ENV=production
EXPOSE 5000
CMD ["node", "index.js"]
```

### PM2 Cluster Config (`pm2.config.js`)
```javascript
module.exports = {
  apps: [
    {
      name: 'homehero-backend',
      script: 'index.js',
      instances: 'max', // Scale to match all CPU cores
      exec_mode: 'cluster',
      env_production: {
        NODE_ENV: 'production'
      }
    }
  ]
};
```
