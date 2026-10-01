# Architecture Context: KeepChat

## System Components
1. **Client State**:
   - `chats`: List of chat threads (`ChatThread`), each containing metadata (id, title, category, aiModel, createdAt, updatedAt, isPinned, color).
   - `messages`: Collection of saved outputs (`SavedOutput`), tied to `chatId`, containing title/prompt, markdown content, aiModel, tags, timestamp, starred status.
   - `activeChatId`: Currently selected chat thread id (null when no chat selected on desktop).
   - `searchQuery`: Global search across thread titles and message contents.
   - `theme`: Light / Dark mode toggle with system preference fallback.
2. **Storage Layer**:
   - `localStorage` adapter (`KEEPCHAT_DATA_v1`) with seed initialization of realistic AI outputs so first-time users can immediately explore tables, code blocks, and markdown.
   - JSON export and import for backups and sharing.
   - Markdown export for individual threads or entire library.
3. **Parser Layer**:
   - `react-markdown` + `remark-gfm` with custom renderers for `table`, `th`, `td`, `code`, `pre`, `blockquote`, `a`, `ul`, `ol`.
   - Syntax highlighter based on `prismjs` for JS, TS, Python, Bash, SQL, JSON, Rust, Go, HTML, CSS, Markdown.
   - Copy-to-clipboard controller for code blocks and entire outputs.
