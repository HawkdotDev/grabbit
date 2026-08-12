# Deep Analysis: Torrent Download & Peer Connection Issues

This document provides a comprehensive technical audit of Grabbit's BitTorrent download engine, swarm wire handling, state management, and UI inspector telemetry. Each issue includes code locations, exact root causes, user impacts, and technical fix recommendations.

---

## 🚨 CRITICAL BUG REPORT: Why Torrents Are Currently Failing to Download & Disappearing from Dashboard

If torrent downloads are failing immediately or not appearing in the task dashboard, **Issues #13, #14, #15, #16, #17, and #18** represent the root causes. 

```
[ User Action: Add Magnet Link ]
              |
              v
[ AddDownloadModal: parseTorrentMetadata() ] ---> Adds magnet to WebTorrent client
              |
              v
[ User Clicks OK: DownloadManager.addDownload() ] ---> Calls parseTorrentMetadata() AGAIN (10-24s block!)
              |
              v
[ startTorrentDownload(): client.add() ] ---------> Throws "Error: Torrent already exists"!
              |
              v
[ DownloadManager: status = 'error' ] ------------> Download marked as errored!
              |
              v
[ UI TaskTableView: Filtered out by 'Running'/'Downloading' sidebar filter ]
              |
              v
 RESULT: Task immediately disappears from Dashboard & 0 KB/s download speed!
```

---

## 🏗️ Architectural Overview

```
+-----------------------------------------------------------------------+
|                             Renderer UI                               |
|  (TaskTableView / InspectorPanel / TrackersTab / PeersTab / Modals)   |
+-----------------------------------------------------------------------+
                                   |
                             IPC Channels
                                   v
+-----------------------------------------------------------------------+
|                            Main Process                               |
|                             (ipc.ts)                                  |
+-----------------------------------------------------------------------+
           |                                             |
           v                                             v
+-----------------------+                   +---------------------------+
|    DownloadManager    |                   |       TorrentWorker       |
| (State & Queue Mgmt)  |------------------>|  (WebTorrent Client Instance)
+-----------------------+                   +---------------------------+
                                                         |
                                                    p2p / wires
                                                         v
                                            +---------------------------+
                                            |   BitTorrent Swarm / DHT  |
                                            +---------------------------+
```

---

## 📋 Comprehensive Issue Catalog

---

### Issue #13: Duplicate Task Error Cascade & Dashboard Disappearance (FATAL)

* **Severity**: 💥 CRITICAL (Prevents All Torrent Downloads & Dashboard Rendering)
* **Affected Files**:
  * [`src/engine/workers/TorrentWorker.ts`](file:///c:/Users/dwaip/OneDrive/Documents/Code/Github/electron%20apps/neobit/src/engine/workers/TorrentWorker.ts#L328-L337)
  * [`src/engine/workers/TorrentWorker.ts`](file:///c:/Users/dwaip/OneDrive/Documents/Code/Github/electron%20apps/neobit/src/engine/workers/TorrentWorker.ts#L608-L620)
  * [`src/engine/DownloadManager.ts`](file:///c:/Users/dwaip/OneDrive/Documents/Code/Github/electron%20apps/neobit/src/engine/DownloadManager.ts#L405-L417)
  * [`src/renderer/src/hooks/useFilteredDownloads.ts`](file:///c:/Users/dwaip/OneDrive/Documents/Code/Github/electron%20apps/neobit/src/renderer/src/hooks/useFilteredDownloads.ts#L16-L20)

#### Technical Explanation
1. When a magnet URL is entered into `AddDownloadModal`, `parseTorrentMetadata` calls `fetchMagnetMetadata()`, which executes `client.add(magnetUrl)` on the shared WebTorrent client instance.
2. WebTorrent creates an active torrent task in `client.torrents` memory. Because magnet metadata has not finished resolving over DHT, `torrent.infoHash` remains empty (`""`) or unpopulated.
3. When the user submits the form, `DownloadManager.addDownload()` calls `startDownload()`, which executes `TorrentWorker.startTorrentDownload()`.
4. `startTorrentDownload()` tries to locate the existing task using `mag?.infoHash && t.infoHash?.toLowerCase() === mag.infoHash.toLowerCase()`. Because `t.infoHash` is empty, lookup fails (`undefined`).
5. `startTorrentDownload()` executes `client.add(torrentSource)` **a second time**. WebTorrent throws a fatal exception: `Error: Torrent already exists`.
6. `DownloadManager` catches the promise rejection and marks `download.status = 'error'`, `download.error = 'Torrent already exists'`.
7. `useFilteredDownloads` in the dashboard filters out errored downloads when viewing `'running'`, `'downloading'`, or `'active'` sidebar tabs.

#### Impact
Newly added torrents immediately crash with an error and disappear from the active task dashboard.

#### Recommended Fix
Clean up pre-fetch torrent instances before launching `startTorrentDownload()`, or safely reuse existing instances regardless of infoHash resolution state:
```typescript
if (!torrent) {
  const existing = client.torrents.find(t => t.magnetURI === torrentSource || t.infoHash === mag?.infoHash)
  if (existing) {
    torrent = existing
  } else {
    torrent = client.add(torrentSource, opts)
  }
}
```

---

### Issue #14: Double 10–24 Second Synchronous Blocking during Add (FATAL)

* **Severity**: 💥 CRITICAL (Causes UI Hang & IPC Timeout)
* **Affected Files**:
  * [`src/engine/DownloadManager.ts`](file:///c:/Users/dwaip/OneDrive/Documents/Code/Github/electron%20apps/neobit/src/engine/DownloadManager.ts#L210-L240)
  * [`src/engine/workers/TorrentWorker.ts`](file:///c:/Users/dwaip/OneDrive/Documents/Code/Github/electron%20apps/neobit/src/engine/workers/TorrentWorker.ts#L490-L510)

#### Technical Explanation
When adding a download:
1. `AddDownloadModal` calls `parseTorrentMetadata(url)` when opening (blocks 10–14 seconds testing 4 HTTPS cache endpoints and DHT).
2. When the user clicks "OK", `DownloadManager.addDownload()` executes:
   ```typescript
   const meta = await TorrentWorker.parseTorrentMetadata(url)
   ```
   It calls `parseTorrentMetadata()` **a second time**, forcing the backend IPC handler to block for an additional 10–24 seconds before calling `downloads.set()` or emitting `downloadAdded`.

#### Impact
The UI modal hangs for up to 24 seconds, causing Electron IPC calls to time out or drop before the download item is registered in state.

#### Recommended Fix
Pass already-parsed metadata from the frontend into `addDownload()`, or run metadata parsing asynchronously in the background *after* adding the download task to `DownloadManager`.

---

### Issue #15: `isTorrentSource()` Detection Flaw (FATAL for Uppercase / Query Torrent Links)

* **Severity**: 💥 CRITICAL (Routing Failure)
* **Affected Files**:
  * [`src/engine/DownloadManager.ts`](file:///c:/Users/dwaip/OneDrive/Documents/Code/Github/electron%20apps/neobit/src/engine/DownloadManager.ts#L145-L153)

#### Technical Explanation
`DownloadManager.isTorrentSource()` is implemented as:
```typescript
public static isTorrentSource(url: string): boolean {
  return (
    url.startsWith('magnet:') ||
    url.includes('magnet:') ||
    url.endsWith('.torrent') ||
    url.endsWith('.meta') ||
    url.endsWith('.metalink')
  )
}
```
If a magnet URL starts with uppercase `MAGNET:?`, or if a `.torrent` file path ends in `.TORRENT`, or if a torrent URL includes query params (e.g., `https://example.com/file.torrent?token=xyz`), `isTorrentSource()` evaluates to `false`.

#### Impact
Torrent transfers are misidentified as standard HTTP direct downloads. `DownloadManager` forwards the magnet URL to `ChunkEngine.getFileInfo()`, which crashes on invalid HTTP protocol headers (`TypeError: Invalid URL`), causing the task to fail immediately.

#### Recommended Fix
Use case-insensitive regex parsing:
```typescript
public static isTorrentSource(url: string): boolean {
  if (!url) return false
  const clean = url.trim().toLowerCase()
  return (
    clean.startsWith('magnet:') ||
    clean.includes('magnet:') ||
    /\.torrent(\?.*)?$/i.test(clean) ||
    /\.meta$/i.test(clean) ||
    /\.metalink$/i.test(clean)
  )
}
```

---

### Issue #16: Missing Save Directory Auto-Creation (FS `ENOENT` Write Crash)

* **Severity**: 🔴 High (File System Crash)
* **Affected Files**:
  * [`src/engine/workers/TorrentWorker.ts`](file:///c:/Users/dwaip/OneDrive/Documents/Code/Github/electron%20apps/neobit/src/engine/workers/TorrentWorker.ts#L602-L609)
  * [`src/engine/DiskAllocator.ts`](file:///c:/Users/dwaip/OneDrive/Documents/Code/Github/electron%20apps/neobit/src/engine/DiskAllocator.ts)

#### Technical Explanation
When `TorrentWorker.startTorrentDownload()` runs `client.add(torrentSource, { path: savePath })`, WebTorrent initializes file descriptors for piece writes. If `savePath` (e.g., `C:\Downloads\Grabbit`) does not yet exist on disk, `DiskAllocator.ensureDirectory(savePath)` is not called prior to `client.add()`.

#### Impact
Node `fs` throws an unhandled `ENOENT: no such file or directory` exception when opening piece file handles, causing the torrent task to abort.

#### Recommended Fix
Explicitly verify and create destination directories before passing `savePath` to WebTorrent:
```typescript
if (savePath) {
  DiskAllocator.ensureDirectory(savePath)
}
```

---

### Issue #17: WebTorrent UDP Tracker & DHT Socket Initialization Failures

* **Severity**: 🔴 High (0 KB/s Download Speed)
* **Affected Files**:
  * [`src/engine/workers/TorrentWorker.ts`](file:///c:/Users/dwaip/OneDrive/Documents/Code/Github/electron%20apps/neobit/src/engine/workers/TorrentWorker.ts#L208-L218)

#### Technical Explanation
In `TorrentWorker.getClient()`:
```typescript
this.client = new WebTorrent({
  maxConns: 500,
  dht: !opts?.disableP2PTracking,
  pex: true,
  lsd: true,
  webSeeds: true,
  wrtc: false,
  tracker: {
    rtcConfig: false
  }
})
```
In WebTorrent v3 running within Electron main process, setting `wrtc: false` and `tracker: { rtcConfig: false }` without explicitly enabling UDP socket bindings causes WebTorrent's tracker client to drop `udp://` tracker announces.

#### Impact
Because 99% of public BitTorrent swarms rely on UDP trackers (`udp://tracker.opentrackr.org:1337/announce`), WebTorrent fails to announce to any working trackers, resulting in **0 Seeds / 0 Peers** and 0 KB/s download speeds indefinitely.

#### Recommended Fix
Configure explicit tracker options enabling standard Node UDP sockets and DHT bootstrap nodes.

---

### Issue #18: Missing Exception Catching in Renderer `handleAddDownload`

* **Severity**: 🟡 Medium (UI Error Handling)
* **Affected Files**:
  * [`src/renderer/src/hooks/useDownloads.ts`](file:///c:/Users/dwaip/OneDrive/Documents/Code/Github/electron%20apps/neobit/src/renderer/src/hooks/useDownloads.ts#L76-L99)
  * [`src/renderer/src/components/modals/SimpleAddDownloadModal.tsx`](file:///c:/Users/dwaip/OneDrive/Documents/Code/Github/electron%20apps/neobit/src/renderer/src/components/modals/SimpleAddDownloadModal.tsx#L87-L106)

#### Technical Explanation
In `useDownloads.ts`:
```typescript
const handleAddDownload = useCallback(async (args) => {
  if (window.api) {
    await window.api.addDownload(args)
  }
}, [])
```
There is no `try/catch` wrapper around `window.api.addDownload(args)`. If `addDownload` throws an IPC error (or times out due to Issue #14), the error is swallowed or uncaught.

#### Impact
The add download modal closes, but React state (`setDownloads`) is never updated with the new download item.

#### Recommended Fix
Add a `try/catch` block and trigger a state reload (`getAllDownloads()`) upon successful addition.

---

### Issue #1: Progress Callback Loss on Resume (UI Telemetry Freeze)

* **Severity**: 🔴 High (Critical UX Defect)
* **Affected Files**: 
  * [`src/engine/workers/TorrentWorker.ts`](file:///c:/Users/dwaip/OneDrive/Documents/Code/Github/electron%20apps/neobit/src/engine/workers/TorrentWorker.ts#L575-L580)
  * [`src/engine/DownloadManager.ts`](file:///c:/Users/dwaip/OneDrive/Documents/Code/Github/electron%20apps/neobit/src/engine/DownloadManager.ts#L522-L540)

#### Technical Explanation
When a download is resumed after being paused, `DownloadManager.resumeDownload()` sets `download.status = 'queued'` and triggers `processQueue()`, which invokes `startDownload(id)`. This method calls `TorrentWorker.startTorrentDownload(downloadId, url, savePath, onProgress, onComplete)`.

In `TorrentWorker.startTorrentDownload()`:
```typescript
// Line 575 in TorrentWorker.ts
const existingInMap = this.torrentsMap.get(downloadId)
if (existingInMap) {
  existingInMap.resume()
  resolve(existingInMap)
  return
}
```
When `existingInMap` is found in `torrentsMap`, it calls `existingInMap.resume()` and immediately resolves the Promise. **Crucially, it does NOT re-register the newly passed `onProgress` or `onComplete` callback functions to the existing torrent instance.**

#### Impact
The torrent resumes downloading in the background, but no progress, speed, ETA, seeds, peers, or chunk update events are emitted to `DownloadManager`. The UI remains permanently frozen at the speed/progress values captured prior to pausing.

#### Recommended Fix
Re-attach or update progress/completion callback handlers when an existing torrent task is retrieved from `torrentsMap`.

---

### Issue #2: Zombie Swarm Connections & Background Bandwidth Consumption on Pause

* **Severity**: 🔴 High (Resource & Network Leak)
* **Affected Files**:
  * [`src/engine/DownloadManager.ts`](file:///c:/Users/dwaip/OneDrive/Documents/Code/Github/electron%20apps/neobit/src/engine/DownloadManager.ts#L505-L507)
  * [`src/engine/workers/TorrentWorker.ts`](file:///c:/Users/dwaip/OneDrive/Documents/Code/Github/electron%20apps/neobit/src/engine/workers/TorrentWorker.ts#L919-L924)

#### Technical Explanation
When a torrent download is paused, `DownloadManager.pauseDownload()` calls `TorrentWorker.pauseTorrent(id)`. In `TorrentWorker.ts`:
```typescript
public static pauseTorrent(downloadId: string): void {
  const torrent = this.torrentsMap.get(downloadId)
  if (torrent && typeof torrent.pause === 'function') {
    torrent.pause()
  }
}
```
In WebTorrent, calling `torrent.pause()` pauses incoming piece requests, but **does not disconnect active peer wires (`torrent.wires`), does not announce a stopped event to trackers, and does not halt upload choke/unchoke logic or DHT queries**.

#### Impact
Even when a torrent displays as "Paused" in the UI:
1. Peer wire TCP/UTP sockets remain open.
2. Upload bandwidth continues to be consumed by seeding to swarm peers.
3. Network ports stay open, generating background network noise.

#### Recommended Fix
Implement true swarm pausing by choking all active peer wires and pausing peer discovery.

---

### Issue #3: Disconnected Torrent Options (Sequential Downloading & Piece Priorities)

* **Severity**: 🟡 Medium (Feature Non-Functionality)
* **Affected Files**:
  * [`src/renderer/src/components/modals/TorrentOptionsModal.tsx`](file:///c:/Users/dwaip/OneDrive/Documents/Code/Github/electron%20apps/neobit/src/renderer/src/components/modals/TorrentOptionsModal.tsx)
  * [`src/engine/DownloadManager.ts`](file:///c:/Users/dwaip/OneDrive/Documents/Code/Github/electron%20apps/neobit/src/engine/DownloadManager.ts#L687-L695)

#### Technical Explanation
`DownloadManager.setTorrentOptions()` executes `Object.assign(d, options)` on local state, but **never calls `TorrentWorker` to configure WebTorrent piece selection strategy (`torrent.select()`, `torrent.critical()`)**.

#### Impact
Enabling "Sequential Download" or prioritizing header/footer pieces has zero effect on download order.

---

### Issue #4: Global Speed Limits & Adaptive QoS Bypassed by WebTorrent Engine

* **Severity**: 🔴 High (Protocol & Engine Flaw)
* **Affected Files**:
  * [`src/engine/DownloadManager.ts`](file:///c:/Users/dwaip/OneDrive/Documents/Code/Github/electron%20apps/neobit/src/engine/DownloadManager.ts#L37-L41)
  * [`src/engine/workers/TorrentWorker.ts`](file:///c:/Users/dwaip/OneDrive/Documents/Code/Github/electron%20apps/neobit/src/engine/workers/TorrentWorker.ts#L204-L227)

#### Technical Explanation
`TorrentWorker.getClient()` initializes WebTorrent without attaching speed limiters or token buckets. Neither global speed caps nor per-torrent speed caps set in settings are bound to WebTorrent client wire read/write streams.

#### Impact
BitTorrent downloads run at uncapped maximum line speed, ignoring speed limits and breaking Adaptive QoS latency management.

---

### Issue #5: Inaccurate Seed Count Telemetry via Static Formula

* **Severity**: 🟢 Low (Telemetry Accuracy)
* **Affected Files**:
  * [`src/engine/workers/TorrentWorker.ts`](file:///c:/Users/dwaip/OneDrive/Documents/Code/Github/electron%20apps/neobit/src/engine/workers/TorrentWorker.ts#L1055-L1056)

#### Technical Explanation
Seed count is estimated using a fixed mathematical calculation: `seedsCount: Math.floor((torrent.numPeers || 0) * 0.6)`.

#### Impact
The inspector reports an arbitrary 60% ratio of seeds to total peers instead of calculating true seeders from connected peer wire bitfields.

---

### Issue #6: Tracker Status Hardcoded to "Working" & Fake Per-Tracker Peer Counts

* **Severity**: 🟡 Medium (Inspector Data Accuracy)
* **Affected Files**:
  * [`src/engine/workers/TorrentWorker.ts`](file:///c:/Users/dwaip/OneDrive/Documents/Code/Github/electron%20apps/neobit/src/engine/workers/TorrentWorker.ts#L1004-L1008)

#### Technical Explanation
In `TorrentWorker.emitProgressEvent()`, trackers are mapped with hardcoded status `'working'` and uniform total swarm peer numbers.

#### Impact
Trackers that time out, fail DNS, or return HTTP 404 errors are displayed as working.

---

### Issue #7: Non-Persistent File Selection & Priority Settings Across Restarts

* **Severity**: 🟡 Medium (State Persistence Defect)
* **Affected Files**:
  * [`src/engine/workers/TorrentWorker.ts`](file:///c:/Users/dwaip/OneDrive/Documents/Code/Github/electron%20apps/neobit/src/engine/workers/TorrentWorker.ts#L854-L876)

#### Technical Explanation
`TorrentWorker.setFilePriority()` executes `targetFile.select()` or `deselect()`, but does not update `DownloadItem.files` in `DownloadManager` or trigger persistent state saving.

#### Impact
File priorities reset to default when Grabbit restarts.

---

### Issue #8: Duplicate Task Collision & Magnet Metadata Timeout Resolution Failure

* **Severity**: 🟡 Medium (Magnet Handling Defect)
* **Affected Files**:
  * [`src/engine/workers/TorrentWorker.ts`](file:///c:/Users/dwaip/OneDrive/Documents/Code/Github/electron%20apps/neobit/src/engine/workers/TorrentWorker.ts#L286-L403)

#### Technical Explanation
`fetchMagnetMetadata()` creates a temporary WebTorrent task. If metadata resolution times out, it leaves the temporary torrent object inside `client`, causing subsequent `client.add()` calls to throw `"Torrent already exists"`.

---

### Issue #9: Swarm Wire Event Listener Memory Leak Over Extended Sessions

* **Severity**: 🟡 Medium (Memory Management)
* **Affected Files**:
  * [`src/engine/workers/TorrentWorker.ts`](file:///c:/Users/dwaip/OneDrive/Documents/Code/Github/electron%20apps/neobit/src/engine/workers/TorrentWorker.ts#L668-L694)

#### Technical Explanation
Every time a new peer joins, `torrent.on('wire', ...)` attaches error listeners to `wire` instances without cleaning them up on peer disconnection.

---

### Issue #10: Multi-File Save Path Mismatch Between DownloadManager and WebTorrent Store

* **Severity**: 🟡 Medium (File System Consistency)
* **Affected Files**:
  * [`src/engine/DownloadManager.ts`](file:///c:/Users/dwaip/OneDrive/Documents/Code/Github/electron%20apps/neobit/src/engine/DownloadManager.ts#L357-L361)

#### Technical Explanation
Setting `torrent.path` directly on the JavaScript object after `client.add()` does not update WebTorrent's internal FS store, causing folder path mismatches when revealing files in File Explorer.

---

### Issue #11: Seeding Resumption State Transition Defect

* **Severity**: 🟡 Medium (State Machine Defect)
* **Affected Files**:
  * [`src/engine/DownloadManager.ts`](file:///c:/Users/dwaip/OneDrive/Documents/Code/Github/electron%20apps/neobit/src/engine/DownloadManager.ts#L393)

#### Technical Explanation
When a paused seeding torrent is resumed, WebTorrent's `done` event does not re-fire because the torrent is already 100% downloaded on disk.

#### Impact
Resumed seeding torrents remain stuck in `'downloading'` status instead of returning to `'seeding'`.

---

### Issue #12: Piece Bitmap Visual Compression Artifacts on Small Torrents

* **Severity**: 🟢 Low (UI Render Glitch)
* **Affected Files**:
  * [`src/engine/workers/TorrentWorker.ts`](file:///c:/Users/dwaip/OneDrive/Documents/Code/Github/electron%20apps/neobit/src/engine/workers/TorrentWorker.ts#L957-L1002)

#### Technical Explanation
Mapping small torrents (e.g. 4-8 pieces) to 32 virtual display blocks creates duplicate index ranges, causing progress bar visual glitches.

---

## 📊 Complete Summary Matrix

| # | Issue Title | Severity | Primary Impact |
| :-: | :--- | :-: | :--- |
| **13**| Duplicate Task Error Cascade | 💥 **CRITICAL** | Torrents crash on add and disappear from dashboard |
| **14**| Double 10–24s Synchronous Blocking | 💥 **CRITICAL** | UI hangs for 24 seconds during download creation |
| **15**| `isTorrentSource()` Regex Detection Flaw | 💥 **CRITICAL** | Uppercase magnets & query URLs crash engine |
| **16**| Missing Save Directory Auto-Creation | 🔴 **High** | Piece write `ENOENT` filesystem crashes |
| **17**| WebTorrent UDP Tracker Disabling | 🔴 **High** | 0 KB/s download speed & 0 peers on BitTorrent swarms |
| **18**| Missing Exception Catching in Renderer | 🟡 **Medium** | Add download form closes without updating React state |
| **1** | Progress Callback Loss on Resume | 🔴 **High** | UI speed and progress freeze after pause/resume |
| **2** | Zombie Swarm Connections on Pause | 🔴 **High** | Background upload & socket usage during pause |
| **3** | Disconnected Torrent Options | 🟡 **Medium** | Sequential download toggle has no effect |
| **4** | Speed Limits & QoS Bypassed | 🔴 **High** | BitTorrent ignores app bandwidth limits |
| **5** | Fake Seed Count Formula | 🟢 **Low** | Seed counts calculated via 60% static multiplier |
| **6** | Trackers Hardcoded to "Working" | 🟡 **Medium** | Dead trackers report as functional with fake peers |
| **7** | Non-Persistent File Selection | 🟡 **Medium** | File priorities reset on app restart |
| **8** | Duplicate Task Collision | 🟡 **Medium** | Magnet links error out on retry after timeout |
| **9** | Wire Listener Memory Leak | 🟡 **Medium** | Memory accumulation during long sessions |
| **10**| Multi-File Save Path Mismatch | 🟡 **Medium** | OS File Explorer "Show in Folder" path mismatch |
| **11**| Seeding Resumption State Defect | 🟡 **Medium** | Resumed seeding tasks stay stuck in "downloading" |
| **12**| Piece Bitmap Glitch on Small Torrents| 🟢 **Low** | Chunk bar visual artifacts for small files |
