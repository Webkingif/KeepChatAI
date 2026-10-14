import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Download,
  X,
  Check,
  Copy,
  Sparkles,
  Bot,
  Brain,
  Cpu,
  MessageSquare,
  Sun,
  Moon,
  Tag,
  CheckCheck,
  Sliders,
  Wand2,
} from 'lucide-react';
import { ChatThread, SavedOutput, AIModelType } from '../types/keepchat';
import { exportElementAsPng } from '../utils/imageExporter';
import { MarkdownRenderer } from './MarkdownRenderer';
import { formatWhatsAppTime, formatFullDateTime } from '../utils/date';
import { toBlob } from 'html-to-image';

interface ExportSnapshotModalProps {
  isOpen: boolean;
  onClose: () => void;
  chat: ChatThread;
  outputs: SavedOutput[];
  defaultTheme?: 'light' | 'dark';
  onToast?: (message: string, type: 'success' | 'error' | 'info') => void;
}

const MODEL_ICONS: Record<AIModelType, React.ElementType> = {
  ChatGPT: MessageSquare,
  Gemini: Sparkles,
  Claude: Brain,
  DeepSeek: Cpu,
  Other: Bot,
};

export const ExportSnapshotModal: React.FC<ExportSnapshotModalProps> = ({
  isOpen,
  onClose,
  chat,
  outputs,
  defaultTheme = 'light',
  onToast,
}) => {
  const [snapshotTheme, setSnapshotTheme] = useState<'light' | 'dark'>(defaultTheme);
  const [exportWidth, setExportWidth] = useState<number>(680);
  const [isExporting, setIsExporting] = useState(false);
  const [copiedImage, setCopiedImage] = useState(false);
  const captureRef = useRef<HTMLDivElement>(null);

  // Auto-fit width calculation to enclose longest code line/formula without cropping
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
      // Add card padding, margin, and borders (approx 120px)
      const idealWidth = Math.min(Math.max(maxContentWidth + 120, 640), 1900);
      setExportWidth(Math.round(idealWidth));
      onToast?.(
        `Auto-fitted width to ${Math.round(idealWidth)}px for longest content line!`,
        'info'
      );
    } else {
      setExportWidth(680);
      onToast?.('Set to standard width (680px)', 'info');
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
          if (maxContentWidth > 560) {
            const idealWidth = Math.min(Math.max(maxContentWidth + 120, 640), 1800);
            setExportWidth(Math.round(idealWidth));
          }
        }, 120);
        return () => clearTimeout(timer);
      }
    }
  }, [isOpen, outputs]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || outputs.length === 0) return null;

  // Sort outputs chronologically (oldest at top, newest at bottom)
  const sortedOutputs = [...outputs].sort((a, b) => a.createdAt - b.createdAt);

  const handleDownload = async () => {
    if (!captureRef.current) return;
    setIsExporting(true);
    try {
      const filename = `keepchat-${chat.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')}-${new Date().toISOString().slice(0, 10)}.png`;

      await exportElementAsPng(captureRef.current, {
        filename,
        pixelRatio: 2,
        backgroundColor: snapshotTheme === 'dark' ? '#0b141a' : '#efeae2',
      });

      onToast?.(
        outputs.length === 1
          ? 'Output exported as image!'
          : `Exported ${outputs.length} outputs as image!`,
        'success'
      );
    } catch (err) {
      console.error(err);
      onToast?.('Failed to generate image. Please try again.', 'error');
    } finally {
      setIsExporting(false);
    }
  };

  const handleCopyClipboard = async () => {
    if (!captureRef.current) return;
    setIsExporting(true);
    try {
      const blob = await toBlob(captureRef.current, {
        pixelRatio: 2,
        cacheBust: true,
        backgroundColor: snapshotTheme === 'dark' ? '#0b141a' : '#efeae2',
      });

      if (blob && navigator.clipboard && window.ClipboardItem) {
        await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
        setCopiedImage(true);
        setTimeout(() => setCopiedImage(false), 2500);
        onToast?.('Image copied to clipboard!', 'success');
      } else {
        throw new Error('ClipboardItem not supported');
      }
    } catch (err) {
      console.error(err);
      // Fallback: download directly
      await handleDownload();
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="export-snapshot-title"
      className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 animate-in fade-in duration-150"
    >
      <div
        className="bg-white dark:bg-[#111b21] rounded-2xl max-w-5xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 dark:border-[#2a3942] overflow-hidden animate-in zoom-in-95 duration-150"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-200 dark:border-[#26353d] bg-slate-50/80 dark:bg-[#182329]/80 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-[#008069] to-[#25d366] text-white flex items-center justify-center shadow-xs">
              <Download className="w-4 h-4" aria-hidden="true" />
            </div>
            <div>
              <h2 id="export-snapshot-title" className="text-sm sm:text-base font-bold text-slate-900 dark:text-white leading-tight">
                {outputs.length === 1
                  ? 'Export Output as Image'
                  : `Export ${outputs.length} Outputs as Combined Image`}
              </h2>
              <p className="text-[11px] text-slate-600 dark:text-slate-400">
                WhatsApp-styled high-resolution snapshot (PNG)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Theme Toggle for Snapshot */}
            <div className="flex items-center bg-slate-200/70 dark:bg-[#202c33] p-0.5 rounded-lg text-xs" role="radiogroup" aria-label="Snapshot wallpaper theme">
              <button
                type="button"
                onClick={() => setSnapshotTheme('light')}
                className={`p-1.5 rounded-md transition-colors cursor-pointer focus-visible:ring-2 focus-visible:ring-[#00a884] focus-visible:outline-none ${
                  snapshotTheme === 'light'
                    ? 'bg-white text-slate-900 shadow-2xs font-medium'
                    : 'text-slate-600 hover:text-slate-800 dark:text-slate-400'
                }`}
                title="Light Wallpaper"
                aria-label="Light wallpaper background"
                role="radio"
                aria-checked={snapshotTheme === 'light'}
              >
                <Sun className="w-3.5 h-3.5" aria-hidden="true" />
              </button>
              <button
                type="button"
                onClick={() => setSnapshotTheme('dark')}
                className={`p-1.5 rounded-md transition-colors cursor-pointer focus-visible:ring-2 focus-visible:ring-[#00a884] focus-visible:outline-none ${
                  snapshotTheme === 'dark'
                    ? 'bg-[#111b21] text-teal-400 shadow-2xs font-medium'
                    : 'text-slate-600 hover:text-slate-800 dark:text-slate-400'
                }`}
                title="Dark Wallpaper"
                aria-label="Dark wallpaper background"
                role="radio"
                aria-checked={snapshotTheme === 'dark'}
              >
                <Moon className="w-3.5 h-3.5" aria-hidden="true" />
              </button>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-[#2a3942] transition-colors cursor-pointer focus-visible:ring-2 focus-visible:ring-[#00a884] focus-visible:outline-none"
              title="Close modal"
              aria-label="Close export modal"
            >
              <X className="w-5 h-5" aria-hidden="true" />
            </button>
          </div>
        </div>

        {/* Width Adjustment & Presets Toolbar */}
        <div className="px-4 sm:px-5 py-2.5 bg-slate-100/90 dark:bg-[#162228] border-b border-slate-200 dark:border-[#26353d] flex flex-wrap items-center justify-between gap-3 shrink-0 text-xs">
          <div className="flex items-center gap-2.5 min-w-[220px] sm:min-w-[260px] flex-1">
            <label htmlFor="snapshot-width-slider" className="flex items-center gap-1.5 font-semibold text-slate-700 dark:text-slate-200 shrink-0 cursor-pointer">
              <Sliders className="w-3.5 h-3.5 text-[#00a884]" aria-hidden="true" />
              <span>Width:</span>
              <span className="font-mono text-[#00a884] dark:text-teal-400 font-bold tabular-nums">
                {exportWidth}px
              </span>
            </label>
            <input
              id="snapshot-width-slider"
              type="range"
              min={480}
              max={1800}
              step={20}
              value={exportWidth}
              onChange={(e) => setExportWidth(Number(e.target.value))}
              aria-label="Export image width in pixels"
              aria-valuemin={480}
              aria-valuemax={1800}
              aria-valuenow={exportWidth}
              className="w-full accent-[#00a884] cursor-pointer focus-visible:outline-none"
              title="Drag to adjust export width"
            />
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <span className="text-[11px] text-slate-500 dark:text-slate-400 mr-0.5 hidden md:inline">
              Presets:
            </span>
            {[
              { label: 'Standard', width: 640 },
              { label: 'Wide', width: 960 },
              { label: 'Ultra', width: 1280 },
            ].map((preset) => (
              <button
                key={preset.label}
                type="button"
                onClick={() => setExportWidth(preset.width)}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                  exportWidth === preset.width
                    ? 'bg-[#00a884] text-white shadow-2xs font-semibold'
                    : 'bg-white dark:bg-[#202c33] text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-[#2a3942] border border-slate-200 dark:border-[#2a3942]'
                }`}
              >
                {preset.label}
              </button>
            ))}

            <button
              type="button"
              onClick={handleAutoFitWidth}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-50 dark:bg-teal-950/40 text-[#00a884] dark:text-teal-300 border border-emerald-200 dark:border-teal-900/60 hover:bg-emerald-100 dark:hover:bg-teal-900/50 transition-all cursor-pointer shadow-2xs"
              title="Automatically expand width to fit the longest line of code"
            >
              <Wand2 className="w-3.5 h-3.5" />
              <span>Auto-Fit Code</span>
            </button>
          </div>
        </div>

        {/* Modal Scrollable Preview Area */}
        <div className="flex-1 overflow-auto p-4 sm:p-6 bg-slate-100 dark:bg-[#0c1317]">
          {/* THE CAPTURED CONTAINER (WhatsApp Style Snapshot) */}
          <div
            ref={captureRef}
            className={`export-capture-container mx-auto rounded-2xl overflow-hidden shadow-xl border transition-all ${
              snapshotTheme === 'dark'
                ? 'bg-[#0b141a] text-slate-100 border-[#222d34] wa-wallpaper-dark dark'
                : 'bg-[#efeae2] text-slate-900 border-slate-300/80 wa-wallpaper-light'
            }`}
            style={{
              width: `${exportWidth}px`,
              minWidth: `${exportWidth}px`,
              maxWidth: `${exportWidth}px`,
            }}
          >
            {/* Snapshot Brand Header (WhatsApp Bar) */}
            <div
              className={`flex items-center justify-between px-4 sm:px-5 py-3 border-b ${
                snapshotTheme === 'dark'
                  ? 'bg-[#202c33] border-[#2a3942] text-white'
                  : 'bg-[#008069] border-[#006e59] text-white shadow-xs'
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-9 h-9 rounded-full overflow-hidden bg-white/20 p-0.5 shrink-0 flex items-center justify-center">
                  <img
                    src="/pwa-192x192.png"
                    alt="KeepChat logo"
                    className="w-full h-full object-cover rounded-full"
                  />
                </div>
                <div className="min-w-0">
                  <h3 className="text-sm font-bold truncate leading-tight text-white">
                    {chat.title}
                  </h3>
                  <p className="text-[11px] opacity-85 truncate">
                    {chat.category} · {outputs.length} {outputs.length === 1 ? 'output' : 'outputs'}
                  </p>
                </div>
              </div>

              <div className="text-right shrink-0">
                <span className="text-[11px] opacity-80 block font-medium">KeepChat Vault</span>
                <span className="text-[10px] opacity-65 block">{new Date().toLocaleDateString()}</span>
              </div>
            </div>

            {/* Snapshot Cards List */}
            <div className="p-3.5 sm:p-5 space-y-3.5">
              {sortedOutputs.map((item, idx) => {
                const ModelIcon = MODEL_ICONS[item.aiModel] || Bot;
                return (
                  <div
                    key={item.id}
                    className={`rounded-xl shadow-xs border transition-colors overflow-hidden ${
                      snapshotTheme === 'dark'
                        ? 'bg-[#202c33] border-[#26353d] text-slate-100'
                        : 'bg-white border-slate-200/90 text-slate-900'
                    }`}
                  >
                    {/* Item Header */}
                    <div
                      className={`flex items-center justify-between px-3.5 py-2 border-b text-xs ${
                        snapshotTheme === 'dark'
                          ? 'bg-[#182329]/70 border-[#26353d]'
                          : 'bg-slate-50/80 border-slate-100'
                      }`}
                    >
                      <div className="flex items-center gap-1.5 min-w-0">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-[#00a884]/15 text-[#00a884] dark:text-teal-400">
                          <ModelIcon className="w-3 h-3" />
                          <span>{item.aiModel}</span>
                        </span>
                        {item.title && (
                          <span className="font-semibold text-slate-800 dark:text-slate-200 truncate text-xs">
                            {item.title}
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-slate-400 shrink-0 tabular-nums ml-2">
                        #{idx + 1}
                      </span>
                    </div>

                    {/* Optional User Prompt */}
                    {item.userPrompt && (
                      <div
                        className={`mx-3.5 mt-2.5 p-2 rounded-lg text-xs italic border-l-2 border-[#00a884] ${
                          snapshotTheme === 'dark'
                            ? 'bg-[#111b21] text-slate-300'
                            : 'bg-slate-50 text-slate-700'
                        }`}
                      >
                        <span className="font-semibold not-italic text-[10px] uppercase text-[#00a884] block mb-0.5">
                          Prompt:
                        </span>
                        "{item.userPrompt}"
                      </div>
                    )}

                    {/* Attached Image if present */}
                    {item.mediaType === 'image' && item.mediaUrl && (
                      <div className="px-3.5 pt-3">
                        <img
                          src={item.mediaUrl}
                          alt={item.mediaName || (item.title ? `Image for ${item.title}` : 'Attached media')}
                          className="max-h-80 w-auto rounded-lg object-contain border border-slate-200 dark:border-[#2a3942]"
                        />
                      </div>
                    )}

                    {/* Card Content */}
                    <div className="p-3.5 text-xs sm:text-[13px] leading-relaxed">
                      <MarkdownRenderer content={item.content} />
                    </div>

                    {/* Card Footer */}
                    <div
                      className={`flex flex-wrap items-center justify-between gap-1.5 px-3.5 py-1.5 border-t text-[11px] ${
                        snapshotTheme === 'dark'
                          ? 'bg-[#182329]/40 border-[#26353d] text-slate-400'
                          : 'bg-slate-50/50 border-slate-100 text-slate-500'
                      }`}
                    >
                      <div className="flex flex-wrap items-center gap-1">
                        {item.tags && item.tags.length > 0 ? (
                          item.tags.map((tag, tIdx) => (
                            <span
                              key={tIdx}
                              className="inline-flex items-center gap-0.5 text-[10.5px] font-medium text-[#00a884]"
                            >
                              <Tag className="w-2.5 h-2.5 opacity-60" />
                              {tag.startsWith('#') ? tag : `#${tag}`}
                            </span>
                          ))
                        ) : (
                          <span className="text-[10px] opacity-60">AI Output</span>
                        )}
                      </div>

                      <div className="flex items-center gap-1.5 ml-auto tabular-nums">
                        <span>{formatFullDateTime(item.createdAt)}</span>
                        <CheckCheck className="w-3.5 h-3.5 text-[#53bdeb]" />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Snapshot Brand Watermark Footer */}
            <div
              className={`flex items-center justify-between px-4 py-2.5 border-t text-[11px] ${
                snapshotTheme === 'dark'
                  ? 'bg-[#182329]/90 border-[#222d34] text-slate-400'
                  : 'bg-slate-100/90 border-slate-200 text-slate-500'
              }`}
            >
              <div className="flex items-center gap-1.5 font-medium">
                <span className="w-2 h-2 rounded-full bg-[#00a884]" />
                <span>KeepChat — AI Output Vault</span>
              </div>
              <span className="text-[10px] opacity-75">100% Offline & Private</span>
            </div>
          </div>
        </div>

        {/* Modal Action Footer */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-3.5 border-t border-slate-200 dark:border-[#26353d] bg-slate-50/80 dark:bg-[#182329]/80 shrink-0">
          <span className="text-xs text-slate-500 dark:text-slate-400 hidden sm:inline">
            Exported as a 2× high-resolution PNG image
          </span>

          <div className="flex items-center gap-2.5 ml-auto">
            <button
              type="button"
              onClick={handleCopyClipboard}
              disabled={isExporting}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold border border-slate-300 dark:border-[#2a3942] bg-white dark:bg-[#111b21] text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-[#202c33] active:scale-95 transition-all cursor-pointer shadow-2xs disabled:opacity-50"
            >
              {copiedImage ? (
                <>
                  <Check className="w-4 h-4 text-[#00a884]" />
                  <span className="text-[#00a884]">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>Copy Image</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleDownload}
              disabled={isExporting}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-[#008069] to-[#00a884] hover:brightness-105 active:scale-95 transition-all cursor-pointer shadow-md shadow-[#00a884]/25 disabled:opacity-50"
            >
              <Download className="w-4 h-4" />
              <span>{isExporting ? 'Generating...' : 'Download Image'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
