import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

const api = axios.create({
  baseURL: API_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('erp_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const auth = {
  login: (credentials: { email: string; password?: string }) => api.post('/auth/login', credentials),
};

export const customers = {
  getAll: (params?: any) => api.get('/customers', { params }),
  getById: (id: string | number) => api.get(`/customers/${id}`),
  create: (data: any) => api.post('/customers', data),
  update: (id: string | number, data: any) => api.put(`/customers/${id}`, data),
  addNote: (id: string | number, note: string) => api.post(`/customers/${id}/notes`, { note }),
};

export const products = {
  getAll: (params?: any) => api.get('/products', { params }),
  getById: (id: string | number) => api.get(`/products/${id}`),
  create: (data: any) => api.post('/products', data),
  update: (id: string | number, data: any) => api.put(`/products/${id}`, data),
  adjustStock: (id: string | number, data: { quantity_changed: number; movement_type: 'IN' | 'OUT'; reason: string }) =>
    api.post(`/products/${id}/stock`, data),
  getMovements: (id?: string | number) => api.get(id ? `/products/${id}/movements` : '/products/movements'),
};

export const challans = {
  getAll: (params?: any) => api.get('/challans', { params }),
  getById: (id: string | number) => api.get(`/challans/${id}`),
  create: (data: any) => api.post('/challans', data),
  confirm: (id: string | number) => api.put(`/challans/${id}/confirm`),
  cancel: (id: string | number) => api.put(`/challans/${id}/cancel`),
};

export const dashboard = {
  getStats: () => api.get('/dashboard/stats'),
};

export default api;
