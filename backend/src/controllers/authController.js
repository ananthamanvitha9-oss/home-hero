const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const AppError = require('../core/errors/AppError');

const JWT_SECRET = process.env.JWT_SECRET || 'homehero_super_secret_jwt_key';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';

// Helper to sign JWT token
const signToken = (id, email, role) => {
  return jwt.sign({ id, email, role }, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN
  });
};

exports.register = async (req, res, next) => {
  try {
    const { email, phone, password, role, firstName, lastName } = req.body;

    // Check if user already exists
    const userExists = await User.findOne({ $or: [{ email: email.toLowerCase() }, { phone }] });
    if (userExists) {
      return next(new AppError('Email or phone already registered.', 409));
    }

    // Generate standard 6-digit OTP
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiry = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes validity

    const newUser = new User({
      email,
      phone,
      passwordHash: password, // Will be hashed via User model pre-save hook
      role: role.toLowerCase(),
      firstName,
      lastName,
      otpCode,
      otpExpiry,
      isVerified: false
    });

    await newUser.save();

    console.log(`[OTP Dispatcher] Sent OTP ${otpCode} to phone ${phone}`);

    res.status(201).json({
      success: true,
      message: 'Registration successful. Verification OTP sent.',
      user: {
        id: newUser._id,
        email: newUser.email,
        phone: newUser.phone,
        role: newUser.role,
        is_verified: newUser.isVerified
      },
      debugOtp: otpCode 
    });
  } catch (err) {
    next(err);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Locate user
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return next(new AppError('Invalid credentials.', 401));
    }

    // Verify password match using the User instance method
    const passwordMatch = await user.comparePassword(password);
    if (!passwordMatch) {
      return next(new AppError('Invalid credentials.', 401));
    }

    // Generate JWT
    const token = signToken(user._id, user.email, user.role);

    res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        first_name: user.firstName,
        last_name: user.lastName,
        is_verified: user.isVerified
      }
    });
  } catch (err) {
    next(err);
  }
};

exports.verifyOtp = async (req, res, next) => {
  try {
    const { phone, otp_code } = req.body;

    // Find user
    const user = await User.findOne({ phone });
    if (!user) {
      return next(new AppError('User with this phone number not found.', 404));
    }

    // Verify OTP
    if (user.otpCode !== otp_code) {
      return next(new AppError('Invalid verification code.', 400));
    }

    if (user.otpExpiry < new Date()) {
      return next(new AppError('Verification code has expired.', 400));
    }

    // Mark verified
    user.isVerified = true;
    user.otpCode = null;
    user.otpExpiry = null;
    await user.save();

    // Auto-create Technician profile if user is a provider
    if (user.role === 'provider') {
      const Technician = require('../models/technicianModel');
      const techExists = await Technician.findOne({ userId: user._id });
      if (!techExists) {
        await Technician.create({
          userId: user._id,
          skills: ['plumbing', 'electrical'], // default skills
          currentLocation: {
            type: 'Point',
            coordinates: [78.382021, 17.426210] // default Hyderabad coords
          },
          isOnline: true, // Auto set to online for ease of demo matching
          verification: {
            status: 'verified',
            licenseVerified: true,
            backgroundCheckStatus: 'passed',
            verifiedAt: new Date()
          }
        });
      }
    }

    // Generate verified token
    const token = signToken(user._id, user.email, user.role);

    res.status(200).json({
      success: true,
      message: 'Phone number successfully verified.',
      token,
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        first_name: user.firstName,
        last_name: user.lastName,
        is_verified: user.isVerified
      }
    });
  } catch (err) {
    next(err);
  }
};

exports.logout = async (req, res, next) => {
  try {
    // Statelss JWT doesn't strictly need backend invalidation unless blacklisted.
    // We clear cookies if used and return success.
    res.cookie('token', '', { expires: new Date(0), httpOnly: true });
    res.status(200).json({
      success: true,
      message: 'Successfully logged out.'
    });
  } catch (err) {
    next(err);
  }
};
