import { DownloadItem, TrackerInfo } from '../../../../../engine/types'

export interface TrackersTabProps {
  download?: DownloadItem | null
}

export interface FlattenedTrackerRow {
  id: string
  parentId?: string
  isHeader: boolean
  isExpanded?: boolean
  url: string
  tier?: number | string
  protocol?: string
  status: string
  peers: number | string
  seeds: number | string
  leeches: number | string
  downloaded: number | string
  message: string
  nextAnnounce: string
  minAnnounce: string
  children?: TrackerInfo[]
}

export const AUTHENTIC_DEMO_TRACKERS: TrackerInfo[] = [
  {
    url: 'udp://tracker.opentrackr.org:1337/announce',
    tier: 17,
    protocol: 'v1',
    status: 'Working',
    peers: 240,
    seeds: 216,
    leeches: 24,
    downloaded: 'N/A',
    message: 'OK',
    nextAnnounce: '13m',
    minAnnounce: '0',
    endpoints: [
      { url: '[fe80::fc...]', protocol: 'v1', status: 'Unreachable', peers: 'N/A', seeds: 'N/A', leeches: 'N/A', downloaded: 'N/A', message: 'skipping tracker...', nextAnnounce: '5m', minAnnounce: '0' },
      { url: '[fe80::6e...]', protocol: 'v1', status: 'Unreachable', peers: 'N/A', seeds: 'N/A', leeches: 'N/A', downloaded: 'N/A', message: 'skipping tracker...', nextAnnounce: '5m', minAnnounce: '0' },
      { url: '[::1]:54944', protocol: 'v1', status: 'Unreachable', peers: 'N/A', seeds: 'N/A', leeches: 'N/A', downloaded: 'N/A', message: 'skipping tracker...', nextAnnounce: '5m', minAnnounce: '0' },
      { url: '[2606:47...]', protocol: 'v1', status: 'Working', peers: 40, seeds: 38, leeches: 2, downloaded: 'N/A', message: '', nextAnnounce: '16m', minAnnounce: '0' },
      { url: '192.168....', protocol: 'v1', status: 'Not working', peers: 'N/A', seeds: 'N/A', leeches: 'N/A', downloaded: 'N/A', message: 'timed out', nextAnnounce: '6m', minAnnounce: '0' },
      { url: '172.16.0...', protocol: 'v1', status: 'Working', peers: 200, seeds: 178, leeches: 58, downloaded: 'N/A', message: '', nextAnnounce: '13m', minAnnounce: '0' },
      { url: '127.0.0....', protocol: 'v1', status: 'Unreachable', peers: 'N/A', seeds: 'N/A', leeches: 'N/A', downloaded: 'N/A', message: 'skipping tracker...', nextAnnounce: '5m', minAnnounce: '0' }
    ]
  },
  {
    url: 'udp://tracker.openbittorrent.com:6969/announce',
    tier: 16,
    protocol: 'v1',
    status: 'Not working',
    peers: 'N/A',
    seeds: 'N/A',
    leeches: 'N/A',
    downloaded: 'N/A',
    message: 'No such host is known',
    nextAnnounce: '5m',
    minAnnounce: '0'
  },
  {
    url: 'udp://tracker.torrent.eu.org:451/announce',
    tier: 15,
    protocol: 'v1',
    status: 'Not working',
    peers: 'N/A',
    seeds: 'N/A',
    leeches: 'N/A',
    downloaded: 'N/A',
    message: 'No such host is known',
    nextAnnounce: '5m',
    minAnnounce: '0'
  },
  {
    url: 'udp://open.stealth.si:80/announce',
    tier: 14,
    protocol: 'v1',
    status: 'Working',
    peers: 200,
    seeds: 181,
    leeches: 56,
    downloaded: 'N/A',
    message: '',
    nextAnnounce: '18m',
    minAnnounce: '0'
  },
  {
    url: 'udp://explodie.org:6969/announce',
    tier: 13,
    protocol: 'v1',
    status: 'Not working',
    peers: 'N/A',
    seeds: 'N/A',
    leeches: 'N/A',
    downloaded: 'N/A',
    message: 'timed out',
    nextAnnounce: '6m',
    minAnnounce: '0'
  },
  {
    url: 'http://tracker.opentrackr.org:1337/announce',
    tier: 12,
    protocol: 'v1',
    status: 'Not working',
    peers: 'N/A',
    seeds: 'N/A',
    leeches: 'N/A',
    downloaded: 'N/A',
    message: 'No such host is known',
    nextAnnounce: '5m',
    minAnnounce: '0'
  },
  {
    url: 'https://tracker.tamersunion.org:443/announce',
    tier: 11,
    protocol: 'v1',
    status: 'Not working',
    peers: 'N/A',
    seeds: 'N/A',
    leeches: 'N/A',
    downloaded: 'N/A',
    message: 'timed out',
    nextAnnounce: '6m',
    minAnnounce: '0'
  },
  {
    url: 'https://tracker.imgoingto.icu:443/announce',
    tier: 10,
    protocol: 'v1',
    status: 'Working',
    peers: 13,
    seeds: 7,
    leeches: 6,
    downloaded: 'N/A',
    message: '',
    nextAnnounce: '15m',
    minAnnounce: '0'
  },
  {
    url: 'udp://p4p.arenabg.com:1337/announce',
    tier: 9,
    protocol: 'v1',
    status: 'Not working',
    peers: 'N/A',
    seeds: 'N/A',
    leeches: 'N/A',
    downloaded: 'N/A',
    message: 'timed out',
    nextAnnounce: '6m',
    minAnnounce: '0'
  },
  {
    url: 'udp://tracker.coppersurfer.tk:6969/announce',
    tier: 8,
    protocol: 'v1',
    status: 'Not working',
    peers: 'N/A',
    seeds: 'N/A',
    leeches: 'N/A',
    downloaded: 'N/A',
    message: 'timed out',
    nextAnnounce: '6m',
    minAnnounce: '0'
  },
  {
    url: 'udp://opentracker.i2p.rocks:6969/announce',
    tier: 7,
    protocol: 'v1',
    status: 'Not working',
    peers: 'N/A',
    seeds: 'N/A',
    leeches: 'N/A',
    downloaded: 'N/A',
    message: 'No such host is known',
    nextAnnounce: '5m',
    minAnnounce: '0'
  },
  {
    url: 'udp://open.demonii.com:1337/announce',
    tier: 6,
    protocol: 'v1',
    status: 'Working',
    peers: 200,
    seeds: 227,
    leeches: 60,
    downloaded: 'N/A',
    message: '',
    nextAnnounce: '13m',
    minAnnounce: '0'
  },
  {
    url: 'udp://9.rarbg.me:2970/announce',
    tier: 5,
    protocol: 'v1',
    status: 'Not working',
    peers: 'N/A',
    seeds: 'N/A',
    leeches: 'N/A',
    downloaded: 'N/A',
    message: 'timed out',
    nextAnnounce: '7m',
    minAnnounce: '0'
  },
  {
    url: 'udp://9.rarbg.to:2710/announce',
    tier: 4,
    protocol: 'v1',
    status: 'Not working',
    peers: 'N/A',
    seeds: 'N/A',
    leeches: 'N/A',
    downloaded: 'N/A',
    message: 'timed out',
    nextAnnounce: '7m',
    minAnnounce: '0'
  }
]

export const DEFAULT_ENDPOINT_TEMPLATES: TrackerInfo[] = [
  { url: '[fe80::fc...]', protocol: 'v1', status: 'Unreachable', peers: 'N/A', seeds: 'N/A', leeches: 'N/A', downloaded: 'N/A', message: 'skipping tracker...', nextAnnounce: '5m', minAnnounce: '0' },
  { url: '[fe80::6e...]', protocol: 'v1', status: 'Unreachable', peers: 'N/A', seeds: 'N/A', leeches: 'N/A', downloaded: 'N/A', message: 'skipping tracker...', nextAnnounce: '5m', minAnnounce: '0' },
  { url: '[::1]:54944', protocol: 'v1', status: 'Unreachable', peers: 'N/A', seeds: 'N/A', leeches: 'N/A', downloaded: 'N/A', message: 'skipping tracker...', nextAnnounce: '5m', minAnnounce: '0' },
  { url: '[2606:47...]', protocol: 'v1', status: 'Working', peers: 40, seeds: 38, leeches: 2, downloaded: 'N/A', message: '', nextAnnounce: '16m', minAnnounce: '0' },
  { url: '192.168....', protocol: 'v1', status: 'Not working', peers: 'N/A', seeds: 'N/A', leeches: 'N/A', downloaded: 'N/A', message: 'timed out', nextAnnounce: '6m', minAnnounce: '0' },
  { url: '172.16.0...', protocol: 'v1', status: 'Working', peers: 200, seeds: 178, leeches: 58, downloaded: 'N/A', message: '', nextAnnounce: '13m', minAnnounce: '0' },
  { url: '127.0.0....', protocol: 'v1', status: 'Unreachable', peers: 'N/A', seeds: 'N/A', leeches: 'N/A', downloaded: 'N/A', message: 'skipping tracker...', nextAnnounce: '5m', minAnnounce: '0' }
]

export function ensureEndpoints(endpoints?: TrackerInfo[], parentStatus?: string): TrackerInfo[] {
  if (endpoints && endpoints.length > 0) return endpoints
  const isWorking = parentStatus === 'Working' || parentStatus === 'working'
  return DEFAULT_ENDPOINT_TEMPLATES.map((ep) => {
    if (!isWorking && ep.status === 'Working') {
      return { ...ep, status: 'Not working', peers: 'N/A', seeds: 'N/A', leeches: 'N/A', message: 'timed out' }
    }
    return ep
  })
}
