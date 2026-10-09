import React from 'react';
import { Plus, Lock, ArrowDown } from 'lucide-react';
import { KeepChatLogo } from './KeepChatLogo';

interface NoChatSelectedProps {
  onNewChat: () => void;
}

export const NoChatSelectedDesktop: React.FC<NoChatSelectedProps> = ({ onNewChat }) => {
  return (
    <div className="hidden md:flex flex-1 h-full flex-col items-center justify-center p-8 bg-[#f0f2f5] dark:bg-[#111b21] border-b-6 border-[#00a884] text-center select-none">
      <div className="max-w-md flex flex-col items-center">
        {/* Official KeepChat Logo with full brandmark */}
        <div className="mb-6 transform hover:scale-105 transition-transform duration-300">
          <KeepChatLogo size={128} variant="full" />
        </div>

        <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-2">
          KeepChat Vault
        </h2>

        {/* User requested copy */}
        <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed mb-6 max-w-xs">
          Select a chat to view your saved AI outputs, or create a new one.
        </p>

        {/* CTA */}
        <button
          onClick={onNewChat}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#00a884] hover:bg-[#008069] text-white font-medium text-sm shadow-md transition-all active:scale-95 cursor-pointer focus-visible:ring-2 focus-visible:ring-[#00a884] focus-visible:outline-none"
        >
          <Plus className="w-4 h-4" aria-hidden="true" />
          <span>New Chat Thread</span>
        </button>

        {/* WhatsApp End-to-end Encrypted aesthetic footer */}
        <div className="mt-12 flex items-center gap-1.5 text-xs text-slate-400 dark:text-slate-500">
          <Lock className="w-3.5 h-3.5" aria-hidden="true" />
          <span>Saved locally on your browser with 100% Markdown fidelity</span>
        </div>
      </div>
    </div>
  );
};

interface EmptyThreadProps {
  onInsertSample?: () => void;
}

export const EmptyThreadView: React.FC<EmptyThreadProps> = ({ onInsertSample }) => {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 text-center select-none min-h-[300px]">
      <div className="max-w-sm flex flex-col items-center">
        {/* KeepChat Logo Emblem */}
        <div className="mb-4">
          <KeepChatLogo size={56} variant="icon" />
        </div>

        {/* User requested copy */}
        <h3 className="text-base font-semibold text-slate-800 dark:text-slate-200 mb-1">
          No outputs saved yet.
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-5">
          Paste your AI response below.
        </p>

        {onInsertSample && (
          <button
            onClick={onInsertSample}
            type="button"
            className="text-xs font-medium text-[#00a884] dark:text-teal-400 hover:underline inline-flex items-center gap-1 cursor-pointer mb-2"
          >
            <span>Or click here to paste an example output</span>
          </button>
        )}

        <div className="mt-4 px-3 py-2 rounded-lg bg-white/60 dark:bg-[#182329]/60 border border-slate-200/80 dark:border-[#26353d] text-[11px] text-slate-500 dark:text-slate-400 max-w-xs">
          💡 <span className="font-semibold text-slate-700 dark:text-slate-300">Tip:</span> Ask your AI to <span className="font-mono text-[10.5px] text-teal-700 dark:text-teal-400">"Format as a copyable block of markdown"</span> for clean code, formulas & tables.
        </div>

        <div className="mt-5 flex items-center gap-1 text-slate-400 dark:text-slate-500 text-xs animate-bounce">
          <ArrowDown className="w-3.5 h-3.5" />
          <span>Paste in the bottom bar</span>
        </div>
      </div>
    </div>
  );
};
