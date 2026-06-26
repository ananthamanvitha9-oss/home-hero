const mongoose = require('mongoose');

const statusHistorySchema = new mongoose.Schema(
  {
    status: {
      type: String,
      enum: ['pending', 'accepted', 'rejected', 'assigned', 'in_progress', 'completed', 'cancelled'],
      required: true
    },
    changedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    note: {
      type: String,
      default: ''
    },
    timestamp: {
      type: Date,
      default: Date.now
    }
  },
  { _id: false }
);

const bookingSchema = new mongoose.Schema(
  {
    bookingCode: {
      type: String,
      required: true,
      unique: true,
      index: true
    },
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    technicianId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    serviceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Service',
      required: true
    },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'rejected', 'assigned', 'in_progress', 'completed', 'cancelled'],
      default: 'pending'
    },
    // Full audit trail of every status change
    statusHistory: {
      type: [statusHistorySchema],
      default: []
    },
    billing: {
      totalAmount: { type: Number, required: true },
      platformCommission: { type: Number, required: true },
      taxAmount: { type: Number, default: 0 },
      netToHero: { type: Number, required: true },
      isPaid: { type: Boolean, default: false },
      paidAt: { type: Date, default: null },
      paymentGateway: { type: String, enum: ['razorpay'], default: 'razorpay' },
      couponCode: { type: String, default: '' },
      discountAmount: { type: Number, default: 0 }
    },
    scheduledTime: {
      type: Date,
      required: true
    },
    // Supports rescheduling — original time is preserved
    originalScheduledTime: {
      type: Date,
      default: null
    },
    address: {
      street: { type: String, required: true },
      area: { type: String, required: true },
      city: { type: String, required: true },
      pincode: { type: String, required: true },
      geoPoint: {
        type: {
          type: String,
          enum: ['Point'],
          default: 'Point'
        },
        coordinates: {
          type: [Number], // [longitude, latitude]
          required: true
        }
      }
    },
    // Customer-provided job notes / special instructions
    notes: {
      type: String,
      default: '',
      maxlength: 500
    },
    // Cancellation metadata
    cancellation: {
      reason: { type: String, default: '' },
      cancelledBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
      },
      cancelledAt: { type: Date, default: null },
      // Cancellation fee as flat amount
      feeCharged: { type: Number, default: 0 }
    },
    checklist: [
      {
        task: { type: String, required: true },
        completed: { type: Boolean, default: false },
        timestamp: { type: Date, default: null }
      }
    ]
  },
  {
    timestamps: true
  }
);

// Compound indexes for common query patterns
bookingSchema.index({ customerId: 1, status: 1, scheduledTime: -1 });
bookingSchema.index({ technicianId: 1, status: 1 });
bookingSchema.index({ status: 1, createdAt: -1 });
bookingSchema.index({ 'address.geoPoint': '2dsphere' });

module.exports = mongoose.model('Booking', bookingSchema);
