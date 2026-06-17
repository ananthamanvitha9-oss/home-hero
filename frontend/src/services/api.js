const BASE_URL = 'http://localhost:5000/api/v1';

export const api = {
  // Authentication
  login: async (email, password) => {
    const res = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    return res.json();
  },

  register: async (userData) => {
    const res = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData)
    });
    return res.json();
  },

  verifyOtp: async (phone, otpCode) => {
    const res = await fetch(`${BASE_URL}/auth/verify-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone, otp_code: otpCode })
    });
    return res.json();
  },

  // Bookings & Dynamic Pricing
  getEstimate: async (category, details) => {
    const res = await fetch(`${BASE_URL}/bookings/estimate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ category, details })
    });
    return res.json();
  },

  createBooking: async (bookingData, token) => {
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const res = await fetch(`${BASE_URL}/bookings`, {
      method: 'POST',
      headers,
      body: JSON.stringify(bookingData)
    });
    return res.json();
  },

  getBookingStatus: async (bookingId, token) => {
    const headers = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const res = await fetch(`${BASE_URL}/bookings/${bookingId}`, {
      method: 'GET',
      headers
    });
    return res.json();
  },

  // Reviews
  submitReview: async (reviewData, token) => {
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const res = await fetch(`${BASE_URL}/reviews`, {
      method: 'POST',
      headers,
      body: JSON.stringify(reviewData)
    });
    return res.json();
  },

  getReviews: async (techId) => {
    const res = await fetch(`${BASE_URL}/reviews/technician/${techId}`);
    return res.json();
  },

  // Notifications
  getNotifications: async (token) => {
    const headers = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const res = await fetch(`${BASE_URL}/notifications`, {
      method: 'GET',
      headers
    });
    return res.json();
  },

  markNotificationRead: async (notifId, token) => {
    const headers = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const res = await fetch(`${BASE_URL}/notifications/${notifId}/read`, {
      method: 'PUT',
      headers
    });
    return res.json();
  }
};
