const express = require('express');
const helmet = require('helmet');
const morgan = require('morgan');
const { applySecurity } = require('./src/middleware/securityMiddleware');

// Route imports
const authRoutes = require('./src/routes/authRoutes');
const serviceRoutes = require('./src/routes/serviceRoutes');
const technicianRoutes = require('./src/routes/technicianRoutes');
const bookingRoutes = require('./src/routes/bookingRoutes');
const reviewRoutes = require('./src/routes/reviewRoutes');
const notificationRoutes = require('./src/routes/notificationRoutes');
const paymentRoutes = require('./src/routes/paymentRoutes');
const adminRoutes = require('./src/routes/adminRoutes');

const app = express();

// Global Middlewares
app.use(helmet()); // Secure HTTP headers
applySecurity(app); // Apply CORS, Rate Limiters, and Sanitization
app.use(morgan('dev')); // Dev logging
app.use(express.json()); // Parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies

// Basic sanity route
app.get('/', (req, res) => {
  res.json({
    status: 'online',
    message: 'HomeHero Hyperlocal API is running.',
    timestamp: new Date()
  });
});

// Route Integrations (compliant with standard /api prefix)
app.use('/api/auth', authRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/technicians', technicianRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/admin', adminRoutes);

// Legacy route mapping for backward compatibility
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/bookings', bookingRoutes);
app.use('/api/v1/reviews', reviewRoutes);
app.use('/api/v1/notifications', notificationRoutes);
app.use('/api/v1/payments', paymentRoutes);
app.use('/api/v1/heroes', technicianRoutes);
app.use('/api/v1/admin', adminRoutes);

const errorMiddleware = require('./src/middleware/errorMiddleware');

// Global Error Handler
app.use(errorMiddleware);

module.exports = app;
