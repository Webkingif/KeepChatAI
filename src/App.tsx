/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { Bot } from 'lucide-react';
import { ChatThread, SavedOutput, AIModelType, ThemeMode, MAX_PINNED_CHATS } from './types/keepchat';
import {
  loadStoredChats,
  loadStoredMessages,
  loadStoredThemeMode,
  saveStoredThemeMode,
  exportBackup,
  exportChatAsMarkdown,
} from './utils/storage';
import {
  initializeKeepChatDB,
  saveAllChatsToDB,
  saveAllMessagesToDB,
  deleteChatFromDB,
  resetDBToSamples,
} from './utils/indexedDB';
import { INITIAL_CHATS, INITIAL_MESSAGES } from './data/seedData';
import { Sidebar } from './components/Sidebar';
import { SettingsView } from './components/SettingsView';
import { ChatHeader } from './components/ChatHeader';
import { OutputCard } from './components/OutputCard';
import { InputBar } from './components/InputBar';
import { NoChatSelectedDesktop, EmptyThreadView } from './components/EmptyStates';
import { NewChatModal } from './components/NewChatModal';
import { BackupModal } from './components/BackupModal';
import { ToastContainer, ToastMessage } from './components/Toast';
import { DateDivider } from './components/DateDivider';
import { getWhatsAppDateDivider } from './utils/date';
import { ChatLogoModal } from './components/ChatLogoModal';

export default function App() {
  const [isDBReady, setIsDBReady] = useState(false);
  const [chats, setChats] = useState<ChatThread[]>(() => loadStoredChats());
  const [messages, setMessages] = useState<SavedOutput[]>(() => loadStoredMessages());
  const [activeChatId, setActiveChatId] = useState<string | null>(() => {
    if (typeof window !== 'undefined' && window.innerWidth >= 768) {
      const stored = loadStoredChats();
      return stored.length > 0 ? stored[0].id : null;
    }
    return null;
  });
  const [viewingLogoChatId, setViewingLogoChatId] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [inThreadSearchQuery, setInThreadSearchQuery] = useState('');
  const [starredOnlyFilter, setStarredOnlyFilter] = useState(false);

  // Settings & Theme State
  const [activeLeftView, setActiveLeftView] = useState<'chats' | 'settings'>('chats');
  const [themeMode, setThemeMode] = useState<ThemeMode>(() => loadStoredThemeMode());
  const [systemPrefersDark, setSystemPrefersDark] = useState<boolean>(() => {
    if (typeof window !== 'undefined' && window.matchMedia) {
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isBackupModalOpen, setIsBackupModalOpen] = useState(false);
  const [chatToEdit, setChatToEdit] = useState<ChatThread | null>(null);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Compute effective theme ('light' or 'dark') based on user choice or OS
  const effectiveTheme: 'light' | 'dark' =
    themeMode === 'system' ? (systemPrefersDark ? 'dark' : 'light') : themeMode;

  // Listen for operating system theme changes
  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (e: MediaQueryListEvent) => {
      setSystemPrefersDark(e.matches);
    };
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  // Sync theme with DOM document element
  useEffect(() => {
    const root = document.documentElement;
    if (effectiveTheme === 'dark') {
      root.classList.add('dark');
      document.body.classList.add('dark');
    } else {
      root.classList.remove('dark');
      document.body.classList.remove('dark');
    }
    saveStoredThemeMode(themeMode);
  }, [effectiveTheme, themeMode]);

  const handleSelectThemeMode = (mode: ThemeMode) => {
    setThemeMode(mode);
    const label =
      mode === 'system' ? 'System Default' : mode.charAt(0).toUpperCase() + mode.slice(1);
    addToast(`Theme set to ${label}`, 'info');
  };

  const addToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = `toast-${Date.now()}-${Math.random()}`;
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Initialize from IndexedDB with automatic localStorage migration
  useEffect(() => {
    let isMounted = true;
    initializeKeepChatDB()
      .then((data) => {
        if (!isMounted) return;
        setChats(data.chats);
        setMessages(data.messages);
        if (typeof window !== 'undefined' && window.innerWidth >= 768 && data.chats.length > 0) {
          setActiveChatId((prev) => prev || data.chats[0].id);
        }
        setIsDBReady(true);
      })
      .catch((err) => {
        console.warn('Initialization error, fallback to memory/storage:', err);
        setIsDBReady(true);
      });
    return () => {
      isMounted = false;
    };
  }, []);

  // Persist chats and messages to IndexedDB (with automatic localStorage fallback)
  useEffect(() => {
    if (!isDBReady) return;
    saveAllChatsToDB(chats);
  }, [chats, isDBReady]);

  useEffect(() => {
    if (!isDBReady) return;
    saveAllMessagesToDB(messages);
  }, [messages, isDBReady]);

  // Handle active chat selection
  const activeChat = chats.find((c) => c.id === activeChatId) || null;
  const viewingLogoChat = viewingLogoChatId
    ? chats.find((c) => c.id === viewingLogoChatId) || null
    : null;

  // Messages for active chat
  const activeChatMessages = React.useMemo(() => {
    if (!activeChatId) return [];
    let list = messages.filter((m) => m.chatId === activeChatId);

    // Apply in-thread search filter
    if (inThreadSearchQuery.trim()) {
      const q = inThreadSearchQuery.toLowerCase();
      list = list.filter(
        (m) =>
          m.content.toLowerCase().includes(q) ||
          (m.title && m.title.toLowerCase().includes(q)) ||
          (m.userPrompt && m.userPrompt.toLowerCase().includes(q)) ||
          m.tags.some((t) => t.toLowerCase().includes(q))
      );
    }

    // Apply starred only filter
    if (starredOnlyFilter) {
      list = list.filter((m) => m.isStarred);
    }

    // Order chronologically (oldest to newest, typical chat flow)
    return [...list].sort((a, b) => a.createdAt - b.createdAt);
  }, [messages, activeChatId, inThreadSearchQuery, starredOnlyFilter]);

  // Scroll to bottom when new messages arrive
  const scrollToBottom = (behavior: ScrollBehavior = 'smooth') => {
    messagesEndRef.current?.scrollIntoView({ behavior });
  };

  useEffect(() => {
    // When switching active chat, scroll to bottom without animation
    if (activeChatId) {
      setInThreadSearchQuery('');
      setStarredOnlyFilter(false);
      setTimeout(() => scrollToBottom('auto'), 50);
    }
  }, [activeChatId]);



  // Chat management
  const handleOpenNewChat = () => {
    setChatToEdit(null);
    setIsModalOpen(true);
  };

  const handleEditChat = (chat: ChatThread) => {
    setChatToEdit(chat);
    setIsModalOpen(true);
  };

  const handleSaveChatModal = (data: {
    title: string;
    description: string;
    category: string;
    defaultAiModel: AIModelType;
    avatarColor: string;
    iconName: string;
    customAvatarUrl?: string;
  }) => {
    if (chatToEdit) {
      // Edit existing chat
      setChats((prev) =>
        prev.map((c) =>
          c.id === chatToEdit.id
            ? {
                ...c,
                ...data,
                customAvatarUrl: data.customAvatarUrl,
                updatedAt: Date.now(),
              }
            : c
        )
      );
      addToast(`Updated "${data.title}" details`, 'success');
    } else {
      // Create new chat
      const newChat: ChatThread = {
        id: `chat-${Date.now()}`,
        ...data,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        isPinned: false,
      };
      setChats((prev) => [newChat, ...prev]);
      setActiveChatId(newChat.id);
      addToast(`Created chat "${newChat.title}"`, 'success');
    }
  };

  const handleUpdateChatAvatar = (chatId: string, avatarUrl?: string) => {
    setChats((prev) =>
      prev.map((c) =>
        c.id === chatId
          ? {
              ...c,
              customAvatarUrl: avatarUrl,
              updatedAt: Date.now(),
            }
          : c
      )
    );
    addToast(
      avatarUrl ? 'Chat thread logo updated!' : 'Chat thread logo reset to default icon',
      'success'
    );
  };

  const handleDeleteChat = (chatId: string) => {
    setChats((prev) => prev.filter((c) => c.id !== chatId));
    setMessages((prev) => prev.filter((m) => m.chatId !== chatId));
    deleteChatFromDB(chatId);
    if (activeChatId === chatId) {
      setActiveChatId(null);
    }
  };

  const handleTogglePin = (chatId: string) => {
    const targetChat = chats.find((c) => c.id === chatId);
    if (!targetChat) return;

    if (!targetChat.isPinned) {
      const currentPinnedCount = chats.filter((c) => c.isPinned).length;
      if (currentPinnedCount >= MAX_PINNED_CHATS) {
        addToast(
          `You can only pin up to ${MAX_PINNED_CHATS} chats. Unpin a chat first.`,
          'error'
        );
        return;
      }
      setChats((prev) =>
        prev.map((c) => (c.id === chatId ? { ...c, isPinned: true } : c))
      );
      addToast(`"${targetChat.title}" pinned to top (${currentPinnedCount + 1}/${MAX_PINNED_CHATS})`, 'success');
    } else {
      setChats((prev) =>
        prev.map((c) => (c.id === chatId ? { ...c, isPinned: false } : c))
      );
      addToast(`"${targetChat.title}" unpinned`, 'info');
    }
  };

  // Output management
  const handleSaveOutput = (data: {
    content: string;
    title?: string;
    userPrompt?: string;
    aiModel: AIModelType;
    tags: string[];
    mediaType?: 'text' | 'image' | 'audio';
    mediaUrl?: string;
    mediaName?: string;
    mediaSize?: number;
    audioDuration?: number;
  }) => {
    if (!activeChatId) return;

    const newOutput: SavedOutput = {
      id: `output-${Date.now()}`,
      chatId: activeChatId,
      content: data.content,
      title: data.title,
      userPrompt: data.userPrompt,
      aiModel: data.aiModel,
      tags: data.tags,
      isStarred: false,
      createdAt: Date.now(),
      mediaType: data.mediaType || 'text',
      mediaUrl: data.mediaUrl,
      mediaName: data.mediaName,
      mediaSize: data.mediaSize,
      audioDuration: data.audioDuration,
    };

    setMessages((prev) => [...prev, newOutput]);

    // Update chat thread updatedAt
    setChats((prev) =>
      prev.map((c) => (c.id === activeChatId ? { ...c, updatedAt: Date.now() } : c))
    );

    // Smooth scroll down to view newly saved output
    setTimeout(() => scrollToBottom('smooth'), 100);
  };

  const handleDeleteOutput = (outputId: string) => {
    setMessages((prev) => prev.filter((m) => m.id !== outputId));
  };

  const handleEditOutput = (
    outputId: string,
    updates: { content: string; title?: string; aiModel?: AIModelType }
  ) => {
    setMessages((prev) =>
      prev.map((m) =>
        m.id === outputId
          ? {
              ...m,
              content: updates.content,
              title: updates.title !== undefined ? updates.title : m.title,
              aiModel: updates.aiModel || m.aiModel,
              isEdited: true,
              editedAt: Date.now(),
            }
          : m
      )
    );
    addToast('Output updated successfully', 'success');
  };

  const handleToggleStar = (outputId: string) => {
    setMessages((prev) =>
      prev.map((m) => (m.id === outputId ? { ...m, isStarred: !m.isStarred } : m))
    );
  };

  const handleInsertSampleInEmptyThread = () => {
    if (!activeChatId) return;
    const sample = INITIAL_MESSAGES[0];
    handleSaveOutput({
      content: sample.content,
      title: sample.title,
      userPrompt: sample.userPrompt,
      aiModel: activeChat?.defaultAiModel || 'ChatGPT',
      tags: ['Demo', 'QuickStart'],
    });
  };

  // Backup & Restore
  const handleExportAll = () => {
    setIsBackupModalOpen(true);
    exportBackup(chats, messages);
    addToast('Backup export initiated. JSON downloading...', 'success');
  };

  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        if (Array.isArray(json.chats) && Array.isArray(json.messages)) {
          setChats(json.chats);
          setMessages(json.messages);
          await saveAllChatsToDB(json.chats);
          await saveAllMessagesToDB(json.messages);
          if (json.chats.length > 0) {
            setActiveChatId(json.chats[0].id);
          }
          addToast(`Restored ${json.chats.length} threads and ${json.messages.length} outputs into IndexedDB!`, 'success');
        } else {
          addToast('Invalid backup file format: missing chats or messages array.', 'error');
        }
      } catch (err) {
        addToast('Could not parse backup file. Please ensure it is a valid JSON file.', 'error');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleResetSamples = async () => {
    const res = await resetDBToSamples();
    setChats(res.chats);
    setMessages(res.messages);
    if (res.chats.length > 0) {
      setActiveChatId(res.chats[0].id);
    }
    addToast('Vault reset to default sample threads and outputs in IndexedDB.', 'info');
  };

  const handleExportChatMarkdown = (chat: ChatThread) => {
    const chatMsgs = messages.filter((m) => m.chatId === chat.id);
    exportChatAsMarkdown(chat, chatMsgs);
    addToast(`Exported "${chat.title}" as Markdown (.md)`, 'success');
  };

  if (!isDBReady) {
    return (
      <div
        className={`h-screen w-screen flex flex-col items-center justify-center select-none ${
          effectiveTheme === 'dark' ? 'bg-[#111b21] text-white' : 'bg-[#f0f2f5] text-slate-800'
        }`}
      >
        <div className="w-16 h-16 rounded-full bg-[#00a884] flex items-center justify-center text-white shadow-xl shadow-teal-900/10 mb-5 animate-pulse">
          <Bot className="w-9 h-9" />
        </div>
        <h1 className="text-base font-semibold tracking-tight mb-2">KeepChat</h1>
        <div className="w-36 h-1 bg-slate-200 dark:bg-[#202c33] rounded-full overflow-hidden mb-3">
          <div className="w-full h-full bg-[#00a884] rounded-full animate-pulse" />
        </div>
        <p className="text-xs text-slate-400 dark:text-slate-500 font-medium">
          Loading local IndexedDB vault...
        </p>
      </div>
    );
  }

  return (
    <div className={`flex h-screen w-screen overflow-hidden ${effectiveTheme === 'dark' ? 'dark' : ''}`}>
      {/* 
        RESPONSIVE BEHAVIOR:
        On Mobile (< 768px):
          - If activeLeftView === 'settings': Show SettingsView (100% width).
          - Else if activeChatId is null: Show Sidebar only (100% width).
          - Else if activeChatId is string: Show Chat Pane only (100% width) with top Back button.
        On Desktop (>= 768px):
          - Left pane: Shows Sidebar or SettingsView (~30% / 360-400px).
          - Right pane: Shows active chat messages (~70%) or NoChatSelectedDesktop.
      */}
      <div className="flex w-full h-full relative overflow-hidden bg-[#efeae2] dark:bg-[#0b141a]">
        {/* Left Pane (Sidebar or Settings) */}
        <div
          className={`h-full z-10 transition-all duration-200 ${
            activeLeftView === 'settings'
              ? 'flex w-full md:w-auto'
              : activeChatId
              ? 'hidden md:flex'
              : 'flex w-full md:w-auto'
          }`}
        >
          {activeLeftView === 'settings' ? (
            <SettingsView
              onBack={() => setActiveLeftView('chats')}
              themeMode={themeMode}
              onSelectThemeMode={handleSelectThemeMode}
              effectiveTheme={effectiveTheme}
            />
          ) : (
            <Sidebar
              chats={chats}
              messages={messages}
              activeChatId={activeChatId}
              onSelectChat={(id) => setActiveChatId(id)}
              onNewChat={handleOpenNewChat}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              selectedCategory={selectedCategory}
              setSelectedCategory={setSelectedCategory}
              onOpenSettings={() => setActiveLeftView('settings')}
              onPinToggle={handleTogglePin}
              onEditChat={handleEditChat}
              onDeleteChat={handleDeleteChat}
              onExportMarkdown={handleExportChatMarkdown}
              onExportAll={handleExportAll}
              onImportBackup={handleImportBackup}
              onResetSamples={handleResetSamples}
              onViewLogo={(chat) => setViewingLogoChatId(chat.id)}
            />
          )}
        </div>

        {/* Right Pane (Messages View or Empty Desktop Selection) */}
        <div
          className={`flex-1 h-full flex-col min-w-0 transition-all duration-200 ${
            activeLeftView === 'settings'
              ? 'hidden md:flex'
              : activeChatId
              ? 'flex'
              : 'hidden md:flex'
          }`}
        >
          {activeChat ? (
            <div className="flex-1 h-full flex flex-col min-w-0 bg-[#efeae2] dark:bg-[#0b141a]">
              {/* Header */}
              <ChatHeader
                chat={activeChat}
                outputCount={activeChatMessages.length}
                onBack={() => setActiveChatId(null)}
                onPinToggle={handleTogglePin}
                onEditChat={handleEditChat}
                onDeleteChat={handleDeleteChat}
                onExportMarkdown={handleExportChatMarkdown}
                inThreadSearchQuery={inThreadSearchQuery}
                setInThreadSearchQuery={setInThreadSearchQuery}
                starredOnlyFilter={starredOnlyFilter}
                setStarredOnlyFilter={setStarredOnlyFilter}
                onUpdateChatAvatar={handleUpdateChatAvatar}
                onViewLogo={(chat) => setViewingLogoChatId(chat.id)}
              />

              {/* Message Body Area with WhatsApp Wallpaper Pattern */}
              <div
                ref={scrollContainerRef}
                className={`flex-1 overflow-y-auto px-3 py-4 md:px-8 lg:px-12 ${
                  effectiveTheme === 'dark' ? 'wa-wallpaper-dark' : 'wa-wallpaper-light'
                }`}
              >
                <div className="max-w-4xl mx-auto flex flex-col justify-end min-h-full">
                  {/* Empty state when no outputs match */}
                  {activeChatMessages.length === 0 ? (
                    <EmptyThreadView
                      onInsertSample={
                        !inThreadSearchQuery && !starredOnlyFilter
                          ? handleInsertSampleInEmptyThread
                          : undefined
                      }
                    />
                  ) : (
                    <>
                      {/* Active filter chip if search or starred is active */}
                      {(inThreadSearchQuery || starredOnlyFilter) && (
                        <div className="mx-auto my-2 px-3 py-1 bg-white/90 dark:bg-[#202c33]/90 rounded-full border border-slate-200 dark:border-[#2a3942] text-xs text-slate-600 dark:text-slate-300 shadow-2xs flex items-center gap-2">
                          <span>
                            Filtering: {inThreadSearchQuery ? `"${inThreadSearchQuery}"` : ''}{' '}
                            {starredOnlyFilter ? '(Starred Only)' : ''}
                          </span>
                          <button
                            onClick={() => {
                              setInThreadSearchQuery('');
                              setStarredOnlyFilter(false);
                            }}
                            className="font-bold text-[#00a884] hover:underline"
                          >
                            Clear
                          </button>
                        </div>
                      )}

                      {/* List of Output Cards with WhatsApp Date Dividers */}
                      {activeChatMessages.map((output, idx) => {
                        const dateGroup = getWhatsAppDateDivider(output.createdAt);
                        const prevDateGroup =
                          idx > 0
                            ? getWhatsAppDateDivider(activeChatMessages[idx - 1].createdAt)
                            : null;
                        const showDivider = dateGroup !== prevDateGroup;

                        return (
                          <React.Fragment key={output.id}>
                            {showDivider && <DateDivider label={dateGroup} />}
                            <OutputCard
                              output={output}
                              onDelete={handleDeleteOutput}
                              onToggleStar={handleToggleStar}
                              onEditOutput={handleEditOutput}
                            />
                          </React.Fragment>
                        );
                      })}
                    </>
                  )}

                  <div ref={messagesEndRef} className="h-2" />
                </div>
              </div>

              {/* Bottom Input Bar */}
              <InputBar
                defaultModel={activeChat.defaultAiModel || 'ChatGPT'}
                onSaveOutput={handleSaveOutput}
                onErrorToast={(msg) => addToast(msg, 'error')}
                onToast={addToast}
              />
            </div>
          ) : (
            <NoChatSelectedDesktop onNewChat={handleOpenNewChat} />
          )}
        </div>
      </div>

      {/* New / Edit Chat Modal */}
      <NewChatModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSaveChatModal}
        initialData={chatToEdit}
      />

      {/* Full-Screen Chat Logo Modal */}
      <ChatLogoModal
        chat={viewingLogoChat}
        isOpen={Boolean(viewingLogoChatId)}
        onClose={() => setViewingLogoChatId(null)}
        onUpdateChatAvatar={handleUpdateChatAvatar}
      />

      {/* Backup All Vault Data Modal */}
      <BackupModal
        isOpen={isBackupModalOpen}
        onClose={() => setIsBackupModalOpen(false)}
        chats={chats}
        messages={messages}
      />

      {/* Non-blocking Toast Alerts */}
      <ToastContainer toasts={toasts} onDismiss={removeToast} />
    </div>
  );
}
