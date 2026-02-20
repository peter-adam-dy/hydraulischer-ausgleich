import { useState, useEffect, useCallback } from 'react';

const CHECK_INTERVAL = 5 * 60 * 1000; // 5 minutes

export function useUpdateCheck() {
  const [updateAvailable, setUpdateAvailable] = useState(false);

  const checkForUpdate = useCallback(async () => {
    try {
      const res = await fetch(`/version.json?t=${Date.now()}`);
      if (!res.ok) return;
      const data = await res.json();
      if (data.hash && data.hash !== __GIT_HASH__) {
        setUpdateAvailable(true);
      }
    } catch {
      // Offline or fetch failed — ignore
    }
  }, []);

  useEffect(() => {
    // Initial check after a short delay
    const initialTimeout = setTimeout(checkForUpdate, 10_000);
    // Then check every 5 minutes
    const interval = setInterval(checkForUpdate, CHECK_INTERVAL);
    return () => {
      clearTimeout(initialTimeout);
      clearInterval(interval);
    };
  }, [checkForUpdate]);

  const dismiss = useCallback(() => setUpdateAvailable(false), []);

  return { updateAvailable, dismiss };
}
