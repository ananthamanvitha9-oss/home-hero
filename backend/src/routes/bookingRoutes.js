const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');
const { protect } = require('../middleware/authMiddleware');
const { validateEstimate, validateBookingCreate, validateBookingUpdate, validateTechnicianResponse, validateAnalyticsQuery } = require('../middleware/validationMiddleware');

// ── Price Estimate (public or auth) ──────────────────────────────────────────
router.post('/estimate', validateEstimate, bookingController.calculatePrice);

// ── CRUD ─────────────────────────────────────────────────────────────────────
router.post('/', protect, validateBookingCreate, bookingController.createBooking);
router.get('/', protect, bookingController.getBookings);

router.get('/:id', protect, bookingController.getBooking);
router.put('/:id', protect, validateBookingUpdate, bookingController.updateBooking);
router.delete('/:id', protect, bookingController.deleteBooking);

// ── Dedicated cancel endpoint ─────────────────────────────────────────────────
router.post('/:id/cancel', protect, bookingController.cancelBooking);

// ── Status & messages ────────────────────────────────────────────────────────
router.get('/:id/status', protect, bookingController.getBookingStatus);
router.get('/:id/messages', protect, bookingController.getBookingMessages);

// Technician accept/reject response
router.post('/:id/technician-response', protect, validateTechnicianResponse, bookingController.technicianResponse);

// Admin analytics (admin only)
router.get('/admin/analytics', protect, validateAnalyticsQuery, bookingController.adminAnalytics);

module.exports = router;
