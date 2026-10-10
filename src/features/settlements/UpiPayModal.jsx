import React, { useState, useEffect } from 'react';
import {
  X,
  QrCode,
  ExternalLink,
  CheckCircle2,
  ShieldAlert,
  ArrowRight,
  Check,
  AlertCircle,
  Edit2,
  Copy,
  CheckCheck,
  Smartphone,
  Info,
  HelpCircle,
} from 'lucide-react';
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
  const [activeTab, setActiveTab] = useState('apps'); // 'apps' | 'qr'
  const [qrDataUrl, setQrDataUrl] = useState('');
  const [customUpi, setCustomUpi] = useState('');
  const [isEditingUpi, setIsEditingUpi] = useState(false);
  const [savingUpi, setSavingUpi] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [copiedUpi, setCopiedUpi] = useState(false);
  const [copiedAmount, setCopiedAmount] = useState(false);
  const [showFailGuide, setShowFailGuide] = useState(false);

  useEffect(() => {
    if (transfer && isOpen) {
      setErrorMsg('');
      setCopiedUpi(false);
      setCopiedAmount(false);
      const payeeUpi = transfer.toMember?.upi_id || '';
      setCustomUpi(payeeUpi);
      setActiveTab('apps');
      setShowFailGuide(false);

      if (payeeUpi) {
        const link = buildUpiDeepLink({
          upiId: payeeUpi,
          payeeName: transfer.toMember?.display_name,
          amountPaise: transfer.amountPaise,
          note: `RoomSplit settlement`,
        });
        generateUpiQrDataUrl(link).then(url => setQrDataUrl(url));
      } else {
        setQrDataUrl('');
      }
    }
  }, [transfer, isOpen]);

  if (!isOpen || !transfer) return null;

  const effectiveUpi = customUpi.trim() || transfer.toMember?.upi_id || '';
  const payeeName = transfer.toMember?.display_name || 'Roommate';
  const amountPaise = transfer.amountPaise;
  const amountRupeesStr = ((amountPaise || 0) / 100).toFixed(2);

  // Deep links for various options
  const genericUpiLink = effectiveUpi
    ? buildUpiDeepLink({
        upiId: effectiveUpi,
        payeeName,
        amountPaise,
        scheme: 'upi',
      })
    : '';

  const gpayLink = effectiveUpi
    ? buildUpiDeepLink({
        upiId: effectiveUpi,
        payeeName,
        amountPaise,
        scheme: 'gpay',
      })
    : '';

  const phonepeLink = effectiveUpi
    ? buildUpiDeepLink({
        upiId: effectiveUpi,
        payeeName,
        amountPaise,
        scheme: 'phonepe',
      })
    : '';

  const paytmLink = effectiveUpi
    ? buildUpiDeepLink({
        upiId: effectiveUpi,
        payeeName,
        amountPaise,
        scheme: 'paytm',
      })
    : '';

  const isPayerMe = transfer.fromMember?.user_id === currentUserId;
  const isRecipientMe = transfer.toMember?.user_id === currentUserId;

  const currentStatus = payment?.status || 'pending';
  const isMarkedPaid = currentStatus === 'payer_marked_paid';
  const isConfirmed = currentStatus === 'recipient_confirmed';

  const handleCopyUpi = async () => {
    if (!effectiveUpi) return;
    try {
      await navigator.clipboard.writeText(effectiveUpi);
      setCopiedUpi(true);
      setTimeout(() => setCopiedUpi(false), 2500);
    } catch {
      // Fallback
      setCopiedUpi(true);
      setTimeout(() => setCopiedUpi(false), 2500);
    }
  };

  const handleCopyAmount = async () => {
    try {
      await navigator.clipboard.writeText(amountRupeesStr);
      setCopiedAmount(true);
      setTimeout(() => setCopiedAmount(false), 2500);
    } catch {
      setCopiedAmount(true);
      setTimeout(() => setCopiedAmount(false), 2500);
    }
  };

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
        payeeName,
        amountPaise,
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
      <div className="w-full max-w-sm max-h-[92vh] flex flex-col bg-surface-container-lowest rounded-3xl p-5 shadow-2xl border border-surface-container-high text-on-surface overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-surface-container mb-3 flex-shrink-0">
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
          <div className="mb-3 p-2.5 rounded-xl bg-error-container text-on-error-container text-xs font-medium flex-shrink-0">
            {errorMsg}
          </div>
        )}

        <div className="flex-1 overflow-y-auto no-scrollbar space-y-3 pr-0.5">
          {/* Transfer Summary Card */}
          <div className="p-3.5 rounded-2xl bg-surface-container-low border border-surface-container flex flex-col items-center text-center">
            <span className="text-[11px] font-semibold text-on-surface-variant uppercase tracking-wider mb-0.5">
              Settlement Amount
            </span>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold font-headline text-on-surface tabular-nums">
                {formatINR(transfer.amountPaise)}
              </span>
              <button
                onClick={handleCopyAmount}
                title="Copy Amount"
                className="p-1 text-outline hover:text-secondary rounded-md transition-colors"
              >
                {copiedAmount ? (
                  <CheckCheck className="w-3.5 h-3.5 text-emerald-600" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
              </button>
            </div>
            {copiedAmount && (
              <span className="text-[10px] text-emerald-700 font-semibold animate-in fade-in">
                Amount copied: ₹{amountRupeesStr}
              </span>
            )}

            <div className="flex items-center gap-2 mt-2 text-xs text-on-surface">
              <span className="font-semibold">
                {transfer.fromMember?.display_name} {isPayerMe ? '(You)' : ''}
              </span>
              <ArrowRight className="w-3.5 h-3.5 text-outline" />
              <span className="font-bold text-secondary">
                {transfer.toMember?.display_name} {isRecipientMe ? '(You)' : ''}
              </span>
            </div>

            {/* Payee UPI ID display & 1-click copy */}
            <div className="mt-2.5 w-full">
              {isEditingUpi || !effectiveUpi ? (
                <div className="flex flex-col gap-1.5 w-full">
                  <div className="flex gap-1.5">
                    <input
                      type="text"
                      placeholder="Enter UPI ID (e.g. name@okhdfcbank)"
                      value={customUpi}
                      onChange={e => setCustomUpi(e.target.value)}
                      className="flex-1 h-8 px-2.5 rounded-xl bg-white border border-outline-variant text-xs outline-none focus:border-secondary font-mono"
                    />
                    <button
                      onClick={handleSaveUpi}
                      disabled={savingUpi}
                      className="h-8 px-2.5 bg-secondary text-white rounded-xl text-xs font-bold flex items-center gap-1 active:scale-95"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Save</span>
                    </button>
                  </div>
                  <span className="text-[10px] text-on-surface-variant text-left">
                    Enter {payeeName}'s UPI ID to enable 1-tap payment & QR code
                  </span>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-1">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-surface-container rounded-full max-w-full">
                    <span className="text-[11px] font-mono text-on-surface font-semibold truncate">
                      {effectiveUpi}
                    </span>
                    <button
                      onClick={handleCopyUpi}
                      title="Copy UPI ID"
                      className="p-1 text-secondary hover:text-secondary-container active:scale-90 transition-transform"
                    >
                      {copiedUpi ? (
                        <CheckCheck className="w-3.5 h-3.5 text-emerald-600" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                    <button
                      onClick={() => setIsEditingUpi(true)}
                      className="p-1 rounded-md text-outline hover:text-on-surface text-[11px]"
                      title="Edit UPI ID"
                    >
                      <Edit2 className="w-3 h-3" />
                    </button>
                  </div>
                  {copiedUpi && (
                    <span className="text-[10px] text-emerald-700 font-bold animate-in fade-in">
                      ✓ UPI ID Copied! Paste in GPay or PhonePe
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Mode Switcher Tabs */}
          {effectiveUpi && (
            <div className="flex p-0.5 rounded-xl bg-surface-container border border-surface-container-high">
              <button
                type="button"
                onClick={() => setActiveTab('apps')}
                className={`flex-1 py-1.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                  activeTab === 'apps'
                    ? 'bg-surface-container-lowest text-on-surface shadow-xs'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span>Pay in App</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('qr')}
                className={`flex-1 py-1.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                  activeTab === 'qr'
                    ? 'bg-surface-container-lowest text-on-surface shadow-xs'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                <QrCode className="w-3.5 h-3.5" />
                <span>Scan QR Code</span>
              </button>
            </div>
          )}

          {/* Tab 1: Pay in App */}
          {activeTab === 'apps' && effectiveUpi && (
            <div className="space-y-2">
              {/* Primary Universal App Launcher */}
              <a
                href={genericUpiLink}
                className="w-full h-11 bg-secondary hover:bg-secondary-container text-on-secondary font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-all shadow-md active:scale-95"
              >
                <ExternalLink className="w-4 h-4" />
                <span>Open Installed UPI App</span>
              </a>

              {/* Direct App Launchers */}
              <div className="grid grid-cols-3 gap-1.5">
                <a
                  href={gpayLink}
                  className="h-9 px-1 rounded-xl bg-surface-container border border-surface-container-high hover:border-secondary flex items-center justify-center text-[11px] font-semibold text-on-surface hover:text-secondary active:scale-95 transition-all truncate"
                >
                  Google Pay
                </a>
                <a
                  href={phonepeLink}
                  className="h-9 px-1 rounded-xl bg-surface-container border border-surface-container-high hover:border-secondary flex items-center justify-center text-[11px] font-semibold text-on-surface hover:text-secondary active:scale-95 transition-all truncate"
                >
                  PhonePe
                </a>
                <a
                  href={paytmLink}
                  className="h-9 px-1 rounded-xl bg-surface-container border border-surface-container-high hover:border-secondary flex items-center justify-center text-[11px] font-semibold text-on-surface hover:text-secondary active:scale-95 transition-all truncate"
                >
                  Paytm
                </a>
              </div>

              {/* Instant 1-tap Copy Fallback Button */}
              <button
                type="button"
                onClick={handleCopyUpi}
                className="w-full h-9 bg-surface-container-low border border-surface-container hover:bg-surface-container text-on-surface text-[11px] font-semibold rounded-xl flex items-center justify-center gap-1.5 transition-all active:scale-95"
              >
                {copiedUpi ? (
                  <CheckCheck className="w-3.5 h-3.5 text-emerald-600" />
                ) : (
                  <Copy className="w-3.5 h-3.5 text-secondary" />
                )}
                <span>{copiedUpi ? 'UPI ID Copied to Clipboard!' : 'Copy UPI ID to Paste Manually'}</span>
              </button>

              {/* "Payment Failed?" Troubleshooting Banner */}
              <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-left">
                <button
                  type="button"
                  onClick={() => setShowFailGuide(!showFailGuide)}
                  className="w-full flex items-center justify-between text-[11px] font-bold text-amber-900"
                >
                  <span className="flex items-center gap-1.5">
                    <HelpCircle className="w-3.5 h-3.5 text-amber-700 flex-shrink-0" />
                    <span>Phone showing "Payment Failed"?</span>
                  </span>
                  <span className="text-[10px] text-amber-700 underline font-normal">
                    {showFailGuide ? 'Hide' : 'Quick Fix'}
                  </span>
                </button>
                {showFailGuide && (
                  <div className="mt-2 text-[10px] text-amber-950 space-y-1.5 font-normal leading-relaxed animate-in fade-in">
                    <p>
                      <strong>Why this happens:</strong> In India, NPCI and banks (SBI, HDFC, etc.) often block direct payment links opened from mobile web browsers for security reasons.
                    </p>
                    <p>
                      <strong>How to solve in 5 seconds:</strong>
                    </p>
                    <ol className="list-decimal pl-3 space-y-0.5">
                      <li>Tap <strong>"Copy UPI ID"</strong> above.</li>
                      <li>Open your <strong>Google Pay</strong>, <strong>PhonePe</strong>, or <strong>Paytm</strong> app directly.</li>
                      <li>Choose <em>"Pay UPI ID / Number"</em> and paste. It will succeed instantly with 0 issues!</li>
                      <li>Or tap the <strong>"Scan QR Code"</strong> tab above and scan it.</li>
                    </ol>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Tab 2: Scan QR Code */}
          {activeTab === 'qr' && effectiveUpi && (
            <div className="p-3 bg-white rounded-2xl border border-surface-container flex flex-col items-center justify-center animate-in fade-in duration-200">
              {qrDataUrl ? (
                <>
                  <img
                    src={qrDataUrl}
                    alt="UPI QR Code"
                    className="w-48 h-48 rounded-lg shadow-xs"
                  />
                  <div className="mt-2 text-center space-y-1">
                    <p className="text-[11px] text-on-surface font-bold">
                      Scan with any UPI App or Phone Camera
                    </p>
                    <p className="text-[10px] text-on-surface-variant max-w-[240px] mx-auto leading-normal">
                      <strong>Tip:</strong> Take a screenshot of this QR and choose <em>"Scan from Gallery / Image"</em> in Google Pay or PhonePe. QR scans are never blocked by banks!
                    </p>
                  </div>
                </>
              ) : (
                <div className="p-6 text-center text-xs text-on-surface-variant">
                  Generating QR code...
                </div>
              )}
            </div>
          )}

          {!effectiveUpi && (
            <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs text-center">
              <AlertCircle className="w-4 h-4 text-amber-700 mx-auto mb-1" />
              <span>
                Please enter {payeeName}'s UPI ID above to enable instant app payments and generate the dynamic QR code.
              </span>
            </div>
          )}
        </div>

        {/* Footer: Peer-to-Peer Confirmation Status */}
        <div className="border-t border-surface-container pt-3 mt-3 flex-shrink-0 space-y-2">
          {/* If already confirmed */}
          {isConfirmed ? (
            <div className="p-2.5 bg-emerald-50 text-emerald-800 rounded-xl border border-emerald-200 text-xs font-semibold flex items-center justify-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Settlement verified & completed!</span>
            </div>
          ) : (
            <>
              {/* Payer button */}
              {isPayerMe && (
                <button
                  type="button"
                  disabled={loading || isMarkedPaid}
                  onClick={handleMarkPaid}
                  className={`w-full h-10 font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-all active:scale-95 ${
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
                  className="w-full h-10 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-all shadow-md active:scale-95"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Confirm Received in Bank Account</span>
                </button>
              )}

              {/* Notice when marked paid */}
              {isMarkedPaid && !isRecipientMe && (
                <p className="text-[11px] text-amber-700 text-center font-medium">
                  Payment marked sent. Awaiting {payeeName}'s receipt confirmation.
                </p>
              )}
            </>
          )}

          <div className="flex items-center justify-center gap-1.5 text-[10px] text-on-surface-variant text-center">
            <ShieldAlert className="w-3 h-3 text-amber-600 flex-shrink-0" />
            <span>Direct bank-to-bank transfer • 0% fees</span>
          </div>
        </div>
      </div>
    </div>
  );
}
