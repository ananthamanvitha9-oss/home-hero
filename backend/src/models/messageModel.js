const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema(
  {
    bookingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking',
      required: true
    },
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    senderName: {
      type: String,
      required: true
    },
    message: {
      type: String,
      required: true
    }
  },
  {
    timestamps: true
  }
);

// Optimize messages lookups by bookingId
messageSchema.index({ bookingId: 1, createdAt: 1 });

module.exports = mongoose.model('Message', messageSchema);
