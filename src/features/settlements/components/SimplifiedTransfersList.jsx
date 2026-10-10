import React from 'react';
import { ArrowRight, CheckCircle2, QrCode, ExternalLink, Clock, ShieldCheck } from 'lucide-react';
import { formatINR } from '../../../lib/currencyFormatters';

export function SimplifiedTransfersList({
  transfers = [],
  payments = [],
  currentUserId,
  onOpenPayModal,
}) {
  if (transfers.length === 0) {
    return (
      <div className="p-6 bg-surface-container-lowest rounded-2xl border border-surface-container text-center flex flex-col items-center justify-center">
        <CheckCircle2 className="w-8 h-8 text-teal-600 mb-2" />
        <h4 className="text-sm font-bold text-on-surface">All Balances Settled</h4>
        <p className="text-xs text-on-surface-variant mt-1">
          No pending debts in this room. Everyone is square!
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2.5">
      {transfers.map(t => {
        const isFromMe = t.fromMember?.user_id === currentUserId;
        const isToMe = t.toMember?.user_id === currentUserId;

        // Check if there is an existing payment record for this transfer
        const payment = payments.find(
          p =>
            p.from_member_id === t.fromMember?.id &&
            p.to_member_id === t.toMember?.id &&
            p.status !== 'cancelled'
        );

        const isMarkedPaid = payment?.status === 'payer_marked_paid';
        const isConfirmed = payment?.status === 'recipient_confirmed';

        return (
          <div
            key={t.id || `${t.fromMember?.id}_${t.toMember?.id}`}
            className={`p-3.5 bg-surface-container-lowest rounded-2xl border transition-all ${
              isMarkedPaid
                ? 'border-amber-300/80 bg-amber-50/20 shadow-xs'
                : 'border-surface-container shadow-xs'
            }`}
          >
            {/* Top row: From -> To and Amount */}
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs flex-shrink-0 ${
                    isFromMe
                      ? 'bg-amber-100 text-amber-800'
                      : isToMe
                      ? 'bg-teal-100 text-teal-800'
                      : 'bg-surface-container text-on-surface'
                  }`}
                >
                  {t.fromMember?.display_name?.slice(0, 1)?.toUpperCase() || 'R'}
                </div>

                <div className="flex flex-col min-w-0">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-on-surface truncate">
                    <span>
                      {t.fromMember?.display_name} {isFromMe ? '(You)' : ''}
                    </span>
                    <ArrowRight className="w-3.5 h-3.5 text-outline flex-shrink-0" />
                    <span className="text-secondary font-bold">
                      {t.toMember?.display_name} {isToMe ? '(You)' : ''}
                    </span>
                  </div>
                  <span className="text-[11px] text-on-surface-variant mt-0.5 truncate">
                    {t.toMember?.upi_id ? `UPI: ${t.toMember.upi_id}` : 'UPI not added yet'}
                  </span>
                </div>
              </div>

              <div className="text-right flex-shrink-0 ml-2">
                <span className="text-sm font-bold text-on-surface tabular-nums">
                  {formatINR(t.amountPaise)}
                </span>
                <p className="text-[10px] text-on-surface-variant font-medium">Direct Due</p>
              </div>
            </div>

            {/* Bottom row: Action Buttons / Status Badges */}
            <div className="mt-3 pt-2.5 border-t border-surface-container/60 flex items-center justify-between gap-2">
              {/* Status info */}
              <div className="flex items-center gap-1.5 text-[11px] min-w-0">
                {isConfirmed ? (
                  <span className="text-teal-700 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Settled & Confirmed</span>
                  </span>
                ) : isMarkedPaid ? (
                  <span className="text-amber-700 font-semibold flex items-center gap-1 truncate">
                    <Clock className="w-3.5 h-3.5 flex-shrink-0" />
                    <span>Marked Paid • Awaiting Confirmation</span>
                  </span>
                ) : (
                  <span className="text-on-surface-variant truncate">
                    {isFromMe ? 'You owe this amount' : isToMe ? 'You should receive this' : 'Pending payment'}
                  </span>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-1.5 flex-shrink-0">
                {isToMe && isMarkedPaid ? (
                  <button
                    onClick={() => onOpenPayModal && onOpenPayModal(t)}
                    className="h-8 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs active:scale-95 transition-all"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Confirm Received</span>
                  </button>
                ) : isFromMe ? (
                  <button
                    onClick={() => onOpenPayModal && onOpenPayModal(t)}
                    className="h-8 px-3.5 bg-secondary hover:bg-secondary-container text-on-secondary rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs active:scale-95 transition-all"
                  >
                    <QrCode className="w-3.5 h-3.5" />
                    <span>{isMarkedPaid ? 'View UPI Details' : 'Pay via UPI'}</span>
                  </button>
                ) : (
                  <button
                    onClick={() => onOpenPayModal && onOpenPayModal(t)}
                    className="h-8 px-3 bg-surface-container hover:bg-surface-container-high text-on-surface rounded-xl text-xs font-medium flex items-center gap-1 transition-all"
                  >
                    <ExternalLink className="w-3.5 h-3.5 text-outline" />
                    <span>Details</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
