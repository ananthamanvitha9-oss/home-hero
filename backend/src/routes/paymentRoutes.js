const express = require('express');
const router  = express.Router();
const paymentController = require('../controllers/paymentController');
const { protect } = require('../middleware/authMiddleware');

// Order creation & verification
router.post('/create-order',          protect, paymentController.createOrder);
router.post('/verify',                         paymentController.verifyPayment);

// Escrow release
router.post('/release/:bookingId',    protect, paymentController.releaseEscrow);

// Invoice
router.get('/invoice/:paymentId',     protect, paymentController.getInvoice);

// Payment history (paginated)
router.get('/history',                protect, paymentController.getPaymentHistory);

// Refund
router.post('/refund/:paymentId',     protect, paymentController.initiateRefund);

module.exports = router;
