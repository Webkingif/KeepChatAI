# KeepChat — AI Output Vault & Organizer

<p align="center">
  <img src="public/favicon.svg" alt="KeepChat Logo" width="88" height="88" />
</p>

<p align="center">
  <strong>A centralized WhatsApp-inspired vault to save, organize, search, and view Markdown-formatted AI outputs from ChatGPT, Gemini, Claude, and DeepSeek.</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React-19.0-61DAFB?logo=react&logoColor=black" alt="React 19" />
  <img src="https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Vite-8.x-646CFF?logo=vite&logoColor=white" alt="Vite" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-v4-06B6D4?logo=tailwindcss&logoColor=white" alt="Tailwind CSS v4" />
  <img src="https://img.shields.io/badge/Storage-IndexedDB_Local--First-25D366?logo=googlechrome&logoColor=white" alt="IndexedDB" />
  <img src="https://img.shields.io/badge/PWA-100%25_Offline_Ready-008069?logo=pwa&logoColor=white" alt="PWA Ready" />
  <img src="https://img.shields.io/badge/Math-KaTeX-007ACC?logo=katex&logoColor=white" alt="KaTeX" />
</p>

---

## 📖 Overview

As we interact daily with AI models like **ChatGPT**, **Claude**, **Google Gemini**, and **DeepSeek**, valuable insights, code solutions, research notes, and formulas often get scattered and lost across browser tabs and disjointed chat histories.

**KeepChat** solves this with a familiar, ultra-responsive **WhatsApp-style conversational interface**. It provides an offline-first personal repository to paste, archive, tag, and search AI outputs with native support for full Markdown rendering, syntax-highlighted code blocks, mathematical LaTeX equations, voice notes, and image attachments.

---

## ✨ Key Features

- **💬 WhatsApp-Inspired Experience**:
  - Classic dual-pane layout with light and dark mode WhatsApp wallpaper backgrounds.
  - Familiar date dividers (*TODAY*, *YESTERDAY*, past dates) and thread bubbles.
  - Floating circular scroll-to-bottom button when reviewing earlier messages.
  - Responsive mobile single-screen navigation with fluid slide transitions.

- **🤖 Multi-Model Organization**:
  - Organize notes across dedicated threads for **ChatGPT**, **Google Gemini**, **Claude**, **DeepSeek**, or custom AI models.
  - Custom chat avatars, icons, and colors.
  - Thread-level default AI model selection with single-click model switching.

- **📝 Markdown, LaTeX & Syntax Highlighting**:
  - Full GitHub-Flavored Markdown (GFM) tables, checklists, blockquotes, and links.
  - Beautiful inline (`$...$`) and block (`$$...$$`) LaTeX math formulas powered by **KaTeX**.
  - Code syntax highlighting with copyable code blocks and language tags powered by **PrismJS**.

- **🎙️ Voice Notes & Attachments**:
  - Built-in audio voice recorder to save quick spoken thoughts or AI dictations.
  - Custom audio player with playback speed toggle (`1.0x`, `1.5x`, `2.0x`) and progress seek bar.
  - Image attachments with full-screen lightbox preview.

- **🔍 Lightning-Fast Search & Filtering**:
  - Global search across all chat threads by title, category, or preview text.
  - In-thread instant search filtering messages by prompt, output text, or custom tags.
  - One-click Starred/Favorite messages filter (`⭐`).

- **🛡️ 100% Offline-First Architecture**:
  - Full client-side persistence in browser **IndexedDB** with zero telemetry or tracking.
  - Progressive Web App (PWA) with Workbox service worker precaching: launches and works without any active network connection.
  - Complete data ownership: one-click JSON backup, restore, and Markdown export.

---

## 🏛️ System Architecture

```
┌────────────────────────────────────────────────────────────────────────┐
│                        KeepChat React 19 Frontend                      │
├────────────────────────────────────────────────────────────────────────┤
│                                                                        │
│   ┌───────────────────────────┐    ┌───────────────────────────────┐   │
│   │   Sidebar / Thread List   │    │    Active Conversation View   │   │
│   │  • Pinned / Starred chats │    │  • DateDivider scroll stream  │   │
│   │  • Category pills         │    │  • OutputCard (Markdown/Math) │   │
│   │  • Global real-time search│    │  • Voice player & attachments │   │
│   │  • PWA install button     │    │  • ScrollToBottomButton       │   │
│   └─────────────┬─────────────┘    └───────────────┬───────────────┘   │
│                 │                                  │                   │
│                 └─────────────────┬────────────────┘                   │
│                                   ▼                                    │
│                 ┌───────────────────────────────────┐                  │
│                 │      Local-First Storage Layer    │                  │
│                 │      (src/utils/indexedDB.ts)     │                  │
│                 └─────────────────┬─────────────────┘                  │
│                                   │                                    │
│             ┌─────────────────────┴─────────────────────┐              │
│             ▼                                           ▼              │
│  ┌───────────────────────┐                    ┌───────────────────┐    │
│  │ IndexedDB (Primary)   │                    │ localStorage      │    │
│  │ Store: chats, messages│                    │ Fallback & Themes │    │
│  └───────────────────────┘                    └───────────────────┘    │
│                                                                        │
├────────────────────────────────────────────────────────────────────────┤
│                       PWA & Offline Service Worker                     │
│  • Workbox Navigation Fallback (`/index.html`)                         │
│  • Precached Bundles, KaTeX Webfonts, Icons & Styles                   │
│  • CacheFirst Strategy for Google Web Fonts                            │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 📱 Progressive Web App (PWA) & Offline Usage

KeepChat is engineered as a standalone Progressive Web App that works seamlessly offline.

### Installation Instructions

| Platform | How to Install |
| :--- | :--- |
| **Android / Chrome** | Tap the **Install KeepChat** banner button in the sidebar header or tap `⋮` in Chrome and choose **Install app** or **Add to Home screen**. |
| **iOS / Safari** | Tap the **Share** button (box with upward arrow) at the bottom of Safari, scroll down, and select **Add to Home Screen**. |
| **macOS / Windows / Linux** | Click the **Install** icon in the Chrome/Edge address bar or click the download icon in KeepChat's sidebar header. |

### Offline Guarantee
- **App Shell**: The service worker activates immediately on load, caching all scripts, stylesheets, and KaTeX mathematical font assets.
- **Data Persistence**: All created chats, prompts, outputs, voice recordings, and attachments live inside your browser's IndexedDB. You can create, edit, search, and organize chats in airplane mode.

---

## 💡 AI Prompting & Markdown Cheatsheet

For the cleanest outputs when chatting with ChatGPT, Gemini, or Claude, end your prompt with this directive:

```markdown
Format as a copyable block of markdown. Include headers, code blocks with languages, and LaTeX math ($...$ or $$...$$) where applicable.
```

### Supported Syntax in KeepChat

#### 1. Code Blocks with Highlighting
````markdown
```python
def fibonacci(n: int) -> int:
    if n <= 1:
        return n
    return fibonacci(n - 1) + fibonacci(n - 2)
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

#### 3. Task Lists & Tables
```markdown
| Feature | Supported | Description |
| :--- | :---: | :--- |
| Markdown | ✅ | Full GFM formatting |
| KaTeX Math | ✅ | Inline and display blocks |
| Offline | ✅ | 100% client-side PWA |

- [x] Create project
- [x] Configure PWA
- [ ] Save new outputs
```

---

## 🚀 Getting Started & Local Development

### Prerequisites
- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher

### Installation

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
   Production assets and the PWA service worker will be compiled into the `dist/` directory.

5. **Typecheck & Lint**:
   ```bash
   npm run lint
   ```

---

## 🛠️ Tech Stack & Key Libraries

| Layer | Technology | Purpose |
| :--- | :--- | :--- |
| **Framework** | [React 19](https://react.dev/) | Component architecture & modern hooks |
| **Build Tool** | [Vite 8](https://vite.dev/) | Ultra-fast bundling & development server |
| **Language** | [TypeScript 5](https://www.typescriptlang.org/) | Type safety & strict contracts |
| **Styling** | [Tailwind CSS v4](https://tailwindcss.com/) | Utility-first responsive design & WhatsApp styling |
| **Offline / PWA** | [vite-plugin-pwa](https://vite-pwa-org.netlify.app/) | Service worker generation & asset precaching |
| **Storage** | [IndexedDB API](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API) | High-capacity, local-first client storage |
| **Markdown** | [react-markdown](https://github.com/remarkjs/react-markdown) | Markdown rendering with GFM support |
| **Math Engine** | [KaTeX](https://katex.org/) | High-speed LaTeX formula typesetting |
| **Syntax Highlighting** | [PrismJS](https://prismjs.com/) | Code colorization for popular languages |
| **Icons** | [Lucide React](https://lucide.dev/) | Clean, consistent icons |

---

## 🔒 Privacy & Data Ownership

- **Zero Cloud Tracking**: KeepChat does not send your saved chats or AI outputs to any external server.
- **Local-Only**: Everything stays in your browser's private IndexedDB storage.
- **Portable**: Export your entire vault to standard JSON or individual chats to `.md` files at any time.

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).
