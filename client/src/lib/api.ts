import axios from 'axios';

const api = axios.create({
  baseURL: 'http://0.0.0.0:5000/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authApi = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  verifyEmail: (token) => api.get(`/auth/verify/${token}`),
  resetPassword: (data) => api.post('/auth/reset-password', data)
};

export const productsApi = {
  getAll: () => api.get('/products'),
  getById: (id) => api.get(`/products/${id}`),
  create: (product) => api.post('/products', product),
  update: (id, product) => api.put(`/products/${id}`, product),
  delete: (id) => api.delete(`/products/${id}`)
};

export const vendorsApi = {
  getAll: () => api.get('/vendors'),
  getById: (id) => api.get(`/vendors/${id}`),
  create: (vendor) => api.post('/vendors', vendor),
  update: (id, vendor) => api.put(`/vendors/${id}`, vendor)
};

export const ordersApi = {
  create: (order) => api.post('/orders', order),
  getByUser: (userId) => api.get(`/orders/user/${userId}`),
  updateStatus: (id, status) => api.patch(`/orders/${id}/status`, { status })
};

export default api;