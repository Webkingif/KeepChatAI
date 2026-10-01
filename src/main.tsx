import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import 'katex/dist/katex.min.css';
import './index.css';
import { registerSW } from 'virtual:pwa-register';

// Register Service Worker immediately for 100% offline functionality
registerSW({
  immediate: true,
  onNeedRefresh() {
    // When updated assets are available, reload active service worker
    window.location.reload();
  },
  onOfflineReady() {
    console.log('[KeepChat PWA] App is ready to work 100% offline.');
  },
});

createRoot(document.getElementById('root')!).render(<App />);
