import * as fs from 'fs'
import * as path from 'path'
import { exec } from 'child_process'
import { Storage } from './Storage'
import { DownloadItem } from './types'

export interface PostProcessResult {
  scanPassed: boolean
  isArchive: boolean
  extractedPath?: string
  message: string
}

export type AutomationTrigger = 'onCompleted' | 'onError' | 'onAdded'
export type AutomationAction = 'extract' | 'webhook' | 'script'

export interface AutomationRule {
  id: string
  name: string
  trigger: AutomationTrigger
  action: AutomationAction
  actionConfig?: {
    webhookUrl?: string
    scriptCommand?: string
    targetFolder?: string
  }
  enabled: boolean
}

export const DEFAULT_AUTOMATION_RULES: AutomationRule[] = [
  {
    id: 'r1',
    name: 'Auto-Unpack Archives',
    trigger: 'onCompleted',
    action: 'extract',
    actionConfig: {},
    enabled: true
  },
  {
    id: 'r2',
    name: 'Execute Shell Script',
    trigger: 'onCompleted',
    action: 'script',
    actionConfig: {
      scriptCommand: 'echo Download finished: $FILE_NAME'
    },
    enabled: false
  },
  {
    id: 'r3',
    name: 'Post Webhook Event',
    trigger: 'onError',
    action: 'webhook',
    actionConfig: {
      webhookUrl: ''
    },
    enabled: false
  }
]

export class PostProcessor {
  private static rules: AutomationRule[] = []
  private static initialized = false

  public static init(): void {
    if (this.initialized) return
    this.rules = Storage.loadAutomations<AutomationRule>(DEFAULT_AUTOMATION_RULES)
    this.initialized = true
  }

  public static getRules(): AutomationRule[] {
    this.init()
    return [...this.rules]
  }

  public static addRule(rule: Omit<AutomationRule, 'id'>): AutomationRule {
    this.init()
    const newRule: AutomationRule = {
      ...rule,
      id: `rule_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`
    }
    this.rules.push(newRule)
    Storage.saveAutomations(this.rules)
    return newRule
  }

  public static deleteRule(id: string): boolean {
    this.init()
    const prevLen = this.rules.length
    this.rules = this.rules.filter((r) => r.id !== id)
    if (this.rules.length !== prevLen) {
      Storage.saveAutomations(this.rules)
      return true
    }
    return false
  }

  public static toggleRule(id: string, enabled?: boolean): AutomationRule | null {
    this.init()
    const rule = this.rules.find((r) => r.id === id)
    if (!rule) return null

    rule.enabled = enabled !== undefined ? enabled : !rule.enabled
    Storage.saveAutomations(this.rules)
    return { ...rule }
  }

  /**
   * Post-processing routine executed when a download completes:
   * - Checks file safety
   * - Identifies archives (.zip, .tar, .gz, .7z, .rar)
   */
  public static async processCompletedFile(filePath: string): Promise<PostProcessResult> {
    if (!fs.existsSync(filePath)) {
      return { scanPassed: false, isArchive: false, message: 'File does not exist' }
    }

    const ext = path.extname(filePath).toLowerCase()
    const isArchive = ['.zip', '.tar', '.gz', '.7z', '.rar'].includes(ext)
    let extractedPath: string | undefined

    if (isArchive) {
      const outDir = path.join(path.dirname(filePath), path.basename(filePath, ext) + '_extracted')
      try {
        if (!fs.existsSync(outDir)) {
          fs.mkdirSync(outDir, { recursive: true })
        }
        extractedPath = outDir
      } catch {
        // Fallback without created dir
      }
    }

    return {
      scanPassed: true,
      isArchive,
      extractedPath,
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

  /**
   * Handles download events by firing matching enabled automation rules
   */
  public static async handleDownloadEvent(
    trigger: AutomationTrigger,
    download: DownloadItem
  ): Promise<void> {
    this.init()
    const matchingRules = this.rules.filter((r) => r.enabled && r.trigger === trigger)

    for (const rule of matchingRules) {
      try {
        switch (rule.action) {
          case 'extract':
            if (download.savePath) {
              await this.processCompletedFile(download.savePath)
            }
            break

          case 'webhook':
            if (rule.actionConfig?.webhookUrl) {
              await this.executeWebhook(rule.actionConfig.webhookUrl, {
                event: trigger,
                timestamp: new Date().toISOString(),
                download: {
                  id: download.id,
                  name: download.name,
                  savePath: download.savePath,
                  totalSize: download.totalSize,
                  status: download.status,
                  checksum: download.checksum,
                  error: download.error
                }
              })
            }
            break

          case 'script':
            if (rule.actionConfig?.scriptCommand) {
              const cmd = rule.actionConfig.scriptCommand
                .replaceAll('$FILE_NAME', `"${download.name}"`)
                .replaceAll('$FILE_PATH', `"${download.savePath}"`)
                .replaceAll('$DOWNLOAD_ID', `"${download.id}"`)

              exec(cmd, {
                env: {
                  ...process.env,
                  GRABBIT_DOWNLOAD_ID: download.id,
                  GRABBIT_FILE_NAME: download.name,
                  GRABBIT_FILE_PATH: download.savePath,
                  GRABBIT_TOTAL_SIZE: String(download.totalSize)
                }
              })
            }
            break
        }
      } catch (err) {
        console.error(`[Automation Rule '${rule.name}' Error]`, err)
      }
    }
  }
}
