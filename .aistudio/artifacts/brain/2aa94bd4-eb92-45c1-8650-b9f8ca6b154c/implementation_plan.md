# Output Tagging System Implementation Plan

Allow users to easily add, manage, and filter custom tags on AI outputs directly from output cards and during output creation/editing.

---

## 1. User Feedback & Approved Scope

- **Where to Add/Manage Tags**: Both directly on output cards (via an inline quick `+ Tag` control) and during output creation/editing.
- **Tag Click Behavior**: Clicking any tag immediately filters the current chat thread to outputs bearing that tag.

---

## 2. Interaction & Architecture

```
┌────────────────────────────────────────────────────────────┐
│ OutputCard Footer                                          │
│                                                            │
│   🏷️ #python (✕)   🏷️ #algorithms (✕)   [+ Add Tag]        │
│                                           │                │
│                                           ▼                │
│                           [ #enter-tag... ] [✓] [✕]        │
├────────────────────────────────────────────────────────────┤
│ Clicking `#python`:                                        │
│   ==> Filters thread view to `Filtering: "#python"`        │
│   ==> Instant clear button to return to full conversation  │
└────────────────────────────────────────────────────────────┘
```

---

## 3. Implementation Steps

1. **Card Tag Management (`src/components/OutputCard.tsx`)**:
   - Add inline `+ Tag` popover/input in the card footer to quickly add tags without entering full edit mode.
   - Add removable `x` button on existing tag chips when hovering over them.
   - Support adding/editing tags within the card's full edit mode (`isEditing`).
   - Add `onTagClick` prop to trigger thread-level filtering when a user clicks any tag.

2. **Creation Tag Support (`src/components/InputBar.tsx`)**:
   - Enhance tag creation with interactive chips (press Enter, comma, or comma-separated text).
   - Display active tag chips with one-click remove (`x`).

3. **Thread Filtering & Persistence (`src/App.tsx`)**:
   - Update `handleEditOutput` in `App.tsx` to persist `tags` array updates to IndexedDB.
   - Connect `onTagClick` from `OutputCard` to set `inThreadSearchQuery(tag)`.
   - Ensure in-thread search seamlessly matches `#tag` or raw tag strings.

4. **Verification**:
   - Run `lint_applet` and `compile_applet`.
   - Test adding tags on output cards, removing tags, filtering on click, and saving new outputs with tags.
