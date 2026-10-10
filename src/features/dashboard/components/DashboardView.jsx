import React from 'react';
import { Plus, ArrowRightLeft, UserPlus } from 'lucide-react';
import { RoomHeader } from '../../rooms/RoomHeader';
import { BalanceHeroCard } from './BalanceHeroCard';
import { RecentActivityList } from './RecentActivityList';
import { calculateNetBalances } from '../../settlements/utils/debtMinimization';

export function DashboardView({
  room,
  members = [],
  expenses = [],
  splits = [],
  currentUserId,
  onOpenAddExpense,
  onOpenInvite,
  onNavigateTab,
  onDeleteExpense,
}) {
  // Calculate my balance breakdown
  const { ledger } = calculateNetBalances(members, expenses, splits);
  const myMember = members.find(m => m.user_id === currentUserId);
  const myLedger = myMember ? ledger[myMember.id] : null;

  const myNetPaise = myLedger?.netPaise || 0;
  const myPaidPaise = myLedger?.paidPaise || 0;
  const mySharePaise = myLedger?.sharePaise || 0;

  const myTxCount = expenses.filter(e => e.paid_by_member_id === myMember?.id).length;
  const roomTotalPaise = expenses.reduce((acc, curr) => acc + (Number(curr.amount_paise) || 0), 0);

  return (
    <div className="flex flex-col gap-4 pb-12">
      {/* 1. Room Identity Card */}
      <RoomHeader
        room={room}
        members={members}
        currentUserId={currentUserId}
        onOpenInvite={onOpenInvite}
      />

      {/* 2. Balance Hero Card */}
      <BalanceHeroCard
        myNetPaise={myNetPaise}
        myPaidPaise={myPaidPaise}
        mySharePaise={mySharePaise}
        roomTotalPaise={roomTotalPaise}
        myTxCount={myTxCount}
      />

      {/* 3. Quick Action Buttons */}
      <div className="grid grid-cols-3 gap-2">
        <button
          onClick={onOpenAddExpense}
          className="h-12 bg-secondary hover:bg-secondary-container text-on-secondary rounded-2xl flex items-center justify-center gap-1.5 text-xs font-bold shadow-sm transition-all active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Add Bill</span>
        </button>

        <button
          onClick={() => onNavigateTab('settlements')}
          className="h-12 bg-surface-container hover:bg-surface-container-high text-on-surface rounded-2xl flex items-center justify-center gap-1.5 text-xs font-bold transition-all active:scale-95"
        >
          <ArrowRightLeft className="w-4 h-4 text-secondary" />
          <span>Balances</span>
        </button>

        <button
          onClick={onOpenInvite}
          className="h-12 bg-surface-container hover:bg-surface-container-high text-on-surface rounded-2xl flex items-center justify-center gap-1.5 text-xs font-bold transition-all active:scale-95"
        >
          <UserPlus className="w-4 h-4 text-outline" />
          <span>Invite</span>
        </button>
      </div>

      {/* 4. Recent Expenses Activity */}
      {expenses.length > 0 && (
        <RecentActivityList
          expenses={expenses}
          members={members}
          currentUserId={currentUserId}
          onViewAll={() => onNavigateTab('expenses')}
          onDeleteExpense={onDeleteExpense}
        />
      )}
    </div>
  );
}
