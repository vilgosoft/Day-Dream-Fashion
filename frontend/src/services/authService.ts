import api from './api';

export const authService = {
  login: (phone: string) => api.post('/auth/login', { phone }),
  register: (data: { name: string; email: string; phone: string }) =>
    api.post('/auth/register', data),
  getProfile: () => api.get('/auth/profile'),
};
