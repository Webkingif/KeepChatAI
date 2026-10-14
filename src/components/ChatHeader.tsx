import React, { useState, useRef } from 'react';
import {
  ArrowLeft,
  Search,
  Download,
  Pin,
  PinOff,
  MoreVertical,
  Star,
  Edit2,
  Trash2,
  X,
  Code,
  Sparkles,
  Database,
  Brain,
  Terminal,
  FileText,
  Camera,
  RotateCcw,
  Image as ImageIcon,
  Maximize2,
  WifiOff,
  CheckSquare,
} from 'lucide-react';
import { ChatThread } from '../types/keepchat';
import { useOnlineStatus } from '../hooks/useOnlineStatus';

interface ChatHeaderProps {
  chat: ChatThread;
  outputCount: number;
  onBack: () => void;
  onPinToggle: (chatId: string) => void;
  onEditChat: (chat: ChatThread) => void;
  onDeleteChat: (chatId: string) => void;
  onExportMarkdown: (chat: ChatThread) => void;
  inThreadSearchQuery: string;
  setInThreadSearchQuery: (query: string) => void;
  starredOnlyFilter: boolean;
  setStarredOnlyFilter: (val: boolean) => void;
  onUpdateChatAvatar?: (chatId: string, avatarUrl?: string) => void;
  onViewLogo?: (chat: ChatThread) => void;
  isSelectMode?: boolean;
  onToggleSelectMode?: () => void;
}

const ICON_MAP: Record<string, React.ElementType> = {
  code: Code,
  sparkles: Sparkles,
  database: Database,
  brain: Brain,
  terminal: Terminal,
  'file-text': FileText,
};

export const ChatHeader: React.FC<ChatHeaderProps> = ({
  chat,
  outputCount,
  onBack,
  onPinToggle,
  onEditChat,
  onDeleteChat,
  onExportMarkdown,
  inThreadSearchQuery,
  setInThreadSearchQuery,
  starredOnlyFilter,
  setStarredOnlyFilter,
  onUpdateChatAvatar,
  onViewLogo,
  isSelectMode = false,
  onToggleSelectMode,
}) => {
  const [showSearch, setShowSearch] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const isOnline = useOnlineStatus();

  const IconCmp = (chat.iconName && ICON_MAP[chat.iconName]) || Sparkles;

  const handleAvatarFileSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputElement = e.target;
    const file = inputElement.files?.[0];
    if (!file) return;

    const isImage =
      (file.type && file.type.startsWith('image/')) ||
      /\.(png|jpe?g|webp|gif|svg|bmp|ico|avif)$/i.test(file.name);

    if (!isImage) {
      inputElement.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (dataUrl) {
        onUpdateChatAvatar?.(chat.id, dataUrl);
      }
      inputElement.value = '';
    };
    reader.onerror = () => {
      inputElement.value = '';
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="sticky top-0 z-20 flex flex-col bg-[#f0f2f5] dark:bg-[#202c33] border-b border-slate-200 dark:border-[#222d34] shadow-xs">
      {/* Hidden file input for fast avatar upload */}
      <input
        type="file"
        ref={avatarInputRef}
        accept="image/*"
        className="hidden"
        aria-label="Upload custom chat avatar"
        onChange={handleAvatarFileSelected}
      />

      <div className="flex items-center justify-between px-3 md:px-4 py-2.5 min-h-[58px]">
        {/* Left Slot: Mobile Back Button + Avatar + Title Info */}
        <div className="flex items-center gap-2 md:gap-3 min-w-0 flex-1">
          {/* Native Back Arrow for Mobile View */}
          <button
            onClick={onBack}
            className="md:hidden p-2 -ml-1 rounded-full text-slate-600 dark:text-slate-300 hover:bg-slate-200/70 dark:hover:bg-[#2a3942] transition-colors cursor-pointer shrink-0"
            title="Back to chats"
            aria-label="Back to chats list"
          >
            <ArrowLeft className="w-5 h-5" aria-hidden="true" />
          </button>

          {/* Avatar Icon with Click-to-View Full Photo & Hover Badge */}
          <div
            role="button"
            tabIndex={0}
            onClick={() => (onViewLogo ? onViewLogo(chat) : avatarInputRef.current?.click())}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                if (onViewLogo) onViewLogo(chat);
                else avatarInputRef.current?.click();
              }
            }}
            className="relative group/avatar cursor-pointer shrink-0 rounded-full focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-[#00a884]"
            title="Click to view full photo"
            aria-label={`View full logo for ${chat.title}`}
          >
            <div
              className={`w-9 h-9 md:w-10 md:h-10 rounded-full overflow-hidden flex items-center justify-center text-white shadow-xs transition-transform active:scale-95 ${
                chat.customAvatarUrl
                  ? 'border border-slate-200 dark:border-black/30'
                  : `bg-gradient-to-br ${chat.avatarColor || 'from-emerald-500 to-teal-700'}`
              }`}
            >
              {chat.customAvatarUrl ? (
                <img
                  src={chat.customAvatarUrl}
                  alt={`Avatar photo for ${chat.title}`}
                  className="w-full h-full object-cover"
                />
              ) : (
                <IconCmp className="w-4 h-4 md:w-5 md:h-5 stroke-[2.2]" aria-hidden="true" />
              )}
            </div>

            {/* View Full Overlay on Hover */}
            <div className="absolute inset-0 rounded-full bg-black/45 flex items-center justify-center text-white opacity-0 group-hover/avatar:opacity-100 transition-opacity" aria-hidden="true">
              <Maximize2 className="w-4 h-4" />
            </div>
          </div>

          {/* Thread Title & Meta Info */}
          <div
            role="button"
            tabIndex={0}
            className="min-w-0 flex-1 cursor-pointer rounded-lg px-1 py-0.5 -mx-1 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-[#00a884]"
            onClick={() => onEditChat(chat)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onEditChat(chat);
              }
            }}
            aria-label={`Edit thread details for ${chat.title}`}
          >
            <div className="flex items-center gap-1.5 min-w-0">
              <h2 className="text-sm md:text-base font-semibold text-slate-900 dark:text-slate-100 truncate">
                {chat.title}
              </h2>
              {chat.isPinned && (
                <Pin className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400 rotate-45 shrink-0" aria-label="Pinned thread" />
              )}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
              <span>{chat.category}</span>
              <span className="mx-1.5 opacity-60">·</span>
              <span className="tabular-nums">
                {outputCount} {outputCount === 1 ? 'output' : 'outputs'}
              </span>
              {!isOnline && (
                <>
                  <span className="mx-1.5 opacity-60">·</span>
                  <span className="inline-flex items-center gap-1 font-semibold text-amber-600 dark:text-amber-400">
                    <WifiOff className="w-3 h-3" aria-hidden="true" />
                    <span>Offline (Saved)</span>
                  </span>
                </>
              )}
              {chat.description && (
                <>
                  <span className="mx-1.5 opacity-60 hidden sm:inline">·</span>
                  <span className="hidden sm:inline opacity-80">{chat.description}</span>
                </>
              )}
            </p>
          </div>
        </div>

        {/* Right Slot: Actions */}
        <div className="flex items-center gap-1 shrink-0">
          {/* Direct Pin / Unpin Button (Hidden on small screens) */}
          <button
            onClick={() => onPinToggle(chat.id)}
            className={`hidden sm:flex p-2 rounded-full transition-colors cursor-pointer ${
              chat.isPinned
                ? 'text-[#00a884] dark:text-teal-400 bg-emerald-50 dark:bg-teal-950/40'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200/70 dark:hover:bg-[#2a3942]'
            }`}
            title={chat.isPinned ? 'Unpin chat' : 'Pin chat to top'}
            aria-label={chat.isPinned ? `Unpin chat ${chat.title}` : `Pin chat ${chat.title} to top`}
          >
            {chat.isPinned ? (
              <PinOff className="w-4 h-4" aria-hidden="true" />
            ) : (
              <Pin className="w-4 h-4 rotate-45" aria-hidden="true" />
            )}
          </button>

          {/* In-Thread Search Toggle (Desktop / Larger screens) */}
          <button
            onClick={() => setShowSearch(!showSearch)}
            className={`hidden sm:flex p-2 rounded-full transition-colors cursor-pointer ${
              showSearch || inThreadSearchQuery
                ? 'text-[#00a884] dark:text-teal-400 bg-emerald-50 dark:bg-teal-950/40'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200/70 dark:hover:bg-[#2a3942]'
            }`}
            title="Search in thread"
            aria-label="Search within thread"
            aria-expanded={showSearch}
          >
            <Search className="w-4 h-4" aria-hidden="true" />
          </button>

          {/* Starred Filter Toggle (Desktop / Larger screens) */}
          <button
            onClick={() => setStarredOnlyFilter(!starredOnlyFilter)}
            className={`hidden sm:flex p-2 rounded-full transition-colors cursor-pointer ${
              starredOnlyFilter
                ? 'text-amber-500 bg-amber-50 dark:bg-amber-950/40'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200/70 dark:hover:bg-[#2a3942]'
            }`}
            title={starredOnlyFilter ? 'Show all outputs' : 'Show starred outputs only'}
            aria-label={starredOnlyFilter ? 'Show all outputs' : 'Show starred outputs only'}
            aria-pressed={starredOnlyFilter}
          >
            <Star className={`w-4 h-4 ${starredOnlyFilter ? 'fill-amber-500' : ''}`} aria-hidden="true" />
          </button>

          {/* Multi-Select Toggle (Desktop / Larger screens) */}
          {onToggleSelectMode && (
            <button
              onClick={onToggleSelectMode}
              className={`hidden sm:flex p-2 rounded-full transition-colors cursor-pointer ${
                isSelectMode
                  ? 'text-white bg-[#00a884] shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200/70 dark:hover:bg-[#2a3942]'
              }`}
              title={isSelectMode ? 'Exit select mode' : 'Select outputs to export'}
              aria-label={isSelectMode ? 'Exit select mode' : 'Select outputs to export'}
              aria-pressed={isSelectMode}
            >
              <CheckSquare className="w-4 h-4" aria-hidden="true" />
            </button>
          )}

          {/* Export Markdown Action */}
          <button
            onClick={() => onExportMarkdown(chat)}
            className="p-2 rounded-full text-slate-600 dark:text-slate-300 hover:bg-slate-200/70 dark:hover:bg-[#2a3942] transition-colors hidden sm:flex cursor-pointer"
            title="Export thread as Markdown file"
            aria-label="Export thread as Markdown file"
          >
            <Download className="w-4 h-4" aria-hidden="true" />
          </button>

          {/* 3-Dots More Menu */}
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="relative p-2 rounded-full text-slate-600 dark:text-slate-300 hover:bg-slate-200/70 dark:hover:bg-[#2a3942] transition-colors cursor-pointer"
              title="More thread options"
              aria-label="More thread options"
              aria-haspopup="menu"
              aria-expanded={showMenu}
            >
              <MoreVertical className="w-5 h-5" aria-hidden="true" />
              {/* Active filter / selection indicator dot on small screens */}
              {(starredOnlyFilter || inThreadSearchQuery || isSelectMode) && (
                <span className="sm:hidden absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#00a884] ring-2 ring-[#f0f2f5] dark:ring-[#202c33]" aria-hidden="true" />
              )}
            </button>

            {/* Dropdown Menu */}
            {showMenu && (
              <>
                <div
                  className="fixed inset-0 z-30"
                  onClick={() => setShowMenu(false)}
                />
                <div
                  role="menu"
                  aria-label="Thread options"
                  className="absolute right-0 top-full mt-1.5 w-60 max-w-[calc(100vw-24px)] bg-white dark:bg-[#202c33] rounded-xl shadow-xl border border-slate-200 dark:border-[#2a3942] py-2 z-40 animate-in fade-in zoom-in-95 duration-100 max-h-[85vh] overflow-y-auto"
                >
                  {/* Small Screen: Search in Thread */}
                  <button
                    role="menuitem"
                    onClick={() => {
                      setShowMenu(false);
                      setShowSearch(true);
                    }}
                    className="w-full flex items-center justify-between px-4 py-2.5 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-[#182229] transition-colors text-left cursor-pointer sm:hidden"
                  >
                    <div className="flex items-center gap-2.5">
                      <Search className="w-4 h-4 text-slate-400" />
                      <span>Search in Thread</span>
                    </div>
                    {inThreadSearchQuery && (
                      <span className="text-[10px] font-semibold text-teal-600 dark:text-teal-400 bg-emerald-50 dark:bg-teal-950/40 px-1.5 py-0.5 rounded">
                        Active
                      </span>
                    )}
                  </button>

                  {/* Small Screen: Starred Filter Toggle */}
                  <button
                    role="menuitem"
                    onClick={() => {
                      setShowMenu(false);
                      setStarredOnlyFilter(!starredOnlyFilter);
                    }}
                    className="w-full flex items-center justify-between px-4 py-2.5 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-[#182229] transition-colors text-left cursor-pointer sm:hidden"
                  >
                    <div className="flex items-center gap-2.5">
                      <Star
                        className={`w-4 h-4 ${
                          starredOnlyFilter ? 'fill-amber-500 text-amber-500' : 'text-slate-400'
                        }`}
                        aria-hidden="true"
                      />
                      <span>{starredOnlyFilter ? 'Show All Outputs' : 'Starred Outputs Only'}</span>
                    </div>
                    {starredOnlyFilter && (
                      <span className="text-[10px] font-semibold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-1.5 py-0.5 rounded">
                        Active
                      </span>
                    )}
                  </button>

                  {/* Small Screen: Multi-Select Outputs Mode */}
                  {onToggleSelectMode && (
                    <button
                      role="menuitem"
                      onClick={() => {
                        setShowMenu(false);
                        onToggleSelectMode();
                      }}
                      className="w-full flex items-center justify-between px-4 py-2.5 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-[#182229] transition-colors text-left cursor-pointer sm:hidden"
                    >
                      <div className="flex items-center gap-2.5">
                        <CheckSquare
                          className={`w-4 h-4 ${isSelectMode ? 'text-[#00a884]' : 'text-slate-400'}`}
                          aria-hidden="true"
                        />
                        <span>{isSelectMode ? 'Exit Selection Mode' : 'Select Outputs'}</span>
                      </div>
                      {isSelectMode && (
                        <span className="text-[10px] font-semibold text-teal-600 dark:text-teal-400 bg-emerald-50 dark:bg-teal-950/40 px-1.5 py-0.5 rounded">
                          Active
                        </span>
                      )}
                    </button>
                  )}

                  {/* Divider separating mobile filters from thread management options */}
                  <div className="my-1 border-t border-slate-100 dark:border-[#2a3942] sm:hidden" />

                  {/* Pin / Unpin Action */}
                  <button
                    role="menuitem"
                    onClick={() => {
                      onPinToggle(chat.id);
                      setShowMenu(false);
                    }}
                    className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-[#182229] transition-colors text-left cursor-pointer"
                  >
                    {chat.isPinned ? (
                      <>
                        <PinOff className="w-4 h-4 text-slate-400" aria-hidden="true" />
                        <span>Unpin Thread</span>
                      </>
                    ) : (
                      <>
                        <Pin className="w-4 h-4 text-slate-400" aria-hidden="true" />
                        <span>Pin Thread</span>
                      </>
                    )}
                  </button>

                  {/* Select Outputs (Desktop menu option) */}
                  {onToggleSelectMode && (
                    <button
                      role="menuitem"
                      onClick={() => {
                        setShowMenu(false);
                        onToggleSelectMode();
                      }}
                      className="w-full hidden sm:flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-[#182229] transition-colors text-left cursor-pointer"
                    >
                      <CheckSquare className="w-4 h-4 text-slate-400" aria-hidden="true" />
                      <span>{isSelectMode ? 'Exit Selection Mode' : 'Select Outputs to Export'}</span>
                    </button>
                  )}

                  {/* View Full Logo */}
                  <button
                    role="menuitem"
                    onClick={() => {
                      setShowMenu(false);
                      onViewLogo?.(chat);
                    }}
                    className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-[#182229] transition-colors text-left cursor-pointer"
                  >
                    <Maximize2 className="w-4 h-4 text-slate-400" aria-hidden="true" />
                    <span>View Full Logo</span>
                  </button>

                  {/* Change Chat Photo */}
                  <button
                    role="menuitem"
                    onClick={() => {
                      setShowMenu(false);
                      avatarInputRef.current?.click();
                    }}
                    className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-[#182229] transition-colors text-left cursor-pointer"
                  >
                    <Camera className="w-4 h-4 text-slate-400" aria-hidden="true" />
                    <span>Change Chat Photo</span>
                  </button>

                  {/* Reset Chat Photo if custom */}
                  {chat.customAvatarUrl && (
                    <button
                      role="menuitem"
                      onClick={() => {
                        onUpdateChatAvatar?.(chat.id, undefined);
                        setShowMenu(false);
                      }}
                      className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-[#182229] transition-colors text-left cursor-pointer"
                    >
                      <RotateCcw className="w-4 h-4 text-slate-400" aria-hidden="true" />
                      <span>Reset to Default Icon</span>
                    </button>
                  )}

                  <button
                    role="menuitem"
                    onClick={() => {
                      onEditChat(chat);
                      setShowMenu(false);
                    }}
                    className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-[#182229] transition-colors text-left cursor-pointer"
                  >
                    <Edit2 className="w-4 h-4 text-slate-400" aria-hidden="true" />
                    <span>Edit Thread Details</span>
                  </button>

                  <button
                    role="menuitem"
                    onClick={() => {
                      onExportMarkdown(chat);
                      setShowMenu(false);
                    }}
                    className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-[#182229] transition-colors text-left cursor-pointer sm:hidden"
                  >
                    <Download className="w-4 h-4 text-slate-400" aria-hidden="true" />
                    <span>Export as Markdown</span>
                  </button>

                  <div className="my-1 border-t border-slate-100 dark:border-[#2a3942]" />

                  {showConfirmDelete ? (
                    <div className="px-4 py-2 text-xs" role="region" aria-label="Confirm deletion">
                      <p className="text-rose-600 dark:text-rose-400 font-medium mb-1.5">
                        Delete this thread & all its outputs?
                      </p>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            onDeleteChat(chat.id);
                            setShowMenu(false);
                            setShowConfirmDelete(false);
                          }}
                          className="px-2.5 py-1 bg-rose-600 text-white rounded font-medium hover:bg-rose-700 cursor-pointer"
                        >
                          Yes, Delete
                        </button>
                        <button
                          onClick={() => setShowConfirmDelete(false)}
                          className="px-2.5 py-1 bg-slate-200 dark:bg-[#111b21] text-slate-700 dark:text-slate-300 rounded hover:bg-slate-300 cursor-pointer"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      role="menuitem"
                      onClick={() => setShowConfirmDelete(true)}
                      className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors text-left cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" aria-hidden="true" />
                      <span>Delete Thread</span>
                    </button>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* In-Thread Search Bar Dropdown */}
      {showSearch && (
        <div className="px-3 md:px-4 py-2 bg-slate-100/90 dark:bg-[#182229] border-t border-slate-200 dark:border-[#222d34] flex items-center gap-2 animate-in slide-in-from-top-1 duration-150">
          <Search className="w-4 h-4 text-slate-400 shrink-0" aria-hidden="true" />
          <input
            type="text"
            autoFocus
            value={inThreadSearchQuery}
            onChange={(e) => setInThreadSearchQuery(e.target.value)}
            placeholder="Search within this thread..."
            aria-label="Search within this thread"
            className="flex-1 bg-transparent text-xs md:text-sm text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-hidden"
          />
          {inThreadSearchQuery && (
            <button
              onClick={() => setInThreadSearchQuery('')}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-full hover:bg-slate-200/60 dark:hover:bg-[#2a3942] transition-colors cursor-pointer"
              title="Clear search query"
              aria-label="Clear in-thread search text"
            >
              <X className="w-3.5 h-3.5" aria-hidden="true" />
            </button>
          )}
          <button
            onClick={() => {
              setShowSearch(false);
              setInThreadSearchQuery('');
            }}
            className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 p-1 rounded-full hover:bg-slate-200/60 dark:hover:bg-[#2a3942] transition-colors cursor-pointer"
            title="Close search"
            aria-label="Close search"
          >
            <X className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>
      )}
    </div>
  );
};
