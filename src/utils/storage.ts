import { ChatThread, SavedOutput, AppExportData, ThemeMode } from '../types/keepchat';
import { INITIAL_CHATS, INITIAL_MESSAGES } from '../data/seedData';

const STORAGE_KEY_CHATS = 'keepchat_threads_v1';
const STORAGE_KEY_MESSAGES = 'keepchat_messages_v1';
const STORAGE_KEY_THEME = 'keepchat_theme_v1';

export function loadStoredChats(): ChatThread[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_CHATS);
    if (!raw) {
      saveStoredChats(INITIAL_CHATS);
      return INITIAL_CHATS;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : INITIAL_CHATS;
  } catch (e) {
    console.error('Error loading stored chats:', e);
    return INITIAL_CHATS;
  }
}

export function saveStoredChats(chats: ChatThread[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_CHATS, JSON.stringify(chats));
  } catch (e) {
    console.error('Error saving chats to storage:', e);
  }
}

export function loadStoredMessages(): SavedOutput[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_MESSAGES);
    if (!raw) {
      saveStoredMessages(INITIAL_MESSAGES);
      return INITIAL_MESSAGES;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : INITIAL_MESSAGES;
  } catch (e) {
    console.error('Error loading stored messages:', e);
    return INITIAL_MESSAGES;
  }
}

export function saveStoredMessages(messages: SavedOutput[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_MESSAGES, JSON.stringify(messages));
  } catch (e) {
    console.error('Error saving messages to storage:', e);
  }
}

export function loadStoredThemeMode(): ThemeMode {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_THEME);
    if (raw === 'light' || raw === 'dark' || raw === 'system') return raw;
    return 'light';
  } catch {
    return 'light';
  }
}

export function saveStoredThemeMode(mode: ThemeMode): void {
  try {
    localStorage.setItem(STORAGE_KEY_THEME, mode);
  } catch (e) {
    console.error('Error saving theme mode:', e);
  }
}

export function resolveEffectiveTheme(mode: ThemeMode): 'light' | 'dark' {
  if (mode === 'light' || mode === 'dark') return mode;
  if (typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    return 'dark';
  }
  return 'light';
}

export function exportBackup(chats: ChatThread[], messages: SavedOutput[]): AppExportData {
  const data: AppExportData = {
    version: '1.0.0',
    exportedAt: new Date().toISOString(),
    chats,
    messages,
  };

  try {
    const jsonString = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `keepchat-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      if (document.body.contains(a)) {
        document.body.removeChild(a);
      }
      URL.revokeObjectURL(url);
    }, 1000);
  } catch (err) {
    console.error('File download error:', err);
  }

  return data;
}

export function exportChatAsMarkdown(chat: ChatThread, messages: SavedOutput[]): void {
  const lines: string[] = [];
  lines.push(`# ${chat.title}`);
  if (chat.description) lines.push(`*${chat.description}*\n`);
  lines.push(`Category: ${chat.category} | Saved Outputs: ${messages.length}\n`);
  lines.push(`Exported on: ${new Date().toLocaleString()}\n`);
  lines.push(`---\n`);

  messages.forEach((msg, idx) => {
    lines.push(`## Output #${idx + 1}: ${msg.title || 'Untitled Output'}`);
    lines.push(`**Model:** ${msg.aiModel} | **Saved:** ${new Date(msg.createdAt).toLocaleString()}`);
    if (msg.userPrompt) {
      lines.push(`\n**Prompt:**\n> ${msg.userPrompt}\n`);
    }
    lines.push(`\n${msg.content}\n`);
    lines.push(`---\n`);
  });

  try {
    const blob = new Blob([lines.join('\n')], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${chat.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.md`;
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      if (document.body.contains(a)) {
        document.body.removeChild(a);
      }
      URL.revokeObjectURL(url);
    }, 1000);
  } catch (err) {
    console.error('Markdown download error:', err);
  }
}
