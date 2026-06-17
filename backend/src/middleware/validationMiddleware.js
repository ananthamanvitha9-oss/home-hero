exports.validateRegister = (req, res, next) => {
  const { email, phone, password, role, first_name, last_name } = req.body;

  if (!email || !phone || !password || !role || !first_name || !last_name) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed. Missing required fields: email, phone, password, role, first_name, last_name.'
    });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ success: false, message: 'Invalid email address format.' });
  }

  if (phone.length < 10) {
    return res.status(400).json({ success: false, message: 'Invalid phone number length. Must be at least 10 digits.' });
  }

  if (password.length < 8) {
    return res.status(400).json({ success: false, message: 'Password must be at least 8 characters long.' });
  }

  if (!['customer', 'provider', 'admin'].includes(role.toLowerCase())) {
    return res.status(400).json({ success: false, message: 'Invalid user role. Must be customer, provider, or admin.' });
  }

  next();
};

exports.validateLogin = (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ success: false, message: 'Email and password are required.' });
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
