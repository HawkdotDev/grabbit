export type SortField =
  'name' | 'totalSize' | 'downloadedSize' | 'status' | 'speed' | 'upSpeed' | 'eta' | 'ratio'

export type ColumnKey =
  | 'num'
  | 'name'
  | 'totalSize'
  | 'progress'
  | 'status'
  | 'seeds'
  | 'speed'
  | 'upSpeed'
  | 'eta'
  | 'infoHash'
  | 'actions'

export type ColumnWidths = Record<ColumnKey, number>

export const DEFAULT_COLUMN_WIDTHS: ColumnWidths = {
  num: 42,
  name: 240,
  totalSize: 100,
  progress: 180,
  status: 125,
  seeds: 110,
  speed: 115,
  upSpeed: 105,
  eta: 90,
  infoHash: 140,
  actions: 140
}

export const MIN_COLUMN_WIDTHS: Record<ColumnKey, number> = {
  num: 32,
  name: 120,
  totalSize: 70,
  progress: 100,
  status: 90,
  seeds: 80,
  speed: 80,
  upSpeed: 80,
  eta: 65,
  infoHash: 90,
  actions: 90
}
