const crypto = require('crypto');
const Razorpay = require('razorpay');
const Payment = require('../models/paymentModel');
const Booking = require('../models/bookingModel');
const Technician = require('../models/technicianModel');

// Initialize Razorpay client with credentials (falls back to mock credentials in development)
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_mockkeyid123',
  key_secret: process.env.RAZORPAY_KEY_SECRET || 'mocksecretkey456'
});

// Create a new Razorpay Order for a booking
exports.createOrder = async (req, res) => {
  try {
    const { bookingId } = req.body;
    if (!bookingId) {
      return res.status(400).json({ success: false, message: 'Booking ID is required.' });
    }

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found.' });
    }

    // Razorpay amount expects value in paise (1 INR = 100 paise)
    const amountInPaise = Math.round(booking.billing.totalAmount * 100);

    const options = {
      amount: amountInPaise,
      currency: 'INR',
      receipt: `rcpt_${booking.bookingCode}`,
      payment_capture: 1 // Auto-capture payments
    };

    // If using mock credentials, simulate order creation without making external requests
    let order;
    if (process.env.NODE_ENV === 'test' || !process.env.RAZORPAY_KEY_ID) {
      order = {
        id: 'order_' + Math.random().toString(36).substring(2, 10),
        amount: amountInPaise,
        currency: 'INR',
        receipt: options.receipt,
        status: 'created'
      };
    } else {
      order = await razorpay.orders.create(options);
    }

    // Store payment in escrow status
    const payment = new Payment({
      bookingId: booking._id,
      razorpayOrderId: order.id,
      amount: booking.billing.totalAmount,
      escrowStatus: 'held_in_escrow'
    });

    await payment.save();

    res.json({
      success: true,
      orderId: order.id,
      order_id: order.id,
      amount: order.amount,
      currency: order.currency,
      key: process.env.RAZORPAY_KEY_ID || 'rzp_test_mockkeyid123'
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Verify the Razorpay web signature
exports.verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ success: false, message: 'Verification details missing.' });
    }

    const payment = await Payment.findOne({ razorpayOrderId: razorpay_order_id });
    if (!payment) {
      return res.status(404).json({ success: false, message: 'Payment record not found.' });
    }

    // Standard cryptographical signature validation
    const secret = process.env.RAZORPAY_KEY_SECRET || 'mocksecretkey456';
    const generated_signature = crypto
      .createHmac('sha256', secret)
      .update(razorpay_order_id + '|' + razorpay_payment_id)
      .digest('hex');

    if (generated_signature !== razorpay_signature) {
      payment.escrowStatus = 'failed';
      await payment.save();
      return res.status(400).json({ success: false, message: 'Payment signature verification failed.' });
    }

    // Update payment record
    payment.razorpayPaymentId = razorpay_payment_id;
    payment.razorpaySignature = razorpay_signature;
    payment.escrowStatus = 'held_in_escrow';
    await payment.save();

    // Update booking status to reflect payment confirmation
    await Booking.findByIdAndUpdate(payment.bookingId, { status: 'matched' });

    res.json({
      success: true,
      message: 'Payment verified successfully and held in escrow.'
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Release Escrow funds to Technician (wallet credits)
exports.releaseEscrow = async (req, res) => {
  try {
    const { bookingId } = req.params;

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found.' });
    }

    if (booking.status !== 'completed') {
      return res.status(400).json({ success: false, message: 'Escrow can only be released for completed bookings.' });
    }

    const payment = await Payment.findOne({ bookingId: booking._id });
    if (!payment) {
      return res.status(404).json({ success: false, message: 'Escrow transaction not found.' });
    }

    if (payment.escrowStatus !== 'held_in_escrow') {
      return res.status(400).json({ success: false, message: `Escrow funds are currently in state: ${payment.escrowStatus}` });
    }

    // Release payment to provider wallet
    payment.escrowStatus = 'released';
    await payment.save();

    // Credit Technician Wallet balance
    if (booking.technicianId) {
      await Technician.findOneAndUpdate(
        { userId: booking.technicianId },
        { $inc: { 'wallet.balance': booking.billing.netToHero } },
        { new: true, upsert: true }
      );
    }

    res.json({
      success: true,
      message: 'Escrow funds successfully released to provider wallet.',
      released_amount: booking.billing.totalAmount,
      net_to_provider: booking.billing.netToHero,
      platform_fee: booking.billing.platformCommission,
      status: 'released'
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
