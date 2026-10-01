# Progressive Web App (PWA) Implementation Plan

Transform KeepChat into an installable, offline-capable Progressive Web App (PWA) using `vite-plugin-pwa`, complete with Web App Manifest, service worker caching, app home screen icons, in-app install buttons (Sidebar header and Settings view), and a connectivity status banner.

---

## 1. User Feedback & Confirmed Decisions

- **In-App Install Button**: Placed in both the **Sidebar header** (prominent quick-access button) and the **Settings view** (dedicated app installation card).
- **Offline Indicator**: A subtle, non-intrusive banner indicating offline mode when network connection is lost.
- **PWA Branding**: Identity configured as "KeepChat" (`short_name: "KeepChat"`), styled with WhatsApp deep teal status bar (`#008069`) and dark theme surface color (`#111b21`).

---

## 2. Architecture & Technical Strategy

### System Architecture Diagram
```
┌────────────────────────────────────────────────────────────┐
│                    Web App Manifest                        │
│   (id: '/', name: 'KeepChat', theme: '#008069', icons)     │
└─────────────────────────────┬──────────────────────────────┘
                              │
┌─────────────────────────────▼──────────────────────────────┐
│        Service Worker (VitePWA / Workbox Precache)         │
│     - Precaches App Shell (HTML, CSS, JS, Fonts, Icons)    │
│     - CacheFirst for Google Fonts & static media assets    │
│     - DevOptions enabled for local & preview environments  │
└─────────────────────────────┬──────────────────────────────┘
                              │
┌─────────────────────────────▼──────────────────────────────┐
│                   In-App Install & Offline                 │
│  ┌───────────────────────┐      ┌────────────────────────┐ │
│  │   usePWAInstall Hook  │      │   useOnlineStatus Hook │ │
│  │ - beforeinstallprompt │      │ - online / offline ev  │ │
│  │ - iOS Safari guide    │      │ - subtle alert banner  │ │
│  └───────────┬───────────┘      └────────────────────────┘ │
│              │                                             │
│    ┌─────────┴─────────┐                                   │
│    ▼                   ▼                                   │
│ [Sidebar Header]  [Settings View]                          │
└────────────────────────────────────────────────────────────┘
```

---

## 3. Implementation Steps

1. **Install PWA Tooling**:
   - Install `vite-plugin-pwa` as a dev dependency via `install_applet_package`.

2. **Configure `vite.config.ts`**:
   - Register `VitePWA` plugin with `registerType: 'autoUpdate'`.
   - Configure Web App Manifest:
     - `name`: "KeepChat - AI Output Vault & Organizer"
     - `short_name`: "KeepChat" (≤ 12 characters)
     - `id`: "/"
     - `start_url`: "/"
     - `display`: "standalone"
     - `theme_color`: "#008069"
     - `background_color`: "#111b21"
     - `icons`: standard PNG resolutions (192x192, 512x512) and maskable icons.
   - Configure Workbox caching with `globPatterns` and `runtimeCaching` for Google Fonts.
   - Enable `devOptions.enabled: true` for AI Studio preview testing.

3. **Generate & Configure Icons**:
   - Create high-resolution PNG icon assets in `public/` (`pwa-192x192.png`, `pwa-512x512.png`, `apple-touch-icon.png`).
   - Update `index.html` with mobile PWA meta tags (`apple-mobile-web-app-capable`, `theme-color`, `apple-touch-icon`).

4. **Add React Hooks & Components**:
   - `src/hooks/usePWAInstall.ts`: Listens for `beforeinstallprompt`, tracks standalone installation state, and detects iOS Safari.
   - `src/hooks/useOnlineStatus.ts`: Tracks real-time online/offline network connectivity.
   - `src/components/PWAInstallButton.tsx`: Reusable install trigger with Android/Desktop native flow and iOS Safari step-by-step modal guide.
   - `src/components/OfflineIndicator.tsx`: Non-blocking offline notification banner.

5. **Mount in Application UI**:
   - **Sidebar Header (`Sidebar.tsx`)**: Mount install button in the top action bar next to New Chat and Settings.
   - **Settings View (`SettingsView.tsx`)**: Add a dedicated "Install KeepChat" card with platform badge and install trigger.
   - **App Root (`App.tsx`)**: Mount `OfflineIndicator`.

6. **Verification**:
   - Verify TypeScript compilation and linting via `lint_applet` and `compile_applet`.
   - Confirm PWA manifest and service worker load properly without regressions.
