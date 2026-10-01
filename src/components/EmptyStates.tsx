import React from 'react';
import { Bot, Plus, Sparkles, Lock, ArrowDown } from 'lucide-react';

interface NoChatSelectedProps {
  onNewChat: () => void;
}

export const NoChatSelectedDesktop: React.FC<NoChatSelectedProps> = ({ onNewChat }) => {
  return (
    <div className="hidden md:flex flex-1 h-full flex-col items-center justify-center p-8 bg-[#f0f2f5] dark:bg-[#111b21] border-b-6 border-[#00a884] text-center select-none">
      <div className="max-w-md flex flex-col items-center">
        {/* Modern Illustration / Badge */}
        <div className="relative mb-6">
          <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-emerald-500/20 via-teal-500/10 to-blue-500/20 dark:from-emerald-500/10 dark:to-teal-500/10 flex items-center justify-center border border-emerald-500/20 shadow-inner">
            <Bot className="w-12 h-12 text-[#00a884] dark:text-teal-400 stroke-[1.5]" />
          </div>
          <div className="absolute -bottom-1 -right-1 w-9 h-9 rounded-full bg-white dark:bg-[#202c33] shadow-md border border-slate-200 dark:border-[#2a3942] flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-amber-500" />
          </div>
        </div>

        {/* Title */}
        <h2 className="text-xl md:text-2xl font-bold text-slate-800 dark:text-slate-100 tracking-tight mb-2">
          KeepChat Web
        </h2>

        {/* User requested copy */}
        <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed mb-6">
          Select a chat to view your saved AI outputs, or create a new one.
        </p>

        {/* CTA */}
        <button
          onClick={onNewChat}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#00a884] hover:bg-[#008069] text-white font-medium text-sm shadow-md transition-all active:scale-95 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>New Chat Thread</span>
        </button>

        {/* WhatsApp End-to-end Encrypted aesthetic footer */}
        <div className="mt-12 flex items-center gap-1.5 text-xs text-slate-400 dark:text-slate-500">
          <Lock className="w-3.5 h-3.5" />
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
        <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-[#202c33] flex items-center justify-center text-slate-400 dark:text-slate-500 mb-4 border border-slate-200 dark:border-[#2a3942]">
          <Bot className="w-8 h-8 opacity-70" />
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
            className="text-xs font-medium text-[#00a884] dark:text-teal-400 hover:underline inline-flex items-center gap-1 cursor-pointer"
          >
            <span>Or click here to paste an example output</span>
          </button>
        )}

        <div className="mt-6 flex items-center gap-1 text-slate-400 dark:text-slate-500 text-xs animate-bounce">
          <ArrowDown className="w-3.5 h-3.5" />
          <span>Paste in the bottom bar</span>
        </div>
      </div>
    </div>
  );
};
