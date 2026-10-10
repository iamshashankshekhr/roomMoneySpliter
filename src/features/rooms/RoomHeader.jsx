import React from 'react';
import { ChevronDown, Link as LinkIcon, Building2, Plus } from 'lucide-react';

export function RoomHeader({
  room,
  members,
  currentUserId,
  onOpenInvite,
  onOpenRoomSwitcher,
}) {
  const roomName = room?.name || 'Flat 402';
  const address = room?.settings?.address || 'Bellandur, BLR';

  const getInitials = (name) => {
    if (!name) return '?';
    return name.slice(0, 1).toUpperCase();
  };

  const avatarColors = [
    'bg-secondary text-on-secondary',
    'bg-primary-container text-white',
    'bg-slate-600 text-white',
    'bg-teal-700 text-white',
    'bg-indigo-600 text-white',
  ];

  return (
    <div className="flex flex-col gap-3">
      {/* Room Identity Card */}
      <div className="bg-surface-container-lowest rounded-2xl p-4 shadow-sm border border-surface-container flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="min-w-0 flex-1">
            {/* Interactive Room Switcher trigger */}
            <button
              type="button"
              onClick={onOpenRoomSwitcher}
              className="flex items-center gap-1.5 text-left group hover:opacity-80 transition-opacity"
              title="Click to switch or create rooms"
            >
              <Building2 className="w-4 h-4 text-secondary flex-shrink-0" />
              <h1 className="font-bold font-headline text-base text-on-surface truncate group-hover:text-secondary transition-colors">
                {roomName}
              </h1>
              <ChevronDown className="w-4 h-4 text-outline group-hover:text-on-surface transition-colors" />
            </button>
            <p className="text-xs text-on-surface-variant mt-0.5">
              {members.length} Roommates • {address}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onOpenInvite}
              className="h-9 px-3 bg-surface-container-low hover:bg-surface-container text-secondary rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all active:scale-95 flex-shrink-0"
              title="Copy Room Invite Link"
            >
              <LinkIcon className="w-3.5 h-3.5" />
              <span>Invite</span>
            </button>
          </div>
        </div>

        {/* Roommates Horizontal Avatars Row */}
        <div className="flex items-center gap-2 pt-1 overflow-x-auto no-scrollbar">
          {members.map((member, idx) => {
            const isMe = member.user_id === currentUserId;
            const colorClass = isMe
              ? 'bg-secondary text-on-secondary'
              : avatarColors[(idx + 1) % avatarColors.length];

            return (
              <div
                key={member.id}
                className={`flex items-center gap-1.5 pl-1 pr-3 py-1 rounded-full flex-shrink-0 ${
                  isMe ? 'bg-secondary-fixed/50' : 'bg-surface-container'
                }`}
              >
                <div
                  className={`w-6 h-6 rounded-full ${colorClass} text-[11px] flex items-center justify-center font-bold`}
                >
                  {getInitials(member.display_name)}
                </div>
                <span
                  className={`text-xs ${
                    isMe
                      ? 'text-on-secondary-fixed font-bold'
                      : 'text-on-surface font-medium'
                  }`}
                >
                  {member.display_name} {isMe ? '(You)' : ''}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
