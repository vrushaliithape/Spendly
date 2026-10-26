export const formatCurrency = (amount, currency = 'INR') => {
  if (amount === undefined || amount === null) return '₹0.00';

  const num = typeof amount === 'number' ? amount : parseFloat(amount);
  if (isNaN(num)) return '₹0.00';

  const currencyMap = {
    INR: { locale: 'en-IN', currency: 'INR' },
    USD: { locale: 'en-US', currency: 'USD' },
    EUR: { locale: 'de-DE', currency: 'EUR' },
    GBP: { locale: 'en-GB', currency: 'GBP' },
  };

  const config = currencyMap[currency] || currencyMap.INR;

  try {
    return new Intl.NumberFormat(config.locale, {
      style: 'currency',
      currency: config.currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(num);
  } catch (e) {
    return `₹${num.toFixed(2)}`;
  }
};

export const formatDate = (dateStr) => {
  if (!dateStr) return '';
  try {
    const [year, month, day] = dateStr.split('-');
    const date = new Date(year, parseInt(month) - 1, day);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  } catch (e) {
    return dateStr;
  }
};

export const formatPercentage = (value) => {
  if (value === undefined || value === null || isNaN(value)) return '0.0%';
  const num = typeof value === 'number' ? value : parseFloat(value);
  return `${num.toFixed(1)}%`;
};
