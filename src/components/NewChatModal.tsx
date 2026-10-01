import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Sparkles,
  Code,
  Database,
  Brain,
  Terminal,
  FileText,
  Check,
  Camera,
  RotateCcw,
} from 'lucide-react';
import { AIModelType, ChatThread } from '../types/keepchat';

interface NewChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    title: string;
    description: string;
    category: string;
    defaultAiModel: AIModelType;
    avatarColor: string;
    iconName: string;
    customAvatarUrl?: string;
  }) => void;
  initialData?: ChatThread | null;
}

const CATEGORIES = ['Coding', 'Prompts', 'Research', 'Architecture', 'Writing', 'General'];
const MODELS: AIModelType[] = ['ChatGPT', 'Gemini', 'Claude', 'DeepSeek', 'Other'];
const COLOR_OPTIONS = [
  'from-emerald-500 to-teal-700',
  'from-blue-500 to-indigo-700',
  'from-amber-500 to-orange-700',
  'from-purple-500 to-violet-700',
  'from-rose-500 to-pink-700',
  'from-cyan-500 to-teal-600',
];

const ICONS = [
  { name: 'code', label: 'Code', icon: Code },
  { name: 'sparkles', label: 'Sparkles', icon: Sparkles },
  { name: 'database', label: 'Database', icon: Database },
  { name: 'brain', label: 'Brain', icon: Brain },
  { name: 'terminal', label: 'Terminal', icon: Terminal },
  { name: 'file-text', label: 'Notes', icon: FileText },
];

export const NewChatModal: React.FC<NewChatModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Coding');
  const [defaultAiModel, setDefaultAiModel] = useState<AIModelType>('ChatGPT');
  const [avatarColor, setAvatarColor] = useState(COLOR_OPTIONS[0]);
  const [iconName, setIconName] = useState('code');
  const [customAvatarUrl, setCustomAvatarUrl] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title);
      setDescription(initialData.description || '');
      setCategory(initialData.category);
      setDefaultAiModel(initialData.defaultAiModel);
      setAvatarColor(initialData.avatarColor || COLOR_OPTIONS[0]);
      setIconName(initialData.iconName || 'code');
      setCustomAvatarUrl(initialData.customAvatarUrl || null);
    } else {
      setTitle('');
      setDescription('');
      setCategory('Coding');
      setDefaultAiModel('ChatGPT');
      setAvatarColor(COLOR_OPTIONS[Math.floor(Math.random() * COLOR_OPTIONS.length)]);
      setIconName('code');
      setCustomAvatarUrl(null);
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputElement = e.target;
    const file = inputElement.files?.[0];
    if (!file) return;

    const isImage =
      (file.type && file.type.startsWith('image/')) ||
      /\.(png|jpe?g|webp|gif|svg|bmp|ico|avif)$/i.test(file.name);

    if (!isImage) {
      inputElement.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (dataUrl) {
        setCustomAvatarUrl(dataUrl);
      }
      inputElement.value = '';
    };
    reader.onerror = () => {
      inputElement.value = '';
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    onSubmit({
      title: title.trim(),
      description: description.trim(),
      category,
      defaultAiModel,
      avatarColor,
      iconName,
      customAvatarUrl: customAvatarUrl || undefined,
    });
    onClose();
  };

  const selectedIconObj = ICONS.find((i) => i.name === iconName) || ICONS[0];
  const CurrentIconCmp = selectedIconObj.icon;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="relative w-full max-w-md bg-white dark:bg-[#202c33] rounded-2xl shadow-2xl border border-slate-200 dark:border-[#2a3942] overflow-hidden max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 bg-slate-50 dark:bg-[#111b21] border-b border-slate-200 dark:border-[#2a3942] shrink-0">
          <h2 className="text-base font-semibold text-slate-900 dark:text-white">
            {initialData ? 'Edit Chat Thread' : 'New Chat Thread'}
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-[#2a3942] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 overflow-y-auto flex-1">
          {/* Thread Title */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              Thread Title *
            </label>
            <input
              type="text"
              required
              autoFocus
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Next.js 15 Migrations & Auth"
              className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 dark:border-[#2a3942] bg-white dark:bg-[#111b21] text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 text-sm focus:outline-hidden focus:ring-2 focus:ring-[#00a884] focus:border-transparent transition-all"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              Description / Topic Focus
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief summary of outputs stored in this thread"
              className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 dark:border-[#2a3942] bg-white dark:bg-[#111b21] text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 text-sm focus:outline-hidden focus:ring-2 focus:ring-[#00a884] focus:border-transparent transition-all"
            />
          </div>

          {/* Chat Thread Logo / Avatar Upload */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
              Chat Thread Logo
            </label>
            <div className="flex items-center gap-3.5 p-3 rounded-xl bg-slate-50 dark:bg-[#182329] border border-slate-200/80 dark:border-[#2a3942]">
              {/* Circular Avatar Preview */}
              <div className="relative shrink-0">
                <div
                  className={`w-14 h-14 rounded-full overflow-hidden flex items-center justify-center text-white shadow-xs ${
                    customAvatarUrl
                      ? 'border-2 border-[#00a884]'
                      : `bg-gradient-to-br ${avatarColor}`
                  }`}
                >
                  {customAvatarUrl ? (
                    <img
                      src={customAvatarUrl}
                      alt="Chat Logo"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <CurrentIconCmp className="w-7 h-7 stroke-[2.2]" />
                  )}
                </div>
              </div>

              {/* Upload Controls */}
              <div className="flex-1 min-w-0 space-y-1.5">
                <div className="flex flex-wrap items-center gap-2">
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageUpload}
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white dark:bg-[#202c33] border border-slate-300 dark:border-[#2a3942] text-slate-700 dark:text-slate-200 hover:border-[#00a884] dark:hover:border-teal-400 hover:text-[#00a884] transition-colors shadow-2xs cursor-pointer"
                  >
                    <Camera className="w-3.5 h-3.5" />
                    <span>{customAvatarUrl ? 'Change Photo' : 'Upload Image'}</span>
                  </button>

                  {customAvatarUrl && (
                    <button
                      type="button"
                      onClick={() => setCustomAvatarUrl(null)}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors cursor-pointer"
                      title="Reset to default icon and color"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>Reset to Default</span>
                    </button>
                  )}
                </div>
                <p className="text-[11px] text-slate-400 dark:text-slate-500">
                  {customAvatarUrl
                    ? 'Custom logo active. Tap Reset to Default to revert back to default icon.'
                    : 'Upload a custom photo or pick a default style below.'}
                </p>
              </div>
            </div>
          </div>

          {/* Category & Primary Model */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-[#2a3942] bg-white dark:bg-[#111b21] text-slate-900 dark:text-white text-sm focus:outline-hidden focus:ring-2 focus:ring-[#00a884]"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                Primary Model
              </label>
              <select
                value={defaultAiModel}
                onChange={(e) => setDefaultAiModel(e.target.value as AIModelType)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-[#2a3942] bg-white dark:bg-[#111b21] text-slate-900 dark:text-white text-sm focus:outline-hidden focus:ring-2 focus:ring-[#00a884]"
              >
                {MODELS.map((mod) => (
                  <option key={mod} value={mod}>
                    {mod}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Color & Icon Picker (Default Style Fallback) */}
          <div className={customAvatarUrl ? 'opacity-60' : ''}>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                Default Style & Icons {customAvatarUrl ? '(Fallback)' : ''}
              </label>
            </div>

            <div className="flex items-center gap-2 mb-3">
              {COLOR_OPTIONS.map((col) => (
                <button
                  type="button"
                  key={col}
                  onClick={() => setAvatarColor(col)}
                  className={`w-7 h-7 rounded-full bg-gradient-to-br ${col} flex items-center justify-center transition-transform hover:scale-110 cursor-pointer ${
                    avatarColor === col
                      ? 'ring-2 ring-offset-2 ring-[#00a884] dark:ring-offset-[#202c33]'
                      : ''
                  }`}
                >
                  {avatarColor === col && <Check className="w-3.5 h-3.5 text-white stroke-[3]" />}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              {ICONS.map((item) => {
                const IconCmp = item.icon;
                const isSelected = iconName === item.name;
                return (
                  <button
                    type="button"
                    key={item.name}
                    onClick={() => setIconName(item.name)}
                    className={`p-2 rounded-lg border text-xs flex items-center justify-center transition-colors cursor-pointer ${
                      isSelected
                        ? 'border-[#00a884] bg-emerald-50 dark:bg-teal-950/40 text-[#00a884]'
                        : 'border-slate-200 dark:border-[#2a3942] text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-[#182229]'
                    }`}
                    title={item.label}
                  >
                    <IconCmp className="w-4 h-4" />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200 dark:border-[#2a3942]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#111b21] transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-lg text-sm font-medium text-white bg-[#00a884] hover:bg-[#008069] transition-colors shadow-xs cursor-pointer"
            >
              {initialData ? 'Save Changes' : 'Create Thread'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
