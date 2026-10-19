import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  Menu,
  ArrowLeft,
  MoreHorizontal,
  Clock,
  Flag,
  Check,
  Plus,
  Search,
  Trash2,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Calendar,
  X,
  Sparkles,
  Bot,
  Brain,
  Cpu,
  MessageSquare,
  CheckCheck,
} from 'lucide-react';
import { ChatThread, SavedOutput, AIModelType } from '../types/keepchat';
import {
  isDeadlineOverdue,
  formatDeadlineRelative,
  formatDeadlineDateTime,
} from '../utils/date';
import { MarkdownRenderer } from './MarkdownRenderer';
import { TaskDeadlineModal } from './TaskDeadlineModal';

interface TasksViewProps {
  chats: ChatThread[];
  messages: SavedOutput[];
  onBackToChats: () => void;
  onOpenChat: (chatId: string, outputId?: string) => void;
  onChangeDeadline: (outputId: string, newDeadline: number, taskTitle?: string) => void;
  onToggleTaskComplete: (outputId: string) => void;
  onRemoveTask: (outputId: string) => void;
  onToggleStar?: (outputId: string) => void;
  onAddTask?: (taskTitle: string, deadline?: number) => void;
}

type FilterTab = 'all' | 'overdue' | 'upcoming' | 'done';

const MODEL_ICONS: Record<AIModelType, React.ElementType> = {
  ChatGPT: Bot,
  Gemini: Sparkles,
  Claude: Brain,
  DeepSeek: Cpu,
  Other: MessageSquare,
};

export const TasksView: React.FC<TasksViewProps> = ({
  chats,
  messages,
  onBackToChats,
  onOpenChat,
  onChangeDeadline,
  onToggleTaskComplete,
  onRemoveTask,
  onToggleStar,
  onAddTask,
}) => {
  const [filterTab, setFilterTab] = useState<FilterTab>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchInput, setShowSearchInput] = useState(false);
  const [editingOutput, setEditingOutput] = useState<SavedOutput | null>(null);
  const [expandedOutputIds, setExpandedOutputIds] = useState<Set<string>>(new Set());
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const moreMenuRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Close more menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (moreMenuRef.current && !moreMenuRef.current.contains(e.target as Node)) {
        setShowMoreMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Chat lookup map
  const chatMap = useMemo(() => {
    const map = new Map<string, ChatThread>();
    chats.forEach((c) => map.set(c.id, c));
    return map;
  }, [chats]);

  // Extract all outputs that are marked as tasks
  const allTasks = useMemo(() => {
    return messages.filter((m) => Boolean(m.isTask));
  }, [messages]);

  // Formatted current date e.g. "May 20, 2024" matching the mockup
  const currentDateString = useMemo(() => {
    return new Date().toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  }, []);

  // Count of pending overdue tasks
  const overdueCount = useMemo(() => {
    return allTasks.filter((t) => !t.taskCompleted && isDeadlineOverdue(t.taskDeadline)).length;
  }, [allTasks]);

  // Count of upcoming tasks (incomplete and not overdue)
  const upcomingCount = useMemo(() => {
    return allTasks.filter((t) => !t.taskCompleted && !isDeadlineOverdue(t.taskDeadline)).length;
  }, [allTasks]);

  // Filtered tasks based on active segmented tab and optional search query
  const filteredTasks = useMemo(() => {
    return allTasks.filter((task) => {
      // Search query filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const chat = chatMap.get(task.chatId);
        const chatTitle = chat ? chat.title.toLowerCase() : '';
        const title = (task.taskTitle || task.title || task.userPrompt || '').toLowerCase();
        const content = task.content.toLowerCase();
        if (!title.includes(q) && !content.includes(q) && !chatTitle.includes(q)) {
          return false;
        }
      }

      const isCompleted = Boolean(task.taskCompleted);
      const isOverdue = !isCompleted && isDeadlineOverdue(task.taskDeadline);

      switch (filterTab) {
        case 'overdue':
          // Overdue tasks that are past their deadline and not yet completed
          return !isCompleted && isOverdue;
        case 'upcoming':
          // Tasks that haven't been completed and aren't overdue
          return !isCompleted && !isOverdue;
        case 'done':
          // Completed tasks
          return isCompleted;
        case 'all':
        default:
          return true;
      }
    });
  }, [allTasks, filterTab, searchQuery, chatMap]);

  const toggleExpand = (id: string) => {
    setExpandedOutputIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleAddNewTask = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = newTaskTitle.trim();
    if (!trimmed) return;

    if (onAddTask) {
      onAddTask(trimmed);
    } else {
      // Fallback if onAddTask not wired: set deadline for 24h
      const targetChatId = chats[0]?.id || 'chat-welcome';
      const outputId = `task-${Date.now()}`;
      onChangeDeadline(outputId, Date.now() + 24 * 60 * 60 * 1000, trimmed);
    }

    setNewTaskTitle('');
    inputRef.current?.blur();
  };

  // Helper to format deadline time nicely (e.g. "9:00 AM" or "Tomorrow, 11:30 AM")
  const formatTaskTime = (deadline?: number): string => {
    if (!deadline) return 'No time';
    const d = new Date(deadline);
    const timeStr = d.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });

    const now = new Date();
    const isToday =
      d.getDate() === now.getDate() &&
      d.getMonth() === now.getMonth() &&
      d.getFullYear() === now.getFullYear();

    if (isToday) {
      return timeStr;
    }

    return `${d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}, ${timeStr}`;
  };

  return (
    <div className="flex-1 h-full flex flex-col min-w-0 bg-[#f8fafc] dark:bg-[#0b141a] text-slate-800 dark:text-slate-100 overflow-y-auto transition-colors duration-200">
      {/* Centered Minimalist Container Matching Mockup */}
      <div className="w-full max-w-lg mx-auto px-4 sm:px-6 py-5 flex flex-col flex-1 min-h-full">
        {/* Top App Bar with Menu & More Dots */}
        <div className="flex items-center justify-between relative mb-4">
          <button
            type="button"
            onClick={onBackToChats}
            className="p-2 -ml-2 rounded-xl text-slate-700 dark:text-slate-200 hover:text-[#00a884] dark:hover:text-teal-400 hover:bg-slate-200/70 dark:hover:bg-[#202c33] active:scale-95 transition-all cursor-pointer"
            title="Back to Chats"
            aria-label="Back to Chats"
          >
            <ArrowLeft className="w-6 h-6 stroke-[2.2]" />
          </button>

          <div className="flex items-center gap-1">
            {showSearchInput && (
              <div className="relative animate-in fade-in zoom-in-95 duration-150">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search tasks..."
                  className="w-40 sm:w-52 py-1 px-3 pr-7 text-xs rounded-lg border border-slate-200 dark:border-[#2a3942] bg-white dark:bg-[#202c33] text-slate-800 dark:text-slate-100 focus:outline-hidden focus:ring-1 focus:ring-[#00a884]"
                  autoFocus
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2 top-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            )}

            <button
              type="button"
              onClick={() => setShowSearchInput(!showSearchInput)}
              className="p-2 rounded-xl text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-200/70 dark:hover:bg-[#202c33] transition-colors cursor-pointer"
              title="Search Tasks"
            >
              <Search className="w-4 h-4" />
            </button>

            {/* Three Dots More Menu */}
            <div className="relative" ref={moreMenuRef}>
              <button
                type="button"
                onClick={() => setShowMoreMenu(!showMoreMenu)}
                className="p-2 rounded-xl text-slate-700 dark:text-slate-200 hover:bg-slate-200/70 dark:hover:bg-[#202c33] transition-colors cursor-pointer"
                title="Options"
                aria-label="Options"
              >
                <MoreHorizontal className="w-6 h-6 stroke-[2.2]" />
              </button>

              {showMoreMenu && (
                <div className="absolute right-0 mt-1 w-48 bg-white dark:bg-[#202c33] rounded-xl shadow-xl border border-slate-200 dark:border-[#2a3942] py-1.5 z-30 text-xs text-slate-700 dark:text-slate-200 animate-in fade-in zoom-in-95 duration-100">
                  <button
                    type="button"
                    onClick={() => {
                      setShowMoreMenu(false);
                      inputRef.current?.focus();
                    }}
                    className="w-full px-3.5 py-2 text-left hover:bg-slate-100 dark:hover:bg-[#2a3942] flex items-center gap-2 cursor-pointer"
                  >
                    <Plus className="w-4 h-4 text-[#00a884]" />
                    <span>Add New Task</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowMoreMenu(false);
                      onBackToChats();
                    }}
                    className="w-full px-3.5 py-2 text-left hover:bg-slate-100 dark:hover:bg-[#2a3942] flex items-center gap-2 cursor-pointer"
                  >
                    <MessageSquare className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                    <span>Return to Chats</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Big Bold Title & Date Subtitle */}
        <div className="mb-6">
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            My Tasks
          </h1>
          <p className="text-sm font-medium text-slate-400 dark:text-slate-400 mt-1">
            {currentDateString}
          </p>
        </div>

        {/* Segmented Control Filter Tabs: All, To Do, In Progress, Done */}
        <div className="bg-slate-200/70 dark:bg-[#111b21] p-1 rounded-2xl flex items-center justify-between gap-1 mb-5">
          <button
            type="button"
            onClick={() => setFilterTab('all')}
            className={`flex-1 py-2 px-3 text-center rounded-xl text-xs sm:text-sm font-semibold transition-all duration-150 cursor-pointer ${
              filterTab === 'all'
                ? 'bg-white dark:bg-[#202c33] text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
          >
            All
          </button>
          <button
            type="button"
            onClick={() => setFilterTab('overdue')}
            className={`flex-1 py-2 px-2 sm:px-3 text-center rounded-xl text-xs sm:text-sm font-semibold transition-all duration-150 cursor-pointer flex items-center justify-center gap-1.5 ${
              filterTab === 'overdue'
                ? 'bg-white dark:bg-[#202c33] text-rose-600 dark:text-rose-400 shadow-xs'
                : overdueCount > 0
                ? 'text-rose-600/90 hover:text-rose-700 dark:text-rose-400/90 dark:hover:text-rose-300'
                : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
          >
            <span>Overdue</span>
            {overdueCount > 0 && (
              <span
                className={`px-1.5 py-0.2 text-[10px] rounded-full font-bold tabular-nums leading-none ${
                  filterTab === 'overdue'
                    ? 'bg-rose-100 dark:bg-rose-950/80 text-rose-600 dark:text-rose-300'
                    : 'bg-rose-500 text-white shadow-2xs'
                }`}
              >
                {overdueCount}
              </span>
            )}
          </button>
          <button
            type="button"
            onClick={() => setFilterTab('upcoming')}
            className={`flex-1 py-2 px-2 sm:px-3 text-center rounded-xl text-xs sm:text-sm font-semibold transition-all duration-150 cursor-pointer flex items-center justify-center gap-1.5 ${
              filterTab === 'upcoming'
                ? 'bg-white dark:bg-[#202c33] text-[#00a884] dark:text-teal-400 shadow-xs'
                : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
          >
            <span>Upcoming</span>
            {upcomingCount > 0 && (
              <span
                className={`px-1.5 py-0.2 text-[10px] rounded-full font-bold tabular-nums leading-none ${
                  filterTab === 'upcoming'
                    ? 'bg-teal-100 dark:bg-teal-950/80 text-teal-700 dark:text-teal-300'
                    : 'bg-slate-200/80 dark:bg-[#2a3942] text-slate-600 dark:text-slate-300'
                }`}
              >
                {upcomingCount}
              </span>
            )}
          </button>
          <button
            type="button"
            onClick={() => setFilterTab('done')}
            className={`flex-1 py-2 px-3 text-center rounded-xl text-xs sm:text-sm font-semibold transition-all duration-150 cursor-pointer ${
              filterTab === 'done'
                ? 'bg-white dark:bg-[#202c33] text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
          >
            Done
          </button>
        </div>

        {/* Task Cards List */}
        <div className="space-y-3 flex-1">
          {filteredTasks.length === 0 ? (
            <div className="p-8 text-center bg-white dark:bg-[#202c33] rounded-2xl border border-slate-100 dark:border-[#2a3942] shadow-2xs">
              <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-[#111b21] text-slate-400 flex items-center justify-center mx-auto mb-3">
                <CheckCheck className="w-6 h-6 stroke-[1.8]" />
              </div>
              <h3 className="font-semibold text-slate-800 dark:text-slate-200 text-sm">
                No tasks in this view
              </h3>
              <p className="text-xs text-slate-400 dark:text-slate-400 mt-1 max-w-xs mx-auto">
                {filterTab === 'done'
                  ? 'Complete some tasks from your list to see them here!'
                  : filterTab === 'overdue'
                  ? 'Zero overdue tasks! Everything is on schedule.'
                  : filterTab === 'upcoming'
                  ? 'No upcoming tasks right now! Add a task below.'
                  : 'Add a new task below or convert an AI output from your chats into a task.'}
              </p>
            </div>
          ) : (
            filteredTasks.map((task) => {
              const isCompleted = Boolean(task.taskCompleted);
              const isOverdue = !isCompleted && isDeadlineOverdue(task.taskDeadline);
              const isFlagged = Boolean(task.isStarred || isCompleted);
              const isExpanded = expandedOutputIds.has(task.id);
              const taskTitle = task.taskTitle || task.title || task.userPrompt || 'Untitled Task';
              const chat = chatMap.get(task.chatId);
              const ModelIcon = MODEL_ICONS[task.aiModel] || MessageSquare;

              return (
                <div
                  key={task.id}
                  className="bg-white dark:bg-[#202c33] rounded-2xl border border-slate-100/90 dark:border-[#2a3942]/60 shadow-2xs hover:shadow-xs transition-all duration-150 overflow-hidden group"
                >
                  <div className="p-4 flex items-center justify-between gap-3.5">
                    {/* Left Checkbox: Incomplete circular border or Completed green checkmark */}
                    <button
                      type="button"
                      onClick={() => onToggleTaskComplete(task.id)}
                      className="shrink-0 transition-transform active:scale-90 cursor-pointer focus:outline-hidden"
                      aria-label={isCompleted ? 'Mark task as incomplete' : 'Mark task as complete'}
                    >
                      {isCompleted ? (
                        <div className="w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-xs">
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                        </div>
                      ) : (
                        <div className="w-6 h-6 rounded-full border-2 border-slate-300 dark:border-slate-600 hover:border-emerald-500 dark:hover:border-emerald-400 transition-colors" />
                      )}
                    </button>

                    {/* Middle Content: Task Title & Clock/Time */}
                    <div
                      className="flex-1 min-w-0 cursor-pointer select-text"
                      onClick={() => toggleExpand(task.id)}
                    >
                      <h3
                        className={`text-sm sm:text-base font-semibold leading-snug tracking-tight text-slate-800 dark:text-slate-100 transition-colors ${
                          isCompleted
                            ? 'line-through text-slate-400 dark:text-slate-500'
                            : ''
                        }`}
                      >
                        {taskTitle}
                      </h3>

                      <div className="flex items-center gap-1.5 text-xs text-slate-400 dark:text-slate-400 mt-0.5">
                        <Clock className="w-3.5 h-3.5 stroke-[2] shrink-0" />
                        <span className={isOverdue ? 'text-rose-500 font-medium' : ''}>
                          {formatTaskTime(task.taskDeadline)}
                        </span>
                        {isOverdue && (
                          <span className="text-[10px] uppercase font-bold text-rose-500 bg-rose-50 dark:bg-rose-950/40 px-1.5 py-0.2 rounded-xs ml-1">
                            Overdue
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Right Flag Button: Green filled or Gray outline */}
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={() => onToggleStar && onToggleStar(task.id)}
                        className="p-1 rounded-lg text-slate-300 dark:text-slate-600 hover:text-emerald-500 dark:hover:text-emerald-400 transition-colors cursor-pointer"
                        title={isFlagged ? 'Flagged Priority' : 'Flag Task'}
                        aria-label="Flag task"
                      >
                        <Flag
                          className={`w-5 h-5 transition-colors ${
                            isFlagged
                              ? 'fill-emerald-500 text-emerald-500'
                              : 'text-slate-300 dark:text-slate-600 group-hover:text-slate-400'
                          }`}
                        />
                      </button>

                      {/* Expand / Details Toggle Chevron */}
                      <button
                        type="button"
                        onClick={() => toggleExpand(task.id)}
                        className="p-1 rounded-lg text-slate-300 dark:text-slate-600 hover:text-slate-600 dark:hover:text-slate-300 transition-colors cursor-pointer"
                        title={isExpanded ? 'Collapse notes' : 'View notes'}
                      >
                        {isExpanded ? (
                          <ChevronUp className="w-4 h-4" />
                        ) : (
                          <ChevronDown className="w-4 h-4 opacity-50 group-hover:opacity-100" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Expandable Vault Details Drawer */}
                  {isExpanded && (
                    <div className="px-4 pb-4 pt-1 border-t border-slate-100 dark:border-[#2a3942]/60 bg-slate-50/50 dark:bg-[#1a2329]/40 space-y-3 animate-in fade-in duration-150">
                      {/* Action & Metadata Bar */}
                      <div className="flex items-center justify-between text-xs pt-1 flex-wrap gap-2">
                        <div className="flex items-center gap-2">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-200/80 dark:bg-[#202c33] text-slate-600 dark:text-slate-300 text-[11px] font-medium">
                            <ModelIcon className="w-3 h-3 text-[#00a884]" />
                            {task.aiModel}
                          </span>
                          {chat && (
                            <button
                              type="button"
                              onClick={() => onOpenChat(task.chatId, task.id)}
                              className="text-teal-600 dark:text-teal-400 hover:underline flex items-center gap-1 text-[11px] cursor-pointer"
                            >
                              <span>{chat.title}</span>
                              <ExternalLink className="w-3 h-3" />
                            </button>
                          )}
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setEditingOutput(task)}
                            className="inline-flex items-center gap-1 text-slate-600 dark:text-slate-300 hover:text-[#00a884] dark:hover:text-teal-400 cursor-pointer"
                          >
                            <Calendar className="w-3.5 h-3.5" />
                            <span>Edit Time</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => onRemoveTask(task.id)}
                            className="inline-flex items-center gap-1 text-rose-500 hover:text-rose-600 dark:hover:text-rose-400 cursor-pointer ml-1"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Remove</span>
                          </button>
                        </div>
                      </div>

                      {/* Content Preview */}
                      {task.content && (
                        <div className="max-h-48 overflow-y-auto rounded-xl p-3 bg-white dark:bg-[#111b21] border border-slate-200/80 dark:border-[#2a3942] text-xs">
                          <MarkdownRenderer content={task.content} />
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Bottom Input: "+ Add a new task..." matching the mockup */}
        <form
          onSubmit={handleAddNewTask}
          className="mt-5 rounded-2xl bg-slate-100/80 dark:bg-[#111b21] border border-slate-200/70 dark:border-[#2a3942] p-2.5 sm:p-3 flex items-center gap-2.5 shadow-xs focus-within:ring-2 focus-within:ring-[#00a884]/40 focus-within:border-[#00a884] transition-all"
        >
          <button
            type="submit"
            className="p-1 rounded-lg text-slate-400 hover:text-[#00a884] transition-colors cursor-pointer"
            aria-label="Add task"
          >
            <Plus className="w-5 h-5 stroke-[2.5]" />
          </button>
          <input
            ref={inputRef}
            type="text"
            value={newTaskTitle}
            onChange={(e) => setNewTaskTitle(e.target.value)}
            placeholder="Add a new task..."
            className="flex-1 bg-transparent text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden"
          />
          {newTaskTitle.trim() && (
            <button
              type="submit"
              className="px-3 py-1 bg-[#00a884] hover:bg-[#008069] text-white rounded-xl text-xs font-semibold shadow-xs transition-all cursor-pointer"
            >
              Add
            </button>
          )}
        </form>
      </div>

      {/* Task Deadline / Title Editing Modal */}
      <TaskDeadlineModal
        isOpen={Boolean(editingOutput)}
        onClose={() => setEditingOutput(null)}
        output={editingOutput}
        onSaveTask={(outputId, newDeadline, newTitle) => {
          onChangeDeadline(outputId, newDeadline, newTitle);
          setEditingOutput(null);
        }}
        onRemoveTask={(outputId) => {
          onRemoveTask(outputId);
          setEditingOutput(null);
        }}
      />
    </div>
  );
};
