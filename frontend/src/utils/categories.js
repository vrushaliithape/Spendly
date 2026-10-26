export const EXPENSE_CATEGORIES = [
  'Food',
  'Travel',
  'Shopping',
  'Bills',
  'Entertainment',
  'Education',
  'Health',
  'Groceries',
  'Rent',
  'Personal Care',
  'Other',
];

export const INCOME_CATEGORIES = [
  'Salary',
  'Freelance',
  'Investments',
  'Business',
  'Gifts',
  'Allowance',
  'Other',
];

export const PAYMENT_METHODS = [
  'UPI',
  'Credit Card',
  'Debit Card',
  'Net Banking',
  'Cash',
  'Other',
];

export const CATEGORY_COLORS = {
  Food: '#f59e0b',
  Travel: '#0ea5e9',
  Shopping: '#ec4899',
  Bills: '#ef4444',
  Entertainment: '#8b5cf6',
  Education: '#3b82f6',
  Health: '#10b981',
  Groceries: '#84cc16',
  Rent: '#6366f1',
  'Personal Care': '#14b8a6',
  Salary: '#10b981',
  Freelance: '#06b6d4',
  Investments: '#3b82f6',
  Business: '#8b5cf6',
  Other: '#94a3b8',
};

export const getCategoryColor = (category) => {
  return CATEGORY_COLORS[category] || '#64748b';
};
