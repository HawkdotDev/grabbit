export function formatBytes(bytes?: number): string {
  if (!bytes || bytes <= 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KiB', 'MiB', 'GiB', 'TiB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`
}

export function formatSpeed(bytesPerSec?: number): string {
  if (!bytesPerSec || bytesPerSec <= 0) return '0 B/s'
  const k = 1024
  const sizes = ['B/s', 'KiB/s', 'MiB/s', 'GiB/s']
  const i = Math.floor(Math.log(bytesPerSec) / Math.log(k))
  return `${(bytesPerSec / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`
}

export function formatEta(seconds: number): string {
  if (seconds <= 0 || !isFinite(seconds)) return '∞'
  if (seconds < 60) return `${seconds}s`
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins}m ${secs}s`
}
