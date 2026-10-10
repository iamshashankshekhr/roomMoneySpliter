/**
 * Currency & Time Formatters
 * Invariant: All financial amounts in business logic are integers representing paise (1 INR = 100 paise).
 */

export function paiseToRupees(paise) {
  if (typeof paise !== 'number' || isNaN(paise)) return 0;
  return paise / 100;
}

export function rupeesToPaise(rupees) {
  const num = typeof rupees === 'string' ? parseFloat(rupees) : rupees;
  if (isNaN(num)) return 0;
  return Math.round(num * 100);
}

export function formatINR(paise, options = {}) {
  const { showSign = false, absolute = false } = options;
  const numPaise = typeof paise === 'number' ? paise : 0;
  const absPaise = Math.abs(numPaise);
  const rupees = absPaise / 100;

  const formatted = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(rupees);

  if (absolute) return formatted;
  if (numPaise > 0 && showSign) return `+${formatted}`;
  if (numPaise < 0) return `-${formatted}`;
  return formatted;
}

export function formatCompactINR(paise) {
  const rupees = Math.abs(paise || 0) / 100;
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(rupees);
}

export const CATEGORIES = {
  groceries: {
    id: 'groceries',
    label: 'Groceries',
    icon: 'shopping_cart',
    bg: 'bg-emerald-50 text-emerald-600',
    border: 'border-emerald-200',
  },
  utilities: {
    id: 'utilities',
    label: 'Utilities',
    icon: 'bolt',
    bg: 'bg-amber-50 text-amber-600',
    border: 'border-amber-200',
  },
  household: {
    id: 'household',
    label: 'Household',
    icon: 'cleaning_services',
    bg: 'bg-blue-50 text-blue-600',
    border: 'border-blue-200',
  },
  dining: {
    id: 'dining',
    label: 'Dining',
    icon: 'restaurant',
    bg: 'bg-rose-50 text-rose-600',
    border: 'border-rose-200',
  },
  maintenance: {
    id: 'maintenance',
    label: 'Maintain',
    icon: 'handyman',
    bg: 'bg-purple-50 text-purple-600',
    border: 'border-purple-200',
  },
  entertainment: {
    id: 'entertainment',
    label: 'Leisure',
    icon: 'movie',
    bg: 'bg-indigo-50 text-indigo-600',
    border: 'border-indigo-200',
  },
};

export function getCategoryMeta(categoryId) {
  return CATEGORIES[categoryId] || CATEGORIES.groceries;
}

export function formatRelativeTime(dateString) {
  if (!dateString) return 'Just now';
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays}d ago`;

  return date.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
}
