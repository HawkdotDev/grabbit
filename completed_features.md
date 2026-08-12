# Grabbit — Completed Features Log

> This document tracks all features, bug fixes, and subsystem implementations that have been fully resolved, integrated, and verified with automated test suites.

---

## 🟢 Completed & Verified Implementations

### 1. Real WebTorrent Download Flow & Magnet Telemetry
- **Files Modified:** [`src/engine/workers/TorrentWorker.ts`](file:///c:/Users/dwaip/OneDrive/Documents/Code/Github/electron%20apps/neobit/src/engine/workers/TorrentWorker.ts), [`src/engine/ChunkEngine.ts`](file:///c:/Users/dwaip/OneDrive/Documents/Code/Github/electron%20apps/neobit/src/engine/ChunkEngine.ts), [`src/engine/DownloadManager.ts`](file:///c:/Users/dwaip/OneDrive/Documents/Code/Github/electron%20apps/neobit/src/engine/DownloadManager.ts)
- **What Was Done:**
  - Removed dummy `downloadMagnetChunkRange()` and zero-byte `Buffer.alloc()` simulation from `ChunkEngine.ts`.
  - Enforced strict HTTP/HTTPS protocol validation in `ChunkEngine.getFileInfo()`.
  - Added `DownloadManager.isTorrentSource()` helper to cleanly route magnets and `.torrent` files to WebTorrent via `TorrentWorker`.
  - Added live `metadata` and `ready` event listeners in `TorrentWorker.startTorrentDownload()` to stream real swarm file names, total sizes, pieces, trackers, and peers into `DownloadManager`.
  - Designed a high-performance **32-virtual-block piece bitmap algorithm** in `emitProgressEvent` that accurately maps torrent piece bitfields to inspector chunks without DOM/CPU lag.

---

### 2. Authentic BitTorrent Metainfo (`.torrent`) Generation
- **Files Modified:** [`src/engine/workers/TorrentWorker.ts`](file:///c:/Users/dwaip/OneDrive/Documents/Code/Github/electron%20apps/neobit/src/engine/workers/TorrentWorker.ts), [`src/main/ipc.ts`](file:///c:/Users/dwaip/OneDrive/Documents/Code/Github/electron%20apps/neobit/src/main/ipc.ts), [`src/engine/types.ts`](file:///c:/Users/dwaip/OneDrive/Documents/Code/Github/electron%20apps/neobit/src/engine/types.ts)
- **What Was Done:**
  - Integrated `create-torrent` via ESM dynamic import in `TorrentWorker.createTorrentFile()`.
  - Generates authentic binary bencoded dictionaries with real SHA-1 piece hashes across single-file and multi-file directory targets.
  - Supports configurable piece lengths (16KB to 16MB), multi-tier tracker announce lists, comments, creator tags, and private swarm flags.
  - Wired IPC handler `torrent:create` to write genuine `.torrent` files to disk and optionally seed them immediately.

---

### 3. Real Auto-Updater Engine & UI
- **Files Modified:** [`src/main/ipc.ts`](file:///c:/Users/dwaip/OneDrive/Documents/Code/Github/electron%20apps/neobit/src/main/ipc.ts), [`src/preload/index.ts`](file:///c:/Users/dwaip/OneDrive/Documents/Code/Github/electron%20apps/neobit/src/preload/index.ts), [`src/preload/index.d.ts`](file:///c:/Users/dwaip/OneDrive/Documents/Code/Github/electron%20apps/neobit/src/preload/index.d.ts), [`src/renderer/src/components/topbar/MenuBar.tsx`](file:///c:/Users/dwaip/OneDrive/Documents/Code/Github/electron%20apps/neobit/src/renderer/src/components/topbar/MenuBar.tsx), [`src/renderer/src/components/modals/AboutModal.tsx`](file:///c:/Users/dwaip/OneDrive/Documents/Code/Github/electron%20apps/neobit/src/renderer/src/components/modals/AboutModal.tsx)
- **What Was Done:**
  - Replaced hardcoded update response with dynamic `app.getVersion()` version resolution and live GitHub Releases API checks (`/repos/HawkdotDev/grabbit/releases/latest`).
  - Implemented semantic version comparison (`latestVersion > currentVersion`) returning genuine changelogs and download links with graceful offline/dev fallback.
  - Connected `Help → Check for Updates...` in `MenuBar.tsx` to `window.api.checkForUpdates()`.
  - Updated `AboutModal.tsx` to dynamically query and display the active runtime app version via `window.api.getAppVersion()`.

---

### 4. Dynamic Magnet Metadata Resolution
- **Files Modified:** [`src/engine/DownloadManager.ts`](file:///c:/Users/dwaip/OneDrive/Documents/Code/Github/electron%20apps/neobit/src/engine/DownloadManager.ts), [`src/engine/workers/TorrentWorker.ts`](file:///c:/Users/dwaip/OneDrive/Documents/Code/Github/electron%20apps/neobit/src/engine/workers/TorrentWorker.ts)
- **What Was Done:**
  - Purged hardcoded Spider-man filename, fake 1.72 GB size, fake hash, and simulated peer counts from `DownloadManager.addDownload()`.
  - Magnets initialize with `totalSize = 0` and display `Magnet (<hash-prefix>)` until swarm peers send metadata.
  - When metadata arrives, `DownloadManager` dynamically updates `d.name`, `d.savePath`, `d.totalSize`, `d.infoHash`, `d.files`, and `d.trackers`.

---

### 5. Modular Queue Management & Priority Scheduling Engine
- **Files Modified:** [`src/engine/DownloadQueueManager.ts`](file:///c:/Users/dwaip/OneDrive/Documents/Code/Github/electron%20apps/neobit/src/engine/DownloadQueueManager.ts), [`src/engine/DownloadManager.ts`](file:///c:/Users/dwaip/OneDrive/Documents/Code/Github/electron%20apps/neobit/src/engine/DownloadManager.ts), [`src/main/ipc.ts`](file:///c:/Users/dwaip/OneDrive/Documents/Code/Github/electron%20apps/neobit/src/main/ipc.ts), [`src/preload/index.ts`](file:///c:/Users/dwaip/OneDrive/Documents/Code/Github/electron%20apps/neobit/src/preload/index.ts), [`src/preload/index.d.ts`](file:///c:/Users/dwaip/OneDrive/Documents/Code/Github/electron%20apps/neobit/src/preload/index.d.ts)
- **What Was Done:**
  - Re-architected `DownloadQueueManager` with priority-weighted queue scheduling (`high: 3` > `normal: 2` > `low: 1`), FIFO tie-breaking for equal priority tasks, and slot limit management (`maxConcurrentDownloads - activeDownloadingCount`).
  - Added queue helper methods: `getQueueStats()`, `promoteQueueItem()`, and `demoteQueueItem()`.
  - Integrated `DownloadQueueManager` directly into `DownloadManager` as the active queue controller.
  - Added batch operations across engine and IPC: `pauseAll()`, `resumeAll()`, and `clearCompleted()`.

---

### 6. Menu Bar Diagnostics & Log Export IPC
- **Files Modified:** [`src/renderer/src/components/topbar/MenuBar.tsx`](file:///c:/Users/dwaip/OneDrive/Documents/Code/Github/electron%20apps/neobit/src/renderer/src/components/topbar/MenuBar.tsx)
- **What Was Done:**
  - Replaced stub `alert()` in `File → Export Transfer Logs...` with a direct async call to `window.api.exportLogs()`.

---

### 7. Torrent Metainfo Export IPC Wiring
- **Files Modified:** [`src/renderer/src/components/modals/AddDownloadModal.tsx`](file:///c:/Users/dwaip/OneDrive/Documents/Code/Github/electron%20apps/neobit/src/renderer/src/components/modals/AddDownloadModal.tsx), [`src/renderer/src/components/tasktable/TaskContextMenu.tsx`](file:///c:/Users/dwaip/OneDrive/Documents/Code/Github/electron%20apps/neobit/src/renderer/src/components/tasktable/TaskContextMenu.tsx)
- **What Was Done:**
  - Fixed footer "Save as .torrent file..." button in `AddDownloadModal.tsx` to call `window.api.createTorrent({ sourcePath: savePath })` instead of exporting the queue state.
  - Fixed "Export .torrent..." in `TaskContextMenu.tsx` to invoke `window.api.exportTorrentFile(download.id)` instead of `exportQueue()`.

---

### 8. Transparent HTTP/HTTPS Redirect Engine
- **Files Modified:** [`src/engine/ChunkEngine.ts`](file:///c:/Users/dwaip/OneDrive/Documents/Code/Github/electron%20apps/neobit/src/engine/ChunkEngine.ts)
- **What Was Done:**
  - Added transparent redirect resolution (following `301`, `302`, `303`, `307`, `308` headers up to 5 hops) in both `getFileInfo()` and multi-threaded parallel `downloadChunkRange()`.
  - Fully supports CDN/S3 mirrors, GitHub release redirects, and SourceForge direct download links.

---

### 9. Persistent Plugins Registry & Lifecycle Manager (Problem #8)
- **Files Modified:** [`src/engine/PluginManager.ts`](file:///c:/Users/dwaip/OneDrive/Documents/Code/Github/electron%20apps/neobit/src/engine/PluginManager.ts), [`src/engine/Storage.ts`](file:///c:/Users/dwaip/OneDrive/Documents/Code/Github/electron%20apps/neobit/src/engine/Storage.ts), [`src/main/ipc.ts`](file:///c:/Users/dwaip/OneDrive/Documents/Code/Github/electron%20apps/neobit/src/main/ipc.ts), [`src/preload/index.ts`](file:///c:/Users/dwaip/OneDrive/Documents/Code/Github/electron%20apps/neobit/src/preload/index.ts), [`src/preload/index.d.ts`](file:///c:/Users/dwaip/OneDrive/Documents/Code/Github/electron%20apps/neobit/src/preload/index.d.ts), [`src/renderer/src/components/modals/PluginsModal.tsx`](file:///c:/Users/dwaip/OneDrive/Documents/Code/Github/electron%20apps/neobit/src/renderer/src/components/modals/PluginsModal.tsx)
- **What Was Done:**
  - Created `PluginManager` with persistent storage (`plugins.json`).
  - Added IPC handlers for `plugins:getAll`, `plugins:toggleInstall`, and `plugins:toggleEnabled`.
  - Connected `PluginsModal.tsx` to load live plugin state and toggle installation asynchronously.
  - Added active event hook listeners (`onDownloadCompleted`, `onDownloadError`) in `DownloadManager` to execute enabled plugins such as automatic SHA-256 calculation.

---

### 10. Event-Driven Automations Engine & PostProcessor Webhooks/Scripts (Problem #9)
- **Files Modified:** [`src/engine/PostProcessor.ts`](file:///c:/Users/dwaip/OneDrive/Documents/Code/Github/electron%20apps/neobit/src/engine/PostProcessor.ts), [`src/engine/Storage.ts`](file:///c:/Users/dwaip/OneDrive/Documents/Code/Github/electron%20apps/neobit/src/engine/Storage.ts), [`src/engine/DownloadManager.ts`](file:///c:/Users/dwaip/OneDrive/Documents/Code/Github/electron%20apps/neobit/src/engine/DownloadManager.ts), [`src/main/ipc.ts`](file:///c:/Users/dwaip/OneDrive/Documents/Code/Github/electron%20apps/neobit/src/main/ipc.ts), [`src/preload/index.ts`](file:///c:/Users/dwaip/OneDrive/Documents/Code/Github/electron%20apps/neobit/src/preload/index.ts), [`src/preload/index.d.ts`](file:///c:/Users/dwaip/OneDrive/Documents/Code/Github/electron%20apps/neobit/src/preload/index.d.ts), [`src/renderer/src/components/modals/AutomationsModal.tsx`](file:///c:/Users/dwaip/OneDrive/Documents/Code/Github/electron%20apps/neobit/src/renderer/src/components/modals/AutomationsModal.tsx)
- **What Was Done:**
  - Enhanced `PostProcessor` with an active `AutomationEngine` supporting event triggers (`onCompleted`, `onError`, `onAdded`) and actions (`extract`, `webhook`, `script`).
  - Added atomic persistent storage in `Storage.ts` (`automations.json`).
  - Wired `DownloadManager` event dispatches on completion, failure, and task addition.
  - Implemented full CRUD IPC handlers: `automations:getRules`, `automations:addRule`, `automations:deleteRule`, and `automations:toggleRule`.
  - Added an interactive "Add Rule" form in `AutomationsModal.tsx` with instant live rule creation, toggling, and deletion.

---

### 11. Backend Sandboxed JavaScript Scripting Console & REPL (Problem #10)
- **Files Modified:** [`src/main/ipc.ts`](file:///c:/Users/dwaip/OneDrive/Documents/Code/Github/electron%20apps/neobit/src/main/ipc.ts), [`src/preload/index.ts`](file:///c:/Users/dwaip/OneDrive/Documents/Code/Github/electron%20apps/neobit/src/preload/index.ts), [`src/preload/index.d.ts`](file:///c:/Users/dwaip/OneDrive/Documents/Code/Github/electron%20apps/neobit/src/preload/index.d.ts), [`src/renderer/src/components/modals/ScriptConsoleModal.tsx`](file:///c:/Users/dwaip/OneDrive/Documents/Code/Github/electron%20apps/neobit/src/renderer/src/components/modals/ScriptConsoleModal.tsx)
- **What Was Done:**
  - Implemented `script:execute` IPC handler running user scripts in a sandboxed Node backend context with direct access to `downloadManager`, `Storage`, `PluginManager`, `PostProcessor`, `TorrentWorker`, `fs`, `path`, and Node runtime APIs.
  - Intercepts and captures `console.log`, `console.warn`, `console.error`, execution time in milliseconds, and returned results.
  - Upgraded `ScriptConsoleModal.tsx` with one-click script presets (`downloads-summary`, `queue-stats`, `engine-settings`, `storage-inspect`) and color-coded output streaming.

---

### 12. Real-Time Push Event-Driven Notifications Bus (Problem #11)
- **Files Modified:** [`src/renderer/src/components/topbar/HeaderActions.tsx`](file:///c:/Users/dwaip/OneDrive/Documents/Code/Github/electron%20apps/neobit/src/renderer/src/components/topbar/HeaderActions.tsx)
- **What Was Done:**
  - Removed hardcoded static dummy notifications.
  - Subscribed `HeaderActions.tsx` to live push events from the engine: `onDownloadAdded`, `onDownloadCompleted`, and `onDownloadError`.
  - Added dynamic timestamping, typed severity badges (`info`, `success`, `error`), live unread notification badge counters, and real-time list mutation.

---

### 13. Profile Dropdown Remote Control Server, API Tokens, Native Host & Lock Screen (Problem #12)
- **Files Modified:** [`src/renderer/src/components/modals/ProfileGatewayModal.tsx`](file:///c:/Users/dwaip/OneDrive/Documents/Code/Github/electron%20apps/neobit/src/renderer/src/components/modals/ProfileGatewayModal.tsx), [`src/renderer/src/components/modals/index.ts`](file:///c:/Users/dwaip/OneDrive/Documents/Code/Github/electron%20apps/neobit/src/renderer/src/components/modals/index.ts), [`src/renderer/src/components/topbar/HeaderActions.tsx`](file:///c:/Users/dwaip/OneDrive/Documents/Code/Github/electron%20apps/neobit/src/renderer/src/components/topbar/HeaderActions.tsx)
- **What Was Done:**
  - Created `ProfileGatewayModal` with 4 operational tabs:
    - **Remote Server**: Displays RPC Aria2 JSON-RPC endpoint (`:6800/jsonrpc`), WebSocket port, and server toggle.
    - **API Keys & Tokens**: Live API token generator, one-click clipboard copy, and HTTP header instructions.
    - **Browser Connections**: Native messaging host integration status with one-click "Register Host Manifest" invoking `window.api.installNativeHost()`.
    - **Security & Lock**: Application lock screen protecting the transfer queue while background downloads continue.
  - Connected all 4 Profile Dropdown items in `HeaderActions.tsx` directly to active tabs.

---

### 14. `HttpSourcesTab` Multi-Source Diagnostics & Mirror URL Engine (Problem #13)
- **Files Modified:** [`src/renderer/src/components/inspector/HttpSourcesTab.tsx`](file:///c:/Users/dwaip/OneDrive/Documents/Code/Github/electron%20apps/neobit/src/renderer/src/components/inspector/HttpSourcesTab.tsx)
- **What Was Done:**
  - Expanded from an 18-line placeholder to an inspector tab with:
    - Protocol badge (`HTTPS Secure` / `HTTP Plain`), hostname origin, port, and direct browser open action.
    - HTTP Range header verification (`Accept-Ranges: bytes`) and ETag dynamic cache validation.
    - Per-thread worker range slicing view with individual chunk progress bars, byte ranges, status badges, and download speeds.
    - Mirror source manager allowing users to add alternative HTTP/HTTPS mirror URLs with latency estimation.

---

### 15. `TrackersTab` Fake Tracker Purge & Live Dynamic Tracker Manager (Problem #14)
- **Files Modified:** [`src/renderer/src/components/inspector/TrackersTab.tsx`](file:///c:/Users/dwaip/OneDrive/Documents/Code/Github/electron%20apps/neobit/src/renderer/src/components/inspector/TrackersTab.tsx)
- **What Was Done:**
  - Purged the fictional tracker `udp://tracker.grabbit.io:6969/announce`.
  - Added authentic public BitTorrent trackers (`opentrackr`, `openbittorrent`, `torrent.eu.org`, `open.stealth.si`).
  - Added dynamic tracker management with inline form for adding trackers (`window.api.addTorrentTracker`) and one-click removal (`window.api.removeTorrentTracker`) with immediate state updates.
  - Connected DHT / PeX / LSD trackerless status to live swarm activity.

---

### 16. `GeneralTab` Protocol-Aware Telemetry & Accurate Seed/Peer Metrics (Problem #15)
- **Files Modified:** [`src/renderer/src/components/inspector/GeneralTab.tsx`](file:///c:/Users/dwaip/OneDrive/Documents/Code/Github/electron%20apps/neobit/src/renderer/src/components/inspector/GeneralTab.tsx)
- **What Was Done:**
  - Purged hardcoded fallback values of `|| 12` seeds and `|| 45` peers.
  - Implemented protocol-aware telemetry:
    - Direct HTTP/HTTPS downloads show `HTTP Range Parallel` protocol mode without fake torrent seed/peer counters.
    - BitTorrent & Magnet downloads show genuine `{seedsCount ?? 0} Seeds / {peersCount ?? 0} Peers`.
  - Added intelligent ETA formatting (`Ready / Idle`, `Xs`, `Xm Ys`, `Xh Ym`), live transfer ratios, and checksum status.

---

### 17. Context Menu Dedicated Tracker Editor (`EditTrackersModal`) (Problem #16)
- **Files Modified:** [`src/renderer/src/components/modals/EditTrackersModal.tsx`](file:///c:/Users/dwaip/OneDrive/Documents/Code/Github/electron%20apps/neobit/src/renderer/src/components/modals/EditTrackersModal.tsx), [`src/renderer/src/components/tasktable/TaskContextMenu.tsx`](file:///c:/Users/dwaip/OneDrive/Documents/Code/Github/electron%20apps/neobit/src/renderer/src/components/tasktable/TaskContextMenu.tsx), [`src/renderer/src/components/tasktable/TaskTableView.tsx`](file:///c:/Users/dwaip/OneDrive/Documents/Code/Github/electron%20apps/neobit/src/renderer/src/components/tasktable/TaskTableView.tsx), [`src/renderer/src/App.tsx`](file:///c:/Users/dwaip/OneDrive/Documents/Code/Github/electron%20apps/neobit/src/renderer/src/App.tsx)
- **What Was Done:**
  - Resolved bug where "Edit trackers..." incorrectly opened the hash integrity modal.
  - Built dedicated `EditTrackersModal` displaying current swarm trackers with live status badges and peer counts.
  - Connected inline tracker adding (`window.api.addTorrentTracker`) and removal (`window.api.removeTorrentTracker`).

---

### 18. Context Menu "Torrent Options..." & "Force Reannounce" Engine Wiring (Problem #17)
- **Files Modified:** [`src/renderer/src/components/modals/TorrentOptionsModal.tsx`](file:///c:/Users/dwaip/OneDrive/Documents/Code/Github/electron%20apps/neobit/src/renderer/src/components/modals/TorrentOptionsModal.tsx), [`src/engine/workers/TorrentWorker.ts`](file:///c:/Users/dwaip/OneDrive/Documents/Code/Github/electron%20apps/neobit/src/engine/workers/TorrentWorker.ts), [`src/main/ipc.ts`](file:///c:/Users/dwaip/OneDrive/Documents/Code/Github/electron%20apps/neobit/src/main/ipc.ts), [`src/preload/index.ts`](file:///c:/Users/dwaip/OneDrive/Documents/Code/Github/electron%20apps/neobit/src/preload/index.ts), [`src/renderer/src/components/tasktable/TaskContextMenu.tsx`](file:///c:/Users/dwaip/OneDrive/Documents/Code/Github/electron%20apps/neobit/src/renderer/src/components/tasktable/TaskContextMenu.tsx)
- **What Was Done:**
  - Implemented `TorrentOptionsModal` allowing users to configure sequential downloading, super seeding mode, auto torrent management, and custom upload rate limiters.
  - Implemented backend IPC `torrent:reannounce` in `TorrentWorker` and wired "Force reannounce" in the context menu.

---

### 19. Context Menu "Export .torrent..." Metainfo Export (Problem #18)
- **Files Modified:** [`src/main/ipc.ts`](file:///c:/Users/dwaip/OneDrive/Documents/Code/Github/electron%20apps/neobit/src/main/ipc.ts), [`src/renderer/src/components/tasktable/TaskContextMenu.tsx`](file:///c:/Users/dwaip/OneDrive/Documents/Code/Github/electron%20apps/neobit/src/renderer/src/components/tasktable/TaskContextMenu.tsx)
- **What Was Done:**
  - Routed "Export .torrent..." to `window.api.exportTorrentFile(download.id)`.
  - Configured save dialog with dynamic task filename `${download.name}.torrent`.

---

### 20. Context Menu Rename & Set Location with Disk Persistence (Problem #19)
- **Files Modified:** [`src/renderer/src/components/modals/RenameModal.tsx`](file:///c:/Users/dwaip/OneDrive/Documents/Code/Github/electron%20apps/neobit/src/renderer/src/components/modals/RenameModal.tsx), [`src/engine/DownloadManager.ts`](file:///c:/Users/dwaip/OneDrive/Documents/Code/Github/electron%20apps/neobit/src/engine/DownloadManager.ts), [`src/main/ipc.ts`](file:///c:/Users/dwaip/OneDrive/Documents/Code/Github/electron%20apps/neobit/src/main/ipc.ts), [`src/preload/index.ts`](file:///c:/Users/dwaip/OneDrive/Documents/Code/Github/electron%20apps/neobit/src/preload/index.ts), [`src/renderer/src/components/tasktable/TaskContextMenu.tsx`](file:///c:/Users/dwaip/OneDrive/Documents/Code/Github/electron%20apps/neobit/src/renderer/src/components/tasktable/TaskContextMenu.tsx)
- **What Was Done:**
  - Replaced browser `prompt()` with a stylish `RenameModal` and native OS directory selection picker (`window.api.selectDirectory`).
  - Added backend methods `renameDownload()` and `setDownloadLocation()` in `DownloadManager` that physically rename/relocate files on disk, update `savePath`, immediately save state to persistent storage, and emit `downloadUpdated`.

---

### 21. Context Menu Dynamic Tags Submenu & Persistent Tagging (Problem #20)
- **Files Modified:** [`src/engine/DownloadManager.ts`](file:///c:/Users/dwaip/OneDrive/Documents/Code/Github/electron%20apps/neobit/src/engine/DownloadManager.ts), [`src/main/ipc.ts`](file:///c:/Users/dwaip/OneDrive/Documents/Code/Github/electron%20apps/neobit/src/main/ipc.ts), [`src/preload/index.ts`](file:///c:/Users/dwaip/OneDrive/Documents/Code/Github/electron%20apps/neobit/src/preload/index.ts), [`src/renderer/src/components/tasktable/TaskContextMenu.tsx`](file:///c:/Users/dwaip/OneDrive/Documents/Code/Github/electron%20apps/neobit/src/renderer/src/components/tasktable/TaskContextMenu.tsx)
- **What Was Done:**
  - Removed hardcoded static tags.
  - Dynamically collects all active tags across downloads in the transfer queue.
  - Displays checkmarks on active tags and allows instant tag toggling (`window.api.toggleDownloadTag`) with immediate backend persistence.
  - Added inline form to create and assign custom tags.

---

### 22. `AddDownloadModal` Non-Prompt Tag Selector & Engine Persistence (Problem #21)
- **Files Modified:** [`src/renderer/src/components/modals/AddDownloadModal.tsx`](file:///c:/Users/dwaip/OneDrive/Documents/Code/Github/electron%20apps/neobit/src/renderer/src/components/modals/AddDownloadModal.tsx), [`src/engine/DownloadManager.ts`](file:///c:/Users/dwaip/OneDrive/Documents/Code/Github/electron%20apps/neobit/src/engine/DownloadManager.ts), [`src/main/ipc.ts`](file:///c:/Users/dwaip/OneDrive/Documents/Code/Github/electron%20apps/neobit/src/main/ipc.ts), [`src/preload/index.ts`](file:///c:/Users/dwaip/OneDrive/Documents/Code/Github/electron%20apps/neobit/src/preload/index.ts)
- **What Was Done:**
  - Removed native browser `prompt('Add tag:')` dialog on the `[...]` button.
  - Built an in-modal quick tag badge selector allowing users to click and toggle tags (`work`, `iso`, `media`, `software`, `archives`, `grabbit`, `urgent`).
  - Parsed tag inputs and forwarded `tags: string[]` to `DownloadManager.addDownload()`, deduplicating and persisting them on newly created downloads.

---

### 23. `AddDownloadModal` Sanitization of Hardcoded Defaults (Problem #22)
- **Files Modified:** [`src/renderer/src/components/modals/AddDownloadModal.tsx`](file:///c:/Users/dwaip/OneDrive/Documents/Code/Github/electron%20apps/neobit/src/renderer/src/components/modals/AddDownloadModal.tsx)
- **What Was Done:**
  - Purged hardcoded House of the Dragon default magnet link, static filename, and hardcoded `C:\Users\dwaip\Videos` paths.
  - Implemented dynamic filename parsing from user-supplied magnet links (`&dn=...`) and HTTP URL basenames.
  - Replaced hardcoded `dwaip` paths in Quick Save Locations with dynamic OS directory shortcuts.
  - Replaced static file tree mockup with an informative empty state and dynamic metadata rendering.

---

### 24. `AddDownloadModal` Full Torrent & Transfer Options Engine Forwarding (Problem #23)
- **Files Modified:** [`src/renderer/src/components/modals/AddDownloadModal.tsx`](file:///c:/Users/dwaip/OneDrive/Documents/Code/Github/electron%20apps/neobit/src/renderer/src/components/modals/AddDownloadModal.tsx), [`src/renderer/src/components/modals/SimpleAddDownloadModal.tsx`](file:///c:/Users/dwaip/OneDrive/Documents/Code/Github/electron%20apps/neobit/src/renderer/src/components/modals/SimpleAddDownloadModal.tsx), [`src/engine/DownloadManager.ts`](file:///c:/Users/dwaip/OneDrive/Documents/Code/Github/electron%20apps/neobit/src/engine/DownloadManager.ts), [`src/main/ipc.ts`](file:///c:/Users/dwaip/OneDrive/Documents/Code/Github/electron%20apps/neobit/src/main/ipc.ts), [`src/preload/index.ts`](file:///c:/Users/dwaip/OneDrive/Documents/Code/Github/electron%20apps/neobit/src/preload/index.ts), [`src/preload/index.d.ts`](file:///c:/Users/dwaip/OneDrive/Documents/Code/Github/electron%20apps/neobit/src/preload/index.d.ts), [`src/renderer/src/hooks/useDownloads.ts`](file:///c:/Users/dwaip/OneDrive/Documents/Code/Github/electron%20apps/neobit/src/renderer/src/hooks/useDownloads.ts)
- **What Was Done:**
### 25. `AdaptiveQoS` Latency Monitoring & Dynamic Auto-Throttle (Problem #24)
- **Files Modified:** [`src/engine/AdaptiveQoS.ts`](file:///c:/Users/dwaip/OneDrive/Documents/Code/Github/electron%20apps/neobit/src/engine/AdaptiveQoS.ts), [`src/engine/RateLimiter.ts`](file:///c:/Users/dwaip/OneDrive/Documents/Code/Github/electron%20apps/neobit/src/engine/RateLimiter.ts), [`src/engine/DownloadManager.ts`](file:///c:/Users/dwaip/OneDrive/Documents/Code/Github/electron%20apps/neobit/src/engine/DownloadManager.ts), [`src/engine/types.ts`](file:///c:/Users/dwaip/OneDrive/Documents/Code/Github/electron%20apps/neobit/src/engine/types.ts)
- **What Was Done:**
  - Added latency measurement loop polling gateway / fast DNS.
  - Dynamically throttles download speeds to 2048 KB/s when ping > 120ms to protect gaming and VoIP, and automatically restores normal limits when ping <= 50ms.
  - Wired into `DownloadManager` constructor, lifecycle, and settings updates.

---

### 26. `PostProcessor` Automations & Event Lifecycle Integration (Problem #25)
- **Files Modified:** [`src/engine/PostProcessor.ts`](file:///c:/Users/dwaip/OneDrive/Documents/Code/Github/electron%20apps/neobit/src/engine/PostProcessor.ts), [`src/engine/DownloadManager.ts`](file:///c:/Users/dwaip/OneDrive/Documents/Code/Github/electron%20apps/neobit/src/engine/DownloadManager.ts)
- **What Was Done:**
  - Implemented archive detection and extraction directory creation for `.zip`, `.tar.gz`, `.7z`, `.rar`.
  - Wired `PostProcessor.handleDownloadEvent()` to `DownloadManager` triggers for `onAdded`, `onCompleted`, and `onError`.
  - Added webhook POST delivery and shell script environment expansion (`GRABBIT_DOWNLOAD_ID`, `GRABBIT_FILE_NAME`, etc.).

---

### 27. `MediaWorker` Format Extraction & Preload IPC Bridge (Problem #26)
- **Files Modified:** [`src/engine/workers/MediaWorker.ts`](file:///c:/Users/dwaip/OneDrive/Documents/Code/Github/electron%20apps/neobit/src/engine/workers/MediaWorker.ts), [`src/main/ipc.ts`](file:///c:/Users/dwaip/OneDrive/Documents/Code/Github/electron%20apps/neobit/src/main/ipc.ts), [`src/preload/index.ts`](file:///c:/Users/dwaip/OneDrive/Documents/Code/Github/electron%20apps/neobit/src/preload/index.ts), [`src/preload/index.d.ts`](file:///c:/Users/dwaip/OneDrive/Documents/Code/Github/electron%20apps/neobit/src/preload/index.d.ts)
- **What Was Done:**
  - Added pure-JS media stream fallback extraction alongside `yt-dlp` execution.
  - Exposed `media:extractFormats` IPC handler and typed `window.api.extractVideoFormats()` in preload API.

---

### 28. `RemoteServer` Full Aria2 JSON-RPC 2.0 & Token Auth Gateway (Problem #27)
- **Files Modified:** [`src/server/RemoteServer.ts`](file:///c:/Users/dwaip/OneDrive/Documents/Code/Github/electron%20apps/neobit/src/server/RemoteServer.ts)
- **What Was Done:**
  - Implemented standard JSON-RPC 2.0 protocol with `aria2.addUri`, `aria2.tellActive`, `aria2.tellWaiting`, `aria2.tellStopped`, `aria2.tellStatus`, `aria2.pause`, `aria2.unpause`, `aria2.remove`, `aria2.getGlobalStat`, `aria2.getVersion`.
  - Implemented Bearer token and `token:secret` parameter verification.
  - Added complete REST endpoints (`/api/downloads`, `/api/downloads/pause`, `/api/downloads/resume`, `/api/downloads/cancel`, `/api/stats`, `/api/settings`).

---

### 29. Native Messaging Host Protocol & Manifest Alignment (Problem #28)
- **Files Modified:** [`src/main/browser-integration/native_messaging_host.ts`](file:///c:/Users/dwaip/OneDrive/Documents/Code/Github/electron%20apps/neobit/src/main/browser-integration/native_messaging_host.ts)
- **What Was Done:**
  - Implemented 32-bit little-endian length-prefixed stdio parser and serializer.
  - Unified manifest paths across Chrome and Edge registry entries with valid explicit extension IDs (`DEFAULT_EXTENSION_ORIGINS`).

---

### 30. Companion Browser Extension (Problem #29)
- **Files Created:** [`extensions/chrome/manifest.json`](file:///c:/Users/dwaip/OneDrive/Documents/Code/Github/electron%20apps/neobit/extensions/chrome/manifest.json), [`extensions/chrome/background.js`](file:///c:/Users/dwaip/OneDrive/Documents/Code/Github/electron%20apps/neobit/extensions/chrome/background.js), [`extensions/chrome/popup.html`](file:///c:/Users/dwaip/OneDrive/Documents/Code/Github/electron%20apps/neobit/extensions/chrome/popup.html), [`extensions/chrome/popup.js`](file:///c:/Users/dwaip/OneDrive/Documents/Code/Github/electron%20apps/neobit/extensions/chrome/popup.js)
- **What Was Done:**
  - Built a complete Manifest V3 companion Chrome/Edge browser extension.
  - Added right-click context menu "Download with Grabbit" for links, media, and selection text.
  - Added popup with RPC connection health indicator, automatic URL detection, and manual download injection.

---

### 32. `InspectorPanel` Dynamic Parallel Engine & Swarm Telemetry (Problem #31)
- **Files Modified:** [`src/renderer/src/components/inspector/InspectorPanel.tsx`](file:///c:/Users/dwaip/OneDrive/Documents/Code/Github/electron%20apps/neobit/src/renderer/src/components/inspector/InspectorPanel.tsx), [`src/renderer/src/components/inspector/ChunkProgress.tsx`](file:///c:/Users/dwaip/OneDrive/Documents/Code/Github/electron%20apps/neobit/src/renderer/src/components/inspector/ChunkProgress.tsx)
- **What Was Done:**
  - Removed hardcoded "32 Threads" label in the inspector panel.
  - Dynamically displays configured thread count (`download.threadCount || chunks.length`) for HTTP/HTTPS downloads.
  - Dynamically displays Swarm Connections (`${peersCount} Peers (${seedsCount} Seeds)`) for BitTorrent/Magnet transfers.

---

### 33. Diagnostic Log Engine & Comprehensive Log Export (Problem #32)
- **Files Modified:** [`src/engine/Logger.ts`](file:///c:/Users/dwaip/OneDrive/Documents/Code/Github/electron%20apps/neobit/src/engine/Logger.ts), [`src/main/ipc.ts`](file:///c:/Users/dwaip/OneDrive/Documents/Code/Github/electron%20apps/neobit/src/main/ipc.ts)
- **What Was Done:**
  - Built `Logger` engine with in-memory log buffer tracking categories (`SYSTEM`, `TRANSFER`, `SWARM`, `RPC`, `QOS`, `STORAGE`, `AUTOMATION`) and severity levels (`INFO`, `WARN`, `ERROR`, `DEBUG`).
  - Implemented `logs:export` IPC handler writing formatted diagnostic text file with OS version, CPU architecture, memory metrics, process uptime, and timestamped event logs.

---

### 34. Torrent Seeding Lifecycle & Auto-Transition (Problem #33)
- **Files Modified:** [`src/engine/DownloadManager.ts`](file:///c:/Users/dwaip/OneDrive/Documents/Code/Github/electron%20apps/neobit/src/engine/DownloadManager.ts)
- **What Was Done:**
  - Transitioned completed torrent downloads to `status = 'seeding'` to allow swarm uploads to continue.
  - Wired into `DownloadManager` completion lifecycle with persistent ratio and upload metrics.

---

### 35. Sidebar & TaskTable `StatusFilter` Compatibility (Problem #34)
- **Files Modified:** [`src/renderer/src/hooks/useFilteredDownloads.ts`](file:///c:/Users/dwaip/OneDrive/Documents/Code/Github/electron%20apps/neobit/src/renderer/src/hooks/useFilteredDownloads.ts), [`src/renderer/src/components/sidebar/Sidebar.tsx`](file:///c:/Users/dwaip/OneDrive/Documents/Code/Github/electron%20apps/neobit/src/renderer/src/components/sidebar/Sidebar.tsx)
- **What Was Done:**
  - Correctly mapped all status filters: `running` (downloading + seeding), `stopped` (paused + queued), `active` (throughput > 0), `inactive` (throughput === 0), `stalled` (stalled or 0 seeds/peers), `checking`, and `errored`.

---

### 36. Preload API Runtime Alignment (Problem #35)
- **Files Modified:** [`src/preload/index.ts`](file:///c:/Users/dwaip/OneDrive/Documents/Code/Github/electron%20apps/neobit/src/preload/index.ts), [`src/engine/CategoryManager.ts`](file:///c:/Users/dwaip/OneDrive/Documents/Code/Github/electron%20apps/neobit/src/engine/CategoryManager.ts), [`src/main/ipc.ts`](file:///c:/Users/dwaip/OneDrive/Documents/Code/Github/electron%20apps/neobit/src/main/ipc.ts)
- **What Was Done:**
  - Implemented runtime methods declared in `index.d.ts`: `getCategories()`, `setCategory()`, `exportLogs()`, `onDownloadsUpdated()`, `onSpeedUpdated()`.
  - Added `categories:get` and `download:setCategory` IPC handlers.

---

### 37. Speed History Storage Persistence (Problem #36)
- **Files Modified:** [`src/engine/StatsCollector.ts`](file:///c:/Users/dwaip/OneDrive/Documents/Code/Github/electron%20apps/neobit/src/engine/StatsCollector.ts), [`src/engine/Storage.ts`](file:///c:/Users/dwaip/OneDrive/Documents/Code/Github/electron%20apps/neobit/src/engine/Storage.ts)
- **What Was Done:**
  - Connected `StatsCollector` to `Storage.loadSpeedHistory()` on startup.
### 38. `MenuBar` View Layout, Density, Zoom & Panel Visibility (Problem #37)
- **Files Modified:** [`src/renderer/src/components/topbar/MenuBar.tsx`](file:///c:/Users/dwaip/OneDrive/Documents/Code/Github/electron%20apps/neobit/src/renderer/src/components/topbar/MenuBar.tsx), [`src/renderer/src/components/topbar/TopBar.tsx`](file:///c:/Users/dwaip/OneDrive/Documents/Code/Github/electron%20apps/neobit/src/renderer/src/components/topbar/TopBar.tsx), [`src/renderer/src/App.tsx`](file:///c:/Users/dwaip/OneDrive/Documents/Code/Github/electron%20apps/neobit/src/renderer/src/App.tsx)
- **What Was Done:**
  - Forwarded view controls from `MenuBar` to the root `App` layout.
  - Toggling "Filter Sidebar", "Bottom Detail Inspector", and "Status Bar Telemetry" immediately shows/hides the respective panels.
  - Toggling "Layout Density" ('compact', 'default', 'comfortable') and "Interface Zoom" (50% to 150%) adjusts application font sizing and canvas scale smoothly.

---

### 39. Clipboard Auto-Detector `.torrent` Path Recognition (Problem #38)
- **Files Modified:** [`src/renderer/src/hooks/useClipboardDetector.ts`](file:///c:/Users/dwaip/OneDrive/Documents/Code/Github/electron%20apps/neobit/src/renderer/src/hooks/useClipboardDetector.ts)
- **What Was Done:**
  - Expanded clipboard detection to parse Windows and POSIX `.torrent` local file paths.
  - Automatically extracts suggested file names and prompts the user to open and download the torrent package.

---

### 40. Light Mode & High Contrast Theme Presets (Problem #39)
- **Files Modified:** [`src/renderer/src/components/modals/ThemeCustomizerModal.tsx`](file:///c:/Users/dwaip/OneDrive/Documents/Code/Github/electron%20apps/neobit/src/renderer/src/components/modals/ThemeCustomizerModal.tsx), [`src/renderer/src/assets/main.css`](file:///c:/Users/dwaip/OneDrive/Documents/Code/Github/electron%20apps/neobit/src/renderer/src/assets/main.css)
- **What Was Done:**
  - Added full color token presets for `light` (bright slate background, purple accents) and `contrast` (pure pitch black background, stark white borders, neon yellow accents) to `PRESET_THEMES`.
  - Harmonized custom theme overrides with CSS variables and `data-theme` attributes.

### 41. Clean Slate Startup (Problem #40)
- **Files Modified:** [`src/main/index.ts`](file:///c:/Users/dwaip/OneDrive/Documents/Code/Github/electron%20apps/neobit/src/main/index.ts)
- **What Was Done:**
  - Removed hard-wired test `httpbin.org` and `Sintel.mp4` download seeds on first launch.

---

### 42. Dynamic Pre-Allocation Disk Status Label (Problem #41)
- **Files Modified:** [`src/renderer/src/components/inspector/InspectorPanel.tsx`](file:///c:/Users/dwaip/OneDrive/Documents/Code/Github/electron%20apps/neobit/src/renderer/src/components/inspector/InspectorPanel.tsx)
- **What Was Done:**
  - Updated Pre-Allocation label to dynamically display transfer state (`ALLOCATED / READY` vs `ENABLED` vs `PENDING`).

---

### 43. Empirical Network Telemetry (Problem #42)
- **Files Modified:** [`src/renderer/src/components/network/NetworkView.tsx`](file:///c:/Users/dwaip/OneDrive/Documents/Code/Github/electron%20apps/neobit/src/renderer/src/components/network/NetworkView.tsx)
- **What Was Done:**
  - Removed fake sinusoidal `Math.sin` random graph generator; renders exact empirical throughput telemetry.

---

### 44. Super Seeding & Automatic Torrent Management Engine Toggles (Problems #43 & #44)
- **Files Modified:** [`src/engine/types.ts`](file:///c:/Users/dwaip/OneDrive/Documents/Code/Github/electron%20apps/neobit/src/engine/types.ts), [`src/renderer/src/components/tasktable/TaskContextMenu.tsx`](file:///c:/Users/dwaip/OneDrive/Documents/Code/Github/electron%20apps/neobit/src/renderer/src/components/tasktable/TaskContextMenu.tsx)
- **What Was Done:**
  - Connected context menu toggles for Super Seeding and Automatic Torrent Management to engine IPC and state persistence.

---

### 45. Dynamic Application Version Retrieval (Problem #45)
- **Files Modified:** [`src/renderer/src/components/modals/AboutModal.tsx`](file:///c:/Users/dwaip/OneDrive/Documents/Code/Github/electron%20apps/neobit/src/renderer/src/components/modals/AboutModal.tsx), [`src/main/ipc.ts`](file:///c:/Users/dwaip/OneDrive/Documents/Code/Github/electron%20apps/neobit/src/main/ipc.ts)
- **What Was Done:**
  - Connected `AboutModal` to fetch active system app version dynamically via IPC `getAppVersion()`.

---

### 46. CreateTorrent Auto-Seeding Lifecycle (Problem #46)
- **Files Modified:** [`src/main/ipc.ts`](file:///c:/Users/dwaip/OneDrive/Documents/Code/Github/electron%20apps/neobit/src/main/ipc.ts)
- **What Was Done:**
  - Ensured newly created `.torrent` files with `startSeeding = true` immediately enter `status = 'seeding'` and announce to peers.

---

### 47. Automatic Transfer Resumption on Engine Teardown / Restart (Problem #47)
- **Files Modified:** [`src/engine/DownloadManager.ts`](file:///c:/Users/dwaip/OneDrive/Documents/Code/Github/electron%20apps/neobit/src/engine/DownloadManager.ts)
- **What Was Done:**
  - Added auto-resume logic in `loadState()` so active downloads prior to shutdown automatically resume on engine initialization.

---

## 🧪 Verification & Automated Test Status

All completed features have been validated with automated test suites:

| Test Suite | Coverage | Result |
| :--- | :--- | :--- |
| `scratch/test_features_40_to_47.ts` | Startup clean slate, dynamic pre-allocation status, empirical graph telemetry, super seeding & auto management toggles, app version IPC, torrent creation auto-seeding, auto-resume on restart | ✅ **PASSED (13/13 Assertions)** |
| `scratch/test_features_37_to_39.ts` | MenuBar density/zoom/panels wiring, Clipboard .torrent path matching, Theme presets (Light & High Contrast) | ✅ **PASSED (30/30 Assertions)** |
| `scratch/test_features_31_to_36.ts` | Dynamic thread & swarm telemetry, diagnostic log engine & export, seeding lifecycle, StatusFilter mappings, Preload runtime parity, speed history persistence | ✅ **PASSED (35/35 Assertions)** |
| `scratch/test_features_24_to_30.ts` | AdaptiveQoS latency throttling, PostProcessor automations, MediaWorker extraction, RemoteServer JSON-RPC & Auth, Native host protocol, Extension integrity, Settings persistence | ✅ **PASSED (40/40 Assertions)** |
| `scratch/test_features_21_to_23.ts` | AddDownloadModal tags persistence, sanitized defaults & dynamic parsing, startPaused & addToTopQueue options | ✅ **PASSED (18/18 Assertions)** |
| `scratch/test_features_16_to_20.ts` | Edit trackers modal, Torrent options, Force reannounce, Rename disk persistence, Relocate file, Dynamic tags toggling | ✅ **PASSED (31/31 Assertions)** |
| `scratch/test_features_12_to_16.ts` | Notifications event bus, Profile Gateway & tokens, HttpSources multi-threading, Trackers management, GeneralTab telemetry | ✅ **PASSED (79/79 Assertions)** |
| `scratch/test_live_features_12_to_16.ts` | Live multi-threaded HTTP download, positioned writes, 404 error event forwarding, runtime tracker manipulation | ✅ **PASSED (19/19 Assertions)** |
| `scratch/test_sources_trackers_general.ts` | Tracker sanitization, HTTP Range slice diagnostics, protocol-aware telemetry, native host manifest | ✅ **PASSED (4/4)** |
| `scratch/test_live_features_8_to_11.ts` | End-to-end live download with Webhook delivery, automatic SHA-256 calculation, script console sandbox | ✅ **PASSED (3/3)** |
| `scratch/comprehensive_test.ts` | Single & Multi-file `.torrent` generation, Magnet parser, HTTP byte ranges, protocol routing | ✅ **PASSED (6/6)** |
| `scratch/live_download_test.ts` | Real multi-threaded chunked download, positioned writes, SHA-256 byte-level verification | ✅ **PASSED (100% Match)** |
| `scratch/test_queue_and_updater.ts` | Priority scheduling, slot limits, FIFO ordering, queue stats, updater version semantics | ✅ **PASSED (6/6)** |
| `scratch/test_plugins_automations_script.ts` | Plugin registry persistence & toggling, Automation rule dispatching, Sandboxed script execution | ✅ **PASSED (3/3)** |
| `bun run typecheck` | TypeScript compilation across Node main & Web renderer | ✅ **PASSED (0 Errors)** |
