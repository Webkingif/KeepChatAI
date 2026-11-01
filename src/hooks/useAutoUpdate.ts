import { useEffect } from 'react';

/**
 * useAutoUpdate
 * Ensures the user is always running the latest deployed version of the website.
 * Proactively checks on page open, visibility/focus changes, and periodic intervals.
 */
export function useAutoUpdate() {
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Check for updates via Service Worker registration
    const checkServiceWorkerUpdate = async () => {
      if ('serviceWorker' in navigator) {
        try {
          const registration = await navigator.serviceWorker.getRegistration();
          if (registration) {
            await registration.update();
          }
        } catch (err) {
          // Silent catch in offline or restricted environments
        }
      }
    };

    // 1. Immediately check when app loads / opens
    checkServiceWorkerUpdate();

    // 2. Re-check whenever the tab or PWA becomes active/focused
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        checkServiceWorkerUpdate();
      }
    };

    window.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', checkServiceWorkerUpdate);

    // 3. Periodic update check every 5 minutes
    const interval = setInterval(checkServiceWorkerUpdate, 5 * 60 * 1000);

    return () => {
      window.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', checkServiceWorkerUpdate);
      clearInterval(interval);
    };
  }, []);
}
