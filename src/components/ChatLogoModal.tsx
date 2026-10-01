import React, { useState } from 'react';
import {
  X,
  Download,
  ZoomIn,
  ZoomOut,
  Camera,
  RotateCcw,
  Sparkles,
  Code,
  Database,
  Brain,
  Terminal,
  FileText,
} from 'lucide-react';
import { ChatThread } from '../types/keepchat';

interface ChatLogoModalProps {
  chat: ChatThread | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdateChatAvatar: (chatId: string, avatarUrl?: string) => void;
}

const ICON_MAP: Record<string, React.ElementType> = {
  code: Code,
  sparkles: Sparkles,
  database: Database,
  brain: Brain,
  terminal: Terminal,
  'file-text': FileText,
};

export const ChatLogoModal: React.FC<ChatLogoModalProps> = ({
  chat,
  isOpen,
  onClose,
  onUpdateChatAvatar,
}) => {
  const [scale, setScale] = useState(1);

  if (!isOpen || !chat) return null;

  const IconCmp = (chat.iconName && ICON_MAP[chat.iconName]) || Sparkles;

  const handleZoomIn = (e: React.MouseEvent) => {
    e.stopPropagation();
    setScale((prev) => Math.min(prev + 0.3, 3));
  };

  const handleZoomOut = (e: React.MouseEvent) => {
    e.stopPropagation();
    setScale((prev) => Math.max(prev - 0.3, 0.6));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputElement = e.target;
    const file = inputElement.files?.[0];
    if (!file) return;

    // Verify MIME or file extension
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
        onUpdateChatAvatar(chat.id, dataUrl);
        setScale(1);
      }
      inputElement.value = '';
    };

    reader.onerror = (err) => {
      console.error('Error reading image file:', err);
      inputElement.value = '';
    };

    reader.readAsDataURL(file);
  };

  const handleResetToDefault = (e: React.MouseEvent) => {
    e.stopPropagation();
    onUpdateChatAvatar(chat.id, undefined);
    setScale(1);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/92 backdrop-blur-md p-4 animate-in fade-in duration-200 select-none"
      onClick={onClose}
    >
      {/* Top Navigation & Action Toolbar */}
      <div
        className="w-full max-w-4xl flex items-center justify-between py-3 px-4 text-white z-10"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="min-w-0 pr-3">
          <h2 className="text-sm md:text-base font-semibold text-white truncate">
            {chat.title}
          </h2>
          <p className="text-xs text-slate-400">
            {chat.category} • {chat.defaultAiModel}
          </p>
        </div>

        {/* Toolbar Controls */}
        <div className="flex items-center gap-1 sm:gap-2">
          {chat.customAvatarUrl && (
            <>
              <button
                type="button"
                onClick={handleZoomIn}
                className="p-2 rounded-full hover:bg-white/10 text-slate-300 hover:text-white transition-colors cursor-pointer"
                title="Zoom In"
              >
                <ZoomIn className="w-5 h-5" />
              </button>
              <button
                type="button"
                onClick={handleZoomOut}
                className="p-2 rounded-full hover:bg-white/10 text-slate-300 hover:text-white transition-colors cursor-pointer"
                title="Zoom Out"
              >
                <ZoomOut className="w-5 h-5" />
              </button>
              <a
                href={chat.customAvatarUrl}
                download={`${chat.title.toLowerCase().replace(/\s+/g, '-')}-logo.png`}
                className="p-2 rounded-full hover:bg-white/10 text-slate-300 hover:text-white transition-colors cursor-pointer"
                title="Download Photo"
              >
                <Download className="w-5 h-5" />
              </a>
            </>
          )}

          {/* Change Photo Toolbar Action (Native Label Activation) */}
          <label
            className="p-2 rounded-full hover:bg-white/10 text-slate-300 hover:text-white transition-colors cursor-pointer relative"
            title="Change Chat Photo"
          >
            <Camera className="w-5 h-5" />
            <input
              type="file"
              accept="image/*"
              className="sr-only"
              onChange={handleFileChange}
            />
          </label>

          {/* Reset to Default Icon Button */}
          {chat.customAvatarUrl && (
            <button
              type="button"
              onClick={handleResetToDefault}
              className="p-2 rounded-full hover:bg-white/10 text-slate-300 hover:text-rose-400 transition-colors cursor-pointer"
              title="Reset to default icon"
            >
              <RotateCcw className="w-5 h-5" />
            </button>
          )}

          {/* Close Lightbox */}
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-full hover:bg-white/10 text-slate-300 hover:text-white transition-colors cursor-pointer ml-1"
            title="Close (Esc)"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Main Center Stage */}
      <div
        className="flex-1 flex items-center justify-center w-full max-w-4xl overflow-hidden p-4"
        onClick={(e) => e.stopPropagation()}
      >
        {chat.customAvatarUrl ? (
          /* Full Image View */
          <div className="relative max-h-[80vh] max-w-full flex items-center justify-center">
            <img
              src={chat.customAvatarUrl}
              alt={chat.title}
              className="max-h-[75vh] max-w-full object-contain rounded-2xl shadow-2xl transition-transform duration-200"
              style={{ transform: `scale(${scale})` }}
            />
          </div>
        ) : (
          /* Default Avatar Enlarged Profile Card */
          <div className="flex flex-col items-center justify-center p-8 sm:p-12 rounded-3xl bg-[#182229]/80 border border-slate-700/60 shadow-2xl max-w-md w-full text-center space-y-6 animate-in zoom-in-95 duration-200">
            <div
              className={`w-36 h-36 sm:w-44 sm:h-44 rounded-full bg-gradient-to-br ${
                chat.avatarColor || 'from-emerald-500 to-teal-700'
              } flex items-center justify-center text-white shadow-xl`}
            >
              <IconCmp className="w-20 h-20 sm:w-24 sm:h-24 stroke-[2.2]" />
            </div>

            <div className="space-y-1.5">
              <h3 className="text-xl font-bold text-white">{chat.title}</h3>
              <p className="text-sm text-slate-400">
                {chat.description || `${chat.category} thread default icon`}
              </p>
            </div>

            {/* Direct Native Green Upload Button */}
            <label className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#00a884] hover:bg-[#008069] text-white text-sm font-semibold shadow-md transition-all active:scale-95 cursor-pointer">
              <Camera className="w-4 h-4" />
              <span>Upload Custom Logo Image</span>
              <input
                type="file"
                accept="image/*"
                className="sr-only"
                onChange={handleFileChange}
              />
            </label>
          </div>
        )}
      </div>

      {/* Bottom info pill */}
      <div
        className="py-2 px-4 rounded-full bg-white/10 text-slate-300 text-xs text-center backdrop-blur-xs z-10"
        onClick={(e) => e.stopPropagation()}
      >
        <span>
          {chat.customAvatarUrl
            ? 'Custom chat logo • Tap camera icon to change'
            : 'Default chat icon • Tap upload to set a custom photo'}
        </span>
      </div>
    </div>
  );
};
