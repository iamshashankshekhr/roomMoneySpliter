import React, { useState } from 'react';
import { Users, UserPlus, Shield, Plus, Building2, Check, ArrowRight, Link as LinkIcon, Sparkles, Settings, Edit2, X as CloseIcon } from 'lucide-react';
import { supabase } from '../../../lib/supabase';
import { isValidUpiId } from '../../../lib/upi';

export function RoomMemberList({
  members = [],
  userRooms = [],
  currentRoom,
  currentUserId,
  onOpenInvite,
  onOpenCreateRoom,
  onOpenRoomSettings,
  onSwitchRoom,
  onJoinRoom,
  onRefreshRoom,
}) {
  const [joinCode, setJoinCode] = useState('');
  const [isJoining, setIsJoining] = useState(false);
  const [joinMsg, setJoinMsg] = useState('');
  const [editingUpiMemberId, setEditingUpiMemberId] = useState(null);
  const [upiInputValue, setUpiInputValue] = useState('');
  const [upiError, setUpiError] = useState('');
  const [isSavingUpi, setIsSavingUpi] = useState(false);

  async function handleSaveMyUpi(memberId) {
    if (!upiInputValue.trim()) return;
    if (!isValidUpiId(upiInputValue)) {
      setUpiError('Enter valid UPI ID (e.g. name@okhdfcbank or 9876543210@paytm)');
      return;
    }
    setIsSavingUpi(true);
    setUpiError('');
    try {
      await supabase
        .from('room_members')
        .update({ upi_id: upiInputValue.trim() })
        .eq('id', memberId);

      setEditingUpiMemberId(null);
      if (onRefreshRoom) onRefreshRoom();
    } catch (err) {
      setUpiError(err.message || 'Failed to save UPI ID');
    } finally {
      setIsSavingUpi(false);
    }
  }

  async function handleJoinSubmit(e) {
    e.preventDefault();
    if (!joinCode.trim()) return;
    setIsJoining(true);
    setJoinMsg('');
    try {
      await onJoinRoom(joinCode.trim());
      setJoinCode('');
      setJoinMsg('Joined room successfully!');
      setTimeout(() => setJoinMsg(''), 3000);
    } catch (err) {
      setJoinMsg(err.message || 'Could not join room. Check code or token.');
    } finally {
      setIsJoining(false);
    }
  }

  return (
    <div className="flex flex-col gap-5 pb-16">
      {/* 1. Header with prominent Create Room Button */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold font-headline text-on-surface">
            Room Management
          </h1>
          <p className="text-xs text-on-surface-variant">
            Create, switch, or invite roommates
          </p>
        </div>

        <button
          onClick={onOpenCreateRoom}
          className="h-10 px-4 bg-secondary hover:bg-secondary-container text-on-secondary rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm active:scale-95 transition-all"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>Create New Room</span>
        </button>
      </div>

      {/* 2. Active Room Identity Card */}
      <div className="bg-surface-container-lowest rounded-2xl p-5 border border-surface-container shadow-xs flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-teal-500 animate-pulse" />
              <span className="text-[10px] font-bold uppercase tracking-wider text-secondary">
                Active Room
              </span>
            </div>
            <h2 className="text-base font-bold font-headline text-on-surface truncate mt-0.5">
              {currentRoom?.name || 'Flat 402'}
            </h2>
            <p className="text-xs text-on-surface-variant mt-0.5">
              {members.length} Active Roommates • {currentRoom?.settings?.address || 'Shared Living Flat'}
            </p>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={onOpenRoomSettings}
              className="h-9 px-3 bg-surface-container-low hover:bg-surface-container text-on-surface rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all active:scale-95"
              title="Room Settings (Rename, Delete)"
            >
              <Settings className="w-3.5 h-3.5 text-outline" />
              <span>Settings</span>
            </button>

            <button
              onClick={onOpenInvite}
              className="h-9 px-3.5 bg-secondary hover:bg-secondary-container text-on-secondary rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all active:scale-95"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Invite</span>
            </button>
          </div>
        </div>
      </div>

      {/* 3. Your Rooms List (Switch or Create) */}
      <div className="flex flex-col gap-2.5">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">
            Your Rooms ({userRooms.length})
          </h3>
          <span className="text-[11px] text-outline">Tap to switch active room</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {userRooms.map(room => {
            const isSelected = room.id === currentRoom?.id;
            return (
              <button
                key={room.id}
                onClick={() => onSwitchRoom(room.id)}
                className={`flex items-center justify-between p-3.5 rounded-2xl border text-left transition-all ${
                  isSelected
                    ? 'bg-secondary-fixed/40 border-secondary text-on-surface shadow-xs'
                    : 'bg-surface-container-lowest border-surface-container hover:bg-surface-container-low text-on-surface'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
                      isSelected
                        ? 'bg-secondary text-white'
                        : 'bg-surface-container text-on-surface-variant'
                    }`}
                  >
                    <Building2 className="w-4 h-4" />
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-xs font-bold truncate">{room.name}</span>
                    <span className="text-[11px] text-on-surface-variant truncate">
                      {room.settings?.address || 'Shared Flat'}
                    </span>
                  </div>
                </div>

                {isSelected && (
                  <div className="w-5 h-5 rounded-full bg-secondary text-white flex items-center justify-center flex-shrink-0">
                    <Check className="w-3 h-3 stroke-[3]" />
                  </div>
                )}
              </button>
            );
          })}

          {/* Quick Create Room Card */}
          <button
            onClick={onOpenCreateRoom}
            className="flex items-center justify-center gap-2 p-3.5 rounded-2xl border border-dashed border-outline-variant hover:border-secondary bg-surface-container-low hover:bg-surface-container text-secondary transition-all"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span className="text-xs font-bold">+ Create Another Room</span>
          </button>
        </div>
      </div>

      {/* 4. Join a Room with Invite Link or Code */}
      <div className="p-4 bg-surface-container-lowest rounded-2xl border border-surface-container flex flex-col gap-2">
        <span className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">
          Join an Existing Room
        </span>
        <p className="text-xs text-on-surface-variant">
          Enter an invite token or room code shared by your flatmate:
        </p>

        {joinMsg && (
          <div className="p-2.5 rounded-xl bg-surface-container text-xs font-medium text-on-surface">
            {joinMsg}
          </div>
        )}

        <form onSubmit={handleJoinSubmit} className="flex gap-2 mt-1">
          <input
            type="text"
            placeholder="e.g. rs_abc123xyz or room ID"
            value={joinCode}
            onChange={e => setJoinCode(e.target.value)}
            className="flex-1 h-11 px-3.5 rounded-xl bg-surface-container-low border border-outline-variant text-xs outline-none focus:border-secondary font-mono"
          />
          <button
            type="submit"
            disabled={isJoining || !joinCode.trim()}
            className="h-11 px-4 bg-secondary hover:bg-secondary-container text-on-secondary rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all disabled:opacity-50"
          >
            {isJoining ? 'Joining...' : 'Join Room'}
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>

      {/* 5. Room Members of Active Room */}
      <div className="flex flex-col gap-2.5">
        <h3 className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">
          Roommates in {currentRoom?.name || 'this room'} ({members.length})
        </h3>

        <div className="flex flex-col gap-2">
          {members.map(member => {
            const isMe = member.user_id === currentUserId;
            const isAdmin = member.role === 'admin';

            return (
              <div
                key={member.id}
                className="flex items-center justify-between p-3.5 bg-surface-container-lowest rounded-2xl border border-surface-container shadow-xs"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-secondary/10 text-secondary flex items-center justify-center font-bold text-sm">
                    {member.display_name?.slice(0, 1).toUpperCase()}
                  </div>

                  <div className="flex flex-col">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-on-surface">
                        {member.display_name}
                      </span>
                      {isMe && (
                        <span className="px-1.5 py-0.2 rounded-full bg-secondary-fixed text-on-secondary-fixed text-[10px] font-bold">
                          You
                        </span>
                      )}
                    </div>
                    {editingUpiMemberId === member.id ? (
                      <div className="flex flex-col gap-1 mt-1">
                        <div className="flex items-center gap-1.5">
                          <input
                            type="text"
                            placeholder="yourname@bank"
                            value={upiInputValue}
                            onChange={e => setUpiInputValue(e.target.value)}
                            className="h-8 px-2.5 rounded-lg bg-surface-container border border-outline-variant text-[11px] font-mono outline-none focus:border-secondary"
                          />
                          <button
                            onClick={() => handleSaveMyUpi(member.id)}
                            disabled={isSavingUpi}
                            className="h-8 px-2.5 bg-secondary text-white text-[11px] font-bold rounded-lg"
                          >
                            Save
                          </button>
                          <button
                            onClick={() => {
                              setEditingUpiMemberId(null);
                              setUpiError('');
                            }}
                            className="h-8 px-2 text-outline text-[11px]"
                          >
                            <CloseIcon className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        {upiError && <span className="text-[10px] text-error font-medium">{upiError}</span>}
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="text-[11px] text-on-surface-variant font-mono">
                          {member.upi_id ? `UPI: ${member.upi_id}` : 'No UPI configured'}
                        </span>
                        {isMe && (
                          <button
                            onClick={() => {
                              setEditingUpiMemberId(member.id);
                              setUpiInputValue(member.upi_id || '');
                              setUpiError('');
                            }}
                            className="text-[10px] text-secondary font-semibold hover:underline flex items-center gap-0.5"
                          >
                            <Edit2 className="w-2.5 h-2.5" />
                            <span>{member.upi_id ? 'Change' : '+ Add UPI'}</span>
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  {isAdmin ? (
                    <span className="px-2 py-0.5 rounded-full bg-primary-container text-white text-[10px] font-bold flex items-center gap-1">
                      <Shield className="w-2.5 h-2.5" />
                      Admin
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-full bg-surface-container text-on-surface-variant text-[10px] font-medium">
                      Member
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
