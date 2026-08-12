import { DownloadItem } from '../../../../../engine/types'

export interface PeersTabProps {
  download?: DownloadItem | null
}

export interface PeerRowData {
  id: string
  country: string
  countryFlag: string
  ip: string
  port: number | string
  connection: string
  flags: string
  client: string
  progress: number
  downSpeed: number
  upSpeed: number
  reqs: string
  downloaded: number
  uploaded: number
  peerDlSpeed: number
  relevance: number
  files: string
  choked: boolean
  isTopTier?: boolean
  isSeeder?: boolean
  usefulPiecesCount?: number
}

export type PeerColumnId =
  | 'country'
  | 'ip'
  | 'port'
  | 'connection'
  | 'client'
  | 'flags'
  | 'progress'
  | 'downSpeed'
  | 'upSpeed'
  | 'reqs'
  | 'uploaded'
  | 'downloaded'
  | 'peerDlSpeed'
  | 'relevance'
  | 'files'

export interface ColumnDef {
  id: PeerColumnId
  label: string
}

export const ALL_PEER_COLUMNS: ColumnDef[] = [
  { id: 'country', label: 'Country/Region' },
  { id: 'ip', label: 'IP/Address' },
  { id: 'port', label: 'Port' },
  { id: 'connection', label: 'Connection' },
  { id: 'client', label: 'Client' },
  { id: 'flags', label: 'Flags' },
  { id: 'progress', label: '% (Progress)' },
  { id: 'downSpeed', label: 'Down Speed' },
  { id: 'upSpeed', label: 'Up Speed' },
  { id: 'reqs', label: 'Reqs' },
  { id: 'uploaded', label: 'Uploaded' },
  { id: 'downloaded', label: 'Downloaded' },
  { id: 'peerDlSpeed', label: 'Peer dl. Speed' },
  { id: 'relevance', label: 'Relevance' },
  { id: 'files', label: 'Files' }
]

export const COUNTRY_FLAG_MAP: Record<string, string> = {
  NL: '🇳🇱',
  MX: '🇲🇽',
  HU: '🇭🇺',
  CA: '🇨🇦',
  AU: '🇦🇺',
  US: '🇺🇸',
  DE: '🇩🇪',
  GB: '🇬🇧',
  FR: '🇫🇷',
  SE: '🇸🇪',
  JP: '🇯🇵',
  BR: '🇧🇷'
}
