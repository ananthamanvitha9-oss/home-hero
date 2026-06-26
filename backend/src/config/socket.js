const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const Booking = require('../models/bookingModel');
const Technician = require('../models/technicianModel');
const User = require('../models/userModel');

const JWT_SECRET = process.env.JWT_SECRET || 'homehero_super_secret_jwt_key';

let ioInstance = null;

const initSocket = (server) => {
  ioInstance = new Server(server, {
    cors: {
      origin: '*', // Allow connections from frontend dev servers
      methods: ['GET', 'POST']
    }
  });

  // Authentication handshake middleware
  ioInstance.use((socket, next) => {
    const token = socket.handshake.auth?.token || socket.handshake.headers?.authorization?.split(' ')[1];
    if (token) {
      try {
        const decoded = jwt.verify(token, JWT_SECRET);
        socket.user = decoded;
      } catch (err) {
        console.warn('[Socket Auth] Authentication token verification failed:', err.message);
      }
    }
    next();
  });

  ioInstance.on('connection', (socket) => {
    console.log(`[Socket.io] Client connected: ${socket.id} (User: ${socket.user?.email || 'Guest'})`);

    // Channel room joining
    socket.on('join_booking', ({ bookingId }) => {
      const room = `booking_${bookingId}`;
      socket.join(room);
      console.log(`[Socket.io] Socket ${socket.id} joined room: ${room}`);
    });

    socket.on('join_active_heroes', () => {
      socket.join('active_heroes');
      console.log(`[Socket.io] Technician ${socket.id} joined active_heroes pool`);
    });

    // Accept Job dispatch request
    socket.on('accept_job', async ({ bookingId }) => {
      try {
        if (!socket.user || socket.user.role !== 'provider') {
          return socket.emit('error_message', { message: 'Unauthorized. Provider role required.' });
        }

        const booking = await Booking.findById(bookingId);
        if (!booking) {
          return socket.emit('error_message', { message: 'Booking not found.' });
        }

        if (booking.status !== 'pending' && booking.status !== 'matched') {
          return socket.emit('error_message', { message: 'Job already accepted or completed.' });
        }

        // Update database booking details
        booking.technicianId = socket.user.id;
        booking.status = 'matched';
        await booking.save();

        // Populate details for frontend view
        const populatedBooking = await Booking.findById(bookingId)
          .populate('customerId', 'firstName lastName email phone')
          .populate('technicianId', 'firstName lastName phone avatarUrl')
          .populate('serviceId', 'name');

        // Broadcast to customer booking room
        const room = `booking_${bookingId}`;
        ioInstance.to(room).emit('booking_matched', { booking: populatedBooking });
        
        console.log(`[Socket.io] Job accepted: Booking ${bookingId} matched to tech ${socket.user.id}`);
      } catch (err) {
        console.error('[Socket.io] Error accepting job:', err.message);
        socket.emit('error_message', { message: 'Failed to accept job.' });
      }
    });

    // Real-time telemetry locations
    socket.on('technician_location_update', async ({ bookingId, coordinates }) => {
      try {
        if (!coordinates || typeof coordinates.lat === 'undefined' || typeof coordinates.lng === 'undefined') {
          return;
        }

        // Save telemetry in MongoDB
        if (socket.user && socket.user.role === 'provider') {
          await Technician.findOneAndUpdate(
            { userId: socket.user.id },
            {
              currentLocation: {
                type: 'Point',
                coordinates: [parseFloat(coordinates.lng), parseFloat(coordinates.lat)]
              }
            },
            { upsert: true }
          );
        }

        // Broadcast location updates to customer
        const room = `booking_${bookingId}`;
        ioInstance.to(room).emit('location_updated', { coordinates });
      } catch (err) {
        console.error('[Socket.io] Telemetry update failed:', err.message);
      }
    });

    // Checklist check-offs synchronization
    socket.on('update_checklist', async ({ bookingId, checklist }) => {
      try {
        const booking = await Booking.findById(bookingId);
        if (!booking) {
          return socket.emit('error_message', { message: 'Booking not found.' });
        }

        booking.checklist = checklist;
        
        // If all items are checked, update status to active or completed
        const allCompleted = checklist.every(item => item.completed);
        if (allCompleted) {
          booking.status = 'completed';
        } else if (checklist[0].completed) {
          booking.status = 'active'; // First checkoff triggers active
        }

        await booking.save();

        const room = `booking_${bookingId}`;
        ioInstance.to(room).emit('checklist_updated', { 
          checklist: booking.checklist,
          status: booking.status
        });
      } catch (err) {
        console.error('[Socket.io] Checklist update failed:', err.message);
      }
    });

    socket.on('send_message', async ({ bookingId, message }) => {
      try {
        if (!socket.user) return;
        const Message = require('../models/messageModel');
        const User = require('../models/userModel');

        const user = await User.findById(socket.user.id);
        const senderName = user ? `${user.firstName} ${user.lastName}` : 'System Hero';

        const newMessage = new Message({
          bookingId,
          senderId: socket.user.id,
          senderName,
          message
        });

        await newMessage.save();

        const room = `booking_${bookingId}`;
        ioInstance.to(room).emit('new_message', newMessage);
        console.log(`[Socket.io] Chat message dispatched in room ${room} by user ${socket.user.id}`);
      } catch (err) {
        console.error('[Socket.io] Chat message error:', err.message);
      }
    });

    socket.on('disconnect', () => {
      console.log(`[Socket.io] Client disconnected: ${socket.id}`);
    });
  });

  return ioInstance;
};

const getIo = () => {
  return ioInstance;
};

module.exports = {
  initSocket,
  getIo
};
