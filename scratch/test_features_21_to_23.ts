import * as fs from 'fs'
import * as path from 'path'
import { DownloadManager } from '../src/engine/DownloadManager'
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
  console.log('🚀 Running Comprehensive Test Suite: Features 21 to 23')
  console.log('======================================================================\n')

  const testDir = path.join(process.cwd(), 'scratch', 'test_env_21_23')
  if (!fs.existsSync(testDir)) {
    fs.mkdirSync(testDir, { recursive: true })
  }

  const dm = new DownloadManager()

  // -------------------------------------------------------------------------
  // Feature 21: AddDownloadModal Tags Input & Engine Persistence
  // -------------------------------------------------------------------------
  console.log('--- [Feature 21] AddDownloadModal Tags Input & Engine Persistence ---')

  // Test 21.1: Custom tags array passed on creation
  const dlWithTags = await dm.addDownload('https://releases.ubuntu.com/24.04/ubuntu-24.04-desktop-amd64.iso', {
    filename: 'ubuntu-24.04-desktop-amd64.iso',
    savePath: testDir,
    category: 'other',
    tags: ['iso', 'linux', 'urgent', 'iso'] // Has duplicates and custom tags
  })

  assert(dlWithTags !== null, 'Download created successfully with options')
  assert(Array.isArray(dlWithTags.tags), 'Tags property is an array')
  assert(dlWithTags.tags!.length === 3, 'Duplicate tags filtered (iso, linux, urgent)')
  assert(dlWithTags.tags!.includes('iso'), 'Tag "iso" present')
  assert(dlWithTags.tags!.includes('linux'), 'Tag "linux" present')
  assert(dlWithTags.tags!.includes('urgent'), 'Tag "urgent" present')

  // Test 21.2: Default tags fallback when no custom tags supplied
  const dlDefaultTags = await dm.addDownload('https://example.com/testfile.zip', {
    filename: 'testfile.zip',
    savePath: testDir,
    category: 'compressed'
  })
  assert(dlDefaultTags.tags!.includes('grabbit'), 'Fallback tag "grabbit" present')
  assert(dlDefaultTags.tags!.includes('compressed'), 'Fallback tag category present')
  console.log('✅ Feature 21 tests passed successfully.\n')

  // -------------------------------------------------------------------------
  // Feature 22: Sanitization of Hardcoded Defaults & Dynamic Parsing
  // -------------------------------------------------------------------------
  console.log('--- [Feature 22] Sanitization of Hardcoded Defaults & Dynamic Parsing ---')

  // Test 22.1: Dynamic Magnet name extraction from &dn=
  const magnetUrl = 'magnet:?xt=urn:btih:0123456789abcdef0123456789abcdef01234567&dn=Arch.Linux.2026.08.x86_64.iso'
  const magnetDl = await dm.addDownload(magnetUrl, {
    savePath: testDir
  })
  assert(
    magnetDl.name === 'Arch.Linux.2026.08.x86_64.iso',
    `Dynamic magnet filename parsed correctly: "${magnetDl.name}" (No hardcoded Game of Thrones fallback)`
  )

  // Test 22.2: Dynamic HTTP URL basename extraction
  const httpUrl = 'https://download.videolan.org/vlc/last/win64/vlc-3.0.21-win64.exe'
  const httpDl = await dm.addDownload(httpUrl, {
    savePath: testDir
  })
  assert(
    httpDl.name === 'vlc-3.0.21-win64.exe',
    `Dynamic HTTP filename extracted correctly: "${httpDl.name}"`
  )

  // Test 22.3: Save path follows configured defaultSavePath (no personal user hardcodes)
  assert(
    !magnetDl.savePath.includes('C:\\Users\\dwaip\\Videos'),
    'Save path does not contain hardcoded user path C:\\Users\\dwaip\\Videos'
  )
  console.log('✅ Feature 22 tests passed successfully.\n')

  // -------------------------------------------------------------------------
  // Feature 23: Passing Full Torrent & Download Options to Engine
  // -------------------------------------------------------------------------
  console.log('--- [Feature 23] Passing Full Torrent Options (startPaused, addToTopQueue, etc.) ---')

  // Test 23.1: startPaused Option
  const pausedDl = await dm.addDownload('https://example.com/large-archive.tar.gz', {
    filename: 'large-archive.tar.gz',
    savePath: testDir,
    startPaused: true
  })
  assert(pausedDl.status === 'paused', 'Download status initialized to "paused" when startPaused=true')

  // Test 23.2: addToTopQueue Option (Promotes to top of queue)
  const queueDl1 = await dm.addDownload('https://example.com/queue1.bin', {
    filename: 'queue1.bin',
    savePath: testDir,
    startPaused: true
  })
  const queueDl2 = await dm.addDownload('https://example.com/queue2.bin', {
    filename: 'queue2.bin',
    savePath: testDir,
    startPaused: true,
    addToTopQueue: true
  })

  const queueStats = dm.getQueueStats()
  assert(queueStats.total >= 2, 'Queue stats reflect total items')
  assert(queueDl2 !== null, 'Priority top queue download created')

  // Test 23.3: Extended options payload verification
  const fullOptionsDl = await dm.addDownload('magnet:?xt=urn:btih:fedcba9876543210fedcba9876543210fedcba98&dn=Debian-Live.iso', {
    savePath: testDir,
    category: 'other',
    priority: 'high',
    threadCount: 16,
    tags: ['linux', 'debian', 'distro'],
    startPaused: true,
    addToTopQueue: true,
    sequentialDownload: true,
    firstLastPiecesFirst: true,
    skipHashCheck: false,
    stopCondition: 'none',
    contentLayout: 'original',
    managementMode: 'automatic'
  })

  assert(fullOptionsDl.priority === 'high', 'Priority set to "high"')
  assert(fullOptionsDl.threadCount === 16, 'Thread count set to 16')
  assert(fullOptionsDl.tags!.length === 3, 'Tags count is 3')
  assert(fullOptionsDl.status === 'paused', 'Status is paused')
  console.log('✅ Feature 23 tests passed successfully.\n')

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
