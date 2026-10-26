import api from './api';

export const savingsService = {
  async getGoals(status) {
    const res = await api.get('/savings-goals', {
      params: status ? { status } : {},
    });
    return res.data;
  },

  async getGoal(id) {
    const res = await api.get(`/savings-goals/${id}`);
    return res.data;
  },

  async createGoal(data) {
    const res = await api.post('/savings-goals', data);
    return res.data;
  },

  async updateGoal(id, data) {
    const res = await api.put(`/savings-goals/${id}`, data);
    return res.data;
  },

  async deleteGoal(id) {
    await api.delete(`/savings-goals/${id}`);
  },

  async addContribution(goalId, data) {
    const res = await api.post(`/savings-goals/${goalId}/contributions`, data);
    return res.data;
  },

  async getContributions(goalId) {
    const res = await api.get(`/savings-goals/${goalId}/contributions`);
    return res.data;
  },
};
