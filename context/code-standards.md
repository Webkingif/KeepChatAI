# Code Standards: KeepChat

## Guidelines
1. **TypeScript First**: Strict typing on all chat, message, filter, and theme states.
2. **Zero Dead Clicks**: Every button, modal trigger, copy button, pin toggle, delete action, search filter, and theme toggle has a responsive handler.
3. **No Slop**: Zero fake scoreboards, zero comment headers (`// 01_`), clean unboxed metadata with `·` separators.
4. **Ergonomic Touch Targets**: Minimum 44px hitboxes for mobile buttons and action icons.
5. **Clean Markdown & Tables**: GFM table rendering with horizontal scroll for wide tables, striped headers, crisp borders, and monospaced code blocks with syntax highlighting and instant copy confirmation.
