<div align="center">

  <img src="resources/icon.png" width="72" height="72" alt="Grabbit Logo" />
  <h1>Grabbit</h1>

  <p><strong>High-Performance, Hyper-Fast Modern Desktop Download Manager &amp; WebTorrent Engine</strong></p>

  <p>
    <a href="https://github.com/HawkdotDev/grabbit/blob/main/LICENSE">
      <img src="https://img.shields.io/badge/License-Apache_2.0-009669.svg?style=for-the-badge" alt="License" />
    </a>
    <a href="https://github.com/HawkdotDev/grabbit/releases">
      <img src="https://img.shields.io/badge/Version-0.1.1-009669.svg?style=for-the-badge" alt="Version" />
    </a>
    <a href="https://electronjs.org">
      <img src="https://img.shields.io/badge/Electron-v39-47848F.svg?style=for-the-badge&logo=electron&logoColor=white" alt="Electron" />
    </a>
    <a href="https://webtorrent.io">
      <img src="https://img.shields.io/badge/WebTorrent-v3-e00000.svg?style=for-the-badge&logo=bittorrent&logoColor=white" alt="WebTorrent" />
    </a>
    <a href="https://react.dev">
      <img src="https://img.shields.io/badge/React-v19-61DAFB.svg?style=for-the-badge&logo=react&logoColor=black" alt="React" />
    </a>
    <a href="https://tailwindcss.com">
      <img src="https://img.shields.io/badge/Tailwind_CSS-v4-38BDF8.svg?style=for-the-badge&logo=tailwindcss&logoColor=white" alt="Tailwind" />
    </a>
  </p>
</div>

## Overview

**Grabbit** is a powerful, modern desktop download manager and BitTorrent client built to deliver raw speed, rich telemetry, and complete control over your downloads. Powered by multi-threaded HTTP chunk acceleration and an integrated **WebTorrent** protocol engine, Grabbit handles direct downloads, torrent files, and magnet URIs with dark-mode aesthetic.

## Key Features

- **Multi-Chunk Acceleration**: Splits large HTTP/HTTPS downloads into up to 32 parallel worker threads to saturate your internet bandwidth.
- **Native WebTorrent BitTorrent Engine**: Full BitTorrent protocol support for magnet URIs (`magnet:?xt=`) and `.torrent` files with DHT, PeX, and LSD peer discovery.
- **Two-Step Torrent Import Flow**: Interactive source picker with drag-and-drop zone, file browser, and magnet link parser, advancing directly to a 2-column options panel.
- **Dedicated Modal UI**: Purpose-built distinct popups for **Normal Downloads** and **Torrent Downloads** featuring dark-themed fieldsets and custom focus glows.
- **In-App Media Streaming Server**: Built-in HTTP media server powered by WebTorrent to stream video and audio files before torrent downloads complete.
- **Dynamic Trackers & Swarm Telemetry**: Live peer wire inspection (IP address, port, client ID, choke status), custom announce tracker management, and piece-level progress maps.
- **Granular File Selection & Priorities**: Choose individual files within multi-file torrents and adjust per-file priorities (`High`, `Normal`, `Low`, `Skip / Don't Download`).
- **Automatic Clipboard Detector**: Instant 1-click **Add Download** notification whenever a URL or magnet link is copied.
- **Home Dashboard Control**: Monitor recent tasks, track aggregate transfer metrics, and delete tasks directly from the home view.
- **Smart Anti-Lag (QoS)**: Dynamic bandwidth throttle to prevent ping spikes during gaming or video calls.
- **Export & Import Queues**: Export `.torrent` files or save full queue state to JSON to transfer tasks across machines.
- **File Integrity Verification**: Built-in SHA-256, SHA-512, and MD5 verifiers to ensure downloaded files are untouched.

## Technology Stack

| Layer                         | Technology                                              |
| :---------------------------- | :------------------------------------------------------ |
| **Desktop Framework**         | [Electron v39](package.json)                            |
| **BitTorrent Engine**         | [WebTorrent v3](package.json)                           |
| **Frontend Framework**        | [React v19](package.json)                               |
| **Language**                  | [TypeScript v5.8](package.json)                         |
| **Styling**                   | [Tailwind CSS v4](package.json)                         |
| **Typography**                | Sora & Inter (Google Fonts)                             |
| **Build & Bundler**           | [electron-vite](package.json) + [Vite v6](package.json) |
| **Runtime & Package Manager** | [Bun](package.json)                                     |
| **Icons**                     | [Lucide React](package.json)                            |

## Getting Started

### Prerequisites

Ensure you have **[Bun](https://bun.sh)** installed on your system.

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

## Building & Packaging

To package the desktop application for production:

```bash
# Typecheck & Code Formatting
bun run typecheck
bun run format

# Build Production Binaries
bun run build
```

Production executables will be generated inside the `dist/` directory.

## License

This project is licensed under the **Apache-2.0 License** - see the [LICENSE](LICENSE) file for details.

Developed by **[HawkdotDev](https://github.com/HawkdotDev)**.
