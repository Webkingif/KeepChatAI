/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import {
  HelpCircle,
  Search,
  ChevronDown,
  ArrowLeft,
  ShieldCheck,
  CheckSquare,
  FileDown,
  Smartphone,
  Sparkles,
  ExternalLink,
  MessageSquare,
} from 'lucide-react';

export interface FAQItem {
  id: string;
  category: 'General' | 'Privacy' | 'Tasks' | 'Exports' | 'PWA';
  question: string;
  answer: string;
  highlights?: string[];
}

export const FAQ_DATA: FAQItem[] = [
  {
    id: 'faq-what-is-keepchat',
    category: 'General',
    question: 'What is KeepChat and how does it organize AI outputs?',
    answer:
      'KeepChat is a centralized, local-first web application designed with a familiar WhatsApp conversational interface to save, categorize, format, and search outputs from AI models like ChatGPT, Claude, Gemini, and DeepSeek. You can create dedicated chat threads by topic or project, tag outputs, and view rendered Markdown tables, code syntax highlighting, and mathematical KaTeX equations.',
    highlights: ['WhatsApp conversational layout', 'Multi-model attribution', 'Rich Markdown & code blocks'],
  },
  {
    id: 'faq-privacy-storage',
    category: 'Privacy',
    question: 'Is my data stored securely and privately in KeepChat?',
    answer:
      'Yes. KeepChat is 100% local-first. All your chat threads, messages, and task deadlines are stored directly within your browser’s IndexedDB database with a localStorage synchronization fallback. No personal data, prompts, or AI outputs are ever transmitted to external cloud servers or analytics trackers.',
    highlights: ['Zero cloud telemetry', 'Stored in browser IndexedDB', 'Works completely offline'],
  },
  {
    id: 'faq-tasks-console',
    category: 'Tasks',
    question: 'How does the Tasks Command Console and Telemetry HUD work?',
    answer:
      'The Tasks Command Console organizes all outputs tagged as tasks in an expansive single-card productivity view. It includes a live progress velocity gauge, upcoming and overdue countdown badges, interactive tag filters, search capabilities, and quick deadline extensions (+1d, +3d) so you can turn AI insights into actionable deadlines.',
    highlights: ['Overdue & upcoming live badges', 'Quick deadline extensions', 'Tag matrix filtering'],
  },
  {
    id: 'faq-export-formats',
    category: 'Exports',
    question: 'What export formats does KeepChat support?',
    answer:
      'KeepChat provides multi-format export engines: high-resolution WhatsApp-style PNG images (with custom width sliders and code auto-fit), paginated vector-text PDFs via jsPDF, chronological Markdown (.md) documents for Obsidian/Notion, and complete JSON backups for device migration.',
    highlights: ['High-res PNG snapshot images', 'Vector-text paginated PDF', 'Chronological Markdown (.md)', 'Full JSON backup'],
  },
  {
    id: 'faq-pwa-offline',
    category: 'PWA',
    question: 'Does KeepChat work offline as a Progressive Web App (PWA)?',
    answer:
      'Yes. KeepChat includes a pre-cached Workbox service worker and Web App Manifest. You can install KeepChat directly onto your desktop (Chrome, Edge, Safari) or mobile home screen (iOS, Android), launching it as a standalone application that operates seamlessly with zero internet connection.',
    highlights: ['100% offline capable', 'Desktop & mobile installable', 'Zero-latency instant boot'],
  },
  {
    id: 'faq-supported-models',
    category: 'General',
    question: 'Which AI models are supported for categorization in KeepChat?',
    answer:
      'KeepChat natively supports organizing and labeling outputs from OpenAI ChatGPT (GPT-4o, o1, o3-mini), Google Gemini (Gemini 1.5 Pro, Flash, Gemini 2.0), Anthropic Claude (Claude 3.5 Sonnet, Opus), DeepSeek (V3, R1), and custom AI engines with model-specific visual badges and filter tags.',
    highlights: ['ChatGPT, Gemini, Claude, DeepSeek', 'Model-specific badge colors', 'Custom models supported'],
  },
  {
    id: 'faq-backup-restore',
    category: 'Privacy',
    question: 'How do I backup and restore my vault data across devices?',
    answer:
      'In the Settings or Sidebar menu, click "Backup All Vault Data (JSON)". This immediately downloads a complete snapshot of all your threads, messages, and task deadlines. On any other browser or device, click "Restore Vault from File" to import and restore your entire library instantly.',
    highlights: ['Single-click JSON download', 'Instant import restoration', 'No accounts or logins needed'],
  },
  {
    id: 'faq-multi-select',
    category: 'General',
    question: 'How do I perform bulk operations or export multiple outputs together?',
    answer:
      'In any chat thread, hover over an output or tap the multi-select icon in the header to enter selection mode. Select multiple outputs across the thread to export them together into a unified multi-page PDF, generate a composite image, or safely delete them in bulk.',
    highlights: ['Multi-select mode', 'Unified multi-output PDF', 'Safe bulk delete confirmation'],
  },
];

interface FAQViewProps {
  onBack: () => void;
  onOpenTasks?: () => void;
  onOpenVault?: () => void;
}

export const FAQView: React.FC<FAQViewProps> = ({ onBack, onOpenTasks, onOpenVault }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [expandedId, setExpandedId] = useState<string | null>('faq-what-is-keepchat');

  const categories = ['All', 'General', 'Privacy', 'Tasks', 'Exports', 'PWA'];

  const filteredFaqs = useMemo(() => {
    return FAQ_DATA.filter((item) => {
      const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        item.question.toLowerCase().includes(q) ||
        item.answer.toLowerCase().includes(q) ||
        (item.highlights && item.highlights.some((h) => h.toLowerCase().includes(q)));
      return matchesCategory && matchesSearch;
    });
  }, [searchQuery, selectedCategory]);

  const toggleExpand = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  return (
    <div className="flex-1 h-full flex flex-col min-w-0 bg-[#efeae2] dark:bg-[#0b141a] overflow-hidden">
      {/* Top Header Bar */}
      <header className="h-[60px] bg-[#008069] dark:bg-[#202c33] px-3 sm:px-6 flex items-center justify-between gap-3 text-white shadow-sm shrink-0 z-10">
        <div className="flex items-center gap-2.5 sm:gap-3.5 min-w-0">
          <button
            onClick={onBack}
            className="p-1.5 sm:p-2 -ml-1 rounded-full hover:bg-black/15 transition-colors cursor-pointer focus-visible:ring-2 focus-visible:ring-white focus-visible:outline-none"
            title="Back to chats"
            aria-label="Back to chats"
          >
            <ArrowLeft className="w-5 h-5 text-white" aria-hidden="true" />
          </button>
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-white/15 flex items-center justify-center shrink-0">
              <HelpCircle className="w-4 h-4 text-emerald-100" aria-hidden="true" />
            </div>
            <div className="min-w-0">
              <h1 className="text-sm sm:text-base font-semibold tracking-tight text-white truncate">
                Frequently Asked Questions (FAQ)
              </h1>
              <p className="text-[11px] text-emerald-100 dark:text-slate-400 truncate">
                Knowledge base & architecture guide
              </p>
            </div>
          </div>
        </div>

        {/* Quick Action Navigation */}
        <div className="flex items-center gap-2 shrink-0">
          {onOpenTasks && (
            <button
              onClick={onOpenTasks}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-medium text-white transition-colors cursor-pointer"
            >
              <CheckSquare className="w-3.5 h-3.5 text-cyan-300" aria-hidden="true" />
              <span>Tasks Console</span>
            </button>
          )}
          {onOpenVault && (
            <button
              onClick={onOpenVault}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 dark:bg-[#00a884] dark:hover:bg-[#029070] text-xs font-medium text-white transition-colors cursor-pointer shadow-xs"
            >
              <MessageSquare className="w-3.5 h-3.5 text-white" aria-hidden="true" />
              <span>AI Vault</span>
            </button>
          )}
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto px-3 sm:px-6 py-4 sm:py-6 max-w-4xl mx-auto w-full space-y-4 sm:space-y-6">
        {/* Search & Hero Card */}
        <section aria-labelledby="faq-search-heading" className="bg-white dark:bg-[#202c33] p-4 sm:p-5 rounded-2xl border border-slate-200/80 dark:border-[#2a3942] shadow-2xs space-y-3.5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 id="faq-search-heading" className="text-base sm:text-lg font-bold text-slate-900 dark:text-white tracking-tight">
                How can we help you?
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Explore common questions about privacy, tasks, exports, and offline support.
              </p>
            </div>
            <div className="flex items-center gap-1.5 text-[11px] text-[#00a884] dark:text-emerald-400 font-medium self-start sm:self-auto">
              <ShieldCheck className="w-3.5 h-3.5" aria-hidden="true" />
              <span>100% Local-First & Private</span>
            </div>
          </div>

          {/* Search Input Bar */}
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500 pointer-events-none" aria-hidden="true" />
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search questions, privacy details, or keywords..."
              aria-label="Search frequently asked questions"
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-100 dark:bg-[#111b21] border border-transparent focus:border-[#00a884] dark:focus:border-[#00a884] text-xs sm:text-sm text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              >
                Clear
              </button>
            )}
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-0.5 scrollbar-none" role="tablist" aria-label="FAQ Categories">
            {categories.map((cat) => {
              const isSelected = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  role="tab"
                  aria-selected={isSelected}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors cursor-pointer ${
                    isSelected
                      ? 'bg-[#00a884] text-white shadow-2xs'
                      : 'bg-slate-100 dark:bg-[#111b21] text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-[#182229]'
                  }`}
                >
                  {cat === 'All' ? 'All Questions' : cat}
                </button>
              );
            })}
          </div>
        </section>

        {/* FAQ Accordion List */}
        <section aria-label="Questions and answers" className="space-y-2.5">
          {filteredFaqs.length === 0 ? (
            <div className="p-8 text-center bg-white dark:bg-[#202c33] rounded-2xl border border-slate-200 dark:border-[#2a3942]">
              <HelpCircle className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-2" aria-hidden="true" />
              <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                No matching questions found
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
                Try searching for different terms like &quot;offline&quot;, &quot;tasks&quot;, &quot;PDF&quot;, or reset your category filter.
              </p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('All');
                }}
                className="mt-3.5 px-3.5 py-1.5 rounded-lg bg-[#00a884] text-white text-xs font-medium hover:bg-[#008f6f] transition-colors cursor-pointer"
              >
                Reset Search Filter
              </button>
            </div>
          ) : (
            filteredFaqs.map((faq) => {
              const isExpanded = expandedId === faq.id;
              return (
                <article
                  key={faq.id}
                  className="bg-white dark:bg-[#202c33] rounded-xl border border-slate-200/80 dark:border-[#2a3942] overflow-hidden transition-all shadow-2xs hover:border-slate-300 dark:hover:border-slate-600"
                >
                  <button
                    onClick={() => toggleExpand(faq.id)}
                    aria-expanded={isExpanded}
                    aria-controls={`${faq.id}-answer`}
                    id={`${faq.id}-question`}
                    className="w-full flex items-center justify-between gap-3 p-4 text-left cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00a884]"
                  >
                    <div className="flex items-start gap-3 min-w-0">
                      <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-[#111b21] text-slate-600 dark:text-slate-300 shrink-0 mt-0.5">
                        {faq.category}
                      </span>
                      <h2 className="text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-100 leading-snug">
                        {faq.question}
                      </h2>
                    </div>
                    <ChevronDown
                      className={`w-4 h-4 text-slate-400 dark:text-slate-500 shrink-0 transition-transform duration-200 ${
                        isExpanded ? 'rotate-180 text-[#00a884] dark:text-[#00a884]' : ''
                      }`}
                      aria-hidden="true"
                    />
                  </button>

                  {isExpanded && (
                    <div
                      id={`${faq.id}-answer`}
                      role="region"
                      aria-labelledby={`${faq.id}-question`}
                      className="px-4 pb-4 pt-1 border-t border-slate-100 dark:border-[#182229] space-y-3"
                    >
                      <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                        {faq.answer}
                      </p>
                      {faq.highlights && faq.highlights.length > 0 && (
                        <div className="flex flex-wrap items-center gap-2 pt-1">
                          {faq.highlights.map((highlight, idx) => (
                            <span
                              key={idx}
                              className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded"
                            >
                              <Sparkles className="w-3 h-3 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
                              {highlight}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </article>
              );
            })
          )}
        </section>

        {/* Bottom Feature Navigation Cards */}
        <section aria-labelledby="faq-deep-links-heading" className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          <h2 id="faq-deep-links-heading" className="sr-only">Quick Feature Links</h2>
          <div
            onClick={onOpenVault}
            className="p-3.5 bg-white dark:bg-[#202c33] rounded-xl border border-slate-200/80 dark:border-[#2a3942] hover:border-[#00a884] dark:hover:border-[#00a884] transition-all cursor-pointer group"
          >
            <div className="flex items-center gap-2 mb-1">
              <MessageSquare className="w-4 h-4 text-[#00a884]" aria-hidden="true" />
              <h3 className="text-xs font-semibold text-slate-800 dark:text-slate-100 group-hover:text-[#00a884]">
                AI Output Vault
              </h3>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Access your saved chat threads, organize prompts, and view Markdown.
            </p>
          </div>

          <div
            onClick={onOpenTasks}
            className="p-3.5 bg-white dark:bg-[#202c33] rounded-xl border border-slate-200/80 dark:border-[#2a3942] hover:border-cyan-500 dark:hover:border-cyan-500 transition-all cursor-pointer group"
          >
            <div className="flex items-center gap-2 mb-1">
              <CheckSquare className="w-4 h-4 text-cyan-500" aria-hidden="true" />
              <h3 className="text-xs font-semibold text-slate-800 dark:text-slate-100 group-hover:text-cyan-500">
                Tasks & Deadlines
              </h3>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Monitor overdue countdowns, live velocity progress, and tags.
            </p>
          </div>

          <div
            onClick={onBack}
            className="p-3.5 bg-white dark:bg-[#202c33] rounded-xl border border-slate-200/80 dark:border-[#2a3942] hover:border-blue-500 dark:hover:border-blue-500 transition-all cursor-pointer group"
          >
            <div className="flex items-center gap-2 mb-1">
              <Smartphone className="w-4 h-4 text-blue-500" aria-hidden="true" />
              <h3 className="text-xs font-semibold text-slate-800 dark:text-slate-100 group-hover:text-blue-500">
                PWA Offline Mode
              </h3>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Install to desktop or mobile home screen with instant boot.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
};
