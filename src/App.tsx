/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { ChatThread, SavedOutput, AIModelType, ThemeMode, MAX_PINNED_CHATS } from './types/keepchat';
import {
  loadStoredChats,
  loadStoredMessages,
  loadStoredThemeMode,
  saveStoredThemeMode,
  exportBackup,
  exportChatAsMarkdown,
  exportOutputsAsMarkdown,
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
import { OfflineIndicator } from './components/OfflineIndicator';
import { ScrollToBottomButton } from './components/ScrollToBottomButton';
import { ExportSnapshotModal } from './components/ExportSnapshotModal';
import { ExportPdfModal } from './components/ExportPdfModal';
import { MultiSelectBar } from './components/MultiSelectBar';
import { ConfirmBulkDeleteModal } from './components/ConfirmBulkDeleteModal';
import { TasksView } from './components/TasksView';
import { TaskDeadlineModal } from './components/TaskDeadlineModal';

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

  // Navigation & View State: 'chats' | 'tasks' | 'settings'
  const [activeMainView, setActiveMainView] = useState<'chats' | 'tasks' | 'settings'>('chats');
  const [taskModalOutput, setTaskModalOutput] = useState<SavedOutput | null>(null);
  const [highlightedOutputId, setHighlightedOutputId] = useState<string | null>(null);

  // Theme State
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

  // Multi-Select and Image/PDF Export State
  const [isSelectMode, setIsSelectMode] = useState(false);
  const [selectedOutputIds, setSelectedOutputIds] = useState<Set<string>>(new Set());
  const [exportModalOutputs, setExportModalOutputs] = useState<SavedOutput[]>([]);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [exportPdfModalOutputs, setExportPdfModalOutputs] = useState<SavedOutput[]>([]);
  const [isExportPdfModalOpen, setIsExportPdfModalOpen] = useState(false);
  const [isBulkDeleteModalOpen, setIsBulkDeleteModalOpen] = useState(false);

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
      const rawQ = inThreadSearchQuery.toLowerCase().trim();
      const cleanQ = rawQ.replace(/^#+/, '');
      list = list.filter(
        (m) =>
          m.content.toLowerCase().includes(rawQ) ||
          (m.title && m.title.toLowerCase().includes(rawQ)) ||
          (m.userPrompt && m.userPrompt.toLowerCase().includes(rawQ)) ||
          m.tags.some((t) => {
            const cleanT = t.toLowerCase().replace(/^#+/, '');
            return cleanT === cleanQ || cleanT.includes(cleanQ) || t.toLowerCase().includes(rawQ);
          })
      );
    }

    // Apply starred only filter
    if (starredOnlyFilter) {
      list = list.filter((m) => m.isStarred);
    }

    // Order chronologically (oldest to newest, typical chat flow)
    return [...list].sort((a, b) => a.createdAt - b.createdAt);
  }, [messages, activeChatId, inThreadSearchQuery, starredOnlyFilter]);

  // Scroll to bottom tracking
  const [showScrollBottomBtn, setShowScrollBottomBtn] = useState(false);
  const lastKnownCountRef = useRef(activeChatMessages.length);

  const scrollToBottom = (behavior: ScrollBehavior = 'smooth') => {
    messagesEndRef.current?.scrollIntoView({ behavior });
  };

  const handleScroll = () => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const distanceToBottom = container.scrollHeight - container.scrollTop - container.clientHeight;
    const isScrolledUp = distanceToBottom > 150;

    setShowScrollBottomBtn(isScrolledUp);
  };

  const handleScrollToBottomClick = () => {
    scrollToBottom('smooth');
    setShowScrollBottomBtn(false);
  };

  // Auto-scroll when new outputs arrive if user is already at bottom
  useEffect(() => {
    const prevCount = lastKnownCountRef.current;
    const currentCount = activeChatMessages.length;
    lastKnownCountRef.current = currentCount;

    if (currentCount > prevCount && prevCount > 0 && !showScrollBottomBtn) {
      scrollToBottom('smooth');
    }
  }, [activeChatMessages.length, showScrollBottomBtn]);

  useEffect(() => {
    // When switching active chat, reset scroll state and scroll to bottom
    if (activeChatId) {
      setInThreadSearchQuery('');
      setStarredOnlyFilter(false);
      setShowScrollBottomBtn(false);
      lastKnownCountRef.current = activeChatMessages.length;
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
    isTask?: boolean;
    taskDeadline?: number;
    taskTitle?: string;
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
      isTask: data.isTask,
      taskDeadline: data.taskDeadline,
      taskTitle: data.taskTitle,
      taskCompleted: false,
    };

    setMessages((prev) => [...prev, newOutput]);

    // Update chat thread updatedAt
    setChats((prev) =>
      prev.map((c) => (c.id === activeChatId ? { ...c, updatedAt: Date.now() } : c))
    );

    // Smooth scroll down to view newly saved output
    setTimeout(() => scrollToBottom('smooth'), 100);

    if (data.isTask) {
      addToast('Saved output and added as task with deadline', 'success');
    }
  };

  // Task Management Handlers
  const handleSetOutputTask = (outputId: string, deadline: number, taskTitle?: string) => {
    setMessages((prev) =>
      prev.map((m) =>
        m.id === outputId
          ? {
              ...m,
              isTask: true,
              taskDeadline: deadline,
              taskTitle: taskTitle !== undefined ? taskTitle : m.taskTitle || m.title || m.userPrompt,
              taskCompleted: m.taskCompleted ?? false,
            }
          : m
      )
    );
    addToast('Task deadline saved successfully', 'success');
  };

  const handleChangeDeadline = (outputId: string, newDeadline: number, taskTitle?: string) => {
    setMessages((prev) =>
      prev.map((m) =>
        m.id === outputId
          ? {
              ...m,
              taskDeadline: newDeadline,
              taskTitle: taskTitle !== undefined ? taskTitle : m.taskTitle,
            }
          : m
      )
    );
    addToast('Task deadline updated', 'success');
  };

  const handleToggleTaskComplete = (outputId: string) => {
    setMessages((prev) =>
      prev.map((m) => {
        if (m.id === outputId) {
          const nextCompleted = !m.taskCompleted;
          if (nextCompleted) {
            addToast('Task marked as completed! 🎉', 'success');
          } else {
            addToast('Task marked as pending', 'info');
          }
          return {
            ...m,
            taskCompleted: nextCompleted,
            taskCompletedAt: nextCompleted ? Date.now() : undefined,
          };
        }
        return m;
      })
    );
  };

  const handleRemoveTask = (outputId: string) => {
    setMessages((prev) =>
      prev.map((m) =>
        m.id === outputId
          ? {
              ...m,
              isTask: false,
              taskDeadline: undefined,
              taskTitle: undefined,
              taskCompleted: undefined,
              taskCompletedAt: undefined,
            }
          : m
      )
    );
    addToast('Removed from tasks (output kept in chat)', 'info');
  };

  const handleJumpToOutputFromTask = (chatId: string, outputId?: string) => {
    setActiveMainView('chats');
    setActiveChatId(chatId);
    if (outputId) {
      setHighlightedOutputId(outputId);
      setTimeout(() => {
        const el = document.getElementById(`output-card-${outputId}`);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 150);
      setTimeout(() => {
        setHighlightedOutputId(null);
      }, 3000);
    }
  };

  const handleDeleteOutput = (outputId: string) => {
    setMessages((prev) => prev.filter((m) => m.id !== outputId));
  };

  const handleEditOutput = (
    outputId: string,
    updates: { content: string; title?: string; aiModel?: AIModelType; tags?: string[] }
  ) => {
    setMessages((prev) =>
      prev.map((m) =>
        m.id === outputId
          ? {
              ...m,
              content: updates.content,
              title: updates.title !== undefined ? updates.title : m.title,
              aiModel: updates.aiModel || m.aiModel,
              tags: updates.tags !== undefined ? updates.tags : m.tags,
              isEdited: true,
              editedAt: Date.now(),
            }
          : m
      )
    );
    addToast('Output updated successfully', 'success');
  };

  const handleUpdateOutputTags = (outputId: string, tags: string[]) => {
    setMessages((prev) =>
      prev.map((m) =>
        m.id === outputId
          ? {
              ...m,
              tags,
            }
          : m
      )
    );
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

  // Selection & Image Export Handlers
  const handleToggleSelectMode = () => {
    setIsSelectMode((prev) => {
      if (prev) {
        setSelectedOutputIds(new Set());
      }
      return !prev;
    });
  };

  const handleToggleSelectOutput = (outputId: string) => {
    setSelectedOutputIds((prev) => {
      const next = new Set(prev);
      if (next.has(outputId)) {
        next.delete(outputId);
      } else {
        next.add(outputId);
      }
      return next;
    });
  };

  const handleSelectAllOutputs = () => {
    setSelectedOutputIds(new Set(activeChatMessages.map((m) => m.id)));
  };

  const handleDeselectAllOutputs = () => {
    setSelectedOutputIds(new Set());
  };

  const handleOpenSingleExport = (output: SavedOutput) => {
    setExportModalOutputs([output]);
    setIsExportModalOpen(true);
  };

  const handleOpenMultiExport = () => {
    const selected = activeChatMessages.filter((m) => selectedOutputIds.has(m.id));
    if (selected.length === 0) {
      addToast('Please select at least one output to export', 'info');
      return;
    }
    setExportModalOutputs(selected);
    setIsExportModalOpen(true);
  };

  const handleOpenSinglePdfExport = (output: SavedOutput) => {
    setExportPdfModalOutputs([output]);
    setIsExportPdfModalOpen(true);
  };

  const handleOpenMultiPdfExport = () => {
    const selected = activeChatMessages.filter((m) => selectedOutputIds.has(m.id));
    if (selected.length === 0) {
      addToast('Please select at least one output to export as PDF', 'info');
      return;
    }
    setExportPdfModalOutputs(selected);
    setIsExportPdfModalOpen(true);
  };

  const handleExportSingleMarkdown = (output: SavedOutput) => {
    if (!activeChat) return;
    exportOutputsAsMarkdown(activeChat, [output]);
    addToast(`Exported "${output.title || 'output'}" as Markdown (.md)`, 'success');
  };

  const handleExportSelectedMarkdown = () => {
    if (!activeChat) return;
    const selected = activeChatMessages.filter((m) => selectedOutputIds.has(m.id));
    if (selected.length === 0) {
      addToast('Please select at least one output to export as Markdown', 'info');
      return;
    }
    const customFilename = `${activeChat.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-selected-${selected.length}-outputs.md`;
    exportOutputsAsMarkdown(activeChat, selected, customFilename);
    addToast(`Exported ${selected.length} outputs as Markdown (.md)`, 'success');
  };

  const handleConfirmBulkDelete = () => {
    if (selectedOutputIds.size === 0) return;
    const count = selectedOutputIds.size;
    const nextMessages = messages.filter((m) => !selectedOutputIds.has(m.id));
    setMessages(nextMessages);
    saveAllMessagesToDB(nextMessages);

    if (activeChat) {
      const updatedChats = chats.map((c) =>
        c.id === activeChat.id ? { ...c, updatedAt: Date.now() } : c
      );
      setChats(updatedChats);
      saveAllChatsToDB(updatedChats);
    }

    setIsSelectMode(false);
    setSelectedOutputIds(new Set());
    setIsBulkDeleteModalOpen(false);
    addToast(`Deleted ${count} output${count === 1 ? '' : 's'} successfully`, 'success');
  };

  // Reset selection mode whenever active chat changes
  useEffect(() => {
    setIsSelectMode(false);
    setSelectedOutputIds(new Set());
  }, [activeChatId]);

  if (!isDBReady) {
    return (
      <div
        className={`h-screen w-screen flex flex-col items-center justify-center select-none ${
          effectiveTheme === 'dark' ? 'bg-[#111b21] text-white' : 'bg-[#f0f2f5] text-slate-800'
        }`}
      >
        <div className="w-18 h-18 sm:w-20 sm:h-20 rounded-2xl overflow-hidden shadow-xl shadow-teal-900/10 mb-5 animate-pulse border border-slate-200/60 dark:border-white/10 bg-[#00a884]">
          <img
            src="/pwa-192x192.png"
            alt="KeepChat Logo"
            className="w-full h-full object-cover"
          />
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
            activeMainView === 'settings'
              ? 'flex w-full md:w-auto'
              : activeMainView === 'tasks'
              ? 'hidden md:flex'
              : activeChatId
              ? 'hidden md:flex'
              : 'flex w-full md:w-auto'
          }`}
        >
          {activeMainView === 'settings' ? (
            <SettingsView
              onBack={() => setActiveMainView('chats')}
              themeMode={themeMode}
              onSelectThemeMode={handleSelectThemeMode}
              effectiveTheme={effectiveTheme}
            />
          ) : (
            <Sidebar
              chats={chats}
              messages={messages}
              activeChatId={activeChatId}
              onSelectChat={(id) => {
                setActiveChatId(id);
                setActiveMainView('chats');
              }}
              onNewChat={handleOpenNewChat}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              selectedCategory={selectedCategory}
              setSelectedCategory={setSelectedCategory}
              onOpenSettings={() => setActiveMainView('settings')}
              onOpenTasks={() => setActiveMainView('tasks')}
              isTasksActive={activeMainView === 'tasks'}
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

        {/* Right Pane (Tasks View, Chat View, or Empty Desktop Selection) */}
        <div
          className={`flex-1 h-full flex-col min-w-0 transition-all duration-200 ${
            activeMainView === 'settings'
              ? 'hidden md:flex'
              : activeMainView === 'tasks'
              ? 'flex w-full'
              : activeChatId
              ? 'flex'
              : 'hidden md:flex'
          }`}
        >
          {activeMainView === 'tasks' ? (
            <TasksView
              chats={chats}
              messages={messages}
              onBackToChats={() => setActiveMainView('chats')}
              onOpenChat={handleJumpToOutputFromTask}
              onChangeDeadline={handleChangeDeadline}
              onToggleTaskComplete={handleToggleTaskComplete}
              onRemoveTask={handleRemoveTask}
            />
          ) : activeChat ? (
            <div className="flex-1 h-full flex flex-col min-w-0 bg-[#efeae2] dark:bg-[#0b141a] relative">
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
                isSelectMode={isSelectMode}
                onToggleSelectMode={handleToggleSelectMode}
              />

              {/* Multi-Select Floating Action Bar */}
              {isSelectMode && (
                <MultiSelectBar
                  selectedCount={selectedOutputIds.size}
                  totalCount={activeChatMessages.length}
                  onSelectAll={handleSelectAllOutputs}
                  onDeselectAll={handleDeselectAllOutputs}
                  onExportSelected={handleOpenMultiExport}
                  onExportPdf={handleOpenMultiPdfExport}
                  onExportMarkdown={handleExportSelectedMarkdown}
                  onDeleteSelected={() => setIsBulkDeleteModalOpen(true)}
                  onCancel={() => {
                    setIsSelectMode(false);
                    setSelectedOutputIds(new Set());
                  }}
                />
              )}

              {/* Message Body Area with WhatsApp Wallpaper Pattern */}
              <div
                ref={scrollContainerRef}
                onScroll={handleScroll}
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
                            <div
                              id={`output-card-${output.id}`}
                              className={
                                highlightedOutputId === output.id
                                  ? 'rounded-2xl ring-4 ring-[#00a884] ring-offset-2 ring-offset-[#efeae2] dark:ring-offset-[#0b141a] transition-all duration-300'
                                  : ''
                              }
                            >
                              <OutputCard
                                output={output}
                                onDelete={handleDeleteOutput}
                                onToggleStar={handleToggleStar}
                                onEditOutput={handleEditOutput}
                                onUpdateTags={handleUpdateOutputTags}
                                onTagClick={(tag) => setInThreadSearchQuery(tag)}
                                onExportImage={handleOpenSingleExport}
                                onExportPdf={handleOpenSinglePdfExport}
                                onExportMarkdown={handleExportSingleMarkdown}
                                isSelectMode={isSelectMode}
                                isSelected={selectedOutputIds.has(output.id)}
                                onToggleSelect={handleToggleSelectOutput}
                                onTurnIntoTask={(out) => setTaskModalOutput(out)}
                                onChangeDeadline={(out) => setTaskModalOutput(out)}
                                onToggleTaskComplete={handleToggleTaskComplete}
                                onRemoveTask={handleRemoveTask}
                                onOpenTasksPage={() => setActiveMainView('tasks')}
                              />
                            </div>
                          </React.Fragment>
                        );
                      })}
                    </>
                  )}

                  <div ref={messagesEndRef} className="h-2" />
                </div>
              </div>

              {/* WhatsApp-Style Floating Scroll-to-Bottom Button */}
              <ScrollToBottomButton
                visible={showScrollBottomBtn}
                onClick={handleScrollToBottomClick}
              />

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

      {/* WhatsApp-Style Image Export Modal */}
      {activeChat && (
        <ExportSnapshotModal
          isOpen={isExportModalOpen}
          onClose={() => setIsExportModalOpen(false)}
          chat={activeChat}
          outputs={exportModalOutputs}
          defaultTheme={effectiveTheme}
          onToast={addToast}
        />
      )}

      {/* Clean A4 Paginated Document PDF Export Modal */}
      {activeChat && (
        <ExportPdfModal
          isOpen={isExportPdfModalOpen}
          onClose={() => setIsExportPdfModalOpen(false)}
          chat={activeChat}
          outputs={exportPdfModalOutputs}
          onToast={addToast}
        />
      )}

      {/* Confirm Bulk Delete Selected Outputs Modal */}
      <ConfirmBulkDeleteModal
        isOpen={isBulkDeleteModalOpen}
        onClose={() => setIsBulkDeleteModalOpen(false)}
        onConfirm={handleConfirmBulkDelete}
        count={selectedOutputIds.size}
      />

      {/* Set or Change Task Deadline Modal */}
      <TaskDeadlineModal
        isOpen={Boolean(taskModalOutput)}
        onClose={() => setTaskModalOutput(null)}
        output={taskModalOutput}
        onSaveTask={handleSetOutputTask}
        onRemoveTask={handleRemoveTask}
      />

      {/* Offline Status Connectivity Banner */}
      <OfflineIndicator />

      {/* Non-blocking Toast Alerts */}
      <ToastContainer toasts={toasts} onDismiss={removeToast} />
    </div>
  );
}
