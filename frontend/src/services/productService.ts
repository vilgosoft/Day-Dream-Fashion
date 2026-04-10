import api from './api';

export interface ProductFilters {
  category?: string;
  size?: string;
  color?: string;
  min_price?: number;
  max_price?: number;
  page?: number;
  limit?: number;
}

export const productService = {
  getAll: (filters?: ProductFilters) => api.get('/products', { params: filters }),
  getBySlug: (slug: string) => api.get(`/products/${slug}`),
  getFeatured: () => api.get('/products', { params: { featured: true } }),
  getTrending: () => api.get('/products', { params: { trending: true } }),
};
