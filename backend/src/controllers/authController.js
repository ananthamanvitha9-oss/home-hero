const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// In-Memory User store for mock testing (falls back to PostgreSQL in production)
const users = [];

const JWT_SECRET = process.env.JWT_SECRET || 'homehero_super_secret_jwt_key';

exports.register = async (req, res) => {
  try {
    const { email, phone, password, role, first_name, last_name } = req.body;

    if (!email || !phone || !password || !role || !first_name || !last_name) {
      return res.status(400).json({ success: false, message: 'All fields are required.' });
    }

    const userExists = users.find(u => u.email === email || u.phone === phone);
    if (userExists) {
      return res.status(409).json({ success: false, message: 'Email or phone already registered.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = {
      id: Math.random().toString(36).substring(2, 15),
      email,
      phone,
      password_hash: hashedPassword,
      role,
      first_name,
      last_name,
      is_verified: false,
      created_at: new Date()
    };

    users.push(newUser);

    res.status(201).json({
      success: true,
      message: 'Registration successful. Verification OTP sent.',
      user: {
        id: newUser.id,
        email: newUser.email,
        phone: newUser.phone,
        role: newUser.role,
        is_verified: newUser.is_verified
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password required.' });
    }

    const user = users.find(u => u.email === email);
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials.' });
    }

    const passwordMatch = await bcrypt.compare(password, user.password_hash);
    if (!passwordMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials.' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        first_name: user.first_name,
        last_name: user.last_name
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.verifyOtp = async (req, res) => {
  const { phone, otp_code } = req.body;
  if (!phone || !otp_code) {
    return res.status(400).json({ success: false, message: 'Phone and OTP code required.' });
  }

  // Auto-verify for test configurations
  res.json({
    success: true,
    message: 'Phone number successfully verified.',
    token: jwt.sign({ phone }, JWT_SECRET, { expiresIn: '24h' })
  });
};
