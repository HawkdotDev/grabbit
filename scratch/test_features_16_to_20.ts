import * as fs from 'fs'
import * as path from 'path'
import { DownloadManager } from '../src/engine/DownloadManager'
import { TorrentWorker } from '../src/engine/workers/TorrentWorker'
import { DownloadItem } from '../src/engine/types'

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
  console.log('🚀 Running Comprehensive Test Suite: Features 16 to 20')
  console.log('======================================================================\n')

  const testDir = path.join(process.cwd(), 'scratch', 'test_env_16_20')
  if (!fs.existsSync(testDir)) {
    fs.mkdirSync(testDir, { recursive: true })
  }

  const dm = new DownloadManager()

  // -------------------------------------------------------------------------
  // Feature 16: Dedicated EditTrackersModal & Swarm Tracker Manipulation
  // -------------------------------------------------------------------------
  console.log('--- [Feature 16] Dedicated EditTrackersModal & Tracker Management ---')

  const mockTorrentId = 'mock_tor_feat16'
  const mockTorrentInstance = {
    announce: [
      'udp://tracker.opentrackr.org:1337/announce',
      'https://tracker.openbittorrent.com:443/announce'
    ],
    files: [],
    wires: [],
    addTracker: (url: string) => {
      if (!mockTorrentInstance.announce.includes(url)) mockTorrentInstance.announce.push(url)
    },
    removeTracker: (url: string) => {
      const idx = mockTorrentInstance.announce.indexOf(url)
      if (idx !== -1) mockTorrentInstance.announce.splice(idx, 1)
    },
    addPeer: (_addr: string) => {},
    pause: () => {},
    resume: () => {},
    destroy: () => {},
    on: () => {}
  }

  ;(TorrentWorker as unknown as { torrentsMap: Map<string, unknown> }).torrentsMap.set(
    mockTorrentId,
    mockTorrentInstance
  )

  // Test 16.1: Add Tracker
  const addRes1 = TorrentWorker.addTracker(mockTorrentId, 'udp://tracker.torrent.eu.org:451/announce')
  assert(addRes1 === true, 'TorrentWorker.addTracker successfully added tracker')
  assert(
    mockTorrentInstance.announce.includes('udp://tracker.torrent.eu.org:451/announce'),
    'New tracker URL present in active announce list'
  )

  // Test 16.2: Duplicate Tracker Prevention
  TorrentWorker.addTracker(mockTorrentId, 'udp://tracker.torrent.eu.org:451/announce')
  const count = mockTorrentInstance.announce.filter((u) => u === 'udp://tracker.torrent.eu.org:451/announce').length
  assert(count === 1, 'Duplicate tracker URL prevented in announce list')

  // Test 16.3: Remove Tracker
  const removeRes1 = TorrentWorker.removeTracker(mockTorrentId, 'udp://tracker.opentrackr.org:1337/announce')
  assert(removeRes1 === true, 'TorrentWorker.removeTracker successfully removed tracker')
  assert(
    !mockTorrentInstance.announce.includes('udp://tracker.opentrackr.org:1337/announce'),
    'Removed tracker is no longer in announce list'
  )
  console.log('✅ Feature 16 tests passed successfully.\n')

  // -------------------------------------------------------------------------
  // Feature 17: Context Menu Torrent Options & Force Reannounce
  // -------------------------------------------------------------------------
  console.log('--- [Feature 17] Torrent Options & Force Reannounce ---')

  // Test 17.1: Force Reannounce
  let reannounced = false
  mockTorrentInstance.addTracker = (_url: string) => {
    reannounced = true
  }
  const reannounceRes = TorrentWorker.reannounceTorrent(mockTorrentId)
  assert(reannounceRes === true, 'reannounceTorrent returned true for active swarm')
  assert(reannounced === true, 'Active announce URLs triggered during force reannounce')

  // Test 17.2: Torrent Options Update & Persistence in DownloadManager
  const mockTask: DownloadItem = {
    id: 'dl_feat17',
    url: 'magnet:?xt=urn:btih:feedbeef1234567890abcdef',
    name: 'ubuntu-noble.iso',
    savePath: path.join(testDir, 'ubuntu-noble.iso'),
    totalSize: 2000000000,
    downloadedSize: 0,
    speed: 0,
    eta: 0,
    status: 'paused',
    category: 'other',
    priority: 'normal',
    threadCount: 32,
    chunks: [],
    createdAt: Date.now(),
    tags: ['grabbit']
  }
  dm['downloads'].set(mockTask.id, mockTask)

  let updatedEventFired = false
  dm.on('downloadUpdated', (d) => {
    if (d.id === mockTask.id) updatedEventFired = true
  })

  const setOptsRes = dm.setTorrentOptions(mockTask.id, {
    priority: 'high'
  })
  assert(setOptsRes === true, 'setTorrentOptions returned true')
  assert(mockTask.priority === 'high', 'Task priority updated to high')
  assert(updatedEventFired === true, 'downloadUpdated event emitted on torrent options change')
  console.log('✅ Feature 17 tests passed successfully.\n')

  // -------------------------------------------------------------------------
  // Feature 18: Context Menu Export .torrent File
  // -------------------------------------------------------------------------
  console.log('--- [Feature 18] Export .torrent File ---')

  // Test 18.1: Torrent File Buffer Retrieval
  const fakeTorrentBuf = Buffer.from('d8:announce37:udp://tracker.opentrackr.org:1337e')
  ;(mockTorrentInstance as unknown as { torrentFile: Buffer }).torrentFile = fakeTorrentBuf

  const exportedBuf = TorrentWorker.getTorrentFileBuffer(mockTorrentId)
  assert(exportedBuf !== null, 'getTorrentFileBuffer returns active torrent buffer')
  assert(exportedBuf!.equals(fakeTorrentBuf), 'Exported buffer matches source metainfo')

  // Clean up mock torrent
  TorrentWorker.removeTorrent(mockTorrentId)
  console.log('✅ Feature 18 tests passed successfully.\n')

  // -------------------------------------------------------------------------
  // Feature 19: Rename Task & Set Destination Location Persistence
  // -------------------------------------------------------------------------
  console.log('--- [Feature 19] Rename Task & Relocate File Persistence ---')

  // Test 19.1: Task Rename (with physical disk file update)
  const initialFilePath = path.join(testDir, 'initial_file.txt')
  fs.writeFileSync(initialFilePath, 'Hello Grabbit World!', 'utf8')

  const diskDownload: DownloadItem = {
    id: 'dl_disk_19',
    url: 'https://example.com/initial_file.txt',
    name: 'initial_file.txt',
    savePath: initialFilePath,
    totalSize: 20,
    downloadedSize: 20,
    speed: 0,
    eta: 0,
    status: 'completed',
    category: 'documents',
    priority: 'normal',
    threadCount: 1,
    chunks: [],
    createdAt: Date.now(),
    tags: ['grabbit']
  }
  dm['downloads'].set(diskDownload.id, diskDownload)

  const renameRes = dm.renameDownload(diskDownload.id, 'renamed_document.txt')
  assert(renameRes === true, 'renameDownload returned true')
  assert(diskDownload.name === 'renamed_document.txt', 'DownloadItem name updated in memory')
  const newFilePath = path.join(testDir, 'renamed_document.txt')
  assert(diskDownload.savePath === newFilePath, 'savePath updated to match new filename')
  assert(fs.existsSync(newFilePath), 'Physical file on disk successfully renamed to new name')
  assert(!fs.existsSync(initialFilePath), 'Old file path no longer exists')
  assert(fs.readFileSync(newFilePath, 'utf8') === 'Hello Grabbit World!', 'Renamed file contents intact')

  // Test 19.2: Set Download Location (Move file to subfolder)
  const targetSubfolder = path.join(testDir, 'archived_folder')
  fs.mkdirSync(targetSubfolder, { recursive: true })

  const setLocationRes = dm.setDownloadLocation(diskDownload.id, targetSubfolder)
  assert(setLocationRes === true, 'setDownloadLocation returned true')
  const movedFilePath = path.join(targetSubfolder, 'renamed_document.txt')
  assert(diskDownload.savePath === movedFilePath, 'savePath updated to relocated folder target')
  assert(fs.existsSync(movedFilePath), 'Physical file on disk successfully moved to new location')
  assert(!fs.existsSync(newFilePath), 'Old path no longer exists after move')
  assert(fs.readFileSync(movedFilePath, 'utf8') === 'Hello Grabbit World!', 'Relocated file contents intact')
  console.log('✅ Feature 19 tests passed successfully.\n')

  // -------------------------------------------------------------------------
  // Feature 20: Context Menu Dynamic Tags Management & Persistence
  // -------------------------------------------------------------------------
  console.log('--- [Feature 20] Dynamic Tags Management & Persistence ---')

  const taggedItem: DownloadItem = {
    id: 'dl_tag_20',
    url: 'https://example.com/software.tar.gz',
    name: 'software.tar.gz',
    savePath: path.join(testDir, 'software.tar.gz'),
    totalSize: 1000,
    downloadedSize: 1000,
    speed: 0,
    eta: 0,
    status: 'completed',
    category: 'compressed',
    priority: 'normal',
    threadCount: 2,
    chunks: [],
    createdAt: Date.now(),
    tags: ['grabbit', 'work']
  }
  dm['downloads'].set(taggedItem.id, taggedItem)

  // Test 20.1: Toggle existing tag (Remove 'work')
  const toggleRes1 = dm.toggleDownloadTag(taggedItem.id, 'work')
  assert(toggleRes1 === true, 'toggleDownloadTag returned true')
  assert(!taggedItem.tags!.includes('work'), 'Tag "work" successfully toggled OFF')
  assert(taggedItem.tags!.includes('grabbit'), 'Remaining tag "grabbit" preserved')

  // Test 20.2: Toggle new tag (Add 'production')
  const toggleRes2 = dm.toggleDownloadTag(taggedItem.id, 'production')
  assert(toggleRes2 === true, 'toggleDownloadTag returned true')
  assert(taggedItem.tags!.includes('production'), 'Tag "production" successfully toggled ON')

  // Test 20.3: Set custom tags array (batch replace)
  const setTagsRes = dm.setDownloadTags(taggedItem.id, ['archive', 'backup', '2026', 'archive'])
  assert(setTagsRes === true, 'setDownloadTags returned true')
  assert(taggedItem.tags!.length === 3, 'Duplicate tags deduplicated')
  assert(
    taggedItem.tags!.includes('archive') &&
      taggedItem.tags!.includes('backup') &&
      taggedItem.tags!.includes('2026'),
    'Batch tag array updated accurately'
  )
  console.log('✅ Feature 20 tests passed successfully.\n')

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
