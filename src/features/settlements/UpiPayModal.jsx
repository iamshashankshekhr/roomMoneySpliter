import React, { useState, useEffect } from 'react';
import { X, QrCode, ExternalLink, CheckCircle2, ShieldAlert, ArrowRight } from 'lucide-react';
import { formatINR } from '../../lib/formatters';
import { buildUpiDeepLink, generateUpiQrDataUrl } from '../../lib/upi';

export function UpiPayModal({
  isOpen,
  onClose,
  transfer,
  currentUserId,
  onUpdateStatus,
}) {
  const [qrDataUrl, setQrDataUrl] = useState('');
  const [showQr, setShowQr] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (transfer && isOpen) {
      const payeeUpi = transfer.toMember?.upi_id || 'roommate@upi';
      const upiLink = buildUpiDeepLink({
        upiId: payeeUpi,
        payeeName: transfer.toMember?.display_name,
        amountPaise: transfer.amountPaise,
        note: `RoomSplit to ${transfer.toMember?.display_name}`,
      });

      generateUpiQrDataUrl(upiLink).then(url => {
        setQrDataUrl(url);
      });
    }
  }, [transfer, isOpen]);

  if (!isOpen || !transfer) return null;

  const payeeUpi = transfer.toMember?.upi_id || 'roommate@upi';
  const upiDeepLink = buildUpiDeepLink({
    upiId: payeeUpi,
    payeeName: transfer.toMember?.display_name,
    amountPaise: transfer.amountPaise,
    note: `RoomSplit settlement`,
  });

  const isPayerMe = transfer.fromMember?.user_id === currentUserId;
  const isRecipientMe = transfer.toMember?.user_id === currentUserId;

  async function handleMarkPaid() {
    setLoading(true);
    await onUpdateStatus({
      fromMemberId: transfer.fromMember.id,
      toMemberId: transfer.toMember.id,
      amountPaise: transfer.amountPaise,
      newStatus: 'payer_marked_paid',
    });
    setLoading(false);
    onClose();
  }

  async function handleConfirmReceived() {
    setLoading(true);
    await onUpdateStatus({
      fromMemberId: transfer.fromMember.id,
      toMemberId: transfer.toMember.id,
      amountPaise: transfer.amountPaise,
      newStatus: 'recipient_confirmed',
    });
    setLoading(false);
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-primary-container/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-sm bg-surface-container-lowest rounded-3xl p-6 shadow-2xl border border-surface-container-high text-on-surface">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-surface-container mb-4">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-secondary animate-pulse" />
            <h2 className="text-base font-bold font-headline">UPI Settlement</h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-surface-container-low flex items-center justify-center text-outline hover:text-on-surface transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Transfer Details Card */}
        <div className="p-4 rounded-2xl bg-surface-container-low border border-surface-container flex flex-col items-center text-center mb-4">
          <span className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-1">
            Settlement Amount
          </span>
          <span className="text-3xl font-bold font-headline text-on-surface tabular-nums">
            {formatINR(transfer.amountPaise)}
          </span>

          <div className="flex items-center gap-2 mt-3 text-xs text-on-surface">
            <span className="font-semibold">{transfer.fromMember?.display_name}</span>
            <ArrowRight className="w-3.5 h-3.5 text-outline" />
            <span className="font-bold text-secondary">{transfer.toMember?.display_name}</span>
          </div>

          <div className="mt-2 px-3 py-1 bg-surface-container rounded-full text-[11px] font-mono text-on-surface-variant">
            UPI: {payeeUpi}
          </div>
        </div>

        {/* Action: Open in App or Show QR */}
        <div className="space-y-2 mb-4">
          <a
            href={upiDeepLink}
            className="w-full h-12 bg-secondary hover:bg-secondary-container text-on-secondary font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-all shadow-md active:scale-95"
          >
            <ExternalLink className="w-4 h-4" />
            <span>Open in GPay / PhonePe / Paytm</span>
          </a>

          <button
            type="button"
            onClick={() => setShowQr(!showQr)}
            className="w-full h-11 bg-surface-container hover:bg-surface-container-high text-on-surface font-semibold text-xs rounded-xl flex items-center justify-center gap-2 transition-all"
          >
            <QrCode className="w-4 h-4" />
            <span>{showQr ? 'Hide QR Code' : 'Display QR Code to Scan'}</span>
          </button>
        </div>

        {/* QR Code view */}
        {showQr && (
          <div className="p-4 bg-white rounded-2xl border border-surface-container flex flex-col items-center justify-center mb-4 animate-in fade-in duration-200">
            {qrDataUrl ? (
              <img src={qrDataUrl} alt="UPI QR Code" className="w-48 h-48 rounded-lg" />
            ) : (
              <div className="w-48 h-48 flex items-center justify-center text-xs text-outline">Generating QR...</div>
            )}
            <p className="text-[11px] text-on-surface-variant mt-2 text-center">
              Scan with any UPI application on your phone
            </p>
          </div>
        )}

        {/* Status Acknowledgment Buttons (FR-PAY-04 & FR-PAY-05) */}
        <div className="border-t border-surface-container pt-3 space-y-2">
          <div className="flex items-center gap-1.5 text-[11px] text-on-surface-variant mb-1">
            <ShieldAlert className="w-3.5 h-3.5 text-amber-600 flex-shrink-0" />
            <span>Opening UPI does not automatically confirm payment.</span>
          </div>

          <button
            type="button"
            disabled={loading}
            onClick={handleMarkPaid}
            className="w-full h-10 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-semibold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-all border border-emerald-200"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Mark as Paid by Payer</span>
          </button>

          <button
            type="button"
            disabled={loading}
            onClick={handleConfirmReceived}
            className="w-full h-10 bg-surface-container-low hover:bg-surface-container text-on-surface font-semibold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-all"
          >
            <CheckCircle2 className="w-4 h-4 text-secondary" />
            <span>Confirm Received (Recipient)</span>
          </button>
        </div>
      </div>
    </div>
  );
}
