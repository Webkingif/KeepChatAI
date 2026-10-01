import React from 'react';
import { ArrowLeft, Sun, Moon, Monitor, Check, Bot, Shield, Palette } from 'lucide-react';
import { ThemeMode } from '../types/keepchat';

interface SettingsViewProps {
  onBack: () => void;
  themeMode: ThemeMode;
  onSelectThemeMode: (mode: ThemeMode) => void;
  effectiveTheme: 'light' | 'dark';
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  onBack,
  themeMode,
  onSelectThemeMode,
  effectiveTheme,
}) => {
  const themeOptions: {
    mode: ThemeMode;
    title: string;
    description: string;
    icon: React.ElementType;
  }[] = [
    {
      mode: 'light',
      title: 'Light Theme',
      description: 'WhatsApp classic clean white and light gray layout',
      icon: Sun,
    },
    {
      mode: 'dark',
      title: 'Dark Theme',
      description: 'WhatsApp deep slate and dark charcoal palette',
      icon: Moon,
    },
    {
      mode: 'system',
      title: 'System Default',
      description: 'Automatically synchronizes with your device or operating system theme',
      icon: Monitor,
    },
  ];

  return (
    <div className="w-full md:w-[360px] lg:w-[400px] shrink-0 h-full flex flex-col bg-[#f0f2f5] dark:bg-[#111b21] border-r border-slate-200 dark:border-[#222d34] select-none transition-colors">
      {/* WhatsApp Native Top App Bar */}
      <div className="flex items-center gap-3 px-3 py-3 bg-[#008069] dark:bg-[#202c33] text-white min-h-[58px] shadow-xs">
        <button
          onClick={onBack}
          className="p-2 -ml-1 rounded-full hover:bg-black/15 transition-colors cursor-pointer"
          title="Back to chats"
        >
          <ArrowLeft className="w-5 h-5 text-white" />
        </button>
        <h1 className="font-semibold text-base tracking-tight text-white">
          Settings
        </h1>
      </div>

      {/* Settings Scrollable Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-5">
        {/* App Profile / Vault Card */}
        <div className="flex items-center gap-3.5 p-3.5 bg-white dark:bg-[#202c33] rounded-xl border border-slate-200/80 dark:border-[#2a3942] shadow-2xs">
          <div className="w-12 h-12 rounded-full bg-[#00a884] flex items-center justify-center text-white shrink-0 shadow-xs">
            <Bot className="w-6 h-6" />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-sm font-semibold text-slate-900 dark:text-white truncate">
              KeepChat Vault
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
              AI Output Organizer & Storage
            </p>
          </div>
        </div>

        {/* Section Header */}
        <div>
          <div className="flex items-center gap-2 mb-2 px-1">
            <Palette className="w-4 h-4 text-[#00a884] dark:text-teal-400" />
            <h3 className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              Appearance & Theme
            </h3>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-3 px-1 leading-relaxed">
            Choose how KeepChat looks to you on this device.
          </p>

          {/* Theme Option Cards */}
          <div className="space-y-2">
            {themeOptions.map((option) => {
              const Icon = option.icon;
              const isSelected = themeMode === option.mode;

              return (
                <div
                  key={option.mode}
                  onClick={() => onSelectThemeMode(option.mode)}
                  className={`flex items-start gap-3.5 p-3.5 rounded-xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-white dark:bg-[#202c33] border-[#00a884] shadow-xs'
                      : 'bg-white/70 dark:bg-[#182229]/80 border-slate-200/70 dark:border-[#2a3942] hover:bg-white dark:hover:bg-[#202c33]'
                  }`}
                >
                  {/* Option Icon */}
                  <div
                    className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                      isSelected
                        ? 'bg-[#00a884]/15 text-[#00a884] dark:text-teal-400'
                        : 'bg-slate-100 dark:bg-[#111b21] text-slate-500 dark:text-slate-400'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>

                  {/* Option Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span
                        className={`text-sm font-medium ${
                          isSelected
                            ? 'text-slate-900 dark:text-white font-semibold'
                            : 'text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        {option.title}
                      </span>

                      {/* Radio Selection Indicator */}
                      <div
                        className={`w-4 h-4 rounded-full border flex items-center justify-center transition-colors shrink-0 ${
                          isSelected
                            ? 'border-[#00a884] bg-[#00a884]'
                            : 'border-slate-300 dark:border-[#2a3942]'
                        }`}
                      >
                        {isSelected && <Check className="w-2.5 h-2.5 text-white stroke-[3]" />}
                      </div>
                    </div>

                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
                      {option.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Current Status Indicator */}
        <div className="p-3 bg-slate-100/80 dark:bg-[#182229] rounded-xl border border-slate-200/60 dark:border-[#2a3942] text-xs text-slate-600 dark:text-slate-400 space-y-1">
          <div className="flex items-center justify-between">
            <span className="font-medium text-slate-700 dark:text-slate-300">Active Theme</span>
            <span className="font-semibold text-[#00a884] dark:text-teal-400 capitalize">
              {effectiveTheme} Mode {themeMode === 'system' ? '(System)' : ''}
            </span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-500">
            {themeMode === 'system'
              ? 'Automatically adapts when your operating system switches between daylight and dark modes.'
              : `Permanently locked to ${themeMode} mode on this device.`}
          </p>
        </div>

        {/* Privacy & Storage Footer Note */}
        <div className="flex items-center gap-2 px-1 pt-4 border-t border-slate-200/60 dark:border-[#222d34] text-[11px] text-slate-400 dark:text-slate-500">
          <Shield className="w-3.5 h-3.5 text-[#00a884] shrink-0" />
          <span>All chats and settings remain 100% private and stored locally in IndexedDB.</span>
        </div>
      </div>
    </div>
  );
};
