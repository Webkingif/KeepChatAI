export type AIModelType = 'ChatGPT' | 'Gemini' | 'Claude' | 'DeepSeek' | 'Other';

export type CategoryType = 'All' | 'Coding' | 'Prompts' | 'Research' | 'Writing' | 'Architecture' | 'General';

export type ThemeMode = 'light' | 'dark' | 'system';

export const MAX_PINNED_CHATS = 5;

export interface ChatThread {
  id: string;
  title: string;
  description?: string;
  category: string;
  defaultAiModel: AIModelType;
  createdAt: number;
  updatedAt: number;
  isPinned: boolean;
  avatarColor: string;
  iconName?: string;
  customAvatarUrl?: string; // Custom uploaded image logo as Base64 data URL
}

export interface SavedOutput {
  id: string;
  chatId: string;
  title?: string;
  userPrompt?: string;
  content: string;
  aiModel: AIModelType;
  tags: string[];
  isStarred: boolean;
  createdAt: number;
  tokenCountEstimate?: number;
  mediaType?: 'text' | 'image' | 'audio';
  mediaUrl?: string; // Base64 data URL
  mediaName?: string;
  mediaSize?: number; // Size in bytes
  audioDuration?: number; // Duration in seconds
  isEdited?: boolean;
  editedAt?: number;
  isTask?: boolean;
  taskDeadline?: number; // Unix timestamp in ms
  taskCompleted?: boolean;
  taskCompletedAt?: number;
  taskTitle?: string;
}

export interface AppExportData {
  version: string;
  exportedAt: string;
  chats: ChatThread[];
  messages: SavedOutput[];
}
