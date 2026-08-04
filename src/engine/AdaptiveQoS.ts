import { RateLimiter } from './RateLimiter'

export class AdaptiveQoS {
  private isGamingOrStreamingDetected: boolean = false

  constructor(private rateLimiter: RateLimiter) {}

  /**
   * Evaluates network latency and running processes.
   * If latency increases significantly (e.g. ping > 120ms during gaming),
   * dynamically reduces download bandwidth limit to protect ping.
   */
  public evaluateQoS(currentPingMs: number): void {
    if (currentPingMs > 120 && !this.isGamingOrStreamingDetected) {
      this.isGamingOrStreamingDetected = true
      // Auto-throttle download speed to 2048 KB/s (2 MB/s) to keep ping stable
      this.rateLimiter.setLimitKbps(2048)
    } else if (currentPingMs <= 50 && this.isGamingOrStreamingDetected) {
      this.isGamingOrStreamingDetected = false
      // Restore unlimited bandwidth when latency settles
      this.rateLimiter.setLimitKbps(0)
    }
  }
}
