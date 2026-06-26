const Joi = require('joi');

const registerSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'string.email': 'Please provide a valid email address.',
    'any.required': 'Email is required.'
  }),
  phone: Joi.string().min(10).max(15).required().messages({
    'string.min': 'Phone number must be at least 10 digits.',
    'any.required': 'Phone number is required.'
  }),
  password: Joi.string().min(8).required().messages({
    'string.min': 'Password must be at least 8 characters long.',
    'any.required': 'Password is required.'
  }),
  role: Joi.string().valid('customer', 'provider', 'technician', 'admin').required().messages({
    'any.only': 'Role must be one of: customer, provider, technician, admin.',
    'any.required': 'Role is required.'
  }),
  firstName: Joi.string().trim().required().messages({
    'any.required': 'First name is required.'
  }),
  lastName: Joi.string().trim().required().messages({
    'any.required': 'Last name is required.'
  }),
  // Support matching properties if camelCase/snake_case mapping issues occur
  first_name: Joi.string().trim(),
  last_name: Joi.string().trim()
});

const loginSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'string.email': 'Please provide a valid email address.',
    'any.required': 'Email is required.'
  }),
  password: Joi.string().required().messages({
    'any.required': 'Password is required.'
  })
});

const verifyOtpSchema = Joi.object({
  phone: Joi.string().required().messages({
    'any.required': 'Phone number is required.'
  }),
  otp_code: Joi.string().length(6).required().messages({
    'string.length': 'OTP must be exactly 6 characters.',
    'any.required': 'OTP is required.'
  })
});

module.exports = {
  registerSchema,
  loginSchema,
  verifyOtpSchema
};
