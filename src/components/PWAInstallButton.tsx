import React, { useState } from 'react';
import { Download, Share2, PlusSquare, X, Check, Laptop, Smartphone, RefreshCw } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { KeepChatLogo } from './KeepChatLogo';

interface PWAInstallButtonProps {
  variant?: 'header' | 'card';
  className?: string;
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({
  variant = 'header',
  className = '',
}) => {
  const { isInstallable, isInstalled, isIOS, install, uninstall } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);
  const [isInstalling, setIsInstalling] = useState(false);

  const handleInstallClick = async () => {
    setIsInstalling(true);
    try {
      await install();
    } catch (err) {
      console.error('[KeepChat PWA] Install error:', err);
    } finally {
      setIsInstalling(false);
    }
  };

  // If already running in standalone mode or marked as installed
  if (isInstalled) {
    if (variant === 'card') {
      return (
        <div className={`p-4 bg-emerald-50/80 dark:bg-emerald-950/30 rounded-xl border border-emerald-200 dark:border-emerald-800/40 text-xs text-emerald-900 dark:text-emerald-200 space-y-3 transition-all ${className}`}>
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-xs">
              <Check className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-sm text-emerald-950 dark:text-emerald-100">
                KeepChat App Installed
              </h3>
              <p className="text-xs text-emerald-800/90 dark:text-emerald-300/90 mt-0.5 leading-relaxed">
                KeepChat is running as an installed Progressive Web App with instant offline vault access, desktop & mobile integration, and standalone performance.
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-emerald-200/60 dark:border-emerald-800/30 text-[11px]">
            <span className="text-emerald-700/80 dark:text-emerald-400 font-medium">
              Offline mode ready
            </span>
            <button
              type="button"
              onClick={uninstall}
              className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-700 dark:text-emerald-400 hover:text-emerald-900 dark:hover:text-emerald-200 underline cursor-pointer"
              title="Uninstall KeepChat"
            >
              <RefreshCw className="w-3 h-3" />
              Uninstall KeepChat
            </button>
          </div>
        </div>
      );
    }
    return null;
  }

  return (
    <>
      {variant === 'header' ? (
        <button
          type="button"
          onClick={handleInstallClick}
          disabled={isInstalling}
          className={`p-2 rounded-full text-slate-600 dark:text-slate-300 hover:text-[#00a884] dark:hover:text-teal-400 hover:bg-slate-200/70 dark:hover:bg-[#2a3942] transition-colors cursor-pointer relative disabled:opacity-50 ${className}`}
          title="Install KeepChat App (Desktop / Mobile)"
          aria-label="Install KeepChat App"
        >
          {isInstalling ? (
            <span className="w-5 h-5 border-2 border-[#00a884] border-t-transparent rounded-full animate-spin inline-block" />
          ) : (
            <Download className="w-5 h-5" />
          )}
          <span className="sr-only">Install KeepChat</span>
        </button>
      ) : (
        /* Settings Card Variant */
        <div className={`p-4 bg-white dark:bg-[#202c33] rounded-xl border border-slate-200/80 dark:border-[#2a3942] shadow-2xs space-y-3 ${className}`}>
          <div className="flex items-start gap-3">
            <KeepChatLogo size={42} variant="icon" className="shrink-0 drop-shadow-xs" />
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                Install KeepChat App
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
                Add KeepChat to your home screen or dock for instant offline access, full-screen view, and native performance.
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center gap-2 text-[11px] text-slate-400 dark:text-slate-500">
              <span className="inline-flex items-center gap-1">
                <Laptop className="w-3.5 h-3.5" /> Desktop
              </span>
              <span>•</span>
              <span className="inline-flex items-center gap-1">
                <Smartphone className="w-3.5 h-3.5" /> Mobile
              </span>
              {isIOS && (
                <>
                  <span>•</span>
                  <button
                    type="button"
                    onClick={() => setShowIOSGuide(true)}
                    className="text-teal-600 dark:text-teal-400 hover:underline cursor-pointer"
                  >
                    iOS Guide
                  </button>
                </>
              )}
            </div>

            <button
              type="button"
              onClick={handleInstallClick}
              disabled={isInstalling}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold text-white bg-[#00a884] hover:bg-[#008069] active:bg-[#00705a] transition-all shadow-xs active:scale-95 cursor-pointer disabled:opacity-70"
              aria-label="Install KeepChat App"
            >
              {isInstalling ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin inline-block" />
                  <span>Installing...</span>
                </>
              ) : (
                <>
                  <Download className="w-3.5 h-3.5" />
                  <span>Install App</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* iOS / Browser Guided Installation Modal (Only when explicitly opened) */}
      {showIOSGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-2xs animate-in fade-in duration-150">
          <div className="w-full max-w-sm bg-white dark:bg-[#202c33] rounded-2xl shadow-2xl border border-slate-200 dark:border-[#2a3942] p-5 space-y-4">
            <div className="flex items-center justify-between pb-1 border-b border-slate-100 dark:border-[#2a3942]">
              <div className="flex items-center gap-2">
                <KeepChatLogo size={28} variant="icon" />
                <h4 className="font-semibold text-sm text-slate-900 dark:text-white">
                  Install KeepChat
                </h4>
              </div>
              <button
                type="button"
                onClick={() => setShowIOSGuide(false)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                aria-label="Close guide"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {isIOS ? (
              <div className="space-y-3 text-xs text-slate-600 dark:text-slate-300">
                <p>To install KeepChat on your iPhone or iPad home screen:</p>
                <ol className="space-y-2.5 list-decimal pl-4">
                  <li className="leading-relaxed">
                    Tap the <strong className="text-slate-900 dark:text-white">Share</strong> button in Safari's toolbar{' '}
                    <Share2 className="inline w-3.5 h-3.5 text-blue-500 -mt-0.5" />.
                  </li>
                  <li className="leading-relaxed">
                    Scroll down and select <strong className="text-slate-900 dark:text-white">Add to Home Screen</strong>{' '}
                    <PlusSquare className="inline w-3.5 h-3.5 text-slate-700 dark:text-slate-300 -mt-0.5" />.
                  </li>
                  <li className="leading-relaxed">
                    Tap <strong className="text-slate-900 dark:text-white">Add</strong> in the top-right corner to finish.
                  </li>
                </ol>
              </div>
            ) : (
              <div className="space-y-3 text-xs text-slate-600 dark:text-slate-300">
                <p>To install KeepChat in your browser:</p>
                <ul className="space-y-2 list-disc pl-4">
                  <li>
                    Look for the <strong className="text-slate-900 dark:text-white">Install</strong> icon in your browser address bar (top right).
                  </li>
                  <li>
                    Open settings and then click the install app button.
                  </li>
                </ul>
              </div>
            )}

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  setShowIOSGuide(false);
                  handleInstallClick();
                }}
                className="flex-1 py-2 rounded-xl text-xs font-semibold text-white bg-[#00a884] hover:bg-[#008069] transition-colors cursor-pointer"
              >
                Install App
              </button>
              <button
                type="button"
                onClick={() => setShowIOSGuide(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-[#111b21] hover:bg-slate-200 dark:hover:bg-[#2a3942] transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
