import React, { useRef, useState } from 'react';
import {
  Search,
  Plus,
  Moon,
  Sun,
  MoreVertical,
  Pin,
  FolderDown,
  FolderUp,
  RotateCcw,
  Star,
  Check,
  Code,
  Sparkles,
  Database,
  Brain,
  Terminal,
  FileText,
  X,
  MessageSquare,
  Bot,
  Settings,
  PinOff,
} from 'lucide-react';
import { ChatThread, SavedOutput, MAX_PINNED_CHATS } from '../types/keepchat';
import { formatWhatsAppTime } from '../utils/date';
import { MobileChatActionSheet } from './MobileChatActionSheet';

interface SidebarProps {
  chats: ChatThread[];
  messages: SavedOutput[];
  activeChatId: string | null;
  onSelectChat: (id: string) => void;
  onNewChat: () => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedCategory: string;
  setSelectedCategory: (cat: string) => void;
  onOpenSettings: () => void;
  onPinToggle: (chatId: string) => void;
  onEditChat?: (chat: ChatThread) => void;
  onDeleteChat?: (chatId: string) => void;
  onExportMarkdown?: (chat: ChatThread) => void;
  onExportAll: () => void;
  onImportBackup: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onResetSamples: () => void;
  onViewLogo?: (chat: ChatThread) => void;
}

const CATEGORIES = ['All', 'Coding', 'Prompts', 'Research', 'Architecture', 'Writing'];

const ICON_MAP: Record<string, React.ElementType> = {
  code: Code,
  sparkles: Sparkles,
  database: Database,
  brain: Brain,
  terminal: Terminal,
  'file-text': FileText,
};

export const Sidebar: React.FC<SidebarProps> = ({
  chats,
  messages,
  activeChatId,
  onSelectChat,
  onNewChat,
  searchQuery,
  setSearchQuery,
  selectedCategory,
  setSelectedCategory,
  onOpenSettings,
  onPinToggle,
  onEditChat,
  onDeleteChat,
  onExportMarkdown,
  onExportAll,
  onImportBackup,
  onResetSamples,
  onViewLogo,
}) => {
  const [showOptions, setShowOptions] = useState(false);
  const [selectedSheetChat, setSelectedSheetChat] = useState<ChatThread | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const touchTimerRef = useRef<NodeJS.Timeout | null>(null);
  const touchStartPos = useRef<{ x: number; y: number } | null>(null);
  const isLongPressTriggered = useRef(false);

  const pinnedCount = chats.filter((c) => c.isPinned).length;

  const handleTouchStart = (chat: ChatThread, e: React.TouchEvent) => {
    isLongPressTriggered.current = false;
    const touch = e.touches[0];
    touchStartPos.current = { x: touch.clientX, y: touch.clientY };

    if (touchTimerRef.current) {
      clearTimeout(touchTimerRef.current);
    }

    touchTimerRef.current = setTimeout(() => {
      isLongPressTriggered.current = true;
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate(40);
      }
      setSelectedSheetChat(chat);
    }, 450);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!touchStartPos.current) return;
    const touch = e.touches[0];
    const dx = Math.abs(touch.clientX - touchStartPos.current.x);
    const dy = Math.abs(touch.clientY - touchStartPos.current.y);
    // If movement > 10px, treat as scroll and cancel long-press
    if (dx > 10 || dy > 10) {
      if (touchTimerRef.current) {
        clearTimeout(touchTimerRef.current);
        touchTimerRef.current = null;
      }
    }
  };

  const handleTouchEnd = () => {
    if (touchTimerRef.current) {
      clearTimeout(touchTimerRef.current);
      touchTimerRef.current = null;
    }
  };

  const handleChatClick = (chat: ChatThread) => {
    // If long-press just fired, suppress regular click
    if (isLongPressTriggered.current) {
      isLongPressTriggered.current = false;
      return;
    }
    onSelectChat(chat.id);
  };

  const handleContextMenu = (chat: ChatThread, e: React.MouseEvent) => {
    e.preventDefault();
    setSelectedSheetChat(chat);
  };

  // Group messages by chatId for fast lookup of last output and output counts
  const messagesByChat = React.useMemo(() => {
    const map = new Map<string, SavedOutput[]>();
    messages.forEach((msg) => {
      const list = map.get(msg.chatId) || [];
      list.push(msg);
      map.set(msg.chatId, list);
    });
    // Sort messages in each chat by createdAt descending
    map.forEach((list) => list.sort((a, b) => b.createdAt - a.createdAt));
    return map;
  }, [messages]);

  // Filter chats by search query and category
  const filteredChats = React.useMemo(() => {
    return chats
      .filter((chat) => {
        // Category filter
        if (selectedCategory === 'Pinned') {
          if (!chat.isPinned) return false;
        } else if (selectedCategory === 'Starred') {
          const chatMsgs = messagesByChat.get(chat.id) || [];
          const hasStarred = chatMsgs.some((m) => m.isStarred);
          if (!hasStarred) return false;
        } else if (selectedCategory !== 'All' && chat.category !== selectedCategory) {
          return false;
        }

        // Search query filter (matches title, description, or any message inside chat)
        if (!searchQuery.trim()) return true;
        const q = searchQuery.toLowerCase();
        if (chat.title.toLowerCase().includes(q)) return true;
        if (chat.description && chat.description.toLowerCase().includes(q)) return true;

        const chatMsgs = messagesByChat.get(chat.id) || [];
        return chatMsgs.some(
          (m) =>
            m.content.toLowerCase().includes(q) ||
            (m.title && m.title.toLowerCase().includes(q)) ||
            (m.userPrompt && m.userPrompt.toLowerCase().includes(q)) ||
            m.tags.some((t) => t.toLowerCase().includes(q))
        );
      })
      .sort((a, b) => {
        // Pinned threads first
        if (a.isPinned && !b.isPinned) return -1;
        if (!a.isPinned && b.isPinned) return 1;

        // Latest activity next
        const aMsgs = messagesByChat.get(a.id) || [];
        const bMsgs = messagesByChat.get(b.id) || [];
        const aLastTime = aMsgs[0]?.createdAt || a.updatedAt || a.createdAt;
        const bLastTime = bMsgs[0]?.createdAt || b.updatedAt || b.createdAt;
        return bLastTime - aLastTime;
      });
  }, [chats, messagesByChat, searchQuery, selectedCategory]);

  return (
    <aside className="w-full md:w-[360px] lg:w-[400px] shrink-0 h-full flex flex-col bg-[#f0f2f5] dark:bg-[#111b21] border-r border-slate-200 dark:border-[#222d34] select-none transition-colors">
      {/* Top Header Zone */}
      <div className="flex items-center justify-between px-4 py-3 bg-[#f0f2f5] dark:bg-[#202c33] border-b border-slate-200/60 dark:border-[#222d34] min-h-[58px]">
        {/* Brand Lockup */}
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-[#00a884] flex items-center justify-center text-white shadow-xs">
            <Bot className="w-4 h-4" />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-base tracking-tight text-slate-900 dark:text-white leading-none">
              KeepChat
            </span>
            <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium leading-none mt-0.5">
              AI Output Vault
            </span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1">
          {/* New Chat Button (Desktop) */}
          <button
            onClick={onNewChat}
            className="p-2 rounded-full text-slate-600 dark:text-slate-300 hover:bg-slate-200/70 dark:hover:bg-[#2a3942] transition-colors cursor-pointer"
            title="Create new chat thread"
          >
            <Plus className="w-5 h-5" />
          </button>

          {/* Settings Button */}
          <button
            onClick={onOpenSettings}
            className="p-2 rounded-full text-slate-600 dark:text-slate-300 hover:bg-slate-200/70 dark:hover:bg-[#2a3942] transition-colors cursor-pointer"
            title="Settings (Theme & Appearance)"
          >
            <Settings className="w-5 h-5" />
          </button>

          {/* Backup & Options Menu */}
          <div className="relative">
            <button
              onClick={() => setShowOptions(!showOptions)}
              className="p-2 rounded-full text-slate-600 dark:text-slate-300 hover:bg-slate-200/70 dark:hover:bg-[#2a3942] transition-colors cursor-pointer"
              title="Backup and options"
            >
              <MoreVertical className="w-4 h-4" />
            </button>

            {showOptions && (
              <>
                <div className="fixed inset-0 z-30" onClick={() => setShowOptions(false)} />
                <div className="absolute right-0 mt-1 w-56 bg-white dark:bg-[#202c33] rounded-xl shadow-xl border border-slate-200 dark:border-[#2a3942] py-1.5 z-40 animate-in fade-in duration-100">
                  <button
                    onClick={() => {
                      onOpenSettings();
                      setShowOptions(false);
                    }}
                    className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-[#182229] transition-colors text-left cursor-pointer"
                  >
                    <Settings className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                    <span>Settings (Appearance)</span>
                  </button>

                  <div className="my-1 border-t border-slate-100 dark:border-[#2a3942]" />

                  <button
                    onClick={() => {
                      onExportAll();
                      setShowOptions(false);
                    }}
                    className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-[#182229] transition-colors text-left cursor-pointer"
                  >
                    <FolderDown className="w-4 h-4 text-[#00a884]" />
                    <span>Backup All Vault Data (JSON)</span>
                  </button>

                  <button
                    onClick={() => {
                      fileInputRef.current?.click();
                      setShowOptions(false);
                    }}
                    className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-[#182229] transition-colors text-left cursor-pointer"
                  >
                    <FolderUp className="w-4 h-4 text-blue-500" />
                    <span>Restore Vault from File</span>
                  </button>

                  <div className="my-1 border-t border-slate-100 dark:border-[#2a3942]" />

                  <button
                    onClick={() => {
                      onResetSamples();
                      setShowOptions(false);
                    }}
                    className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-amber-600 dark:text-amber-400 hover:bg-slate-100 dark:hover:bg-[#182229] transition-colors text-left cursor-pointer"
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span>Reset to Default Samples</span>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Hidden file input for restore */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={onImportBackup}
        accept=".json"
        className="hidden"
      />

      {/* Search Bar Zone */}
      <div className="px-3 pt-2.5 pb-2">
        <div className="relative flex items-center w-full bg-white dark:bg-[#202c33] rounded-lg border border-slate-200/80 dark:border-[#2a3942] shadow-2xs focus-within:ring-1 focus-within:ring-[#00a884] focus-within:border-transparent transition-all">
          <Search className="w-4 h-4 ml-3 text-slate-400 shrink-0" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search chats..."
            className="w-full py-2 pl-2.5 pr-8 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 bg-transparent focus:outline-hidden"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-0.5 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Category Filter Tabs */}
      <div className="px-3 pb-2 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
        {CATEGORIES.map((cat) => {
          const isSelected = selectedCategory === cat;
          return (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1 rounded-full text-[11px] font-medium transition-colors cursor-pointer shrink-0 ${
                isSelected
                  ? 'bg-[#00a884] text-white shadow-2xs'
                  : 'bg-white/80 dark:bg-[#202c33] text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-[#2a3942] border border-slate-200/60 dark:border-[#2a3942]'
              }`}
            >
              {cat}
            </button>
          );
        })}
        <button
          onClick={() => setSelectedCategory(selectedCategory === 'Pinned' ? 'All' : 'Pinned')}
          className={`px-2.5 py-1 rounded-full text-[11px] font-medium flex items-center gap-1 transition-colors cursor-pointer shrink-0 ${
            selectedCategory === 'Pinned'
              ? 'bg-[#00a884] text-white shadow-2xs'
              : 'bg-white/80 dark:bg-[#202c33] text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-[#2a3942] border border-slate-200/60 dark:border-[#2a3942]'
          }`}
          title={`Filter pinned chats (${pinnedCount}/${MAX_PINNED_CHATS})`}
        >
          <Pin className="w-3 h-3 rotate-45" />
          <span>Pinned ({pinnedCount}/{MAX_PINNED_CHATS})</span>
        </button>
        <button
          onClick={() => setSelectedCategory(selectedCategory === 'Starred' ? 'All' : 'Starred')}
          className={`px-2.5 py-1 rounded-full text-[11px] font-medium flex items-center gap-1 transition-colors cursor-pointer shrink-0 ${
            selectedCategory === 'Starred'
              ? 'bg-amber-500 text-white shadow-2xs'
              : 'bg-white/80 dark:bg-[#202c33] text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-[#2a3942] border border-slate-200/60 dark:border-[#2a3942]'
          }`}
        >
          <Star className="w-3 h-3 fill-current" />
          <span>Starred</span>
        </button>
      </div>

      {/* Scrollable Chat Threads List */}
      <div className="flex-1 overflow-y-auto divide-y divide-slate-200/60 dark:divide-[#222d34]/60">
        {filteredChats.length === 0 ? (
          <div className="p-8 text-center text-slate-400 dark:text-slate-500">
            <MessageSquare className="w-10 h-10 mx-auto mb-2.5 stroke-1 opacity-60" />
            <p className="text-xs font-medium">No chat threads found</p>
            <p className="text-[11px] mt-1 text-slate-400 dark:text-slate-600">
              {searchQuery ? 'Try adjusting your search query' : 'Create a new thread to get started'}
            </p>
          </div>
        ) : (
          filteredChats.map((chat) => {
            const isActive = activeChatId === chat.id;
            const chatMsgs = messagesByChat.get(chat.id) || [];
            const lastMsg = chatMsgs[0];
            const outputCount = chatMsgs.length;
            const IconCmp = (chat.iconName && ICON_MAP[chat.iconName]) || Sparkles;

            const snippet = lastMsg
              ? lastMsg.mediaType === 'image'
                ? `📷 Photo${lastMsg.content && lastMsg.content !== 'Image attachment' ? `: ${lastMsg.content.slice(0, 50)}` : ''}`
                : lastMsg.mediaType === 'audio'
                ? `🎙️ Voice message`
                : lastMsg.title || lastMsg.content.slice(0, 75).replace(/[#*`\n]/g, ' ')
              : 'No outputs saved yet';

            const displayTime = lastMsg ? lastMsg.createdAt : chat.updatedAt || chat.createdAt;

            return (
              <div
                key={chat.id}
                onClick={() => handleChatClick(chat)}
                onTouchStart={(e) => handleTouchStart(chat, e)}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
                onContextMenu={(e) => handleContextMenu(chat, e)}
                className={`group flex items-center gap-3 px-3.5 py-3 transition-colors cursor-pointer relative select-none ${
                  isActive
                    ? 'bg-[#e9edef] dark:bg-[#2a3942]'
                    : 'hover:bg-slate-200/60 dark:hover:bg-[#202c33]/70'
                }`}
              >
                {/* Active indicator bar */}
                {isActive && (
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#00a884]" />
                )}

                {/* Avatar with click-to-view */}
                <div
                  onClick={(e) => {
                    e.stopPropagation();
                    onViewLogo?.(chat);
                  }}
                  className={`w-11 h-11 rounded-full overflow-hidden flex items-center justify-center text-white shrink-0 shadow-xs cursor-pointer hover:scale-105 active:scale-95 transition-transform ${
                    chat.customAvatarUrl
                      ? 'border border-slate-200 dark:border-black/30'
                      : `bg-gradient-to-br ${chat.avatarColor || 'from-emerald-500 to-teal-700'}`
                  }`}
                  title={chat.customAvatarUrl ? 'View profile photo' : 'View chat icon'}
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

                {/* Middle Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1 mb-0.5">
                    <span className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate">
                      {chat.title}
                    </span>
                    <span className="text-[11px] text-slate-400 dark:text-slate-500 shrink-0 tabular-nums">
                      {formatWhatsAppTime(displayTime)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-1">
                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate pr-2">
                      {snippet}
                    </p>

                    <div className="flex items-center gap-1.5 shrink-0">
                      {outputCount > 0 && (
                        <span className="min-w-4 px-1.5 py-0.2 rounded-full text-[10px] font-semibold bg-emerald-100 dark:bg-[#00a884]/20 text-[#00a884] dark:text-teal-400 tabular-nums">
                          {outputCount}
                        </span>
                      )}

                      {/* Pin Action Button - Tap on mobile, hover on desktop */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onPinToggle(chat.id);
                        }}
                        className={`p-1 rounded-full transition-all cursor-pointer ${
                          chat.isPinned
                            ? 'text-teal-600 dark:text-teal-400 hover:bg-teal-500/15'
                            : 'opacity-70 md:opacity-0 md:group-hover:opacity-100 text-slate-400 hover:text-teal-600 dark:hover:text-teal-400 hover:bg-slate-200/80 dark:hover:bg-[#2a3942]'
                        }`}
                        title={
                          chat.isPinned
                            ? 'Unpin chat'
                            : pinnedCount >= MAX_PINNED_CHATS
                            ? `Maximum ${MAX_PINNED_CHATS} pinned chats reached`
                            : `Pin chat to top (${pinnedCount}/${MAX_PINNED_CHATS})`
                        }
                      >
                        {chat.isPinned ? (
                          <Pin className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400 rotate-45 fill-teal-600/30 dark:fill-teal-400/30" />
                        ) : (
                          <Pin className="w-3.5 h-3.5 rotate-45" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Floating Action Button (FAB) for Mobile View (< 768px) */}
      <button
        onClick={onNewChat}
        className="md:hidden fixed bottom-5 right-5 z-30 w-14 h-14 rounded-2xl bg-[#00a884] hover:bg-[#008069] text-white shadow-xl shadow-emerald-950/20 flex items-center justify-center transition-transform active:scale-90 cursor-pointer"
        title="Create new chat thread"
      >
        <Plus className="w-6 h-6 stroke-[2.5]" />
      </button>

      {/* Mobile WhatsApp-Style Quick Action Sheet */}
      <MobileChatActionSheet
        chat={selectedSheetChat}
        isOpen={Boolean(selectedSheetChat)}
        onClose={() => setSelectedSheetChat(null)}
        onPinToggle={onPinToggle}
        onSelectChat={onSelectChat}
        onEditChat={onEditChat}
        onDeleteChat={onDeleteChat}
        onExportMarkdown={onExportMarkdown}
        pinnedCount={pinnedCount}
      />
    </aside>
  );
};
