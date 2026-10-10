import React from 'react';
import { Plus, ArrowRightLeft, UserPlus, Building2, Wallet } from 'lucide-react';
import { RoomHeader } from '../../rooms/RoomHeader';
import { BalanceHeroCard } from './BalanceHeroCard';
import { RecentActivityList } from './RecentActivityList';
import { calculateNetBalances } from '../../settlements/settlementEngine';

export function DashboardView({
  room,
  members = [],
  expenses = [],
  splits = [],
  ledger: externalLedger,
  payments = [],
  currentUserId,
  onOpenAddExpense,
  onOpenInvite,
  onOpenRoomSwitcher,
  onOpenRoomSettings,
  onOpenCreateRoom,
  onNavigateTab,
  onDeleteExpense,
}) {
  // Empty state when user has not created or joined any room yet
  if (!room) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center bg-surface-container-lowest rounded-3xl border border-surface-container my-6 shadow-sm">
        <div className="w-16 h-16 rounded-2xl bg-secondary/10 text-secondary flex items-center justify-center mb-4">
          <Building2 className="w-8 h-8" />
        </div>
        <h2 className="text-lg font-bold font-headline text-on-surface">No Room Found</h2>
        <p className="text-xs text-on-surface-variant max-w-sm mt-1.5 mb-6 leading-relaxed">
          You haven't created or joined a shared room yet. Create a room for your flat or hostel, or join one using an invitation code.
        </p>

        <div className="flex flex-col sm:flex-row gap-2.5 w-full max-w-xs">
          <button
            onClick={onOpenCreateRoom}
            className="flex-1 h-12 bg-secondary hover:bg-secondary-container text-on-secondary font-bold text-xs rounded-xl flex items-center justify-center gap-2 shadow-sm transition-all active:scale-95"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Create a Room</span>
          </button>

          <button
            onClick={onOpenRoomSwitcher}
            className="flex-1 h-12 bg-surface-container hover:bg-surface-container-high text-on-surface font-semibold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-all"
          >
            <span>Join with Code</span>
          </button>
        </div>
      </div>
    );
  }

  // Calculate live balances factoring in expenses, splits, and settlement payments
  const ledger = externalLedger || calculateNetBalances(members, expenses, splits, payments);
  const myMember = members.find(m => m.user_id === currentUserId);
  const myLedger = myMember ? ledger[myMember.id] : null;

  const myNetPaise = myLedger?.netPaise || 0;
  const myPaidPaise = myLedger?.paidPaise || 0;
  const mySharePaise = myLedger?.sharePaise || 0;

  // Check for in-flight pending payments
  const hasPendingSent = payments.some(
    p => p.from_member_id === myMember?.id && p.status === 'payer_marked_paid'
  );
  const hasPendingReceived = payments.some(
    p => p.to_member_id === myMember?.id && p.status === 'payer_marked_paid'
  );

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
        onOpenRoomSwitcher={onOpenRoomSwitcher}
        onOpenRoomSettings={onOpenRoomSettings}
      />

      {/* 2. Balance Hero Card */}
      <BalanceHeroCard
        myNetPaise={myNetPaise}
        myPaidPaise={myPaidPaise}
        mySharePaise={mySharePaise}
        roomTotalPaise={roomTotalPaise}
        myTxCount={myTxCount}
        hasPendingSent={hasPendingSent}
        hasPendingReceived={hasPendingReceived}
        onNavigateSettlements={() => onNavigateTab('settlements')}
      />

      {/* 3. Quick Action Buttons */}
      <div className="grid grid-cols-4 gap-2">
        <button
          onClick={onOpenAddExpense}
          className="h-12 bg-secondary hover:bg-secondary-container text-on-secondary rounded-2xl flex flex-col items-center justify-center gap-0.5 text-[11px] font-bold shadow-sm transition-all active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Add Bill</span>
        </button>

        <button
          onClick={() => onNavigateTab('personal')}
          className="h-12 bg-surface-container hover:bg-surface-container-high text-on-surface rounded-2xl flex flex-col items-center justify-center gap-0.5 text-[11px] font-bold transition-all active:scale-95"
        >
          <Wallet className="w-4 h-4 text-secondary" />
          <span>Personal</span>
        </button>

        <button
          onClick={() => onNavigateTab('settlements')}
          className="h-12 bg-surface-container hover:bg-surface-container-high text-on-surface rounded-2xl flex flex-col items-center justify-center gap-0.5 text-[11px] font-bold transition-all active:scale-95"
        >
          <ArrowRightLeft className="w-4 h-4 text-outline" />
          <span>Balances</span>
        </button>

        <button
          onClick={onOpenInvite}
          className="h-12 bg-surface-container hover:bg-surface-container-high text-on-surface rounded-2xl flex flex-col items-center justify-center gap-0.5 text-[11px] font-bold transition-all active:scale-95"
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
