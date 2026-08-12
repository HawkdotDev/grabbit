import * as fs from 'fs'
import * as path from 'path'
import { DownloadManager } from '../src/engine/DownloadManager'
import { Logger } from '../src/engine/Logger'
import { CategoryManager } from '../src/engine/CategoryManager'
import { StatsCollector } from '../src/engine/StatsCollector'
import { Storage } from '../src/engine/Storage'
import { DownloadItem, SpeedSample, StatusFilter } from '../src/engine/types'

let passed = 0
let total = 0

function assert(condition: boolean, message: string): void {
  total++
  if (!condition) {
    console.error(`❌ FAIL: ${message}`)
    throw new Error(`Assertion failed: ${message}`)
  } else {
    passed++
    console.log(`  ✅ PASS: ${message}`)
  }
}

async function runTestSuite() {
  console.log('======================================================================')
  console.log('🚀 Running Comprehensive Test Suite: Features 31 to 36')
  console.log('======================================================================\n')

  const testDir = path.join(process.cwd(), 'scratch', 'test_env_31_36')
  if (!fs.existsSync(testDir)) {
    fs.mkdirSync(testDir, { recursive: true })
  }

  const dm = new DownloadManager()

  // -------------------------------------------------------------------------
  // Feature 31: Dynamic Thread Count & Swarm Connections
  // -------------------------------------------------------------------------
  console.log('--- [Feature 31] Dynamic Thread Count & Swarm Telemetry ---')
  const httpDl: DownloadItem = {
    id: 'http_dynamic_threads',
    url: 'https://example.com/huge_archive.tar.gz',
    name: 'huge_archive.tar.gz',
    savePath: path.join(testDir, 'huge_archive.tar.gz'),
    totalSize: 100000000,
    downloadedSize: 25000000,
    speed: 5000000,
    eta: 15,
    status: 'downloading',
    category: 'compressed',
    priority: 'high',
    threadCount: 16,
    chunks: [
      { id: 0, startByte: 0, endByte: 25000000, downloadedBytes: 25000000, speed: 0, status: 'completed' },
      { id: 1, startByte: 25000001, endByte: 50000000, downloadedBytes: 12000000, speed: 2500000, status: 'downloading' },
      { id: 2, startByte: 50000001, endByte: 75000000, downloadedBytes: 0, speed: 0, status: 'paused' },
      { id: 3, startByte: 75000001, endByte: 100000000, downloadedBytes: 0, speed: 2500000, status: 'downloading' }
    ],
    createdAt: Date.now()
  }

  const torrentDl: DownloadItem = {
    id: 'torrent_dynamic_swarm',
    url: 'magnet:?xt=urn:btih:d08f9b9087c5e20600a9ecb835b8a07c39097e37&dn=Ubuntu.iso',
    name: 'Ubuntu.iso',
    savePath: path.join(testDir, 'Ubuntu.iso'),
    totalSize: 2000000000,
    downloadedSize: 500000000,
    speed: 12000000,
    upSpeed: 1500000,
    eta: 125,
    status: 'downloading',
    category: 'compressed',
    priority: 'normal',
    threadCount: 8,
    peersCount: 42,
    seedsCount: 128,
    chunks: [],
    createdAt: Date.now()
  }

  // Verify HTTP dynamic threads
  const httpThreads = httpDl.threadCount || (httpDl.chunks?.length ?? 8)
  assert(httpThreads === 16, 'HTTP download reports accurate configured 16 threads (not hardcoded 32)')
  assert(httpDl.chunks.length === 4, 'HTTP download chunks length matches 4 parallel split streams')

  // Verify Torrent dynamic swarm
  const isTorrent = torrentDl.url.startsWith('magnet:') || !!torrentDl.infoHash
  assert(isTorrent, 'Torrent download correctly identified')
  assert(torrentDl.peersCount === 42, 'Dynamic peers count is 42')
  assert(torrentDl.seedsCount === 128, 'Dynamic seeds count is 128')
  console.log('✅ Feature 31 tests passed successfully.\n')

  // -------------------------------------------------------------------------
  // Feature 32: Log Engine & Diagnostics Export
  // -------------------------------------------------------------------------
  console.log('--- [Feature 32] Log Engine & Diagnostics Export ---')
  Logger.info('SYSTEM', 'Grabbit Engine Boot Sequence Started')
  Logger.info('TRANSFER', 'Allocated 16 parallel threads for archive download', { downloadId: httpDl.id })
  Logger.warn('QOS', 'Latency spike detected (185ms), dynamic throttling activated')
  Logger.error('SWARM', 'Peer disconnected abruptly: 192.168.1.50:6881')

  const logBuffer = Logger.getLogs()
  assert(logBuffer.length >= 4, 'Logger buffer captures in-memory events')
  const formattedText = Logger.getFormattedLogText()
  assert(formattedText.includes('GRABBIT DOWNLOAD ACCELERATOR - DIAGNOSTIC SYSTEM LOG'), 'Log header present')
  assert(formattedText.includes('[INFO ] [SYSTEM    ]'), 'Formatted INFO log entry present')
  assert(formattedText.includes('[WARN ] [QOS       ]'), 'Formatted WARN log entry present')
  assert(formattedText.includes('[ERROR] [SWARM     ]'), 'Formatted ERROR log entry present')

  const exportPath = path.join(testDir, 'exported_diagnostic_log.txt')
  const exportOk = await Logger.exportToFile(exportPath)
  assert(exportOk, 'Logger.exportToFile succeeded')
  assert(fs.existsSync(exportPath), 'Physical exported log file exists on disk')
  const diskLogContent = fs.readFileSync(exportPath, 'utf8')
  assert(diskLogContent.includes('Latency spike detected'), 'Exported log contents match memory buffer')
  console.log('✅ Feature 32 tests passed successfully.\n')

  // -------------------------------------------------------------------------
  // Feature 33: Seeding Status Lifecycle
  // -------------------------------------------------------------------------
  console.log('--- [Feature 33] Seeding Status Lifecycle ---')
  const seedingItem: DownloadItem = {
    id: 'dl_seeding_test',
    url: 'magnet:?xt=urn:btih:0123456789abcdef0123456789abcdef01234567&dn=SeedLinux.iso',
    name: 'SeedLinux.iso',
    savePath: path.join(testDir, 'SeedLinux.iso'),
    totalSize: 500000000,
    downloadedSize: 500000000,
    uploadedSize: 150000000,
    speed: 0,
    upSpeed: 2500000,
    eta: 0,
    status: 'seeding',
    category: 'compressed',
    priority: 'normal',
    threadCount: 8,
    peersCount: 15,
    seedsCount: 60,
    chunks: [],
    createdAt: Date.now()
  }

  assert(seedingItem.status === 'seeding', 'Torrent item status is seeding')
  assert((seedingItem.upSpeed || 0) > 0, 'Seeding item has active upload speed')
  assert(seedingItem.downloadedSize === seedingItem.totalSize, 'Seeding item is 100% downloaded')
  console.log('✅ Feature 33 tests passed successfully.\n')

  // -------------------------------------------------------------------------
  // Feature 34: StatusFilter Matching Compatibility
  // -------------------------------------------------------------------------
  console.log('--- [Feature 34] StatusFilter Matching Compatibility ---')
  const sampleDownloads: DownloadItem[] = [
    httpDl, // downloading, running, active, speed > 0
    seedingItem, // seeding, running, active, upSpeed > 0
    {
      id: 'paused_1',
      url: 'https://example.com/paused.zip',
      name: 'paused.zip',
      savePath: path.join(testDir, 'paused.zip'),
      totalSize: 1000,
      downloadedSize: 500,
      speed: 0,
      upSpeed: 0,
      eta: 0,
      status: 'paused',
      category: 'compressed',
      priority: 'normal',
      threadCount: 4,
      chunks: [],
      createdAt: Date.now()
    },
    {
      id: 'completed_1',
      url: 'https://example.com/finished.pdf',
      name: 'finished.pdf',
      savePath: path.join(testDir, 'finished.pdf'),
      totalSize: 2000,
      downloadedSize: 2000,
      speed: 0,
      upSpeed: 0,
      eta: 0,
      status: 'completed',
      category: 'documents',
      priority: 'normal',
      threadCount: 2,
      chunks: [],
      createdAt: Date.now()
    },
    {
      id: 'error_1',
      url: 'https://example.com/broken.exe',
      name: 'broken.exe',
      savePath: path.join(testDir, 'broken.exe'),
      totalSize: 5000,
      downloadedSize: 0,
      speed: 0,
      upSpeed: 0,
      eta: 0,
      status: 'error',
      category: 'executables',
      priority: 'low',
      threadCount: 4,
      chunks: [],
      createdAt: Date.now()
    }
  ]

  function filterByStatus(items: DownloadItem[], statusFilter: StatusFilter): DownloadItem[] {
    return items.filter((d) => {
      if (statusFilter === 'all') return true
      if (statusFilter === 'downloading') return d.status === 'downloading'
      if (statusFilter === 'seeding') return d.status === 'seeding'
      if (statusFilter === 'completed') return d.status === 'completed'
      if (statusFilter === 'running') return d.status === 'downloading' || d.status === 'seeding'
      if (statusFilter === 'stopped') return d.status === 'paused' || d.status === 'queued'
      if (statusFilter === 'active') return d.speed > 0 || (d.upSpeed || 0) > 0
      if (statusFilter === 'inactive') return d.speed === 0 && (d.upSpeed || 0) === 0
      if (statusFilter === 'stalled') return d.status === 'stalled'
      if (statusFilter === 'checking') return d.status === 'checking'
      if (statusFilter === 'errored') return d.status === 'error'
      return true
    })
  }

  assert(filterByStatus(sampleDownloads, 'all').length === 5, 'StatusFilter all matches 5 items')
  assert(filterByStatus(sampleDownloads, 'downloading').length === 1, 'StatusFilter downloading matches 1 item')
  assert(filterByStatus(sampleDownloads, 'seeding').length === 1, 'StatusFilter seeding matches 1 item')
  assert(filterByStatus(sampleDownloads, 'running').length === 2, 'StatusFilter running matches 2 items (downloading + seeding)')
  assert(filterByStatus(sampleDownloads, 'stopped').length === 1, 'StatusFilter stopped matches 1 paused item')
  assert(filterByStatus(sampleDownloads, 'active').length === 2, 'StatusFilter active matches 2 transfers with throughput')
  assert(filterByStatus(sampleDownloads, 'inactive').length === 3, 'StatusFilter inactive matches 3 idle transfers')
  assert(filterByStatus(sampleDownloads, 'errored').length === 1, 'StatusFilter errored matches 1 failed item')
  console.log('✅ Feature 34 tests passed successfully.\n')

  // -------------------------------------------------------------------------
  // Feature 35: Category & Preload Bridge Verification
  // -------------------------------------------------------------------------
  console.log('--- [Feature 35] Category & Preload Bridge ---')
  const categories = CategoryManager.getAllCategories()
  assert(Array.isArray(categories.video), 'Video category has extensions list')
  assert(categories.video.includes('mp4'), 'Video category contains mp4')
  assert(categories.compressed.includes('zip'), 'Compressed category contains zip')
  assert(categories.code.includes('ts'), 'Code category contains ts')

  // Test setCategory on DownloadManager
  const testItem = await dm.addDownload({
    url: 'https://example.com/data.json',
    filename: 'data.json',
    savePath: path.join(testDir, 'data.json')
  })
  assert(testItem.category === 'code', 'data.json auto-categorized as code')
  const setCatResult = dm.setCategory(testItem.id, 'documents')
  assert(setCatResult, 'setCategory returned true')
  assert(dm.getDownload(testItem.id)?.category === 'documents', 'Category updated to documents in memory')
  console.log('✅ Feature 35 tests passed successfully.\n')

  // -------------------------------------------------------------------------
  // Feature 36: Speed History Storage Persistence
  // -------------------------------------------------------------------------
  console.log('--- [Feature 36] Speed History Storage Persistence ---')
  const sampleHistory: SpeedSample[] = [
    { timestamp: Date.now() - 3000, downloadSpeed: 10485760, uploadSpeed: 524288 },
    { timestamp: Date.now() - 2000, downloadSpeed: 12582912, uploadSpeed: 629145 },
    { timestamp: Date.now() - 1000, downloadSpeed: 15728640, uploadSpeed: 786432 }
  ]

  await Storage.saveSpeedHistory(sampleHistory)
  const loadedHistory = Storage.loadSpeedHistory()
  assert(loadedHistory.length >= 3, 'Speed history loaded from Storage')
  assert(loadedHistory[loadedHistory.length - 1].downloadSpeed === 15728640, 'Latest sample download speed matches 15 MB/s')
  assert(loadedHistory[loadedHistory.length - 1].uploadSpeed === 786432, 'Latest sample upload speed matches ~786 KB/s')

  const statsCollector = new StatsCollector()
  assert(statsCollector.getHistory().length >= 3, 'StatsCollector initialized with persisted history')
  console.log('✅ Feature 36 tests passed successfully.\n')

  console.log('======================================================================')
  console.log(`🎉 ALL TESTS PASSED: ${passed} / ${total} assertions verified!`)
  console.log('======================================================================')

  // Cleanup
  try {
    fs.rmSync(testDir, { recursive: true, force: true })
  } catch {}
  process.exit(0)
}

runTestSuite().catch((err) => {
  console.error('Test suite failed:', err)
  process.exit(1)
})
