import React, { useState, useEffect } from 'react';
import { X, QrCode, ExternalLink, CheckCircle2, ShieldAlert, ArrowRight, Check, AlertCircle, Edit2 } from 'lucide-react';
import { formatINR } from '../../lib/currencyFormatters';
import { buildUpiDeepLink, generateUpiQrDataUrl, isValidUpiId } from '../../lib/upi';
import { supabase } from '../../lib/supabase';

export function UpiPayModal({
  isOpen,
  onClose,
  transfer,
  payment,
  currentUserId,
  onUpdateStatus,
  onRefreshRoom,
}) {
  const [qrDataUrl, setQrDataUrl] = useState('');
  const [showQr, setShowQr] = useState(false);
  const [customUpi, setCustomUpi] = useState('');
  const [isEditingUpi, setIsEditingUpi] = useState(false);
  const [savingUpi, setSavingUpi] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (transfer && isOpen) {
      setErrorMsg('');
      const payeeUpi = transfer.toMember?.upi_id || '';
      setCustomUpi(payeeUpi);
      setShowQr(false);

      if (payeeUpi) {
        const link = buildUpiDeepLink({
          upiId: payeeUpi,
          payeeName: transfer.toMember?.display_name,
          amountPaise: transfer.amountPaise,
          note: `RoomSplit to ${transfer.toMember?.display_name}`,
        });
        generateUpiQrDataUrl(link).then(url => setQrDataUrl(url));
      } else {
        setQrDataUrl('');
      }
    }
  }, [transfer, isOpen]);

  if (!isOpen || !transfer) return null;

  const effectiveUpi = customUpi.trim() || transfer.toMember?.upi_id || '';
  const upiDeepLink = effectiveUpi
    ? buildUpiDeepLink({
        upiId: effectiveUpi,
        payeeName: transfer.toMember?.display_name,
        amountPaise: transfer.amountPaise,
        note: `RoomSplit settlement`,
      })
    : '';

  const isPayerMe = transfer.fromMember?.user_id === currentUserId;
  const isRecipientMe = transfer.toMember?.user_id === currentUserId;

  const currentStatus = payment?.status || 'pending';
  const isMarkedPaid = currentStatus === 'payer_marked_paid';
  const isConfirmed = currentStatus === 'recipient_confirmed';

  // Save recipient UPI to their room member row
  async function handleSaveUpi() {
    if (!customUpi.trim()) return;
    if (!isValidUpiId(customUpi)) {
      setErrorMsg('Please enter a valid UPI ID (e.g. name@okhdfcbank or 9876543210@paytm)');
      return;
    }
    setSavingUpi(true);
    setErrorMsg('');
    try {
      await supabase
        .from('room_members')
        .update({ upi_id: customUpi.trim() })
        .eq('id', transfer.toMember.id);

      if (onRefreshRoom) onRefreshRoom();
      setIsEditingUpi(false);

      // Regenerate QR
      const link = buildUpiDeepLink({
        upiId: customUpi.trim(),
        payeeName: transfer.toMember?.display_name,
        amountPaise: transfer.amountPaise,
        note: `RoomSplit settlement`,
      });
      const qrUrl = await generateUpiQrDataUrl(link);
      setQrDataUrl(qrUrl);
    } catch (err) {
      setErrorMsg('Could not save UPI ID: ' + (err.message || 'Error'));
    } finally {
      setSavingUpi(false);
    }
  }

  async function handleMarkPaid() {
    setLoading(true);
    setErrorMsg('');
    try {
      await onUpdateStatus({
        fromMemberId: transfer.fromMember.id,
        toMemberId: transfer.toMember.id,
        amountPaise: transfer.amountPaise,
        newStatus: 'payer_marked_paid',
      });
      onClose();
    } catch (err) {
      setErrorMsg(err.message || 'Could not update payment status.');
    } finally {
      setLoading(false);
    }
  }

  async function handleConfirmReceived() {
    setLoading(true);
    setErrorMsg('');
    try {
      await onUpdateStatus({
        fromMemberId: transfer.fromMember.id,
        toMemberId: transfer.toMember.id,
        amountPaise: transfer.amountPaise,
        newStatus: 'recipient_confirmed',
      });
      onClose();
    } catch (err) {
      setErrorMsg(err.message || 'Could not confirm payment receipt.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-primary-container/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-sm bg-surface-container-lowest rounded-3xl p-6 shadow-2xl border border-surface-container-high text-on-surface">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-surface-container mb-4">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-secondary animate-pulse" />
            <h2 className="text-base font-bold font-headline">Direct UPI Settlement</h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-surface-container-low flex items-center justify-center text-outline hover:text-on-surface transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {errorMsg && (
          <div className="mb-3 p-3 rounded-xl bg-error-container text-on-error-container text-xs font-medium">
            {errorMsg}
          </div>
        )}

        {/* Transfer Details Card */}
        <div className="p-4 rounded-2xl bg-surface-container-low border border-surface-container flex flex-col items-center text-center mb-4">
          <span className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-1">
            Settlement Amount
          </span>
          <span className="text-3xl font-bold font-headline text-on-surface tabular-nums">
            {formatINR(transfer.amountPaise)}
          </span>

          <div className="flex items-center gap-2 mt-3 text-xs text-on-surface">
            <span className="font-semibold">{transfer.fromMember?.display_name} {isPayerMe ? '(You)' : ''}</span>
            <ArrowRight className="w-3.5 h-3.5 text-outline" />
            <span className="font-bold text-secondary">{transfer.toMember?.display_name} {isRecipientMe ? '(You)' : ''}</span>
          </div>

          {/* Payee UPI ID configuration */}
          <div className="mt-3 w-full">
            {isEditingUpi || !effectiveUpi ? (
              <div className="flex flex-col gap-1.5 w-full">
                <div className="flex gap-1.5">
                  <input
                    type="text"
                    placeholder="Enter UPI ID (e.g. name@sbi)"
                    value={customUpi}
                    onChange={e => setCustomUpi(e.target.value)}
                    className="flex-1 h-9 px-3 rounded-xl bg-white border border-outline-variant text-xs outline-none focus:border-secondary font-mono"
                  />
                  <button
                    onClick={handleSaveUpi}
                    disabled={savingUpi}
                    className="h-9 px-3 bg-secondary text-white rounded-xl text-xs font-bold flex items-center gap-1 active:scale-95"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Save</span>
                  </button>
                </div>
                <span className="text-[10px] text-on-surface-variant text-left">
                  Enter {transfer.toMember?.display_name}'s UPI ID to generate payment link & QR
                </span>
              </div>
            ) : (
              <div className="flex items-center justify-center gap-2">
                <span className="px-3 py-1 bg-surface-container rounded-full text-[11px] font-mono text-on-surface font-medium">
                  UPI: {effectiveUpi}
                </span>
                <button
                  onClick={() => setIsEditingUpi(true)}
                  className="p-1 rounded-md text-outline hover:text-secondary text-[11px]"
                  title="Edit UPI ID"
                >
                  <Edit2 className="w-3 h-3" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Action: Open in App or Show QR */}
        {effectiveUpi ? (
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
        ) : (
          <div className="mb-4 p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs text-center">
            <AlertCircle className="w-4 h-4 text-amber-700 mx-auto mb-1" />
            <span>Please enter {transfer.toMember?.display_name}'s UPI ID above to open Google Pay, PhonePe, or generate a QR code.</span>
          </div>
        )}

        {/* QR Code view */}
        {showQr && qrDataUrl && (
          <div className="p-4 bg-white rounded-2xl border border-surface-container flex flex-col items-center justify-center mb-4 animate-in fade-in duration-200">
            <img src={qrDataUrl} alt="UPI QR Code" className="w-48 h-48 rounded-lg" />
            <p className="text-[11px] text-on-surface-variant mt-2 text-center font-medium">
              Scan with any phone camera or UPI app
            </p>
          </div>
        )}

        {/* Peer-to-Peer Confirmation Status */}
        <div className="border-t border-surface-container pt-3 space-y-2.5">
          <div className="flex items-center gap-1.5 text-[11px] text-on-surface-variant">
            <ShieldAlert className="w-3.5 h-3.5 text-amber-600 flex-shrink-0" />
            <span>UPI transfers go directly from bank to bank with 0% fee.</span>
          </div>

          {/* If already confirmed */}
          {isConfirmed ? (
            <div className="p-3 bg-emerald-50 text-emerald-800 rounded-xl border border-emerald-200 text-xs font-semibold flex items-center justify-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>This settlement has been verified & completed!</span>
            </div>
          ) : (
            <>
              {/* Payer button */}
              {isPayerMe && (
                <button
                  type="button"
                  disabled={loading || isMarkedPaid}
                  onClick={handleMarkPaid}
                  className={`w-full h-11 font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-all active:scale-95 ${
                    isMarkedPaid
                      ? 'bg-amber-100 text-amber-800 border border-amber-300'
                      : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-md'
                  }`}
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{isMarkedPaid ? '✓ You Marked this as Paid' : 'I Have Sent the Payment'}</span>
                </button>
              )}

              {/* Recipient button */}
              {isRecipientMe && (
                <button
                  type="button"
                  disabled={loading}
                  onClick={handleConfirmReceived}
                  className="w-full h-11 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-all shadow-md active:scale-95"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Confirm Received in Bank Account</span>
                </button>
              )}

              {/* Notice when marked paid */}
              {isMarkedPaid && !isRecipientMe && (
                <p className="text-[11px] text-amber-700 text-center font-medium">
                  Payment marked sent. Awaiting {transfer.toMember?.display_name}'s receipt confirmation.
                </p>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
