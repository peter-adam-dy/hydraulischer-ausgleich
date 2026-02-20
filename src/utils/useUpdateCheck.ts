import { useState, useEffect, useCallback } from 'react';

const CHECK_INTERVAL = 5 * 60 * 1000; // 5 minutes

export function useUpdateCheck() {
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [checking, setChecking] = useState(false);
  const [lastChecked, setLastChecked] = useState<Date | null>(null);

  const checkForUpdate = useCallback(async () => {
    setChecking(true);
    try {
      const res = await fetch(`/version.json?t=${Date.now()}`);
      if (!res.ok) return;
      const data = await res.json();
      if (data.hash && data.hash !== __GIT_HASH__) {
        setUpdateAvailable(true);
      }
      setLastChecked(new Date());
    } catch {
      // Offline or fetch failed — ignore
    } finally {
      setChecking(false);
    }
  }, []);

  useEffect(() => {
    // Initial check after a short delay
    const initialTimeout = setTimeout(checkForUpdate, 5_000);
    // Then check every 5 minutes
    const interval = setInterval(checkForUpdate, CHECK_INTERVAL);

    // Check when app comes back to foreground
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        checkForUpdate();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      clearTimeout(initialTimeout);
      clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [checkForUpdate]);

  const dismiss = useCallback(() => setUpdateAvailable(false), []);

  return { updateAvailable, checking, lastChecked, checkForUpdate, dismiss };
}
