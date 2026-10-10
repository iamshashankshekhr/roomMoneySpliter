import QRCode from 'qrcode';

/**
 * Builds standard UPI deep link matching NPCI specification
 * Format: upi://pay?pa={vpa}&pn={name}&am={amount}&cu=INR&tn={note}&tr={ref}
 *
 * Supports scheme: 'upi' | 'gpay' | 'tez' | 'phonepe' | 'paytm' | 'bhim'
 */
export function buildUpiDeepLink({
  upiId,
  payeeName = 'Roommate',
  amountPaise,
  note = 'RoomSplit',
  scheme = 'upi',
}) {
  if (!upiId) return '';

  const cleanUpiId = upiId.trim();
  // Strip non-alphanumeric chars (keep letters, digits, single space) to avoid bank parser errors
  const sanitizedName = (payeeName || 'Roommate')
    .replace(/[^a-zA-Z0-9 ]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 30);
  const cleanName = encodeURIComponent(sanitizedName || 'Roommate');

  const rupeesAmount =
    amountPaise != null && amountPaise > 0 ? (amountPaise / 100).toFixed(2) : '';

  const sanitizedNote = (note || 'RoomSplit')
    .replace(/[^a-zA-Z0-9 ]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 30);
  const cleanNote = encodeURIComponent(sanitizedNote || 'RoomSplit');

  // Transaction reference ID is required by several bank gateways to process browser intents
  const tr = `RS${Date.now()}`;

  let query = `pa=${cleanUpiId}&pn=${cleanName}&cu=INR&tn=${cleanNote}&tr=${tr}`;
  if (rupeesAmount && Number(rupeesAmount) > 0) {
    query += `&am=${rupeesAmount}`;
  }

  switch (scheme) {
    case 'gpay':
    case 'tez':
      return `tez://upi/pay?${query}`;
    case 'phonepe':
      return `phonepe://pay?${query}`;
    case 'paytm':
      return `paytmmp://pay?${query}`;
    case 'bhim':
      return `bhim://pay?${query}`;
    case 'upi':
    default:
      return `upi://pay?${query}`;
  }
}

/**
 * Generates QR Code data URL for the UPI link.
 * QR codes are treated by NPCI as trusted camera scans, bypassing browser intent blocks.
 */
export async function generateUpiQrDataUrl(upiString) {
  if (!upiString) return '';
  try {
    return await QRCode.toDataURL(upiString, {
      width: 320,
      margin: 2,
      color: {
        dark: '#0b1c30',
        light: '#ffffff',
      },
      errorCorrectionLevel: 'M',
    });
  } catch (err) {
    console.error('Failed to generate UPI QR code:', err);
    return '';
  }
}

/**
 * Validates basic UPI VPA format: e.g. name@bank or 9876543210@paytm
 */
export function isValidUpiId(upiId) {
  if (!upiId || typeof upiId !== 'string') return false;
  const regex = /^[\w.\-_]{2,256}@[a-zA-Z0-9]{2,64}$/;
  return regex.test(upiId.trim());
}
