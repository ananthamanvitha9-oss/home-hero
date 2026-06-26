const crypto = require('crypto');
const Razorpay = require('razorpay');
const Payment  = require('../models/paymentModel');
const Booking  = require('../models/bookingModel');
const Technician = require('../models/technicianModel');
const { sendPushNotification } = require('../config/notificationHelper');

// ─── Razorpay Client ───────────────────────────────────────────────────────
const razorpay = new Razorpay({
  key_id:     process.env.RAZORPAY_KEY_ID     || 'rzp_test_mockkeyid123',
  key_secret: process.env.RAZORPAY_KEY_SECRET || 'mocksecretkey456',
});

const isMock = () =>
  process.env.NODE_ENV === 'test' || !process.env.RAZORPAY_KEY_ID;

// ─── Helper: Invoice Number Generator ────────────────────────────────────
function generateInvoiceNumber() {
  const now   = new Date();
  const yy    = String(now.getFullYear()).slice(2);
  const mm    = String(now.getMonth() + 1).padStart(2, '0');
  const rand  = Math.floor(1000 + Math.random() * 9000);
  return `HH-INV-${yy}${mm}-${rand}`;
}

// ─── POST /payments/create-order ─────────────────────────────────────────
exports.createOrder = async (req, res) => {
  try {
    const { bookingId } = req.body;
    if (!bookingId) {
      return res.status(400).json({ success: false, message: 'bookingId is required.' });
    }

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found.' });
    }

    const amountPaise = Math.round(booking.billing.totalAmount * 100);

    // Create Razorpay order (or mock)
    let order;
    if (isMock()) {
      order = {
        id:       'order_' + crypto.randomBytes(6).toString('hex'),
        amount:   amountPaise,
        currency: 'INR',
        receipt:  `rcpt_${booking.bookingCode}`,
        status:   'created',
      };
    } else {
      order = await razorpay.orders.create({
        amount:          amountPaise,
        currency:        'INR',
        receipt:         `rcpt_${booking.bookingCode}`,
        payment_capture: 1,
        notes: {
          booking_code:    booking.bookingCode,
          customer_id:     String(booking.customerId),
          service_name:    booking.serviceId?.toString() || '',
        },
      });
    }

    // Persist payment record (escrow hold)
    const payment = await Payment.create({
      paymentId:        order.id,          // temp: overwritten after verify
      bookingId:        booking._id,
      customerId:       booking.customerId,
      technicianId:     booking.technicianId || booking.customerId, // fallback
      razorpayOrderId:  order.id,
      amount:           booking.billing.totalAmount,
      platformCommission: booking.billing.platformCommission || Math.round(booking.billing.totalAmount * 0.15),
      technicianAmount: booking.billing.netToHero || Math.round(booking.billing.totalAmount * 0.85),
      paymentStatus:    'created',
      invoiceNumber:    generateInvoiceNumber(),
    });

    return res.json({
      success:    true,
      orderId:    order.id,
      order_id:   order.id,
      amount:     order.amount,
      currency:   order.currency,
      key:        process.env.RAZORPAY_KEY_ID || 'rzp_test_mockkeyid123',
      invoiceNumber: payment.invoiceNumber,
      booking: {
        code:    booking.bookingCode,
        amount:  booking.billing.totalAmount,
        service: booking.serviceId,
      },
    });
  } catch (err) {
    console.error('[createOrder]', err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ─── POST /payments/verify ────────────────────────────────────────────────
exports.verifyPayment = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      payment_method,
    } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ success: false, message: 'Verification fields missing.' });
    }

    const payment = await Payment.findOne({ razorpayOrderId: razorpay_order_id });
    if (!payment) {
      return res.status(404).json({ success: false, message: 'Payment record not found.' });
    }

    // HMAC-SHA256 signature verification
    const secret = process.env.RAZORPAY_KEY_SECRET || 'mocksecretkey456';
    const generated = crypto
      .createHmac('sha256', secret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    // Allow mock signature in test mode
    const signatureValid = isMock()
      ? true
      : generated === razorpay_signature;

    if (!signatureValid) {
      payment.paymentStatus = 'failed';
      payment.escrowStatus  = 'failed';
      await payment.save();
      return res.status(400).json({ success: false, message: 'Signature verification failed.' });
    }

    // Update payment record
    payment.paymentId          = razorpay_payment_id;
    payment.razorpayPaymentId  = razorpay_payment_id;
    payment.razorpaySignature  = razorpay_signature;
    payment.paymentStatus      = 'successful';
    payment.escrowStatus       = 'held_in_escrow';
    payment.transactionDate    = new Date();
    if (payment_method) payment.paymentMethod = payment_method;
    await payment.save();

    // Transition booking to matched
    const updatedBooking = await Booking.findByIdAndUpdate(
      payment.bookingId,
      { status: 'matched' },
      { new: true }
    );

    // Send payment success notification to customer
    await sendPushNotification(
      updatedBooking.customerId,
      'Payment Successful! 💳',
      `Payment of ₹${payment.amount} for booking ${updatedBooking.bookingCode} is held in escrow.`
    ).catch(err => console.error('[Push Notification]', err.message));

    // Send payment notification to technician if assigned
    if (updatedBooking.technicianId) {
      await sendPushNotification(
        updatedBooking.technicianId,
        'Payment Secured 💰',
        `Payment of ₹${payment.amount} for booking ${updatedBooking.bookingCode} is locked in escrow.`
      ).catch(err => console.error('[Push Notification]', err.message));
    }

    return res.json({
      success:       true,
      message:       'Payment verified and held in escrow.',
      payment: {
        id:            payment._id,
        invoiceNumber: payment.invoiceNumber,
        amount:        payment.amount,
        status:        payment.paymentStatus,
        escrow:        payment.escrowStatus,
        date:          payment.transactionDate,
      },
    });
  } catch (err) {
    console.error('[verifyPayment]', err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ─── POST /payments/release/:bookingId ───────────────────────────────────
exports.releaseEscrow = async (req, res) => {
  try {
    const { bookingId } = req.params;

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found.' });
    }
    if (booking.status !== 'completed') {
      return res.status(400).json({ success: false, message: 'Escrow released only for completed bookings.' });
    }

    const payment = await Payment.findOne({ bookingId: booking._id });
    if (!payment) {
      return res.status(404).json({ success: false, message: 'Payment record not found.' });
    }
    if (payment.escrowStatus !== 'held_in_escrow') {
      return res.status(400).json({ success: false, message: `Current escrow state: ${payment.escrowStatus}` });
    }

    payment.escrowStatus = 'released';
    await payment.save();

    // Credit technician wallet
    if (booking.technicianId) {
      await Technician.findOneAndUpdate(
        { userId: booking.technicianId },
        { $inc: { 'wallet.balance': booking.billing.netToHero } },
        { new: true, upsert: true }
      );
    }

    return res.json({
      success:          true,
      message:          'Escrow released to provider wallet.',
      released_amount:  booking.billing.totalAmount,
      net_to_provider:  booking.billing.netToHero,
      platform_fee:     booking.billing.platformCommission,
      invoiceNumber:    payment.invoiceNumber,
    });
  } catch (err) {
    console.error('[releaseEscrow]', err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ─── GET /payments/invoice/:paymentId ────────────────────────────────────
exports.getInvoice = async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.paymentId)
      .populate('bookingId')
      .populate('customerId', 'firstName lastName email phone')
      .populate('technicianId', 'firstName lastName');

    if (!payment) {
      return res.status(404).json({ success: false, message: 'Payment not found.' });
    }

    const booking  = payment.bookingId;
    const customer = payment.customerId;

    const invoice = {
      invoiceNumber:    payment.invoiceNumber || generateInvoiceNumber(),
      invoiceDate:      payment.transactionDate || payment.createdAt,
      dueDate:          payment.transactionDate || payment.createdAt,
      status:           payment.paymentStatus,
      escrowStatus:     payment.escrowStatus,

      customer: {
        name:  `${customer?.firstName || 'Guest'} ${customer?.lastName || ''}`.trim(),
        email: customer?.email,
        phone: customer?.phone,
      },

      booking: {
        code:          booking?.bookingCode,
        service:       booking?.serviceId,
        scheduledTime: booking?.scheduledTime,
        address:       booking?.address,
        hours:         booking?.hours || 2,
      },

      billing: {
        baseAmount:        payment.amount,
        platformFee:       payment.platformCommission,
        netToProvider:     payment.technicianAmount,
        tax:               Math.round(payment.amount * 0.18),
        total:             payment.amount,
        currency:          'INR',
        paymentMethod:     payment.paymentMethod,
        razorpayOrderId:   payment.razorpayOrderId,
        razorpayPaymentId: payment.razorpayPaymentId,
      },

      company: {
        name:    'HomeHero Technologies Pvt. Ltd.',
        address: '4th Floor, Tech Park, Madhapur, Hyderabad – 500081',
        gstin:   '36AABCH1234M1ZK',
        email:   'support@homehero.in',
        phone:   '+91 90000 00000',
      },
    };

    return res.json({ success: true, invoice });
  } catch (err) {
    console.error('[getInvoice]', err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ─── GET /payments/history ────────────────────────────────────────────────
exports.getPaymentHistory = async (req, res) => {
  try {
    const { status, from, to, page = 1, limit = 20 } = req.query;
    const userId = req.user._id;

    const filter = {
      $or: [{ customerId: userId }, { technicianId: userId }],
    };

    if (status)            filter.paymentStatus = status;
    if (from || to) {
      filter.transactionDate = {};
      if (from) filter.transactionDate.$gte = new Date(from);
      if (to)   filter.transactionDate.$lte = new Date(to);
    }

    const total = await Payment.countDocuments(filter);
    const payments = await Payment.find(filter)
      .populate('bookingId', 'bookingCode scheduledTime address serviceId status')
      .populate('customerId', 'firstName lastName email')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    return res.json({
      success: true,
      payments,
      pagination: {
        total,
        page:       Number(page),
        limit:      Number(limit),
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    console.error('[getPaymentHistory]', err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ─── POST /payments/refund/:paymentId ────────────────────────────────────
exports.initiateRefund = async (req, res) => {
  try {
    const { reason } = req.body;
    const payment = await Payment.findById(req.params.paymentId);
    if (!payment) {
      return res.status(404).json({ success: false, message: 'Payment not found.' });
    }
    if (payment.paymentStatus !== 'successful') {
      return res.status(400).json({ success: false, message: 'Only successful payments can be refunded.' });
    }

    let refund;
    if (!isMock() && payment.razorpayPaymentId) {
      refund = await razorpay.payments.refund(payment.razorpayPaymentId, {
        amount: Math.round(payment.amount * 100),
        notes:  { reason: reason || 'Customer request' },
      });
    } else {
      refund = {
        id:     'rfnd_' + crypto.randomBytes(6).toString('hex'),
        amount: Math.round(payment.amount * 100),
        status: 'processed',
      };
    }

    payment.paymentStatus = 'refunded';
    payment.escrowStatus  = 'refunded';
    payment.refundId      = refund.id;
    payment.refundAmount  = payment.amount;
    payment.refundStatus  = 'processed';
    await payment.save();

    return res.json({
      success:      true,
      message:      'Refund initiated successfully.',
      refundId:     refund.id,
      refundAmount: payment.amount,
    });
  } catch (err) {
    console.error('[initiateRefund]', err);
    return res.status(500).json({ success: false, message: err.message });
  }
};
