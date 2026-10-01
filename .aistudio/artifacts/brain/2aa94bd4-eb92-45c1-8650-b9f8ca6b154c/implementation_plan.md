# Clean Down-Arrow Floating Button (Remove Number Badge)

Remove the numeric counter badge from the floating scroll-to-bottom down arrow button, maintaining a sleek, minimalist WhatsApp-inspired circular arrow button.

---

## 1. User Request & Scope

- **Objective**: Remove the green numeric badge that appears on the scroll-to-bottom floating button when scrolled up.
- **Retained Behavior**:
  - The circular down-arrow button continues to appear whenever the user scrolls up past 150px in earlier outputs.
  - Clicking the button smoothly scrolls to the latest output.
  - The button disappears automatically when reaching the bottom or switching chat threads.

---

## 2. Component Design & Architecture

```
┌────────────────────────────────────────────────────────────┐
│ Output Scroll Area                                         │
│                                                            │
│   [ Output Card 1 ]                                        │
│   [ Output Card 2 ]                                        │
│                                                            │
│                               ┌──────────────────────┐     │
│                               │  Floating Button     │     │
│                               │  ┌────────────────┐  │     │
│                               │  │  ▼ (Chevron)   │  │     │
│                               │  └────────────────┘  │     │
│                               │  (Badge Removed)     │     │
│                               └──────────────────────┘     │
├────────────────────────────────────────────────────────────┤
│ Input Bar (≤ 8% viewport height)                           │
└────────────────────────────────────────────────────────────┘
```

---

## 3. Implementation Steps

1. **Update `src/components/ScrollToBottomButton.tsx`**:
   - Remove `newOutputCount` prop and badge rendering JSX (`<span className="...">{newOutputCount}</span>`).
   - Retain circular floating button, smooth hover styles, and smooth entrance/exit animations.

2. **Clean up `src/App.tsx`**:
   - Remove `newOutputsSinceScrolledUp` state and its references.
   - Retain `showScrollBottomBtn` and scroll-to-bottom click handlers.

3. **Verification**:
   - Run `lint_applet` and `compile_applet`.
   - Verify down arrow button appears smoothly on scroll-up without any badge.
