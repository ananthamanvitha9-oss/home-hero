const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Secure all admin routes with authentication and role-based validation
router.use(protect);
router.use(authorize('admin'));

router.get('/stats', adminController.getStats);
router.get('/dashboard', adminController.getDashboard);
router.get('/users', adminController.getUsers);
router.get('/heroes/pending', adminController.getPendingHeroes);
router.put('/heroes/:id/verify', adminController.verifyHero);
router.get('/bookings', adminController.getBookings);
router.get('/pricing/multipliers', adminController.getPricingMultipliers);
router.put('/pricing/multipliers', adminController.updatePricingMultipliers);

module.exports = router;
