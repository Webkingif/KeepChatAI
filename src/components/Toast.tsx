import React from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
}

interface ToastProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export const ToastContainer: React.FC<ToastProps> = ({ toasts, onDismiss }) => {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-sm pointer-events-none">
      {toasts.map((toast) => {
        let icon = <CheckCircle2 className="w-4 h-4 text-[#00a884] shrink-0" />;
        let borderClass = 'border-[#00a884]/30';

        if (toast.type === 'error') {
          icon = <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />;
          borderClass = 'border-rose-500/30';
        } else if (toast.type === 'info') {
          icon = <Info className="w-4 h-4 text-blue-500 shrink-0" />;
          borderClass = 'border-blue-500/30';
        }

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl bg-white dark:bg-[#202c33] text-slate-800 dark:text-slate-100 shadow-xl border ${borderClass} text-xs font-medium animate-in slide-in-from-top-2 duration-150`}
          >
            {icon}
            <span className="flex-1">{toast.message}</span>
            <button
              onClick={() => onDismiss(toast.id)}
              className="p-0.5 rounded text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
