const API_BASE = 'http://localhost:5000/api';

export const api = {
  // Transactions
  getTransactions: async () => {
    const res = await fetch(`${API_BASE}/transactions`);
    if (!res.ok) throw new Error('Failed to fetch transactions');
    return res.json();
  },

  createTransaction: async (data) => {
    const res = await fetch(`${API_BASE}/transactions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to create transaction');
    return res.json();
  },

  updateTransaction: async (id, data) => {
    const res = await fetch(`${API_BASE}/transactions/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to update transaction');
    return res.json();
  },

  deleteTransaction: async (id) => {
    const res = await fetch(`${API_BASE}/transactions/${id}`, {
      method: 'DELETE',
    });
    if (!res.ok) throw new Error('Failed to delete transaction');
    return res.json();
  },

  // Budgets
  getBudgets: async () => {
    const res = await fetch(`${API_BASE}/budgets`);
    if (!res.ok) throw new Error('Failed to fetch budgets');
    return res.json();
  },

  saveBudget: async (data) => {
    const res = await fetch(`${API_BASE}/budgets`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to save budget');
    return res.json();
  },

  // AI Insights
  getAIInsights: async () => {
    const res = await fetch(`${API_BASE}/ai/insights`);
    if (!res.ok) throw new Error('Failed to get AI insights');
    return res.json();
  },

  // PDF Export Link
  getPDFExportUrl: () => {
    return `${API_BASE}/reports/pdf`;
  }
};
