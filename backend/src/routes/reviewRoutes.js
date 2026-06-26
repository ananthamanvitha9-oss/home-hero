const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');
const { protect } = require('../middleware/authMiddleware');

router.post('/', protect, reviewController.createReview);
router.get('/:technicianId', reviewController.getTechnicianReviews);
router.get('/technician/:id', reviewController.getTechnicianReviews);

module.exports = router;
