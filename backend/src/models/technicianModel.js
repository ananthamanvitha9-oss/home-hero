const mongoose = require('mongoose');

// Technician Schema – unified definition
const technicianSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  fullName: { type: String, required: true, trim: true },
  phone: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  profilePhoto: { type: String, default: '' },
  serviceCategory: {
    type: String,
    enum: ['Electrician', 'Plumber', 'Carpenter', 'AC Repair'],
    required: true
  },
  experienceYears: { type: Number, default: 0 },
  skills: { type: [String], default: [] },
  city: { type: String, default: '' },
  area: { type: String, default: '' },
  address: { type: String, default: '' },
  aadhaarNumber: { type: String, default: '' },
  aadhaarVerified: { type: Boolean, default: false },
  rating: { type: Number, min: 1, max: 5, default: 4.8 },
  totalJobsCompleted: { type: Number, default: 0 },
  availabilityStatus: { type: String, enum: ['available', 'unavailable'], default: 'available' },
  earnings: { type: Number, default: 0 },
  availability: {
    days: { type: [String], default: ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'] },
    startTime: { type: String, default: '09:00' },
    endTime: { type: String, default: '18:00' }
  },
  verification: {
    status: { type: String, enum: ['unverified','pending','verified'], default: 'unverified' },
    licenseVerified: { type: Boolean, default: false },
    backgroundCheckStatus: { type: String, enum: ['pending','passed','failed'], default: 'pending' },
    verifiedAt: { type: Date, default: null }
  },
  currentLocation: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number], default: [78.382021, 17.426210] } // [lng, lat]
  },
  isOnline: { type: Boolean, default: false },
  serviceRadiusKm: { type: Number, default: 15 },
  wallet: {
    balance: { type: Number, default: 0 },
    stripeAccountId: { type: String, default: '' }
  },
  bio: { type: String, default: '' }
}, { timestamps: true });

// Enable 2dsphere index for location queries
technicianSchema.index({ currentLocation: '2dsphere' });

module.exports = mongoose.model('Technician', technicianSchema);
