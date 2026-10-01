# KeepChat Official Logo Integration Plan

Integrate the user's KeepChat brand logo (the golden feather key with green speech-bubble emblem and stylized "KeepChat" lettering) across the application.

---

## 1. Visual Specification & Asset Design

The user provided `keepchat-192x192.png` and `keepchat-512x512.png`. We will implement a high-precision, scalable SVG and canvas-backed asset representation:

1. **The Emblem (`variant="icon"`)**:
   - **Outer Medallion**: Circular radial forest-green gradient (`#142b1f` to `#234934`) with an engraved laurel leaf wreath motif.
   - **Feather Quill Key Shaft**: Sculpted antique gold/bronze quill shaft (`#c6924b` with highlights `#f3d08a` and shadows `#7c5324`).
   - **Speech Bubble Bow**: Circular golden key head enclosing a vibrant emerald speech bubble with an upward curved leaf arrow.
   - **Ambient Illumination**: Subtle luminous aura matching the provided visual asset.

2. **The Full Brand Mark (`variant="full"`)**:
   - The central emblem accompanied by the official **KeepChat** wordmark below.
   - "Keep" in bold deep forest green (`#1e4d32` / `#2dd4bf` in dark mode).
   - "Chat" in warm caramel-gold (`#c48b48` / `#e2a865`) with the distinctive upward arrow flourish.

---

## 2. Integration Touchpoints Across the App

1. **Sidebar Brand Header (`Sidebar.tsx`)**:
   - Replace the generic Lucide `Bot` icon in the top left header with the official 36px KeepChat logo emblem.
   - Keep the clean WhatsApp Web layout with the logo, "KeepChat" title, and action icons (Settings, New Chat, Menu).

2. **Desktop Welcome & Placeholder Splash (`NoChatSelectedDesktop` in `EmptyStates.tsx`)**:
   - Replace the generic robot icon with the full KeepChat logo badge (96px emblem with glowing radial backdrop and typography).
   - Complement with the secure local storage badge and "New Chat Thread" CTA.

3. **Empty Chat Thread View (`EmptyThreadView` in `EmptyStates.tsx`)**:
   - Display the KeepChat circular logo mark above the "No outputs saved yet" greeting.

4. **Browser Tab Favicon & Meta Tags (`index.html`)**:
   - Update `<link rel="icon">` in `index.html` with an SVG data URI of the KeepChat emblem so the browser tab immediately displays the official logo.
   - Ensure `<title>` and OpenGraph tags align with the brand.

---

## 3. Implementation Steps

1. **Create `src/components/KeepChatLogo.tsx`**:
   - Vector-accurate React component supporting `size`, `variant="icon" | "full"`, and responsive dark/light mode accents.
2. **Update `index.html`**:
   - Set the browser favicon to the KeepChat emblem.
3. **Update `src/components/Sidebar.tsx`**:
   - Mount `<KeepChatLogo size={34} variant="icon" />` in the sidebar header.
4. **Update `src/components/EmptyStates.tsx`**:
   - Mount `<KeepChatLogo size={88} variant="full" />` in `NoChatSelectedDesktop`.
   - Mount `<KeepChatLogo size={56} variant="icon" />` in `EmptyThreadView`.
5. **Verify with `lint_applet` and `compile_applet`**.
