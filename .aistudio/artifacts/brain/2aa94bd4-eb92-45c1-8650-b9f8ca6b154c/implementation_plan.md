# Implementation Plan: Welcome Message & Interactive Getting Started Guide

Replace existing sample data with a structured **"Getting Started with KeepChat"** guide thread containing a welcome message and comprehensive walkthrough outputs explaining all core features of the app.

---

### User Preferences Confirmed
1. **Organization**: Single "Getting Started with KeepChat" guide thread with step-by-step walkthrough outputs.
2. **Featured Topics**: Comprehensive coverage of all core capabilities (Saving outputs, Multi-Select exports to Image/PDF/Markdown, In-thread & global search, Starred items, and Backups).

---

### Proposed Structure in `src/data/seedData.ts`

#### 1. Guide Thread (`chat-welcome`)
- **Title**: `Getting Started with KeepChat`
- **Description**: `Welcome guide & interactive walkthrough to help you master your local AI output vault`
- **Category**: `Guide`
- **Default AI Model**: `ChatGPT`
- **Pinned**: `true` (pinned at the top of the sidebar)

#### 2. Walkthrough Outputs (Chronological Order)
1. **Welcome Message & Privacy Overview**:
   - Introduction to KeepChat: private, 100% offline, zero-telemetry vault for AI outputs.
   - WhatsApp-familiar UI overview.
2. **Saving & Organizing AI Outputs**:
   - How to use the bottom input bar with models (ChatGPT, Gemini, Claude, DeepSeek).
   - Adding user prompts, formatting Markdown & code blocks, hashtags (`#tags`), and media attachments.
3. **Single & Multi-Select Exports (Image, PDF & Markdown)**:
   - 1-click exports on any card: Image snapshot, paginated PDF (Snapshot & Selectable Text), and raw Markdown.
   - Using Multi-Select mode in the header/3-dot menu to bulk export or delete selected outputs.
4. **Search, Starred Filters, Pinning & Backups**:
   - In-thread search and sidebar search.
   - Starred output filters (`Star` button).
   - Pinning favorite threads.
   - JSON data backup and restore via Settings.

---

### Implementation Steps
1. Update `src/data/seedData.ts` with the new guide thread and outputs.
2. Ensure `loadStoredChats()` and `resetDBToSamples()` in `src/utils/indexedDB.ts` and `src/utils/storage.ts` work seamlessly with the new seed data.
3. Verify compilation with `lint_applet` and `compile_applet`.
