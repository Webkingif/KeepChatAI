import React, { useState, useEffect, useRef } from 'react';
import {
  Copy,
  Check,
  Star,
  Trash2,
  CheckCheck,
  Sparkles,
  Bot,
  Brain,
  Cpu,
  MessageSquare,
  Tag,
  Download,
  Maximize2,
  Image as ImageIcon,
  Mic,
  Pencil,
  X,
  Save,
  Plus,
} from 'lucide-react';
import { SavedOutput, AIModelType } from '../types/keepchat';
import { MarkdownRenderer } from './MarkdownRenderer';
import { AudioPlayer } from './AudioPlayer';
import { ImageViewerModal } from './ImageViewerModal';
import { formatWhatsAppTime, formatFullDateTime } from '../utils/date';

interface OutputCardProps {
  output: SavedOutput;
  onDelete: (id: string) => void;
  onToggleStar: (id: string) => void;
  onEditOutput?: (
    id: string,
    updates: { content: string; title?: string; aiModel?: AIModelType; tags?: string[] }
  ) => void;
  onUpdateTags?: (id: string, tags: string[]) => void;
  onTagClick?: (tag: string) => void;
}

const AVAILABLE_MODELS: AIModelType[] = ['ChatGPT', 'Gemini', 'Claude', 'DeepSeek', 'Other'];

export const OutputCard: React.FC<OutputCardProps> = ({
  output,
  onDelete,
  onToggleStar,
  onEditOutput,
  onUpdateTags,
  onTagClick,
}) => {
  const [copied, setCopied] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [isViewingImage, setIsViewingImage] = useState(false);

  // Inline editing state
  const [isEditing, setIsEditing] = useState(false);
  const [draftContent, setDraftContent] = useState(output.content);
  const [draftTitle, setDraftTitle] = useState(output.title || '');
  const [draftModel, setDraftModel] = useState<AIModelType>(output.aiModel);
  const [draftTags, setDraftTags] = useState<string[]>(output.tags || []);
  const [draftTagInput, setDraftTagInput] = useState('');

  // Inline quick tag adding on card footer
  const [isAddingTag, setIsAddingTag] = useState(false);
  const [newTagInput, setNewTagInput] = useState('');
  const newTagInputRef = useRef<HTMLInputElement>(null);

  // Sync draft states whenever output changes
  useEffect(() => {
    setDraftContent(output.content);
    setDraftTitle(output.title || '');
    setDraftModel(output.aiModel);
    setDraftTags(output.tags || []);
  }, [output.content, output.title, output.aiModel, output.tags]);

  const handleStartEdit = () => {
    setDraftContent(output.content);
    setDraftTitle(output.title || '');
    setDraftModel(output.aiModel);
    setDraftTags(output.tags || []);
    setDraftTagInput('');
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setDraftContent(output.content);
    setDraftTitle(output.title || '');
    setDraftModel(output.aiModel);
    setDraftTags(output.tags || []);
    setDraftTagInput('');
  };

  const handleSaveEdit = () => {
    if (!draftContent.trim() && !output.mediaUrl) return;

    let finalTags = [...draftTags];
    if (draftTagInput.trim()) {
      const clean = draftTagInput.replace(/^#+/, '').trim().toLowerCase();
      if (clean && !finalTags.includes(clean)) {
        finalTags.push(clean);
      }
    }

    onEditOutput?.(output.id, {
      content: draftContent,
      title: draftTitle.trim() || undefined,
      aiModel: draftModel,
      tags: finalTags,
    });
    setDraftTagInput('');
    setIsEditing(false);
  };

  const handleAddNewTag = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const clean = newTagInput.replace(/^#+/, '').trim().toLowerCase();
    if (clean) {
      const current = output.tags || [];
      if (!current.includes(clean)) {
        const nextTags = [...current, clean];
        if (onUpdateTags) {
          onUpdateTags(output.id, nextTags);
        } else if (onEditOutput) {
          onEditOutput(output.id, {
            content: output.content,
            title: output.title,
            aiModel: output.aiModel,
            tags: nextTags,
          });
        }
      }
    }
    setNewTagInput('');
    setIsAddingTag(false);
  };

  const handleRemoveTag = (tagToRemove: string) => {
    const current = output.tags || [];
    const nextTags = current.filter((t) => t !== tagToRemove);
    if (onUpdateTags) {
      onUpdateTags(output.id, nextTags);
    } else if (onEditOutput) {
      onEditOutput(output.id, {
        content: output.content,
        title: output.title,
        aiModel: output.aiModel,
        tags: nextTags,
      });
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      handleCancelEdit();
    } else if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      handleSaveEdit();
    }
  };

  const handleCopyFull = async () => {
    try {
      await navigator.clipboard.writeText(output.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const textarea = document.createElement('textarea');
      textarea.value = output.content;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const getModelBadge = (model: AIModelType) => {
    switch (model) {
      case 'Gemini':
        return {
          icon: Sparkles,
          color:
            'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-900/50',
          label: 'Gemini',
        };
      case 'ChatGPT':
        return {
          icon: Bot,
          color:
            'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-900/50',
          label: 'ChatGPT',
        };
      case 'Claude':
        return {
          icon: Brain,
          color:
            'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-900/50',
          label: 'Claude',
        };
      case 'DeepSeek':
        return {
          icon: Cpu,
          color:
            'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 border-indigo-200 dark:border-indigo-900/50',
          label: 'DeepSeek',
        };
      default:
        return {
          icon: MessageSquare,
          color:
            'text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700',
          label: model,
        };
    }
  };

  const modelBadge = getModelBadge(output.aiModel);
  const ModelIcon = modelBadge.icon;

  const isImage = output.mediaType === 'image' && Boolean(output.mediaUrl);
  const isAudio = output.mediaType === 'audio' && Boolean(output.mediaUrl);

  return (
    <>
      <div
        className={`group relative w-full my-4 rounded-xl border transition-all duration-200 overflow-hidden ${
          isEditing
            ? 'border-[#00a884] ring-2 ring-[#00a884]/20 bg-white dark:bg-[#1f2c34] shadow-md'
            : 'border-slate-200/80 dark:border-[#26353d] bg-white dark:bg-[#1f2c34] shadow-xs hover:shadow-md'
        }`}
        onKeyDown={isEditing ? handleKeyDown : undefined}
      >
        {/* Top Header Strip */}
        <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-2.5 bg-slate-50/80 dark:bg-[#182329]/80 border-b border-slate-200/70 dark:border-[#26353d]">
          <div className="flex items-center gap-2.5 min-w-0">
            {/* AI Model Tag */}
            <div
              className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md border text-xs font-medium ${modelBadge.color}`}
            >
              <ModelIcon className="w-3.5 h-3.5 shrink-0" />
              <span>{modelBadge.label}</span>
            </div>

            {/* Media Type Icon Badge */}
            {isImage && (
              <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-600 dark:text-teal-400 bg-emerald-50 dark:bg-teal-950/30 px-2 py-0.5 rounded-md border border-emerald-200 dark:border-teal-900/40">
                <ImageIcon className="w-3 h-3" />
                Image
              </span>
            )}

            {isAudio && (
              <span className="inline-flex items-center gap-1 text-[11px] font-medium text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/30 px-2 py-0.5 rounded-md border border-teal-200 dark:border-teal-900/40">
                <Mic className="w-3 h-3" />
                Voice Note
              </span>
            )}

            {/* Title if present (hidden if editing, since it appears inside the editor) */}
            {!isEditing && output.title && (
              <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200 truncate max-w-xs md:max-w-md">
                {output.title}
              </h3>
            )}

            {isEditing && (
              <span className="text-xs font-semibold text-[#00a884] dark:text-[#25d366]">
                Editing Output
              </span>
            )}
          </div>

          {/* Action Controls */}
          <div className="flex items-center gap-1 shrink-0 ml-auto">
            {!isEditing ? (
              <>
                {/* Edit Output Button */}
                {onEditOutput && (
                  <button
                    onClick={handleStartEdit}
                    className="flex items-center gap-1 px-2 py-1 rounded text-xs text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-[#2a3942] transition-colors cursor-pointer"
                    title="Edit output indefinitely"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Edit</span>
                  </button>
                )}

                {/* Copy Full Output (Text or Caption) */}
                <button
                  onClick={handleCopyFull}
                  className="flex items-center gap-1 px-2 py-1 rounded text-xs text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-[#2a3942] transition-colors cursor-pointer"
                  title="Copy output text"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-teal-400" />
                      <span className="text-emerald-600 dark:text-teal-400 font-medium">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Copy</span>
                    </>
                  )}
                </button>

                {/* Star / Bookmark */}
                <button
                  onClick={() => onToggleStar(output.id)}
                  className={`p-1.5 rounded transition-colors cursor-pointer ${
                    output.isStarred
                      ? 'text-amber-500 hover:text-amber-600 bg-amber-50 dark:bg-amber-950/30'
                      : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-[#2a3942]'
                  }`}
                  title={output.isStarred ? 'Remove Star' : 'Star Output'}
                >
                  <Star className={`w-4 h-4 ${output.isStarred ? 'fill-amber-500' : ''}`} />
                </button>

                {/* Delete Button */}
                {showConfirmDelete ? (
                  <div className="flex items-center gap-1 pl-1">
                    <button
                      onClick={() => onDelete(output.id)}
                      className="px-2 py-0.5 text-xs font-medium text-white bg-rose-600 hover:bg-rose-700 rounded transition-colors cursor-pointer"
                    >
                      Confirm
                    </button>
                    <button
                      onClick={() => setShowConfirmDelete(false)}
                      className="px-2 py-0.5 text-xs text-slate-600 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-[#2a3942] rounded transition-colors cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setShowConfirmDelete(true)}
                    className="p-1.5 rounded text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors cursor-pointer"
                    title="Delete output"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </>
            ) : (
              /* Inline Edit Actions in Header */
              <div className="flex items-center gap-1.5">
                <button
                  onClick={handleCancelEdit}
                  className="px-2.5 py-1 text-xs text-slate-600 dark:text-slate-300 hover:bg-slate-200/70 dark:hover:bg-[#2a3942] rounded-md transition-colors cursor-pointer"
                  title="Discard changes (Esc)"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveEdit}
                  className="inline-flex items-center gap-1 px-3 py-1 text-xs font-semibold text-white bg-[#00a884] hover:bg-[#008069] rounded-md transition-colors shadow-2xs cursor-pointer"
                  title="Save revisions (Ctrl+Enter)"
                >
                  <Check className="w-3.5 h-3.5" />
                  Save
                </button>
              </div>
            )}
          </div>
        </div>

        {/* User Prompt (if provided and not editing) */}
        {!isEditing && output.userPrompt && (
          <div className="mx-4 mt-3 p-3 rounded-lg bg-slate-50 dark:bg-[#162127] border-l-3 border-[#00a884] text-xs leading-relaxed text-slate-600 dark:text-slate-300">
            <span className="font-semibold text-slate-800 dark:text-slate-200 uppercase tracking-wide mr-1.5">
              Prompt:
            </span>
            {output.userPrompt}
          </div>
        )}

        {/* Media Preview or Main Markdown Content OR Inline Editor */}
        <div className="p-4 md:p-5 space-y-3">
          {/* Uploaded Image Card */}
          {isImage && (
            <div className="relative group/img rounded-xl overflow-hidden border border-slate-200/80 dark:border-[#26353d] bg-slate-900/5 dark:bg-black/20 max-w-2xl">
              <img
                src={output.mediaUrl}
                alt={output.mediaName || output.title || 'Uploaded media'}
                className="w-full max-h-[460px] object-contain rounded-xl cursor-zoom-in transition-transform duration-200 hover:scale-[1.01]"
                onClick={() => setIsViewingImage(true)}
              />
              <div className="absolute top-2.5 right-2.5 flex items-center gap-1.5 opacity-90 sm:opacity-0 sm:group-hover/img:opacity-100 transition-opacity">
                <button
                  type="button"
                  onClick={() => setIsViewingImage(true)}
                  className="p-1.5 rounded-lg bg-black/60 text-white hover:bg-black/80 backdrop-blur-xs transition-colors cursor-pointer"
                  title="Full screen preview"
                >
                  <Maximize2 className="w-4 h-4" />
                </button>
                <a
                  href={output.mediaUrl}
                  download={output.mediaName || 'keepchat-image.png'}
                  className="p-1.5 rounded-lg bg-black/60 text-white hover:bg-black/80 backdrop-blur-xs transition-colors"
                  title="Download image"
                >
                  <Download className="w-4 h-4" />
                </a>
              </div>
            </div>
          )}

          {/* Voice Note Audio Player */}
          {isAudio && output.mediaUrl && (
            <AudioPlayer
              src={output.mediaUrl}
              duration={output.audioDuration}
              fileName={output.mediaName}
            />
          )}

          {/* Regular Markdown Display Mode */}
          {!isEditing ? (
            output.content &&
            output.content !== 'Image attachment' &&
            output.content !== 'Voice note message' && (
              <div className="pt-1">
                <MarkdownRenderer content={output.content} />
              </div>
            )
          ) : (
            /* Inline Editor Workspace */
            <div className="space-y-3.5 pt-1 animate-in fade-in duration-150">
              {/* Row 1: Model Selector & Prompt Title */}
              <div className="flex flex-col sm:flex-row gap-3">
                {/* AI Model Tag Selector */}
                <div className="sm:w-48 shrink-0">
                  <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                    AI Model Tag
                  </label>
                  <select
                    value={draftModel}
                    onChange={(e) => setDraftModel(e.target.value as AIModelType)}
                    className="w-full text-xs py-2 px-3 rounded-lg border border-slate-200 dark:border-[#2a3942] bg-white dark:bg-[#111b21] text-slate-800 dark:text-slate-200 focus:outline-none focus:border-[#00a884] focus:ring-1 focus:ring-[#00a884] cursor-pointer"
                  >
                    {AVAILABLE_MODELS.map((m) => (
                      <option key={m} value={m}>
                        {m}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Prompt Title Field */}
                <div className="flex-1 min-w-0">
                  <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                    Prompt Title (Optional)
                  </label>
                  <input
                    type="text"
                    value={draftTitle}
                    onChange={(e) => setDraftTitle(e.target.value)}
                    placeholder="e.g. Distributed cache system design..."
                    className="w-full text-xs py-2 px-3 rounded-lg border border-slate-200 dark:border-[#2a3942] bg-white dark:bg-[#111b21] text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:border-[#00a884] focus:ring-1 focus:ring-[#00a884]"
                  />
                </div>
              </div>

              {/* Row 2: Markdown Content Textarea */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                  Output Content (Markdown Supported)
                </label>
                <textarea
                  value={draftContent}
                  onChange={(e) => setDraftContent(e.target.value)}
                  rows={8}
                  placeholder="Enter or revise markdown output..."
                  className="w-full font-mono text-xs sm:text-sm p-3.5 rounded-lg border border-slate-200 dark:border-[#2a3942] bg-slate-50/70 dark:bg-[#111b21] text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:border-[#00a884] focus:ring-1 focus:ring-[#00a884] resize-y leading-relaxed"
                />
              </div>

              {/* Row 3: Tags Editor */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                  Tags (Press Enter or comma to add)
                </label>
                <div className="flex flex-wrap items-center gap-1.5 p-2 rounded-lg border border-slate-200 dark:border-[#2a3942] bg-white dark:bg-[#111b21] min-h-[38px] focus-within:border-[#00a884] focus-within:ring-1 focus-within:ring-[#00a884]">
                  {draftTags.map((tag, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 dark:bg-[#202c33] text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-[#2a3942]"
                    >
                      <Tag className="w-2.5 h-2.5 text-[#00a884]" />
                      <span>#{tag}</span>
                      <button
                        type="button"
                        onClick={() => setDraftTags(draftTags.filter((_, i) => i !== idx))}
                        className="hover:text-rose-500 cursor-pointer ml-0.5 p-0.5 rounded-full"
                        title={`Remove #${tag}`}
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                  <input
                    type="text"
                    placeholder={draftTags.length === 0 ? 'Type tag and press Enter or comma...' : 'Add another tag...'}
                    value={draftTagInput}
                    onChange={(e) => setDraftTagInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ',') {
                        e.preventDefault();
                        const val = draftTagInput.replace(/^#+/, '').trim().toLowerCase();
                        if (val && !draftTags.includes(val)) {
                          setDraftTags([...draftTags, val]);
                        }
                        setDraftTagInput('');
                      }
                    }}
                    className="flex-1 min-w-[120px] text-xs bg-transparent text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none py-0.5"
                  />
                </div>
              </div>

              {/* Row 4: Helper & Quick Action Buttons */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-slate-100 dark:border-[#26353d]/50">
                <span className="text-[11px] text-slate-400 dark:text-slate-500">
                  Tip: Press <kbd className="px-1.5 py-0.5 bg-slate-200 dark:bg-[#2a3942] rounded text-[10px]">Ctrl+Enter</kbd> to save, <kbd className="px-1.5 py-0.5 bg-slate-200 dark:bg-[#2a3942] rounded text-[10px]">Esc</kbd> to cancel
                </span>
                <div className="flex items-center gap-2 ml-auto">
                  <button
                    type="button"
                    onClick={handleCancelEdit}
                    className="px-3.5 py-1.5 rounded-lg text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-[#2a3942] transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveEdit}
                    className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-semibold text-white bg-[#00a884] hover:bg-[#008069] transition-all shadow-xs active:scale-95 cursor-pointer"
                  >
                    <Save className="w-3.5 h-3.5" />
                    Save Changes
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Card Footer */}
        <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-2 bg-slate-50/50 dark:bg-[#182329]/40 border-t border-slate-100 dark:border-[#26353d]/60 rounded-b-xl text-xs text-slate-500 dark:text-slate-400">
          {/* Interactive Tags */}
          <div className="flex flex-wrap items-center gap-1.5 min-w-0">
            {output.tags && output.tags.length > 0 &&
              output.tags.map((tag, idx) => (
                <div
                  key={idx}
                  className="group/tag inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full bg-slate-100 dark:bg-[#202c33] text-slate-700 dark:text-slate-300 border border-slate-200/70 dark:border-[#2a3942] hover:border-[#00a884]/60 dark:hover:border-[#00a884]/60 transition-colors"
                >
                  <button
                    type="button"
                    onClick={() => onTagClick?.(tag)}
                    className="inline-flex items-center gap-1 hover:text-[#00a884] dark:hover:text-[#00a884] cursor-pointer"
                    title={`Filter chat by #${tag}`}
                  >
                    <Tag className="w-2.5 h-2.5 text-[#00a884]" />
                    <span>#{tag}</span>
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveTag(tag);
                    }}
                    className="opacity-0 group-hover/tag:opacity-100 hover:text-rose-500 transition-opacity p-0.5 -mr-1 rounded-full cursor-pointer"
                    title={`Remove #${tag}`}
                    aria-label={`Remove #${tag}`}
                  >
                    <X className="w-2.5 h-2.5" />
                  </button>
                </div>
              ))}

            {/* Quick Inline Tag Adder */}
            {isAddingTag ? (
              <form
                onSubmit={handleAddNewTag}
                className="inline-flex items-center gap-1 bg-white dark:bg-[#111b21] rounded-full border border-[#00a884] px-2 py-0.5 shadow-2xs animate-in zoom-in-95 duration-100"
              >
                <span className="text-[11px] text-[#00a884] font-semibold">#</span>
                <input
                  ref={newTagInputRef}
                  type="text"
                  value={newTagInput}
                  onChange={(e) => setNewTagInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Escape') {
                      setIsAddingTag(false);
                      setNewTagInput('');
                    }
                  }}
                  placeholder="tag"
                  className="w-16 sm:w-20 text-[11px] bg-transparent text-slate-800 dark:text-slate-200 focus:outline-none"
                />
                <button
                  type="submit"
                  className="text-[#00a884] hover:text-[#008069] p-0.5 rounded cursor-pointer"
                  title="Add tag"
                >
                  <Check className="w-3 h-3" />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsAddingTag(false);
                    setNewTagInput('');
                  }}
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 p-0.5 rounded cursor-pointer"
                  title="Cancel"
                >
                  <X className="w-3 h-3" />
                </button>
              </form>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setIsAddingTag(true);
                  setTimeout(() => newTagInputRef.current?.focus(), 50);
                }}
                className="inline-flex items-center gap-1 text-[11px] text-slate-400 dark:text-slate-500 hover:text-[#00a884] dark:hover:text-[#00a884] px-1.5 py-0.5 rounded-full hover:bg-slate-200/50 dark:hover:bg-[#202c33] transition-colors cursor-pointer"
                title="Add tag to output"
              >
                <Plus className="w-3 h-3" />
                <span>Tag</span>
              </button>
            )}
          </div>

          {/* Timestamp, Edited Badge & Double Checkmarks */}
          <div
            className="flex items-center gap-1.5 ml-auto tabular-nums"
            title={
              output.editedAt
                ? `Saved: ${formatFullDateTime(output.createdAt)} • Last Edited: ${formatFullDateTime(output.editedAt)}`
                : formatFullDateTime(output.createdAt)
            }
          >
            {output.isEdited && (
              <span
                className="text-[10px] font-medium text-slate-400 dark:text-slate-500 italic select-none"
                title={output.editedAt ? `Last edited ${formatFullDateTime(output.editedAt)}` : 'Edited'}
              >
                Edited ·
              </span>
            )}
            <span className="text-[11px]">{formatWhatsAppTime(output.createdAt)}</span>
            <span title="Saved locally in IndexedDB">
              <CheckCheck className="w-4 h-4 text-[#53bdeb] stroke-[2.5]" />
            </span>
          </div>
        </div>
      </div>

      {/* Full-screen Image Viewer Lightbox */}
      {isImage && (
        <ImageViewerModal
          src={isViewingImage ? output.mediaUrl || null : null}
          alt={output.mediaName || output.title}
          onClose={() => setIsViewingImage(false)}
        />
      )}
    </>
  );
};
