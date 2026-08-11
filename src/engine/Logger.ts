import * as fs from 'fs'
import * as os from 'os'

export type LogLevel = 'INFO' | 'WARN' | 'ERROR' | 'DEBUG'
export type LogCategory = 'SYSTEM' | 'TRANSFER' | 'SWARM' | 'RPC' | 'QOS' | 'STORAGE' | 'AUTOMATION'

export interface LogEntry {
  timestamp: number
  level: LogLevel
  category: LogCategory
  message: string
  metadata?: Record<string, unknown>
}

export class Logger {
  private static logs: LogEntry[] = []
  private static maxLogs: number = 2000

  public static log(level: LogLevel, category: LogCategory, message: string, metadata?: Record<string, unknown>): void {
    const entry: LogEntry = {
      timestamp: Date.now(),
      level,
      category,
      message,
      metadata
    }
    this.logs.push(entry)
    if (this.logs.length > this.maxLogs) {
      this.logs.shift()
    }
  }

  public static info(category: LogCategory, message: string, metadata?: Record<string, unknown>): void {
    this.log('INFO', category, message, metadata)
  }

  public static warn(category: LogCategory, message: string, metadata?: Record<string, unknown>): void {
    this.log('WARN', category, message, metadata)
  }

  public static error(category: LogCategory, message: string, metadata?: Record<string, unknown>): void {
    this.log('ERROR', category, message, metadata)
  }

  public static debug(category: LogCategory, message: string, metadata?: Record<string, unknown>): void {
    this.log('DEBUG', category, message, metadata)
  }

  public static getLogs(): LogEntry[] {
    return [...this.logs]
  }

  public static getFormattedLogText(): string {
    const header = [
      '================================================================================',
      `GRABBIT DOWNLOAD ACCELERATOR - DIAGNOSTIC SYSTEM LOG`,
      `Generated at: ${new Date().toISOString()}`,
      `OS: ${os.type()} ${os.release()} (${os.arch()})`,
      `Node.js: ${process.version} | Platform: ${process.platform}`,
      `Total Memory: ${(os.totalmem() / (1024 * 1024 * 1024)).toFixed(2)} GB | Free: ${(os.freemem() / (1024 * 1024 * 1024)).toFixed(2)} GB`,
      `Process Uptime: ${Math.round(process.uptime())}s`,
      '================================================================================\n'
    ].join('\n')

    const logLines = this.logs.map((l) => {
      const timeStr = new Date(l.timestamp).toISOString()
      const metaStr = l.metadata ? ` | Meta: ${JSON.stringify(l.metadata)}` : ''
      return `[${timeStr}] [${l.level.padEnd(5)}] [${l.category.padEnd(10)}] ${l.message}${metaStr}`
    })

    return header + (logLines.length > 0 ? logLines.join('\n') : '[No events logged in buffer]')
  }

  public static async exportToFile(targetPath: string): Promise<boolean> {
    try {
      const text = this.getFormattedLogText()
      await fs.promises.writeFile(targetPath, text, 'utf8')
      return true
    } catch (err) {
      console.error('Failed to export logs:', err)
      return false
    }
  }
}
