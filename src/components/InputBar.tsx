import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  Sparkles,
  Bot,
  Brain,
  Cpu,
  MessageSquare,
  ChevronDown,
  Plus,
  X,
  Paperclip,
  Image as ImageIcon,
  Mic,
  Trash2,
  Square,
} from 'lucide-react';
import { AIModelType } from '../types/keepchat';

interface InputBarProps {
  defaultModel: AIModelType;
  onSaveOutput: (data: {
    content: string;
    title?: string;
    userPrompt?: string;
    aiModel: AIModelType;
    tags: string[];
    mediaType?: 'text' | 'image' | 'audio';
    mediaUrl?: string;
    mediaName?: string;
    mediaSize?: number;
    audioDuration?: number;
  }) => void;
  onErrorToast?: (msg: string) => void;
}

const MODELS: { type: AIModelType; label: string; icon: React.ElementType }[] = [
  { type: 'ChatGPT', label: 'ChatGPT', icon: Bot },
  { type: 'Gemini', label: 'Gemini', icon: Sparkles },
  { type: 'Claude', label: 'Claude', icon: Brain },
  { type: 'DeepSeek', label: 'DeepSeek', icon: Cpu },
  { type: 'Other', label: 'Other', icon: MessageSquare },
];

export const InputBar: React.FC<InputBarProps> = ({
  defaultModel,
  onSaveOutput,
  onErrorToast,
}) => {
  const [content, setContent] = useState('');
  const [title, setTitle] = useState('');
  const [userPrompt, setUserPrompt] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  const [aiModel, setAiModel] = useState<AIModelType>(defaultModel);
  const [showMetadata, setShowMetadata] = useState(false);

  // Attached Image state
  const [attachedImage, setAttachedImage] = useState<{
    dataUrl: string;
    name: string;
    size: number;
  } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Audio Recording state
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordingTimerRef = useRef<NodeJS.Timeout | null>(null);
  const audioStreamRef = useRef<MediaStream | null>(null);

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setAiModel(defaultModel);
  }, [defaultModel]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      const scrollHeight = textareaRef.current.scrollHeight;
      textareaRef.current.style.height = `${Math.min(scrollHeight, 180)}px`;
    }
  }, [content]);

  // Handle Image File selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      onErrorToast?.('Please select a valid image file (PNG, JPG, WebP, GIF).');
      return;
    }

    // Limit to 10MB
    if (file.size > 10 * 1024 * 1024) {
      onErrorToast?.('Image size exceeds 10MB limit.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      setAttachedImage({
        dataUrl,
        name: file.name,
        size: file.size,
      });
      if (!title) {
        setTitle(file.name.replace(/\.[^/.]+$/, ''));
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  // Start Audio Recording
  const startRecording = async () => {
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        onErrorToast?.('Audio recording is not supported in this browser.');
        return;
      }

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioStreamRef.current = stream;
      audioChunksRef.current = [];

      let mimeType = 'audio/webm';
      if (!MediaRecorder.isTypeSupported('audio/webm')) {
        if (MediaRecorder.isTypeSupported('audio/mp4')) {
          mimeType = 'audio/mp4';
        } else if (MediaRecorder.isTypeSupported('audio/ogg')) {
          mimeType = 'audio/ogg';
        } else {
          mimeType = '';
        }
      }

      const mediaRecorder = mimeType
        ? new MediaRecorder(stream, { mimeType })
        : new MediaRecorder(stream);

      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.start(200);
      setIsRecording(true);
      setRecordingSeconds(0);

      recordingTimerRef.current = setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);
    } catch (err) {
      console.error('Audio recording permission error:', err);
      onErrorToast?.('Microphone access was denied or unavailable.');
    }
  };

  // Stop and Discard Recording
  const cancelRecording = () => {
    if (recordingTimerRef.current) {
      clearInterval(recordingTimerRef.current);
      recordingTimerRef.current = null;
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    if (audioStreamRef.current) {
      audioStreamRef.current.getTracks().forEach((track) => track.stop());
      audioStreamRef.current = null;
    }
    setIsRecording(false);
    setRecordingSeconds(0);
    audioChunksRef.current = [];
  };

  // Stop Recording and Save as Voice Note
  const stopAndSaveRecording = () => {
    if (recordingTimerRef.current) {
      clearInterval(recordingTimerRef.current);
      recordingTimerRef.current = null;
    }

    const duration = recordingSeconds || 1;
    const mediaRecorder = mediaRecorderRef.current;

    if (mediaRecorder && mediaRecorder.state !== 'inactive') {
      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, {
          type: mediaRecorder.mimeType || 'audio/webm',
        });

        const reader = new FileReader();
        reader.onloadend = () => {
          const base64Audio = reader.result as string;

          onSaveOutput({
            content: content.trim() || 'Voice note message',
            title: title.trim() || `Voice Note (${formatRecordingTime(duration)})`,
            userPrompt: userPrompt.trim() || undefined,
            aiModel,
            tags: ['VoiceNote', ...parseTags(tagsInput)],
            mediaType: 'audio',
            mediaUrl: base64Audio,
            mediaName: `voice-note-${Date.now()}.webm`,
            mediaSize: audioBlob.size,
            audioDuration: duration,
          });

          // Reset inputs
          setContent('');
          setTitle('');
          setUserPrompt('');
          setTagsInput('');
          setShowMetadata(false);
        };
        reader.readAsDataURL(audioBlob);

        // Stop media tracks
        if (audioStreamRef.current) {
          audioStreamRef.current.getTracks().forEach((t) => t.stop());
          audioStreamRef.current = null;
        }
      };

      mediaRecorder.stop();
    }

    setIsRecording(false);
    setRecordingSeconds(0);
  };

  const parseTags = (input: string) => {
    return input
      .split(/[, ]+/)
      .map((t) => t.trim().replace(/^#/, ''))
      .filter((t) => t.length > 0);
  };

  const handleSend = () => {
    if (!content.trim() && !attachedImage) return;

    const tags = parseTags(tagsInput);

    let finalTitle = title.trim();
    if (!finalTitle) {
      if (attachedImage) {
        finalTitle = attachedImage.name.replace(/\.[^/.]+$/, '');
      } else {
        const firstLine = content.trim().split('\n')[0].replace(/^#+\s*/, '').trim();
        if (firstLine && firstLine.length <= 60) {
          finalTitle = firstLine;
        }
      }
    }

    onSaveOutput({
      content: content.trim() || (attachedImage ? 'Image attachment' : ''),
      title: finalTitle || undefined,
      userPrompt: userPrompt.trim() || undefined,
      aiModel,
      tags: attachedImage ? ['Image', ...tags] : tags,
      mediaType: attachedImage ? 'image' : 'text',
      mediaUrl: attachedImage?.dataUrl,
      mediaName: attachedImage?.name,
      mediaSize: attachedImage?.size,
    });

    setContent('');
    setTitle('');
    setUserPrompt('');
    setTagsInput('');
    setAttachedImage(null);
    setShowMetadata(false);

    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault();
      handleSend();
    }
  };

  const formatRecordingTime = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="border-t border-slate-200 dark:border-[#202c33] bg-[#f0f2f5] dark:bg-[#202c33] px-3 py-2.5 md:px-5 md:py-3 transition-colors shadow-lg">
      <div className="max-w-4xl mx-auto space-y-2">
        {/* Hidden File Input for Image Upload */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
        />

        {/* Attached Image Preview Chip */}
        {attachedImage && (
          <div className="flex items-center justify-between p-2 rounded-xl bg-white dark:bg-[#111b21] border border-slate-200 dark:border-[#2a3942] animate-in fade-in duration-150 shadow-xs">
            <div className="flex items-center gap-3 min-w-0">
              <img
                src={attachedImage.dataUrl}
                alt="Upload preview"
                className="w-12 h-12 rounded-lg object-cover border border-slate-200 dark:border-[#2a3942] shrink-0"
              />
              <div className="min-w-0">
                <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">
                  {attachedImage.name}
                </p>
                <p className="text-[11px] text-slate-400">
                  {(attachedImage.size / 1024).toFixed(1)} KB • Image attached
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setAttachedImage(null)}
              className="p-1.5 rounded-full text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors cursor-pointer"
              title="Remove image attachment"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Optional Metadata Row (Title, Prompt, Tags) */}
        {showMetadata && (
          <div className="p-3 bg-white dark:bg-[#111b21] rounded-xl border border-slate-200 dark:border-[#2a3942] space-y-2.5 animate-in slide-in-from-bottom-2 duration-150 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Optional Output Details
              </span>
              <button
                type="button"
                onClick={() => setShowMetadata(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-0.5"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Title / Summary (e.g. Next.js Auth Flow)"
                className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-[#2a3942] bg-slate-50 dark:bg-[#182329] text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:ring-1 focus:ring-[#00a884]"
              />
              <input
                type="text"
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                placeholder="Tags separated by commas (e.g. auth, api, react)"
                className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-[#2a3942] bg-slate-50 dark:bg-[#182329] text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:ring-1 focus:ring-[#00a884]"
              />
            </div>

            <input
              type="text"
              value={userPrompt}
              onChange={(e) => setUserPrompt(e.target.value)}
              placeholder="Original user prompt that generated this output (optional)"
              className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-[#2a3942] bg-slate-50 dark:bg-[#182329] text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:ring-1 focus:ring-[#00a884]"
            />
          </div>
        )}

        {/* Top Controls: Model Selector & Metadata Toggle */}
        <div className="flex items-center justify-between text-xs">
          {/* AI Model Selector */}
          <div className="flex items-center gap-1 overflow-x-auto py-0.5 no-scrollbar">
            <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 mr-1 hidden sm:inline">
              Model:
            </span>
            {MODELS.map((item) => {
              const Icon = item.icon;
              const isSelected = aiModel === item.type;
              return (
                <button
                  key={item.type}
                  type="button"
                  onClick={() => setAiModel(item.type)}
                  className={`flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer shrink-0 ${
                    isSelected
                      ? 'bg-white dark:bg-[#111b21] text-[#00a884] dark:text-teal-400 shadow-xs border border-slate-200/80 dark:border-[#2a3942]'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-[#2a3942]'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>

          {/* Toggle Metadata */}
          <button
            type="button"
            onClick={() => setShowMetadata(!showMetadata)}
            className="flex items-center gap-1 text-[11px] font-medium text-slate-600 dark:text-slate-400 hover:text-[#00a884] dark:hover:text-teal-400 transition-colors ml-2 shrink-0 cursor-pointer"
          >
            {showMetadata ? (
              <>
                <ChevronDown className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Hide Details</span>
              </>
            ) : (
              <>
                <Plus className="w-3.5 h-3.5" />
                <span>{title || userPrompt ? 'Edit Details' : 'Add Title/Prompt'}</span>
              </>
            )}
          </button>
        </div>

        {/* Input Bar Main Row */}
        {isRecording ? (
          /* Active Voice Note Recording Mode */
          <div className="flex items-center justify-between gap-3 p-2.5 bg-white dark:bg-[#2a3942] rounded-xl border border-rose-300 dark:border-rose-900/60 shadow-md animate-in fade-in duration-150">
            <div className="flex items-center gap-2.5">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-600" />
              </span>
              <span className="text-xs font-semibold text-rose-600 dark:text-rose-400 tabular-nums">
                {formatRecordingTime(recordingSeconds)}
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400 hidden sm:inline">
                Recording WhatsApp Voice Note...
              </span>
            </div>

            {/* Waveform Animation */}
            <div className="flex items-center gap-1 h-5 flex-1 max-w-xs justify-center mx-2">
              {[40, 75, 100, 60, 90, 45, 80, 55, 95, 30].map((h, i) => (
                <div
                  key={i}
                  className="w-1 bg-[#00a884] dark:bg-teal-400 rounded-full animate-pulse"
                  style={{
                    height: `${h}%`,
                    animationDelay: `${(i % 5) * 120}ms`,
                  }}
                />
              ))}
            </div>

            {/* Recording Controls: Cancel or Stop & Send */}
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={cancelRecording}
                className="p-2 rounded-full text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                title="Discard voice recording"
              >
                <Trash2 className="w-5 h-5" />
              </button>
              <button
                type="button"
                onClick={stopAndSaveRecording}
                className="px-3 py-1.5 rounded-full bg-[#00a884] hover:bg-[#008069] active:scale-95 text-white flex items-center gap-1 text-xs font-semibold shadow-xs transition-all cursor-pointer"
                title="Send voice note"
              >
                <Send className="w-4 h-4 -rotate-12 translate-x-0.5" />
                <span className="hidden sm:inline">Send Voice</span>
              </button>
            </div>
          </div>
        ) : (
          /* Normal Text & Media Input Row */
          <div className="flex items-end gap-2">
            {/* Attachment Button for Image Upload */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-11 h-11 rounded-full flex items-center justify-center shrink-0 text-slate-500 dark:text-slate-400 hover:text-teal-600 dark:hover:text-teal-400 hover:bg-slate-200/70 dark:hover:bg-[#2a3942] transition-colors cursor-pointer"
              title="Upload an Image"
            >
              <ImageIcon className="w-5 h-5" />
            </button>

            {/* Main Textarea */}
            <div className="flex-1 bg-white dark:bg-[#2a3942] rounded-xl border border-slate-200/90 dark:border-[#374248] shadow-xs focus-within:ring-2 focus-within:ring-[#00a884] focus-within:border-transparent transition-all">
              <textarea
                ref={textareaRef}
                rows={1}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={
                  attachedImage
                    ? 'Add a caption for this image... (optional)'
                    : 'Paste your AI output here... (Markdown, tables & code preserved)'
                }
                className="w-full px-3.5 py-2.5 max-h-48 resize-none bg-transparent text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-400 text-sm focus:outline-hidden leading-relaxed"
              />
            </div>

            {/* Microphone Button (Record Voice Note) or Send Button */}
            {!content.trim() && !attachedImage ? (
              <button
                type="button"
                onClick={startRecording}
                className="w-11 h-11 rounded-full bg-[#00a884] hover:bg-[#008069] active:scale-95 text-white flex items-center justify-center shrink-0 shadow-md shadow-emerald-900/10 transition-all cursor-pointer"
                title="Record WhatsApp voice note"
              >
                <Mic className="w-5 h-5" />
              </button>
            ) : (
              <button
                onClick={handleSend}
                type="button"
                className="w-11 h-11 rounded-full bg-[#00a884] hover:bg-[#008069] active:scale-95 text-white flex items-center justify-center shrink-0 shadow-md shadow-emerald-900/10 transition-all cursor-pointer"
                title="Save output to this chat (Cmd/Ctrl + Enter)"
              >
                <Send className="w-5 h-5 -rotate-12 translate-x-0.5" />
              </button>
            )}
          </div>
        )}

        {/* Footer shortcuts & media hint */}
        <div className="flex items-center justify-between text-[11px] text-slate-400 dark:text-slate-500 px-1">
          <span>Supports text outputs, image uploads, and voice note recordings</span>
          <span className="hidden sm:inline">Tap Mic to record • ⌘+Enter to save</span>
        </div>
      </div>
    </div>
  );
};
