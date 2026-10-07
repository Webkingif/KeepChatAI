import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  FileText,
  Download,
  X,
  Sparkles,
  Bot,
  Brain,
  Cpu,
  MessageSquare,
  Tag,
  Check,
  Sliders,
  Wand2,
  Type,
  Camera,
} from 'lucide-react';
import { ChatThread, SavedOutput, AIModelType } from '../types/keepchat';
import { exportElementAsPdf, exportStructuredPdf } from '../utils/pdfExporter';
import { MarkdownRenderer } from './MarkdownRenderer';
import { formatFullDateTime } from '../utils/date';

interface ExportPdfModalProps {
  isOpen: boolean;
  onClose: () => void;
  chat: ChatThread;
  outputs: SavedOutput[];
  onToast?: (message: string, type: 'success' | 'error' | 'info') => void;
}

const MODEL_ICONS: Record<AIModelType, React.ElementType> = {
  ChatGPT: MessageSquare,
  Gemini: Sparkles,
  Claude: Brain,
  DeepSeek: Cpu,
  Other: Bot,
};

export const ExportPdfModal: React.FC<ExportPdfModalProps> = ({
  isOpen,
  onClose,
  chat,
  outputs,
  onToast,
}) => {
  const [docWidth, setDocWidth] = useState<number>(750);
  const [orientation, setOrientation] = useState<'p' | 'l'>('p');
  const [pdfMode, setPdfMode] = useState<'selectable' | 'snapshot'>('snapshot');
  const [isExporting, setIsExporting] = useState(false);
  const captureRef = useRef<HTMLDivElement>(null);

  // Auto-fit document width & orientation for long code lines
  const handleAutoFitWidth = useCallback(() => {
    if (!captureRef.current) return;
    const elements = captureRef.current.querySelectorAll(
      'pre code, pre, table, .katex-display, code'
    );
    let maxContentWidth = 0;
    elements.forEach((el) => {
      maxContentWidth = Math.max(maxContentWidth, (el as HTMLElement).scrollWidth);
    });

    if (maxContentWidth > 0) {
      // Add document padding, margins, and borders (approx 130px)
      const idealWidth = Math.min(Math.max(maxContentWidth + 130, 750), 1900);
      setDocWidth(Math.round(idealWidth));
      if (idealWidth > 820) {
        setOrientation('l');
      }
      onToast?.(
        `Auto-fitted PDF width to ${Math.round(idealWidth)}px (${idealWidth > 820 ? 'Landscape' : 'Portrait'})!`,
        'info'
      );
    } else {
      setDocWidth(750);
      setOrientation('p');
      onToast?.('Set to standard A4 Portrait (750px)', 'info');
    }
  }, [onToast]);

  // Initial detection when opening modal with code outputs
  useEffect(() => {
    if (isOpen) {
      const hasCodeOrTables = outputs.some(
        (o) =>
          o.content.includes('```') ||
          o.content.includes('|') ||
          o.content.includes('$$') ||
          o.content.includes('\\[')
      );
      if (hasCodeOrTables) {
        const timer = setTimeout(() => {
          if (!captureRef.current) return;
          const elements = captureRef.current.querySelectorAll(
            'pre code, pre, table, .katex-display'
          );
          let maxContentWidth = 0;
          elements.forEach((el) => {
            maxContentWidth = Math.max(maxContentWidth, (el as HTMLElement).scrollWidth);
          });
          if (maxContentWidth > 620) {
            const idealWidth = Math.min(Math.max(maxContentWidth + 130, 750), 1800);
            setDocWidth(Math.round(idealWidth));
            if (idealWidth > 820) {
              setOrientation('l');
            }
          }
        }, 120);
        return () => clearTimeout(timer);
      }
    }
  }, [isOpen, outputs]);

  if (!isOpen || outputs.length === 0) return null;

  // Sort outputs chronologically: oldest at top, newest at bottom
  const sortedOutputs = [...outputs].sort((a, b) => a.createdAt - b.createdAt);

  const handleDownloadPdf = async () => {
    setIsExporting(true);
    try {
      const filename = `${chat.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')}-${new Date().toISOString().slice(0, 10)}.pdf`;

      if (pdfMode === 'selectable') {
        // 100% Highlightable & Copyable Vector Text PDF with Monospace Code Boxes
        await exportStructuredPdf(chat, sortedOutputs, {
          filename,
          orientation,
          customWidthPx: docWidth,
        });
      } else {
        // Visual Snapshot PDF
        if (!captureRef.current) return;
        await exportElementAsPdf(captureRef.current, {
          filename,
          chatTitle: chat.title,
          orientation,
          customWidthPx: docWidth,
        });
      }

      onToast?.(
        outputs.length === 1
          ? `Output exported as ${pdfMode === 'selectable' ? 'Selectable Text' : 'Snapshot'} PDF!`
          : `Exported ${outputs.length} outputs as ${pdfMode === 'selectable' ? 'Selectable Text' : 'Snapshot'} PDF!`,
        'success'
      );
      onClose();
    } catch (err) {
      console.error('Failed to export PDF:', err);
      onToast?.('Failed to generate PDF. Please try again.', 'error');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Export Output as PDF"
      className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 animate-in fade-in duration-150"
    >
      <div className="bg-white dark:bg-[#111b21] rounded-2xl max-w-5xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 dark:border-[#2a3942] overflow-hidden animate-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-200 dark:border-[#26353d] bg-slate-50/80 dark:bg-[#182329]/80 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-rose-600 to-amber-600 text-white flex items-center justify-center shadow-xs">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white leading-tight">
                {outputs.length === 1
                  ? 'Export Output as PDF Document'
                  : `Export ${outputs.length} Outputs as PDF Document`}
              </h2>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Clean, continuous paginated A4 format with page numbers
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-[#2a3942] transition-colors cursor-pointer"
            title="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Width Adjustment, Orientation & Presets Toolbar */}
        <div className="px-4 sm:px-5 py-2.5 bg-slate-100/90 dark:bg-[#162228] border-b border-slate-200 dark:border-[#26353d] flex flex-wrap items-center justify-between gap-3 shrink-0 text-xs">
          {/* Format Mode: Selectable Vector Text vs Snapshot */}
          <div className="flex items-center gap-1.5 shrink-0">
            <span className="font-semibold text-slate-700 dark:text-slate-200 mr-1 hidden sm:inline">
              Format:
            </span>
            <div className="flex items-center bg-slate-200/80 dark:bg-[#202c33] p-0.5 rounded-lg">
              <button
                type="button"
                onClick={() => setPdfMode('selectable')}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-all cursor-pointer ${
                  pdfMode === 'selectable'
                    ? 'bg-white dark:bg-[#111b21] text-rose-600 dark:text-amber-400 shadow-2xs font-bold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
                title="Selectable vector text: Text, headings, and code can be highlighted and copied"
              >
                <Type className="w-3.5 h-3.5" />
                <span>Selectable Text</span>
              </button>
              <button
                type="button"
                onClick={() => setPdfMode('snapshot')}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-all cursor-pointer ${
                  pdfMode === 'snapshot'
                    ? 'bg-white dark:bg-[#111b21] text-rose-600 dark:text-amber-400 shadow-2xs font-bold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
                title="Visual snapshot PDF"
              >
                <Camera className="w-3.5 h-3.5" />
                <span>Snapshot</span>
              </button>
            </div>
          </div>

          {/* Orientation Toggle */}
          <div className="flex items-center gap-1.5 shrink-0">
            <span className="font-semibold text-slate-700 dark:text-slate-200 mr-1 hidden sm:inline">
              Page:
            </span>
            <div className="flex items-center bg-slate-200/80 dark:bg-[#202c33] p-0.5 rounded-lg">
              <button
                type="button"
                onClick={() => {
                  setOrientation('p');
                  if (docWidth > 850) setDocWidth(750);
                }}
                className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all cursor-pointer ${
                  orientation === 'p'
                    ? 'bg-white dark:bg-[#111b21] text-rose-600 dark:text-amber-400 shadow-2xs font-bold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
                title="Portrait Page (210×297mm)"
              >
                Portrait
              </button>
              <button
                type="button"
                onClick={() => {
                  setOrientation('l');
                  if (docWidth < 950) setDocWidth(1050);
                }}
                className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all cursor-pointer ${
                  orientation === 'l'
                    ? 'bg-white dark:bg-[#111b21] text-rose-600 dark:text-amber-400 shadow-2xs font-bold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
                title="Landscape Page (297×210mm)"
              >
                Landscape
              </button>
            </div>
          </div>

          {/* Width Slider */}
          <div className="flex items-center gap-2.5 min-w-[200px] sm:min-w-[240px] flex-1">
            <div className="flex items-center gap-1 font-semibold text-slate-700 dark:text-slate-200 shrink-0">
              <Sliders className="w-3.5 h-3.5 text-rose-600 dark:text-amber-400" />
              <span>Width:</span>
              <span className="font-mono text-rose-600 dark:text-amber-400 font-bold tabular-nums">
                {docWidth}px
              </span>
            </div>
            <input
              type="range"
              min={600}
              max={1800}
              step={25}
              value={docWidth}
              onChange={(e) => {
                const w = Number(e.target.value);
                setDocWidth(w);
                if (w > 850 && orientation === 'p') {
                  setOrientation('l');
                }
              }}
              className="w-full accent-rose-600 cursor-pointer"
              title="Drag to adjust PDF printable width"
            />
          </div>

          {/* Quick Presets */}
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={() => {
                setDocWidth(750);
                setOrientation('p');
              }}
              className={`px-2 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                docWidth === 750 && orientation === 'p'
                  ? 'bg-rose-600 text-white shadow-2xs font-semibold'
                  : 'bg-white dark:bg-[#202c33] text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-[#2a3942] border border-slate-200 dark:border-[#2a3942]'
              }`}
            >
              Portrait A4
            </button>

            <button
              type="button"
              onClick={() => {
                setDocWidth(1050);
                setOrientation('l');
              }}
              className={`px-2 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                docWidth === 1050 && orientation === 'l'
                  ? 'bg-rose-600 text-white shadow-2xs font-semibold'
                  : 'bg-white dark:bg-[#202c33] text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-[#2a3942] border border-slate-200 dark:border-[#2a3942]'
              }`}
            >
              Landscape A4
            </button>

            <button
              type="button"
              onClick={() => {
                setDocWidth(1350);
                setOrientation('l');
              }}
              className={`px-2 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                docWidth === 1350
                  ? 'bg-rose-600 text-white shadow-2xs font-semibold'
                  : 'bg-white dark:bg-[#202c33] text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-[#2a3942] border border-slate-200 dark:border-[#2a3942]'
              }`}
            >
              Ultra-Wide
            </button>

            <button
              type="button"
              onClick={handleAutoFitWidth}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-amber-300 border border-rose-200 dark:border-rose-900/60 hover:bg-rose-100 dark:hover:bg-rose-900/50 transition-all cursor-pointer shadow-2xs"
              title="Automatically expand width to fit the longest line of code without cropping"
            >
              <Wand2 className="w-3.5 h-3.5" />
              <span>Auto-Fit Code</span>
            </button>
          </div>
        </div>

        {/* Mode Status Info Banner */}
        <div className="px-5 py-2 bg-emerald-50/90 dark:bg-teal-950/40 border-b border-emerald-100 dark:border-teal-900/40 text-xs text-emerald-800 dark:text-teal-300 flex items-center justify-between gap-2 shrink-0">
          <div className="flex items-center gap-1.5 font-medium">
            <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-teal-400 shrink-0" />
            <span>
              {pdfMode === 'selectable'
                ? 'Highlightable Vector Text PDF: All text, headings, and monospace code blocks can be highlighted with your cursor and copied directly from your PDF reader.'
                : 'Snapshot PDF: High-resolution visual capture preserving wallpaper and styling.'}
            </span>
          </div>
          <span className="text-[11px] font-mono text-emerald-700/80 dark:text-teal-400/80 hidden md:inline">
            {docWidth}px ({orientation === 'l' ? 'Landscape' : 'Portrait'})
          </span>
        </div>

        {/* Modal Scrollable Document Preview Area */}
        <div className="flex-1 overflow-auto p-4 sm:p-8 bg-slate-200/60 dark:bg-[#0c1317]">
          {/* THE CAPTURED DOCUMENT ELEMENT (Printable Layout) */}
          <div
            ref={captureRef}
            className="export-pdf-container mx-auto bg-white text-slate-900 rounded-lg shadow-xl border border-slate-200 p-8 sm:p-12 transition-all"
            style={{
              width: `${docWidth}px`,
              minWidth: `${docWidth}px`,
              maxWidth: `${docWidth}px`,
              fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
            }}
          >
            {/* Formal Document Title Header */}
            <div className="border-b-2 border-slate-900 pb-5 mb-8">
              <div className="flex items-center justify-between gap-4 mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-md bg-[#008069] text-white flex items-center justify-center text-xs font-bold">
                    KC
                  </div>
                  <span className="text-xs font-bold tracking-wider uppercase text-slate-500">
                    KeepChat Vault Document
                  </span>
                </div>
                <span className="text-xs text-slate-500">
                  Exported on {new Date().toLocaleDateString(undefined, { dateStyle: 'long' })}
                </span>
              </div>

              <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight mb-2">
                {chat.title}
              </h1>

              {chat.description && (
                <p className="text-sm text-slate-600 italic mb-3">{chat.description}</p>
              )}

              <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600">
                <span className="inline-flex items-center gap-1 font-semibold text-[#008069] bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  Category: {chat.category}
                </span>
                <span>•</span>
                <span>
                  {outputs.length} {outputs.length === 1 ? 'output' : 'outputs'} included
                </span>
                <span>•</span>
                <span>Confidential & Private Local Vault</span>
              </div>
            </div>

            {/* Continuous Flow of Outputs */}
            <div className="space-y-8">
              {sortedOutputs.map((item, idx) => {
                const ModelIcon = MODEL_ICONS[item.aiModel] || Bot;
                return (
                  <div key={item.id} className="relative">
                    {/* Output Section Header */}
                    <div className="flex items-start justify-between gap-3 mb-3 border-b border-slate-200 pb-2">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                            Output #{idx + 1}
                          </span>
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-100 text-slate-800 border border-slate-200">
                            <ModelIcon className="w-3 h-3 text-[#008069]" />
                            <span>{item.aiModel}</span>
                          </span>
                        </div>
                        {item.title && (
                          <h2 className="text-base font-bold text-slate-900 leading-snug">
                            {item.title}
                          </h2>
                        )}
                      </div>

                      <span className="text-xs text-slate-500 shrink-0 tabular-nums">
                        {formatFullDateTime(item.createdAt)}
                      </span>
                    </div>

                    {/* Optional User Prompt */}
                    {item.userPrompt && (
                      <div className="mb-4 p-3 bg-slate-50 rounded-md border-l-3 border-[#008069] text-xs text-slate-700 italic">
                        <span className="font-bold text-[10px] uppercase text-[#008069] block not-italic mb-0.5">
                          User Prompt:
                        </span>
                        "{item.userPrompt}"
                      </div>
                    )}

                    {/* Attached Image if present */}
                    {item.mediaType === 'image' && item.mediaUrl && (
                      <div className="mb-4">
                        <img
                          src={item.mediaUrl}
                          alt={item.mediaName || 'Attached Media'}
                          className="max-h-96 w-auto rounded border border-slate-200 object-contain"
                        />
                      </div>
                    )}

                    {/* Markdown Body Content */}
                    <div className="text-xs leading-relaxed text-slate-800 space-y-2 mb-3">
                      <MarkdownRenderer content={item.content} />
                    </div>

                    {/* Tags List */}
                    {item.tags && item.tags.length > 0 && (
                      <div className="flex flex-wrap items-center gap-1.5 mt-3 pt-2 text-[11px] text-slate-500">
                        <span className="font-medium text-slate-400 mr-1">Tags:</span>
                        {item.tags.map((tag, tIdx) => (
                          <span
                            key={tIdx}
                            className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-medium"
                          >
                            <Tag className="w-2.5 h-2.5 opacity-60" />
                            {tag.startsWith('#') ? tag : `#${tag}`}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Divider between continuous outputs (except last) */}
                    {idx < sortedOutputs.length - 1 && (
                      <div className="mt-8 pt-2 border-b border-dashed border-slate-300" />
                    )}
                  </div>
                );
              })}
            </div>

            {/* Document End Marker */}
            <div className="mt-12 pt-4 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-400">
              <span>End of Document</span>
              <span>Generated with KeepChat · Local AI Output Vault</span>
            </div>
          </div>
        </div>

        {/* Modal Action Footer */}
        <div className="flex items-center justify-between gap-3 px-5 py-3.5 border-t border-slate-200 dark:border-[#26353d] bg-slate-50/80 dark:bg-[#182329]/80 shrink-0">
          <span className="text-xs text-slate-500 dark:text-slate-400 hidden sm:inline">
            A4 Paginated Document with headers and running page numbers
          </span>

          <div className="flex items-center gap-2.5 ml-auto">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-200/70 dark:hover:bg-[#202c33] transition-colors cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={handleDownloadPdf}
              disabled={isExporting}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-rose-600 to-amber-600 hover:brightness-105 active:scale-95 transition-all cursor-pointer shadow-md shadow-rose-900/20 disabled:opacity-50"
            >
              <Download className="w-4 h-4" />
              <span>{isExporting ? 'Generating PDF...' : 'Download PDF'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
