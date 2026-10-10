import React, { useState, useEffect } from 'react';
import { useAuth } from './features/auth/useAuth';
import { useRoom } from './features/rooms/useRoom';
import { useExpenses } from './features/expenses/useExpenses';
import { useOnlineStatus } from './features/offline/hooks/useOnlineStatus';

import { AppHeader } from './components/layout/AppHeader';
import { BottomNav } from './components/layout/BottomNav';
import { SyncStatusBar } from './features/offline/components/SyncStatusBar';

import { DashboardView } from './features/dashboard/components/DashboardView';
import { ExpenseList } from './features/expenses/ExpenseList';
import { SettlementView } from './features/settlements/components/SettlementView';
import { RoomMemberList } from './features/rooms/components/RoomMemberList';

import { AddExpenseModal } from './features/expenses/AddExpenseModal';
import { InviteModal } from './features/rooms/InviteModal';
import { AuthModal } from './features/auth/AuthModal';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false);
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [inviteUrl, setInviteUrl] = useState('');

  // 1. Auth Hook
  const { user, profile, loading: authLoading, signInWithOtp, verifyOtp, signOut } = useAuth();

  // 2. Network & Offline Hook
  const { isOnline, pendingCount, isSyncing, triggerSync } = useOnlineStatus();

  // 3. Room Hook
  const {
    currentRoom,
    members,
    loading: roomLoading,
    createInviteLink,
    joinRoomByToken,
    refreshRoom,
  } = useRoom(user, profile);

  // 4. Expenses Hook
  const {
    expenses,
    splits,
    loading: expLoading,
    addExpense,
    deleteExpense,
  } = useExpenses(currentRoom?.id, members, isOnline);

  // Check for invite token in URL (?join=XYZ)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const joinCode = params.get('join');
    if (joinCode && user) {
      joinRoomByToken(joinCode)
        .then(() => {
          // Clean URL without reload
          window.history.replaceState({}, document.title, window.location.pathname);
        })
        .catch(err => {
          console.warn('Failed to auto-join room:', err);
        });
    }
  }, [user, joinRoomByToken]);

  async function handleOpenInvite() {
    const link = await createInviteLink();
    setInviteUrl(link);
    setIsInviteOpen(true);
  }

  return (
    <div className="min-h-screen bg-surface flex flex-col font-sans text-on-surface antialiased selection:bg-secondary/20">
      {/* 1. App Top Header */}
      <AppHeader
        user={user}
        profile={profile}
        onOpenAuth={() => setIsAuthOpen(true)}
        onSignOut={signOut}
        roomName={currentRoom?.name}
      />

      {/* 2. Main Content Container */}
      <main className="flex-1 w-full max-w-2xl mx-auto pt-16 pb-20 px-4">
        {/* Sync & Online indicator */}
        <SyncStatusBar
          isOnline={isOnline}
          pendingCount={pendingCount}
          isSyncing={isSyncing}
          onManualSync={triggerSync}
        />

        {/* Tab Content */}
        <div className="mt-2">
          {activeTab === 'dashboard' && (
            <DashboardView
              room={currentRoom}
              members={members}
              expenses={expenses}
              splits={splits}
              currentUserId={user?.id}
              onOpenAddExpense={() => setIsAddExpenseOpen(true)}
              onOpenInvite={handleOpenInvite}
              onNavigateTab={setActiveTab}
              onDeleteExpense={deleteExpense}
            />
          )}

          {activeTab === 'expenses' && (
            <div className="pb-12">
              <div className="flex items-center justify-between mb-4">
                <h1 className="text-lg font-bold font-headline text-on-surface">
                  Expense Ledger
                </h1>
                <span className="text-xs text-on-surface-variant font-medium">
                  {expenses.length} Total Bills
                </span>
              </div>
              <ExpenseList
                expenses={expenses}
                members={members}
                currentUserId={user?.id}
                onAddClick={() => setIsAddExpenseOpen(true)}
                onDeleteExpense={deleteExpense}
              />
            </div>
          )}

          {activeTab === 'settlements' && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-secondary">
                    FR-BAL Engine
                  </span>
                  <h1 className="text-lg font-bold font-headline text-on-surface">
                    Balances & Settlements
                  </h1>
                </div>
              </div>
              <SettlementView
                members={members}
                expenses={expenses}
                splits={splits}
                currentUserId={user?.id}
              />
            </div>
          )}

          {activeTab === 'members' && (
            <RoomMemberList
              members={members}
              currentUserId={user?.id}
              onOpenInvite={handleOpenInvite}
              room={currentRoom}
            />
          )}
        </div>
      </main>

      {/* 3. Bottom Navigation Bar */}
      <BottomNav
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        onOpenAdd={() => setIsAddExpenseOpen(true)}
      />

      {/* 4. Modals */}
      <AddExpenseModal
        isOpen={isAddExpenseOpen}
        onClose={() => setIsAddExpenseOpen(false)}
        members={members}
        currentUserId={user?.id}
        onSave={addExpense}
      />

      <InviteModal
        isOpen={isInviteOpen}
        onClose={() => setIsInviteOpen(false)}
        inviteLink={inviteUrl}
        roomName={currentRoom?.name}
      />

      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onSignIn={signInWithOtp}
        onVerify={verifyOtp}
      />
    </div>
  );
}
