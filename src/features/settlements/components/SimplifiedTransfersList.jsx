import React from 'react';
import { ArrowRight, CheckCircle2 } from 'lucide-react';
import { formatINR } from '../../../lib/currencyFormatters';

export function SimplifiedTransfersList({ transfers = [], currentUserId }) {
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

        return (
          <div
            key={t.id}
            className="flex items-center justify-between p-3.5 bg-surface-container-lowest rounded-2xl border border-surface-container shadow-xs"
          >
            {/* Left: From -> To */}
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <div className="w-9 h-9 rounded-full bg-surface-container flex items-center justify-center font-bold text-xs text-on-surface flex-shrink-0">
                {t.fromMember?.display_name?.slice(0, 1) || 'R'}
              </div>

              <div className="flex flex-col min-w-0">
                <div className="flex items-center gap-1.5 text-xs font-bold text-on-surface truncate">
                  <span>{t.fromMember?.display_name} {isFromMe ? '(You)' : ''}</span>
                  <ArrowRight className="w-3.5 h-3.5 text-outline flex-shrink-0" />
                  <span className="text-secondary">{t.toMember?.display_name} {isToMe ? '(You)' : ''}</span>
                </div>
                <span className="text-[11px] text-on-surface-variant mt-0.5">
                  Suggested transfer
                </span>
              </div>
            </div>

            {/* Right: Amount in bold INR */}
            <div className="text-right flex-shrink-0 ml-3">
              <span className="text-sm font-bold text-on-surface tabular-nums">
                {formatINR(t.amountPaise)}
              </span>
              <p className="text-[10px] text-secondary font-semibold uppercase tracking-wider">
                Direct Due
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
