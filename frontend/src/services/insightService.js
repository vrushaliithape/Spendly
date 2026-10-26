import api from './api';

export const insightService = {
  async getInsights(month, year) {
    const res = await api.get('/insights', {
      params: { month, year },
    });
    return res.data;
  },
};
