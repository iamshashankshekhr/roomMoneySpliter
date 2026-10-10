import React from 'react';
import { Users, UserPlus, Shield, Plus, ArrowRightLeft } from 'lucide-react';

export function RoomMemberList({
  members = [],
  currentUserId,
  onOpenInvite,
  onOpenCreateRoom,
  onOpenRoomSwitcher,
  room,
}) {
  return (
    <div className="flex flex-col gap-4 pb-12">
      {/* Room Overview Card */}
      <div className="bg-surface-container-lowest rounded-2xl p-5 border border-surface-container shadow-xs flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold font-headline text-on-surface">
              {room?.name || 'Flat 402'}
            </h2>
            <p className="text-xs text-on-surface-variant mt-0.5">
              {members.length} Active Roommates • {room?.settings?.address || 'Shared Living Flat'}
            </p>
          </div>

          <button
            onClick={onOpenInvite}
            className="h-9 px-3.5 bg-secondary hover:bg-secondary-container text-on-secondary rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm active:scale-95 transition-all"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Invite</span>
          </button>
        </div>

        {/* Room Switcher & Create Actions */}
        <div className="grid grid-cols-2 gap-2 pt-1 border-t border-surface-container">
          <button
            onClick={onOpenRoomSwitcher}
            className="h-9 px-3 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface text-xs font-semibold flex items-center justify-center gap-1.5 transition-all"
          >
            <ArrowRightLeft className="w-3.5 h-3.5 text-secondary" />
            <span>Switch Room</span>
          </button>

          <button
            onClick={onOpenCreateRoom}
            className="h-9 px-3 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface text-xs font-semibold flex items-center justify-center gap-1.5 transition-all"
          >
            <Plus className="w-3.5 h-3.5 text-secondary" />
            <span>+ Create Room</span>
          </button>
        </div>
      </div>

      {/* Roommates List */}
      <div className="flex flex-col gap-2">
        <h3 className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">
          Room Members ({members.length})
        </h3>

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
                  <span className="text-[11px] text-on-surface-variant">
                    {member.upi_id ? `UPI: ${member.upi_id}` : 'No UPI configured'}
                  </span>
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
  );
}
