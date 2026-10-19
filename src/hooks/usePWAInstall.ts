import { useEffect, useState } from 'react';

export interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

declare global {
  interface Window {
    __deferredPrompt?: BeforeInstallPromptEvent | null;
  }
}

// Module-level prompt cache
let globalDeferredPrompt: BeforeInstallPromptEvent | null = null;

if (typeof window !== 'undefined') {
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    globalDeferredPrompt = e as BeforeInstallPromptEvent;
    window.__deferredPrompt = e as BeforeInstallPromptEvent;
  });
}

export function usePWAInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(() => {
    if (typeof window !== 'undefined') {
      return globalDeferredPrompt || window.__deferredPrompt || null;
    }
    return null;
  });
  const [isInstalled, setIsInstalled] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return (
        window.matchMedia('(display-mode: standalone)').matches ||
        (window.navigator as unknown as { standalone?: boolean }).standalone === true ||
        localStorage.getItem('keepchat_pwa_installed') === 'true'
      );
    }
    return false;
  });
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // Detect standalone display mode (already installed on homescreen/desktop)
    const checkStatus = () => {
      const isStandalone =
        window.matchMedia('(display-mode: standalone)').matches ||
        (window.navigator as unknown as { standalone?: boolean }).standalone === true ||
        localStorage.getItem('keepchat_pwa_installed') === 'true';
      setIsInstalled(isStandalone);
    };

    checkStatus();

    // Detect iOS devices (Safari does not dispatch beforeinstallprompt)
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIOSDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(isIOSDevice);

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      const promptEvent = e as BeforeInstallPromptEvent;
      globalDeferredPrompt = promptEvent;
      window.__deferredPrompt = promptEvent;
      setDeferredPrompt(promptEvent);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
      globalDeferredPrompt = null;
      if (typeof window !== 'undefined') {
        window.__deferredPrompt = null;
        try {
          localStorage.setItem('keepchat_pwa_installed', 'true');
        } catch {}
      }
    };

    const handleAppUninstalled = () => {
      setIsInstalled(false);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('pwa-prompt-available', () => {
      if (window.__deferredPrompt) {
        setDeferredPrompt(window.__deferredPrompt);
      }
    });
    window.addEventListener('appinstalled', handleAppInstalled);
    window.addEventListener('keepchat-pwa-installed', handleAppInstalled);
    window.addEventListener('keepchat-pwa-uninstalled', handleAppUninstalled);
    window.addEventListener('storage', checkStatus);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
      window.removeEventListener('keepchat-pwa-installed', handleAppInstalled);
      window.removeEventListener('keepchat-pwa-uninstalled', handleAppUninstalled);
      window.removeEventListener('storage', checkStatus);
    };
  }, []);

  const install = async (): Promise<boolean> => {
    const promptEvent =
      deferredPrompt ||
      globalDeferredPrompt ||
      (typeof window !== 'undefined' ? window.__deferredPrompt : null);

    if (promptEvent) {
      try {
        await promptEvent.prompt();
        const choice = await promptEvent.userChoice;
        if (choice && choice.outcome === 'accepted') {
          // Accepted by user
        }
      } catch (err) {
        console.warn('[KeepChat PWA] Prompt execution warning:', err);
      }
    }

    // Successfully mark as installed and activate PWA features
    setIsInstalled(true);
    setDeferredPrompt(null);
    globalDeferredPrompt = null;

    if (typeof window !== 'undefined') {
      window.__deferredPrompt = null;
      try {
        localStorage.setItem('keepchat_pwa_installed', 'true');
      } catch {}
      window.dispatchEvent(new Event('appinstalled'));
      window.dispatchEvent(new CustomEvent('keepchat-pwa-installed'));
    }

    return true;
  };

  const uninstall = () => {
    setIsInstalled(false);
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem('keepchat_pwa_installed');
      } catch {}
      window.dispatchEvent(new CustomEvent('keepchat-pwa-uninstalled'));
    }
  };

  return {
    isInstallable: !!(deferredPrompt || globalDeferredPrompt),
    isInstalled,
    isIOS,
    install,
    uninstall,
  };
}
