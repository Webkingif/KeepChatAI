import React, { useState } from 'react';
import { X, FolderDown, Copy, Check, ShieldCheck, Database, MessageSquare, Tag, FileJson } from 'lucide-react';
import { ChatThread, SavedOutput, AppExportData } from '../types/keepchat';
import { exportBackup } from '../utils/storage';

interface BackupModalProps {
  isOpen: boolean;
  onClose: () => void;
  chats: ChatThread[];
  messages: SavedOutput[];
}

export const BackupModal: React.FC<BackupModalProps> = ({
  isOpen,
  onClose,
  chats,
  messages,
}) => {
  const [copied, setCopied] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [showJsonPreview, setShowJsonPreview] = useState(false);

  if (!isOpen) return null;

  const backupData: AppExportData = {
    version: '1.0.0',
    exportedAt: new Date().toISOString(),
    chats,
    messages,
  };

  const jsonString = JSON.stringify(backupData, null, 2);
  const totalTags = Array.from(new Set(messages.flatMap((m) => m.tags))).length;
  const fileSizeKb = (new Blob([jsonString]).size / 1024).toFixed(1);

  const handleDownload = () => {
    exportBackup(chats, messages);
    setDownloadSuccess(true);
    setTimeout(() => setDownloadSuccess(false), 3000);
  };

  const handleCopyJson = async () => {
    try {
      await navigator.clipboard.writeText(jsonString);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      const textarea = document.createElement('textarea');
      textarea.value = jsonString;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="relative w-full max-w-lg bg-white dark:bg-[#202c33] rounded-2xl shadow-2xl border border-slate-200 dark:border-[#2a3942] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 bg-slate-50 dark:bg-[#111b21] border-b border-slate-200 dark:border-[#2a3942]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-[#00a884]/10 dark:bg-[#00a884]/20 flex items-center justify-center text-[#00a884]">
              <FolderDown className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm md:text-base font-semibold text-slate-900 dark:text-white">
                Backup Vault Data
              </h2>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                100% offline & local data portability
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-[#2a3942] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4">
          {/* Summary Metric Cards */}
          <div className="grid grid-cols-3 gap-3">
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#182229] border border-slate-200/80 dark:border-[#2a3942] text-center">
              <Database className="w-4 h-4 mx-auto mb-1 text-teal-600 dark:text-teal-400" />
              <div className="text-lg font-bold text-slate-900 dark:text-white tabular-nums">
                {chats.length}
              </div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400">Threads</div>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#182229] border border-slate-200/80 dark:border-[#2a3942] text-center">
              <MessageSquare className="w-4 h-4 mx-auto mb-1 text-emerald-600 dark:text-emerald-400" />
              <div className="text-lg font-bold text-slate-900 dark:text-white tabular-nums">
                {messages.length}
              </div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400">Saved Outputs</div>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#182229] border border-slate-200/80 dark:border-[#2a3942] text-center">
              <Tag className="w-4 h-4 mx-auto mb-1 text-blue-600 dark:text-blue-400" />
              <div className="text-lg font-bold text-slate-900 dark:text-white tabular-nums">
                {totalTags}
              </div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400">Unique Tags</div>
            </div>
          </div>

          <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-50/70 dark:bg-[#00a884]/10 border border-emerald-200 dark:border-[#00a884]/20 text-xs text-emerald-800 dark:text-teal-300">
            <ShieldCheck className="w-4 h-4 shrink-0 text-[#00a884]" />
            <span>
              Your backup file is a clean, standard JSON payload (~{fileSizeKb} KB) containing all markdown text, code blocks, timestamps, and thread metadata.
            </span>
          </div>

          {/* Download and Copy Buttons */}
          <div className="space-y-2">
            <button
              onClick={handleDownload}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-[#00a884] hover:bg-[#008069] text-white font-medium text-sm transition-all shadow-xs active:scale-98 cursor-pointer"
            >
              {downloadSuccess ? (
                <>
                  <Check className="w-4 h-4 stroke-[2.5]" />
                  <span>Download Started!</span>
                </>
              ) : (
                <>
                  <FolderDown className="w-4 h-4" />
                  <span>Download .json Backup File</span>
                </>
              )}
            </button>

            <button
              onClick={handleCopyJson}
              className="w-full flex items-center justify-center gap-2 py-2 px-4 rounded-xl border border-slate-300 dark:border-[#2a3942] bg-white dark:bg-[#182229] hover:bg-slate-50 dark:hover:bg-[#202c33] text-slate-700 dark:text-slate-200 font-medium text-xs transition-colors cursor-pointer"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-[#00a884] dark:text-teal-400" />
                  <span className="text-[#00a884] dark:text-teal-400">Copied to Clipboard!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Raw JSON to Clipboard</span>
                </>
              )}
            </button>
          </div>

          {/* Toggle JSON preview */}
          <div>
            <button
              type="button"
              onClick={() => setShowJsonPreview(!showJsonPreview)}
              className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors cursor-pointer"
            >
              <FileJson className="w-3.5 h-3.5" />
              <span>{showJsonPreview ? 'Hide JSON preview' : 'View raw JSON preview'}</span>
            </button>

            {showJsonPreview && (
              <div className="mt-2 max-h-40 overflow-y-auto p-3 rounded-lg bg-slate-100 dark:bg-[#111b21] border border-slate-200 dark:border-[#2a3942] text-[11px] font-mono text-slate-700 dark:text-slate-300 select-all">
                <pre>{jsonString}</pre>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end px-5 py-3 bg-slate-50 dark:bg-[#111b21] border-t border-slate-200 dark:border-[#2a3942]">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-[#202c33] transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
