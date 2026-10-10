import React, { useState, useEffect } from 'react';
import { useAuth } from './features/auth/useAuth';
import { useRoom } from './features/rooms/useRoom';
import { useExpenses } from './features/expenses/useExpenses';
import { useSettlements } from './features/settlements/useSettlements';
import { usePersonalExpenses } from './features/personal/usePersonalExpenses';
import { useOnlineStatus } from './features/offline/hooks/useOnlineStatus';

import { AppHeader } from './components/layout/AppHeader';
import { BottomNav } from './components/layout/BottomNav';
import { SyncStatusBar } from './features/offline/components/SyncStatusBar';

import { DashboardView } from './features/dashboard/components/DashboardView';
import { ExpenseList } from './features/expenses/ExpenseList';
import { PersonalExpensesView } from './features/personal/PersonalExpensesView';
import { SettlementView } from './features/settlements/components/SettlementView';
import { RoomMemberList } from './features/rooms/components/RoomMemberList';

import { AddExpenseModal } from './features/expenses/AddExpenseModal';
import { AddPersonalExpenseModal } from './features/personal/AddPersonalExpenseModal';
import { InviteModal } from './features/rooms/InviteModal';
import { AuthModal } from './features/auth/AuthModal';
import { CreateRoomModal } from './features/rooms/CreateRoomModal';
import { RoomSwitcherModal } from './features/rooms/RoomSwitcherModal';
import { RoomSettingsModal } from './features/rooms/RoomSettingsModal';
import { PwaInstallPrompt } from './components/common/PwaInstallPrompt';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false);
  const [isAddPersonalOpen, setIsAddPersonalOpen] = useState(false);
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isCreateRoomOpen, setIsCreateRoomOpen] = useState(false);
  const [isRoomSwitcherOpen, setIsRoomSwitcherOpen] = useState(false);
  const [isRoomSettingsOpen, setIsRoomSettingsOpen] = useState(false);
  const [inviteUrl, setInviteUrl] = useState('');

  // 1. Auth Hook
  const {
    user,
    profile,
    loading: authLoading,
    signInWithPassword,
    signUpWithPassword,
    signInWithGoogle,
    signInWithOtp,
    verifyOtp,
    signOut,
  } = useAuth();

  function handleOpenCreateRoom() {
    if (!user) {
      setIsAuthOpen(true);
      return;
    }
    setIsCreateRoomOpen(true);
  }

  // 2. Network & Offline Hook
  const { isOnline, pendingCount, isSyncing, triggerSync } = useOnlineStatus();

  // 3. Room Hook
  const {
    currentRoom,
    userRooms,
    members,
    loading: roomLoading,
    createInviteLink,
    createNewRoom,
    renameRoom,
    deleteRoom,
    switchRoom,
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

  // 5. Settlements & Live Balances Hook
  const {
    ledger,
    settlementPlan,
    payments,
    updatePaymentStatus,
    refreshPayments,
  } = useSettlements(currentRoom?.id, members, expenses, splits);

  // 6. Personal Expense Tracker Hook
  const personalExpensesHook = usePersonalExpenses(user?.id);

  // Check for invite token in URL (?join=XYZ)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const joinCode = params.get('join');
    if (joinCode && user) {
      joinRoomByToken(joinCode)
        .then(() => {
          window.history.replaceState({}, document.title, window.location.pathname);
        })
        .catch(err => {
          console.warn('Failed to auto-join room:', err);
          window.history.replaceState({}, document.title, window.location.pathname);
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
        onOpenRoomSwitcher={() => setIsRoomSwitcherOpen(true)}
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
              ledger={ledger}
              payments={payments}
              currentUserId={user?.id}
              onOpenAddExpense={() => setIsAddExpenseOpen(true)}
              onOpenInvite={handleOpenInvite}
              onOpenRoomSwitcher={() => setIsRoomSwitcherOpen(true)}
              onOpenRoomSettings={() => setIsRoomSettingsOpen(true)}
              onOpenCreateRoom={handleOpenCreateRoom}
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

          {activeTab === 'personal' && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-secondary">
                    Private & Individual
                  </span>
                  <h1 className="text-lg font-bold font-headline text-on-surface">
                    Personal Expense Tracker
                  </h1>
                </div>
              </div>
              <PersonalExpensesView
                personalExpensesHook={personalExpensesHook}
                onOpenAddModal={() => setIsAddPersonalOpen(true)}
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
                roomId={currentRoom?.id}
                members={members}
                expenses={expenses}
                splits={splits}
                ledger={ledger}
                settlementPlan={settlementPlan}
                payments={payments}
                updatePaymentStatus={updatePaymentStatus}
                currentUserId={user?.id}
                onRefreshRoom={() => {
                  refreshRoom();
                  refreshPayments();
                }}
              />
            </div>
          )}

          {activeTab === 'members' && (
            <RoomMemberList
              members={members}
              userRooms={userRooms}
              currentRoom={currentRoom}
              currentUserId={user?.id}
              onOpenInvite={handleOpenInvite}
              onOpenCreateRoom={handleOpenCreateRoom}
              onOpenRoomSettings={() => setIsRoomSettingsOpen(true)}
              onSwitchRoom={switchRoom}
              onJoinRoom={joinRoomByToken}
              onRefreshRoom={refreshRoom}
            />
          )}
        </div>
      </main>

      {/* PWA Home Screen Installation Prompt */}
      <PwaInstallPrompt />

      {/* 3. Bottom Navigation Bar */}
      <BottomNav
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        onOpenAdd={() => {
          if (activeTab === 'personal') {
            setIsAddPersonalOpen(true);
          } else {
            setIsAddExpenseOpen(true);
          }
        }}
      />

      {/* 4. Modals */}
      <AddExpenseModal
        isOpen={isAddExpenseOpen}
        onClose={() => setIsAddExpenseOpen(false)}
        members={members}
        currentUserId={user?.id}
        onSave={addExpense}
      />

      <AddPersonalExpenseModal
        isOpen={isAddPersonalOpen}
        onClose={() => setIsAddPersonalOpen(false)}
        onSave={personalExpensesHook.addPersonalExpense}
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
        onSignInWithPassword={signInWithPassword}
        onSignUpWithPassword={signUpWithPassword}
        onSignInWithGoogle={signInWithGoogle}
        onSignInWithOtp={signInWithOtp}
        onVerifyOtp={verifyOtp}
      />

      <CreateRoomModal
        isOpen={isCreateRoomOpen}
        onClose={() => setIsCreateRoomOpen(false)}
        onCreateRoom={createNewRoom}
        user={user}
        onOpenAuth={() => setIsAuthOpen(true)}
      />

      <RoomSwitcherModal
        isOpen={isRoomSwitcherOpen}
        onClose={() => setIsRoomSwitcherOpen(false)}
        rooms={userRooms}
        currentRoomId={currentRoom?.id}
        onSwitchRoom={switchRoom}
        onOpenCreateRoom={handleOpenCreateRoom}
        onJoinRoom={joinRoomByToken}
      />

      <RoomSettingsModal
        isOpen={isRoomSettingsOpen}
        onClose={() => setIsRoomSettingsOpen(false)}
        room={currentRoom}
        onRenameRoom={renameRoom}
        onDeleteRoom={deleteRoom}
      />
    </div>
  );
}
