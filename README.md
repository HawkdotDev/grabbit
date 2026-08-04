<div align="center">

  <h1>Grabbit</h1>

  <p><strong>High-Performance, Hyper-Modular Electron Download Manager &amp; Network Telemetry Engine</strong></p>

  <p>
    <a href="https://github.com/HawkdotDev/grabbit/blob/main/LICENSE">
      <img src="https://img.shields.io/badge/License-Apache_2.0-009669.svg?style=for-the-badge" alt="License" />
    </a>
    <a href="https://github.com/HawkdotDev/grabbit/releases">
      <img src="https://img.shields.io/badge/Version-0.0.2-009669.svg?style=for-the-badge" alt="Version" />
    </a>
    <a href="https://electronjs.org">
      <img src="https://img.shields.io/badge/Electron-v35-47848F.svg?style=for-the-badge&logo=electron&logoColor=white" alt="Electron" />
    </a>
    <a href="https://react.dev">
      <img src="https://img.shields.io/badge/React-v19-61DAFB.svg?style=for-the-badge&logo=react&logoColor=black" alt="React" />
    </a>
    <a href="https://tailwindcss.com">
      <img src="https://img.shields.io/badge/Tailwind_CSS-v4-38BDF8.svg?style=for-the-badge&logo=tailwindcss&logoColor=white" alt="Tailwind" />
    </a>
  </p>
</div>

---

## Overview

**Grabbit** is a next-generation desktop download manager and accelerator built for speed, density, and efficiency. Combining raw multi-threaded HTTP Range chunking with a sharp, zero-border-radius qBittorrent-inspired desktop interface, Grabbit offers real-time diagnostics, thread visualizers, checksum verification, remote JSON-RPC control, browser extension integration, and dynamic pane customization.

Designed with an emerald green (`#009669`) theme, dark matte aesthetic, and premium **Sora** and **Inter** typography, Grabbit delivers a desktop experience tailored for power users.

---

## Key Features

- **Multi-Threaded Range Chunking**: Splits file downloads across up to 32 parallel worker threads using direct positioned disk writes (`pwrite`).
- **Sora & Inter Typography**: Custom typography system pairing Sora (display & headings) with Inter (UI text & data tables).
- **qBittorrent Data Grid Layout**: Sortable data table displaying live down/up speeds, ETA, seed/peer counts, file size, progress bars, and info hashes.
- **Network Telemetry Spline Graph**: Smooth Bezier curve graph with live hover tooltips, bar/curve toggle modes, and peak throughput tracking.
- **Clipboard Link Auto-Detection**: Auto-scans system clipboard for downloadable URLs or Magnet links and displays a 1-click **Quick Add** banner toast.
- **Queue State Export & Import**: Native OS file dialog interface to save active download queues to `grabbit_queue.json` and restore tasks.
- **Browser Native Messaging Integration**: Built-in stdio host communicating with Chrome, Firefox, and Edge extensions via Windows Registry key `com.grabbit.host`.
- **Remote Control JSON-RPC Gateway**: Embedded HTTP/JSON-RPC server running at `http://127.0.0.1:6800/` for mobile or external web UI management.
- **BitTorrent & Magnet Link Parser**: Extracts infohashes, tracker endpoints, and file lists from `magnet:?` URIs.
- **Video Downloader Pipeline**: Integrates `yt-dlp` executable for format resolution extraction and streaming pipelines.
- **Adaptive QoS Latency Governor**: Monitors network ping and automatically throttles download bandwidth during gaming or video calls.
- **Native OS Desktop Notifications**: Triggers native desktop notifications upon download completion or error.
- **Multi-Tree Filtering Sidebar**: Filter tasks instantly by **Status** (_Downloading, Seeding, Completed, Running, Stopped, Stalled, Checking, Errored_), **Categories**, **Tags**, and **Trackers**.
- **Checksum Verification**: Built-in SHA-256, SHA-512, and MD5 file integrity validation.

---

## Technology Stack

| Layer                         | Technology                                                 |
| :---------------------------- | :--------------------------------------------------------- |
| **Desktop Framework**         | [Electron v35](package.json)                               |
| **Frontend Framework**        | [React v19](package.json)                                  |
| **Language**                  | [TypeScript v5.8](package.json)                            |
| **Styling**                   | [Tailwind CSS v4](package.json) (Vanilla CSS theme tokens) |
| **Typography**                | Sora & Inter (Google Fonts)                                |
| **Build & Bundler**           | [electron-vite](package.json) + [Vite v6](package.json)    |
| **Runtime & Package Manager** | [Bun](package.json)                                        |
| **Icons**                     | [Lucide React](package.json)                               |

---

## Domain-Driven Architecture

```
grabbit/
├── src/
│   ├── engine/                   # Core Download Engine Architecture
│   │   ├── ChunkEngine.ts        # Parallel HTTP range downloader & worker threads
│   │   ├── DownloadManager.ts    # Main download queue manager & state dispatcher
│   │   ├── Storage.ts            # Disk persistence & state serialization
│   │   ├── RateLimiter.ts        # Global token-bucket bandwidth speed governor
│   │   ├── DiskAllocator.ts      # Direct position-based disk write (pwrite)
│   │   ├── HashVerifier.ts       # Checksum calculation (SHA-256, SHA-512, MD5)
│   │   ├── AdaptiveQoS.ts        # Latency-aware speed governor
│   │   ├── PostProcessor.ts      # Integrity check & archive auto-extract
│   │   └── workers/              # Specialized Protocol Workers
│   │       ├── TorrentWorker.ts  # Magnet URI & torrent parser
│   │       └── MediaWorker.ts    # yt-dlp video format extractor
│   │
│   ├── main/                     # Electron Main Process Lifecycle
│   │   ├── index.ts              # BrowserWindow initialization & setup
│   │   ├── ipc.ts                # Native IPC handlers & OS notifications
│   │   └── browser-integration/  # Native Messaging Host for browser extensions
│   │       └── native_messaging_host.ts
│   │
│   ├── preload/                  # Secure Context Bridge
│   │   ├── index.ts              # Exposed safe IPC methods for renderer
│   │   └── index.d.ts            # Type-safe window.api interface
│   │
│   ├── server/                   # Remote Control Gateway
│   │   └── RemoteServer.ts       # HTTP & JSON-RPC Gateway server (Port 6800)
│   │
│   └── renderer/                 # React Frontend Application
│       └── src/
│           ├── assets/           # Main CSS theme tokens & font rules
│           ├── components/       # Domain Subdirectory Modules
│           │   ├── home/         # Home dashboard & queue overview
│           │   ├── network/      # Network telemetry & Bezier spline graph
│           │   ├── tasktable/    # Task data table & progress cells
│           │   ├── inspector/    # Multi-tab detail inspector
│           │   ├── modals/       # Add task, Settings & Hash modals
│           │   ├── topbar/       # Titlebar, MenuBar & quick action tools
│           │   ├── sidebar/      # Category & status filter tree
│           │   ├── statusbar/    # Bottom telemetry status bar
│           │   ├── notifications/# Notification panel & Clipboard banner
│           │   └── common/       # Speed chart reusable component
│           ├── hooks/            # Custom React Hooks
│           │   ├── useDownloads.ts
│           │   ├── useFilteredDownloads.ts
│           │   ├── useClipboardDetector.ts
│           │   └── useResizablePanes.ts
│           └── utils/            # Formatters & helper utilities
│
├── package.json
└── README.md
```

---

## Getting Started

### Prerequisites

Ensure you have **[Bun](https://bun.sh)** installed on your machine.

### Installation

1. **Clone the repository**:

   ```bash
   git clone https://github.com/HawkdotDev/grabbit.git
   cd grabbit
   ```

2. **Install dependencies**:

   ```bash
   bun install
   ```

3. **Start Development Server**:
   ```bash
   bun run dev
   ```

---

## Building & Packaging

To compile and package the desktop application for production:

```bash
# Typecheck & Formatting Verification
bun run typecheck
bun run format

# Build Production Binaries
bun run build
```

The output executables will be generated inside the `dist/` directory.

---

## License

This project is licensed under the **Apache-2.0 License** - see the [LICENSE](LICENSE) file for details.

Developed by **[HawkdotDev](https://github.com/HawkdotDev)**.
