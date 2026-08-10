# Grabbit — Unimplemented / Stub Features (Remaining Work)

> Verified by reading every source file in full across:  
> `src/engine/`, `src/main/`, `src/preload/`, `src/server/`, `src/renderer/`  
>  
> 💡 **For completed & verified features, see [completed_features.md](file:///c:/Users/dwaip/OneDrive/Documents/Code/Github/electron%20apps/neobit/completed_features.md)**

---

## 🔴 Critical — Fake / Broken Behaviour

All initial Critical items (#1 to #7) and UI Shells (#8 to #11) have been **fully resolved and verified**. See [completed_features.md](file:///c:/Users/dwaip/OneDrive/Documents/Code/Github/electron%20apps/neobit/completed_features.md) for details:
- ✅ **#1 Real WebTorrent Download Flow**
- ✅ **#2 Authentic BitTorrent (.torrent) Metainfo Generation**
- ✅ **#3 Real Auto-Updater & GitHub Releases Integration**
- ✅ **#4 Dynamic Magnet Swarm Metadata Discovery**
- ✅ **#5 DownloadQueueManager Priority Scheduling & Concurrency**
- ✅ **#6 Menu Bar Export Transfer Logs IPC**
- ✅ **#7 Torrent Export / Creation IPC Wiring**
- ✅ **#8 Plugins Modal & Persistent Plugin Registry Lifecycle**
- ✅ **#9 Automations Engine & PostProcessor Event Dispatches**
- ✅ **#10 Script Console Backend Sandboxed Execution REPL**
- ✅ **#11 Notifications Panel Real-Time Push Event Bus**

---

## 🟠 UI Shells — Remaining Tasks

These have complete UIs but their actions either only mutate local React state or silently do nothing.

---

### 12. Profile Dropdown — All Buttons Are No-Ops

**File:** [`HeaderActions.tsx`](file:///c:/Users/dwaip/OneDrive/Documents/Code/Github/electron%20apps/neobit/src/renderer/src/components/topbar/HeaderActions.tsx)  
**Problem:** "Remote Control Server", "API Keys & Tokens", "Active Browser Connections", and "Lock / Sign Out" all just call `setIsProfileOpen(false)`. No navigation, no modal, no IPC call.

---

### 13. `HttpSourcesTab` — Only Shows URL, Hardcoded "OK" Label

**File:** [`HttpSourcesTab.tsx`](file:///c:/Users/dwaip/OneDrive/Documents/Code/Github/electron%20apps/neobit/src/renderer/src/components/inspector/HttpSourcesTab.tsx)  
**Problem:** Displays only the raw download URL and a hardcoded `"Primary Range Source OK"` badge. No multi-source management, mirror URL health monitoring, or per-chunk source allocation is shown or implemented.

---

### 14. `TrackersTab` — Falls Back to a Hardcoded Fake Tracker List

**File:** [`TrackersTab.tsx`](file:///c:/Users/dwaip/OneDrive/Documents/Code/Github/electron%20apps/neobit/src/renderer/src/components/inspector/TrackersTab.tsx)  
**Problem:** Uses `download?.trackers || defaultTrackers`. When real tracker data is absent (which it almost always is, since `DownloadItem` never populates the `trackers` field from the engine), it falls back to a hardcoded list including the fictional `udp://tracker.grabbit.io:6969/announce`. Similarly, DHT/PeX "node counts" are hardcoded at 342, 56, and 3. The "Add Tracker" button correctly calls `window.api.addTorrentTracker()` — but the displayed list won't reflect the change.

---

### 15. `GeneralTab` — Seeds/Peers Default to Hardcoded 12/45

**File:** [`GeneralTab.tsx`](file:///c:/Users/dwaip/OneDrive/Documents/Code/Github/electron%20apps/neobit/src/renderer/src/components/inspector/GeneralTab.tsx)  
**Problem:** Line 50: `{download.seedsCount || 12} / {download.peersCount || 45}`. When the engine provides no real peer data (which is the case for all downloads given item #4 above), the UI displays the hardcoded fallback values of 12 seeds and 45 peers.

---

### 16. Context Menu "Edit Trackers..." Opens the Wrong Modal

**File:** [`TaskContextMenu.tsx`](file:///c:/Users/dwaip/OneDrive/Documents/Code/Github/electron%20apps/neobit/src/renderer/src/components/tasktable/TaskContextMenu.tsx)  
**Problem:** "Edit trackers..." calls `onOpenHashModal(download)`. This opens the hash verification modal, not a tracker editing dialog. There is no dedicated tracker editor modal.

---

### 17. Context Menu "Torrent Options..." and "Force Reannounce" Are No-Ops

**File:** [`TaskContextMenu.tsx`](file:///c:/Users/dwaip/OneDrive/Documents/Code/Github/electron%20apps/neobit/src/renderer/src/components/tasktable/TaskContextMenu.tsx)  
**Problem:** Both items only call `onClose()`. No IPC, no modal, no action whatsoever.

---

### 18. Context Menu "Export .torrent..." Calls the Wrong IPC

**File:** [`TaskContextMenu.tsx`](file:///c:/Users/dwaip/OneDrive/Documents/Code/Github/electron%20apps/neobit/src/renderer/src/components/tasktable/TaskContextMenu.tsx)  
**Problem:** Calls `window.api?.exportQueue()` which exports the entire download list as a JSON file — not the torrent metadata for the selected download. The correct call is `window.api.exportTorrentFile(download.id)`, which has a working IPC handler.

---

### 19. Context Menu Rename / Set Location Use `prompt()` and Don't Persist to Backend

**File:** [`TaskContextMenu.tsx`](file:///c:/Users/dwaip/OneDrive/Documents/Code/Github/electron%20apps/neobit/src/renderer/src/components/tasktable/TaskContextMenu.tsx)  
**Problem:** Both actions use the native browser `prompt()` dialog — jarring in a frameless Electron app. More importantly, `onUpdateDownload()` only mutates local renderer state; no IPC call is made to actually rename or move the file on disk.

---

### 20. Context Menu Tags Submenu — Hardcoded, Clicking Does Nothing

**File:** [`TaskContextMenu.tsx`](file:///c:/Users/dwaip/OneDrive/Documents/Code/Github/electron%20apps/neobit/src/renderer/src/components/tasktable/TaskContextMenu.tsx)  
**Problem:** Tags are always hardcoded to `['grabbit', 'untagged']`. Clicking either option calls only `onClose()` — no tag is assigned, nothing is saved.

---

### 21. `AddDownloadModal` Tags Input Uses `prompt()` for the `[...]` Button

**File:** [`AddDownloadModal.tsx`](file:///c:/Users/dwaip/OneDrive/Documents/Code/Github/electron%20apps/neobit/src/renderer/src/components/modals/AddDownloadModal.tsx)  
**Problem:** The tags field's `[...]` button calls `prompt('Add tag:')`. Tags input from this dialog is stored only in local state as a plain string; it is never sent to the engine when submitting the download.

---

### 22. `AddDownloadModal` URL and Filename Are Pre-Filled With Hardcoded Defaults

**File:** [`AddDownloadModal.tsx`](file:///c:/Users/dwaip/OneDrive/Documents/Code/Github/electron%20apps/neobit/src/renderer/src/components/modals/AddDownloadModal.tsx)  
**Problem:** The `url` state is initialised to a hardcoded House of the Dragon magnet link. `filename` is hardcoded to `'House.of.the.Dragon.S03E07.1080p.x265-ELiTE'`. The save path is hardcoded to `'C:\\Users\\dwaip\\Videos'`. The "Quick Save Locations" dropdown is also hardcoded to `dwaip`'s personal paths. The file tree is a static hardcoded structure.  
**Impact:** Any new user sees a pre-filled download dialog for a pirated TV show with someone else's file paths.

---

### 23. `AddDownloadModal` Torrent Options (Sequential, Skip Hash, Stop Condition, etc.) Are Never Passed to the Engine

**File:** [`AddDownloadModal.tsx`](file:///c:/Users/dwaip/OneDrive/Documents/Code/Github/electron%20apps/neobit/src/renderer/src/components/modals/AddDownloadModal.tsx)  
**Problem:** The modal collects many options: `sequentialDownload`, `firstLastPiecesFirst`, `skipHashCheck`, `stopCondition`, `addToTopQueue`, `contentLayout`, `managementMode`, `neverShowAgain`. On submit (line 276-287), **none of these are passed** to `onAdd()`. Only `url`, `filename`, `savePath`, `category`, `priority: 'normal'`, and `threadCount: 8` are forwarded.

---

## 🟡 Partially Implemented — Missing Key Pieces

---

### 24. `AdaptiveQoS` — Never Instantiated or Called

**File:** [`AdaptiveQoS.ts`](file:///c:/Users/dwaip/OneDrive/Documents/Code/Github/electron%20apps/neobit/src/engine/AdaptiveQoS.ts)  
**Problem:** The class implements `evaluateQoS(currentPingMs)` to auto-throttle connections based on latency, but it is never instantiated or called from `DownloadManager`. No ping measurement is performed anywhere. The feature does nothing.

---

### 25. `PostProcessor` — Detection Logic Exists But Engine Never Calls It

**File:** [`PostProcessor.ts`](file:///c:/Users/dwaip/OneDrive/Documents/Code/Github/electron%20apps/neobit/src/engine/PostProcessor.ts)  
**Problem:**
- `processCompletedFile()` detects archives by file extension — but `DownloadManager` never invokes it when a download finishes.
- `executeWebhook()` sends HTTP POST requests for automation rules — but `DownloadManager` and `AutomationsModal` never call it.

---

### 26. `MediaWorker` / `yt-dlp` — No IPC, No Bundled Binary

**File:** [`MediaWorker.ts`](file:///c:/Users/dwaip/OneDrive/Documents/Code/Github/electron%20apps/neobit/src/engine/workers/MediaWorker.ts)  
**Problem:**
- Shells out to the `yt-dlp` CLI binary, which must be installed separately by the user — there's no bundled binary.
- No IPC handler in `ipc.ts` exposes this to the renderer.
- `SimpleAddDownloadModal` and `AddDownloadModal` would need to call `window.api.extractVideoFormats()`, which **does not exist** in the preload API.

---

### 27. `RemoteServer` — Only 2 Endpoints, No Auth, No Proper JSON-RPC

**File:** [`RemoteServer.ts`](file:///c:/Users/dwaip/OneDrive/Documents/Code/Github/electron%20apps/neobit/src/server/RemoteServer.ts)  
**Problem:** Only `GET /api/downloads` (list) and `POST /api/downloads` (add by URL) are implemented. Missing: pause, resume, cancel, settings, statistics. No authentication despite the "API Keys & Tokens" UI element. The aria2/qBittorrent-compatible JSON-RPC endpoint is indicated in the URL routing but the response is identical to the REST endpoint.

---

### 28. Native Messaging Host — Stdio Listener Never Started

**File:** [`native_messaging_host.ts`](file:///c:/Users/dwaip/OneDrive/Documents/Code/Github/electron%20apps/neobit/src/main/browser-integration/native_messaging_host.ts)  
**Problem:**
- `registerWindowsNativeMessagingHost()` correctly writes the Chrome registry key on startup.
- But `startNativeMessagingHost()` is **never called** — the stdin listener that would receive messages from the browser extension is never set up.
- The `nativeHost:install` IPC handler writes a manifest to a different path, creating an inconsistency with `registerWindowsNativeMessagingHost()`.
- `allowed_origins` is `['chrome-extension://*']` — Chrome rejects wildcards and requires a specific extension ID.

---

### 29. Browser Extension — Does Not Exist

The native messaging infrastructure implies a companion browser extension that sends URLs to Grabbit, but no extension code exists anywhere in this repository.

---

### 30. Settings Modal — Missing Features

**File:** [`SettingsModal.tsx`](file:///c:/Users/dwaip/OneDrive/Documents/Code/Github/electron%20apps/neobit/src/renderer/src/components/modals/SettingsModal.tsx)  
**Problem:**
- **"Bandwidth & RPC" tab:** Only global speed limit. Missing: per-category speed limits, proxy settings, RPC server toggle/port.
- **"General & Storage" tab:** Save path is a text input — no folder picker button (the `dialog:selectDirectory` IPC handler exists and works but isn't used here).
- **Theme options:** "Light Mode", "High Contrast", and "Custom Theme 🎨" are listed as `<option>` values but there are no corresponding CSS variables / theme implementations beyond the `ThemeCustomizerModal`.
- No way to enable/disable the `RemoteServer` from preferences.

---

### 31. `InspectorPanel` — "32 Threads" Is Hardcoded

**File:** [`InspectorPanel.tsx`](file:///c:/Users/dwaip/OneDrive/Documents/Code/Github/electron%20apps/neobit/src/renderer/src/components/inspector/InspectorPanel.tsx)  
**Problem:** Line 86 renders `<span>32 Threads</span>` unconditionally, ignoring the actual `download.threadCount` value.

---

### 32. Log Export — Writes Speed History JSON, Not Real Logs

**File:** [`ipc.ts`](file:///c:/Users/dwaip/OneDrive/Documents/Code/Github/electron%20apps/neobit/src/main/ipc.ts) — `logs:export`  
**Problem:** The handler only serialises the in-memory `speedHistory` array to a JSON file. No actual log lines, error events, or engine diagnostic data are captured or persisted anywhere in the codebase.

---

### 33. Seeding Status — Engine Never Transitions a Completed Torrent to `seeding`

**File:** [`DownloadManager.ts`](file:///c:/Users/dwaip/OneDrive/Documents/Code/Github/electron%20apps/neobit/src/engine/DownloadManager.ts)  
**Problem:** `DownloadStatus` includes `'seeding'` and the sidebar has a "Seeding" filter, but `DownloadManager` never sets `status = 'seeding'` after a torrent completes. `TorrentWorker.seedTorrent()` exists but is never called post-completion.

---

### 34. Several `StatusFilter` Values Never Produced by the Engine

**File:** [`types.ts`](file:///c:/Users/dwaip/OneDrive/Documents/Code/Github/electron%20apps/neobit/src/engine/types.ts)  
**Problem:** `StatusFilter` defines `stalled`, `checking`, `running`, `stopped`, `active`, `inactive` — these are never emitted as download statuses by the engine, so the corresponding sidebar filter buttons will always show 0 results.

---

### 35. Preload Type Declarations vs. Runtime — 8 Methods Are Missing

**Files:** [`index.d.ts`](file:///c:/Users/dwaip/OneDrive/Documents/Code/Github/electron%20apps/neobit/src/preload/index.d.ts) vs. [`index.ts`](file:///c:/Users/dwaip/OneDrive/Documents/Code/Github/electron%20apps/neobit/src/preload/index.ts)  
**Problem:** 8 methods are declared in the TypeScript types but **do not exist** in the actual preload implementation. Any renderer code calling them gets `undefined` at runtime (silent failure):

| Declared in `index.d.ts` | Present in `index.ts` |
|---|---|
| `pauseAll()` | ❌ |
| `resumeAll()` | ❌ |
| `clearCompleted()` | ❌ |
| `getCategories()` | ❌ |
| `setCategory()` | ❌ |
| `onDownloadsUpdated()` | ❌ |
| `onSpeedUpdated()` | ❌ |
| `onDownloadError()` | ❌ |

---

### 36. Speed History Not Persisted Across Restarts

**File:** [`Storage.ts`](file:///c:/Users/dwaip/OneDrive/Documents/Code/Github/electron%20apps/neobit/src/engine/Storage.ts)  
**Problem:** `loadSpeedHistory()` and `saveSpeedHistory()` are fully implemented, but neither is ever called by `StatsCollector` or `DownloadManager`. The `speed_history.json` file is never written or read. All chart history is lost on every restart.

---

### 37. `MenuBar` View Density / Zoom / Panel Toggles Are Local State Only

**File:** [`MenuBar.tsx`](file:///c:/Users/dwaip/OneDrive/Documents/Code/Github/electron%20apps/neobit/src/renderer/src/components/topbar/MenuBar.tsx)  
**Problem:** `density`, `zoomLevel`, `showSidebar`, `showInspector`, `showStatusBar` are local state variables inside `MenuBar`. They are never passed back to the layout — so toggling "Show Sidebar", "Show Inspector", changing density, or changing zoom level in the View menu has **zero visible effect** on the app.

---

### 38. Clipboard Detector Ignores `.torrent` File Paths

**File:** [`useClipboardDetector.ts`](file:///c:/Users/dwaip/OneDrive/Documents/Code/Github/electron%20apps/neobit/src/renderer/src/hooks/useClipboardDetector.ts)  
**Problem:** The hook only matches `https?://...` URLs and `magnet:?xt=urn:...` strings. A `.torrent` file path copied to the clipboard (e.g., `C:\Downloads\file.torrent`) is silently ignored — no prompt to open it appears.

---

### 39. `ThemeCustomizerModal` — `onSave` Writes to CSS Variables, But `Light Mode` and `High Contrast` Have No Implementation

**File:** [`ThemeCustomizerModal.tsx`](file:///c:/Users/dwaip/OneDrive/Documents/Code/Github/electron%20apps/neobit/src/renderer/src/components/modals/ThemeCustomizerModal.tsx)  
**Problem:** The modal correctly writes custom colors to CSS variables via `document.documentElement.style.setProperty()`. However, the "Light Mode" and "High Contrast" options in `SettingsModal` are just `<option>` values — there are no CSS variable presets for them anywhere. Selecting them applies no visible change.

---

## 🔵 Minor / Polish

| # | Area | Issue | File |
|---|---|---|---|
| 40 | Startup seed tasks | Hard-wires a test `httpbin.org` download + Sintel magnet on first launch — should be removed for production | [`index.ts`](file:///c:/Users/dwaip/OneDrive/Documents/Code/Github/electron%20apps/neobit/src/main/index.ts) |
| 41 | Pre-Allocation label | Inspector always shows "Pre-Allocation: ENABLED" regardless of actual disk state | [`InspectorPanel.tsx`](file:///c:/Users/dwaip/OneDrive/Documents/Code/Github/electron%20apps/neobit/src/renderer/src/components/inspector/InspectorPanel.tsx) |
| 42 | NetworkView fake data | When speed history < 10 samples, generates fake sinusoidal data for the graph using `Math.sin` | [`NetworkView.tsx`](file:///c:/Users/dwaip/OneDrive/Documents/Code/Github/electron%20apps/neobit/src/renderer/src/components/network/NetworkView.tsx) |
| 43 | Super Seeding toggle | Flips local boolean only, no IPC, no engine call | [`TaskContextMenu.tsx`](file:///c:/Users/dwaip/OneDrive/Documents/Code/Github/electron%20apps/neobit/src/renderer/src/components/tasktable/TaskContextMenu.tsx) |
| 44 | Auto Management toggle | Flips local boolean only, no IPC, no persistence | [`TaskContextMenu.tsx`](file:///c:/Users/dwaip/OneDrive/Documents/Code/Github/electron%20apps/neobit/src/renderer/src/components/tasktable/TaskContextMenu.tsx) |
| 45 | About modal version | Hardcodes `"v0.1.1"` — should read from `app.getVersion()` via IPC | [`AboutModal.tsx`](file:///c:/Users/dwaip/OneDrive/Documents/Code/Github/electron%20apps/neobit/src/renderer/src/components/modals/AboutModal.tsx) |
| 46 | CreateTorrent → startSeeding | On success, calls `addDownload(fakeJsonFilePath)` — won't actually seed since the file isn't a real torrent | [`ipc.ts`](file:///c:/Users/dwaip/OneDrive/Documents/Code/Github/electron%20apps/neobit/src/main/ipc.ts) |
| 47 | Resume on restart | Downloads in `downloading` state are correctly moved to `paused` on load, but are never auto-resumed | [`DownloadManager.ts`](file:///c:/Users/dwaip/OneDrive/Documents/Code/Github/electron%20apps/neobit/src/engine/DownloadManager.ts) |
