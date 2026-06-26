const Joi = require('joi');

// Validation schema for creating a booking
exports.createBookingSchema = Joi.object({
  serviceId: Joi.string().hex().length(24).optional(),
  service_name: Joi.string().max(100).optional(),
  scheduledTime: Joi.date().iso().required(),
  address: Joi.object({
    street: Joi.string().required(),
    area: Joi.string().required(),
    city: Joi.string().required(),
    pincode: Joi.string().required()
  }).required(),
  coordinates: Joi.object({
    lat: Joi.number().required(),
    lng: Joi.number().required()
  }).optional(),
  totalAmount: Joi.number().positive().required(),
  notes: Joi.string().max(500).optional(),
  couponCode: Joi.string().optional(),
  discountAmount: Joi.number().min(0).optional()
});

// Validation schema for updating a booking (status, notes, schedule, checklist)
exports.updateBookingSchema = Joi.object({
  status: Joi.string().valid('in_progress', 'completed', 'cancelled', 'assigned', 'rejected', 'accepted').optional(),
  checklist: Joi.array().items(Joi.object({ task: Joi.string().required(), completed: Joi.boolean(), timestamp: Joi.date() })).optional(),
  notes: Joi.string().max(500).optional(),
  scheduledTime: Joi.date().iso().optional()
});

// Validation for technician response (accept or reject)
exports.technicianResponseSchema = Joi.object({
  response: Joi.string().valid('accept', 'reject').required(),
  note: Joi.string().max(300).optional()
});

// Admin analytics query parameters
exports.analyticsQuerySchema = Joi.object({
  from: Joi.date().iso().optional(),
  to: Joi.date().iso().optional(),
  status: Joi.string().optional()
});
