import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Create Axios Instance
const axiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request Interceptor to attach JWT token
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor for handling token expiration & structured errors
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    // If unauthorized (401), we clear local auth token and redirect to login
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // Optional: window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const api = {
  // Authentication
  login: async (email, password) => {
    const res = await axiosInstance.post('/auth/login', { email, password });
    return res.data;
  },

  register: async (userData) => {
    const res = await axiosInstance.post('/auth/register', userData);
    return res.data;
  },

  verifyOtp: async (phone, otpCode) => {
    const res = await axiosInstance.post('/auth/verify-otp', { phone, otp_code: otpCode });
    return res.data;
  },

  forgotPassword: async (email) => {
    const res = await axiosInstance.post('/auth/forgot-password', { email });
    return res.data;
  },

  resetPassword: async (token, password) => {
    const res = await axiosInstance.post(`/auth/reset-password/${token}`, { password });
    return res.data;
  },

  logout: async () => {
    const res = await axiosInstance.post('/auth/logout');
    return res.data;
  },

  // Bookings & Dynamic Pricing
  getEstimate: async (category, details) => {
    const res = await axiosInstance.post('/bookings/estimate', { category, details });
    return res.data;
  },

  createBooking: async (bookingData) => {
    const res = await axiosInstance.post('/bookings', bookingData);
    return res.data;
  },

  getBookingStatus: async (bookingId) => {
    const res = await axiosInstance.get(`/bookings/${bookingId}/status`);
    return res.data;
  },

  getBookingById: async (bookingId) => {
    const res = await axiosInstance.get(`/bookings/${bookingId}`);
    return res.data;
  },

  getBookings: async (queryString = '') => {
    const res = await axiosInstance.get(`/bookings${queryString}`);
    return res.data;
  },

  updateBooking: async (id, updateData) => {
    const res = await axiosInstance.put(`/bookings/${id}`, updateData);
    return res.data;
  },

  cancelBooking: async (id, reason = '') => {
    const res = await axiosInstance.post(`/bookings/${id}/cancel`, { reason });
    return res.data;
  },

  // Heroes & Telemetry
  updateHeroStatus: async (statusData) => {
    const res = await axiosInstance.post('/technicians/status', statusData);
    return res.data;
  },

  getHeroProfile: async () => {
    const res = await axiosInstance.get('/technicians/profile');
    return res.data;
  },

  updateHeroProfile: async (profileData) => {
    const res = await axiosInstance.put('/technicians/profile', profileData);
    return res.data;
  },

  getTechnicianById: async (id) => {
    const res = await axiosInstance.get(`/technicians/${id}`);
    return res.data;
  },

  // Reviews
  submitReview: async (reviewData) => {
    const res = await axiosInstance.post('/reviews', reviewData);
    return res.data;
  },

  getReviews: async (techId) => {
    const res = await axiosInstance.get(`/reviews/${techId}`);
    return res.data;
  },

  // Notifications
  getNotifications: async () => {
    const res = await axiosInstance.get('/notifications');
    return res.data;
  },

  markNotificationRead: async (notifId) => {
    const res = await axiosInstance.put(`/notifications/${notifId}/read`);
    return res.data;
  },

  createPaymentOrder: async (bookingId) => {
    const res = await axiosInstance.post('/payments/create-order', { bookingId });
    return res.data;
  },

  verifyPayment: async (verificationData) => {
    const res = await axiosInstance.post('/payments/verify', verificationData);
    return res.data;
  },

  releasePaymentEscrow: async (bookingId) => {
    const res = await axiosInstance.post(`/payments/release/${bookingId}`);
    return res.data;
  },

  getAdminStats: async () => {
    const res = await axiosInstance.get('/admin/stats');
    return res.data;
  },

  getPendingHeroes: async () => {
    const res = await axiosInstance.get('/admin/heroes/pending');
    return res.data;
  },

  verifyHero: async (heroId) => {
    const res = await axiosInstance.put(`/admin/heroes/${heroId}/verify`);
    return res.data;
  },

  getAdminBookings: async () => {
    const res = await axiosInstance.get('/admin/bookings');
    return res.data;
  },

  getPricingMultipliers: async () => {
    const res = await axiosInstance.get('/admin/pricing/multipliers');
    return res.data;
  },

  updatePricingMultipliers: async (multipliers) => {
    const res = await axiosInstance.put('/admin/pricing/multipliers', multipliers);
    return res.data;
  },

  getBookingMessages: async (bookingId) => {
    const res = await axiosInstance.get(`/bookings/${bookingId}/messages`);
    return res.data;
  }
};

export default api;
