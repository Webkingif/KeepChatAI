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
  Image as ImageIcon,
  Mic,
  Trash2,
  Copy,
  Check,
  Lightbulb,
  ListTodo,
  Calendar,
} from 'lucide-react';
import { AIModelType } from '../types/keepchat';
import { toDateTimeLocalInputValue, fromDateTimeLocalInputValue } from '../utils/date';

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
    isTask?: boolean;
    taskDeadline?: number;
    taskTitle?: string;
  }) => void;
  onErrorToast?: (msg: string) => void;
  onToast?: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

const MODELS: { type: AIModelType; label: string; shortLabel: string; icon: React.ElementType }[] = [
  { type: 'ChatGPT', label: 'ChatGPT', shortLabel: 'GPT', icon: Bot },
  { type: 'Gemini', label: 'Gemini', shortLabel: 'Gemini', icon: Sparkles },
  { type: 'Claude', label: 'Claude', shortLabel: 'Claude', icon: Brain },
  { type: 'DeepSeek', label: 'DeepSeek', shortLabel: 'DeepSeek', icon: Cpu },
  { type: 'Other', label: 'Other', shortLabel: 'Other', icon: MessageSquare },
];

export const InputBar: React.FC<InputBarProps> = ({
  defaultModel,
  onSaveOutput,
  onErrorToast,
  onToast,
}) => {
  const [content, setContent] = useState('');
  const [title, setTitle] = useState('');
  const [userPrompt, setUserPrompt] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  const [aiModel, setAiModel] = useState<AIModelType>(defaultModel);
  const [showMetadata, setShowMetadata] = useState(false);
  const [isTask, setIsTask] = useState(false);
  const [taskDeadline, setTaskDeadline] = useState<number>(() => Date.now() + 1000 * 60 * 60 * 24);
  const [taskDeadlineInput, setTaskDeadlineInput] = useState<string>(() =>
    toDateTimeLocalInputValue(Date.now() + 1000 * 60 * 60 * 24)
  );

  // Mobile popovers
  const [showMobileModelMenu, setShowMobileModelMenu] = useState(false);
  const [showMobileTipPopover, setShowMobileTipPopover] = useState(false);

  // Attached Image state
  const [attachedImage, setAttachedImage] = useState<{
    dataUrl: string;
    name: string;
    size: number;
  } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mobileFileInputRef = useRef<HTMLInputElement>(null);

  // Audio Recording state
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordingTimerRef = useRef<NodeJS.Timeout | null>(null);
  const audioStreamRef = useRef<MediaStream | null>(null);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const mobileTextareaRef = useRef<HTMLTextAreaElement>(null);
  const [copiedPromptTip, setCopiedPromptTip] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const PROMPT_FORMAT_TIP = 'Format as a copyable block of markdown';

  const currentModelItem = MODELS.find((m) => m.type === aiModel) || MODELS[0];
  const CurrentModelIcon = currentModelItem.icon;

  const handleCopyPromptTip = async () => {
    try {
      await navigator.clipboard.writeText(PROMPT_FORMAT_TIP);
      setCopiedPromptTip(true);
      if (onToast) {
        onToast('Prompt copied! Paste it into ChatGPT or DeepSeek', 'success');
      } else {
        onErrorToast?.('Prompt copied! Paste it into ChatGPT or DeepSeek');
      }
      setTimeout(() => setCopiedPromptTip(false), 2000);
    } catch {
      const textarea = document.createElement('textarea');
      textarea.value = PROMPT_FORMAT_TIP;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopiedPromptTip(true);
      if (onToast) {
        onToast('Prompt copied! Paste it into ChatGPT or DeepSeek', 'success');
      } else {
        onErrorToast?.('Prompt copied! Paste it into ChatGPT or DeepSeek');
      }
      setTimeout(() => setCopiedPromptTip(false), 2000);
    }
  };

  useEffect(() => {
    setAiModel(defaultModel);
  }, [defaultModel]);

  // Auto-resize textarea for desktop & mobile
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      const scrollHeight = textareaRef.current.scrollHeight;
      textareaRef.current.style.height = `${Math.min(scrollHeight, 180)}px`;
    }
    if (mobileTextareaRef.current) {
      mobileTextareaRef.current.style.height = 'auto';
      const scrollHeight = mobileTextareaRef.current.scrollHeight;
      mobileTextareaRef.current.style.height = `${Math.min(Math.max(scrollHeight, 36), 110)}px`;
    }
  }, [content]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      if (onToast) {
        onToast('Only image files are supported currently.', 'error');
      } else {
        onErrorToast?.('Only image files are supported currently.');
      }
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      if (onToast) {
        onToast('Image size exceeds 5MB limit.', 'error');
      } else {
        onErrorToast?.('Image size exceeds 5MB limit.');
      }
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setAttachedImage({
        dataUrl: reader.result as string,
        name: file.name,
        size: file.size,
      });
      if (onToast) {
        onToast(`Image "${file.name}" attached`, 'success');
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioStreamRef.current = stream;
      audioChunksRef.current = [];

      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      recorder.start(100);
      setIsRecording(true);
      setRecordingSeconds(0);

      recordingTimerRef.current = setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);
    } catch {
      if (onToast) {
        onToast('Microphone access denied or unavailable.', 'error');
      } else {
        onErrorToast?.('Microphone access denied or unavailable.');
      }
    }
  };

  const stopAndSaveRecording = () => {
    if (!mediaRecorderRef.current || !isRecording) return;

    const duration = recordingSeconds;

    if (recordingTimerRef.current) {
      clearInterval(recordingTimerRef.current);
      recordingTimerRef.current = null;
    }

    mediaRecorderRef.current.onstop = () => {
      const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64Audio = reader.result as string;

        onSaveOutput({
          content: 'Voice Note Output',
          title: `Voice Note (${formatRecordingTime(duration)})`,
          aiModel,
          tags: ['voice-note'],
          mediaType: 'audio',
          mediaUrl: base64Audio,
          mediaName: `Voice_${new Date().toISOString().slice(0, 10)}.webm`,
          mediaSize: audioBlob.size,
          audioDuration: duration,
        });

        if (onToast) {
          onToast('Voice note saved successfully', 'success');
        }
      };
      reader.readAsDataURL(audioBlob);

      if (audioStreamRef.current) {
        audioStreamRef.current.getTracks().forEach((track) => track.stop());
        audioStreamRef.current = null;
      }
      setIsRecording(false);
      setRecordingSeconds(0);
    };

    mediaRecorderRef.current.stop();
  };

  const cancelRecording = () => {
    if (recordingTimerRef.current) {
      clearInterval(recordingTimerRef.current);
      recordingTimerRef.current = null;
    }
    if (mediaRecorderRef.current && isRecording) {
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

  const handleSend = () => {
    if (!content.trim() && !attachedImage) return;

    setIsSending(true);

    const parsedTags = Array.from(
      new Set(
        tagsInput
          .split(/[, ]+/)
          .map((t) => t.replace(/^#+/, '').trim().toLowerCase())
          .filter(Boolean)
      )
    );

    if (attachedImage) {
      onSaveOutput({
        content: content.trim() || 'Attached Image Output',
        title: title.trim() || attachedImage.name,
        userPrompt: userPrompt.trim() || undefined,
        aiModel,
        tags: parsedTags,
        mediaType: 'image',
        mediaUrl: attachedImage.dataUrl,
        mediaName: attachedImage.name,
        mediaSize: attachedImage.size,
        isTask: isTask || undefined,
        taskDeadline: isTask ? taskDeadline : undefined,
        taskTitle: isTask ? (title.trim() || undefined) : undefined,
      });
      setAttachedImage(null);
    } else {
      onSaveOutput({
        content: content.trim(),
        title: title.trim() || undefined,
        userPrompt: userPrompt.trim() || undefined,
        aiModel,
        tags: parsedTags,
        mediaType: 'text',
        isTask: isTask || undefined,
        taskDeadline: isTask ? taskDeadline : undefined,
        taskTitle: isTask ? (title.trim() || undefined) : undefined,
      });
    }

    setContent('');
    setTitle('');
    setUserPrompt('');
    setTagsInput('');
    setIsTask(false);
    setShowMetadata(false);
    setShowMobileModelMenu(false);
    setShowMobileTipPopover(false);

    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
    if (mobileTextareaRef.current) {
      mobileTextareaRef.current.style.height = 'auto';
    }

    setTimeout(() => {
      setIsSending(false);
    }, 280);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
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
    <div className="relative border-t border-slate-200 dark:border-[#202c33] bg-[#f0f2f5] dark:bg-[#202c33] px-2.5 py-2 sm:px-5 sm:py-3 transition-colors shadow-lg flex flex-col justify-center">
      {/* Mobile Backdrop for Popovers */}
      {(showMobileModelMenu || showMobileTipPopover) && (
        <div
          className="fixed inset-0 z-40 bg-black/25 backdrop-blur-2xs sm:hidden"
          onClick={() => {
            setShowMobileModelMenu(false);
            setShowMobileTipPopover(false);
          }}
        />
      )}

      {/* Hidden File Inputs for Image Upload */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        aria-label="Upload image attachment"
        onChange={handleFileChange}
      />
      <input
        ref={mobileFileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        aria-label="Upload image attachment (mobile)"
        onChange={handleFileChange}
      />

      {/* ========================================================================= */}
      {/* MOBILE LAYOUT (TWO-LAYER RESPONSIVE DESIGN FOR SMALL SCREENS)              */}
      {/* ========================================================================= */}
      <div className="flex sm:hidden flex-col gap-1.5 w-full relative">
        {/* Attached Image Preview on Mobile */}
        {attachedImage && (
          <div className="flex items-center justify-between p-1.5 px-2 rounded-lg bg-white dark:bg-[#111b21] border border-slate-200 dark:border-[#2a3942] animate-in fade-in duration-150 shadow-2xs">
            <div className="flex items-center gap-2 min-w-0">
              <img
                src={attachedImage.dataUrl}
                alt={`Upload preview: ${attachedImage.name}`}
                className="w-7 h-7 rounded object-cover border border-slate-200 dark:border-[#2a3942] shrink-0"
              />
              <span className="text-[11px] font-medium text-slate-700 dark:text-slate-300 truncate">
                {attachedImage.name}
              </span>
            </div>
            <button
              type="button"
              onClick={() => setAttachedImage(null)}
              className="p-1 rounded-full text-slate-400 hover:text-rose-500 cursor-pointer"
              title="Remove image"
              aria-label="Remove image attachment"
            >
              <X className="w-3.5 h-3.5" aria-hidden="true" />
            </button>
          </div>
        )}

        {isRecording ? (
          /* Mobile Active Voice Recording Row */
          <div className="flex items-center justify-between gap-2 w-full h-10 px-3 bg-white dark:bg-[#2a3942] rounded-full border border-rose-300 dark:border-rose-900/60 shadow-xs">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-600" />
              </span>
              <span className="text-xs font-semibold text-rose-600 dark:text-rose-400 tabular-nums">
                {formatRecordingTime(recordingSeconds)}
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={cancelRecording}
                className="p-1.5 rounded-full text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                title="Discard recording"
                aria-label="Discard voice recording"
              >
                <Trash2 className="w-4 h-4" aria-hidden="true" />
              </button>
              <button
                type="button"
                onClick={stopAndSaveRecording}
                className="px-3 py-1 rounded-full bg-[#00a884] text-white flex items-center gap-1 text-xs font-semibold transition-all active:scale-95 cursor-pointer shadow-2xs"
                aria-label="Send recorded voice note"
              >
                <Send className="w-3 h-3 -rotate-12 translate-x-0.5" aria-hidden="true" />
                <span>Send</span>
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* LAYER 1 (TOP LAYER): Select Model, Image Button, Bulb Button */}
            <div className="flex items-center justify-between gap-2 w-full px-0.5">
              <div className="flex items-center gap-1.5">
                {/* Select Model Dropdown Button */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => {
                      setShowMobileModelMenu(!showMobileModelMenu);
                      setShowMobileTipPopover(false);
                    }}
                    className="flex items-center gap-1.5 h-7 px-2.5 rounded-full bg-white dark:bg-[#111b21] text-[#00a884] dark:text-teal-400 border border-slate-200/90 dark:border-[#2a3942] text-[11px] font-semibold shadow-2xs hover:bg-slate-50 dark:hover:bg-[#182329] transition-all cursor-pointer active:scale-95"
                    title="Select AI Model"
                  >
                    <CurrentModelIcon className="w-3.5 h-3.5 shrink-0" />
                    <span>{currentModelItem.label}</span>
                    <ChevronDown className="w-3 h-3 text-slate-400 dark:text-slate-500 shrink-0" />
                  </button>

                  {/* Mobile Model Dropdown Popover */}
                  {showMobileModelMenu && (
                    <div className="absolute bottom-full mb-1.5 left-0 z-50 bg-white dark:bg-[#1f2c34] rounded-xl shadow-xl border border-slate-200 dark:border-[#2a3942] p-1.5 flex flex-col gap-1 min-w-[155px] animate-in fade-in slide-in-from-bottom-2 duration-150">
                      <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 border-b border-slate-100 dark:border-[#2a3942]">
                        Select AI Model
                      </div>
                      {MODELS.map((item) => {
                        const Icon = item.icon;
                        const isSelected = aiModel === item.type;
                        return (
                          <button
                            key={item.type}
                            type="button"
                            onClick={() => {
                              setAiModel(item.type);
                              setShowMobileModelMenu(false);
                            }}
                            className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors text-left cursor-pointer ${
                              isSelected
                                ? 'bg-emerald-50 dark:bg-emerald-950/40 text-[#00a884] dark:text-teal-400 font-semibold'
                                : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#2a3942]'
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <Icon className="w-3.5 h-3.5" />
                              <span>{item.label}</span>
                            </div>
                            {isSelected && <Check className="w-3.5 h-3.5" />}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Image Attachment Button */}
                <button
                  type="button"
                  onClick={() => mobileFileInputRef.current?.click()}
                  className={`flex items-center gap-1 h-7 px-2.5 rounded-full border text-[11px] font-medium transition-all cursor-pointer active:scale-95 ${
                    attachedImage
                      ? 'bg-emerald-50 dark:bg-emerald-950/40 text-[#00a884] dark:text-teal-400 border-emerald-300 dark:border-emerald-800'
                      : 'bg-white dark:bg-[#111b21] text-slate-600 dark:text-slate-300 hover:text-teal-600 dark:hover:text-teal-400 border-slate-200/90 dark:border-[#2a3942] shadow-2xs'
                  }`}
                  title="Attach an Image"
                  aria-label="Attach an Image"
                >
                  <ImageIcon className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                  <span>Image</span>
                </button>

                {/* Bulb Formatting Tip Button */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => {
                      setShowMobileTipPopover(!showMobileTipPopover);
                      setShowMobileModelMenu(false);
                    }}
                    className={`flex items-center gap-1 h-7 px-2.5 rounded-full border text-[11px] font-medium transition-all cursor-pointer active:scale-95 ${
                      showMobileTipPopover
                        ? 'bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300 border-amber-300 dark:border-amber-700'
                        : 'bg-white dark:bg-[#111b21] text-amber-600 dark:text-amber-400 border-slate-200/90 dark:border-[#2a3942] shadow-2xs hover:bg-amber-50 dark:hover:bg-[#182329]'
                    }`}
                    title="Formatting Tip"
                    aria-label="Formatting Tip"
                  >
                    <Lightbulb className="w-3.5 h-3.5 fill-amber-400/25" />
                    <span>Tip</span>
                  </button>

                  {/* Mobile Tip Popover */}
                  {showMobileTipPopover && (
                    <div className="fixed bottom-[11vh] left-3 right-3 z-50 bg-white dark:bg-[#182329] rounded-xl shadow-2xl border border-teal-200 dark:border-teal-800/60 p-3 animate-in fade-in slide-in-from-bottom-2 duration-150">
                      <div className="flex items-start justify-between gap-2 mb-1.5">
                        <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-800 dark:text-slate-200">
                          <Sparkles className="w-3.5 h-3.5 text-[#00a884] dark:text-teal-400" />
                          <span>AI Formatting Directive</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => setShowMobileTipPopover(false)}
                          className="p-1 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-300 mb-2 leading-relaxed">
                        Tell your AI model:
                        <code className="block mt-1 px-2 py-1 rounded font-mono text-[11px] font-semibold text-teal-800 dark:text-teal-300 bg-teal-50 dark:bg-[#10191f] border border-teal-200 dark:border-teal-800/50">
                          "{PROMPT_FORMAT_TIP}"
                        </code>
                      </p>
                      <button
                        type="button"
                        onClick={handleCopyPromptTip}
                        className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-white bg-[#00a884] hover:bg-[#008069] active:scale-98 transition-all cursor-pointer shadow-xs"
                      >
                        {copiedPromptTip ? (
                          <>
                            <Check className="w-3.5 h-3.5" />
                            <span>Prompt Directive Copied!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>Copy Prompt to Clipboard</span>
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Optional details toggle on mobile */}
              <button
                type="button"
                onClick={() => setShowMetadata(!showMetadata)}
                className={`text-[10px] font-semibold px-2 py-1 rounded-full transition-colors cursor-pointer ${
                  showMetadata || title || userPrompt || tagsInput
                    ? 'text-[#00a884] dark:text-teal-400 bg-emerald-50 dark:bg-emerald-950/40'
                    : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
                }`}
              >
                {showMetadata ? 'Hide Details' : '+ Details'}
              </button>
            </div>

            {/* Optional Metadata Drawer on Mobile if open */}
            {showMetadata && (
              <div className="p-2.5 bg-white dark:bg-[#111b21] rounded-xl border border-slate-200 dark:border-[#2a3942] space-y-1.5 animate-in slide-in-from-bottom-2 duration-150 shadow-2xs">
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Output Title (optional)"
                  aria-label="Output Title (optional)"
                  className="w-full px-2.5 py-1 rounded-lg border border-slate-200 dark:border-[#2a3942] bg-slate-50 dark:bg-[#182329] text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:ring-1 focus:ring-[#00a884]"
                />
                <input
                  type="text"
                  value={userPrompt}
                  onChange={(e) => setUserPrompt(e.target.value)}
                  placeholder="Prompt used (optional)"
                  aria-label="Prompt used (optional)"
                  className="w-full px-2.5 py-1 rounded-lg border border-slate-200 dark:border-[#2a3942] bg-slate-50 dark:bg-[#182329] text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:ring-1 focus:ring-[#00a884]"
                />
                <input
                  type="text"
                  value={tagsInput}
                  onChange={(e) => setTagsInput(e.target.value)}
                  placeholder="Tags (e.g. #react, #api)"
                  aria-label="Tags (optional)"
                  className="w-full px-2.5 py-1 rounded-lg border border-slate-200 dark:border-[#2a3942] bg-slate-50 dark:bg-[#182329] text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:ring-1 focus:ring-[#00a884]"
                />
                <div className="pt-1.5 border-t border-slate-100 dark:border-[#2a3942] flex flex-col gap-1.5">
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-700 dark:text-slate-300">
                    <input
                      type="checkbox"
                      checked={isTask}
                      onChange={(e) => setIsTask(e.target.checked)}
                      aria-label="Save as Task with Deadline"
                      className="rounded text-[#00a884] focus:ring-[#00a884]"
                    />
                    <span className="flex items-center gap-1">
                      <ListTodo className="w-3.5 h-3.5 text-[#00a884]" aria-hidden="true" />
                      Save as Task with Deadline
                    </span>
                  </label>
                  {isTask && (
                    <input
                      type="datetime-local"
                      value={taskDeadlineInput}
                      onChange={(e) => {
                        setTaskDeadlineInput(e.target.value);
                        setTaskDeadline(fromDateTimeLocalInputValue(e.target.value));
                      }}
                      aria-label="Task deadline date and time"
                      className="w-full px-2.5 py-1 rounded-lg border border-slate-200 dark:border-[#2a3942] bg-slate-50 dark:bg-[#182329] text-xs text-slate-900 dark:text-white"
                    />
                  )}
                </div>
              </div>
            )}

            {/* LAYER 2 (BOTTOM LAYER): Full-Width Input Box + Send / Mic Button */}
            <div className="flex items-center gap-2 w-full">
              {/* Wide Mobile Input Box */}
              <div className="flex-1 min-w-0 bg-white dark:bg-[#2a3942] rounded-2xl border border-slate-200/90 dark:border-[#374248] shadow-2xs focus-within:ring-1.5 focus-within:ring-[#00a884] flex items-center px-3.5 py-1.5 transition-all">
                <textarea
                  ref={mobileTextareaRef}
                  rows={1}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={attachedImage ? 'Add caption to image...' : 'Paste or type AI output here...'}
                  aria-label="AI output content or image caption"
                  className="w-full resize-none bg-transparent text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-400 text-xs sm:text-sm focus:outline-hidden max-h-28 leading-snug py-0.5"
                />
              </div>

              {/* Mobile Send / Mic Button */}
              {!content.trim() && !attachedImage ? (
                <button
                  type="button"
                  onClick={startRecording}
                  className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#008069] via-[#00a884] to-[#128c7e] text-white flex items-center justify-center shrink-0 shadow-md shadow-[#00a884]/25 active:scale-90 transition-all cursor-pointer border border-white/20"
                  title="Record Voice Note"
                  aria-label="Record Voice Note"
                >
                  <Mic className="w-5 h-5 stroke-[2.2]" />
                </button>
              ) : (
                <button
                  onClick={handleSend}
                  type="button"
                  disabled={isSending}
                  className={`relative w-10 h-10 rounded-full bg-gradient-to-tr from-[#008069] via-[#00a884] to-[#25d366] text-white flex items-center justify-center shrink-0 shadow-md shadow-[#00a884]/30 active:scale-90 transition-all duration-200 cursor-pointer border border-white/25 group overflow-hidden ${
                    isSending ? 'scale-92 ring-2 ring-[#00a884]/40' : ''
                  }`}
                  title="Save Output"
                  aria-label="Save Output"
                >
                  <div className="absolute inset-0 bg-gradient-to-b from-white/25 via-transparent to-transparent opacity-60 rounded-full pointer-events-none" />
                  <Send
                    className={`w-4 h-4 stroke-[2.2] transition-all duration-200 ${
                      isSending
                        ? 'translate-x-3 -translate-y-3 opacity-0 scale-75'
                        : '-rotate-12 translate-x-0.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5'
                    }`}
                  />
                </button>
              )}
            </div>
          </>
        )}
      </div>

      {/* ========================================================================= */}
      {/* DESKTOP LAYOUT (COMPLETE FULL-FEATURED MULTI-ROW CONTROLS FOR SM & MD+)    */}
      {/* ========================================================================= */}
      <div className="hidden sm:block max-w-4xl mx-auto space-y-2 w-full">
        {/* Attached Image Preview Chip */}
        {attachedImage && (
          <div className="flex items-center justify-between p-2 rounded-xl bg-white dark:bg-[#111b21] border border-slate-200 dark:border-[#2a3942] animate-in fade-in duration-150 shadow-xs">
            <div className="flex items-center gap-3 min-w-0">
              <img
                src={attachedImage.dataUrl}
                alt={`Attached image: ${attachedImage.name}`}
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
              aria-label="Remove image attachment"
            >
              <X className="w-4 h-4" aria-hidden="true" />
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
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-0.5 cursor-pointer"
                aria-label="Close output details"
              >
                <X className="w-4 h-4" aria-hidden="true" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Title / Summary (e.g. Next.js Auth Flow)"
                aria-label="Title / Summary (optional)"
                className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-[#2a3942] bg-slate-50 dark:bg-[#182329] text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:ring-1 focus:ring-[#00a884]"
              />
              <input
                type="text"
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                placeholder="Tags (e.g. #auth, api, #python)"
                aria-label="Tags (optional)"
                className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-[#2a3942] bg-slate-50 dark:bg-[#182329] text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:ring-1 focus:ring-[#00a884]"
              />
            </div>

            <input
              type="text"
              value={userPrompt}
              onChange={(e) => setUserPrompt(e.target.value)}
              placeholder="Original user prompt that generated this output (optional)"
              aria-label="Original user prompt (optional)"
              className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-[#2a3942] bg-slate-50 dark:bg-[#182329] text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:ring-1 focus:ring-[#00a884]"
            />

            {/* Task & Deadline Option */}
            <div className="pt-2 border-t border-slate-100 dark:border-[#2a3942] flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
              <label className="flex items-center gap-2 cursor-pointer font-medium text-slate-700 dark:text-slate-300">
                <input
                  type="checkbox"
                  checked={isTask}
                  onChange={(e) => setIsTask(e.target.checked)}
                  aria-label="Save as actionable task with deadline"
                  className="rounded text-[#00a884] focus:ring-[#00a884]"
                />
                <span className="flex items-center gap-1.5">
                  <ListTodo className="w-4 h-4 text-[#00a884]" aria-hidden="true" />
                  Save as actionable task with deadline
                </span>
              </label>

              {isTask && (
                <div className="flex items-center gap-2">
                  <span className="text-slate-400 text-xs">Deadline:</span>
                  <input
                    type="datetime-local"
                    value={taskDeadlineInput}
                    onChange={(e) => {
                      setTaskDeadlineInput(e.target.value);
                      setTaskDeadline(fromDateTimeLocalInputValue(e.target.value));
                    }}
                    aria-label="Task deadline date and time"
                    className="px-2.5 py-1 rounded-lg border border-slate-200 dark:border-[#2a3942] bg-slate-50 dark:bg-[#182329] text-xs text-slate-900 dark:text-white focus:outline-hidden focus:ring-1 focus:ring-[#00a884]"
                  />
                </div>
              )}
            </div>
          </div>
        )}

        {/* Top Controls: Model Selector & Metadata Toggle */}
        <div className="flex items-center justify-between text-xs">
          {/* AI Model Selector */}
          <div
            role="tablist"
            aria-label="AI Model selector"
            className="flex items-center gap-1 overflow-x-auto py-0.5 no-scrollbar"
          >
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
                  role="tab"
                  aria-selected={isSelected}
                  aria-label={`${item.label} AI model`}
                  onClick={() => setAiModel(item.type)}
                  className={`flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer shrink-0 ${
                    isSelected
                      ? 'bg-white dark:bg-[#111b21] text-[#00a884] dark:text-teal-400 shadow-xs border border-slate-200/80 dark:border-[#2a3942]'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-[#2a3942]'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>

          {/* Toggle Metadata */}
          <button
            type="button"
            onClick={() => setShowMetadata(!showMetadata)}
            aria-expanded={showMetadata}
            aria-label={showMetadata ? 'Hide output details' : 'Add tags and output details'}
            className="flex items-center gap-1 text-[11px] font-medium text-slate-600 dark:text-slate-400 hover:text-[#00a884] dark:hover:text-teal-400 transition-colors ml-2 shrink-0 cursor-pointer"
          >
            {showMetadata ? (
              <>
                <ChevronDown className="w-3.5 h-3.5" aria-hidden="true" />
                <span className="hidden sm:inline">Hide Details</span>
              </>
            ) : (
              <>
                <Plus className="w-3.5 h-3.5" aria-hidden="true" />
                <span>{title || userPrompt || tagsInput ? 'Edit Tags & Details' : 'Add Tags / Details'}</span>
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
            <div className="flex items-center gap-1 h-5 flex-1 max-w-xs justify-center mx-2" aria-hidden="true">
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
                aria-label="Discard voice recording"
              >
                <Trash2 className="w-5 h-5" aria-hidden="true" />
              </button>
              <button
                type="button"
                onClick={stopAndSaveRecording}
                className="px-3.5 py-1.5 rounded-full bg-gradient-to-r from-[#008069] via-[#00a884] to-[#25d366] hover:brightness-105 active:scale-95 text-white flex items-center gap-1.5 text-xs font-semibold shadow-md shadow-[#00a884]/25 transition-all cursor-pointer border border-white/20 group"
                title="Send voice note"
                aria-label="Send recorded voice note"
              >
                <Send className="w-3.5 h-3.5 -rotate-12 translate-x-0.5 group-hover:translate-x-1 group-hover:-translate-y-0.5 transition-transform" aria-hidden="true" />
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
              aria-label="Upload an image"
            >
              <ImageIcon className="w-5 h-5" aria-hidden="true" />
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
                aria-label="AI output content"
                className="w-full px-3.5 py-2.5 max-h-48 resize-none bg-transparent text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-400 text-sm focus:outline-hidden leading-relaxed"
              />
            </div>

            {/* Microphone Button (Record Voice Note) or Send Button */}
            {!content.trim() && !attachedImage ? (
              <button
                type="button"
                onClick={startRecording}
                className="relative w-12 h-12 rounded-full bg-gradient-to-tr from-[#008069] via-[#00a884] to-[#128c7e] text-white flex items-center justify-center shrink-0 shadow-md shadow-[#00a884]/25 hover:shadow-lg hover:shadow-[#00a884]/35 hover:brightness-105 active:scale-92 transition-all duration-150 cursor-pointer border border-white/20 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00a884] focus-visible:ring-offset-2"
                title="Record WhatsApp voice note"
                aria-label="Record voice note"
              >
                <Mic className="w-5 h-5 stroke-[2.2] group-hover:scale-110 transition-transform duration-150" />
              </button>
            ) : (
              <button
                onClick={handleSend}
                type="button"
                disabled={isSending}
                className={`relative w-12 h-12 rounded-full bg-gradient-to-tr from-[#008069] via-[#00a884] to-[#25d366] text-white flex items-center justify-center shrink-0 shadow-md shadow-[#00a884]/30 hover:shadow-xl hover:shadow-[#00a884]/45 hover:brightness-105 active:scale-90 active:shadow-inner transition-all duration-200 cursor-pointer border border-white/25 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00a884] focus-visible:ring-offset-2 overflow-hidden ${
                  isSending ? 'scale-90 ring-4 ring-[#00a884]/40' : ''
                }`}
                title="Save output to this chat (Cmd/Ctrl + Enter)"
                aria-label="Save output"
              >
                {/* Glossy top specular reflection */}
                <div className="absolute inset-0 bg-gradient-to-b from-white/25 via-transparent to-transparent opacity-70 rounded-full pointer-events-none" />

                <Send
                  className={`w-5 h-5 stroke-[2.3] transition-all duration-200 ${
                    isSending
                      ? 'translate-x-4 -translate-y-4 opacity-0 scale-75'
                      : '-rotate-12 translate-x-0.5 group-hover:translate-x-1 group-hover:-translate-y-1 group-hover:rotate-0 group-hover:scale-105'
                  }`}
                />
              </button>
            )}
          </div>
        )}

        {/* Formatting Reminder Note with 1-Click Copy */}
        <div className="flex flex-wrap items-center justify-between gap-2 px-3 py-1.5 rounded-lg bg-teal-50/80 dark:bg-[#162329] border border-teal-200/70 dark:border-teal-900/40 text-[11.5px] text-slate-600 dark:text-slate-300">
          <div className="flex items-center gap-1.5 min-w-0">
            <Sparkles className="w-3.5 h-3.5 text-[#00a884] dark:text-teal-400 shrink-0" />
            <div className="leading-snug">
              <span className="font-semibold text-slate-800 dark:text-slate-200 mr-1">
                Tip:
              </span>
              <span>
                Want your output formatted nicely? Tell ChatGPT / DeepSeek:{' '}
                <code className="px-1.5 py-0.5 rounded font-mono text-[11px] font-semibold text-teal-800 dark:text-teal-300 bg-white/90 dark:bg-[#10191f] border border-teal-200 dark:border-teal-800/50 shadow-2xs">
                  "Format as a copyable block of markdown"
                </code>
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={handleCopyPromptTip}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-medium text-teal-700 dark:text-teal-300 bg-teal-100/70 hover:bg-teal-200/70 dark:bg-teal-950/60 dark:hover:bg-teal-900/60 border border-teal-300/60 dark:border-teal-800/60 transition-all active:scale-95 cursor-pointer shrink-0 ml-auto"
            title="Copy prompt directive to clipboard"
          >
            {copiedPromptTip ? (
              <>
                <Check className="w-3 h-3 text-[#00a884] dark:text-teal-400" />
                <span className="text-[#00a884] dark:text-teal-400 font-semibold">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3 h-3" />
                <span>Copy Prompt</span>
              </>
            )}
          </button>
        </div>

        {/* Footer shortcuts & media hint */}
        <div className="flex items-center justify-between text-[11px] text-slate-400 dark:text-slate-500 px-1">
          <span>Supports text outputs, image uploads, and voice note recordings</span>
          <span className="hidden sm:inline">Tap Mic to record • ⌘+Enter to save</span>
        </div>
      </div>
    </div>
  );
};
