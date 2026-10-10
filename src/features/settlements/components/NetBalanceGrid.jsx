import React from 'react';
import { ArrowUpRight, ArrowDownLeft } from 'lucide-react';
import { formatINR } from '../../../lib/currencyFormatters';

export function NetBalanceGrid({ ledger = {}, currentUserId }) {
  const entries = Object.values(ledger);

  if (entries.length === 0) {
    return (
      <div className="p-4 bg-surface-container-lowest rounded-2xl border border-surface-container text-xs text-on-surface-variant text-center">
        No active roommates in this room.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-2.5">
      {entries.map(({ member, netPaise }) => {
        const isMe = member.user_id === currentUserId;
        const isPositive = netPaise > 0;
        const isZero = netPaise === 0;

        return (
          <div
            key={member.id}
            className="flex flex-col p-3.5 rounded-2xl bg-surface-container-lowest shadow-sm border border-surface-container gap-1"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-on-surface flex items-center gap-1 truncate">
                {member.display_name}
                {isMe && (
                  <span className="px-1.5 py-0.2 rounded-full bg-secondary-fixed text-on-secondary-fixed text-[10px] font-bold">
                    You
                  </span>
                )}
              </span>

              {isPositive ? (
                <ArrowUpRight className="w-3.5 h-3.5 text-teal-600 flex-shrink-0" />
              ) : isZero ? (
                <span className="text-[10px] text-outline font-bold">OK</span>
              ) : (
                <ArrowDownLeft className="w-3.5 h-3.5 text-rose-600 flex-shrink-0" />
              )}
            </div>

            <span
              className={`text-base font-bold font-headline tabular-nums ${
                isPositive
                  ? 'text-teal-600'
                  : isZero
                  ? 'text-on-surface-variant'
                  : 'text-rose-600'
              }`}
            >
              {formatINR(netPaise, { showSign: true })}
            </span>

            <span className="text-[11px] text-on-surface-variant">
              {isPositive
                ? 'Gets back overall'
                : isZero
                ? 'All settled up'
                : 'Owes overall'}
            </span>
          </div>
        );
      })}
    </div>
  );
}
