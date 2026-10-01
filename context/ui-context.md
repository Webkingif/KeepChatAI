# UI Context: KeepChat

## Visual System: WhatsApp Structure × Gemini Aesthetics

### Color Palette
- **Light Theme**:
  - Sidebar background: `#F0F2F5` (WhatsApp classic)
  - Main chat area background: `#EFEAE2` with subtle WhatsApp doodle texture or `#F8F9FA`
  - Message bubble card: `#FFFFFF` (pure white card with clean border)
  - Primary Teal Accent: `#00A884` (WhatsApp action teal) / `#128C7E` (darker teal header)
  - Text: Slate 900 for headings, Slate 700 for body prose, Slate 500 for quiet metadata
- **Dark Theme**:
  - Sidebar background: `#111B21` (WhatsApp Dark)
  - Main chat area background: `#0B141A`
  - Message bubble card: `#202C33` (WhatsApp card charcoal)
  - Border: `#222D34` / `#2A3942`
  - Primary Teal Accent: `#00A884`
  - Text: Slate 100 for headings, Slate 300 for body prose, Slate 400 for quiet metadata

### Responsive Breakpoints
- **Desktop (>768px)**:
  - Sidebar: 340px to 380px fixed width or 32% width, left side.
  - Chat Pane: Flex-1 remaining width, right side.
  - If no chat selected: WhatsApp Web style welcome screen ("Select a chat to view your saved AI outputs, or create a new one.")
- **Mobile (<768px)**:
  - View 1 (List): Sidebar takes 100vw, with top app bar, search bar, and bottom Floating Action Button (FAB).
  - View 2 (Chat): Main pane takes 100vw, slides in, top bar includes native WhatsApp-style back arrow button.
