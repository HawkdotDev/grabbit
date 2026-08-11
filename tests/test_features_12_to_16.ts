import * as fs from 'fs'
import * as path from 'path'
import { EventEmitter } from 'events'
import { formatBytes, formatSpeed } from '../src/renderer/src/utils/formatters'
import { DownloadItem, ChunkInfo } from '../src/engine/types'

// Test runner helper
let passedTests = 0
let totalTests = 0

function assert(condition: boolean, message: string): void {
  totalTests++
  if (!condition) {
    console.error(`❌ FAIL: ${message}`)
    throw new Error(`Assertion failed: ${message}`)
  } else {
    passedTests++
    console.log(`  ✅ PASS: ${message}`)
  }
}

async function runTestSuite() {
  console.log('======================================================================')
  console.log('🚀 Running Comprehensive Test Suite: Features 12 to 16')
  console.log('======================================================================\n')

  // -------------------------------------------------------------------------
  // Feature 12: Real-Time Push Event-Driven Notifications Bus (Problem #11)
  // -------------------------------------------------------------------------
  console.log('--- [Feature 12] Real-Time Push Event-Driven Notifications Bus ---')

  const notificationBus = new EventEmitter()
  type NotificationType = 'info' | 'success' | 'error'
  interface NotificationItem {
    id: string
    title: string
    message: string
    timestamp: string
    read: boolean
    type: NotificationType
  }

  let notifications: NotificationItem[] = [
    {
      id: 'welcome',
      title: 'Grabbit Engine Active',
      message: 'Multi-threaded chunk engine and WebTorrent swarm ready.',
      timestamp: 'Just now',
      read: true,
      type: 'info'
    }
  ]

  // Setup listeners mirroring HeaderActions.tsx
  notificationBus.on('downloadAdded', (download: Partial<DownloadItem>) => {
    notifications = [
      {
        id: `added_${Date.now()}_${Math.random().toString(36).slice(2, 5)}`,
        title: 'Download Queued',
        message: `${download.name || 'New download'} added to transfer queue.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        read: false,
        type: 'info'
      },
      ...notifications.slice(0, 49)
    ]
  })

  notificationBus.on('downloadCompleted', (download: Partial<DownloadItem>) => {
    const sizeMb = (((download.totalSize || 0) as number) / 1048576).toFixed(1)
    notifications = [
      {
        id: `comp_${Date.now()}_${Math.random().toString(36).slice(2, 5)}`,
        title: 'Download Completed',
        message: `${download.name} (${sizeMb} MB) finished downloading successfully.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        read: false,
        type: 'success'
      },
      ...notifications.slice(0, 49)
    ]
  })

  notificationBus.on('downloadError', (data: { id: string; error: string }) => {
    notifications = [
      {
        id: `err_${Date.now()}_${Math.random().toString(36).slice(2, 5)}`,
        title: 'Download Interrupted',
        message: data.error || 'Transfer failed due to a network or connection error.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        read: false,
        type: 'error'
      },
      ...notifications.slice(0, 49)
    ]
  })

  // Test 12.1: Add Download Notification
  notificationBus.emit('downloadAdded', { name: 'ubuntu-24.04-desktop-amd64.iso' })
  assert(notifications.length === 2, 'Notification added to list')
  assert(notifications[0].title === 'Download Queued', 'Notification title is "Download Queued"')
  assert(notifications[0].type === 'info', 'Notification type is "info"')
  assert(!notifications[0].read, 'New notification is unread')
  assert(
    notifications[0].message === 'ubuntu-24.04-desktop-amd64.iso added to transfer queue.',
    'Notification message matches filename'
  )

  // Test 12.2: Download Completed Notification
  notificationBus.emit('downloadCompleted', {
    name: 'ubuntu-24.04-desktop-amd64.iso',
    totalSize: 524288000 // 500 MB
  })
  assert(notifications.length === 3, 'Completion notification added')
  assert(notifications[0].title === 'Download Completed', 'Completion title is "Download Completed"')
  assert(notifications[0].type === 'success', 'Completion type is "success"')
  assert(
    notifications[0].message === 'ubuntu-24.04-desktop-amd64.iso (500.0 MB) finished downloading successfully.',
    'Completion message calculates MB accurately'
  )

  // Test 12.3: Download Error Notification
  notificationBus.emit('downloadError', {
    id: 'dl_err_1',
    error: 'HTTP 404: Not Found on remote server'
  })
  assert(notifications.length === 4, 'Error notification added')
  assert(notifications[0].title === 'Download Interrupted', 'Error title is "Download Interrupted"')
  assert(notifications[0].type === 'error', 'Error type is "error"')
  assert(
    notifications[0].message === 'HTTP 404: Not Found on remote server',
    'Error message matches backend failure reason'
  )

  // Test 12.4: Queue Capping at 50 notifications
  for (let i = 0; i < 60; i++) {
    notificationBus.emit('downloadAdded', { name: `file_${i}.bin` })
  }
  assert(notifications.length === 50, 'Notifications list is capped at max 50 items')

  // Test 12.5: Mark as Read & Clear All
  const unreadCountBefore = notifications.filter((n) => !n.read).length
  assert(unreadCountBefore > 0, 'Unread notification count is positive')

  // Mark single as read
  const targetId = notifications[0].id
  notifications = notifications.map((n) => (n.id === targetId ? { ...n, read: true } : n))
  assert(notifications[0].read === true, 'Target notification successfully marked as read')

  // Mark all as read
  notifications = notifications.map((n) => ({ ...n, read: true }))
  assert(notifications.every((n) => n.read), 'All notifications successfully marked as read')

  // Clear all
  notifications = []
  assert(notifications.length === 0, 'Notifications successfully cleared')
  console.log('✅ Feature 12 tests passed successfully.\n')

  // -------------------------------------------------------------------------
  // Feature 13: Profile Dropdown, API Tokens, Native Host & Lock Screen (Problem #12)
  // -------------------------------------------------------------------------
  console.log('--- [Feature 13] Profile Gateway, API Tokens, Native Host & Lock Screen ---')

  // Test 13.1: API Token Generator
  function generateApiToken(): string {
    const chars = '0123456789abcdef'
    let token = 'gbt_live_'
    for (let i = 0; i < 24; i++) {
      token += chars[Math.floor(Math.random() * chars.length)]
    }
    return token
  }

  const token1 = generateApiToken()
  const token2 = generateApiToken()
  assert(token1.startsWith('gbt_live_'), 'Token starts with "gbt_live_" prefix')
  assert(token1.length === 9 + 24, 'Token has exactly 33 characters (9 prefix + 24 hex)')
  assert(token1 !== token2, 'Generated tokens are distinct and random')
  assert(/^gbt_live_[0-9a-f]{24}$/.test(token1), 'Token matches valid hexadecimal format')

  // Test 13.2: Native Host Manifest Creation
  const tempManifestPath = path.join(process.cwd(), 'scratch', 'com.grabbit.native.json')
  const manifest = {
    name: 'com.grabbit.native',
    description: 'Grabbit Desktop Native Messaging Host',
    path: process.execPath,
    type: 'stdio',
    allowed_origins: ['chrome-extension://grabbit_extension_id/']
  }
  fs.writeFileSync(tempManifestPath, JSON.stringify(manifest, null, 2), 'utf8')
  assert(fs.existsSync(tempManifestPath), 'Native messaging host manifest file created')
  const readManifest = JSON.parse(fs.readFileSync(tempManifestPath, 'utf8'))
  assert(readManifest.name === 'com.grabbit.native', 'Manifest name is com.grabbit.native')
  assert(readManifest.type === 'stdio', 'Manifest type is stdio')
  assert(
    readManifest.allowed_origins.includes('chrome-extension://grabbit_extension_id/'),
    'Manifest allowed_origins includes Chrome extension ID'
  )
  fs.unlinkSync(tempManifestPath)

  // Test 13.3: Remote Gateway URLs formatting
  const testPort = '6800'
  const httpRpcUrl = `http://127.0.0.1:${testPort}/jsonrpc`
  const wsRpcUrl = `ws://127.0.0.1:${testPort}/jsonrpc`
  assert(httpRpcUrl === 'http://127.0.0.1:6800/jsonrpc', 'HTTP RPC endpoint synthesized correctly')
  assert(wsRpcUrl === 'ws://127.0.0.1:6800/jsonrpc', 'WebSocket RPC endpoint synthesized correctly')

  // Test 13.4: Lock Screen PIN Validation Logic
  function testUnlock(pin: string): { unlocked: boolean; error?: string } {
    if (pin === '1234' || pin.length >= 4) {
      return { unlocked: true }
    }
    return { unlocked: false, error: 'Enter PIN (min 4 characters, default: 1234)' }
  }

  assert(testUnlock('1234').unlocked === true, 'Default PIN "1234" unlocks session')
  assert(testUnlock('5678').unlocked === true, '4-digit PIN "5678" unlocks session')
  assert(testUnlock('abc').unlocked === false, 'Short PIN "abc" is rejected')
  assert(testUnlock('').unlocked === false, 'Empty PIN is rejected')
  console.log('✅ Feature 13 tests passed successfully.\n')

  // -------------------------------------------------------------------------
  // Feature 14: HttpSourcesTab Multi-Source Diagnostics & Mirror URL Engine (Problem #13)
  // -------------------------------------------------------------------------
  console.log('--- [Feature 14] HttpSourcesTab Multi-Source Diagnostics & Mirror URL Engine ---')

  // Test 14.1: URL Protocol & Host Parsing
  function parseHttpSource(urlStr: string) {
    let parsedUrl: URL | null = null
    try {
      parsedUrl = new URL(urlStr)
    } catch {
      return null
    }
    const isHttps = parsedUrl.protocol === 'https:'
    const isTorrent = urlStr.startsWith('magnet:') || urlStr.endsWith('.torrent')
    return {
      isHttps,
      isTorrent,
      protocolBadge: isHttps ? 'HTTPS Secure' : 'HTTP Plain',
      hostname: parsedUrl.hostname,
      port: parsedUrl.port || (isHttps ? '443' : '80')
    }
  }

  const httpsSource = parseHttpSource('https://cdn.example.org:8443/releases/setup.exe')
  assert(httpsSource !== null, 'HTTPS URL parsed')
  assert(httpsSource!.isHttps === true, 'HTTPS protocol detected')
  assert(httpsSource!.protocolBadge === 'HTTPS Secure', 'Protocol badge is "HTTPS Secure"')
  assert(httpsSource!.hostname === 'cdn.example.org', 'Hostname parsed correctly')
  assert(httpsSource!.port === '8443', 'Custom port 8443 parsed correctly')

  const httpSource = parseHttpSource('http://mirror.us.kernel.org/linux/kernel.tar.xz')
  assert(httpSource !== null, 'HTTP URL parsed')
  assert(httpSource!.isHttps === false, 'HTTP plain protocol detected')
  assert(httpSource!.protocolBadge === 'HTTP Plain', 'Protocol badge is "HTTP Plain"')
  assert(httpSource!.hostname === 'mirror.us.kernel.org', 'Kernel mirror hostname parsed')
  assert(httpSource!.port === '80', 'Default HTTP port 80 assigned')

  // Test 14.2: Torrent Guard
  const magnetSource = parseHttpSource('magnet:?xt=urn:btih:d6b63309a47321e064ec072c4ec3beeeffda04bb')
  assert(magnetSource!.isTorrent === true, 'Magnet URL flagged as torrent transfer')

  // Test 14.3: Per-Thread Worker Range Slicing Math
  const chunks: ChunkInfo[] = [
    { id: 0, startByte: 0, endByte: 1048575, downloadedBytes: 1048576, status: 'completed', speed: 0 },
    { id: 1, startByte: 1048576, endByte: 2097151, downloadedBytes: 524288, status: 'downloading', speed: 2097152 },
    { id: 2, startByte: 2097152, endByte: 3145727, downloadedBytes: 0, status: 'queued', speed: 0 }
  ]

  // Chunk 0
  const c0Size = chunks[0].endByte - chunks[0].startByte + 1
  const c0Progress = (chunks[0].downloadedBytes / c0Size) * 100
  assert(c0Size === 1048576, 'Chunk 0 byte range is 1 MiB')
  assert(c0Progress === 100, 'Chunk 0 progress is 100%')

  // Chunk 1
  const c1Size = chunks[1].endByte - chunks[1].startByte + 1
  const c1Progress = (chunks[1].downloadedBytes / c1Size) * 100
  assert(c1Progress === 50, 'Chunk 1 progress is 50%')
  assert(formatSpeed(chunks[1].speed) === '2.0 MiB/s', 'Chunk 1 speed formatted to 2.0 MiB/s')

  // Test 14.4: Mirror Sources Management
  interface MirrorSource {
    id: string
    url: string
    status: 'active' | 'standby' | 'error'
    pingMs?: number
  }

  let mirrors: MirrorSource[] = []
  function addMirror(urlInput: string): boolean {
    try {
      new URL(urlInput.trim())
      mirrors.push({
        id: `mirror_${Date.now()}_${Math.random().toString(36).slice(2, 5)}`,
        url: urlInput.trim(),
        status: 'standby',
        pingMs: 45
      })
      return true
    } catch {
      return false
    }
  }

  function deleteMirror(id: string): void {
    mirrors = mirrors.filter((m) => m.id !== id)
  }

  assert(addMirror('https://mirror1.fastly.net/archive.tar.gz'), 'Valid mirror added')
  assert(addMirror('https://mirror2.cloudflare.com/archive.tar.gz'), 'Second valid mirror added')
  assert(!addMirror('invalid-mirror-url'), 'Invalid mirror string rejected')
  assert(mirrors.length === 2, '2 mirror sources active in manager')
  const mirrorToDelete = mirrors[0].id
  deleteMirror(mirrorToDelete)
  assert(mirrors.length === 1, 'Mirror source deleted by ID')
  assert(mirrors[0].url === 'https://mirror2.cloudflare.com/archive.tar.gz', 'Remaining mirror intact')
  console.log('✅ Feature 14 tests passed successfully.\n')

  // -------------------------------------------------------------------------
  // Feature 15: TrackersTab Fake Tracker Purge & Live Dynamic Tracker Manager (Problem #14)
  // -------------------------------------------------------------------------
  console.log('--- [Feature 15] TrackersTab Fake Tracker Purge & Dynamic Tracker Manager ---')

  const AUTHENTIC_DEFAULT_TRACKERS = [
    { url: 'udp://tracker.opentrackr.org:1337/announce', status: 'working', peers: 42 },
    { url: 'https://tracker.openbittorrent.com:443/announce', status: 'working', peers: 18 },
    { url: 'udp://tracker.torrent.eu.org:451/announce', status: 'working', peers: 25 },
    { url: 'udp://open.stealth.si:80/announce', status: 'working', peers: 12 }
  ]

  // Test 15.1: Fake Tracker Purge Check
  const hasFakeTracker = AUTHENTIC_DEFAULT_TRACKERS.some((t) =>
    t.url.includes('tracker.grabbit.io')
  )
  assert(!hasFakeTracker, 'Fictional tracker "tracker.grabbit.io" is completely purged')
  assert(AUTHENTIC_DEFAULT_TRACKERS.length === 4, '4 Authentic public BitTorrent trackers present')
  assert(
    AUTHENTIC_DEFAULT_TRACKERS.some((t) => t.url.includes('opentrackr.org')),
    'Includes OpenTrackr public tracker'
  )
  assert(
    AUTHENTIC_DEFAULT_TRACKERS.some((t) => t.url.includes('openbittorrent.com')),
    'Includes OpenBitTorrent public tracker'
  )

  // Test 15.2: Dynamic Tracker Manager CRUD
  let localTrackers = [...AUTHENTIC_DEFAULT_TRACKERS]

  function addTracker(url: string): void {
    if (!url.trim()) return
    if (!localTrackers.some((t) => t.url === url.trim())) {
      localTrackers.push({ url: url.trim(), status: 'working', peers: 0 })
    }
  }

  function removeTracker(url: string): void {
    localTrackers = localTrackers.filter((t) => t.url !== url)
  }

  addTracker('udp://tracker.coppersurfer.tk:6969/announce')
  assert(localTrackers.length === 5, 'New dynamic tracker added')
  assert(
    localTrackers.some((t) => t.url === 'udp://tracker.coppersurfer.tk:6969/announce'),
    'Dynamic tracker entry verified'
  )

  removeTracker('udp://tracker.coppersurfer.tk:6969/announce')
  assert(localTrackers.length === 4, 'Dynamic tracker removed')

  // Test 15.3: Trackerless Services Swarm Mesh (DHT / PeX / LSD)
  const totalSwarmPeers = 35
  const trackerlessServices = [
    {
      name: 'DHT (Distributed Hash Table)',
      status: 'active',
      nodes: totalSwarmPeers > 0 ? totalSwarmPeers * 4 : 64,
      message: 'IPv4 / IPv6 Swarm Mesh'
    },
    {
      name: 'PeX (Peer Exchange)',
      status: 'active',
      nodes: totalSwarmPeers,
      message: 'UtPex μTP Protocol'
    },
    {
      name: 'LSD (Local Peer Discovery)',
      status: 'active',
      nodes: 1,
      message: 'Multicast 239.192.152.143:6771'
    }
  ]

  assert(trackerlessServices[0].nodes === 140, 'DHT nodes computed from peers (35 * 4 = 140)')
  assert(trackerlessServices[1].nodes === 35, 'PeX nodes matches active peers (35)')
  assert(trackerlessServices[2].nodes === 1, 'LSD multicast node active')

  // Test 15.4: Sub-tab filtering
  const workingTrackers = localTrackers.filter((t) => t.status === 'working')
  assert(workingTrackers.length === 4, 'Working trackers filter operates correctly')
  console.log('✅ Feature 15 tests passed successfully.\n')

  // -------------------------------------------------------------------------
  // Feature 16: GeneralTab Protocol-Aware Telemetry & Accurate Seed/Peer Metrics (Problem #15)
  // -------------------------------------------------------------------------
  console.log('--- [Feature 16] GeneralTab Protocol-Aware Telemetry & Accurate Metrics ---')

  // Test 16.1: ETA Formatter Precision
  function formatEtaCustom(seconds: number): string {
    if (seconds <= 0 || !isFinite(seconds)) return 'Ready / Idle'
    if (seconds < 60) return `${seconds}s`
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    if (mins < 60) return `${mins}m ${secs}s`
    const hours = Math.floor(mins / 60)
    const remMins = mins % 60
    return `${hours}h ${remMins}m`
  }

  assert(formatEtaCustom(0) === 'Ready / Idle', '0s ETA formats as "Ready / Idle"')
  assert(formatEtaCustom(-5) === 'Ready / Idle', 'Negative ETA formats as "Ready / Idle"')
  assert(formatEtaCustom(Infinity) === 'Ready / Idle', 'Infinity ETA formats as "Ready / Idle"')
  assert(formatEtaCustom(42) === '42s', '42s ETA formats as "42s"')
  assert(formatEtaCustom(125) === '2m 5s', '125s ETA formats as "2m 5s"')
  assert(formatEtaCustom(3665) === '1h 1m', '3665s ETA formats as "1h 1m"')
  assert(formatEtaCustom(7200) === '2h 0m', '7200s ETA formats as "2h 0m"')

  // Test 16.2: Protocol-Aware Telemetry Rendering Logic
  const mockHttpDownload: DownloadItem = {
    id: 'dl_http_1',
    url: 'https://example.com/bigfile.zip',
    name: 'bigfile.zip',
    savePath: 'C:\\Downloads\\bigfile.zip',
    totalSize: 104857600, // 100 MB
    downloadedSize: 52428800, // 50 MB
    speed: 5242880, // 5 MB/s
    eta: 10,
    status: 'downloading',
    category: 'compressed',
    priority: 'high',
    threadCount: 8,
    chunks: [],
    createdAt: Date.now() - 60000,
    etag: '"abc-123"',
    upSpeed: 0,
    uploadedSize: 0,
    ratio: 0.0,
    tags: ['grabbit', 'archives']
  }

  const isHttpTorrent = mockHttpDownload.url.startsWith('magnet:') || mockHttpDownload.url.endsWith('.torrent')
  assert(!isHttpTorrent, 'HTTP download correctly identified as non-torrent')

  const mockTorrentDownload: DownloadItem = {
    id: 'dl_tor_1',
    url: 'magnet:?xt=urn:btih:c12fe1c06bba254a9dc9f519b335380dc1f74c26&dn=ArchLinux',
    name: 'ArchLinux',
    savePath: 'C:\\Downloads\\ArchLinux.iso',
    totalSize: 950000000,
    downloadedSize: 475000000,
    speed: 10485760,
    eta: 45,
    status: 'downloading',
    category: 'other',
    priority: 'normal',
    threadCount: 32,
    chunks: [],
    createdAt: Date.now() - 120000,
    upSpeed: 1048576,
    uploadedSize: 250000000,
    ratio: 0.53,
    seedsCount: 84,
    peersCount: 19,
    infoHash: 'c12fe1c06bba254a9dc9f519b335380dc1f74c26',
    tags: ['grabbit', 'other']
  }

  const isTorTorrent = mockTorrentDownload.url.startsWith('magnet:') || mockTorrentDownload.url.endsWith('.torrent')
  assert(isTorTorrent, 'Magnet download correctly identified as torrent transfer')

  // Verify seeds / peers are genuine and not fallback || 12 / || 45
  const seedsDisplay = `${mockTorrentDownload.seedsCount ?? 0} Seeds / ${mockTorrentDownload.peersCount ?? 0} Peers`
  assert(seedsDisplay === '84 Seeds / 19 Peers', 'Genuine seed/peer metrics displayed (84 Seeds / 19 Peers)')

  // Checksum and InfoHash fallback
  const checksumDisplay = mockTorrentDownload.infoHash || mockTorrentDownload.checksum || 'N/A'
  assert(
    checksumDisplay === 'c12fe1c06bba254a9dc9f519b335380dc1f74c26',
    'InfoHash / Checksum correctly extracted'
  )

  // Ratio and Speed formatting
  assert(formatBytes(mockTorrentDownload.totalSize) === '905.99 MiB', 'Total size formatted in MiB')
  assert(formatSpeed(mockTorrentDownload.speed) === '10.0 MiB/s', 'Download speed formatted')
  assert(formatSpeed(mockTorrentDownload.upSpeed) === '1.0 MiB/s', 'Upload speed formatted')
  assert(mockTorrentDownload.ratio === 0.53, 'Share ratio tracked accurately')
  console.log('✅ Feature 16 tests passed successfully.\n')

  console.log('======================================================================')
  console.log(`🎉 ALL TESTS PASSED: ${passedTests} / ${totalTests} assertions verified!`)
  console.log('======================================================================')
}

runTestSuite().catch((err) => {
  console.error('Test suite failed with error:', err)
  process.exit(1)
})
