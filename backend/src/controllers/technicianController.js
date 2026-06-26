const Technician = require('../models/technicianModel');
const User = require('../models/userModel');
const AppError = require('../core/errors/AppError');

// GET /api/technicians - Search nearby online technicians
exports.searchNearbyTechnicians = async (req, res, next) => {
  try {
    const { lat, lng, skill } = req.query;

    if (!lat || !lng) {
      return next(new AppError('Latitude and Longitude coordinates are required.', 400));
    }

    const query = { isOnline: true };
    if (skill) {
      // Case-insensitive regex match for skills array
      query.skills = { $in: [new RegExp(`^${skill}$`, 'i')] };
    }

    // Longitude first, Latitude second in GeoJSON Point [lng, lat]
    const results = await Technician.find({
      ...query,
      currentLocation: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [parseFloat(lng), parseFloat(lat)]
          },
          $maxDistance: 15000 // 15 km search radius
        }
      }
    }).populate('userId', 'firstName lastName avatarUrl email phone');

    const mapped = results.map(t => ({
      id: t._id,
      name: t.userId ? `${t.userId.firstName} ${t.userId.lastName}` : 'System Hero',
      avatarUrl: t.userId?.avatarUrl || '',
      rating: t.rating || 4.8,
      skills: t.skills,
      experienceYears: t.experienceYears,
      isOnline: t.isOnline,
      distanceMeter: 450.5 // Simulated proximity drove time
    }));

    res.status(200).json({
      success: true,
      results: mapped
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/technicians/:id - Get technician profile details
exports.getTechnicianProfileById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const technician = await Technician.findById(id).populate('userId', 'firstName lastName email phone avatarUrl');
    if (!technician) {
      return next(new AppError('Technician profile not found.', 404));
    }

    res.status(200).json({
      success: true,
      technician: {
        id: technician._id,
        name: technician.userId ? `${technician.userId.firstName} ${technician.userId.lastName}` : 'System Hero',
        email: technician.userId?.email || '',
        phone: technician.userId?.phone || '',
        avatarUrl: technician.userId?.avatarUrl || '',
        skills: technician.skills,
        rating: technician.rating || 4.8,
        experienceYears: technician.experienceYears,
        bio: technician.bio,
        availability: technician.availability,
        isOnline: technician.isOnline
      }
    });
  } catch (err) {
    next(err);
  }
};

// POST /api/technicians/status - Update online status and/or location
exports.updateStatus = async (req, res, next) => {
  try {
    const { isOnline, coordinates } = req.body;
    
    let technician = await Technician.findOne({ userId: req.user.id });
    
    if (!technician) {
      technician = new Technician({
        userId: req.user.id,
        skills: ['Plumber', 'AC Repair'],
        currentLocation: {
          type: 'Point',
          coordinates: [78.382021, 17.426210] // default Hyderabad coords
        }
      });
    }

    if (typeof isOnline !== 'undefined') {
      technician.isOnline = isOnline;
    }

    if (coordinates && typeof coordinates.lng !== 'undefined' && typeof coordinates.lat !== 'undefined') {
      technician.currentLocation = {
        type: 'Point',
        coordinates: [parseFloat(coordinates.lng), parseFloat(coordinates.lat)]
      };
    }

    await technician.save();

    res.status(200).json({
      success: true,
      message: 'Technician status and telemetry updated successfully.',
      technician: {
        id: technician._id,
        isOnline: technician.isOnline,
        currentLocation: technician.currentLocation,
        skills: technician.skills,
        rating: technician.rating
      }
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/technicians/profile - Retrieve current logged-in technician profile
exports.getProfile = async (req, res, next) => {
  try {
    let technician = await Technician.findOne({ userId: req.user.id }).populate('userId', 'firstName lastName email phone avatarUrl');
    
    if (!technician) {
      if (req.user.role === 'provider' || req.user.role === 'technician') {
        technician = await Technician.create({
          userId: req.user.id,
          skills: ['Plumber'],
          currentLocation: {
            type: 'Point',
            coordinates: [78.382021, 17.426210]
          }
        });
        technician = await Technician.findOne({ userId: req.user.id }).populate('userId', 'firstName lastName email phone avatarUrl');
      } else {
        return next(new AppError('Technician profile not found.', 404));
      }
    }

    res.status(200).json({
      success: true,
      technician
    });
  } catch (err) {
    next(err);
  }
};

// PUT /api/technicians/profile - Update technician profile details (experience, bio, skills, availability)
exports.updateProfile = async (req, res, next) => {
  try {
    const { skills, experienceYears, bio, availability } = req.body;
    
    let technician = await Technician.findOne({ userId: req.user.id });
    if (!technician) {
      return next(new AppError('Technician profile not found.', 404));
    }

    if (skills) technician.skills = skills;
    if (experienceYears !== undefined) technician.experienceYears = experienceYears;
    if (bio !== undefined) technician.bio = bio;
    if (availability) {
      if (availability.days) technician.availability.days = availability.days;
      if (availability.startTime) technician.availability.startTime = availability.startTime;
      if (availability.endTime) technician.availability.endTime = availability.endTime;
    }

    await technician.save();

    const populated = await Technician.findById(technician._id).populate('userId', 'firstName lastName email phone avatarUrl');

    res.status(200).json({
      success: true,
      message: 'Technician profile updated successfully.',
      technician: populated
    });
  } catch (err) {
    next(err);
  }
};

// ADMIN CRUD OPERATIONS

// POST /api/technicians - Create a new technician (admin only)
exports.createTechnician = async (req, res, next) => {
  try {
    const { userId, skills, rating, serviceRadiusKm, isOnline, wallet } = req.body;
    if (!userId) {
      return next(new AppError('userId is required.', 400));
    }
    const existing = await Technician.findOne({ userId });
    if (existing) {
      return next(new AppError('Technician for this user already exists.', 409));
    }
    const technician = new Technician({
      userId,
      skills: skills || [],
      rating: rating || 4.8,
      serviceRadiusKm: serviceRadiusKm || 15,
      isOnline: isOnline || false,
      wallet: wallet || { balance: 0, stripeAccountId: '' }
    });
    await technician.save();
    res.status(201).json({ success: true, technician });
  } catch (err) {
    next(err);
  }
};

// PUT /api/technicians/:id - Update technician (admin only)
exports.updateTechnician = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const technician = await Technician.findById(id);
    if (!technician) {
      return next(new AppError('Technician not found.', 404));
    }
    Object.assign(technician, updates);
    await technician.save();
    res.status(200).json({ success: true, technician });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/technicians/:id - Delete technician (admin only)
exports.deleteTechnician = async (req, res, next) => {
  try {
    const { id } = req.params;
    const technician = await Technician.findByIdAndDelete(id);
    if (!technician) {
      return next(new AppError('Technician not found.', 404));
    }
    res.status(200).json({ success: true, message: 'Technician deleted successfully.' });
  } catch (err) {
    next(err);
  }
};

