import QRCode from 'qrcode';

/**
 * Builds standard UPI deep link matching NPCI specification
 * Format: upi://pay?pa={vpa}&pn={name}&am={amount}&cu=INR&tn={note}
 */
export function buildUpiDeepLink({ upiId, payeeName, amountPaise, note = 'RoomSplit Settlement' }) {
  if (!upiId) return '';

  const cleanUpiId = upiId.trim();
  const cleanName = encodeURIComponent((payeeName || 'Roommate').trim());
  const rupeesAmount = (amountPaise / 100).toFixed(2);
  const cleanNote = encodeURIComponent(note.slice(0, 50));

  return `upi://pay?pa=${cleanUpiId}&pn=${cleanName}&am=${rupeesAmount}&cu=INR&tn=${cleanNote}`;
}

/**
 * Generates QR Code data URL for the UPI link
 */
export async function generateUpiQrDataUrl(upiString) {
  if (!upiString) return '';
  try {
    return await QRCode.toDataURL(upiString, {
      width: 280,
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
 * Validates basic UPI VPA format: e.g. name@bank
 */
export function isValidUpiId(upiId) {
  if (!upiId || typeof upiId !== 'string') return false;
  const regex = /^[\w.\-_]{2,256}@[a-zA-Z]{2,64}$/;
  return regex.test(upiId.trim());
}
