import api from './api';

export const dashboardService = {
  async getSummary(month, year) {
    const res = await api.get('/dashboard/summary', {
      params: { month, year },
    });
    return res.data;
  },

  async getCategoryBreakdown(month, year) {
    const res = await api.get('/dashboard/category-breakdown', {
      params: { month, year },
    });
    return res.data;
  },

  async getMonthlyCashFlow(months = 6) {
    const res = await api.get('/dashboard/monthly-cashflow', {
      params: { months },
    });
    return res.data;
  },

  async getRecentTransactions() {
    const res = await api.get('/dashboard/recent-transactions');
    return res.data;
  },
};
