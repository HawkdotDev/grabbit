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

export function formatDuration(seconds?: number): string {
  if (seconds === undefined || seconds < 0 || !isFinite(seconds)) return 'N/A'
  if (seconds === 0) return '0s'
  const days = Math.floor(seconds / 86400)
  const hours = Math.floor((seconds % 86400) / 3600)
  const mins = Math.floor((seconds % 3600) / 60)
  const secs = Math.floor(seconds % 60)

  if (days > 0) return `${days}d ${hours}h`
  if (hours > 0) return `${hours}h ${mins}m`
  if (mins > 0) return `${mins}m ${secs}s`
  return `${secs}s`
}

export function formatDateTime(timestamp?: number | string): string {
  if (!timestamp) return 'N/A'
  const date = typeof timestamp === 'string' ? new Date(timestamp) : new Date(timestamp)
  if (isNaN(date.getTime())) return String(timestamp)
  
  const pad = (n: number) => n.toString().padStart(2, '0')
  const month = pad(date.getMonth() + 1)
  const day = pad(date.getDate())
  const year = date.getFullYear()
  
  let hours = date.getHours()
  const ampm = hours >= 12 ? 'PM' : 'AM'
  hours = hours % 12 || 12
  const hoursStr = pad(hours)
  const minutesStr = pad(date.getMinutes())
  return `${month}-${day}-${year} ${hoursStr}:${minutesStr} ${ampm}`
}

export function formatEta(seconds: number): string {
  if (seconds <= 0 || !isFinite(seconds)) return '∞'
  if (seconds < 60) return `${seconds}s`
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  if (mins < 60) return `${mins}m ${secs}s`
  const hours = Math.floor(mins / 60)
  const remMins = mins % 60
  return `${hours}h ${remMins}m`
}


