# KeepChat — AI Output Vault & Organizer

<p align="center">
  <img src="public/pwa-512x512.png" alt="KeepChat Logo" width="96" height="96" />
</p>

<p align="center">
  <strong>A centralized, WhatsApp-inspired vault to save, organize, search, and view Markdown-formatted AI outputs from ChatGPT, Gemini, Claude, and DeepSeek — featuring a futuristic tasks command hub, live progress telemetry HUD, and multi-format exports.</strong>
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

As we interact daily with AI models like **ChatGPT**, **Claude**, **Google Gemini**, and **DeepSeek**, valuable insights, code architectures, formulas, and actionable instructions quickly get scattered across browser tabs and disjointed chat histories.

**KeepChat** transforms this experience into a familiar, ultra-responsive **WhatsApp-style conversational interface**. It provides an offline-first personal repository to paste, archive, tag, and search AI outputs with native support for full Markdown rendering, syntax-highlighted code blocks, mathematical LaTeX equations, voice notes, and image attachments.

Beyond simple archiving, KeepChat turns insights into execution with a **futuristic Tasks Command Hub** featuring a live progress telemetry HUD, **multi-card image snapshots**, **paginated PDF documents (with selectable vector text)**, and **chronological Markdown exports**.

---

## ✨ Key Features

### 💬 Authentic WhatsApp-Inspired Experience
- **Adaptive Layout**: Persistent dual-pane view on desktop (`>768px`) with fluid WhatsApp Web proportioning; native single-pane flow on mobile (`<768px`) with smooth transitions and back navigation.
- **Visual Fidelity**: Authentic light (`#F0F2F5`) and dark (`#111B21` / `#202C33`) WhatsApp themes with authentic wallpaper pattern backgrounds.
- **Date Dividers**: Natural inline date badges grouping saved outputs (**TODAY**, **YESTERDAY**, or formatted calendar dates) that scroll smoothly with the stream.
- **Floating Scroll-to-Bottom Button**: WhatsApp-style circular action button that smoothly slides in when scrolling past 150px and scrolls directly to the newest message.
- **Ergonomic Send Button**: 48px circular emerald action button with flight micro-animations, tactile feedback, and keyboard shortcuts (`Ctrl+Enter` / `Cmd+Enter`).
- **Chat Pinning**: Pin up to 5 high-priority threads with hover quick-actions, header toggles, and mobile 450ms long-press gesture sheets.

### ⚡ Futuristic Tasks Command Hub & Telemetry HUD
- **Deep Obsidian & Neon Aesthetic**: Minimalist modern command interface styled in deep obsidian (`#0A0F14` / `#0D1520`) with sharp cyan (`#22D3EE`) and emerald accents, glowing hairline borders, and refined micro-interactions.
- **Live Progress Telemetry HUD**:
  - **Completion Gauge**: Circular SVG progress gauge showing real-time completion percentage and active task ratios.
  - **Impending Task Radar**: Active countdown tracker prioritizing the most urgent deadline or overdue task.
  - **Status Telemetry Breakdown**: Instant counters for All Tasks, Pending, Overdue, and Completed.
  - **Tag Matrix**: Frequency-ranked filter chips to cross-filter tasks across multiple chat threads.
- **Single-Card-Per-Row Widescreen Layout**: One expansive card per row across all viewport widths, ensuring ample horizontal breathing room for complex code blocks, math formulas, and prompt contexts.
- **Minimalist Hairline Perimeter**: Clean perimeter borders without distracting side bars or color blocks, ensuring a high-density, futuristic look.
- **Instant Operational Controls**:
  - 1-click completion toggle with smooth state transitions.
  - Quick-extend buttons (`+1d`, `+3d`, `+1w`) for rapid deadline recalibration.
  - Deadline Recalibration Modal with preset intervals and custom datetime picker.
  - Expandable/collapsible prompt summaries and rendered Markdown output previews.
  - **"Open in Chat"** navigation to jump straight to the source message inside the original chat thread.
  - Clean task removal with confirmation.

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
│   │  • Category & tag filters │    │   Active Chat Thread  │  Futuristic Tasks Hub │   │
│   │  • Chats / Tasks switcher │    │ • DateDivider stream  │ • Telemetry HUD & Bar │   │
│   │  • Global real-time search│    │ • OutputCard & Tags   │ • 1 Card / Row Stream │   │
│   │  • PWA install trigger    │    │ • Voice / Image cards │ • Status & Tag Matrix │   │
│   │  • Settings & JSON backup │    │ • InputBar (≤ 8% vh)  │ • Extend, Done & Chat │   │
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
│  • Asset precaching (Scripts, KaTeX Webfonts, CSS, Icons)                              │
│  • Offline connectivity detection (`OfflineIndicator` & `useOnlineStatus`)             │
│  └────────────────────────────────────────────────────────────────────────────────────────┘
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

### Offline Guarantee
- **App Shell**: The service worker activates immediately on load, caching all scripts, stylesheets, and KaTeX mathematical font assets.
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
   Compiles production-optimized assets and service worker into `dist/`.

5. **Typecheck & Lint**:
   ```bash
   npm run lint
   ```

---

## 🛠️ Tech Stack & Key Libraries

| Layer | Technology | Purpose |
| :--- | :--- | :--- |
| **Framework** | [React 19](https://react.dev/) | Modern concurrent UI architecture & hooks |
| **Build Tool** | [Vite 8](https://vite.dev/) | Ultra-fast bundling, HMR, and development tooling |
| **Language** | [TypeScript 5](https://www.typescriptlang.org/) | Strict static typing and schemas |
| **Styling** | [Tailwind CSS v4](https://tailwindcss.com/) | Utility-first responsive design, futuristic obsidian styling & WhatsApp themes |
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
