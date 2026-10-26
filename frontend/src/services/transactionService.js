import api from './api';

export const transactionService = {
  async getTransactions(params = {}) {
    const res = await api.get('/transactions', { params });
    return res.data;
  },

  async getTransaction(id) {
    const res = await api.get(`/transactions/${id}`);
    return res.data;
  },

  async createTransaction(data) {
    const res = await api.post('/transactions', data);
    return res.data;
  },

  async updateTransaction(id, data) {
    const res = await api.put(`/transactions/${id}`, data);
    return res.data;
  },

  async deleteTransaction(id) {
    await api.delete(`/transactions/${id}`);
  },

  async exportCsv(params = {}) {
    const res = await api.get('/transactions/export/csv', {
      params,
      responseType: 'blob',
    });
    const url = window.URL.createObjectURL(new Blob([res.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'spendly_transactions.csv');
    document.body.appendChild(link);
    link.click();
    link.remove();
  },
};
