require('dotenv').config({ path: '../../.env' }); // Load env variables from root/parent folder
const mongoose = require('mongoose');
const connectDB = require('./db');
const User = require('../models/userModel');
const Technician = require('../models/technicianModel');
const bcrypt = require('bcryptjs');

const verifyConnection = async () => {
  console.log('[Connection Verifier] Initializing connection diagnostics...');
  try {
    // Connect to database
    await connectDB();
    
    const status = mongoose.connection.readyState;
    const states = {
      0: 'Disconnected',
      1: 'Connected',
      2: 'Connecting',
      3: 'Disconnecting'
    };
    
    console.log(`[Connection Verifier] Diagnosed state: ${states[status]} (${status})`);
    
    if (status === 1) {
      console.log('[Connection Verifier] ✓ Database verification successful!');
      
      // Seeding test user accounts and technician coordinates
      console.log('[Connection Verifier] Running seed operations...');
      
      let customer = await User.findOne({ email: 'customer@homehero.com' });
      if (!customer) {
        const passwordHash = await bcrypt.hash('Password123!', 10);
        customer = await User.create({
          email: 'customer@homehero.com',
          phone: '+919876543210',
          passwordHash,
          role: 'customer',
          firstName: 'Priya',
          lastName: 'Sharma',
          isVerified: true
        });
        console.log('[Connection Verifier] Seeded test customer: customer@homehero.com');
      }

      let provider = await User.findOne({ email: 'provider@homehero.com' });
      if (!provider) {
        const passwordHash = await bcrypt.hash('Password123!', 10);
        provider = await User.create({
          email: 'provider@homehero.com',
          phone: '+919876543211',
          passwordHash,
          role: 'provider',
          firstName: 'Marcus',
          lastName: 'Fernandes',
          isVerified: true
        });
        console.log('[Connection Verifier] Seeded test provider: provider@homehero.com');
      }

      let technician = await Technician.findOne({ userId: provider._id });
      if (!technician) {
        technician = await Technician.create({
          userId: provider._id,
          skills: ['plumber', 'electrician', 'carpenter', 'ac repair'],
          rating: 4.9,
          isOnline: true,
          currentLocation: {
            type: 'Point',
            coordinates: [78.382021, 17.426210] // Jubilee Hills coordinates
          },
          verification: {
            status: 'verified',
            licenseVerified: true,
            backgroundCheckStatus: 'passed',
            verifiedAt: new Date()
          }
        });
        console.log('[Connection Verifier] Seeded test technician profile with coordinates.');
      }
      
      console.log('[Connection Verifier] ✓ Seeding check completed.');
    } else {
      console.error('[Connection Verifier] ✗ Diagnostic warning: Pool is not in active connected state.');
    }
  } catch (err) {
    console.error('[Connection Verifier] ✗ Critical Connection Error:', err.message);
  } finally {
    // Clean shutdown of connection pools
    await mongoose.connection.close();
    console.log('[Connection Verifier] Connection pool closed cleanly. Diagnostic complete.');
  }
};

verifyConnection();
