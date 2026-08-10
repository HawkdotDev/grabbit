import { Storage } from './Storage'
import { DownloadItem } from './types'
import { HashVerifier } from './HashVerifier'

export interface PluginItem {
  id: string
  name: string
  version: string
  author: string
  description: string
  installed: boolean
  enabled: boolean
}

export const DEFAULT_PLUGINS: PluginItem[] = [
  {
    id: 'p_unpacker',
    name: 'Auto Archive Unpacker',
    version: '1.2.0',
    author: 'HawkdotDev',
    description: 'Automatically detects and extracts .zip, .tar, .gz, and .rar archives upon download completion.',
    installed: true,
    enabled: true
  },
  {
    id: 'p_checksum',
    name: 'Automatic Hasher',
    version: '1.0.4',
    author: 'HawkdotDev',
    description: 'Calculates SHA-256 integrity hash for all completed downloads.',
    installed: true,
    enabled: true
  },
  {
    id: 'p_telegram',
    name: 'Telegram Bot Notifier',
    version: '2.0.1',
    author: 'Community',
    description: 'Sends download status notifications directly to your configured Telegram channel or bot.',
    installed: false,
    enabled: false
  },
  {
    id: 'p_media',
    name: 'FFmpeg Transcoder',
    version: '0.9.5',
    author: 'MediaTools',
    description: 'Transcodes downloaded video files to H.264/MP4 format automatically.',
    installed: false,
    enabled: false
  }
]

export class PluginManager {
  private static plugins: PluginItem[] = []
  private static initialized = false

  public static init(): void {
    if (this.initialized) return
    this.plugins = Storage.loadPlugins<PluginItem>(DEFAULT_PLUGINS)
    this.initialized = true
  }

  public static getPlugins(): PluginItem[] {
    this.init()
    return [...this.plugins]
  }

  public static toggleInstall(id: string): PluginItem | null {
    this.init()
    const plugin = this.plugins.find((p) => p.id === id)
    if (!plugin) return null

    plugin.installed = !plugin.installed
    if (!plugin.installed) {
      plugin.enabled = false
    } else {
      plugin.enabled = true
    }
    Storage.savePlugins(this.plugins)
    return { ...plugin }
  }

  public static toggleEnabled(id: string, enabled?: boolean): PluginItem | null {
    this.init()
    const plugin = this.plugins.find((p) => p.id === id)
    if (!plugin) return null

    plugin.enabled = enabled !== undefined ? enabled : !plugin.enabled
    Storage.savePlugins(this.plugins)
    return { ...plugin }
  }

  public static async executeHook(
    hook: 'onDownloadCompleted' | 'onDownloadError',
    download: DownloadItem
  ): Promise<void> {
    this.init()
    const activePlugins = this.plugins.filter((p) => p.installed && p.enabled)

    for (const plugin of activePlugins) {
      try {
        if (hook === 'onDownloadCompleted') {
          if (plugin.id === 'p_checksum' && !download.checksum && download.savePath) {
            const res = await HashVerifier.calculateHash(download.savePath, 'sha256').catch(() => '')
            if (res) {
              download.checksum = res
            }
          }
        }
      } catch (err) {
        console.error(`[Plugin ${plugin.id} Hook Error]`, err)
      }
    }
  }
}
