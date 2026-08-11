import * as fs from 'fs'
import * as path from 'path'
import { exec } from 'child_process'
import { DownloadManager } from '../../engine/DownloadManager'

export const DEFAULT_EXTENSION_ORIGINS = [
  'chrome-extension://knldjmfmopnppmplflldbbdegacjfnnl/',
  'chrome-extension://grabbit_companion_extension/',
  'chrome-extension://dpglkfnmklgjhfgdfhgbmjkldasdasd/'
]

/**
 * Parses 32-bit length-prefixed native messaging buffer
 */
export function parseNativeMessage(buffer: Buffer): Record<string, unknown> | null {
  if (buffer.length < 4) return null
  const length = buffer.readUInt32LE(0)
  if (buffer.length < 4 + length) return null
  try {
    const jsonStr = buffer.subarray(4, 4 + length).toString('utf-8')
    return JSON.parse(jsonStr)
  } catch {
    return null
  }
}

/**
 * Formats a JavaScript object into 32-bit length-prefixed native messaging buffer
 */
export function formatNativeMessage(response: object): Buffer {
  const jsonStr = JSON.stringify(response)
  const byteLength = Buffer.byteLength(jsonStr, 'utf-8')
  const buffer = Buffer.alloc(4 + byteLength)
  buffer.writeUInt32LE(byteLength, 0)
  buffer.write(jsonStr, 4, 'utf-8')
  return buffer
}

/**
 * Reads 32-bit length-prefixed JSON messages from standard input (stdio)
 * used by Chrome, Firefox, and Edge Native Messaging Protocol.
 */
export function startNativeMessagingHost(downloadManager: DownloadManager): void {
  let pendingBuffer: Buffer = Buffer.alloc(0)

  process.stdin.on('data', (chunk: Buffer) => {
    pendingBuffer = Buffer.concat([pendingBuffer, chunk])
    while (pendingBuffer.length >= 4) {
      const length = pendingBuffer.readUInt32LE(0)
      if (pendingBuffer.length < 4 + length) {
        break // Wait for remaining bytes
      }
      const messageBuffer = pendingBuffer.subarray(4, 4 + length)
      pendingBuffer = pendingBuffer.subarray(4 + length)

      try {
        const messageStr = messageBuffer.toString('utf-8')
        const message = JSON.parse(messageStr)
        handleExtensionMessage(message, downloadManager)
      } catch (err) {
        console.error('Failed to parse Native Messaging JSON:', err)
      }
    }
  })
}

export function handleExtensionMessage(
  message: Record<string, unknown>,
  downloadManager: DownloadManager
): void {
  if (message && message['action'] === 'add_download' && typeof message['url'] === 'string') {
    downloadManager
      .addDownload(message['url'], {
        filename: typeof message['filename'] === 'string' ? message['filename'] : undefined,
        savePath: typeof message['savePath'] === 'string' ? message['savePath'] : undefined,
        category: typeof message['category'] === 'string' ? (message['category'] as any) : undefined
      })
      .then((item) => {
        sendNativeMessage({ status: 'ok', id: item.id, message: 'Download queued in Grabbit' })
      })
      .catch((err) => {
        sendNativeMessage({ status: 'error', message: err.message })
      })
  } else if (message && message['action'] === 'ping') {
    sendNativeMessage({ status: 'ok', message: 'pong', version: '1.0.0' })
  }
}

export function sendNativeMessage(response: object): void {
  const formatted = formatNativeMessage(response)
  process.stdout.write(formatted)
}

/**
 * Generates Native Messaging Host Manifest and registers Windows Registry keys
 * for Google Chrome and Microsoft Edge.
 */
export function registerWindowsNativeMessagingHost(): void {
  if (process.platform !== 'win32') return

  try {
    let userData = process.cwd()
    try {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const electron = require('electron')
      if (electron?.app?.getPath) {
        userData = electron.app.getPath('userData')
      }
    } catch {}
    const manifestPath = path.join(userData, 'com.grabbit.host.json')
    const exePath = process.execPath

    const manifest = {
      name: 'com.grabbit.host',
      description: 'Grabbit Download Manager Native Messaging Helper',
      path: exePath,
      type: 'stdio',
      allowed_origins: DEFAULT_EXTENSION_ORIGINS
    }

    fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2), 'utf-8')

    // Register Windows Registry key for Chrome & Edge
    const chromeCmd = `reg add "HKCU\\Software\\Google\\Chrome\\NativeMessagingHosts\\com.grabbit.host" /ve /t REG_SZ /d "${manifestPath}" /f`
    const edgeCmd = `reg add "HKCU\\Software\\Microsoft\\Edge\\NativeMessagingHosts\\com.grabbit.host" /ve /t REG_SZ /d "${manifestPath}" /f`

    exec(chromeCmd, () => {})
    exec(edgeCmd, () => {})
  } catch (err) {
    console.error('Error writing Native Messaging Host Manifest:', err)
  }
}
