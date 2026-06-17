// In-Memory store for bookings
const bookings = [];

// Core pricing variables per category (simulates database lookup)
const pricingConfig = {
  cleaning: { base: 50.00, hourly: 25.00, roomMultiplier: 1.2, petSurcharge: 15.00 },
  handyman: { base: 60.00, hourly: 35.00, multiplierComplex: 1.5 },
  plumbing: { base: 70.00, hourly: 40.00 },
  electrical: { base: 80.00, hourly: 45.00 }
};

exports.calculatePrice = (req, res) => {
  const { category, details } = req.body;
  if (!category || !pricingConfig[category.toLowerCase()]) {
    return res.status(400).json({ success: false, message: 'Invalid or missing service category.' });
  }

  const rates = pricingConfig[category.toLowerCase()];
  let total = rates.base;

  if (category.toLowerCase() === 'cleaning' && details) {
    const bedrooms = details.bedrooms || 1;
    const hasPets = details.has_pets || false;
    total = rates.base + (bedrooms - 1) * rates.hourly * rates.roomMultiplier;
    if (hasPets) {
      total += rates.petSurcharge;
    }
  } else if (details && details.hours) {
    total = rates.base + (details.hours - 1) * rates.hourly;
  }

  res.json({
    success: true,
    category,
    pricing: {
      base_price: rates.base,
      hourly_rate: rates.hourly,
      calculated_total: Math.round(total * 100) / 100
    }
  });
};

exports.createBooking = (req, res) => {
  const { service_id, scheduled_time, address, coordinates, details, total_amount } = req.body;

  if (!service_id || !scheduled_time || !address || !coordinates || !total_amount) {
    return res.status(400).json({ success: false, message: 'Missing required booking details.' });
  }

  const newBooking = {
    id: 'bkg_' + Math.random().toString(36).substring(2, 10),
    customer_id: req.user ? req.user.id : 'anonymous_client',
    service_id,
    scheduled_time,
    address,
    coordinates,
    details,
    total_amount,
    platform_commission: Math.round(total_amount * 0.15 * 100) / 100, // 15% platform commission
    status: 'pending_match',
    created_at: new Date()
  };

  bookings.push(newBooking);

  res.status(201).json({
    success: true,
    message: 'Booking created successfully. Dispatching to nearby Heroes...',
    booking: newBooking
  });
};

exports.getBooking = (req, res) => {
  const { id } = req.params;
  const booking = bookings.find(b => b.id === id);
  if (!booking) {
    return res.status(404).json({ success: false, message: 'Booking not found.' });
  }
  res.json({ success: true, booking });
};
