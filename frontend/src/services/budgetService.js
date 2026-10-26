import api from './api';

export const budgetService = {
  async getBudgets(month, year) {
    const res = await api.get('/budgets', {
      params: { month, year },
    });
    return res.data;
  },

  async createBudget(data) {
    const res = await api.post('/budgets', data);
    return res.data;
  },

  async updateBudget(id, data) {
    const res = await api.put(`/budgets/${id}`, data);
    return res.data;
  },

  async deleteBudget(id) {
    await api.delete(`/budgets/${id}`);
  },
};
