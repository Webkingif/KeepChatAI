import React, { useState } from 'react';
import { Download, Share2, PlusSquare, X, Check, Laptop, Smartphone } from 'lucide-react';
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
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);
  const [installedFeedback, setInstalledFeedback] = useState(false);

  const handleInstallClick = async () => {
    if (isIOS) {
      setShowIOSGuide(true);
      return;
    }

    if (isInstallable) {
      const success = await install();
      if (success) {
        setInstalledFeedback(true);
      }
    } else {
      // In case beforeinstallprompt hasn't fired yet or browser lacks API, open helpful guide
      setShowIOSGuide(true);
    }
  };

  // If already running in standalone mode, show subtle installed state in card or hide in header
  if (isInstalled) {
    if (variant === 'card') {
      return (
        <div className="flex items-center gap-3 p-3.5 bg-emerald-50/70 dark:bg-emerald-950/30 rounded-xl border border-emerald-200 dark:border-emerald-800/40 text-xs text-emerald-800 dark:text-emerald-300">
          <div className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0">
            <Check className="w-4 h-4 stroke-[3]" />
          </div>
          <div>
            <p className="font-semibold text-emerald-900 dark:text-emerald-200">
              KeepChat App Installed
            </p>
            <p className="text-[11px] text-emerald-700/80 dark:text-emerald-400">
              You are running KeepChat as a native standalone application.
            </p>
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
          className={`p-2 rounded-full text-slate-600 dark:text-slate-300 hover:text-[#00a884] dark:hover:text-teal-400 hover:bg-slate-200/70 dark:hover:bg-[#2a3942] transition-colors cursor-pointer relative ${className}`}
          title="Install KeepChat App (Desktop / Mobile)"
        >
          <Download className="w-5 h-5" />
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
            </div>

            <button
              type="button"
              onClick={handleInstallClick}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold text-white bg-[#00a884] hover:bg-[#008069] transition-all shadow-xs active:scale-95 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{isIOS ? 'Install on iOS' : 'Install App'}</span>
            </button>
          </div>
        </div>
      )}

      {/* iOS / Browser Guided Installation Modal */}
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
                className="p-1 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
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
                    Or open the browser menu (<strong>⋮</strong> or <strong>⋯</strong>) and select <strong className="text-slate-900 dark:text-white">"Install KeepChat"</strong>.
                  </li>
                </ul>
              </div>
            )}

            <button
              type="button"
              onClick={() => setShowIOSGuide(false)}
              className="w-full py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-[#111b21] hover:bg-slate-200 dark:hover:bg-[#2a3942] transition-colors cursor-pointer"
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </>
  );
};
