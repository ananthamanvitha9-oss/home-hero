const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const { protect } = require('../middleware/authMiddleware');

router.post('/create-order', protect, paymentController.createOrder);
router.post('/verify', paymentController.verifyPayment);
router.post('/release/:bookingId', protect, paymentController.releaseEscrow);

module.exports = router;
