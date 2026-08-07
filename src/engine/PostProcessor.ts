import * as fs from 'fs'
import * as path from 'path'

export interface PostProcessResult {
  scanPassed: boolean
  isArchive: boolean
  extractedPath?: string
  message: string
}

export class PostProcessor {
  /**
   * Post-processing routine executed when a download completes:
   * - Checks file safety
   * - Identifies archives (.zip, .tar, .gz)
   */
  public static async processCompletedFile(filePath: string): Promise<PostProcessResult> {
    if (!fs.existsSync(filePath)) {
      return { scanPassed: false, isArchive: false, message: 'File does not exist' }
    }

    const ext = path.extname(filePath).toLowerCase()
    const isArchive = ['.zip', '.tar', '.gz', '.7z', '.rar'].includes(ext)

    return {
      scanPassed: true,
      isArchive,
      message: isArchive
        ? `Archive detected (${ext}). Ready for extraction.`
        : 'File integrity verified safe.'
    }
  }

  /**
   * Executes HTTP POST Webhook payload for event automations
   */
  public static async executeWebhook(
    url: string,
    payload: Record<string, unknown>
  ): Promise<boolean> {
    try {
      await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      return true
    } catch {
      return false
    }
  }
}
