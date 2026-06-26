const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const cors = require('cors');

// Rate limiting middleware to prevent brute force / DDOS attacks
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes window
  max: 100, // Limit each IP to 100 requests per windowMs
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  message: {
    success: false,
    message: 'Too many requests from this IP. Please try again after 15 minutes.'
  }
});

// Auth endpoints rate limiter (more strict)
const authLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour window
  max: 15, // Limit each IP to 15 login/registration requests per hour
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many authentication attempts. Please try again after an hour.'
  }
});

const applySecurity = (app) => {
  // 1. Enable Cross-Origin Resource Sharing (CORS) with standard origins
  const allowedOrigins = [
    'http://localhost:5173',
    'http://localhost:5174',
    'http://localhost:3000',
    'https://homehero.in'
  ];

  app.use(cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin) || process.env.NODE_ENV !== 'production') {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Cookie']
  }));

  // 2. Prevent NoSQL Injection attacks by sanitizing request inputs
  app.use(mongoSanitize({
    replaceWith: '_'
  }));

  // 3. Apply global API rate limiting to all requests under /api
  app.use('/api', apiLimiter);

  // 4. Apply stricter rate limiting to auth routes to prevent brute forcing
  app.use('/api/auth/login', authLimiter);
  app.use('/api/auth/verify-otp', authLimiter);
};

module.exports = { applySecurity };
