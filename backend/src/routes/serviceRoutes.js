const express = require('express');
const router = express.Router();
const serviceController = require('../controllers/serviceController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Public catalog routes
router.get('/', serviceController.getServices);
router.get('/category/:slug', serviceController.getServicesByCategory);
router.get('/:id', serviceController.getServiceById);

// Admin service management routes
router.post('/', protect, authorize('admin'), serviceController.createService);
router.put('/:id', protect, authorize('admin'), serviceController.updateService);
router.delete('/:id', protect, authorize('admin'), serviceController.deleteService);

module.exports = router;
