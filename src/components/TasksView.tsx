import React, { useState, useMemo } from 'react';
import {
  ListTodo,
  AlertTriangle,
  CalendarCheck,
  CheckCircle2,
  Clock,
  Calendar,
  Search,
  ArrowUpDown,
  ArrowLeft,
  MessageSquare,
  Sparkles,
  Bot,
  Brain,
  Cpu,
  Check,
  Plus,
  Pencil,
  Trash2,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Tag,
  Filter,
  MoreVertical,
  X,
} from 'lucide-react';
import { ChatThread, SavedOutput, AIModelType } from '../types/keepchat';
import {
  isDeadlineOverdue,
  formatDeadlineRelative,
  formatDeadlineDateTime,
  formatFullDateTime,
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
}

type FilterTab = 'all' | 'overdue' | 'upcoming' | 'completed';
type SortOption = 'deadline-asc' | 'deadline-desc' | 'created-desc';

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
}) => {
  const [filterTab, setFilterTab] = useState<FilterTab>('all');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('deadline-asc');
  const [editingOutput, setEditingOutput] = useState<SavedOutput | null>(null);
  const [expandedOutputIds, setExpandedOutputIds] = useState<Set<string>>(new Set());
  const [showMobileMenu, setShowMobileMenu] = useState(false);

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

  // Extract all unique tags present across tasks, sorted by frequency descending
  const availableTags = useMemo(() => {
    const map = new Map<string, number>();
    allTasks.forEach((t) => {
      t.tags?.forEach((rawTag) => {
        const clean = rawTag.trim().toLowerCase().replace(/^#+/, '');
        if (clean) {
          map.set(clean, (map.get(clean) || 0) + 1);
        }
      });
    });
    return Array.from(map.entries()).sort((a, b) => b[1] - a[1]);
  }, [allTasks]);

  // Counts for metrics and filter tabs
  const { overdueCount, upcomingCount, completedCount } = useMemo(() => {
    let overdue = 0;
    let upcoming = 0;
    let completed = 0;

    allTasks.forEach((t) => {
      if (t.taskCompleted) {
        completed++;
      } else if (isDeadlineOverdue(t.taskDeadline)) {
        overdue++;
      } else {
        upcoming++;
      }
    });

    return { overdueCount: overdue, upcomingCount: upcoming, completedCount: completed };
  }, [allTasks]);

  // Filtered and sorted tasks list
  const filteredTasks = useMemo(() => {
    let list = allTasks.filter((t) => {
      const isOverdue = !t.taskCompleted && isDeadlineOverdue(t.taskDeadline);
      const isUpcoming = !t.taskCompleted && !isDeadlineOverdue(t.taskDeadline);

      if (filterTab === 'overdue' && !isOverdue) return false;
      if (filterTab === 'upcoming' && !isUpcoming) return false;
      if (filterTab === 'completed' && !t.taskCompleted) return false;

      // Filter by selected tag
      if (selectedTag) {
        const cleanSelected = selectedTag.toLowerCase().replace(/^#+/, '');
        const hasTag = t.tags?.some(
          (tg) => tg.trim().toLowerCase().replace(/^#+/, '') === cleanSelected
        );
        if (!hasTag) return false;
      }

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const chat = chatMap.get(t.chatId);
        const chatTitle = chat ? chat.title.toLowerCase() : '';
        const title = (t.taskTitle || t.title || t.userPrompt || '').toLowerCase();
        const content = t.content.toLowerCase();
        const tags = t.tags.join(' ').toLowerCase();

        return title.includes(q) || content.includes(q) || tags.includes(q) || chatTitle.includes(q);
      }

      return true;
    });

    // Sort
    return list.sort((a, b) => {
      // Completed items go to the bottom unless completed filter is selected
      if (filterTab !== 'completed') {
        if (a.taskCompleted && !b.taskCompleted) return 1;
        if (!a.taskCompleted && b.taskCompleted) return -1;
      }

      const aDeadline = a.taskDeadline || Infinity;
      const bDeadline = b.taskDeadline || Infinity;

      if (sortBy === 'deadline-asc') {
        return aDeadline - bDeadline;
      }
      if (sortBy === 'deadline-desc') {
        return bDeadline - aDeadline;
      }
      // created-desc
      return b.createdAt - a.createdAt;
    });
  }, [allTasks, filterTab, selectedTag, searchQuery, sortBy, chatMap]);

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

  const handleQuickExtend = (output: SavedOutput, days: number) => {
    const current = output.taskDeadline || Date.now();
    // If already overdue, extend from right now
    const base = isDeadlineOverdue(current) ? Date.now() : current;
    const newDeadline = base + days * 24 * 60 * 60 * 1000;
    onChangeDeadline(output.id, newDeadline, output.taskTitle);
  };

  return (
    <div className="flex-1 h-full flex flex-col min-w-0 bg-[#f0f2f5] dark:bg-[#0b141a] overflow-hidden select-none">
      {/* Top Header Bar */}
      <header className="px-3 py-2.5 sm:px-6 sm:py-3 bg-[#f0f2f5] dark:bg-[#202c33] border-b border-slate-200 dark:border-[#222d34] flex items-center justify-between min-h-[58px] shrink-0">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
          <button
            onClick={onBackToChats}
            className="p-2 -ml-1 rounded-full text-slate-600 dark:text-slate-300 hover:bg-slate-200/70 dark:hover:bg-[#2a3942] transition-colors cursor-pointer shrink-0"
            title="Back to Chats"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-teal-500/10 dark:bg-[#00a884]/20 text-[#00a884] dark:text-[#25d366] flex items-center justify-center border border-[#00a884]/30 shrink-0">
              <ListTodo className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <h1 className="text-sm sm:text-lg font-bold text-slate-900 dark:text-white leading-tight truncate">
                  Tasks & Deadlines
                </h1>
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 tabular-nums shrink-0">
                  ({allTasks.length})
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 hidden sm:block truncate">
                Track AI outputs turned into actionable tasks with visual deadline alerts
              </p>
            </div>
          </div>
        </div>

        {/* Right Header Actions */}
        <div className="flex items-center gap-1.5 shrink-0">
          {/* Desktop Direct Action: Go to Chats */}
          <button
            onClick={onBackToChats}
            className="hidden sm:flex px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-200 bg-white dark:bg-[#202c33] hover:bg-slate-100 dark:hover:bg-[#2a3942] border border-slate-200 dark:border-[#2a3942] rounded-lg transition-colors cursor-pointer items-center gap-1.5"
          >
            <MessageSquare className="w-3.5 h-3.5 text-[#00a884]" />
            <span>Go to Chats</span>
          </button>

          {/* Mobile 3-Dots Menu Button */}
          <div className="relative sm:hidden">
            <button
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="relative p-2 rounded-full text-slate-600 dark:text-slate-300 hover:bg-slate-200/70 dark:hover:bg-[#2a3942] transition-colors cursor-pointer"
              title="Tasks options"
              aria-label="Tasks options"
            >
              <MoreVertical className="w-5 h-5" />
              {/* Active dot if filtered or overdue tasks exist */}
              {(filterTab !== 'all' || overdueCount > 0 || selectedTag !== null) && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#00a884] ring-2 ring-[#f0f2f5] dark:ring-[#202c33]" />
              )}
            </button>

            {/* Mobile Menu Drawer */}
            {showMobileMenu && (
              <>
                <div
                  className="fixed inset-0 z-30"
                  onClick={() => setShowMobileMenu(false)}
                />
                <div className="absolute right-0 top-full mt-1.5 w-60 bg-white dark:bg-[#202c33] rounded-xl shadow-xl border border-slate-200 dark:border-[#2a3942] py-2 z-40 animate-in fade-in zoom-in-95 duration-100">
                  {/* Primary Nav: Go to Chats */}
                  <button
                    onClick={() => {
                      setShowMobileMenu(false);
                      onBackToChats();
                    }}
                    className="w-full flex items-center justify-between px-4 py-2.5 text-xs font-medium text-slate-800 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-[#182229] transition-colors text-left cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5">
                      <MessageSquare className="w-4 h-4 text-[#00a884]" />
                      <span className="font-semibold">Go to Chats</span>
                    </div>
                    <ArrowLeft className="w-3.5 h-3.5 text-slate-400 rotate-180" />
                  </button>

                  <div className="my-1.5 border-t border-slate-100 dark:border-[#2a3942]" />

                  {/* Filter Shortcuts */}
                  <div className="px-4 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                    Filter Tasks
                  </div>

                  <button
                    onClick={() => {
                      setFilterTab('all');
                      setShowMobileMenu(false);
                    }}
                    className={`w-full flex items-center justify-between px-4 py-2 text-xs font-medium transition-colors text-left cursor-pointer ${
                      filterTab === 'all'
                        ? 'text-[#00a884] bg-emerald-50/70 dark:bg-teal-950/30 font-semibold'
                        : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-[#182229]'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <ListTodo className="w-4 h-4 text-slate-400" />
                      <span>All Tasks</span>
                    </div>
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-slate-100 dark:bg-[#111b21] font-semibold text-slate-600 dark:text-slate-300">
                      {allTasks.length}
                    </span>
                  </button>

                  <button
                    onClick={() => {
                      setFilterTab('overdue');
                      setShowMobileMenu(false);
                    }}
                    className={`w-full flex items-center justify-between px-4 py-2 text-xs font-medium transition-colors text-left cursor-pointer ${
                      filterTab === 'overdue'
                        ? 'text-rose-600 bg-rose-50 dark:bg-rose-950/40 font-semibold'
                        : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-[#182229]'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <AlertTriangle className="w-4 h-4 text-rose-500" />
                      <span className="text-rose-600 dark:text-rose-400 font-semibold">Overdue</span>
                    </div>
                    {overdueCount > 0 ? (
                      <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-rose-100 text-rose-700 dark:bg-rose-900/60 dark:text-rose-200 font-bold">
                        {overdueCount}
                      </span>
                    ) : (
                      <span className="text-[10px] text-slate-400">0</span>
                    )}
                  </button>

                  <button
                    onClick={() => {
                      setFilterTab('upcoming');
                      setShowMobileMenu(false);
                    }}
                    className={`w-full flex items-center justify-between px-4 py-2 text-xs font-medium transition-colors text-left cursor-pointer ${
                      filterTab === 'upcoming'
                        ? 'text-emerald-700 dark:text-teal-400 bg-emerald-50 dark:bg-emerald-950/40 font-semibold'
                        : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-[#182229]'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <CalendarCheck className="w-4 h-4 text-[#00a884]" />
                      <span>Upcoming</span>
                    </div>
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700 dark:bg-teal-950/60 dark:text-teal-300 font-semibold">
                      {upcomingCount}
                    </span>
                  </button>

                  <button
                    onClick={() => {
                      setFilterTab('completed');
                      setShowMobileMenu(false);
                    }}
                    className={`w-full flex items-center justify-between px-4 py-2 text-xs font-medium transition-colors text-left cursor-pointer ${
                      filterTab === 'completed'
                        ? 'text-slate-900 dark:text-white bg-slate-100 dark:bg-[#182229] font-semibold'
                        : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-[#182229]'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-slate-400" />
                      <span>Completed</span>
                    </div>
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-slate-100 dark:bg-[#111b21] font-semibold text-slate-600 dark:text-slate-300">
                      {completedCount}
                    </span>
                  </button>

                  {/* Tag Filter Shortcuts for Mobile */}
                  {availableTags.length > 0 && (
                    <>
                      <div className="my-1.5 border-t border-slate-100 dark:border-[#2a3942]" />
                      <div className="px-4 py-1 flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                        <span>Filter by Tag</span>
                        {selectedTag && (
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedTag(null);
                              setShowMobileMenu(false);
                            }}
                            className="text-rose-500 hover:text-rose-600 text-[10px] font-semibold lowercase cursor-pointer"
                          >
                            clear
                          </button>
                        )}
                      </div>
                      <div className="px-3 py-1 flex flex-wrap gap-1 max-h-32 overflow-y-auto">
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedTag(null);
                            setShowMobileMenu(false);
                          }}
                          className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors cursor-pointer ${
                            selectedTag === null
                              ? 'bg-[#00a884] text-white font-semibold'
                              : 'bg-slate-100 dark:bg-[#111b21] text-slate-700 dark:text-slate-300'
                          }`}
                        >
                          All
                        </button>
                        {availableTags.map(([tag, count]) => {
                          const isSelected = selectedTag?.toLowerCase() === tag.toLowerCase();
                          return (
                            <button
                              key={tag}
                              type="button"
                              onClick={() => {
                                setSelectedTag(isSelected ? null : tag);
                                setShowMobileMenu(false);
                              }}
                              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium transition-colors cursor-pointer ${
                                isSelected
                                  ? 'bg-[#00a884] text-white font-semibold'
                                  : 'bg-slate-100 dark:bg-[#111b21] text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-[#182229]'
                              }`}
                            >
                              <span>#{tag}</span>
                              <span className="text-[10px] opacity-75">({count})</span>
                            </button>
                          );
                        })}
                      </div>
                    </>
                  )}

                  <div className="my-1.5 border-t border-slate-100 dark:border-[#2a3942]" />

                  {/* Sort Shortcuts */}
                  <div className="px-4 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                    Sort Tasks
                  </div>

                  <button
                    onClick={() => {
                      setSortBy('deadline-asc');
                      setShowMobileMenu(false);
                    }}
                    className={`w-full flex items-center justify-between px-4 py-1.5 text-xs font-medium transition-colors text-left cursor-pointer ${
                      sortBy === 'deadline-asc'
                        ? 'text-[#00a884] font-semibold'
                        : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-[#182229]'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>Earliest Deadline</span>
                    </div>
                    {sortBy === 'deadline-asc' && <Check className="w-3.5 h-3.5 text-[#00a884]" />}
                  </button>

                  <button
                    onClick={() => {
                      setSortBy('deadline-desc');
                      setShowMobileMenu(false);
                    }}
                    className={`w-full flex items-center justify-between px-4 py-1.5 text-xs font-medium transition-colors text-left cursor-pointer ${
                      sortBy === 'deadline-desc'
                        ? 'text-[#00a884] font-semibold'
                        : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-[#182229]'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      <span>Latest Deadline</span>
                    </div>
                    {sortBy === 'deadline-desc' && <Check className="w-3.5 h-3.5 text-[#00a884]" />}
                  </button>

                  <button
                    onClick={() => {
                      setSortBy('created-desc');
                      setShowMobileMenu(false);
                    }}
                    className={`w-full flex items-center justify-between px-4 py-1.5 text-xs font-medium transition-colors text-left cursor-pointer ${
                      sortBy === 'created-desc'
                        ? 'text-[#00a884] font-semibold'
                        : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-[#182229]'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
                      <span>Newest Created</span>
                    </div>
                    {sortBy === 'created-desc' && <Check className="w-3.5 h-3.5 text-[#00a884]" />}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto px-3 py-4 sm:px-6 md:px-8 max-w-5xl mx-auto w-full space-y-4">
        {/* Metrics Summary Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
          {/* Total Tasks */}
          <button
            type="button"
            onClick={() => setFilterTab('all')}
            className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
              filterTab === 'all'
                ? 'bg-white dark:bg-[#202c33] border-[#00a884] shadow-xs'
                : 'bg-white/80 dark:bg-[#111b21] border-slate-200 dark:border-[#222d34] hover:bg-white dark:hover:bg-[#202c33]'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                All Tasks
              </span>
              <ListTodo className="w-4 h-4 text-slate-400" />
            </div>
            <div className="text-xl sm:text-2xl font-bold text-slate-800 dark:text-white tabular-nums">
              {allTasks.length}
            </div>
          </button>

          {/* Overdue Tasks Metric (Visually Distinct Rose / Alert) */}
          <button
            type="button"
            onClick={() => setFilterTab('overdue')}
            className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
              filterTab === 'overdue'
                ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-500 shadow-xs'
                : overdueCount > 0
                ? 'bg-rose-50/60 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900/60 hover:bg-rose-50 dark:hover:bg-rose-950/30'
                : 'bg-white/80 dark:bg-[#111b21] border-slate-200 dark:border-[#222d34]'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-[11px] font-semibold text-rose-600 dark:text-rose-400 uppercase tracking-wider flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5" />
                Overdue
              </span>
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
            </div>
            <div className="text-xl sm:text-2xl font-bold text-rose-600 dark:text-rose-400 tabular-nums">
              {overdueCount}
            </div>
          </button>

          {/* Upcoming Tasks Metric (Emerald / Green) */}
          <button
            type="button"
            onClick={() => setFilterTab('upcoming')}
            className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
              filterTab === 'upcoming'
                ? 'bg-emerald-50 dark:bg-emerald-950/40 border-[#00a884] shadow-xs'
                : 'bg-white/80 dark:bg-[#111b21] border-slate-200 dark:border-[#222d34] hover:bg-white dark:hover:bg-[#202c33]'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-[11px] font-semibold text-emerald-700 dark:text-teal-400 uppercase tracking-wider flex items-center gap-1">
                <CalendarCheck className="w-3.5 h-3.5" />
                Upcoming
              </span>
              <Clock className="w-4 h-4 text-[#00a884]" />
            </div>
            <div className="text-xl sm:text-2xl font-bold text-emerald-700 dark:text-teal-400 tabular-nums">
              {upcomingCount}
            </div>
          </button>

          {/* Completed Tasks Metric */}
          <button
            type="button"
            onClick={() => setFilterTab('completed')}
            className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
              filterTab === 'completed'
                ? 'bg-white dark:bg-[#202c33] border-slate-400 dark:border-slate-500 shadow-xs'
                : 'bg-white/80 dark:bg-[#111b21] border-slate-200 dark:border-[#222d34] hover:bg-white dark:hover:bg-[#202c33]'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Completed
              </span>
              <CheckCircle2 className="w-4 h-4 text-slate-400" />
            </div>
            <div className="text-xl sm:text-2xl font-bold text-slate-600 dark:text-slate-300 tabular-nums">
              {completedCount}
            </div>
          </button>
        </div>

        {/* Search, Filter Tabs & Sort Controls */}
        <div className="bg-white dark:bg-[#202c33] p-3 rounded-xl border border-slate-200 dark:border-[#222d34] shadow-2xs space-y-3">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search tasks, content, tags, or chats..."
                className="w-full pl-9 pr-3 py-1.5 text-xs sm:text-sm bg-slate-50 dark:bg-[#111b21] border border-slate-200 dark:border-[#2a3942] rounded-lg text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:border-[#00a884] focus:ring-1 focus:ring-[#00a884]"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-xs"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                <ArrowUpDown className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Sort:</span>
              </span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                aria-label="Sort tasks"
                className="text-xs py-1.5 px-2.5 rounded-lg border border-slate-200 dark:border-[#2a3942] bg-white dark:bg-[#111b21] text-slate-800 dark:text-slate-200 focus:outline-none focus:border-[#00a884] cursor-pointer"
              >
                <option value="deadline-asc">Deadline (Soonest First)</option>
                <option value="deadline-desc">Deadline (Latest First)</option>
                <option value="created-desc">Recently Saved</option>
              </select>
            </div>
          </div>

          {/* Interactive Filter Tabs (Zero-Pill clean segmented buttons) */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-[#111b21] rounded-lg overflow-x-auto text-xs">
            <button
              onClick={() => setFilterTab('all')}
              className={`px-3 py-1.5 rounded-md font-medium transition-all whitespace-nowrap cursor-pointer ${
                filterTab === 'all'
                  ? 'bg-white dark:bg-[#202c33] text-slate-900 dark:text-white shadow-2xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              All Tasks ({allTasks.length})
            </button>
            <button
              onClick={() => setFilterTab('overdue')}
              className={`px-3 py-1.5 rounded-md font-semibold transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
                filterTab === 'overdue'
                  ? 'bg-rose-600 text-white shadow-2xs'
                  : overdueCount > 0
                  ? 'text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Overdue ({overdueCount})</span>
            </button>
            <button
              onClick={() => setFilterTab('upcoming')}
              className={`px-3 py-1.5 rounded-md font-medium transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
                filterTab === 'upcoming'
                  ? 'bg-white dark:bg-[#202c33] text-[#00a884] dark:text-[#25d366] shadow-2xs font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <CalendarCheck className="w-3.5 h-3.5" />
              <span>Upcoming ({upcomingCount})</span>
            </button>
            <button
              onClick={() => setFilterTab('completed')}
              className={`px-3 py-1.5 rounded-md font-medium transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
                filterTab === 'completed'
                  ? 'bg-white dark:bg-[#202c33] text-slate-900 dark:text-white shadow-2xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Completed ({completedCount})</span>
            </button>
          </div>

          {/* Tag Filter Row */}
          {availableTags.length > 0 && (
            <div className="pt-2.5 border-t border-slate-100 dark:border-[#2a3942] flex items-center gap-1.5 overflow-x-auto pb-0.5 text-xs">
              <div className="flex items-center gap-1 text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider shrink-0 mr-0.5">
                <Tag className="w-3 h-3 text-[#00a884]" />
                <span>Tags:</span>
              </div>

              <button
                type="button"
                onClick={() => setSelectedTag(null)}
                className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all shrink-0 cursor-pointer ${
                  selectedTag === null
                    ? 'bg-[#00a884] text-white font-semibold shadow-2xs'
                    : 'bg-slate-100 dark:bg-[#111b21] text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-[#182229]'
                }`}
              >
                All Tags
              </button>

              {availableTags.map(([tag, count]) => {
                const isSelected = selectedTag?.toLowerCase() === tag.toLowerCase();
                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => setSelectedTag(isSelected ? null : tag)}
                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium transition-all shrink-0 cursor-pointer ${
                      isSelected
                        ? 'bg-[#00a884] text-white font-semibold shadow-2xs ring-2 ring-[#00a884]/30'
                        : 'bg-slate-100 dark:bg-[#111b21] text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-[#202c33] border border-slate-200/60 dark:border-[#2a3942]/60'
                    }`}
                    title={`Filter by #${tag}`}
                  >
                    <span>#{tag}</span>
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded-full tabular-nums font-semibold ${
                        isSelected
                          ? 'bg-white/20 text-white'
                          : 'bg-slate-200/70 dark:bg-[#202c33] text-slate-500 dark:text-slate-400'
                      }`}
                    >
                      {count}
                    </span>
                  </button>
                );
              })}

              {selectedTag && (
                <button
                  type="button"
                  onClick={() => setSelectedTag(null)}
                  className="ml-auto inline-flex items-center gap-1 text-[11px] text-rose-500 hover:text-rose-600 dark:text-rose-400 font-medium px-2 py-1 rounded hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors cursor-pointer shrink-0"
                  title="Clear active tag filter"
                >
                  <X className="w-3.5 h-3.5" />
                  <span>Clear Tag</span>
                </button>
              )}
            </div>
          )}
        </div>

        {/* Task Cards Stream */}
        {filteredTasks.length === 0 ? (
          <div className="bg-white dark:bg-[#202c33] rounded-2xl p-8 border border-slate-200 dark:border-[#222d34] text-center space-y-3">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-teal-50 dark:bg-teal-950/40 text-[#00a884] dark:text-[#25d366] flex items-center justify-center border border-teal-100 dark:border-teal-900/50">
              <ListTodo className="w-7 h-7" />
            </div>
            <h3 className="text-base font-semibold text-slate-800 dark:text-slate-200">
              {allTasks.length === 0
                ? 'No Tasks in Your Vault Yet'
                : selectedTag
                ? `No Tasks Tagged #${selectedTag}`
                : filterTab === 'overdue'
                ? 'No Overdue Tasks!'
                : filterTab === 'upcoming'
                ? 'No Upcoming Tasks'
                : filterTab === 'completed'
                ? 'No Completed Tasks'
                : 'No Matching Tasks Found'}
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto leading-relaxed">
              {allTasks.length === 0
                ? 'Turn any AI response into a task by clicking the "Add Task" button on any output card in your chats. You can set and change deadlines anytime.'
                : selectedTag
                ? `No tasks match tag #${selectedTag} in this view. Try clearing the tag or switching filter tabs.`
                : filterTab === 'overdue'
                ? "Great job! All your tasks are either on schedule or completed. There are no overdue items."
                : 'Try adjusting your search query or switching filter tabs to view other tasks.'}
            </p>
            {selectedTag && (
              <button
                type="button"
                onClick={() => setSelectedTag(null)}
                className="mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 dark:bg-[#111b21] hover:bg-slate-200 dark:hover:bg-[#202c33] text-slate-700 dark:text-slate-300 text-xs font-semibold rounded-lg transition-colors cursor-pointer border border-slate-200 dark:border-[#2a3942]"
              >
                <X className="w-3.5 h-3.5 text-rose-500" />
                <span>Clear Tag Filter (#{selectedTag})</span>
              </button>
            )}
            {allTasks.length === 0 && (
              <button
                onClick={onBackToChats}
                className="mt-2 inline-flex items-center gap-2 px-4 py-2 bg-[#00a884] hover:bg-[#008069] text-white text-xs font-semibold rounded-lg shadow-sm transition-colors cursor-pointer"
              >
                <MessageSquare className="w-4 h-4" />
                <span>Browse Chats & Create Tasks</span>
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {filteredTasks.map((task) => {
              const chat = chatMap.get(task.chatId);
              const isOverdue = !task.taskCompleted && isDeadlineOverdue(task.taskDeadline);
              const isCompleted = Boolean(task.taskCompleted);
              const isExpanded = expandedOutputIds.has(task.id);
              const ModelIcon = MODEL_ICONS[task.aiModel] || MessageSquare;

              const titleText =
                task.taskTitle || task.title || task.userPrompt || 'AI Output Task';

              return (
                <div
                  key={task.id}
                  className={`rounded-xl border transition-all shadow-xs overflow-hidden ${
                    isCompleted
                      ? 'border-l-4 border-l-slate-400 dark:border-l-slate-600 bg-white/70 dark:bg-[#1a2329] border-slate-200 dark:border-[#222d34] opacity-80'
                      : isOverdue
                      ? /* VISUALLY DISTINCT OVERDUE STYLING: Bold Rose Border, Warm Alert Scrim, Red Text */
                        'border-l-4 border-l-rose-500 dark:border-l-rose-400 bg-rose-50/40 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900/50 shadow-rose-900/5 ring-1 ring-rose-500/10'
                      : /* UPCOMING TASK STYLING: Crisp Emerald Border, Neutral White/Charcoal Card */
                        'border-l-4 border-l-[#00a884] dark:border-l-[#00a884] bg-white dark:bg-[#202c33] border-slate-200 dark:border-[#222d34]'
                  }`}
                >
                  {/* Top Bar of the Task Card */}
                  <div className="p-4 sm:p-5 space-y-3">
                    {/* Header: Checkbox + Full Horizontal Title + Deadline Status Badge */}
                    <div className="flex items-start gap-3">
                      {/* Checkbox */}
                      <button
                        type="button"
                        onClick={() => onToggleTaskComplete(task.id)}
                        className={`mt-0.5 w-5 h-5 rounded border flex items-center justify-center transition-colors cursor-pointer shrink-0 ${
                          isCompleted
                            ? 'bg-slate-500 border-slate-500 text-white'
                            : isOverdue
                            ? 'border-rose-400 dark:border-rose-500 hover:bg-rose-100 dark:hover:bg-rose-900/40'
                            : 'border-slate-300 dark:border-slate-500 hover:border-[#00a884]'
                        }`}
                        title={isCompleted ? 'Mark as incomplete' : 'Mark as complete'}
                      >
                        {isCompleted && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                      </button>

                      {/* Title & Metadata (Spans full horizontal width) */}
                      <div className="min-w-0 flex-1 space-y-2">
                        {/* Title & Due Date Badge Row */}
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                          <h2
                            className={`text-sm sm:text-base font-semibold leading-snug text-slate-900 dark:text-white ${
                              isCompleted
                                ? 'line-through text-slate-400 dark:text-slate-500'
                                : ''
                            }`}
                          >
                            {titleText}
                          </h2>

                          {/* Visual Deadline Badge: Clean pill with relative status */}
                          <div className="shrink-0 flex items-center gap-2 self-start">
                            {isCompleted ? (
                              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-medium">
                                <CheckCircle2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                <span>Completed</span>
                              </div>
                            ) : isOverdue ? (
                              <div
                                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-rose-100 text-rose-800 dark:bg-rose-900/60 dark:text-rose-200 text-xs font-bold shadow-2xs border border-rose-300/80 dark:border-rose-700/60 animate-pulse"
                                title={formatDeadlineDateTime(task.taskDeadline)}
                              >
                                <AlertTriangle className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400 shrink-0" />
                                <span>Overdue · {formatDeadlineRelative(task.taskDeadline)}</span>
                              </div>
                            ) : (
                              <div
                                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-800 dark:bg-teal-950/60 dark:text-teal-200 text-xs font-semibold border border-emerald-200 dark:border-teal-800/60"
                                title={formatDeadlineDateTime(task.taskDeadline)}
                              >
                                <CalendarCheck className="w-3.5 h-3.5 text-[#00a884] dark:text-[#25d366] shrink-0" />
                                <span>Due {formatDeadlineRelative(task.taskDeadline)}</span>
                              </div>
                            )}

                            {/* Exact date time on desktop */}
                            <span className="text-[11px] text-slate-500 dark:text-slate-400 tabular-nums hidden md:inline">
                              {formatDeadlineDateTime(task.taskDeadline)}
                            </span>
                          </div>
                        </div>

                        {/* Separate Context Strip: Source Chat location & Model Tag & Exact Deadline */}
                        <div className="flex flex-wrap items-center gap-x-2 gap-y-1.5 text-xs text-slate-500 dark:text-slate-400 pt-0.5">
                          {/* Source Chat Attribution Button */}
                          {chat && (
                            <button
                              type="button"
                              onClick={() => onOpenChat(chat.id, task.id)}
                              className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-slate-100 dark:bg-[#111b21] hover:bg-slate-200/80 dark:hover:bg-[#2a3942] text-slate-700 dark:text-slate-300 hover:text-[#00a884] dark:hover:text-[#25d366] transition-colors cursor-pointer font-medium"
                              title={`Open chat "${chat.title}"`}
                            >
                              <MessageSquare className="w-3 h-3 text-[#00a884]" />
                              <span className="truncate max-w-[180px] sm:max-w-xs">
                                {chat.title}
                              </span>
                            </button>
                          )}

                          <span className="text-slate-300 dark:text-slate-600" aria-hidden="true">
                            ·
                          </span>

                          {/* Model Attribution */}
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-600 dark:text-slate-300">
                            <ModelIcon className="w-3 h-3 text-[#00a884]" />
                            <span>{task.aiModel}</span>
                          </span>

                          {/* Mobile Deadline timestamp */}
                          {task.taskDeadline && (
                            <>
                              <span className="text-slate-300 dark:text-slate-600 md:hidden" aria-hidden="true">
                                ·
                              </span>
                              <span className="text-[11px] text-slate-500 dark:text-slate-400 tabular-nums md:hidden flex items-center gap-1">
                                <Clock className="w-3 h-3 text-slate-400" />
                                <span>{formatDeadlineDateTime(task.taskDeadline)}</span>
                              </span>
                            </>
                          )}

                          {/* Interactive Tags */}
                          {task.tags && task.tags.length > 0 && (
                            <>
                              <span className="text-slate-300 dark:text-slate-600" aria-hidden="true">
                                ·
                              </span>
                              <div className="inline-flex flex-wrap items-center gap-1">
                                {task.tags.map((t) => {
                                  const cleanT = t.trim().replace(/^#+/, '');
                                  const isCurrentTag =
                                    selectedTag?.toLowerCase() === cleanT.toLowerCase();
                                  return (
                                    <button
                                      key={t}
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setSelectedTag(isCurrentTag ? null : cleanT);
                                      }}
                                      className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10.5px] font-medium transition-colors cursor-pointer ${
                                        isCurrentTag
                                          ? 'bg-[#00a884] text-white font-semibold shadow-2xs'
                                          : 'bg-slate-100 dark:bg-[#111b21] text-slate-600 dark:text-slate-300 hover:bg-[#00a884]/15 hover:text-[#00a884] dark:hover:text-[#25d366]'
                                      }`}
                                      title={
                                        isCurrentTag
                                          ? `Remove tag filter #${cleanT}`
                                          : `Filter tasks by #${cleanT}`
                                      }
                                    >
                                      <Tag className="w-2.5 h-2.5 opacity-70" />
                                      <span>#{cleanT}</span>
                                    </button>
                                  );
                                })}
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Collapsible Output Preview */}
                    <div className="pt-1">
                      <div
                        className={`text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed overflow-hidden transition-all ${
                          isExpanded ? '' : 'max-h-24 relative'
                        }`}
                      >
                        <MarkdownRenderer content={task.content} />
                        {!isExpanded && (
                          <div className="absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-white dark:from-[#202c33] to-transparent pointer-events-none" />
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={() => toggleExpand(task.id)}
                        className="mt-1 text-[11px] font-semibold text-[#00a884] dark:text-[#25d366] hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        {isExpanded ? (
                          <>
                            <ChevronUp className="w-3.5 h-3.5" />
                            <span>Collapse Content</span>
                          </>
                        ) : (
                          <>
                            <ChevronDown className="w-3.5 h-3.5" />
                            <span>Show Full Output Content</span>
                          </>
                        )}
                      </button>
                    </div>

                    {/* Bottom Action Strip: Change Deadline & Quick Actions */}
                    <div className="pt-2 border-t border-slate-100 dark:border-[#2a3942] flex flex-wrap items-center justify-between gap-2 text-xs">
                      {/* Left: Change Deadline & Quick Extend */}
                      <div className="flex flex-wrap items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => setEditingOutput(task)}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white dark:bg-[#111b21] hover:bg-slate-50 dark:hover:bg-[#202c33] border border-slate-200 dark:border-[#2a3942] text-slate-700 dark:text-slate-200 rounded-lg font-medium transition-colors cursor-pointer shadow-2xs"
                          title="Change task deadline"
                        >
                          <Calendar className="w-3.5 h-3.5 text-[#00a884]" />
                          <span>Change Deadline</span>
                        </button>

                        {/* Quick Reschedule Presets */}
                        <div className="hidden sm:flex items-center gap-1 text-[11px] text-slate-500 dark:text-slate-400">
                          <span className="opacity-75">Extend:</span>
                          <button
                            type="button"
                            onClick={() => handleQuickExtend(task, 1)}
                            className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-[#111b21] hover:bg-slate-200 dark:hover:bg-[#2a3942] text-slate-700 dark:text-slate-300 font-medium cursor-pointer"
                            title="Add 1 day to deadline"
                          >
                            +1d
                          </button>
                          <button
                            type="button"
                            onClick={() => handleQuickExtend(task, 3)}
                            className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-[#111b21] hover:bg-slate-200 dark:hover:bg-[#2a3942] text-slate-700 dark:text-slate-300 font-medium cursor-pointer"
                            title="Add 3 days to deadline"
                          >
                            +3d
                          </button>
                          <button
                            type="button"
                            onClick={() => handleQuickExtend(task, 7)}
                            className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-[#111b21] hover:bg-slate-200 dark:hover:bg-[#2a3942] text-slate-700 dark:text-slate-300 font-medium cursor-pointer"
                            title="Add 1 week to deadline"
                          >
                            +1w
                          </button>
                        </div>
                      </div>

                      {/* Right: Open in Chat & Remove Task */}
                      <div className="flex items-center gap-2">
                        {chat && (
                          <button
                            type="button"
                            onClick={() => onOpenChat(chat.id, task.id)}
                            className="inline-flex items-center gap-1 text-slate-600 dark:text-slate-300 hover:text-[#00a884] dark:hover:text-[#25d366] transition-colors cursor-pointer font-medium"
                            title="Navigate to this output inside the chat thread"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                            <span>Open in Chat</span>
                          </button>
                        )}

                        <span className="text-slate-300 dark:text-slate-600" aria-hidden="true">
                          ·
                        </span>

                        <button
                          type="button"
                          onClick={() => onRemoveTask(task.id)}
                          className="inline-flex items-center gap-1 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 transition-colors cursor-pointer"
                          title="Remove from tasks (preserves output in chat)"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline">Remove Task</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Change Deadline Modal */}
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
