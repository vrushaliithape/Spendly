import api from './api';

export const authService = {
  async register(data) {
    const res = await api.post('/auth/register', data);
    if (res.data.token) {
      localStorage.setItem('spendly_token', res.data.token);
      localStorage.setItem('spendly_user', JSON.stringify(res.data));
    }
    return res.data;
  },

  async login(data) {
    const res = await api.post('/auth/login', data);
    if (res.data.token) {
      localStorage.setItem('spendly_token', res.data.token);
      localStorage.setItem('spendly_user', JSON.stringify(res.data));
    }
    return res.data;
  },

  async getCurrentUser() {
    const res = await api.get('/auth/me');
    return res.data;
  },

  logout() {
    localStorage.removeItem('spendly_token');
    localStorage.removeItem('spendly_user');
  },

  getCurrentUserFromStorage() {
    const userStr = localStorage.getItem('spendly_user');
    try {
      return userStr ? JSON.parse(userStr) : null;
    } catch (e) {
      return null;
    }
  },

  getToken() {
    return localStorage.getItem('spendly_token');
  },
};
