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
  Trash2,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Tag,
  X,
  Gauge,
  Radio,
  SlidersHorizontal,
  Flame,
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
  const [mobileHudOpen, setMobileHudOpen] = useState(false);

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
  const { overdueCount, upcomingCount, completedCount, pendingCount, completionRate } = useMemo(() => {
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

    const pending = overdue + upcoming;
    const rate = allTasks.length > 0 ? Math.round((completed / allTasks.length) * 100) : 0;

    return {
      overdueCount: overdue,
      upcomingCount: upcoming,
      completedCount: completed,
      pendingCount: pending,
      completionRate: rate,
    };
  }, [allTasks]);

  // Impending deadline detection for HUD Radar
  const nextImpendingTask = useMemo(() => {
    const pendingTasks = allTasks.filter((t) => !t.taskCompleted && t.taskDeadline);
    if (pendingTasks.length === 0) return null;

    // Check for overdue first
    const overdueTasks = pendingTasks.filter((t) => isDeadlineOverdue(t.taskDeadline));
    if (overdueTasks.length > 0) {
      overdueTasks.sort((a, b) => (a.taskDeadline || 0) - (b.taskDeadline || 0));
      return { task: overdueTasks[0], isOverdue: true };
    }

    // Otherwise next upcoming
    pendingTasks.sort((a, b) => (a.taskDeadline || Infinity) - (b.taskDeadline || Infinity));
    return { task: pendingTasks[0], isOverdue: false };
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
    const base = isDeadlineOverdue(current) ? Date.now() : current;
    const newDeadline = base + days * 24 * 60 * 60 * 1000;
    onChangeDeadline(output.id, newDeadline, output.taskTitle);
  };

  return (
    <div className="flex-1 h-full flex flex-col min-w-0 bg-[#f8fafc] dark:bg-[#070b10] text-slate-800 dark:text-slate-100 overflow-hidden select-none transition-colors duration-200">
      {/* Top Header Bar */}
      <header className="px-3.5 py-2.5 sm:px-6 sm:py-3 bg-white/90 dark:bg-[#0a0f16]/95 backdrop-blur-md border-b border-slate-200/80 dark:border-cyan-500/15 flex items-center justify-between min-h-[58px] shrink-0 z-20">
        <div className="flex items-center gap-2.5 sm:gap-3.5 min-w-0 flex-1">
          <button
            onClick={onBackToChats}
            className="p-2 -ml-1 rounded-lg text-slate-600 dark:text-slate-300 hover:text-cyan-500 dark:hover:text-cyan-400 hover:bg-slate-100 dark:hover:bg-cyan-950/30 transition-colors cursor-pointer shrink-0 border border-transparent hover:border-slate-300 dark:hover:border-cyan-500/30"
            title="Back to Chats"
            aria-label="Back to Chats"
          >
            <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>

          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            {/* High-tech Hexagonal Command Icon */}
            <div className="relative w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-cyan-500/10 dark:bg-cyan-500/15 text-cyan-600 dark:text-cyan-400 flex items-center justify-center border border-cyan-500/30 dark:border-cyan-400/30 shadow-[0_0_12px_rgba(6,182,212,0.15)] shrink-0">
              <ListTodo className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-400 ring-2 ring-white dark:ring-[#070b10]" />
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h1 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2 truncate">
                  <span>Tasks Command Console</span>
                </h1>
                <span className="font-mono text-[11px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-[#111923] text-slate-600 dark:text-cyan-300 border border-slate-200 dark:border-cyan-500/20 tabular-nums shrink-0">
                  {allTasks.length} {allTasks.length === 1 ? 'TASK' : 'TASKS'}
                </span>
              </div>
             
            </div>
          </div>
        </div>

        {/* Right Header Navigation & Actions */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Mobile HUD Toggle Button */}
          <button
            onClick={() => setMobileHudOpen(!mobileHudOpen)}
            className="hidden sm:flex lg:hidden px-2.5 py-1.5 text-xs font-mono text-cyan-600 dark:text-cyan-300 bg-cyan-500/10 dark:bg-cyan-950/30 hover:bg-cyan-500/20 dark:hover:bg-cyan-900/40 border border-cyan-500/30 rounded-lg transition-colors cursor-pointer items-center gap-1.5"
            aria-label="Toggle Telemetry HUD"
          >
            <Gauge className="w-3.5 h-3.5" />
            <span>HUD</span>
            <span className="font-bold tabular-nums">({completionRate}%)</span>
          </button>
        </div>
      </header>

      {/* Main Split Interface Area */}
      <div className="flex-1 flex flex-col lg:flex-row min-w-0 overflow-hidden relative">
        {/* ========================================================================= */}
        {/* LEFT PANEL: Live Progress & Telemetry HUD (Desktop & Mobile-Drawer)       */}
        {/* ========================================================================= */}
        <aside
          className={`
            ${mobileHudOpen ? 'flex' : 'hidden'} lg:flex
            w-full lg:w-80 xl:w-88 shrink-0 flex-col
            bg-slate-100/90 dark:bg-[#0a0f16]/95 backdrop-blur-md
            border-b lg:border-b-0 lg:border-r border-slate-200/90 dark:border-cyan-500/15
            overflow-y-auto p-4 sm:p-5 space-y-5 z-10 transition-all duration-200
          `}
        >
          {/* HUD Section: Progress Velocity Gauge */}
          <div className="p-4 rounded-xl bg-white dark:bg-[#0e1622] border border-slate-200/90 dark:border-cyan-500/20 shadow-xs dark:shadow-[0_0_20px_rgba(6,182,212,0.06)] space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-mono text-[11px] uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <Gauge className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
                Velocity Gauge
              </span>
              <span className="font-mono text-xs font-bold text-slate-800 dark:text-white tabular-nums">
                {completedCount} / {allTasks.length} DONE
              </span>
            </div>

            {/* Circular / Radial Progress Telemetry Ring */}
            <div className="flex items-center gap-4 py-1">
              <div className="relative w-16 h-16 shrink-0 flex items-center justify-center">
                <svg className="w-16 h-16 -rotate-90" viewBox="0 0 36 36">
                  {/* Background Track */}
                  <path
                    className="text-slate-200 dark:text-slate-800"
                    strokeWidth="3.5"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  {/* Glowing Progress Arc */}
                  <path
                    className="text-cyan-500 dark:text-cyan-400 transition-all duration-500 ease-out"
                    strokeDasharray={`${completionRate}, 100`}
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="font-mono text-sm font-bold text-slate-900 dark:text-white tabular-nums">
                    {completionRate}%
                  </span>
                </div>
              </div>

              <div className="min-w-0 flex-1 space-y-1">
                <div className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                  {allTasks.length === 0
                    ? 'No Active Tasks'
                    : completionRate === 100
                    ? 'All Objectives Clear'
                    : overdueCount > 0
                    ? 'Action Required'
                    : 'System on Schedule'}
                </div>
                <div className="font-mono text-[11px] text-slate-500 dark:text-slate-400">
                  {overdueCount > 0 ? (
                    <span className="text-rose-500 dark:text-rose-400 font-semibold">
                      {overdueCount} critical deadline{overdueCount === 1 ? '' : 's'} elapsed
                    </span>
                  ) : pendingCount > 0 ? (
                    <span className="text-cyan-600 dark:text-cyan-400">
                      {upcomingCount} upcoming on track
                    </span>
                  ) : (
                    <span className="text-emerald-500 dark:text-emerald-400 font-semibold">
                      100% velocity efficiency
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Segmented Cybernetic Track Bar */}
            <div className="w-full bg-slate-100 dark:bg-[#131d2b] h-1.5 rounded-full overflow-hidden flex">
              <div
                style={{ width: `${completionRate}%` }}
                className="h-full bg-gradient-to-r from-cyan-500 to-emerald-400 transition-all duration-500"
              />
            </div>
          </div>

          {/* HUD Section 3: Interactive Status Stream Grid */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-[11px] font-mono text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              <span>Status Matrix</span>
              <span>Filter Feed</span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {/* All Stream Tile */}
              <button
                type="button"
                onClick={() => setFilterTab('all')}
                className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                  filterTab === 'all'
                    ? 'bg-white dark:bg-[#111c2a] border-cyan-500 dark:border-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.15)] ring-1 ring-cyan-500/20'
                    : 'bg-white/80 dark:bg-[#0e1622] border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-cyan-500/30'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-mono uppercase text-slate-500 dark:text-slate-400">
                    All Tasks
                  </span>
                  <ListTodo className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
                </div>
                <div className="font-mono text-lg font-bold text-slate-800 dark:text-white tabular-nums">
                  {allTasks.length}
                </div>
              </button>

              {/* Critical / Overdue Tile */}
              <button
                type="button"
                onClick={() => setFilterTab('overdue')}
                className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                  filterTab === 'overdue'
                    ? 'bg-rose-50/80 dark:bg-rose-950/40 border-rose-500 text-rose-600 dark:text-rose-400 shadow-[0_0_15px_rgba(244,63,94,0.2)] ring-1 ring-rose-500/30'
                    : overdueCount > 0
                    ? 'bg-rose-50/40 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900/60 hover:border-rose-400 text-rose-600 dark:text-rose-400'
                    : 'bg-white/80 dark:bg-[#0e1622] border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-cyan-500/30'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-mono uppercase flex items-center gap-1 font-semibold">
                    <AlertTriangle className="w-3 h-3 text-rose-500" />
                    Critical
                  </span>
                  {overdueCount > 0 && <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />}
                </div>
                <div className="font-mono text-lg font-bold text-rose-600 dark:text-rose-400 tabular-nums">
                  {overdueCount}
                </div>
              </button>

              {/* Upcoming Tile */}
              <button
                type="button"
                onClick={() => setFilterTab('upcoming')}
                className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                  filterTab === 'upcoming'
                    ? 'bg-cyan-50/80 dark:bg-cyan-950/40 border-cyan-500 dark:border-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.15)] ring-1 ring-cyan-500/20'
                    : 'bg-white/80 dark:bg-[#0e1622] border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-cyan-500/30'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-mono uppercase text-cyan-600 dark:text-cyan-400">
                    Upcoming
                  </span>
                  <CalendarCheck className="w-3.5 h-3.5 text-cyan-500" />
                </div>
                <div className="font-mono text-lg font-bold text-cyan-700 dark:text-cyan-400 tabular-nums">
                  {upcomingCount}
                </div>
              </button>

              {/* Completed Tile */}
              <button
                type="button"
                onClick={() => setFilterTab('completed')}
                className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                  filterTab === 'completed'
                    ? 'bg-emerald-50/80 dark:bg-emerald-950/40 border-emerald-500 dark:border-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.15)] ring-1 ring-emerald-500/20'
                    : 'bg-white/80 dark:bg-[#0e1622] border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-cyan-500/30'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-mono uppercase text-emerald-600 dark:text-emerald-400">
                    Resolved
                  </span>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                </div>
                <div className="font-mono text-lg font-bold text-emerald-700 dark:text-emerald-400 tabular-nums">
                  {completedCount}
                </div>
              </button>
            </div>
          </div>

          {/* HUD Section 4: Impending Target Radar */}
          <div className="p-3.5 rounded-xl bg-white dark:bg-[#0e1622] border border-slate-200/90 dark:border-cyan-500/20 shadow-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-mono text-[10px] uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <Radio className="w-3 h-3 text-cyan-500 animate-pulse" />
                Impending Target
              </span>
              {nextImpendingTask?.isOverdue && (
                <span className="font-mono text-[9px] px-1.5 py-0.2 rounded bg-rose-500/10 text-rose-500 font-bold border border-rose-500/30">
                  CRITICAL
                </span>
              )}
            </div>

            {nextImpendingTask ? (
              <div className="space-y-1">
                <div className="text-xs font-semibold text-slate-900 dark:text-white truncate">
                  {nextImpendingTask.task.taskTitle ||
                    nextImpendingTask.task.title ||
                    nextImpendingTask.task.userPrompt ||
                    'AI Output Task'}
                </div>
                <div className="flex items-center gap-1.5 font-mono text-[11px]">
                  <Clock className="w-3 h-3 text-slate-400 shrink-0" />
                  <span
                    className={
                      nextImpendingTask.isOverdue
                        ? 'text-rose-500 dark:text-rose-400 font-semibold'
                        : 'text-cyan-600 dark:text-cyan-400'
                    }
                  >
                    {formatDeadlineRelative(nextImpendingTask.task.taskDeadline)}
                  </span>
                </div>
              </div>
            ) : (
              <div className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                All deadlines cleared. Zero impending alerts.
              </div>
            )}
          </div>

          {/* HUD Section 5: Filter Matrix by Tag */}
          {availableTags.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-[11px] font-mono text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                <span className="flex items-center gap-1.5">
                  <Tag className="w-3 h-3 text-cyan-600 dark:text-cyan-400" />
                  Tag Matrix
                </span>
                {selectedTag && (
                  <button
                    type="button"
                    onClick={() => setSelectedTag(null)}
                    className="text-rose-500 hover:text-rose-600 text-[10px] font-semibold lowercase cursor-pointer"
                  >
                    clear
                  </button>
                )}
              </div>

              <div className="flex flex-wrap gap-1.5 max-h-40 overflow-y-auto pr-1">
                <button
                  type="button"
                  onClick={() => setSelectedTag(null)}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-mono transition-all cursor-pointer ${
                    selectedTag === null
                      ? 'bg-cyan-500/15 text-cyan-600 dark:text-cyan-300 border border-cyan-500/40 font-semibold'
                      : 'bg-white dark:bg-[#0e1622] text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-cyan-500/30'
                  }`}
                >
                  * ALL TAGS
                </button>

                {availableTags.map(([tag, count]) => {
                  const isSelected = selectedTag?.toLowerCase() === tag.toLowerCase();
                  return (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => setSelectedTag(isSelected ? null : tag)}
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-mono transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-cyan-500/20 text-cyan-600 dark:text-cyan-300 border border-cyan-400 font-bold shadow-[0_0_12px_rgba(6,182,212,0.15)]'
                          : 'bg-white dark:bg-[#0e1622] text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-cyan-500/30'
                      }`}
                    >
                      <span>#{tag}</span>
                      <span className="text-[10px] opacity-70 tabular-nums">· {count}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </aside>

        {/* ========================================================================= */}
        {/* RIGHT PANEL: Futuristic Task Grid Workspace                               */}
        {/* ========================================================================= */}
        <main className="flex-1 flex flex-col min-w-0 overflow-y-auto p-3.5 sm:p-5 lg:p-6 space-y-4">
          {/* Cybernetic Command Bar: Search, Segmented Tabs, and Sorting */}
          <div className="bg-white/80 dark:bg-[#0a0f16]/95 backdrop-blur-md p-3 sm:p-3.5 rounded-xl border border-slate-200/90 dark:border-cyan-500/20 shadow-xs space-y-3">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
              {/* Search Field */}
              <div className="relative flex-1">
                <Search
                  className="w-4 h-4 text-slate-400 dark:text-cyan-500/70 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
                  aria-hidden="true"
                />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Scan tasks, prompt context, tags, or thread origin..."
                  aria-label="Scan tasks, prompt context, tags, or thread origin"
                  className="w-full pl-9 pr-8 py-2 text-xs sm:text-sm bg-slate-50 dark:bg-[#070b10] border border-slate-200/90 dark:border-slate-800 rounded-lg text-slate-800 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-600 font-mono focus:outline-none focus:border-cyan-400 dark:focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    aria-label="Clear tasks search query"
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Sort Mode Dropdown */}
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-xs font-mono text-slate-500 dark:text-slate-400 flex items-center gap-1">
                  <SlidersHorizontal className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" aria-hidden="true" />
                  <span className="hidden sm:inline">Sort:</span>
                </span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortOption)}
                  aria-label="Sort tasks order"
                  className="text-xs font-mono py-2 px-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#070b10] text-slate-800 dark:text-slate-200 focus:outline-none focus:border-cyan-400 cursor-pointer"
                >
                  <option value="deadline-asc">Earliest Target</option>
                  <option value="deadline-desc">Latest Target</option>
                  <option value="created-desc">Newest Created</option>
                </select>
              </div>
            </div>

            {/* Zero-Pill Segmented Filter Navigation */}
            <div className="flex items-center justify-between flex-wrap gap-2 pt-2 border-t border-slate-100 dark:border-slate-800/70">
              <div
                role="tablist"
                aria-label="Task status filters"
                className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-[#070b10] rounded-lg overflow-x-auto text-xs font-mono"
              >
                <button
                  role="tab"
                  aria-selected={filterTab === 'all'}
                  onClick={() => setFilterTab('all')}
                  className={`px-3 py-1.5 rounded-md font-semibold transition-all whitespace-nowrap cursor-pointer ${
                    filterTab === 'all'
                      ? 'bg-white dark:bg-[#0e1622] text-slate-900 dark:text-cyan-300 shadow-xs border border-slate-200/80 dark:border-cyan-500/30'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  ALL [{allTasks.length}]
                </button>
                <button
                  role="tab"
                  aria-selected={filterTab === 'overdue'}
                  onClick={() => setFilterTab('overdue')}
                  className={`px-3 py-1.5 rounded-md font-semibold transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
                    filterTab === 'overdue'
                      ? 'bg-rose-600 text-white shadow-xs'
                      : overdueCount > 0
                      ? 'text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30'
                      : 'text-slate-600 dark:text-slate-400'
                  }`}
                >
                  <AlertTriangle className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>CRITICAL [{overdueCount}]</span>
                </button>
                <button
                  role="tab"
                  aria-selected={filterTab === 'upcoming'}
                  onClick={() => setFilterTab('upcoming')}
                  className={`px-3 py-1.5 rounded-md font-semibold transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
                    filterTab === 'upcoming'
                      ? 'bg-white dark:bg-[#0e1622] text-cyan-600 dark:text-cyan-400 shadow-xs border border-slate-200/80 dark:border-cyan-500/30'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <CalendarCheck className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>UPCOMING [{upcomingCount}]</span>
                </button>
                <button
                  role="tab"
                  aria-selected={filterTab === 'completed'}
                  onClick={() => setFilterTab('completed')}
                  className={`px-3 py-1.5 rounded-md font-semibold transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
                    filterTab === 'completed'
                      ? 'bg-white dark:bg-[#0e1622] text-emerald-600 dark:text-emerald-400 shadow-xs border border-slate-200/80 dark:border-emerald-500/30'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <CheckCircle2 className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>RESOLVED [{completedCount}]</span>
                </button>
              </div>

              {/* Active Filter Indicators (if tag or query active) */}
              {(selectedTag || searchQuery) && (
                <div className="flex items-center gap-2 font-mono text-xs">
                  {selectedTag && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-cyan-500/15 text-cyan-600 dark:text-cyan-300 border border-cyan-500/30">
                      <span>#{selectedTag}</span>
                      <button
                        type="button"
                        onClick={() => setSelectedTag(null)}
                        className="hover:text-rose-500 cursor-pointer"
                        title="Remove tag filter"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  )}
                  {searchQuery && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-slate-200/70 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700">
                      <span>query: {searchQuery}</span>
                      <button
                        type="button"
                        onClick={() => setSearchQuery('')}
                        className="hover:text-rose-500 cursor-pointer"
                        title="Clear query"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedTag(null);
                      setSearchQuery('');
                    }}
                    className="text-rose-500 hover:underline text-[11px] cursor-pointer"
                  >
                    Reset all
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Task Grid Stream or Futuristic Empty State */}
          {filteredTasks.length === 0 ? (
            <div className="bg-white/90 dark:bg-[#0a0f16]/95 rounded-2xl p-8 sm:p-12 border border-slate-200/90 dark:border-cyan-500/20 text-center space-y-4 shadow-xs">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-cyan-500/10 dark:bg-cyan-500/15 text-cyan-600 dark:text-cyan-400 flex items-center justify-center border border-cyan-500/30 dark:border-cyan-400/30 shadow-[0_0_20px_rgba(6,182,212,0.15)]">
                <ListTodo className="w-8 h-8" />
              </div>
              <div className="space-y-1.5">
                <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white tracking-tight">
                  {allTasks.length === 0
                    ? 'Command Vault Empty'
                    : selectedTag
                    ? `No Tasks Tagged #${selectedTag}`
                    : filterTab === 'overdue'
                    ? 'All Schedules Nominal — Zero Overdue'
                    : filterTab === 'upcoming'
                    ? 'Zero Upcoming Tasks'
                    : filterTab === 'completed'
                    ? 'No Tasks Resolved Yet'
                    : 'Zero Telemetry Matches Found'}
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto leading-relaxed">
                  {allTasks.length === 0
                    ? 'Elevate any saved AI output into a trackable task. Use the "Add Task" action on output cards in your chat threads to configure target deadlines.'
                    : selectedTag
                    ? `No tasks match filter tag #${selectedTag} in this view. Clear the tag to view all tasks.`
                    : filterTab === 'overdue'
                    ? 'All active tasks are running on schedule. Velocity health is optimal.'
                    : 'Try clearing your query or switching telemetry filters to inspect other task records.'}
                </p>
              </div>

              {selectedTag && (
                <button
                  type="button"
                  onClick={() => setSelectedTag(null)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 dark:bg-[#0e1622] hover:bg-slate-200 dark:hover:bg-cyan-950/40 text-slate-700 dark:text-cyan-300 text-xs font-mono rounded-lg transition-colors cursor-pointer border border-slate-200 dark:border-cyan-500/30"
                >
                  <X className="w-3.5 h-3.5 text-rose-500" />
                  <span>Clear Tag Matrix Filter</span>
                </button>
              )}

              {allTasks.length === 0 && (
                <button
                  onClick={onBackToChats}
                  className="inline-flex items-center gap-2 px-4 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-mono rounded-lg shadow-sm transition-all cursor-pointer hover:shadow-[0_0_15px_rgba(6,182,212,0.3)]"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>Return to Chats & Create Tasks</span>
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3.5 sm:gap-4">
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
                    className={`group relative rounded-xl border transition-all duration-200 shadow-xs overflow-hidden ${
                      isCompleted
                        ? 'bg-white/70 dark:bg-[#0c131c]/70 border-slate-200 dark:border-emerald-500/20 opacity-80 hover:opacity-100'
                        : isOverdue
                        ? 'bg-rose-50/50 dark:bg-[#140c12] border-rose-300 dark:border-rose-500/40 hover:dark:border-rose-400 hover:dark:shadow-[0_0_20px_rgba(244,63,94,0.15)] ring-1 ring-rose-500/10'
                        : 'bg-white dark:bg-[#0d1520] border-slate-200/90 dark:border-cyan-500/20 hover:border-cyan-400/50 dark:hover:border-cyan-400/60 hover:shadow-[0_0_22px_rgba(6,182,212,0.12)]'
                    }`}
                  >
                    <div className="p-4 sm:p-5 space-y-3.5">
                      {/* Top Row: Checkbox + Title + Status Badge */}
                      <div className="flex items-start gap-3">
                        {/* Cybernetic Checkbox Button */}
                        <button
                          type="button"
                          role="checkbox"
                          aria-checked={isCompleted}
                          aria-label={isCompleted ? `Mark ${titleText} as pending` : `Mark ${titleText} as resolved`}
                          onClick={() => onToggleTaskComplete(task.id)}
                          className={`mt-0.5 w-5 h-5 rounded-md border flex items-center justify-center transition-all cursor-pointer shrink-0 ${
                            isCompleted
                              ? 'bg-emerald-500 border-emerald-500 text-white shadow-[0_0_10px_rgba(16,185,129,0.3)]'
                              : isOverdue
                              ? 'border-rose-400 dark:border-rose-500 hover:bg-rose-100/50 dark:hover:bg-rose-900/40 text-rose-500'
                              : 'border-slate-300 dark:border-cyan-500/40 hover:border-cyan-400 dark:hover:bg-cyan-950/40 text-cyan-400'
                          }`}
                          title={isCompleted ? 'Mark as incomplete' : 'Mark as complete'}
                        >
                          {isCompleted && <Check className="w-3.5 h-3.5 stroke-[3]" aria-hidden="true" />}
                        </button>

                        {/* Title & Status Badges */}
                        <div className="min-w-0 flex-1 space-y-1.5">
                          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                            <h2
                              className={`text-sm sm:text-base font-semibold leading-snug tracking-tight text-slate-900 dark:text-white ${
                                isCompleted
                                  ? 'line-through text-slate-400 dark:text-slate-500'
                                  : ''
                              }`}
                            >
                              {titleText}
                            </h2>

                            {/* Minimalist Futuristic Status Badge */}
                            <div className="shrink-0 flex items-center gap-1.5 self-start font-mono text-xs">
                              {isCompleted ? (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30">
                                  <CheckCheck className="w-3.5 h-3.5" />
                                  <span>RESOLVED</span>
                                </span>
                              ) : isOverdue ? (
                                <span
                                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-rose-500/10 text-rose-700 dark:text-rose-400 border border-rose-500/40 font-bold animate-pulse"
                                  title={formatDeadlineDateTime(task.taskDeadline)}
                                >
                                  <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />
                                  <span>OVERDUE · {formatDeadlineRelative(task.taskDeadline)}</span>
                                </span>
                              ) : (
                                <span
                                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-700 dark:text-cyan-300 border border-cyan-500/30 font-semibold"
                                  title={formatDeadlineDateTime(task.taskDeadline)}
                                >
                                  <Clock className="w-3.5 h-3.5 text-cyan-500" />
                                  <span>{formatDeadlineRelative(task.taskDeadline)}</span>
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Minimalist Context Strip: Source Chat, Model, Timestamp & Tags */}
                          <div className="flex flex-wrap items-center gap-x-2 gap-y-1.5 text-xs text-slate-500 dark:text-slate-400 pt-0.5">
                            {/* Source Chat Attribution Button */}
                            {chat && (
                              <button
                                type="button"
                                onClick={() => onOpenChat(chat.id, task.id)}
                                className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-slate-100 dark:bg-[#070b10] hover:bg-slate-200 dark:hover:bg-cyan-950/40 text-slate-700 dark:text-slate-300 hover:text-cyan-600 dark:hover:text-cyan-300 transition-colors cursor-pointer font-mono text-[11px] border border-slate-200/80 dark:border-slate-800"
                                title={`Navigate to source thread "${chat.title}"`}
                              >
                                <MessageSquare className="w-3 h-3 text-cyan-600 dark:text-cyan-400" />
                                <span className="truncate max-w-[150px] sm:max-w-xs">{chat.title}</span>
                              </button>
                            )}

                            <span className="text-slate-300 dark:text-slate-700" aria-hidden="true">
                              ·
                            </span>

                            {/* Model Attribution */}
                            <span className="inline-flex items-center gap-1 font-mono text-[11px] text-slate-600 dark:text-slate-400">
                              <ModelIcon className="w-3 h-3 text-cyan-600 dark:text-cyan-400" />
                              <span>{task.aiModel}</span>
                            </span>

                            {/* Exact Timestamp */}
                            {task.taskDeadline && (
                              <>
                                <span className="text-slate-300 dark:text-slate-700" aria-hidden="true">
                                  ·
                                </span>
                                <span className="font-mono text-[11px] text-slate-500 dark:text-slate-400 tabular-nums">
                                  {formatDeadlineDateTime(task.taskDeadline)}
                                </span>
                              </>
                            )}

                            {/* Tags with Micro-Interactions */}
                            {task.tags && task.tags.length > 0 && (
                              <>
                                <span className="text-slate-300 dark:text-slate-700" aria-hidden="true">
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
                                        className={`inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded font-mono text-[10px] transition-colors cursor-pointer ${
                                          isCurrentTag
                                            ? 'bg-cyan-500/20 text-cyan-600 dark:text-cyan-300 border border-cyan-400 font-bold'
                                            : 'bg-slate-100 dark:bg-[#070b10] text-slate-600 dark:text-slate-400 border border-slate-200/80 dark:border-slate-800 hover:border-cyan-500/40 hover:text-cyan-500'
                                        }`}
                                        title={`Filter by #${cleanT}`}
                                      >
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
                          className={`text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed overflow-hidden transition-all duration-200 ${
                            isExpanded ? '' : 'max-h-24 relative'
                          }`}
                        >
                          <MarkdownRenderer content={task.content} />
                          {!isExpanded && (
                            <div className="absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-white dark:from-[#0d1520] to-transparent pointer-events-none" />
                          )}
                        </div>

                        <button
                          type="button"
                          onClick={() => toggleExpand(task.id)}
                          aria-expanded={isExpanded}
                          aria-label={isExpanded ? `Collapse preview for ${titleText}` : `Expand preview for ${titleText}`}
                          className="mt-1 font-mono text-[11px] font-semibold text-cyan-600 dark:text-cyan-400 hover:underline flex items-center gap-1 cursor-pointer"
                        >
                          {isExpanded ? (
                            <>
                              <ChevronUp className="w-3.5 h-3.5" aria-hidden="true" />
                              <span>Collapse Output Telemetry</span>
                            </>
                          ) : (
                            <>
                              <ChevronDown className="w-3.5 h-3.5" aria-hidden="true" />
                              <span>Inspect Full Output Context</span>
                            </>
                          )}
                        </button>
                      </div>

                      {/* Bottom Action Strip: Change Deadline & Quick Controls */}
                      <div className="pt-2.5 border-t border-slate-100 dark:border-slate-800/80 flex flex-wrap items-center justify-between gap-2 text-xs font-mono">
                        {/* Left: Change Deadline Modal & Presets */}
                        <div className="flex flex-wrap items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => setEditingOutput(task)}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white dark:bg-[#070b10] hover:bg-slate-50 dark:hover:bg-cyan-950/30 border border-slate-200 dark:border-slate-800 hover:border-cyan-500/40 text-slate-700 dark:text-slate-200 rounded-lg transition-colors cursor-pointer shadow-2xs"
                            title="Open deadline recalibration modal"
                          >
                            <Calendar className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
                            <span>Recalibrate</span>
                          </button>

                          {/* Quick Reschedule Presets */}
                          <div className="hidden sm:flex items-center gap-1 text-[11px] text-slate-500 dark:text-slate-400">
                            <span className="opacity-70">Shift:</span>
                            <button
                              type="button"
                              onClick={() => handleQuickExtend(task, 1)}
                              className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-[#070b10] hover:bg-slate-200 dark:hover:bg-cyan-950/40 border border-slate-200/80 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-mono transition-colors cursor-pointer"
                              title="Recalibrate +1 day forward"
                            >
                              +1d
                            </button>
                            <button
                              type="button"
                              onClick={() => handleQuickExtend(task, 3)}
                              className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-[#070b10] hover:bg-slate-200 dark:hover:bg-cyan-950/40 border border-slate-200/80 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-mono transition-colors cursor-pointer"
                              title="Recalibrate +3 days forward"
                            >
                              +3d
                            </button>
                            <button
                              type="button"
                              onClick={() => handleQuickExtend(task, 7)}
                              className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-[#070b10] hover:bg-slate-200 dark:hover:bg-cyan-950/40 border border-slate-200/80 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-mono transition-colors cursor-pointer"
                              title="Recalibrate +1 week forward"
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
                              className="inline-flex items-center gap-1 text-slate-600 dark:text-slate-300 hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors cursor-pointer"
                              title="Navigate to thread origin"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                              <span className="hidden sm:inline">Thread Origin</span>
                            </button>
                          )}

                          <span className="text-slate-300 dark:text-slate-700" aria-hidden="true">
                            ·
                          </span>

                          <button
                            type="button"
                            onClick={() => onRemoveTask(task.id)}
                            className="inline-flex items-center gap-1 text-slate-400 hover:text-rose-500 dark:hover:text-rose-400 transition-colors cursor-pointer"
                            title="Remove task tracking (preserves output in chat)"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">Delete Task</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </main>
      </div>

      {/* Recalibration & Edit Modal */}
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
