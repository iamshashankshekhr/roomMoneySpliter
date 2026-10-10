import React from 'react';
import { LogIn, LogOut, User, Sparkles, Building2 } from 'lucide-react';

export function AppHeader({ user, profile, onOpenAuth, onSignOut, roomName }) {
  return (
    <header className="fixed top-0 left-0 right-0 z-40 bg-surface/90 backdrop-blur-xl border-b border-surface-container pt-safe">
      <div className="max-w-2xl mx-auto h-16 px-4 flex items-center justify-between">
        {/* Logo & Room Title */}
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-primary-container text-white flex items-center justify-center font-bold font-headline text-base shadow-xs flex-shrink-0">
            RS
          </div>
          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-sm text-on-surface truncate font-headline">
                RoomSplit
              </span>
              <span className="px-1.5 py-0.2 rounded-full bg-secondary-fixed text-on-secondary-fixed text-[10px] font-bold">
                PWA
              </span>
            </div>
            <span className="text-[11px] text-on-surface-variant truncate">
              {roomName || 'Clear Ledger & Split'}
            </span>
          </div>
        </div>

        {/* Auth / Profile Actions */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {user ? (
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 bg-surface-container px-2.5 py-1 rounded-full text-xs font-semibold text-on-surface">
                <User className="w-3.5 h-3.5 text-secondary" />
                <span className="truncate max-w-[90px]">
                  {profile?.display_name || user.email?.split('@')[0]}
                </span>
              </div>
              <button
                onClick={onSignOut}
                title="Sign out"
                className="w-8 h-8 rounded-full bg-surface-container-low hover:bg-surface-container text-outline hover:text-on-surface flex items-center justify-center transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={onOpenAuth}
              className="h-9 px-3.5 bg-secondary hover:bg-secondary-container text-on-secondary text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-sm active:scale-95 transition-all"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Sign In</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
