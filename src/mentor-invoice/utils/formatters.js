/**
 * Utility formatters adhering to Zen portal standards
 */

export const formatCurrency = (amount) => {
  if (amount === undefined || amount === null || isNaN(amount)) return '₹0';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
};

export const formatHours = (hours) => {
  if (hours === undefined || hours === null || isNaN(hours)) return '0.0';
  return (Math.round(hours * 10) / 10).toFixed(1);
};

export const formatSecondsToHours = (seconds) => {
  if (!seconds || seconds <= 0) return '0.0';
  return formatHours(seconds / 3600);
};

export const formatDate = (timestamp) => {
  if (!timestamp) return '-';
  const d = new Date(timestamp * 1000);
  return d.toLocaleDateString('en-US', {
    month: 'numeric',
    day: 'numeric',
    year: 'numeric',
  });
};

export const formatDateTime = (timestamp) => {
  if (!timestamp) return '-';
  const d = new Date(timestamp * 1000);
  return d.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};
