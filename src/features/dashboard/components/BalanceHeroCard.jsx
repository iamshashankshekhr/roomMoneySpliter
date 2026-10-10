import React from 'react';
import { ArrowUpCircle, ArrowDownCircle, Calendar, Sparkles } from 'lucide-react';
import { formatINR, formatCompactINR } from '../../../lib/currencyFormatters';
import { getCurrentMonthName } from '../../../lib/dateUtils';

export function BalanceHeroCard({ myNetPaise, myPaidPaise, mySharePaise, roomTotalPaise, myTxCount }) {
  const isPositive = myNetPaise > 0;
  const isZero = myNetPaise === 0;

  return (
    <div className="relative overflow-hidden bg-primary-container rounded-2xl p-5 text-white shadow-md">
      {/* Subtle ambient blur glow */}
      <div className="absolute -right-8 -top-8 w-32 h-32 rounded-full bg-secondary/30 blur-2xl pointer-events-none" />

      <div className="relative z-10 flex flex-col">
        {/* Header Tag */}
        <div className="flex items-center justify-between mb-1">
          <span className="text-[11px] uppercase tracking-wider font-semibold text-inverse-primary flex items-center gap-1.5">
            {isPositive ? (
              <ArrowUpCircle className="w-4 h-4 text-teal-300" />
            ) : (
              <ArrowDownCircle className="w-4 h-4 text-rose-300" />
            )}
            {isPositive
              ? 'You are owed overall'
              : isZero
              ? 'You are all settled up'
              : 'You owe overall'}
          </span>

          <span
            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
              isPositive
                ? 'bg-teal-400/20 text-teal-300'
                : isZero
                ? 'bg-white/10 text-slate-300'
                : 'bg-rose-400/20 text-rose-300'
            }`}
          >
            {isPositive ? 'Net Positive' : isZero ? 'Balanced' : 'Outstanding'}
          </span>
        </div>

        {/* Big Balance Number */}
        <div className="my-1.5">
          <span
            className={`text-3xl font-bold font-headline tracking-tight tabular-nums ${
              isPositive ? 'text-teal-300' : isZero ? 'text-white' : 'text-rose-300'
            }`}
          >
            {formatINR(myNetPaise, { showSign: true })}
          </span>
        </div>

        <p className="text-xs text-inverse-primary/80 mb-4">
          {isPositive
            ? 'Roommates owe you more than your pending shared expenses.'
            : isZero
            ? 'Your paid expenses match your fair shares perfectly.'
            : 'You have pending shares to clear with your roommates.'}
        </p>

        {/* Breakdown Split Metrics (You paid out vs Your fair share) */}
        <div className="grid grid-cols-2 gap-2 pt-1 border-none">
          <div className="bg-white/10 backdrop-blur-md p-3 rounded-xl flex flex-col">
            <span className="text-[11px] text-inverse-primary">You paid out</span>
            <span className="text-base font-bold text-white mt-0.5 tabular-nums">
              {formatINR(myPaidPaise)}
            </span>
            <span className="text-[10px] text-inverse-primary/70 mt-0.5">
              {myTxCount} {myTxCount === 1 ? 'transaction' : 'transactions'}
            </span>
          </div>

          <div className="bg-white/10 backdrop-blur-md p-3 rounded-xl flex flex-col">
            <span className="text-[11px] text-inverse-primary">Your fair share</span>
            <span className="text-base font-bold text-white mt-0.5 tabular-nums">
              {formatINR(mySharePaise)}
            </span>
            <span className="text-[10px] text-inverse-primary/70 mt-0.5">
              Personal cost
            </span>
          </div>
        </div>

        {/* Room Total Spent Bar */}
        <div className="mt-4 pt-3 flex items-center justify-between text-xs text-inverse-primary border-t border-white/10">
          <div className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-teal-300" />
            <span className="font-medium">
              {formatINR(roomTotalPaise)} total spent in {getCurrentMonthName()}
            </span>
          </div>
          <Sparkles className="w-3.5 h-3.5 text-teal-300/70" />
        </div>
      </div>
    </div>
  );
}
