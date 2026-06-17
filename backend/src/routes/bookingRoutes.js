const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');
const authMiddleware = require('../middleware/authMiddleware');
const { validateEstimate } = require('../middleware/validationMiddleware');

router.post('/estimate', validateEstimate, bookingController.calculatePrice);
router.post('/', authMiddleware, bookingController.createBooking);
router.get('/:id', authMiddleware, bookingController.getBooking);

module.exports = router;
