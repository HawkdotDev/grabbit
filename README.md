<div align="center">

  <img src="resources/icon.png" width="72" height="72" alt="Grabbit Logo" />
  <h1>Grabbit</h1>

  <p><strong>High-Performance, Hyper-Fast Modern Desktop Download Manager &amp; Network Accelerator</strong></p>

  <p>
    <a href="https://github.com/HawkdotDev/grabbit/blob/main/LICENSE">
      <img src="https://img.shields.io/badge/License-Apache_2.0-009669.svg?style=for-the-badge" alt="License" />
    </a>
    <a href="https://github.com/HawkdotDev/grabbit/releases">
      <img src="https://img.shields.io/badge/Version-0.1.0-009669.svg?style=for-the-badge" alt="Version" />
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

## Overview

**Grabbit** is a powerful, modern desktop download manager and speed accelerator designed to give you total control over your downloads. Combining raw multi-threaded speed acceleration with a clean, dark-mode user interface and pastel accents, Grabbit simplifies downloading files, torrents, and online videos.

## Key Features

- **Supercharged Speed**: Splits large downloads into up to 32 parallel streams to max out your internet speed.
- **Full Torrent & Magnet Support**: Open `.torrent` files or paste `magnet:` links directly into the app with automatic peer discovery.
- **Online Video Downloader**: Grab online videos directly from supported web streaming links.
- **Automatic Clipboard Detector**: Copies a link or magnet URI? Grabbit automatically pops up a 1-click **Add Download** notification.
- **Browser Integration**: Seamlessly integrates with Chrome, Firefox, and Edge extensions to handle your web downloads automatically.
- **Smart Anti-Lag Mode (QoS)**: Automatically slows down downloads while you're gaming or streaming videos to prevent lag.
- **Export & Import Queues**: Save your active download list to a file and restore it anytime across computers.
- **Real-Time Speed Charts**: Track download speeds, live throughput graphs, and estimated completion times at a glance.
- **File Integrity Check (Hash Verifier)**: Built-in SHA-256, SHA-512, and MD5 verifier to make sure downloaded files are safe and untampered.
- **Easy Category & Tag Filters**: Sort downloads instantly by category (_Videos, Software, Music, Documents_) or filter by status (_Downloading, Completed, Paused_).
- **Remote Network Control**: Control and monitor your downloads remotely from another device or web browser.

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

## License

This project is licensed under the **Apache-2.0 License** - see the [LICENSE](LICENSE) file for details.

Developed by **[HawkdotDev](https://github.com/HawkdotDev)**.
