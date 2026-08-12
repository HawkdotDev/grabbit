export class RateLimiter {
  private tokens: number = 0
  private lastRefill: number = Date.now()
  private maxTokensPerSecond: number = 0 // 0 = unlimited

  constructor(limitKbps: number = 0) {
    this.setLimitKbps(limitKbps)
  }

  public setLimitKbps(limitKbps: number): void {
    this.maxTokensPerSecond = limitKbps > 0 ? limitKbps * 1024 : 0
    this.tokens = this.maxTokensPerSecond
    this.lastRefill = Date.now()
  }

  public getLimitKbps(): number {
    return this.maxTokensPerSecond > 0 ? Math.round(this.maxTokensPerSecond / 1024) : 0
  }

  public async acquire(bytes: number): Promise<void> {
    if (this.maxTokensPerSecond <= 0) {
      return // Unlimited
    }

    this.refill()

    if (this.tokens >= bytes) {
      this.tokens -= bytes
      return
    }

    const needed = bytes - this.tokens
    const waitMs = Math.ceil((needed / this.maxTokensPerSecond) * 1000)
    await new Promise((resolve) => setTimeout(resolve, Math.min(waitMs, 2000)))
    this.refill()
    this.tokens = Math.max(0, this.tokens - bytes)
  }

  private refill(): void {
    const now = Date.now()
    const elapsedSeconds = (now - this.lastRefill) / 1000
    this.lastRefill = now
    this.tokens = Math.min(
      this.maxTokensPerSecond,
      this.tokens + elapsedSeconds * this.maxTokensPerSecond
    )
  }
}
