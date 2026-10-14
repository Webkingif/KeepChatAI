import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Clock,
  AlertTriangle,
  CheckCircle2,
  X,
  ListTodo,
  Trash2,
  Sparkles,
} from 'lucide-react';
import { SavedOutput } from '../types/keepchat';
import {
  formatDeadlineRelative,
  formatDeadlineDateTime,
  toDateTimeLocalInputValue,
  fromDateTimeLocalInputValue,
  isDeadlineOverdue,
} from '../utils/date';

interface TaskDeadlineModalProps {
  isOpen: boolean;
  onClose: () => void;
  output: SavedOutput | null;
  onSaveTask: (outputId: string, deadline: number, taskTitle?: string) => void;
  onRemoveTask?: (outputId: string) => void;
}

export const TaskDeadlineModal: React.FC<TaskDeadlineModalProps> = ({
  isOpen,
  onClose,
  output,
  onSaveTask,
  onRemoveTask,
}) => {
  const [taskTitle, setTaskTitle] = useState('');
  const [selectedDeadline, setSelectedDeadline] = useState<number>(Date.now() + 1000 * 60 * 60 * 24);
  const [inputValue, setInputValue] = useState('');

  useEffect(() => {
    if (output) {
      const initialDeadline =
        output.taskDeadline || Date.now() + 1000 * 60 * 60 * 24; // Default to 24h from now
      setSelectedDeadline(initialDeadline);
      setInputValue(toDateTimeLocalInputValue(initialDeadline));
      setTaskTitle(output.taskTitle || output.title || output.userPrompt || '');
    }
  }, [output, isOpen]);

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

  if (!isOpen || !output) return null;

  const isOverdue = isDeadlineOverdue(selectedDeadline);
  const isExistingTask = Boolean(output.isTask);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setInputValue(val);
    const epoch = fromDateTimeLocalInputValue(val);
    setSelectedDeadline(epoch);
  };

  const setPreset = (offsetHours: number, targetHour?: number) => {
    const d = new Date();
    if (targetHour !== undefined) {
      d.setDate(d.getDate() + Math.floor(offsetHours / 24));
      d.setHours(targetHour, 0, 0, 0);
    } else {
      d.setTime(d.getTime() + offsetHours * 60 * 60 * 1000);
    }
    const epoch = d.getTime();
    setSelectedDeadline(epoch);
    setInputValue(toDateTimeLocalInputValue(epoch));
  };

  const handleSave = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    onSaveTask(output.id, selectedDeadline, taskTitle.trim() || undefined);
    onClose();
  };

  const handleRemove = () => {
    if (onRemoveTask) {
      onRemoveTask(output.id);
    }
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="deadline-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md bg-white dark:bg-[#0c131c] rounded-2xl shadow-2xl border border-slate-200 dark:border-cyan-500/25 overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 dark:border-cyan-500/20 bg-slate-50 dark:bg-[#070b10]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/10 dark:bg-cyan-500/15 text-cyan-600 dark:text-cyan-400 flex items-center justify-center border border-cyan-500/30">
              <ListTodo className="w-4 h-4" aria-hidden="true" />
            </div>
            <div>
              <h2
                id="deadline-modal-title"
                className="text-base font-semibold text-slate-900 dark:text-white leading-tight font-mono tracking-tight"
              >
                {isExistingTask ? 'Recalibrate Task Deadline' : 'Turn into Task'}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                Set target telemetry completion threshold
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-[#111c2a] transition-colors cursor-pointer focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:outline-none"
            aria-label="Close task deadline dialog"
          >
            <X className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSave} className="p-5 space-y-4 overflow-y-auto">
          {/* Task Title Field */}
          <div>
            <label htmlFor="task-deadline-title-input" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 font-mono">
              Task Title (Optional)
            </label>
            <input
              id="task-deadline-title-input"
              type="text"
              value={taskTitle}
              onChange={(e) => setTaskTitle(e.target.value)}
              placeholder="e.g. Review code architecture or finalize response..."
              className="w-full text-sm px-3.5 py-2.5 rounded-lg border border-slate-300 dark:border-slate-800 bg-slate-50/50 dark:bg-[#070b10] text-slate-900 dark:text-slate-100 placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 font-mono"
            />
          </div>

          {/* Quick Presets */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 font-mono">
              Quick Presets
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 font-mono text-xs">
              <button
                type="button"
                onClick={() => setPreset(0, 18)}
                className="px-2.5 py-1.5 rounded-lg text-xs font-medium border border-slate-200 dark:border-slate-800 bg-slate-50 hover:bg-slate-100 dark:bg-[#070b10] dark:hover:bg-cyan-950/40 hover:border-cyan-500/40 text-slate-700 dark:text-slate-300 text-left transition-colors cursor-pointer focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:outline-none"
              >
                Today 6:00 PM
              </button>
              <button
                type="button"
                onClick={() => setPreset(24, 9)}
                className="px-2.5 py-1.5 rounded-lg text-xs font-medium border border-slate-200 dark:border-slate-800 bg-slate-50 hover:bg-slate-100 dark:bg-[#070b10] dark:hover:bg-cyan-950/40 hover:border-cyan-500/40 text-slate-700 dark:text-slate-300 text-left transition-colors cursor-pointer focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:outline-none"
              >
                Tomorrow 9:00 AM
              </button>
              <button
                type="button"
                onClick={() => setPreset(48, 17)}
                className="px-2.5 py-1.5 rounded-lg text-xs font-medium border border-slate-200 dark:border-slate-800 bg-slate-50 hover:bg-slate-100 dark:bg-[#070b10] dark:hover:bg-cyan-950/40 hover:border-cyan-500/40 text-slate-700 dark:text-slate-300 text-left transition-colors cursor-pointer focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:outline-none"
              >
                In 2 Days
              </button>
              <button
                type="button"
                onClick={() => setPreset(24 * 7, 17)}
                className="px-2.5 py-1.5 rounded-lg text-xs font-medium border border-slate-200 dark:border-slate-800 bg-slate-50 hover:bg-slate-100 dark:bg-[#070b10] dark:hover:bg-cyan-950/40 hover:border-cyan-500/40 text-slate-700 dark:text-slate-300 text-left transition-colors cursor-pointer focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:outline-none"
              >
                In 1 Week
              </button>
              <button
                type="button"
                onClick={() => setPreset(2)}
                className="px-2.5 py-1.5 rounded-lg text-xs font-medium border border-slate-200 dark:border-slate-800 bg-slate-50 hover:bg-slate-100 dark:bg-[#070b10] dark:hover:bg-cyan-950/40 hover:border-cyan-500/40 text-slate-700 dark:text-slate-300 text-left transition-colors cursor-pointer focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:outline-none"
              >
                In 2 Hours
              </button>
              <button
                type="button"
                onClick={() => setPreset(-24)}
                className="px-2.5 py-1.5 rounded-lg text-xs font-medium border border-rose-200 dark:border-rose-900/60 bg-rose-50/70 hover:bg-rose-100 dark:bg-rose-950/20 text-rose-700 dark:text-rose-300 text-left transition-colors cursor-pointer focus-visible:ring-2 focus-visible:ring-rose-500 focus-visible:outline-none"
                title="Set an overdue deadline for testing"
              >
                Yesterday (Alert)
              </button>
            </div>
          </div>

          {/* Custom Date & Time Picker */}
          <div>
            <label htmlFor="task-deadline-custom-input" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center justify-between font-mono">
              <span>Date & Time</span>
              <span className="text-[11px] font-normal text-slate-500 dark:text-slate-400">
                Changeable anytime
              </span>
            </label>
            <div className="relative">
              <input
                id="task-deadline-custom-input"
                type="datetime-local"
                value={inputValue}
                onChange={handleInputChange}
                required
                className="w-full text-sm px-3.5 py-2.5 rounded-lg border border-slate-300 dark:border-slate-800 bg-white dark:bg-[#070b10] text-slate-900 dark:text-slate-100 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 font-mono cursor-pointer"
              />
            </div>
          </div>

          {/* Visual Status Indicator Banner */}
          <div
            className={`p-3 rounded-xl border flex items-start gap-2.5 transition-colors font-mono ${
              isOverdue
                ? 'bg-rose-50 dark:bg-rose-950/30 border-rose-200 dark:border-rose-900/50 text-rose-900 dark:text-rose-200'
                : 'bg-cyan-50/70 dark:bg-cyan-950/30 border-cyan-200 dark:border-cyan-900/50 text-cyan-900 dark:text-cyan-200'
            }`}
          >
            {isOverdue ? (
              <AlertTriangle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
            ) : (
              <CheckCircle2 className="w-4 h-4 text-cyan-600 dark:text-cyan-400 shrink-0 mt-0.5" />
            )}
            <div className="text-xs">
              <div className="font-semibold flex items-center gap-1.5">
                <span>{isOverdue ? 'Overdue Deadline' : 'Upcoming Target'}</span>
                <span className="text-[11px] font-normal opacity-80">· {formatDeadlineRelative(selectedDeadline)}</span>
              </div>
              <p className="text-[11px] opacity-75 mt-0.5 tabular-nums">
                {formatDeadlineDateTime(selectedDeadline)}
              </p>
            </div>
          </div>

          {/* Action Footer */}
          <div className="flex items-center justify-between pt-2 font-mono">
            {isExistingTask ? (
              <button
                type="button"
                onClick={handleRemove}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-lg transition-colors cursor-pointer"
                title="Remove task status (keeps output in chat)"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Task</span>
              </button>
            ) : (
              <div />
            )}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3.5 py-2 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#111c2a] rounded-lg transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-xs font-semibold text-white bg-cyan-600 hover:bg-cyan-500 rounded-lg shadow-sm transition-all cursor-pointer flex items-center gap-1.5 hover:shadow-[0_0_12px_rgba(6,182,212,0.3)]"
              >
                <Calendar className="w-3.5 h-3.5" />
                <span>{isExistingTask ? 'Update Target' : 'Save Task'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
