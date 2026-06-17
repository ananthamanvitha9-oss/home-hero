const reviews = [];

exports.createReview = (req, res) => {
  const { booking_id, rating, comment } = req.body;

  if (!booking_id || !rating) {
    return res.status(400).json({ success: false, message: 'Booking ID and rating are required.' });
  }

  if (rating < 1 || rating > 5) {
    return res.status(400).json({ success: false, message: 'Rating must be between 1 and 5 stars.' });
  }

  const newReview = {
    id: 'rev_' + Math.random().toString(36).substring(2, 10),
    booking_id,
    reviewer_id: req.user ? req.user.id : 'anonymous_client',
    reviewee_id: 'hero_902c17d0-1cfa-42f5', // mock match
    rating,
    comment: comment || '',
    created_at: new Date()
  };

  reviews.push(newReview);

  res.status(201).json({
    success: true,
    message: 'Review submitted successfully.',
    review: newReview
  });
};

exports.getTechnicianReviews = (req, res) => {
  const { id } = req.params;
  const techReviews = reviews.filter(r => r.reviewee_id === id);

  const avgRating = techReviews.length > 0 
    ? techReviews.reduce((sum, r) => sum + r.rating, 0) / techReviews.length 
    : 4.85; // fallback baseline rating for testing

  res.json({
    success: true,
    technician_id: id,
    average_rating: Math.round(avgRating * 100) / 100,
    total_reviews: techReviews.length,
    reviews: techReviews
  });
};
