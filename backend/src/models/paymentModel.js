const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema(
  {
    paymentId: { type: String, required: true, unique: true }, // Razorpay payment ID
    bookingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking', required: true },
    customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    technicianId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    razorpayOrderId: { type: String, required: true, unique: true },
    razorpayPaymentId: { type: String },
    razorpaySignature: { type: String },
    amount: { type: Number, required: true }, // in paise
    platformCommission: { type: Number, required: true }, // amount in paise
    technicianAmount: { type: Number, required: true }, // amount after commission
    paymentMethod: { type: String, enum: ['UPI', 'Credit Card', 'Debit Card', 'Net Banking', 'Wallet'], default: 'UPI' },
    paymentStatus: { type: String, enum: ['created', 'successful', 'failed', 'refunded'], default: 'created' },
    transactionDate: { type: Date },
    // Refund fields (optional)
    refundId: { type: String },
    refundAmount: { type: Number },
    refundStatus: { type: String, enum: ['pending', 'processed', 'failed'] },
    // Timestamps
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

// Indexes for fast queries
paymentSchema.index({ customerId: 1, createdAt: -1 });
paymentSchema.index({ technicianId: 1, createdAt: -1 });
paymentSchema.index({ bookingId: 1 });

module.exports = mongoose.model('Payment', paymentSchema);
