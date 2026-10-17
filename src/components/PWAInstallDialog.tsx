import React, { useState, useEffect } from 'react';
import {
  Download,
  X,
  Zap,
  ShieldCheck,
  Smartphone,
  Laptop,
  Share2,
  PlusSquare,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { KeepChatLogo } from './KeepChatLogo';

interface PWAInstallDialogProps {
  onToast?: (message: string, type?: 'info' | 'success' | 'error') => void;
}

export const PWAInstallDialog: React.FC<PWAInstallDialogProps> = ({ onToast }) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [isOpen, setIsOpen] = useState(false);
  const [isInstalling, setIsInstalling] = useState(false);
  const [showIOSSteps, setShowIOSSteps] = useState(false);

  // Whenever the user opens the page, if they haven't installed the PWA, pop up the dialog box
  useEffect(() => {
    if (!isInstalled) {
      // Gentle 450ms delay so the application layout renders smoothly before the dialog pops up
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, 450);
      return () => clearTimeout(timer);
    } else {
      setIsOpen(false);
    }
  }, [isInstalled]);

  // Handle keyboard Escape to dismiss for current session
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  const handleInstallClick = async () => {
    setIsInstalling(true);
    try {
      const result = await install();
      if (result) {
        setIsOpen(false);
        if (onToast) {
          onToast(
            'KeepChat installed successfully! Launch it anytime from your home screen or dock.',
            'success'
          );
        }
      }
    } catch (err) {
      console.error('[KeepChat PWA] Install dialog error:', err);
      if (onToast) {
        onToast('Installation prompt could not be completed. Try from browser menu.', 'error');
      }
    } finally {
      setIsInstalling(false);
    }
  };

  const handleDismiss = () => {
    setIsOpen(false);
  };

  if (isInstalled || !isOpen) {
    return null;
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="pwa-dialog-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
    >
      <div
        className="w-full max-w-md bg-white dark:bg-[#202c33] rounded-2xl shadow-2xl border border-slate-200/90 dark:border-[#2a3942] overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header Banner with Emerald / Teal Accents */}
        <div className="relative bg-gradient-to-br from-[#008069] to-[#005c4b] p-6 text-white text-center flex flex-col items-center">
          {/* Close button */}
          <button
            type="button"
            onClick={handleDismiss}
            aria-label="Dismiss installation dialog"
            className="absolute top-3.5 right-3.5 p-1.5 rounded-full text-white/80 hover:text-white hover:bg-black/15 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Recommended Badge */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-[11px] font-semibold text-emerald-100 uppercase tracking-wider mb-3 shadow-2xs">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>Recommended Installation</span>
          </div>

          {/* App Logo */}
          <div className="relative mb-2">
            <div className="w-18 h-18 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center shadow-lg border border-white/20">
              <KeepChatLogo size={52} variant="icon" />
            </div>
            <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-amber-400 text-slate-900 flex items-center justify-center shadow-sm">
              <Download className="w-3.5 h-3.5 stroke-[2.5]" />
            </div>
          </div>

          <h2 id="pwa-dialog-title" className="text-xl font-bold text-white tracking-tight">
            Install KeepChat App
          </h2>
          <p className="text-xs text-emerald-100/90 mt-1 max-w-xs leading-relaxed">
            Get the full progressive web application experience with 100% offline access and instant loading.
          </p>
        </div>

        {/* Dialog Body: Why Install Benefits */}
        <div className="p-5 space-y-4 text-slate-700 dark:text-slate-200 text-sm">
          <div className="space-y-2.5">
            <div className="flex items-start gap-3 p-2.5 rounded-xl bg-slate-50 dark:bg-[#111b21]/70 border border-slate-100 dark:border-[#2a3942]/60">
              <div className="w-8 h-8 rounded-lg bg-teal-500/10 dark:bg-teal-500/20 text-[#00a884] dark:text-teal-400 flex items-center justify-center shrink-0 mt-0.5">
                <Zap className="w-4 h-4 stroke-[2.5]" />
              </div>
              <div className="text-xs">
                <span className="font-semibold text-slate-900 dark:text-white block">
                  100% Offline Vault
                </span>
                <span className="text-slate-500 dark:text-slate-400 leading-normal">
                  Access and search your saved AI outputs anytime, even when disconnected from the internet.
                </span>
              </div>
            </div>

            <div className="flex items-start gap-3 p-2.5 rounded-xl bg-slate-50 dark:bg-[#111b21]/70 border border-slate-100 dark:border-[#2a3942]/60">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                <Smartphone className="w-4 h-4 stroke-[2.5]" />
              </div>
              <div className="text-xs">
                <span className="font-semibold text-slate-900 dark:text-white block">
                  Standalone App Window
                </span>
                <span className="text-slate-500 dark:text-slate-400 leading-normal">
                  Enjoy an immersive, full-screen experience with no browser address bars, tabs, or clutter.
                </span>
              </div>
            </div>

            <div className="flex items-start gap-3 p-2.5 rounded-xl bg-slate-50 dark:bg-[#111b21]/70 border border-slate-100 dark:border-[#2a3942]/60">
              <div className="w-8 h-8 rounded-lg bg-blue-500/10 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 mt-0.5">
                <ShieldCheck className="w-4 h-4 stroke-[2.5]" />
              </div>
              <div className="text-xs">
                <span className="font-semibold text-slate-900 dark:text-white block">
                  Private & High Performance
                </span>
                <span className="text-slate-500 dark:text-slate-400 leading-normal">
                  Local-first storage in IndexedDB guarantees zero network lag and total privacy.
                </span>
              </div>
            </div>
          </div>

          {/* iOS Specific Instructions if on Apple Device */}
          {isIOS && (
            <div className="p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/40 rounded-xl text-xs text-amber-900 dark:text-amber-200">
              <div className="flex items-center justify-between font-semibold mb-1">
                <span className="flex items-center gap-1.5">
                  <Smartphone className="w-3.5 h-3.5" />
                  iOS Safari Installation
                </span>
                <button
                  type="button"
                  onClick={() => setShowIOSSteps(!showIOSSteps)}
                  className="text-amber-700 dark:text-amber-300 underline cursor-pointer text-[11px]"
                >
                  {showIOSSteps ? 'Hide steps' : 'View steps'}
                </button>
              </div>
              {showIOSSteps ? (
                <ol className="list-decimal list-inside space-y-1 mt-1 text-[11px] text-amber-800 dark:text-amber-300">
                  <li className="flex items-center gap-1.5">
                    <span>1. Tap the Share button</span>
                    <Share2 className="w-3 h-3 inline text-blue-500" />
                    <span>in Safari's bottom toolbar</span>
                  </li>
                  <li className="flex items-center gap-1.5">
                    <span>2. Scroll down &amp; tap</span>
                    <strong className="inline-flex items-center gap-1 text-slate-900 dark:text-white">
                      <PlusSquare className="w-3 h-3 inline" /> "Add to Home Screen"
                    </strong>
                  </li>
                  <li>3. Tap "Add" at the top right to launch from your home screen</li>
                </ol>
              ) : (
                <p className="text-[11px] text-amber-800/90 dark:text-amber-300/90">
                  Tap Share <Share2 className="w-3 h-3 inline text-blue-500 mx-0.5" /> then select "Add to Home Screen".
                </p>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="pt-2 space-y-2">
            <button
              type="button"
              onClick={handleInstallClick}
              disabled={isInstalling}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-semibold text-white bg-[#00a884] hover:bg-[#008069] active:bg-[#00705a] shadow-md hover:shadow-lg transition-all duration-150 text-sm cursor-pointer disabled:opacity-75 active:scale-[0.99]"
            >
              {isInstalling ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin inline-block" />
                  <span>Installing KeepChat...</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4 stroke-[2.5]" />
                  <span>Install App Now</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleDismiss}
              className="w-full py-2.5 px-4 rounded-xl text-xs font-medium text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-[#2a3942]/60 transition-colors cursor-pointer text-center"
            >
              Maybe Later
            </button>
          </div>

          {/* Subtext info */}
          <div className="flex items-center justify-center gap-3 pt-1 text-[11px] text-slate-400 dark:text-slate-500">
            <span className="inline-flex items-center gap-1">
              <Laptop className="w-3 h-3" /> Chrome &amp; Edge
            </span>
            <span>•</span>
            <span className="inline-flex items-center gap-1">
              <Smartphone className="w-3 h-3" /> Android &amp; iOS
            </span>
            <span>•</span>
            <span className="inline-flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 text-emerald-500" /> Free &amp; Lightweight
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
