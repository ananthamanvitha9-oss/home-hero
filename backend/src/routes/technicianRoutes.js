const express = require('express');
const router = express.Router();
const technicianController = require('../controllers/technicianController');
const { protect, authorize } = require('../middleware/authMiddleware');

// GET /api/technicians - Search nearby online technicians
router.get('/', protect, authorize('customer', 'admin'), technicianController.searchNearbyTechnicians);
router.post('/', protect, authorize('admin'), technicianController.createTechnician);
router.put('/:id', protect, authorize('admin'), technicianController.updateTechnician);
router.delete('/:id', protect, authorize('admin'), technicianController.deleteTechnician);

// GET /api/technicians/:id - Fetch profile details
router.get('/:id', protect, technicianController.getTechnicianProfileById);

// Compatibility paths for frontend portals
router.post('/status', protect, authorize('provider', 'technician'), technicianController.updateStatus);
router.get('/profile', protect, authorize('provider', 'technician'), technicianController.getProfile);
router.put('/profile', protect, authorize('provider', 'technician'), technicianController.updateProfile);

module.exports = router;
