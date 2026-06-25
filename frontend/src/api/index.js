import api from './axios';

// ─── Auth ─────────────────────────────────────────────────────────────────────
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  logout: () => api.post('/auth/logout'),
  refresh: () => api.post('/auth/refresh'),
  me: () => api.get('/auth/me'),
};

// ─── Salons ───────────────────────────────────────────────────────────────────
export const salonsAPI = {
  getAll: (params) => api.get('/salons', { params }),
  getOne: (id) => api.get(`/salons/${id}`),
  create: (data) => api.post('/salons', data),
  update: (id, data) => api.put(`/salons/${id}`, data),
};

// ─── Services ─────────────────────────────────────────────────────────────────
export const servicesAPI = {
  getBySalon: (salonId) => api.get(`/salons/${salonId}/services`),
  create: (salonId, data) => api.post(`/salons/${salonId}/services`, data),
  update: (id, data) => api.put(`/services/${id}`, data),
  delete: (id) => api.delete(`/services/${id}`),
};

// ─── Staff ────────────────────────────────────────────────────────────────────
export const staffAPI = {
  getBySalon: (salonId) => api.get(`/salons/${salonId}/staff`),
  create: (salonId, data) => api.post(`/salons/${salonId}/staff`, data),
};

// ─── Bookings ─────────────────────────────────────────────────────────────────
export const bookingsAPI = {
  getAvailability: (salonId, params) => api.get(`/salons/${salonId}/availability`, { params }),
  create: (data) => api.post('/bookings', data),
  myBookings: () => api.get('/bookings/me'),
  cancel: (id, reason) => api.patch(`/bookings/${id}/cancel`, { reason }),
  reschedule: (id, data) => api.patch(`/bookings/${id}/reschedule`, data),
  pay: (id, paymentData) => api.patch(`/bookings/${id}/pay`, paymentData),
};

// ─── Reviews ──────────────────────────────────────────────────────────────────
export const reviewsAPI = {
  getBySalon: (salonId) => api.get(`/salons/${salonId}/reviews`),
  create: (bookingId, data) => api.post(`/bookings/${bookingId}/review`, data),
};

// ─── Owner / Analytics ────────────────────────────────────────────────────────
export const ownerAPI = {
  getMySalon: () => api.get('/owner/my-salon'),
  getBookings: (salonId, params) => api.get(`/salons/${salonId}/bookings`, { params }),
  getAnalytics: (salonId) => api.get(`/owner/analytics/${salonId}`),
  updateSalon: (id, data) => api.put(`/salons/${id}`, data),
  uploadImages: (salonId, formData) =>
    api.post(`/salons/${salonId}/images`, formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  createService: (salonId, data) => api.post(`/salons/${salonId}/services`, data),
  updateService: (id, data) => api.put(`/services/${id}`, data),
  deleteService: (id) => api.delete(`/services/${id}`),
  createStaff: (salonId, data) =>
    api.post(`/salons/${salonId}/staff`, data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  updateStaff: (id, data) => api.put(`/staff/${id}`, data),
  deleteStaff: (id) => api.delete(`/staff/${id}`),
};

