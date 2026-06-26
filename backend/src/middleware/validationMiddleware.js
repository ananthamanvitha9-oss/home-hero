const { registerSchema, loginSchema, verifyOtpSchema } = require('../validation/authValidation');

exports.validateRegister = (req, res, next) => {
  // Normalize camelCase / snake_case properties
  let { firstName, lastName, first_name, last_name } = req.body;
  
  if (firstName && !first_name) req.body.first_name = firstName;
  if (lastName && !last_name) req.body.last_name = lastName;
  if (first_name && !firstName) req.body.firstName = first_name;
  if (last_name && !lastName) req.body.lastName = last_name;

  const { error } = registerSchema.validate(req.body, { abortEarly: false });
  if (error) {
    const errorMessages = error.details.map(detail => detail.message).join('. ');
    return res.status(400).json({
      success: false,
      message: `Validation failed: ${errorMessages}`
    });
  }

  // Map technician role to provider internally for schema compliance
  const roleLower = req.body.role.toLowerCase();
  if (roleLower === 'technician') {
    req.body.role = 'provider';
  } else {
    req.body.role = roleLower;
  }

  next();
};

exports.validateLogin = (req, res, next) => {
  const { error } = loginSchema.validate(req.body, { abortEarly: false });
  if (error) {
    const errorMessages = error.details.map(detail => detail.message).join('. ');
    return res.status(400).json({
      success: false,
      message: `Validation failed: ${errorMessages}`
    });
  }
  next();
};

exports.validateVerifyOtp = (req, res, next) => {
  const { error } = verifyOtpSchema.validate(req.body, { abortEarly: false });
  if (error) {
    const errorMessages = error.details.map(detail => detail.message).join('. ');
    return res.status(400).json({
      success: false,
      message: `Validation failed: ${errorMessages}`
    });
  }
  next();
};

exports.validateEstimate = (req, res, next) => {
  const { category } = req.body;
  if (!category) {
    return res.status(400).json({ success: false, message: 'Service category is required for pricing estimation.' });
  }
  next();
};

// New: Booking create validation
exports.validateBookingCreate = (req, res, next) => {
  const { error } = require('../validation/bookingValidator').createBookingSchema.validate(req.body, { abortEarly: false });
  if (error) {
    const msgs = error.details.map(d => d.message).join('. ');
    return res.status(400).json({ success: false, message: `Booking validation failed: ${msgs}` });
  }
  next();
};

// New: Booking update validation
exports.validateBookingUpdate = (req, res, next) => {
  const { error } = require('../validation/bookingValidator').updateBookingSchema.validate(req.body, { abortEarly: false });
  if (error) {
    const msgs = error.details.map(d => d.message).join('. ');
    return res.status(400).json({ success: false, message: `Booking update validation failed: ${msgs}` });
  }
  next();
};

// New: Technician response validation (accept/reject)
exports.validateTechnicianResponse = (req, res, next) => {
  const { error } = require('../validation/bookingValidator').technicianResponseSchema.validate(req.body, { abortEarly: false });
  if (error) {
    const msgs = error.details.map(d => d.message).join('. ');
    return res.status(400).json({ success: false, message: `Technician response validation failed: ${msgs}` });
  }
  next();
};

// New: Admin analytics query validation
exports.validateAnalyticsQuery = (req, res, next) => {
  const { error } = require('../validation/bookingValidator').analyticsQuerySchema.validate(req.query, { abortEarly: false });
  if (error) {
    const msgs = error.details.map(d => d.message).join('. ');
    return res.status(400).json({ success: false, message: `Analytics query validation failed: ${msgs}` });
  }
  next();
};
