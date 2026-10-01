# Indefinite Chat Output Editing

Allow users to edit any chat output in any thread indefinitely directly inside the message card, with customizable content, prompt title, and AI model tag, accompanied by a subtle WhatsApp-style "Edited" badge.

## User Review & Critical Decisions

> [!IMPORTANT]
> **Confirmed Choices from Clarifications**:
> 1. **Inline Editor**: Editing occurs directly within the message card without popup modal disruption, keeping conversational context in view.
> 2. **WhatsApp "Edited" Indicator**: A subtle, italicized `Edited` badge is displayed next to the timestamp and double checkmarks.
> 3. **Editable Fields**: Users can update the **Markdown content**, the **prompt title**, and the **AI model attribution** (ChatGPT, Gemini, Claude, DeepSeek).
> 4. **Indefinite Window**: No countdown or expiration lock; outputs can be edited at any time.

---

## 1. Overview & Core Concept

- **What It Does**: Adds an inline editor to every output card in the message stream. When activated via the pencil icon, the message card switches into an inline editor where users can revise the response text, tweak the prompt title, or change the AI model tag.
- **Target Audience**: AI power users, developers, and researchers curating prompts and model responses who need to refine saved outputs, fix formatting quirks, or adapt code snippets over time.
- **Key Value**: Preserves accurate knowledge by allowing ongoing curation of AI answers while maintaining full IndexedDB offline persistence and authentic WhatsApp aesthetics.

---

## 2. User Experience & Visual Design

```
┌────────────────────────────────────────────────────────────────────────┐
│  [Gemini ▼]   Refined System Architecture                     [Cancel] │
├────────────────────────────────────────────────────────────────────────┤
│  Prompt Title: [Design a resilient distributed cache                 ] │
│                                                                        │
│  Content (Markdown):                                                   │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │ ```typescript                                                    │  │
│  │ export interface CacheConfig { ttl: number; maxSize: number; }   │  │
│  │ ```                                                              │  │
│  │ Updated architecture with distributed invalidation logic.        │  │
│  └──────────────────────────────────────────────────────────────────┘  │
│                                                                        │
│  [Cancel (Esc)]                       [Save Changes (Ctrl+Enter) ✓]   │
└────────────────────────────────────────────────────────────────────────┘
```

- **Pencil Edit Trigger**: An edit icon appears alongside the Copy and Star actions in the top toolbar of every output card.
- **Inline Editing Workspace**:
  - **Model Tag Switcher**: Dropdown/selector allowing re-assignment between Gemini, ChatGPT, Claude, and DeepSeek.
  - **Prompt Title Field**: Clean input allowing updates to the prompt or topic headline.
  - **Full Markdown Editor**: Resizable, high-contrast monospace textarea with keyboard shortcuts (`Esc` to cancel, `Ctrl+Enter` / `Cmd+Enter` to save).
- **Subtle "Edited" Badge**: Once saved, the footer timestamp updates to show: `10:45 AM · Edited` with a tooltip indicating the last edit date/time.

---

## 3. Key Product Decisions & Trade-Offs

- **Decision 1: Inline Card State vs. Separate Modal**:
  - *Chosen Approach*: Inline editing directly within the card body.
  - *Why*: Prevents modal stacking fatigue, retains the surrounding conversation for visual context, and feels instantaneous.
- **Decision 2: Indefinite Window**:
  - *Chosen Approach*: No time limit.
  - *Why*: KeepChat is a personal knowledge vault rather than a public social network. Users need long-term control over their stored knowledge.
- **Decision 3: Field Extent**:
  - *Chosen Approach*: Content + Prompt Title + AI Model Tag.
  - *Why*: Users frequently organize outputs where the model was initially misattributed or the prompt needs clarification.

---

## 4. Technical Architecture & Data Strategy

```
┌────────────────────────────────────────────────────────┐
│                  App.tsx (Main State)                  │
│    - messages: SavedOutput[]                           │
│    - handleEditOutput(id, { content, title, model })  │
└───────────────────────────┬────────────────────────────┘
                            │ passes onEditOutput
                            ▼
┌────────────────────────────────────────────────────────┐
│                   OutputCard.tsx                       │
│    - isEditing: boolean                                │
│    - draftContent, draftTitle, draftModel              │
│    - Keyboard shortcuts: Esc -> Cancel, Ctrl+Enter -> Save
└───────────────────────────┬────────────────────────────┘
                            │ writes
                            ▼
┌────────────────────────────────────────────────────────┐
│                 IndexedDB (keepchat_db)                │
│    - isEdited: true, editedAt: timestamp               │
│    - persisted automatically across sessions           │
└────────────────────────────────────────────────────────┘
```

### Type Definition Updates (`src/types/keepchat.ts`)
```typescript
export interface SavedOutput {
  // ... existing fields ...
  isEdited?: boolean;
  editedAt?: number;
}
```

### Handler in `App.tsx`
```typescript
const handleEditOutput = (
  id: string,
  updates: { content: string; title?: string; aiModel?: AIModelType }
) => {
  setMessages((prev) =>
    prev.map((m) =>
      m.id === id
        ? {
            ...m,
            ...updates,
            isEdited: true,
            editedAt: Date.now(),
          }
        : m
    )
  );
  addToast('Output updated successfully', 'success');
};
```

---

## 5. Verification & Testing

1. **Trigger Edit**: Click the pencil icon on any output card (text, code, or image caption).
2. **Modify Content & Fields**: Edit the title prompt, switch the AI model tag, and update the markdown body.
3. **Save via Button or Shortcut**: Press `Ctrl+Enter` (or click "Save Changes"). Verify immediate visual update with the new markdown rendering and model badge.
4. **Inspect WhatsApp "Edited" Badge**: Confirm that `Edited` appears next to the timestamp.
5. **Persistence Check**: Refresh the page or inspect IndexedDB to confirm `isEdited` and modified text are permanently preserved.
6. **Code Quality**: Verify build with `lint_applet` and `compile_applet` with 0 errors.
