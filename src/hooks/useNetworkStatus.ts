import { useState, useEffect, useCallback, useRef } from 'react';
import { soundFX } from '../utils/audio';

const OFFLINE_CHANGES_KEY = 'rr_family_pending_offline_changes_v1';

export interface NetworkStatus {
  isOnline: boolean;
  isReconnecting: boolean;
  justReconnected: boolean;
  pendingChangesCount: number;
  lastOnlineTime: Date | null;
  checkConnectionNow: () => Promise<boolean>;
  recordLocalChange: () => void;
  resetPendingChanges: () => void;
}

export function useNetworkStatus(onReconnect?: () => Promise<void> | void): NetworkStatus {
  const [isOnline, setIsOnline] = useState<boolean>(() => {
    if (typeof navigator !== 'undefined') {
      return navigator.onLine;
    }
    return true;
  });

  const [isReconnecting, setIsReconnecting] = useState<boolean>(false);
  const [justReconnected, setJustReconnected] = useState<boolean>(false);
  const [lastOnlineTime, setLastOnlineTime] = useState<Date | null>(() => new Date());

  const [pendingChangesCount, setPendingChangesCount] = useState<number>(() => {
    try {
      const stored = localStorage.getItem(OFFLINE_CHANGES_KEY);
      return stored ? parseInt(stored, 10) || 0 : 0;
    } catch {
      return 0;
    }
  });

  const onReconnectRef = useRef(onReconnect);
  useEffect(() => {
    onReconnectRef.current = onReconnect;
  }, [onReconnect]);

  // Record a local change made by the user
  const recordLocalChange = useCallback(() => {
    setPendingChangesCount((prev) => {
      const next = prev + 1;
      try {
        localStorage.setItem(OFFLINE_CHANGES_KEY, next.toString());
      } catch {
        // ignore
      }
      return next;
    });
  }, []);

  // Reset pending changes once synced with cloud
  const resetPendingChanges = useCallback(() => {
    setPendingChangesCount(0);
    try {
      localStorage.removeItem(OFFLINE_CHANGES_KEY);
    } catch {
      // ignore
    }
  }, []);

  // Active ping to verify real server reachability
  const checkConnectionNow = useCallback(async (): Promise<boolean> => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3500);

      const res = await fetch('/api/health', {
        method: 'GET',
        cache: 'no-store',
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      const reachable = res.ok;
      setIsOnline(reachable);
      if (reachable) {
        setLastOnlineTime(new Date());
      }
      return reachable;
    } catch {
      setIsOnline(false);
      return false;
    }
  }, []);

  // Listen to browser network events
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleOnline = async () => {
      setIsReconnecting(true);
      
      // Verify real connectivity with quick probe
      const reallyOnline = await checkConnectionNow();
      if (!reallyOnline) {
        setIsReconnecting(false);
        return;
      }

      setIsOnline(true);
      setJustReconnected(true);
      setLastOnlineTime(new Date());
      soundFX.playFanfare();

      // Trigger automatic background synchronization
      if (onReconnectRef.current) {
        try {
          await onReconnectRef.current();
          resetPendingChanges();
        } catch (err) {
          console.warn('[NetworkStatus] Error executing auto-sync on reconnect:', err);
        }
      }

      setIsReconnecting(false);

      // Dismiss "reconnected" notification after 4.5 seconds
      setTimeout(() => {
        setJustReconnected(false);
      }, 4500);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setJustReconnected(false);
      setIsReconnecting(false);
      soundFX.playPop();
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [checkConnectionNow, resetPendingChanges]);

  return {
    isOnline,
    isReconnecting,
    justReconnected,
    pendingChangesCount,
    lastOnlineTime,
    checkConnectionNow,
    recordLocalChange,
    resetPendingChanges,
  };
}
