import React from 'react';
import { Trash2, AlertTriangle, X } from 'lucide-react';

interface ConfirmBulkDeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  count: number;
}

export const ConfirmBulkDeleteModal: React.FC<ConfirmBulkDeleteModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  count,
}) => {
  if (!isOpen || count <= 0) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="bulk-delete-title"
      className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150"
    >
      <div className="bg-white dark:bg-[#1f2c34] rounded-2xl max-w-sm w-full p-5 sm:p-6 shadow-2xl border border-slate-200 dark:border-[#2a3942] animate-in zoom-in-95 duration-150 flex flex-col">
        {/* Modal Header Icon */}
        <div className="flex items-center justify-between mb-4">
          <div className="w-12 h-12 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 flex items-center justify-center border border-rose-200 dark:border-rose-900/50">
            <Trash2 className="w-6 h-6" />
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-[#2a3942] transition-colors cursor-pointer"
            title="Cancel"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Title & Message */}
        <h3
          id="bulk-delete-title"
          className="text-base sm:text-lg font-bold text-slate-900 dark:text-white leading-snug mb-2"
        >
          Delete {count} Output{count === 1 ? '' : 's'}?
        </h3>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-300 mb-6 leading-relaxed">
          Are you sure you want to delete {count === 1 ? 'this' : 'these'}{' '}
          <strong className="font-semibold text-slate-800 dark:text-slate-100">
            {count} selected output{count === 1 ? '' : 's'}
          </strong>{' '}
          from this chat? This action cannot be undone.
        </p>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-2.5 mt-auto">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#2a3942] transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold text-white bg-rose-600 hover:bg-rose-700 active:scale-95 transition-all cursor-pointer shadow-md shadow-rose-900/20"
          >
            <Trash2 className="w-4 h-4" />
            <span>Delete {count === 1 ? 'Output' : `${count} Outputs`}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
