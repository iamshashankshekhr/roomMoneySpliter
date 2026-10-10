import React, { useState } from 'react';
import { X, Building2, Check, Plus, LogIn, ArrowRight } from 'lucide-react';

export function RoomSwitcherModal({
  isOpen,
  onClose,
  rooms = [],
  currentRoomId,
  onSwitchRoom,
  onOpenCreateRoom,
  onJoinRoom,
}) {
  const [joinToken, setJoinToken] = useState('');
  const [isJoining, setIsJoining] = useState(false);
  const [joinError, setJoinError] = useState('');

  if (!isOpen) return null;

  async function handleJoinSubmit(e) {
    e.preventDefault();
    if (!joinToken.trim()) return;
    setIsJoining(true);
    setJoinError('');
    try {
      await onJoinRoom(joinToken.trim());
      setJoinToken('');
      onClose();
    } catch (err) {
      setJoinError(err.message || 'Invalid room invite token.');
    } finally {
      setIsJoining(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-primary-container/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-surface-container-lowest rounded-3xl p-6 shadow-2xl border border-surface-container-high text-on-surface">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-surface-container mb-4">
          <div>
            <h2 className="text-base font-bold font-headline">Your Rooms</h2>
            <p className="text-xs text-on-surface-variant">Switch or manage shared ledgers</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-surface-container-low flex items-center justify-center text-outline hover:text-on-surface transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Room List */}
        <div className="flex flex-col gap-2 mb-4 max-h-56 overflow-y-auto no-scrollbar">
          {rooms.map(room => {
            const isSelected = room.id === currentRoomId;
            return (
              <button
                key={room.id}
                onClick={() => {
                  onSwitchRoom(room.id);
                  onClose();
                }}
                className={`flex items-center justify-between p-3.5 rounded-2xl border text-left transition-all ${
                  isSelected
                    ? 'bg-secondary-fixed/30 border-secondary text-on-surface shadow-xs'
                    : 'bg-surface-container-low border-surface-container hover:bg-surface-container text-on-surface'
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
                      {room.settings?.address || 'Shared Room'}
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
        </div>

        {/* Action: Create New Room */}
        <button
          onClick={() => {
            onClose();
            onOpenCreateRoom();
          }}
          className="w-full h-11 bg-surface-container hover:bg-surface-container-high text-on-surface font-semibold text-xs rounded-xl flex items-center justify-center gap-2 transition-all mb-4"
        >
          <Plus className="w-4 h-4 text-secondary" />
          <span>+ Create Another Room</span>
        </button>

        {/* Join by Token / Code */}
        <div className="border-t border-surface-container pt-3">
          <span className="block text-[11px] font-bold uppercase tracking-wider text-on-surface-variant mb-2">
            Join with Invite Code or Link
          </span>

          {joinError && (
            <div className="mb-2 p-2 rounded-lg bg-error-container text-on-error-container text-[11px]">
              {joinError}
            </div>
          )}

          <form onSubmit={handleJoinSubmit} className="flex gap-2">
            <input
              type="text"
              placeholder="Paste invite code or link..."
              value={joinToken}
              onChange={e => setJoinToken(e.target.value)}
              className="flex-1 h-10 px-3 rounded-xl bg-surface-container-low border border-outline-variant text-xs outline-none focus:border-secondary font-mono"
            />
            <button
              type="submit"
              disabled={isJoining || !joinToken.trim()}
              className="h-10 px-3 bg-secondary hover:bg-secondary-container text-on-secondary rounded-xl text-xs font-bold flex items-center gap-1 transition-all disabled:opacity-50"
            >
              {isJoining ? 'Joining...' : 'Join'}
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
