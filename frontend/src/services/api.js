import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Create Axios Instance
const axiosInstance = axios.create({
  baseURL: API_URL,
  withCredentials: true,
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

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Response Interceptor for handling token expiration & structured errors
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If unauthorized (401) and we haven't already retried
    if (error.response && error.response.status === 401 && !originalRequest._retry) {
      // If we are trying to login, register, verify-otp or refresh itself, don't auto-refresh
      const url = originalRequest.url || '';
      if (
        url.includes('/auth/login') ||
        url.includes('/auth/register') ||
        url.includes('/auth/verify-otp') ||
        url.includes('/auth/refresh')
      ) {
        return Promise.reject(error);
      }

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return axiosInstance(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const res = await axiosInstance.post('/auth/refresh');
        const { token } = res.data;

        localStorage.setItem('token', token);
        originalRequest.headers.Authorization = `Bearer ${token}`;

        processQueue(null, token);
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        // Refresh token is expired or invalid -> logout user
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        
        // Force redirect to login page
        window.location.href = '/login';
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
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

  getAdminUsers: async (role = '') => {
    const res = await axiosInstance.get(`/admin/users${role ? `?role=${role}` : ''}`);
    return res.data;
  },

  updateUserStatus: async (userId, isVerified) => {
    const res = await axiosInstance.put(`/admin/users/${userId}/status`, { isVerified });
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
  },

  getUserProfile: async () => {
    const res = await axiosInstance.get('/auth/profile');
    return res.data;
  },

  updateUserProfile: async (profileData) => {
    const res = await axiosInstance.put('/auth/profile', profileData);
    return res.data;
  },

  uploadFile: async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    const res = await axiosInstance.post('/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return res.data;
  },

  getAvailableBookings: async () => {
    const res = await axiosInstance.get('/bookings?available=true');
    return res.data;
  },

  respondToBooking: async (bookingId, response, note = '') => {
    const res = await axiosInstance.post(`/bookings/${bookingId}/technician-response`, { response, note });
    return res.data;
  }
};

export default api;
