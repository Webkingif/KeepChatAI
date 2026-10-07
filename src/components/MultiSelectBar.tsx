import React from 'react';
import { CheckSquare, Square, Download, X, Camera, FileText, FileCode, Trash2 } from 'lucide-react';

interface MultiSelectBarProps {
  selectedCount: number;
  totalCount: number;
  onSelectAll: () => void;
  onDeselectAll: () => void;
  onExportSelected: () => void;
  onExportPdf?: () => void;
  onExportMarkdown?: () => void;
  onDeleteSelected?: () => void;
  onCancel: () => void;
}

export const MultiSelectBar: React.FC<MultiSelectBarProps> = ({
  selectedCount,
  totalCount,
  onSelectAll,
  onDeselectAll,
  onExportSelected,
  onExportPdf,
  onExportMarkdown,
  onDeleteSelected,
  onCancel,
}) => {
  const isAllSelected = selectedCount > 0 && selectedCount === totalCount;

  return (
    <div className="sticky top-0 z-20 px-3 sm:px-4 py-2.5 bg-[#008069] text-white shadow-md flex items-center justify-between gap-2.5 transition-all animate-in slide-in-from-top-2 duration-150">
      <div className="flex items-center gap-2.5 min-w-0">
        <button
          type="button"
          onClick={onCancel}
          className="p-1 rounded-full hover:bg-white/20 active:scale-95 transition-colors cursor-pointer"
          title="Exit selection mode"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="font-semibold text-xs sm:text-sm tracking-tight truncate">
          {selectedCount === 0
            ? 'Select outputs to export'
            : `${selectedCount} output${selectedCount === 1 ? '' : 's'} selected`}
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        {/* Toggle Select All */}
        <button
          type="button"
          onClick={isAllSelected ? onDeselectAll : onSelectAll}
          className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-white/15 hover:bg-white/25 active:scale-95 transition-all cursor-pointer"
        >
          {isAllSelected ? (
            <>
              <Square className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Deselect All</span>
            </>
          ) : (
            <>
              <CheckSquare className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Select All</span>
            </>
          )}
        </button>

        {/* Export Selected as Image */}
        <button
          type="button"
          onClick={onExportSelected}
          disabled={selectedCount === 0}
          className={`inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-semibold shadow-xs transition-all cursor-pointer ${
            selectedCount > 0
              ? 'bg-white text-[#008069] hover:bg-slate-100 active:scale-95 shadow-sm'
              : 'bg-white/20 text-white/50 cursor-not-allowed'
          }`}
          title={selectedCount === 0 ? 'Select at least one output' : 'Export selected outputs as image'}
        >
          <Camera className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Image</span>
        </button>

        {/* Export Selected as PDF */}
        <button
          type="button"
          onClick={onExportPdf}
          disabled={selectedCount === 0}
          className={`inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-semibold shadow-xs transition-all cursor-pointer ${
            selectedCount > 0
              ? 'bg-amber-400 text-slate-900 hover:bg-amber-300 active:scale-95 shadow-sm'
              : 'bg-white/20 text-white/50 cursor-not-allowed'
          }`}
          title={selectedCount === 0 ? 'Select at least one output' : 'Export selected outputs as PDF document'}
        >
          <FileText className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">PDF</span>
        </button>

        {/* Export Selected as Markdown */}
        <button
          type="button"
          onClick={onExportMarkdown}
          disabled={selectedCount === 0}
          className={`inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-semibold shadow-xs transition-all cursor-pointer ${
            selectedCount > 0
              ? 'bg-slate-900/90 text-white hover:bg-slate-900 active:scale-95 shadow-sm border border-white/20'
              : 'bg-white/20 text-white/50 cursor-not-allowed'
          }`}
          title={selectedCount === 0 ? 'Select at least one output' : 'Export selected outputs as Markdown (.md) file'}
        >
          <FileCode className="w-3.5 h-3.5 text-emerald-400" />
          <span className="hidden md:inline">Markdown</span>
        </button>

        {/* Delete Selected Outputs */}
        <button
          type="button"
          onClick={onDeleteSelected}
          disabled={selectedCount === 0}
          className={`inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-semibold shadow-xs transition-all cursor-pointer ${
            selectedCount > 0
              ? 'bg-rose-600 text-white hover:bg-rose-700 active:scale-95 shadow-sm border border-rose-400/30'
              : 'bg-white/20 text-white/50 cursor-not-allowed'
          }`}
          title={
            selectedCount === 0
              ? 'Select at least one output to delete'
              : `Delete ${selectedCount} selected output${selectedCount === 1 ? '' : 's'}`
          }
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Delete</span>
        </button>
      </div>
    </div>
  );
};
