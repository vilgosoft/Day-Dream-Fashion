import api from './api';

export interface CreateOrderData {
  shipping_address: Record<string, string>;
  billing_address?: Record<string, string>;
  notes?: string;
}

export const orderService = {
  create: (data: CreateOrderData) => api.post('/orders', data),
  getAll: () => api.get('/orders'),
  getById: (id: number) => api.get(`/orders/${id}`),
  verifyPayment: (data: {
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
  }) => api.post('/payment/verify', data),
};
