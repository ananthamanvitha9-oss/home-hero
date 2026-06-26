import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Service estimation (price rules)
export const getEstimate = async () => {
  const response = await api.get('/bookings/estimate');
  return response.data;
};

// Create a new booking
export const createBooking = async (bookingData) => {
  const response = await api.post('/bookings', bookingData);
  return response.data;
};

// Technician pending bookings
export const getTechnicianBookings = async () => {
  const response = await api.get('/bookings', {
    params: { status: 'pending', role: 'technician' },
  });
  return response.data;
};

// Technician accept/reject response
export const respondBooking = async (bookingId, action) => {
  const response = await api.post(`/bookings/${bookingId}/technician-response`, {
    action,
  });
  return response.data;
};

// Admin analytics
export const getAdminAnalytics = async (params = {}) => {
  const response = await api.get('/bookings/admin/analytics', { params });
  return response.data;
};

export default api;
