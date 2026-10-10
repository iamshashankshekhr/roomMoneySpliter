import React from 'react';
import { ShieldCheck, Info } from 'lucide-react';
import { NetBalanceGrid } from './NetBalanceGrid';
import { SimplifiedTransfersList } from './SimplifiedTransfersList';
import { calculateNetBalances, generateSimplifiedTransfers } from '../utils/debtMinimization';

export function SettlementView({ members = [], expenses = [], splits = [], currentUserId }) {
  const { ledger, discrepancy } = calculateNetBalances(members, expenses, splits);
  const transfers = generateSimplifiedTransfers(ledger);

  return (
    <div className="flex flex-col gap-5 pb-8">
      {/* Engine Verification Pill matching Stitch design */}
      <div className="flex items-center gap-2 p-2.5 rounded-xl bg-surface-container-high text-on-surface">
        <ShieldCheck className="w-4 h-4 text-teal-600 shrink-0" />
        <p className="text-xs flex-1 text-on-surface-variant">
          <strong className="text-on-surface font-semibold">Greedy Debt-Minimization Engine</strong> • Net balanced: ₹{(discrepancy / 100).toFixed(2)} discrepancy
        </p>
        <Info className="w-3.5 h-3.5 text-outline shrink-0" />
      </div>

      {/* Net Balance Ledger */}
      <section className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-on-surface font-headline">Net Balance Ledger</h2>
          <span className="text-xs text-on-surface-variant font-medium">
            {members.length} Active Roommates
          </span>
        </div>
        <NetBalanceGrid ledger={ledger} currentUserId={currentUserId} />
      </section>

      {/* Suggested Settlements: Who Pays Whom */}
      <section className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <h2 className="text-sm font-bold text-on-surface font-headline">Who Pays Whom</h2>
            <span className="px-2 py-0.5 rounded-full bg-secondary-fixed text-on-secondary-fixed text-[10px] font-bold">
              {transfers.length} {transfers.length === 1 ? 'Step' : 'Steps'}
            </span>
          </div>
          <span className="text-xs text-on-surface-variant">
            Deterministic Settlement
          </span>
        </div>
        <SimplifiedTransfersList transfers={transfers} currentUserId={currentUserId} />
      </section>
    </div>
  );
}
