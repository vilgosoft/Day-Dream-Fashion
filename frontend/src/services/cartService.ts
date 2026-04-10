import api from './api';

export const cartService = {
  getCart: () => api.get('/cart'),
  addItem: (productVariationId: number, quantity: number) =>
    api.post('/cart', { product_variation_id: productVariationId, quantity }),
  updateItem: (cartItemId: number, quantity: number) =>
    api.put(`/cart/${cartItemId}`, { quantity }),
  removeItem: (cartItemId: number) => api.delete(`/cart/${cartItemId}`),
  clearCart: () => api.delete('/cart'),
};
