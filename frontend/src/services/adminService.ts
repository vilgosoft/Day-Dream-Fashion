import api from './api';

export const adminService = {
  login: (email: string, password: string) =>
    api.post('/admin/auth/login', { email, password }),

  // Users
  getUsers: (page?: number) => api.get('/admin/users', { params: { page } }),
  updateUserStatus: (id: number, status: string) =>
    api.put(`/admin/users/${id}`, { status }),

  // Categories
  getCategories: () => api.get('/admin/categories'),
  createCategory: (data: FormData) => api.post('/admin/categories', data, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  updateCategory: (id: number, data: FormData) => api.put(`/admin/categories/${id}`, data, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  deleteCategory: (id: number) => api.delete(`/admin/categories/${id}`),

  // Products
  getProducts: (page?: number) => api.get('/admin/products', { params: { page } }),
  createProduct: (data: FormData) => api.post('/admin/products', data, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  updateProduct: (id: number, data: FormData) => api.put(`/admin/products/${id}`, data, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  deleteProduct: (id: number) => api.delete(`/admin/products/${id}`),

  // Orders
  getOrders: (page?: number) => api.get('/admin/orders', { params: { page } }),
  updateOrderStatus: (id: number, status: string) =>
    api.put(`/admin/orders/${id}`, { status }),

  // Inventory
  getInventory: (page?: number) => api.get('/admin/inventory', { params: { page } }),
  updateStock: (variationId: number, stockQuantity: number) =>
    api.put(`/admin/inventory/${variationId}`, { stock_quantity: stockQuantity }),
};
