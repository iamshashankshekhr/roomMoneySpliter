import React from 'react';
import { Wifi, WifiOff, RefreshCw, CheckCircle2 } from 'lucide-react';

export function SyncStatusBar({ isOnline, pendingCount, isSyncing, onManualSync }) {
  return (
    <div className="px-4 py-2 flex items-center justify-between text-xs text-on-surface-variant bg-surface select-none">
      <div className="flex items-center gap-2">
        {isOnline ? (
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-500 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-teal-500"></span>
          </span>
        ) : (
          <span className="h-2 w-2 rounded-full bg-amber-500"></span>
        )}

        <span className="font-medium flex items-center gap-1.5">
          {isOnline ? (
            pendingCount > 0 ? (
              <span className="text-amber-700 font-semibold flex items-center gap-1">
                <RefreshCw className={`w-3 h-3 ${isSyncing ? 'animate-spin' : ''}`} />
                {pendingCount} changes syncing...
              </span>
            ) : (
              <span>Online & Synced • Ready</span>
            )
          ) : (
            <span className="text-amber-800 font-semibold flex items-center gap-1">
              <WifiOff className="w-3 h-3" />
              Offline Mode • Saved locally
            </span>
          )}
        </span>
      </div>

      <div className="flex items-center gap-1.5">
        {pendingCount > 0 && isOnline && (
          <button
            onClick={onManualSync}
            disabled={isSyncing}
            className="px-2 py-0.5 rounded-full bg-surface-container-high hover:bg-secondary-fixed text-[11px] font-semibold text-secondary flex items-center gap-1 transition-colors"
          >
            <RefreshCw className={`w-2.5 h-2.5 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>Sync Now</span>
          </button>
        )}
        <div className="flex items-center gap-1 bg-surface-container-high px-2 py-0.5 rounded-full text-on-surface-variant text-[11px] font-medium">
          <CheckCircle2 className="w-3 h-3 text-teal-600" />
          <span>Cache Ready</span>
        </div>
      </div>
    </div>
  );
}
