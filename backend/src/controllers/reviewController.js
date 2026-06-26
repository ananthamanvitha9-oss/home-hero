const Review = require('../models/reviewModel');
const Booking = require('../models/bookingModel');
const Technician = require('../models/technicianModel');

exports.createReview = async (req, res) => {
  try {
    const { booking_id, bookingId, rating, comment } = req.body;
    const finalBookingId = bookingId || booking_id;

    if (!finalBookingId || !rating) {
      return res.status(400).json({ success: false, message: 'Booking ID and rating are required.' });
    }

    const numericRating = parseInt(rating);
    if (numericRating < 1 || numericRating > 5) {
      return res.status(400).json({ success: false, message: 'Rating must be between 1 and 5 stars.' });
    }

    // Verify booking exists
    const booking = await Booking.findById(finalBookingId);
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found.' });
    }

    if (!booking.technicianId) {
      return res.status(400).json({ success: false, message: 'No technician was assigned to this booking.' });
    }

    // Check if review already exists for this booking
    const reviewExists = await Review.findOne({ bookingId: finalBookingId });
    if (reviewExists) {
      return res.status(409).json({ success: false, message: 'You have already reviewed this booking.' });
    }

    const newReview = new Review({
      bookingId: finalBookingId,
      reviewerId: req.user.id,
      revieweeId: booking.technicianId,
      rating: numericRating,
      comment: comment || ''
    });

    await newReview.save();

    // Recalculate average rating for the technician
    const allReviews = await Review.find({ revieweeId: booking.technicianId });
    const averageRating = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;

    await Technician.findOneAndUpdate(
      { userId: booking.technicianId },
      { rating: Math.round(averageRating * 10) / 10 },
      { upsert: true }
    );

    res.status(201).json({
      success: true,
      message: 'Review submitted successfully.',
      review: newReview
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getTechnicianReviews = async (req, res) => {
  try {
    const id = req.params.technicianId || req.params.id;
    
    // Find reviews where revieweeId equals technician's userId
    const reviewsList = await Review.find({ revieweeId: id })
      .populate('reviewerId', 'firstName lastName')
      .sort({ createdAt: -1 });

    const avgRating = reviewsList.length > 0
      ? reviewsList.reduce((sum, r) => sum + r.rating, 0) / reviewsList.length
      : 4.8; // Default

    res.json({
      success: true,
      technicianId: id,
      technician_id: id,
      average_rating: Math.round(avgRating * 100) / 100,
      averageRating: Math.round(avgRating * 100) / 100,
      total_reviews: reviewsList.length,
      reviews: reviewsList
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
