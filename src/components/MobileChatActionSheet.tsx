import React, { useState } from 'react';
import {
  Pin,
  PinOff,
  Edit2,
  Trash2,
  Download,
  MessageSquare,
  X,
  Code,
  Sparkles,
  Database,
  Brain,
  Terminal,
  FileText,
} from 'lucide-react';
import { ChatThread, MAX_PINNED_CHATS } from '../types/keepchat';

interface MobileChatActionSheetProps {
  chat: ChatThread | null;
  isOpen: boolean;
  onClose: () => void;
  onPinToggle: (chatId: string) => void;
  onSelectChat: (chatId: string) => void;
  onEditChat?: (chat: ChatThread) => void;
  onDeleteChat?: (chatId: string) => void;
  onExportMarkdown?: (chat: ChatThread) => void;
  pinnedCount: number;
}

const ICON_MAP: Record<string, React.ElementType> = {
  code: Code,
  sparkles: Sparkles,
  database: Database,
  brain: Brain,
  terminal: Terminal,
  'file-text': FileText,
};

export const MobileChatActionSheet: React.FC<MobileChatActionSheetProps> = ({
  chat,
  isOpen,
  onClose,
  onPinToggle,
  onSelectChat,
  onEditChat,
  onDeleteChat,
  onExportMarkdown,
  pinnedCount,
}) => {
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);

  if (!isOpen || !chat) return null;

  const IconCmp = (chat.iconName && ICON_MAP[chat.iconName]) || Sparkles;

  const handlePin = () => {
    onPinToggle(chat.id);
    onClose();
  };

  const handleSelect = () => {
    onSelectChat(chat.id);
    onClose();
  };

  const handleEdit = () => {
    if (onEditChat) onEditChat(chat);
    onClose();
  };

  const handleExport = () => {
    if (onExportMarkdown) onExportMarkdown(chat);
    onClose();
  };

  const handleDelete = () => {
    if (onDeleteChat) onDeleteChat(chat.id);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Bottom Sheet Modal Container */}
      <div className="relative w-full max-w-md bg-white dark:bg-[#202c33] rounded-t-2xl sm:rounded-2xl shadow-2xl border border-slate-200/80 dark:border-[#2a3942] z-50 overflow-hidden animate-in slide-in-from-bottom duration-250">
        {/* Top Drag Handle for mobile */}
        <div className="w-12 h-1 bg-slate-300 dark:bg-slate-600 rounded-full mx-auto my-2.5 sm:hidden" />

        {/* Header Preview of Selected Chat */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 dark:border-[#2a3942]/80 bg-slate-50/70 dark:bg-[#182229]/60">
          <div className="flex items-center gap-3 min-w-0">
            <div
              className={`w-10 h-10 rounded-full overflow-hidden flex items-center justify-center text-white shrink-0 shadow-xs ${
                chat.customAvatarUrl
                  ? 'border border-slate-200 dark:border-black/30'
                  : `bg-gradient-to-br ${chat.avatarColor || 'from-emerald-500 to-teal-700'}`
              }`}
            >
              {chat.customAvatarUrl ? (
                <img
                  src={chat.customAvatarUrl}
                  alt={chat.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <IconCmp className="w-5 h-5 stroke-[2.2]" />
              )}
            </div>
            <div className="min-w-0">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                {chat.title}
              </h3>
              <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                <span>{chat.category}</span>
                <span>•</span>
                {chat.isPinned ? (
                  <span className="inline-flex items-center gap-1 text-teal-600 dark:text-teal-400 font-medium">
                    <Pin className="w-3 h-3 rotate-45" />
                    Pinned to top
                  </span>
                ) : (
                  <span>{pinnedCount}/{MAX_PINNED_CHATS} pinned spots used</span>
                )}
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-[#2a3942] transition-colors cursor-pointer"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action List */}
        <div className="p-2 space-y-1">
          {/* Pin / Unpin Action (Primary feature) */}
          <button
            onClick={handlePin}
            className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-left transition-colors cursor-pointer ${
              chat.isPinned
                ? 'bg-teal-50 dark:bg-teal-950/30 text-teal-800 dark:text-teal-200 hover:bg-teal-100 dark:hover:bg-teal-950/50'
                : 'text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-[#2a3942]'
            }`}
          >
            <div className="flex items-center gap-3">
              <div
                className={`p-2 rounded-lg ${
                  chat.isPinned
                    ? 'bg-teal-600 text-white'
                    : 'bg-slate-100 dark:bg-[#182229] text-slate-600 dark:text-slate-300'
                }`}
              >
                {chat.isPinned ? (
                  <PinOff className="w-4 h-4" />
                ) : (
                  <Pin className="w-4 h-4 rotate-45" />
                )}
              </div>
              <div>
                <p className="text-sm font-medium">
                  {chat.isPinned ? 'Unpin Chat' : 'Pin Chat to Top'}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {chat.isPinned
                    ? 'Move back to regular chronological position'
                    : `Keep at top of list (max ${MAX_PINNED_CHATS} chats)`}
                </p>
              </div>
            </div>
            {chat.isPinned && (
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-teal-200/60 dark:bg-teal-900/60 text-teal-800 dark:text-teal-200">
                Active
              </span>
            )}
          </button>

          {/* Open Chat */}
          <button
            onClick={handleSelect}
            className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-left text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-[#2a3942] transition-colors cursor-pointer"
          >
            <div className="p-2 rounded-lg bg-slate-100 dark:bg-[#182229] text-slate-600 dark:text-slate-300">
              <MessageSquare className="w-4 h-4" />
            </div>
            <div>
              <p className="text-sm font-medium">Open Chat</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                View saved outputs and conversations
              </p>
            </div>
          </button>

          {/* Edit Thread Info */}
          {onEditChat && (
            <button
              onClick={handleEdit}
              className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-left text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-[#2a3942] transition-colors cursor-pointer"
            >
              <div className="p-2 rounded-lg bg-slate-100 dark:bg-[#182229] text-slate-600 dark:text-slate-300">
                <Edit2 className="w-4 h-4" />
              </div>
              <div>
                <p className="text-sm font-medium">Edit Thread Details</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Rename, change category, icon, or color
                </p>
              </div>
            </button>
          )}

          {/* Export Thread as Markdown */}
          {onExportMarkdown && (
            <button
              onClick={handleExport}
              className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-left text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-[#2a3942] transition-colors cursor-pointer"
            >
              <div className="p-2 rounded-lg bg-slate-100 dark:bg-[#182229] text-slate-600 dark:text-slate-300">
                <Download className="w-4 h-4" />
              </div>
              <div>
                <p className="text-sm font-medium">Export as Markdown (.md)</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Download thread content formatted in Markdown
                </p>
              </div>
            </button>
          )}

          {/* Delete Thread */}
          {onDeleteChat && (
            <div className="pt-1 border-t border-slate-100 dark:border-[#2a3942]">
              {showConfirmDelete ? (
                <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50">
                  <p className="text-xs font-semibold text-rose-700 dark:text-rose-300 mb-2">
                    Are you sure? All outputs in this chat will be deleted.
                  </p>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleDelete}
                      className="flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold bg-rose-600 text-white hover:bg-rose-700 transition-colors cursor-pointer"
                    >
                      Yes, Delete Chat
                    </button>
                    <button
                      onClick={() => setShowConfirmDelete(false)}
                      className="flex-1 py-1.5 px-3 rounded-lg text-xs font-medium bg-slate-200 dark:bg-[#2a3942] text-slate-700 dark:text-slate-200 hover:bg-slate-300 dark:hover:bg-[#34444e] transition-colors cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setShowConfirmDelete(true)}
                  className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-left text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors cursor-pointer"
                >
                  <div className="p-2 rounded-lg bg-rose-100 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400">
                    <Trash2 className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Delete Thread</p>
                    <p className="text-xs text-rose-500/80 dark:text-rose-400/80">
                      Remove thread and all its saved outputs
                    </p>
                  </div>
                </button>
              )}
            </div>
          )}
        </div>

        {/* Footer Dismiss Button */}
        <div className="p-3 bg-slate-50 dark:bg-[#182229] border-t border-slate-100 dark:border-[#2a3942]">
          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-xl text-sm font-medium bg-white dark:bg-[#202c33] text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-[#2a3942] hover:bg-slate-100 dark:hover:bg-[#2a3942] transition-colors cursor-pointer text-center"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};
