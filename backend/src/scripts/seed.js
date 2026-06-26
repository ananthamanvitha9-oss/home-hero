const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const connectDB = require('../config/db');
const User = require('../models/userModel');
const Technician = require('../models/technicianModel');
const Service = require('../models/serviceModel');
const Category = require('../models/categoryModel');
const Setting = require('../models/settingModel');
const Booking = require('../models/bookingModel');
const Payment = require('../models/paymentModel');
const Review = require('../models/reviewModel');
const Notification = require('../models/notificationModel');
const Message = require('../models/messageModel');

const seedData = async () => {
  try {
    // Connect to DB
    await connectDB();

    if (mongoose.connection.readyState !== 1) {
      console.error('[Seeder] Error: Database is not connected.');
      process.exit(1);
    }

    console.log('[Seeder] Clearing database collections...');
    await User.deleteMany({});
    await Technician.deleteMany({});
    await Service.deleteMany({});
    await Category.deleteMany({});
    await Setting.deleteMany({});
    await Booking.deleteMany({});
    await Payment.deleteMany({});
    await Review.deleteMany({});
    await Notification.deleteMany({});
    await Message.deleteMany({});
    console.log('[Seeder] Database collections cleared.');

    // 1. Seed Settings
    console.log('[Seeder] Seeding settings configurations...');
    await Setting.insertMany([
      { key: 'holidaySurge', value: 1.2 },
      { key: 'monsoonSurge', value: 1.4 },
      { key: 'nightShiftSurcharge', value: 200 }
    ]);

    // 2. Seed Categories
    console.log('[Seeder] Seeding categories...');
    const categoriesList = await Category.insertMany([
      { name: 'AC Repair', slug: 'ac-repair', iconUrl: 'https://cdn.homehero.com/categories/ac-repair.svg' },
      { name: 'Electrician', slug: 'electrician', iconUrl: 'https://cdn.homehero.com/categories/electrician.svg' },
      { name: 'Plumber', slug: 'plumber', iconUrl: 'https://cdn.homehero.com/categories/plumber.svg' },
      { name: 'Carpenter', slug: 'carpenter', iconUrl: 'https://cdn.homehero.com/categories/carpenter.svg' }
    ]);

    // 3. Seed Services
    console.log('[Seeder] Seeding services...');
    const acCategory = categoriesList.find(c => c.slug === 'ac-repair');
    const electricianCategory = categoriesList.find(c => c.slug === 'electrician');
    const plumberCategory = categoriesList.find(c => c.slug === 'plumber');
    const carpenterCategory = categoriesList.find(c => c.slug === 'carpenter');

    const servicesList = await Service.insertMany([
      {
        name: 'AC Repair',
        categoryId: acCategory._id,
        description: 'Comprehensive cooling checks, gas charging, filter wash, and repair of air conditioning units.',
        pricingRules: { basePrice: 800, hourlyRate: 300, modifiers: {} }
      },
      {
        name: 'Plumber',
        categoryId: plumberCategory._id,
        description: 'Standard piping, valve leakage repairs, tap installations, and bathroom drainage resolution.',
        pricingRules: { basePrice: 500, hourlyRate: 250, modifiers: {} }
      },
      {
        name: 'Electrician',
        categoryId: electricianCategory._id,
        description: 'Switchboard wiring, fuse box repairs, short-circuit diagnostics, and home lighting installations.',
        pricingRules: { basePrice: 400, hourlyRate: 200, modifiers: {} }
      },
      {
        name: 'Carpenter',
        categoryId: carpenterCategory._id,
        description: 'Door hinges tuning, furniture assembly, lock installations, and structural woodwork repairs.',
        pricingRules: { basePrice: 600, hourlyRate: 250, modifiers: {} }
      }
    ]);

    // 4. Seed Users (Admin, Customers, Technicians)
    console.log('[Seeder] Seeding users accounts...');
    const adminPasswordHash = await bcrypt.hash('AdminPassword123!', 10);
    const customerPasswordHash = await bcrypt.hash('CustomerPassword123!', 10);
    const providerPasswordHash = await bcrypt.hash('ProviderPassword123!', 10);
    const techPasswordHash = await bcrypt.hash('TechPassword123!', 10);

    const seededUsers = await User.insertMany([
      {
        email: 'admin@homehero.com',
        phone: '+919999999999',
        passwordHash: adminPasswordHash,
        role: 'admin',
        firstName: 'System',
        lastName: 'Administrator',
        isVerified: true
      },
      {
        email: 'customer1@homehero.com',
        phone: '+919876543210',
        passwordHash: customerPasswordHash,
        role: 'customer',
        firstName: 'Sarah',
        lastName: 'Chen',
        isVerified: true
      },
      {
        email: 'customer2@homehero.com',
        phone: '+919876543211',
        passwordHash: customerPasswordHash,
        role: 'customer',
        firstName: 'Rohan',
        lastName: 'Das',
        isVerified: true
      },
      {
        email: 'provider@homehero.com',
        phone: '+919876543212',
        passwordHash: providerPasswordHash,
        role: 'provider',
        firstName: 'Amit',
        lastName: 'Patel',
        isVerified: true
      },
      {
        email: 'tech2@homehero.com',
        phone: '+919876543213',
        passwordHash: techPasswordHash,
        role: 'provider',
        firstName: 'Suresh',
        lastName: 'Kumar',
        isVerified: true
      },
      {
        email: 'tech3@homehero.com',
        phone: '+919876543214',
        passwordHash: techPasswordHash,
        role: 'provider',
        firstName: 'Marcus',
        lastName: 'Fernandes',
        isVerified: true
      }
    ]);

    // 5. Seed Technician Profiles
    console.log('[Seeder] Seeding technician profiles...');
    const amitUser = seededUsers.find(u => u.email === 'provider@homehero.com');
    const sureshUser = seededUsers.find(u => u.email === 'tech2@homehero.com');
    const marcusUser = seededUsers.find(u => u.email === 'tech3@homehero.com');

    await Technician.insertMany([
      {
        userId: amitUser._id,
        skills: ['Plumber', 'AC Repair'],
        rating: 4.85,
        verification: {
          status: 'verified',
          licenseVerified: true,
          backgroundCheckStatus: 'passed'
        },
        currentLocation: {
          type: 'Point',
          coordinates: [78.382021, 17.426210] // Jubilee Hills, Hyderabad
        },
        isOnline: true,
        serviceRadiusKm: 15,
        wallet: { balance: 3850.50, razorpayAccountId: 'acc_Pv902kf89d' }
      },
      {
        userId: sureshUser._id,
        skills: ['Plumber', 'Carpenter'],
        rating: 4.9,
        verification: {
          status: 'verified',
          licenseVerified: true,
          backgroundCheckStatus: 'passed'
        },
        currentLocation: {
          type: 'Point',
          coordinates: [78.343048, 17.448293] // Gachibowli, Hyderabad
        },
        isOnline: true,
        serviceRadiusKm: 10,
        wallet: { balance: 5200.00, razorpayAccountId: 'acc_Pv902kf89e' }
      },
      {
        userId: marcusUser._id,
        skills: ['Electrician', 'AC Repair'],
        rating: 4.75,
        verification: {
          status: 'verified',
          licenseVerified: true,
          backgroundCheckStatus: 'passed'
        },
        currentLocation: {
          type: 'Point',
          coordinates: [78.390747, 17.448554] // Madhapur, Hyderabad
        },
        isOnline: true,
        serviceRadiusKm: 15,
        wallet: { balance: 1200.00, razorpayAccountId: 'acc_Pv902kf89f' }
      }
    ]);

    console.log('[Seeder] Database seeding completed successfully.');
    process.exit(0);
  } catch (err) {
    console.error('[Seeder] Error seeding database:', err.message);
    process.exit(1);
  }
};

seedData();
