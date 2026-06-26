const Booking = require('../models/bookingModel');
const Service = require('../models/serviceModel');
const Technician = require('../models/technicianModel');
const User = require('../models/userModel');
const Setting = require('../models/settingModel');
const AppError = require('../core/errors/AppError');
const { sendPushNotification } = require('../config/notificationHelper');

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Generates a unique 8-character booking code.
 */
const generateBookingCode = () =>
  'BKG-' + Math.floor(10000000 + Math.random() * 90000000).toString().substring(0, 8);

/**
 * Appends an entry to a booking's statusHistory array.
 */
const appendStatusHistory = (booking, status, userId = null, note = '') => {
  booking.statusHistory.push({ status, changedBy: userId, note, timestamp: new Date() });
};

/**
 * Emits a WebSocket event to connected clients.
 */
const emitSocket = (event, payload) => {
  try {
    const { getIo } = require('../config/socket');
    const io = getIo();
    if (io) io.to('active_heroes').emit(event, payload);
  } catch (err) {
    console.warn(`[Socket.io] Failed to emit "${event}":`, err.message);
  }
};

// ─── Price Estimate ───────────────────────────────────────────────────────────

/**
 * POST /api/bookings/estimate
 * Calculates a flat-rate price based on category, details, and dynamic surcharges.
 */
exports.calculatePrice = async (req, res, next) => {
  try {
    const { category, details } = req.body;
    if (!category) return next(new AppError('Service category is required.', 400));

    let service = await Service.findOne({ name: new RegExp(`^${category}$`, 'i') });
    if (!service) {
      service = { name: category, pricingRules: { basePrice: 1200, hourlyRate: 400 } };
    }

    const { basePrice, hourlyRate } = service.pricingRules;
    let total = basePrice;

    if (['cleaning', 'ac repair'].includes(category.toLowerCase())) {
      const bedrooms = details?.bedrooms || details?.rooms || 1;
      const hasPets = details?.has_pets || details?.hasPets || false;
      const ecoSupplies = details?.eco_supplies || details?.ecoSupplies || false;
      total = basePrice + (bedrooms - 1) * hourlyRate * 1.2;
      if (hasPets) total += 300;
      if (ecoSupplies) total += 200;
    } else {
      const hours = details?.hours || 1;
      const ecoSupplies = details?.eco_supplies || details?.ecoSupplies || false;
      total = basePrice + (hours - 1) * hourlyRate;
      if (ecoSupplies) total += 150;
    }

    // Apply dynamic platform surcharges from settings
    const [holidaySetting, monsoonSetting, nightSetting] = await Promise.all([
      Setting.findOne({ key: 'holidaySurge' }),
      Setting.findOne({ key: 'monsoonSurge' }),
      Setting.findOne({ key: 'nightShiftSurcharge' })
    ]);

    const holidaySurge = holidaySetting?.value ?? 1.0;
    const monsoonSurge = monsoonSetting?.value ?? 1.0;
    const nightShiftSurcharge = nightSetting?.value ?? 0;
    total = total * holidaySurge * monsoonSurge + nightShiftSurcharge;

    res.status(200).json({
      success: true,
      category: service.name,
      pricing: {
        base_price: basePrice,
        hourly_rate: hourlyRate,
        holiday_surge: holidaySurge,
        monsoon_surge: monsoonSurge,
        night_surcharge: nightShiftSurcharge,
        calculated_total: Math.round(total)
      }
    });
  } catch (err) {
    next(err);
  }
};

// ─── Create Booking ───────────────────────────────────────────────────────────

/**
 * POST /api/bookings
 * Creates a new booking. Attempts to match a nearby online technician.
 */
exports.createBooking = async (req, res, next) => {
  try {
    const {
      service_name,
      serviceId,
      scheduledTime,
      address,
      coordinates,
      totalAmount,
      notes
    } = req.body;

    if (!scheduledTime) return next(new AppError('Scheduled time is required.', 400));
    if (!totalAmount) return next(new AppError('Total amount is required.', 400));
    if (new Date(scheduledTime) < new Date()) {
      return next(new AppError('Scheduled time cannot be in the past.', 400));
    }

    // Resolve or auto-create the service document
    const resolveServiceName = service_name || 'General Service';
    let service;
    if (serviceId) {
      service = await Service.findById(serviceId);
    } else {
      service = await Service.findOne({ name: new RegExp(`^${resolveServiceName}$`, 'i') });
    }
    if (!service) {
      service = await Service.create({
        name: resolveServiceName,
        pricingRules: { basePrice: 1200, hourlyRate: 400 }
      });
    }

    // Parse coordinates with Hyderabad defaults
    let latitude = 17.426210;
    let longitude = 78.382021;
    if (coordinates) {
      if (typeof coordinates.lat !== 'undefined') latitude = parseFloat(coordinates.lat);
      if (typeof coordinates.lng !== 'undefined') longitude = parseFloat(coordinates.lng);
    }

    // Parse address with sensible defaults
    let parsedAddress = {
      street: 'Address Not Provided',
      area: 'Jubilee Hills',
      city: 'Hyderabad',
      pincode: '500033'
    };
    if (address && typeof address === 'object') {
      parsedAddress = {
        street: address.street || parsedAddress.street,
        area: address.area || parsedAddress.area,
        city: address.city || parsedAddress.city,
        pincode: address.pincode || parsedAddress.pincode
      };
    } else if (typeof address === 'string') {
      parsedAddress.street = address;
    }

    // Find nearest available technician within 15km radius
    let technicianId = null;
    const nearbyTechnician = await Technician.findOne({
      isOnline: true,
      currentLocation: {
        $near: {
          $geometry: { type: 'Point', coordinates: [longitude, latitude] },
          $maxDistance: 15000
        }
      }
    });
    if (nearbyTechnician) {
      technicianId = nearbyTechnician.userId;
    }

    const total = parseFloat(totalAmount);
    const platformCommission = Math.round(total * 0.15 * 100) / 100;
    const taxAmount = Math.round(total * 0.05 * 100) / 100;
    const netToHero = Math.round((total - platformCommission) * 100) / 100;
    const initialStatus = technicianId ? 'accepted' : 'pending';

    const newBooking = new Booking({
      bookingCode: generateBookingCode(),
      customerId: req.user.id,
      technicianId,
      serviceId: service._id,
      status: initialStatus,
      statusHistory: [
        { status: 'pending', changedBy: req.user.id, note: 'Booking created', timestamp: new Date() },
        ...(technicianId
          ? [{ status: 'accepted', changedBy: null, note: 'Auto-matched with nearby technician', timestamp: new Date() }]
          : [])
      ],
      billing: { totalAmount: total, platformCommission, taxAmount, netToHero },
      scheduledTime: new Date(scheduledTime),
      address: {
        ...parsedAddress,
        geoPoint: { type: 'Point', coordinates: [longitude, latitude] }
      },
      notes: notes || '',
      checklist: [
        { task: 'Pre-job photo upload', completed: false },
        { task: 'Perform active repairs', completed: false },
        { task: 'Post-job photo upload & sign-off', completed: false }
      ]
    });

    await newBooking.save();

    // Notify technician via Socket.io broadcast
    emitSocket('new_job_dispatched', {
      bookingCode: newBooking.bookingCode,
      bookingId: newBooking._id,
      serviceName: service.name,
      address: parsedAddress.street,
      totalAmount: total,
      coordinates: { lat: latitude, lng: longitude }
    });

    // Push notification to customer if matched
    if (technicianId) {
      const techUser = await User.findById(technicianId).select('firstName lastName');
      const heroName = techUser
        ? `${techUser.firstName} ${techUser.lastName}`
        : 'A nearby Hero';
      await sendPushNotification(
        req.user.id,
        'Hero Matched! 🦸',
        `${heroName} is en route to your location.`
      ).catch(err => console.error('[Push Notification]', err.message));
    }

    const populatedBooking = await Booking.findById(newBooking._id)
      .populate('customerId', 'firstName lastName email phone')
      .populate('technicianId', 'firstName lastName phone')
      .populate('serviceId', 'name');

    res.status(201).json({
      success: true,
      message: technicianId
        ? 'Booking confirmed! A Hero has been matched.'
        : 'Booking created. Searching for available Heroes nearby...',
      booking: populatedBooking
    });
  } catch (err) {
    next(err);
  }
};

// ─── Get All Bookings ─────────────────────────────────────────────────────────

/**
 * GET /api/bookings
 * Returns the booking list for the authenticated user (role-aware).
 * Supports filtering by ?status=&from=&to=&page=&limit=
 */
exports.getBookings = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { role } = req.user;
    const { status, from, to, page = 1, limit = 20 } = req.query;

    let filter = {};

    if (role === 'admin') {
      // Admins see everything
    } else if (role === 'provider' || role === 'technician') {
      filter.technicianId = userId;
    } else {
      filter.customerId = userId;
    }

    if (status) {
      const statuses = status.split(',').map(s => s.trim());
      filter.status = { $in: statuses };
    }

    if (from || to) {
      filter.scheduledTime = {};
      if (from) filter.scheduledTime.$gte = new Date(from);
      if (to) filter.scheduledTime.$lte = new Date(to);
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [bookings, total] = await Promise.all([
      Booking.find(filter)
        .populate('customerId', 'firstName lastName email phone')
        .populate('technicianId', 'firstName lastName phone')
        .populate('serviceId', 'name')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      Booking.countDocuments(filter)
    ]);

    res.status(200).json({
      success: true,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / parseInt(limit)),
      bookings
    });
  } catch (err) {
    next(err);
  }
};

// ─── Get Single Booking ───────────────────────────────────────────────────────

/**
 * GET /api/bookings/:id
 * Fetches a single booking by MongoDB ObjectId or bookingCode.
 */
exports.getBooking = async (req, res, next) => {
  try {
    const { id } = req.params;
    const query = /^[0-9a-fA-F]{24}$/.test(id) ? { _id: id } : { bookingCode: id };

    const booking = await Booking.findOne(query)
      .populate('customerId', 'firstName lastName email phone')
      .populate('technicianId', 'firstName lastName phone avatarUrl')
      .populate('serviceId', 'name description')
      .populate('statusHistory.changedBy', 'firstName lastName role')
      .populate('cancellation.cancelledBy', 'firstName lastName role');

    if (!booking) return next(new AppError('Booking not found.', 404));

    // Role check — customers/technicians can only view their own bookings
    const userId = req.user.id.toString();
    const isOwner =
      booking.customerId?._id?.toString() === userId ||
      booking.technicianId?._id?.toString() === userId ||
      req.user.role === 'admin';

    if (!isOwner) return next(new AppError('Access denied.', 403));

    res.status(200).json({ success: true, booking });
  } catch (err) {
    next(err);
  }
};

// ─── Update Booking ───────────────────────────────────────────────────────────

/**
 * PUT /api/bookings/:id
 * Updates booking status, checklist, notes, or rescheduled time.
 * Role-based permission enforcement:
 *   - Customers  → reschedule, update notes (pending only), request cancel
 *   - Technicians → en_route → active → completed
 *   - Admins     → any status
 */
exports.updateBooking = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, checklist, notes, scheduledTime } = req.body;

    const booking = await Booking.findById(id);
    if (!booking) return next(new AppError('Booking not found.', 404));

    const userId = req.user.id.toString();
    const isCustomer = booking.customerId.toString() === userId;
    const isTechnician =
      booking.technicianId && booking.technicianId.toString() === userId;
    const isAdmin = req.user.role === 'admin';

    if (!isCustomer && !isTechnician && !isAdmin) {
      return next(new AppError('Access denied. You are not a party to this booking.', 403));
    }

    // ── Status Transition ──────────────────────────────────────────────────
    if (status) {
      const currentStatus = booking.status;

      // Guard: completed/cancelled bookings are immutable
      if (['completed', 'cancelled'].includes(currentStatus) && !isAdmin) {
        return next(new AppError(`Cannot update a ${currentStatus} booking.`, 400));
      }

      // Customer-allowed transitions
      if (isCustomer && !isAdmin) {
        if (status !== 'cancelled') {
          return next(new AppError('Customers can only cancel a booking.', 403));
        }
      }

      // Technician-allowed transitions
       const techAllowed = ['in_progress', 'completed'];
       if (isTechnician && !isAdmin && !techAllowed.includes(status)) {
         return next(
           new AppError(
             `Technician cannot set status to "${status}". Allowed: ${techAllowed.join(', ')}.`,
             403
           )
         );
       }

      booking.status = status;
      appendStatusHistory(booking, status, req.user.id);

      // Auto-complete checklist when marked done
      if (status === 'completed') {
        booking.checklist.forEach(task => {
          task.completed = true;
          task.timestamp = new Date();
        });
      }
    }

    // ── Checklist Update ───────────────────────────────────────────────────
    if (checklist && Array.isArray(checklist)) {
      if (!isTechnician && !isAdmin) {
        return next(new AppError('Only the assigned technician can update the checklist.', 403));
      }
      booking.checklist = checklist;
    }

    // ── Notes Update ───────────────────────────────────────────────────────
    if (notes !== undefined) {
      if (!isCustomer && !isAdmin) {
        return next(new AppError('Only the customer can update booking notes.', 403));
      }
      booking.notes = notes;
    }

    // ── Reschedule ─────────────────────────────────────────────────────────
    if (scheduledTime) {
      if (!isCustomer && !isAdmin) {
        return next(new AppError('Only the customer can reschedule a booking.', 403));
      }
      if (['active', 'en_route', 'completed', 'cancelled'].includes(booking.status)) {
        return next(new AppError('Cannot reschedule a booking that is in-progress or closed.', 400));
      }
      const newTime = new Date(scheduledTime);
      if (newTime < new Date()) return next(new AppError('Scheduled time cannot be in the past.', 400));
      // Preserve original time on first reschedule
      if (!booking.originalScheduledTime) {
        booking.originalScheduledTime = booking.scheduledTime;
      }
      booking.scheduledTime = newTime;
      appendStatusHistory(booking, booking.status, req.user.id, 'Booking rescheduled');
    }

    await booking.save();

    // Notify via WebSocket if status changed
    if (status) {
      try {
        const { getIo } = require('../config/socket');
        const io = getIo();
        if (io) {
          io.to(booking._id.toString()).emit('booking_status_updated', {
            bookingId: booking._id,
            status: booking.status
          });
        }
      } catch (wsErr) {
        console.warn('[Socket.io] Could not emit status update:', wsErr.message);
      }
    }

    res.status(200).json({
      success: true,
      message: 'Booking updated successfully.',
      booking: {
        _id: booking._id,
        bookingCode: booking.bookingCode,
        status: booking.status,
        scheduledTime: booking.scheduledTime,
        notes: booking.notes
      }
    });
  } catch (err) {
    next(err);
  }
};

// ─── Cancel Booking ───────────────────────────────────────────────────────────

/**
 * POST /api/bookings/:id/cancel
 * Dedicated cancel endpoint. Computes cancellation fee based on timing.
 *   - Cancellation < 2 hours before schedule → 50% fee
 *   - Cancellation > 2 hours before schedule → 10% fee
 *   - Booking still "pending" with no technician → no fee
 */
exports.cancelBooking = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const booking = await Booking.findById(id);
    if (!booking) return next(new AppError('Booking not found.', 404));

    const userId = req.user.id.toString();
    const isCustomer = booking.customerId.toString() === userId;
    const isAdmin = req.user.role === 'admin';

    if (!isCustomer && !isAdmin) {
      return next(new AppError('Only the booking owner or an admin can cancel.', 403));
    }

    if (['completed', 'cancelled'].includes(booking.status)) {
      return next(new AppError(`Booking is already ${booking.status}.`, 400));
    }

    // Calculate cancellation fee
    const now = new Date();
    const hoursUntilService =
      (booking.scheduledTime.getTime() - now.getTime()) / (1000 * 60 * 60);
    
    let feeCharged = 0;
    if (booking.technicianId) {
      if (hoursUntilService < 2) {
        feeCharged = Math.round(booking.billing.totalAmount * 0.5);
      } else {
        feeCharged = Math.round(booking.billing.totalAmount * 0.1);
      }
    }

    booking.status = 'cancelled';
    booking.cancellation = {
      reason: reason || 'No reason provided',
      cancelledBy: req.user.id,
      cancelledAt: new Date(),
      feeCharged
    };
    appendStatusHistory(booking, 'cancelled', req.user.id, reason || '');

    await booking.save();

    res.status(200).json({
      success: true,
      message: 'Booking cancelled successfully.',
      cancellationFee: feeCharged,
      refundAmount: Math.max(0, booking.billing.totalAmount - feeCharged),
      booking: {
        _id: booking._id,
        bookingCode: booking.bookingCode,
        status: booking.status,
        cancellation: booking.cancellation
      }
    });
  } catch (err) {
    next(err);
  }
};

// ─── Delete Booking ───────────────────────────────────────────────────────────

/**
 * DELETE /api/bookings/:id
 * Hard-deletes a booking. Admin-only for non-cancelled bookings.
 */
exports.deleteBooking = async (req, res, next) => {
  try {
    const { id } = req.params;
    const booking = await Booking.findById(id);
    if (!booking) return next(new AppError('Booking not found.', 404));

    const userId = req.user.id.toString();
    const isCustomer = booking.customerId.toString() === userId;
    const isAdmin = req.user.role === 'admin';

    // Non-admins can only delete their own cancelled bookings
    if (!isAdmin && (!isCustomer || booking.status !== 'cancelled')) {
      return next(
        new AppError(
          'You can only delete your own cancelled bookings. Contact admin for other cases.',
          403
        )
      );
    }

    await Booking.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: 'Booking deleted successfully.'
    });
  } catch (err) {
    next(err);
  }
};

// ─── Booking Status ───────────────────────────────────────────────────────────

/**
 * GET /api/bookings/:id/status
 * Lightweight endpoint returning only the current status + history.
 * Used for real-time polling/tracking.
 */
exports.getBookingStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const query = /^[0-9a-fA-F]{24}$/.test(id) ? { _id: id } : { bookingCode: id };

    const booking = await Booking.findOne(query)
      .select('bookingCode status statusHistory scheduledTime technicianId address')
      .populate('technicianId', 'firstName lastName phone avatarUrl')
      .populate('statusHistory.changedBy', 'firstName lastName role')
      .lean();

    if (!booking) return next(new AppError('Booking not found.', 404));

    res.status(200).json({
      success: true,
      bookingCode: booking.bookingCode,
      status: booking.status,
      scheduledTime: booking.scheduledTime,
      technician: booking.technicianId || null,
      address: booking.address,
      statusHistory: booking.statusHistory
    });
  } catch (err) {
    next(err);
  }
};

// ─── Booking Messages ─────────────────────────────────────────────────────────

/**
 * GET /api/bookings/:id/messages
 * Returns all chat messages for a booking.
 */
exports.getBookingMessages = async (req, res, next) => {
  try {
    const { id } = req.params;
    const Message = require('../models/messageModel');
    const messages = await Message.find({ bookingId: id }).sort({ createdAt: 1 });
    res.status(200).json({ success: true, messages });
  } catch (err) {
    next(err);
  }
};
// ─── Technician Response ───────────────────────────────────────────────────────────

/**
 * POST /api/bookings/:id/technician-response
 * Technician accepts or rejects a pending booking.
 */
exports.technicianResponse = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { response, note } = req.body; // validated by middleware
    const booking = await Booking.findById(id);
    if (!booking) return next(new AppError('Booking not found.', 404));

    const isAdmin = req.user.role === 'admin';
    const isTechnician = req.user.role === 'technician' || req.user.role === 'provider';

    // Only the assigned technician (if already set) or admin can respond to an already assigned booking
    if (booking.technicianId && booking.technicianId.toString() !== req.user.id && !isAdmin) {
      return next(new AppError('You are not authorized to respond to this booking.', 403));
    }

    // Only pending bookings are eligible for response
    if (booking.status !== 'pending') {
      return next(new AppError('Only pending bookings can be accepted or rejected.', 400));
    }

    if (response === 'accept') {
      // Assign technician and move status to accepted
      booking.technicianId = req.user.id;
      booking.status = 'accepted';
      appendStatusHistory(booking, 'accepted', req.user.id, note || 'Technician accepted');
    } else if (response === 'reject') {
      // Keep technicianId null, status stays pending (or could be set to rejected)
      booking.status = 'rejected';
      appendStatusHistory(booking, 'rejected', req.user.id, note || 'Technician rejected');
    }

    await booking.save();

    // Notify customer via push if accepted
    if (response === 'accept') {
      await sendPushNotification(
        booking.customerId,
        'Your Hero Accepted! 🎉',
        `Technician has accepted your booking ${booking.bookingCode}`
      ).catch(err => console.error('[Push Notification]', err.message));
    }

    res.status(200).json({
      success: true,
      message: `Technician ${response}ed booking successfully.`,
      booking: { _id: booking._id, status: booking.status, technicianId: booking.technicianId }
    });
  } catch (err) {
    next(err);
  }
};

// ─── Admin Analytics ───────────────────────────────────────────────────────────

/**
 * GET /api/bookings/admin/analytics
 * Returns aggregated booking statistics for admin dashboards.
 * Query parameters: from, to (ISO dates), status (comma separated).
 */
exports.adminAnalytics = async (req, res, next) => {
  try {
    if (req.user.role !== 'admin') return next(new AppError('Admin access required.', 403));
    const { from, to, status } = req.query;
    const match = {};
    if (from) match.scheduledTime = { $gte: new Date(from) };
    if (to) match.scheduledTime = { ...(match.scheduledTime || {}), $lte: new Date(to) };
    if (status) match.status = { $in: status.split(',').map(s => s.trim()) };

    const aggregates = await Booking.aggregate([
      { $match: match },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalRevenue: { $sum: '$billing.totalAmount' },
          platformCommission: { $sum: '$billing.platformCommission' },
          netToHero: { $sum: '$billing.netToHero' }
        }
      },
      { $project: { status: '$_id', _id: 0, count: 1, totalRevenue: 1, platformCommission: 1, netToHero: 1 } }
    ]);

    res.status(200).json({ success: true, analytics: aggregates });
  } catch (err) {
    next(err);
  }
};
