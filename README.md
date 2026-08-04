<div align="center">

  <h1>⚡ Grabbit</h1>

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

## 🚀 Overview

**Grabbit** is a next-generation download manager built for speed, density, and efficiency. Combining raw multi-threaded HTTP Range chunking with a sharp, zero-border-radius qBittorrent-inspired desktop interface, Grabbit offers real-time diagnostics, thread visualizers, checksum verification, and dynamic pane customization.

Designed with an emerald green (`#009669`) theme and dark matte aesthetic, Grabbit delivers a desktop experience tailored for power users.

---

## 🔥 Key Features

- **🚀 Multi-Threaded Range Chunking**: Splits large file downloads across up to 32 parallel worker threads using position-based direct disk writes (`pwrite`).
- **📊 qBittorrent Data Grid Layout**: Sortable data table displaying live down/up speeds, ETA, seed/peer counts, file size, progress bars, and info hashes.
- **📁 Multi-Tree Filtering Sidebar**: Filter tasks instantly by **Status** (_Downloading, Seeding, Completed, Running, Stopped, Stalled, Checking, Errored_), **Categories** (_Documents, Archives, Videos, Audio, Executables, Images, Code_), **Tags**, and **Trackers**.
- **🔍 Multi-Tab Detail Inspector**:
  - **General**: Comprehensive transfer info, speed metrics, and file paths.
  - **Trackers**: Active announce endpoints, peer counts, and status text.
  - **Peers / Threads**: Live visualizer showing real-time progress across worker threads.
  - **HTTP Sources**: Primary range source mirror status.
  - **Content / Files**: Individual file hierarchy inside downloaded archives/tasks.
  - **Bandwidth Speed**: Real-time SVG bandwidth graph with peak and current throughput metrics.
- **🛡️ Checksum Verification**: Built-in SHA-256, SHA-512, and MD5 file integrity validation.
- **📐 Resizable Splitter Panes**: Drag-to-resize sidebar and bottom detail inspector with ultra-thin 2px splitters.
- **🖼️ Custom Frameless Titlebar**: Native-feeling window titlebar with integrated minimize, maximize/restore, and close controls.

---

## 🛠️ Technology Stack

| Layer                         | Technology                                                                                                                                                                                                                |
| :---------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Desktop Framework**         | [Electron v35](file:///c:/Users/dwaip/OneDrive/Documents/Code/Github/electron%20apps/neobit/package.json#L47)                                                                                                             |
| **Frontend Framework**        | [React v19](file:///c:/Users/dwaip/OneDrive/Documents/Code/Github/electron%20apps/neobit/package.json#L40)                                                                                                                |
| **Language**                  | [TypeScript v5.8](file:///c:/Users/dwaip/OneDrive/Documents/Code/Github/electron%20apps/neobit/package.json#L61)                                                                                                          |
| **Styling**                   | [Tailwind CSS v4](file:///c:/Users/dwaip/OneDrive/Documents/Code/Github/electron%20apps/neobit/package.json#L37) (Vanilla CSS theme tokens)                                                                               |
| **Build & Bundler**           | [electron-vite](file:///c:/Users/dwaip/OneDrive/Documents/Code/Github/electron%20apps/neobit/package.json#L53) + [Vite v6](file:///c:/Users/dwaip/OneDrive/Documents/Code/Github/electron%20apps/neobit/package.json#L63) |
| **Runtime & Package Manager** | [Bun](file:///c:/Users/dwaip/OneDrive/Documents/Code/Github/electron%20apps/neobit/package.json#L32)                                                                                                                      |
| **Icons**                     | [Lucide React](file:///c:/Users/dwaip/OneDrive/Documents/Code/Github/electron%20apps/neobit/package.json#L39)                                                                                                             |

---

## 📂 Project Architecture

```
neobit/
├── src/
│   ├── engine/                   # Core Download Engine Architecture
│   │   ├── ChunkEngine.ts        # Parallel HTTP range downloader & worker threads
│   │   ├── DownloadManager.ts    # Main download queue manager & state dispatcher
│   │   ├── Storage.ts            # Disk persistence & state serialization
│   │   ├── CategoryManager.ts   # Automatic file extension categorization
│   │   ├── RateLimiter.ts        # Global bandwidth speed governor
│   │   ├── DiskAllocator.ts      # Zero-fill disk space pre-allocation
│   │   ├── HashVerifier.ts       # Checksum calculation (SHA-256, SHA-512, MD5)
│   │   └── types.ts              # Core engine TypeScript interfaces
│   │
│   ├── main/                     # Electron Main Process Lifecycle
│   │   ├── index.ts              # BrowserWindow initialization & frameless setup
│   │   └── ipc.ts                # IPC protocol handler registrations
│   │
│   ├── preload/                  # Secure Context Bridge
│   │   ├── index.ts              # Exposed safe IPC methods for renderer
│   │   └── index.d.ts            # Type-safe window.api window interface
│   │
│   └── renderer/                 # React Frontend Application
│       └── src/
│           ├── assets/           # Main CSS tokens & custom scrollbars
│           ├── components/       # Modular UI Components
│           │   ├── inspector/    # Sub-tab modules (General, Trackers, Content, Sources)
│           │   ├── topbar/       # Titlebar sub-modules (WindowControls, MenuBar, SearchFilterBar)
│           │   ├── TaskTableView.tsx
│           │   ├── BottomDetailInspector.tsx
│           │   ├── BottomStatusBar.tsx
│           │   ├── Sidebar.tsx
│           │   ├── AddDownloadModal.tsx
│           │   ├── SettingsModal.tsx
│           │   └── HashModal.tsx
│           ├── hooks/            # Custom React Hooks
│           │   ├── useDownloads.ts
│           │   ├── useFilteredDownloads.ts
│           │   └── useResizablePanes.ts
│           └── utils/            # Formatters & helper utilities
│
├── package.json
└── README.md
```

---

## 🚀 Getting Started

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

## ⚙️ Building & Packaging

To compile and package the desktop application for production:

```bash
# Typecheck & Lint
bun run check

# Build Production Binaries
bun run build
```

The output executables will be generated inside the `dist/` directory.

---

## 📄 License

This project is licensed under the **Apache-2.0 License** - see the [LICENSE](LICENSE) file for details.

Developed with ❤️ by **[HawkdotDev](https://github.com/HawkdotDev)**.
