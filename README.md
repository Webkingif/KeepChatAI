# KeepChat — AI Output Vault & Organizer

<p align="center">
  <img src="public/pwa-512x512.png" alt="KeepChat Logo" width="96" height="96" />
</p>

<p align="center">
  <strong>A centralized, WhatsApp-inspired vault to save, organize, search, and view Markdown-formatted AI outputs from ChatGPT, Gemini, Claude, and DeepSeek — featuring a streamlined Tasks Hub, multi-page routing, multi-format exports, and instant auto-updating offline PWA capabilities.</strong>
</p>

<p align="center">
  <a href="https://keepchatai.netlify.app/" target="_blank" rel="noopener noreferrer">
    <img src="https://img.shields.io/badge/Live_App-keepchatai.netlify.app-00A884?style=for-the-badge&logo=netlify&logoColor=white" alt="Live App on Netlify" />
  </a>
</p>

<p align="center">
  🌐 <strong>Live Web App: <a href="https://keepchatai.netlify.app/">https://keepchatai.netlify.app/</a></strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React-19.0-61DAFB?logo=react&logoColor=black" alt="React 19" />
  <img src="https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Vite-8.x-646CFF?logo=vite&logoColor=white" alt="Vite" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-v4-06B6D4?logo=tailwindcss&logoColor=white" alt="Tailwind CSS v4" />
  <img src="https://img.shields.io/badge/Storage-IndexedDB_Local--First-25D366?logo=googlechrome&logoColor=white" alt="IndexedDB" />
  <img src="https://img.shields.io/badge/PWA-100%25_Offline_Ready-008069?logo=pwa&logoColor=white" alt="PWA Ready" />
  <img src="https://img.shields.io/badge/Math-KaTeX-007ACC?logo=katex&logoColor=white" alt="KaTeX" />
  <img src="https://img.shields.io/badge/PDF_Engine-jsPDF-E74C3C?logo=adobe-acrobat-reader&logoColor=white" alt="jsPDF" />
  <img src="https://img.shields.io/badge/Snapshots-html--to--image-FF6F00?logo=html5&logoColor=white" alt="html-to-image" />
</p>

---

## 📖 Overview

> 🚀 **Try the Live App Now**: You can use KeepChat immediately in your browser or install it as a native offline PWA at **[https://keepchatai.netlify.app/](https://keepchatai.netlify.app/)**. Zero login or installation required!

As we interact daily with AI models like **ChatGPT**, **Claude**, **Google Gemini**, and **DeepSeek**, valuable code snippets, architecture plans, prompt formulas, and actionable instructions quickly get scattered across browser tabs and disjointed chat histories.

**KeepChat** transforms this experience into a familiar, ultra-responsive **WhatsApp-style conversational interface**. It provides an offline-first personal repository to paste, archive, tag, and search AI outputs with native support for full Markdown rendering, syntax-highlighted code blocks, mathematical LaTeX equations, voice notes, and image attachments.

Beyond simple archiving, KeepChat turns insights into execution with a **minimalist Tasks Hub**, **multi-card image snapshots**, **paginated PDF documents (with selectable vector text)**, **chronological Markdown exports**, **searchable FAQ knowledge base**, and **instant automatic web updates**.

---

## ✨ Key Features

### 💬 Authentic WhatsApp-Inspired Experience
- **Adaptive Responsive Layout**: Persistent dual-pane view on desktop (`>768px`) with fluid WhatsApp Web proportioning; native single-pane flow on mobile (`<768px`) with smooth sliding transitions and ergonomic back navigation.
- **Visual Fidelity**: Authentic light (`#F0F2F5`) and dark (`#111B21` / `#202C33`) WhatsApp themes with subtle wallpaper pattern backgrounds.
- **Date Dividers**: Natural inline date badges grouping saved outputs (**TODAY**, **YESTERDAY**, or formatted calendar dates) that scroll smoothly with the stream.
- **Floating Scroll-to-Bottom Button**: WhatsApp-style circular action button that smoothly slides in when scrolling past 150px and scrolls directly to the newest message.
- **Ergonomic Send Button**: 48px circular emerald action button with flight micro-animations, tactile feedback, and keyboard shortcuts (`Ctrl+Enter` / `Cmd+Enter`).
- **Chat Pinning**: Pin up to 5 high-priority threads with hover quick-actions, header toggles, and mobile long-press gesture sheets.

### 📋 Streamlined "My Tasks" Hub & Deadline Management
- **Minimalist Clean UI**: Centered modern task list with quick back navigation to chats, options menu, and real-time formatted date subtitle.
- **Segmented Filter Pills**:
  - **All**: View all tasks across the entire workspace.
  - **Overdue**: Filter pending tasks with past deadlines, highlighted with a dynamic numeric badge count.
  - **Upcoming**: Filter incomplete, on-track tasks with a dynamic numeric badge count.
  - **Done**: Filter completed tasks.
- **Card Controls & Interactivity**:
  - Circular checkbox toggles (outline when pending, filled green checkmark on completion) with strikethrough typography.
  - Priority flag toggle on each task.
  - Formatted time indicators (e.g. `9:00 AM`, `Tomorrow, 11:30 AM`).
  - Expandable drawer revealing AI model badge, original chat source jump link, markdown notes, and deadline change picker.
- **Inline Rapid Task Creation Bar**: Soft rounded `+ Add a new task...` bar at the bottom for instant inline task additions.

### 🔄 Instant Automatic Web Updates & Dynamic Viewport Height
- **Always-Updated Guarantee**: Whenever a new version of the website is deployed, the app automatically checks, downloads the update in the background, and refreshes seamlessly via `controllerchange` listener.
- **Proactive Update Detection**: Triggers update checks on app launch, window focus, visibility change, and periodically every 5 minutes (`useAutoUpdate.ts`).
- **Cache-Control Revalidation Headers**: Configured `public/_headers` and HTML meta tags (`no-cache, no-store, must-revalidate`) ensuring browser shells never serve stale entry points while keeping immutable hashed assets fast.
- **Chrome Tab Group & Mobile Viewport Support**:
  - Built-in `useVisualViewport` hook dynamically maps `--app-height` and `--app-width` to the active `window.visualViewport`.
  - Added `interactive-widget=resizes-content` and `viewport-fit=cover` so Chrome tab strips, browser navigation bars, and virtual keyboards never cut off bottom action bars or the full height of the website.
  - Safe-area bottom padding (`env(safe-area-inset-bottom)`) integrated across all bottom inputs and floating buttons.

### 🌐 Multi-Page Pre-Rendered Routes & SEO Architecture
KeepChat supports direct clean URLs with dedicated pre-rendered semantic HTML entry points and schema markup:
- `/` — **Main Output Vault** (`index.html`)
- `/tasks` — **Tasks Command Console** (`tasks/index.html`)
- `/settings` — **Settings & Storage Management** (`settings/index.html`)
- `/faq` — **Frequently Asked Questions** (`faq/index.html`)

Includes Google Search Console site verification, canonical URLs, OpenGraph/Twitter social cards, and Schema.org JSON-LD structured data (`SoftwareApplication`, `FAQPage`, `BreadcrumbList`).

### ❓ Interactive FAQ & Knowledge Base
- Accessible, categorized accordion knowledge base with real-time keyword search.
- Quick deep links to the Output Vault, Tasks Console, and PWA configuration.
- Detailed architectural explanations for local storage privacy, export modes, and offline functionality.

### 🤖 Multi-Model Organization & Thread Avatars
- **AI Model Classification**: Dedicated threads and output tags for **ChatGPT**, **Google Gemini**, **Claude**, **DeepSeek**, or custom models.
- **Custom Chat Photos**: Upload custom avatars in the chat creation/edit modal or directly via the chat header camera trigger.
- **Chat Logo Lightbox**: Tap any avatar in the header or sidebar to open the full-screen photo viewer with high-resolution download, zoom, and change actions.

### 📸 Single & Multi-Output Image Export (WhatsApp Snapshot)
- **High-Resolution PNG Capture**: Render selected outputs into an authentic WhatsApp snapshot with chat title, avatar, date, KeepChat branding, and wallpaper.
- **Interactive Width Slider**: Adjust export width continuously from 480px to 1800px with live numeric feedback.
- **1-Click Width Presets**: **Standard (640px)**, **Wide (960px)**, and **Ultra (1280px)**.
- **⚡ Auto-Fit Code**: Measures the longest line of code or math formula and automatically widens the snapshot to prevent text truncation.
- **Download & Clipboard**: One-click PNG file download and direct *"Copy Image to Clipboard"*.

### 📄 Multi-Mode Paginated PDF Export
- **100% Client-Side PDF Generation**: Fast, offline PDF creation powered by `jspdf`.
- **Snapshot Mode**: Visual PDF rendering with WhatsApp styling, bubbles, and background.
- **Selectable Vector Text Mode**: Highlightable, searchable, and copyable text PDF with monospace code boxes and indent preservation.
- **Orientation & Sizing**: Portrait (210×297mm) and Landscape (297×210mm) with presets for **Portrait A4 (750px)**, **Landscape A4 (1050px)**, and **Ultra-Wide (1350px)**.
- **Uniform Dimensions & Pagination**: Guarantees identical page width and height across all pages with running headers and `Page X of Y` footers.
- **Code Auto-Fit**: Measures code lines and adjusts printable dimensions to fit without cropping.

### 📝 Single & Multi-Output Markdown Export (.md)
- **Clean Markdown Files**: Export single cards or multi-selected outputs as `.md` files.
- **Strict Chronological Ordering**: Ensures outputs are saved from oldest (top) to newest (bottom).
- **Rich Metadata**: Includes chat thread title, AI model badge, `#tags`, timestamp, and prompt blockquotes.

### ☑️ Multi-Select & Bulk Operations
- **Interactive Selection**: Enter multi-select mode from the header or menu with circular checkboxes.
- **Sticky Multi-Select Bar**: Live counter, Select All / Deselect All, and instant action triggers.
- **Bulk Actions**: Export selection to **Image**, **PDF**, or **Markdown**, or trigger **Bulk Delete** with confirmation modal.

### ✏️ Indefinite Inline Output Editing & Tagging
- **Zero Lockout Editing**: Edit any output card at any time without restrictions.
- **Inline Editor**: Switch AI model tag, update prompt title, and edit raw Markdown with `Ctrl+Enter` save.
- **Edited Timestamp**: Subtle WhatsApp-style `Edited ·` badge beside the timestamp with date-time tooltip.
- **Output Tag Management**: Inline `+ Tag` button for quick tagging, hover `x` deletion, and 1-click `#tag` filtering.

### 📐 Publication-Grade LaTeX Math & Code Highlighting
- **Full LaTeX Math (via KaTeX)**: Render inline (`$...$`, `\(...\)`) and display block (`$$...$$`, `\[...\]`) math formulas without unwanted border boxes or green tints.
- **Syntax Highlighting (via PrismJS)**: Monospace code blocks with language indicators and 1-click copy-to-clipboard.
- **AI Formatting Assistant**: Permanent tip reminder and 1-click clipboard prompt: `"Format as a copyable block of markdown"`.

### 🎙️ Voice Notes & Image Attachments
- **Voice Memo Recorder**: Native `MediaRecorder` audio capture with live timer, waveform animation, discard, and send controls.
- **WhatsApp Audio Player**: Interactive player with play/pause, scrub bar, waveform bars, and `1.0x / 1.5x / 2.0x` speed toggles.
- **Image Attachments**: Attach photos to outputs with full-screen lightbox preview and download actions.

### 🛡️ 100% Offline-First Architecture & Privacy
- **IndexedDB Engine**: All chats, outputs, voice recordings, and attachments persist in browser IndexedDB (`keepchat_db` v1) with transparent localStorage fallback.
- **Workbox PWA Pre-Caching**: Navigation fallback (`/index.html`) ensures instant startup even in airplane mode.
- **Discreet Offline Banner**: Non-intrusive indicator that confirms offline availability for 1 second upon disconnection.
- **PWA Install Dialog**: Automatic, accessible installation prompt highlighting privacy and offline capability.
- **Zero Telemetry**: No third-party analytics, tracking pixels, or external API calls. Your AI outputs remain 100% private to your browser.
- **Full Vault Backup & Restore**: One-click complete JSON backup export and import.

---

## 🏛️ System Architecture

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                                KeepChat React 19 Application                           │
├────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                        │
│   ┌───────────────────────────┐    ┌───────────────────────────────────────────────┐   │
│   │   Sidebar & Navigation    │    │              Main Content Area                │   │
│   │  • Pinned threads (max 5) │    ├───────────────────────┬───────────────────────┤   │
│   │  • Category & tag filters │    │   Active Chat Thread  │     "My Tasks" Hub    │   │
│   │  • Chats / Tasks switcher │    │ • DateDivider stream  │ • Segmented Filters   │   │
│   │  • Global real-time search│    │ • OutputCard & Tags   │ • Overdue / Upcoming  │   │
│   │  • PWA install trigger    │    │ • Voice / Image cards │ • Inline Quick Add    │   │
│   │  • Settings & JSON backup │    │ • InputBar (Dynamic)  │ • Expandable Drawer   │   │
│   └─────────────┬─────────────┘    └───────────┬───────────┴───────────┬───────────┘   │
│                 │                              │                       │               │
│                 └──────────────────────────────┼───────────────────────┘               │
│                                                ▼                                       │
│                       ┌─────────────────────────────────────────────────┐              │
│                       │          Multi-Select & Export Systems          │              │
│                       ├─────────────────────────────────────────────────┤              │
│                       │ • MultiSelectBar (Counter, Select/Deselect All) │              │
│                       │ • ExportSnapshotModal (PNG via html-to-image)   │              │
│                       │ • ExportPdfModal (Snapshot & Vector via jsPDF)  │              │
│                       │ • exportOutputsAsMarkdown (.md chronological)   │              │
│                       │ • ConfirmBulkDeleteModal (Safe batch deletion)  │              │
│                       └────────────────────────┬────────────────────────┘              │
│                                                │                                       │
│                                                ▼                                       │
│                       ┌─────────────────────────────────────────────────┐              │
│                       │            Local-First Storage Engine           │              │
│                       │            (src/utils/indexedDB.ts)             │              │
│                       └────────────────────────┬────────────────────────┘              │
│                                                │                                       │
│                         ┌──────────────────────┴──────────────────────┐                │
│                         ▼                                             ▼                │
│             ┌────────────────────────┐                    ┌───────────────────────┐    │
│             │  IndexedDB (Primary)   │                    │  localStorage         │    │
│             │  Stores: chats,        │                    │  Fallback & Settings  │    │
│             │  messages, meta        │                    │  Theme preference     │    │
│             └────────────────────────┘                    └───────────────────────┘    │
│                                                                                        │
├────────────────────────────────────────────────────────────────────────────────────────┤
│                           Progressive Web App (PWA) Layer                              │
│  • Workbox Navigation Fallback (`/index.html`)                                         │
│  • Immediate Auto-Update Engine (`useAutoUpdate.ts` & `controllerchange`)              │
│  • Asset precaching (Scripts, KaTeX Webfonts, CSS, Icons)                              │
│  • Visual Viewport synchronization (`useVisualViewport.ts` & `--app-height`)           │
│  • Offline connectivity detection (`OfflineIndicator` & `useOnlineStatus`)             │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 📱 Progressive Web App (PWA) & Offline Usage

KeepChat is deployed and installable directly from **[https://keepchatai.netlify.app/](https://keepchatai.netlify.app/)**. It functions seamlessly both online and 100% offline without any continuous network connection.

### Installation Instructions

| Platform | How to Install |
| :--- | :--- |
| **Android / Chrome** | Open **[https://keepchatai.netlify.app/](https://keepchatai.netlify.app/)**, tap the **Install KeepChat** banner button in the sidebar header or tap `⋮` in Chrome and choose **Install app** or **Add to Home screen**. |
| **iOS / Safari** | Open **[https://keepchatai.netlify.app/](https://keepchatai.netlify.app/)** in Safari, tap the **Share** button (square with upward arrow) at the bottom, scroll down, and select **Add to Home Screen**. |
| **macOS / Windows / Linux** | Visit **[https://keepchatai.netlify.app/](https://keepchatai.netlify.app/)**, click the **Install** icon in your browser address bar or click the download icon in KeepChat's sidebar header. |

### Offline & Update Guarantee
- **App Shell**: The service worker activates immediately on load, caching all scripts, stylesheets, and KaTeX mathematical font assets.
- **Immediate Updates**: When new code is deployed, the service worker takes control immediately without requiring manual cache clearing.
- **Data Persistence**: All created chats, prompts, outputs, tasks, voice recordings, and attachments live inside browser IndexedDB.
- **Zero Loss**: You can create, edit, search, export, and organize chats completely in airplane mode.

---

## 💡 AI Prompting & Markdown Cheatsheet

To get the cleanest, most structured outputs from ChatGPT, Claude, Gemini, or DeepSeek, append this directive to your prompt:

```markdown
Format as a copyable block of markdown. Include headers, code blocks with languages, and LaTeX math ($...$ or $$...$$) where applicable.
```

*(Tip: KeepChat has a 1-click "Copy Prompt" button in the bottom input bar and empty thread views).*

### Supported Syntax in KeepChat

#### 1. Code Blocks with Syntax Highlighting
````markdown
```typescript
interface TaskItem {
  id: string;
  title: string;
  deadline: string;
  isCompleted: boolean;
}

export function isOverdue(task: TaskItem): boolean {
  return !task.isCompleted && new Date(task.deadline) < new Date();
}
```
````

#### 2. LaTeX Mathematics (via KaTeX)
- **Inline Math**: `$E = mc^2$` or `$\sigma = \sqrt{\frac{1}{N}\sum_{i=1}^N (x_i - \mu)^2}$`
- **Block Equation**:
  ```markdown
  $$
  f(x) = \int_{-\infty}^\infty \hat{f}(\xi)\,e^{2\pi i \xi x}\,d\xi
  $$
  ```
- **Complex Formulas & Matrices**:
  ```markdown
  $$
  A = \begin{pmatrix} a_{11} & a_{12} \\ a_{21} & a_{22} \end{pmatrix}, \quad \det(A) = a_{11}a_{22} - a_{12}a_{21}
  $$
  ```

#### 3. Task Lists & Tables
```markdown
| Feature | Status | Export Format |
| :--- | :---: | :--- |
| Image Snapshot | ✅ | PNG (480px–1800px) |
| Paginated PDF | ✅ | Portrait & Landscape A4 |
| Markdown Vault | ✅ | .md (Chronological) |

- [x] Paste AI response
- [x] Convert to task with deadline
- [ ] Export summary report
```

---

## 🚀 Getting Started & Local Development

### 🌐 Instant Access (No Setup Required)

Open **[https://keepchatai.netlify.app/](https://keepchatai.netlify.app/)** in any modern browser on desktop, mobile, or tablet to start using KeepChat immediately. You can also install it to your home screen or desktop launcher as an offline PWA with 1 click.

### Local Development Prerequisites
- **Node.js**: `v18.0.0` or higher
- **npm**: `v9.0.0` or higher (or `bun` / `pnpm`)

### Local Installation & Setup

1. **Clone the repository**:
   ```bash
   git clone https://github.com/your-username/keepchat.git
   cd keepchat
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start the local development server**:
   ```bash
   npm run dev
   ```
   The application will start at `http://localhost:3000`.

4. **Build for production**:
   ```bash
   npm run build
   ```
   Compiles production-optimized assets, multi-page HTML entrypoints, and service worker into `dist/`.

5. **Typecheck & Lint**:
   ```bash
   npm run lint
   ```

---

## 🛠️ Tech Stack & Key Libraries

| Layer | Technology | Purpose |
| :--- | :--- | :--- |
| **Framework** | [React 19](https://react.dev/) | Modern concurrent UI architecture & hooks |
| **Build Tool** | [Vite 8](https://vite.dev/) | Ultra-fast bundling, multi-page HTML outputs, and dev server |
| **Language** | [TypeScript 5](https://www.typescriptlang.org/) | Strict static typing and schemas |
| **Styling** | [Tailwind CSS v4](https://tailwindcss.com/) | Utility-first responsive design, dynamic viewport height & WhatsApp themes |
| **Storage Engine** | [IndexedDB API](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API) | Client-side, local-first database (`chats`, `messages`, `meta`) |
| **Offline & PWA** | [vite-plugin-pwa](https://vite-pwa-org.netlify.app/) | Service worker, Workbox precaching, and app manifest |
| **Markdown Parser** | [react-markdown](https://github.com/remarkjs/react-markdown) | GFM tables, checklists, blockquotes, and custom elements |
| **Math Rendering** | [KaTeX](https://katex.org/) & [remark-math](https://github.com/remarkjs/remark-math) | Publication-grade LaTeX formula typesetting |
| **Syntax Highlighting** | [PrismJS](https://prismjs.com/) | Code colorization with language tags and copy button |
| **PDF Generation** | [jsPDF](https://github.com/parallax/jsPDF) | Client-side paginated PDF rendering (Snapshot & Vector text) |
| **Image Snapshots** | [html-to-image](https://github.com/bubkoo/html-to-image) | High-resolution 2× PNG snapshots with width controls |
| **Icons** | [Lucide React](https://lucide.dev/) | Consistent, lightweight vector icons |

---

## 🔒 Privacy & Data Ownership

- **100% Local-First**: All your data lives exclusively in your browser's private IndexedDB storage.
- **Zero Cloud Leakage**: No external database, tracking pixels, or AI API transmissions.
- **Total Portability**: Export any chat or selection to **PNG**, **PDF**, or **Markdown**, or export your complete database to **JSON** anytime.

---

## 📄 License

This project is open-source and licensed under the [MIT License](LICENSE).
