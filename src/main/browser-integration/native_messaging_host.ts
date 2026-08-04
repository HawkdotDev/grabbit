import * as fs from 'fs'
import * as path from 'path'
import { exec } from 'child_process'
import { app } from 'electron'
import { DownloadManager } from '../../engine/DownloadManager'

/**
 * Reads 32-bit length-prefixed JSON messages from standard input (stdio)
 * used by Chrome, Firefox, and Edge Native Messaging Protocol.
 */
export function startNativeMessagingHost(downloadManager: DownloadManager): void {
  process.stdin.on('readable', () => {
    let chunk: Buffer | null
    while ((chunk = process.stdin.read(4)) !== null) {
      const length = chunk.readUInt32LE(0)
      const messageBuffer = process.stdin.read(length)
      if (messageBuffer) {
        try {
          const messageStr = messageBuffer.toString('utf-8')
          const message = JSON.parse(messageStr)
          handleExtensionMessage(message, downloadManager)
        } catch (err) {
          console.error('Failed to parse Native Messaging JSON:', err)
        }
      }
    }
  })
}

function handleExtensionMessage(message: any, downloadManager: DownloadManager): void {
  if (message && message.action === 'add_download' && message.url) {
    downloadManager.addDownload(message.url, {
      filename: message.filename,
      savePath: message.savePath,
      category: message.category
    })
    sendNativeMessage({ status: 'ok', message: 'Download queued in Grabbit' })
  }
}

function sendNativeMessage(response: object): void {
  const jsonStr = JSON.stringify(response)
  const lengthBuffer = Buffer.alloc(4)
  lengthBuffer.writeUInt32LE(Buffer.byteLength(jsonStr, 'utf-8'), 0)
  process.stdout.write(lengthBuffer)
  process.stdout.write(jsonStr)
}

/**
 * Generates Native Messaging Host Manifest and registers Windows Registry key
 * HKCU\Software\Google\Chrome\NativeMessagingHosts\com.grabbit.host
 */
export function registerWindowsNativeMessagingHost(): void {
  if (process.platform !== 'win32') return

  try {
    const userData = app.getPath('userData')
    const manifestPath = path.join(userData, 'com.grabbit.host.json')
    const exePath = process.execPath

    const manifest = {
      name: 'com.grabbit.host',
      description: 'Grabbit Download Manager Native Messaging Helper',
      path: exePath,
      type: 'stdio',
      allowed_origins: ['chrome-extension://*']
    }

    fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2), 'utf-8')

    // Register Windows Registry key for Chrome
    const regCmd = `reg add "HKCU\\Software\\Google\\Chrome\\NativeMessagingHosts\\com.grabbit.host" /ve /t REG_SZ /d "${manifestPath}" /f`
    exec(regCmd, (error) => {
      if (error) {
        console.warn('Native Messaging Registry registration notice:', error.message)
      }
    })
  } catch (err) {
    console.error('Error writing Native Messaging Host Manifest:', err)
  }
}
