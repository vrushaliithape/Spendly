import api from './api';

export const settingsService = {
  async getSettings() {
    const res = await api.get('/settings');
    return res.data;
  },

  async updateProfile(data) {
    const res = await api.put('/settings/profile', data);
    return res.data;
  },

  async changePassword(data) {
    const res = await api.put('/settings/password', data);
    return res.data;
  },
};
