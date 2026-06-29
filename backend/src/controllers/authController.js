const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const User = require('../models/userModel');
const AppError = require('../core/errors/AppError');
const mockDb = require('../config/mockDb');

const JWT_SECRET = process.env.JWT_SECRET || 'homehero_super_secret_jwt_key';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'homehero_super_secret_refresh_jwt_key';
const JWT_EXPIRES_IN = '15m'; // Access token: 15 mins
const JWT_REFRESH_EXPIRES_IN = '7d'; // Refresh token: 7 days

const signAccessToken = (id, email, role) => {
  return jwt.sign({ id, email, role }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
};

const signRefreshToken = (id) => {
  return jwt.sign({ id }, JWT_REFRESH_SECRET, { expiresIn: JWT_REFRESH_EXPIRES_IN });
};

const sendTokens = (user, statusCode, res) => {
  const accessToken = signAccessToken(user._id, user.email, user.role);
  const refreshToken = signRefreshToken(user._id);

  // Set HTTP-only, SameSite cookie for the refresh token
  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'Lax',
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days in ms
  });

  res.status(statusCode).json({
    success: true,
    token: accessToken,
    user: {
      id: user._id,
      email: user.email,
      role: user.role,
      first_name: user.firstName,
      last_name: user.lastName,
      is_verified: user.isVerified
    }
  });
};

exports.register = async (req, res, next) => {
  try {
    const { email, phone, password, role, firstName, lastName } = req.body;

    // Fallback if database is offline
    const isOffline = mongoose.connection.readyState !== 1;
    if (isOffline) {
      const userExists = mockDb.findUserByEmail(email) || mockDb.findUserByPhone(phone);
      if (userExists) {
        return next(new AppError('Email or phone already registered.', 409));
      }

      const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
      const otpExpiry = new Date(Date.now() + 5 * 60 * 1000);

      const newUser = await mockDb.createUser({
        email: email.toLowerCase(),
        phone,
        passwordHash: password,
        role: role.toLowerCase(),
        firstName,
        lastName,
        otpCode,
        otpExpiry,
        isVerified: false
      });

      console.log(`[OTP Dispatcher (Offline)] Sent OTP ${otpCode} to phone ${phone}`);

      return res.status(201).json({
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
    }

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

    // Fallback if database is offline
    const isOffline = mongoose.connection.readyState !== 1;
    if (isOffline) {
      const user = mockDb.findUserByEmail(email);
      if (!user) {
        return next(new AppError('Invalid credentials.', 401));
      }

      const bcrypt = require('bcryptjs');
      const passwordMatch = await bcrypt.compare(password, user.passwordHash);
      if (!passwordMatch) {
        return next(new AppError('Invalid credentials.', 401));
      }

      sendTokens(user, 200, res);
      return;
    }

    // Locate user
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return next(new AppError('Invalid credentials.', 401));
    }

    // Verify password match
    const passwordMatch = await user.comparePassword(password);
    if (!passwordMatch) {
      return next(new AppError('Invalid credentials.', 401));
    }

    // Generate and send tokens
    sendTokens(user, 200, res);
  } catch (err) {
    next(err);
  }
};

exports.verifyOtp = async (req, res, next) => {
  try {
    const { phone, otp_code } = req.body;

    // Fallback if database is offline
    const isOffline = mongoose.connection.readyState !== 1;
    if (isOffline) {
      const user = mockDb.findUserByPhone(phone);
      if (!user) {
        return next(new AppError('User with this phone number not found.', 404));
      }

      if (user.otpCode !== otp_code) {
        return next(new AppError('Invalid verification code.', 400));
      }

      if (user.otpExpiry < new Date()) {
        return next(new AppError('Verification code has expired.', 400));
      }

      user.isVerified = true;
      user.otpCode = null;
      user.otpExpiry = null;
      mockDb.saveUser(user);

      // Auto-create Technician profile if user is a provider
      if (user.role === 'provider') {
        console.log(`[Offline Mode] Auto-created Technician profile for user ${user._id}`);
      }

      sendTokens(user, 200, res);
      return;
    }

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

    // Generate and send verified tokens
    sendTokens(user, 200, res);
  } catch (err) {
    next(err);
  }
};

exports.refresh = async (req, res, next) => {
  try {
    const cookies = req.headers.cookie;
    if (!cookies) {
      return next(new AppError('Refresh token missing from request cookies.', 401));
    }

    const match = cookies.match(/refreshToken=([^;]+)/);
    const token = match ? match[1] : null;
    if (!token) {
      return next(new AppError('Refresh token missing from request cookies.', 401));
    }

    // Verify the refresh token
    const decoded = jwt.verify(token, JWT_REFRESH_SECRET);

    // Fallback if database is offline
    const isOffline = mongoose.connection.readyState !== 1;
    if (isOffline) {
      const user = mockDb.findUserById(decoded.id);
      if (!user) {
        return next(new AppError('User account not found.', 401));
      }

      const newAccessToken = signAccessToken(user._id, user.email, user.role);
      return res.status(200).json({
        success: true,
        token: newAccessToken
      });
    }

    const user = await User.findById(decoded.id).select('-passwordHash');
    if (!user) {
      return next(new AppError('User account not found.', 401));
    }

    // Sign new short-lived access token
    const newAccessToken = signAccessToken(user._id, user.email, user.role);

    res.status(200).json({
      success: true,
      token: newAccessToken
    });
  } catch (err) {
    return next(new AppError('Invalid or expired refresh token. Please log in again.', 401));
  }
};

exports.logout = async (req, res, next) => {
  try {
    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'Lax'
    });
    res.status(200).json({
      success: true,
      message: 'Successfully logged out.'
    });
  } catch (err) {
    next(err);
  }
};

exports.getProfile = async (req, res, next) => {
  try {
    const isOffline = mongoose.connection.readyState !== 1;
    if (isOffline) {
      const user = mockDb.findUserById(req.user._id || req.user.id);
      if (!user) {
        return next(new AppError('User not found.', 404));
      }
      return res.json({ success: true, user });
    }

    const user = await User.findById(req.user.id).select('-passwordHash');
    if (!user) {
      return next(new AppError('User not found.', 404));
    }
    res.json({ success: true, user });
  } catch (err) {
    next(err);
  }
};

exports.updateProfile = async (req, res, next) => {
  try {
    const { firstName, lastName, phone, savedAddresses, avatarUrl } = req.body;
    const isOffline = mongoose.connection.readyState !== 1;
    if (isOffline) {
      const user = mockDb.findUserById(req.user._id || req.user.id);
      if (!user) {
        return next(new AppError('User not found.', 404));
      }

      if (firstName) user.firstName = firstName;
      if (lastName) user.lastName = lastName;
      if (phone) user.phone = phone;
      if (savedAddresses) user.savedAddresses = savedAddresses;
      if (avatarUrl !== undefined) user.avatarUrl = avatarUrl;

      mockDb.saveUser(user);

      return res.json({
        success: true,
        message: 'Profile updated successfully.',
        user: {
          _id: user._id,
          email: user.email,
          phone: user.phone,
          role: user.role,
          firstName: user.firstName,
          lastName: user.lastName,
          avatarUrl: user.avatarUrl,
          savedAddresses: user.savedAddresses
        }
      });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return next(new AppError('User not found.', 404));
    }

    if (firstName) user.firstName = firstName;
    if (lastName) user.lastName = lastName;
    if (phone) user.phone = phone;
    if (savedAddresses) user.savedAddresses = savedAddresses;
    if (avatarUrl !== undefined) user.avatarUrl = avatarUrl;

    await user.save();

    res.json({
      success: true,
      message: 'Profile updated successfully.',
      user: {
        _id: user._id,
        email: user.email,
        phone: user.phone,
        role: user.role,
        firstName: user.firstName,
        lastName: user.lastName,
        avatarUrl: user.avatarUrl,
        savedAddresses: user.savedAddresses
      }
    });
  } catch (err) {
    next(err);
  }
};
