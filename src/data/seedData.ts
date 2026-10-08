import { ChatThread, SavedOutput } from '../types/keepchat';

export const INITIAL_CHATS: ChatThread[] = [
  {
    id: 'chat-welcome',
    title: 'Getting Started with KeepChat',
    description: 'Welcome guide & interactive walkthrough to help you master your local AI output vault',
    category: 'Guide',
    defaultAiModel: 'ChatGPT',
    createdAt: Date.now() - 1000 * 60 * 60 * 5,
    updatedAt: Date.now() - 1000 * 60 * 5,
    isPinned: true,
    avatarColor: 'from-emerald-500 to-teal-700',
    iconName: 'sparkles',
  },
];

export const INITIAL_MESSAGES: SavedOutput[] = [
  {
    id: 'msg-welcome-1',
    chatId: 'chat-welcome',
    title: 'Welcome to KeepChat · Your Private Local AI Vault',
    userPrompt: 'What is KeepChat and how does it protect my AI outputs?',
    aiModel: 'ChatGPT',
    content: `### Welcome to KeepChat! 🚀

**KeepChat** is your private, local sanctuary for saving, organizing, and archiving valuable AI responses, code snippets, research notes, and creative prompts.

#### Why KeepChat?
- 🔒 **100% Private & Local**: Your data stays entirely in your browser using **IndexedDB**. There are no third-party servers, tracking, or data harvesting.
- ⚡ **Offline-First PWA**: KeepChat functions seamlessly with or without internet connectivity.
- 💬 **WhatsApp-Inspired Experience**: Organize your AI conversations into distinct thematic threads with familiar read receipts, timestamps, and audio playback.
- 📦 **Zero Lock-In**: Export any single output or bulk export entire threads into **PNG images**, **PDF documents**, or **Markdown (\`.md\`)** anytime.

Scroll down through the outputs in this thread to explore all the features!`,
    tags: ['welcome', 'getting-started', 'privacy'],
    isStarred: true,
    createdAt: Date.now() - 1000 * 60 * 60 * 5,
  },
  {
    id: 'msg-welcome-2',
    chatId: 'chat-welcome',
    title: 'Step 1: Saving, Tagging & Categorizing AI Outputs',
    userPrompt: 'How do I save responses from ChatGPT, Claude, Gemini, or DeepSeek into KeepChat?',
    aiModel: 'Gemini',
    content: `### How to Save & Organize AI Outputs

Whenever you get a useful answer or code snippet from an AI model, you can preserve it here in seconds:

#### 1. Using the Bottom Input Bar
- **Select AI Model**: Click the model badge (*ChatGPT*, *Gemini*, *Claude*, *DeepSeek*, or *Other*) to attribute the output.
- **Optional Title & Prompt**: Click **Title** or **Prompt** in the bottom input bar to record your original prompt or give the output a memorable title.
- **Paste & Save**: Paste your text or code into the textarea and press **Save** (or \`Ctrl+Enter\` / \`Cmd+Enter\`).

#### 2. Rich Markdown, Math & Code Highlighting
KeepChat automatically formats Markdown headings, bullet points, tables, blockquotes, LaTeX math formulas ($E = mc^2$), and highlighted code blocks:

\`\`\`typescript
interface KeepChatOutput {
  id: string;
  aiModel: 'ChatGPT' | 'Gemini' | 'Claude' | 'DeepSeek';
  title?: string;
  content: string;
  tags: string[];
  createdAt: number;
}
\`\`\`

#### 3. Hashtags & Category Organization
- Tag any output with \`#hashtags\` (e.g. \`#react\`, \`#prompts\`, \`#finance\`). Clicking any tag filters the thread instantly!
- Organize your chats into categories like *Coding*, *Research*, *Prompts*, or *Guide* from the sidebar.`,
    tags: ['saving-outputs', 'markdown', 'tags', 'organization'],
    isStarred: false,
    createdAt: Date.now() - 1000 * 60 * 60 * 4,
    isTask: true,
    taskTitle: 'Step 1: Save & Tag AI outputs',
    taskDeadline: Date.now() + 1000 * 60 * 60 * 48, // Upcoming: 2 days in future
    taskCompleted: false,
  },
  {
    id: 'msg-welcome-3',
    chatId: 'chat-welcome',
    title: 'Step 2: Single & Multi-Select Exports (Image, PDF & Markdown)',
    userPrompt: 'How do I export outputs to share with others or include in documentation?',
    aiModel: 'Claude',
    content: `### Powerful Export Options

KeepChat offers 3 professional ways to share and archive your AI outputs:

#### 📸 1. Export as Image (PNG)
- Click the **Camera** icon on any output card to open the **Image Export Modal**.
- Authentic WhatsApp-styled layout with your chat name, date, and clean wallpaper background.
- **⚡ Auto-Fit Code Slider**: Adjust document width (480px to 1800px) or click **Auto-Fit Code** so long code lines never get cut off!
- **One-Click Download** or **Copy Image to Clipboard** (\`Ctrl+V\` straight into Slack, Discord, or Notion).

#### 📄 2. Export as PDF Document
- Click the **Document** icon (\`FileText\`) on any card to export a paginated multi-page PDF.
- **Snapshot Mode**: Visual capture preserving layout and styling.
- **Selectable Text Mode**: Native vector text where text and code blocks can be highlighted and copied directly from your PDF reader!
- **Custom Page Width & Auto-Fit**: Choose Portrait A4 (210×297mm), Landscape A4 (297×210mm), or custom wide page widths.

#### 📝 3. Export as Markdown (.md)
- Click the **Markdown** icon (\`FileCode\`) for instant \`.md\` file download complete with metadata, prompts, and hashtags.

#### 🎯 4. Multi-Select Bulk Mode
- Click the **Select** checkbox in the top header (or inside the **3-dot menu** on mobile).
- Select multiple outputs and use the sticky bar to export them all as a single combined **Image**, **PDF**, or **Markdown** file, or **Delete** them in bulk!`,
    tags: ['export', 'image-snapshot', 'pdf', 'markdown', 'multi-select'],
    isStarred: true,
    createdAt: Date.now() - 1000 * 60 * 60 * 3,
    isTask: true,
    taskTitle: 'Step 2: Review Export Formats & Auto-Fit',
    taskDeadline: Date.now() - 1000 * 60 * 60 * 24, // Overdue: 1 day in past
    taskCompleted: false,
  },
  {
    id: 'msg-welcome-4',
    chatId: 'chat-welcome',
    title: 'Step 3: Search, Starred Filters, Pinning & Backups',
    userPrompt: 'How do I quickly find outputs, filter favorites, and back up my vault?',
    aiModel: 'DeepSeek',
    content: `### Search, Filters, Pinning & Vault Backups

Stay fast and organized as your collection grows:

#### 🔍 1. Instant Search
- **Global Search**: Type in the sidebar search bar to find any chat title or category.
- **In-Thread Search**: Click the magnifying glass in the chat header (or in the 3-dot menu on mobile) to search keywords and code across all outputs in the current thread.

#### ⭐ 2. Starred Outputs Filter
- Click the **Star** icon on any card to favorite it.
- Toggle the **Star** filter in the top header (or 3-dot menu on mobile) to view only starred outputs.

#### 📌 3. Pinning Favorite Threads
- Click the **Pin** button in the chat header or hover over any chat in the sidebar to keep top threads pinned at the top.

#### 💾 4. Backup & Restore (Settings)
- Click the **Gear** icon at the bottom-left of the sidebar to access **Settings**.
- **Export Vault Backup**: Downloads a complete \`.json\` file containing all your threads, outputs, and tags.
- **Restore Backup**: Import your \`.json\` file on any computer or browser to restore your entire vault.
- **Theme Toggle**: Switch between WhatsApp Dark, Clean Light, or System theme.`,
    tags: ['search', 'starred', 'pinning', 'backup', 'settings'],
    isStarred: false,
    createdAt: Date.now() - 1000 * 60 * 60 * 2,
  },
];
