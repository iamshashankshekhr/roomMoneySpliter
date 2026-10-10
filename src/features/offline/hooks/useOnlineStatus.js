import { useState, useEffect } from 'react';
import { syncOutboxQueue, getOutboxCount } from '../services/outboxManager';

export function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [pendingCount, setPendingCount] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);

  async function checkPending() {
    try {
      const count = await getOutboxCount();
      setPendingCount(count);
    } catch {
      // Ignore
    }
  }

  async function triggerSync() {
    if (!navigator.onLine || isSyncing) return;
    setIsSyncing(true);
    try {
      await syncOutboxQueue();
      await checkPending();
    } finally {
      setIsSyncing(false);
    }
  }

  useEffect(() => {
    checkPending();

    const handleOnline = () => {
      setIsOnline(true);
      triggerSync();
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return {
    isOnline,
    pendingCount,
    isSyncing,
    triggerSync,
    refreshPending: checkPending,
  };
}
