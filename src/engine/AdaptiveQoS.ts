import { RateLimiter } from './RateLimiter'
import * as http from 'http'
import * as https from 'https'

export class AdaptiveQoS {
  private isGamingOrStreamingDetected: boolean = false
  private monitoringInterval?: ReturnType<typeof setInterval>
  private isMonitoring: boolean = false
  private lastPingMs: number = 25
  private baseLimitKbps: number = 0

  constructor(private rateLimiter: RateLimiter) {}

  /**
   * Measures network latency against a fast public DNS / gateway endpoint
   */
  public async measureLatency(): Promise<number> {
    const start = Date.now()
    return new Promise<number>((resolve) => {
      const req = https.get('https://1.1.1.1/cdn-cgi/trace', { timeout: 2000 }, (res) => {
        res.on('data', () => {})
        res.on('end', () => {
          const latency = Date.now() - start
          this.lastPingMs = latency
          this.evaluateQoS(latency)
          resolve(latency)
        })
      })

      req.on('error', () => {
        // Fallback measure with lightweight HTTP endpoint
        const fbReq = http.get('http://1.1.1.1/', { timeout: 2000 }, () => {
          const latency = Date.now() - start
          this.lastPingMs = latency
          this.evaluateQoS(latency)
          resolve(latency)
        })
        fbReq.on('error', () => {
          // If offline/unreachable, keep previous estimate
          resolve(this.lastPingMs)
        })
      })

      req.on('timeout', () => {
        req.destroy()
        const latency = 999
        this.lastPingMs = latency
        this.evaluateQoS(latency)
        resolve(latency)
      })
    })
  }

  /**
   * Starts background monitoring loop
   */
  public startMonitoring(intervalMs: number = 5000): void {
    if (this.isMonitoring) return
    this.isMonitoring = true
    this.baseLimitKbps = this.rateLimiter.getLimitKbps()

    this.monitoringInterval = setInterval(async () => {
      try {
        await this.measureLatency()
      } catch {
        // Ignore background ping errors
      }
    }, intervalMs)
  }

  /**
   * Stops background monitoring loop
   */
  public stopMonitoring(): void {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval)
      this.monitoringInterval = undefined
    }
    this.isMonitoring = false
    if (this.isGamingOrStreamingDetected) {
      this.isGamingOrStreamingDetected = false
      this.rateLimiter.setLimitKbps(this.baseLimitKbps)
    }
  }

  /**
   * Evaluates network latency and running processes.
   * If latency increases significantly (e.g. ping > 120ms during gaming),
   * dynamically reduces download bandwidth limit to protect ping.
   */
  public evaluateQoS(currentPingMs: number): void {
    this.lastPingMs = currentPingMs
    if (currentPingMs > 120 && !this.isGamingOrStreamingDetected) {
      this.isGamingOrStreamingDetected = true
      // Auto-throttle download speed to 2048 KB/s (2 MB/s) to keep ping stable
      this.rateLimiter.setLimitKbps(2048)
    } else if (currentPingMs <= 50 && this.isGamingOrStreamingDetected) {
      this.isGamingOrStreamingDetected = false
      // Restore previous bandwidth limit when latency settles
      this.rateLimiter.setLimitKbps(this.baseLimitKbps)
    }
  }

  public isThrottled(): boolean {
    return this.isGamingOrStreamingDetected
  }

  public getLastPing(): number {
    return this.lastPingMs
  }
}
