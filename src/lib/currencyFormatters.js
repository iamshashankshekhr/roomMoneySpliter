/**
 * Formats integer paise into localized INR currency strings
 * e.g. 184000 paise -> ₹1,840.00
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
