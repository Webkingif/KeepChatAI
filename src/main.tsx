import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import 'katex/dist/katex.min.css';
import './index.css';
import { registerSW } from 'virtual:pwa-register';

// Track page refresh state to prevent duplicate reloads
let isRefreshing = false;

// When an updated service worker takes control (via skipWaiting), reload immediately so user always sees the newest version
if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (!isRefreshing) {
      isRefreshing = true;
      window.location.reload();
    }
  });
}

// Register Service Worker with automatic update & immediate activation
const updateSW = registerSW({
  immediate: true,
  onNeedRefresh() {
    console.log('[KeepChat PWA] New update available, applying immediately...');
    // Force newly installed service worker to take control and activate
    updateSW(true);
  },
  onRegisteredSW(swUrl, registration) {
    if (registration) {
      // 1. Check for updates immediately when user opens the app
      registration.update().catch(() => {});

      // 2. Check for updates whenever user returns to or focuses the window/PWA
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') {
          registration.update().catch(() => {});
        }
      });
      window.addEventListener('focus', () => {
        registration.update().catch(() => {});
      });

      // 3. Proactively check in background every 5 minutes
      setInterval(() => {
        registration.update().catch(() => {});
      }, 5 * 60 * 1000);
    }
  },
  onOfflineReady() {
    console.log('[KeepChat PWA] App is ready to work 100% offline.');
  },
});

createRoot(document.getElementById('root')!).render(<App />);
