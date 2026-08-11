import * as fs from 'fs'
import * as path from 'path'
import * as http from 'http'
import { DownloadManager } from '../src/engine/DownloadManager'
import { TorrentWorker } from '../src/engine/workers/TorrentWorker'

let passed = 0
let total = 0

function assert(condition: boolean, msg: string) {
  total++
  if (!condition) {
    console.error(`❌ FAIL: ${msg}`)
    throw new Error(msg)
  }
  passed++
  console.log(`  ✅ PASS: ${msg}`)
}

async function main() {
  console.log('======================================================================')
  console.log('🚀 Running Live End-to-End Engine Integration Test (Features 12 - 16)')
  console.log('======================================================================\n')

  const testDir = path.join(process.cwd(), 'scratch', 'test_env_12_16')
  if (!fs.existsSync(testDir)) {
    fs.mkdirSync(testDir, { recursive: true })
  }

  // 1. Start a local HTTP server supporting HTTP 206 Partial Content ranges and error endpoints
  const testPayload = Buffer.alloc(1024 * 1024, 0x42) // 1MB payload
  const server = http.createServer((req, res) => {
    if (req.url === '/file.bin') {
      const range = req.headers.range
      if (range) {
        const parts = range.replace(/bytes=/, '').split('-')
        const start = parseInt(parts[0], 10)
        const end = parts[1] ? parseInt(parts[1], 10) : testPayload.length - 1
        const chunk = testPayload.subarray(start, end + 1)
        res.writeHead(206, {
          'Content-Range': `bytes ${start}-${end}/${testPayload.length}`,
          'Accept-Ranges': 'bytes',
          'Content-Length': chunk.length,
          'ETag': '"live-test-etag-999"',
          'Content-Type': 'application/octet-stream'
        })
        res.end(chunk)
      } else {
        res.writeHead(200, {
          'Content-Length': testPayload.length,
          'Accept-Ranges': 'bytes',
          'ETag': '"live-test-etag-999"',
          'Content-Type': 'application/octet-stream'
        })
        res.end(testPayload)
      }
    } else if (req.url === '/error-file.bin') {
      res.writeHead(404, { 'Content-Type': 'text/plain' })
      res.end('Not Found')
    } else {
      res.writeHead(404)
      res.end()
    }
  })

  await new Promise<void>((resolve) => server.listen(8999, '127.0.0.1', () => resolve()))

  try {
    const dm = new DownloadManager()

    // -----------------------------------------------------------------------
    // Test Feature 12 (Live Push Event Bus)
    // -----------------------------------------------------------------------
    console.log('--- [Feature 12 Integration] Live DownloadManager Event Bus ---')
    const addedDownloads: string[] = []
    let completedEventReceived = false
    let errorEventReceived = false

    dm.on('downloadAdded', (d) => {
      addedDownloads.push(d.name)
    })

    dm.on('downloadCompleted', (d) => {
      completedEventReceived = true
      assert(d.downloadedSize === testPayload.length, `Download completed event emitted with full bytes (${d.downloadedSize})`)
    })

    dm.on('downloadError', (err) => {
      errorEventReceived = true
      assert(!!err.error, `Download error event emitted: ${err.error}`)
    })

    const dl1 = await dm.addDownload('http://127.0.0.1:8999/file.bin', {
      savePath: path.join(testDir, 'file.bin'),
      threadCount: 4
    })

    assert(addedDownloads.includes('file.bin'), 'onDownloadAdded event successfully captured for file.bin')
    assert(dl1.etag === '"live-test-etag-999"', 'ETag populated from HTTP server headers')
    assert(dl1.threadCount === 4, 'Thread count set to 4 parallel workers')

    // Wait for download completion
    let waitLoops = 0
    while (dl1.status !== 'completed' && waitLoops < 50) {
      await new Promise((r) => setTimeout(r, 100))
      waitLoops++
    }

    assert(dl1.status === 'completed', 'Live HTTP download completed successfully')
    assert(completedEventReceived, 'onDownloadCompleted event successfully captured')

    // -----------------------------------------------------------------------
    // Test Feature 12 & 14 (Error event bus & HTTP failure diagnostics)
    // -----------------------------------------------------------------------
    console.log('\n--- [Feature 12/14 Integration] HTTP Error Event Bus & Diagnostics ---')
    const dlError = await dm.addDownload('http://127.0.0.1:8999/error-file.bin', {
      savePath: path.join(testDir, 'error-file.bin')
    })

    // Wait for error state transition
    let errorWaitLoops = 0
    while (dlError.status !== 'error' && errorWaitLoops < 50) {
      await new Promise((r) => setTimeout(r, 100))
      errorWaitLoops++
    }

    assert(dlError.status === 'error', 'Failed HTTP download transitioned to error status')
    assert(dlError.error!.includes('404'), 'Error message contains HTTP 404 failure status')
    assert(errorEventReceived, 'onDownloadError event captured via event emitter')

    // -----------------------------------------------------------------------
    // Test Feature 15 (Torrent Tracker Management Engine)
    // -----------------------------------------------------------------------
    console.log('\n--- [Feature 15 Integration] Torrent Tracker Management ---')
    const mockTorrentId = 'mock_tor_001'
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
      on: () => {},
      length: 1000,
      downloaded: 500,
      downloadSpeed: 100,
      uploadSpeed: 50,
      uploaded: 200,
      progress: 0.5,
      numPeers: 10,
      timeRemaining: 5000
    }

    // Store in torrentsMap via reflection
    ;(TorrentWorker as unknown as { torrentsMap: Map<string, unknown> }).torrentsMap.set(
      mockTorrentId,
      mockTorrentInstance
    )

    const addRes = TorrentWorker.addTracker(mockTorrentId, 'udp://tracker.torrent.eu.org:451/announce')
    assert(addRes === true, 'TorrentWorker.addTracker returned true')
    assert(
      mockTorrentInstance.announce.includes('udp://tracker.torrent.eu.org:451/announce'),
      'Tracker URL added to active announce list'
    )

    const removeRes = TorrentWorker.removeTracker(mockTorrentId, 'udp://tracker.torrent.eu.org:451/announce')
    assert(removeRes === true, 'TorrentWorker.removeTracker returned true')
    assert(
      !mockTorrentInstance.announce.includes('udp://tracker.torrent.eu.org:451/announce'),
      'Tracker URL successfully removed from active announce list'
    )

    // Clean up
    TorrentWorker.removeTorrent(mockTorrentId)

    // -----------------------------------------------------------------------
    // Test Feature 16 (GeneralTab protocol metrics & telemetry check)
    // -----------------------------------------------------------------------
    console.log('\n--- [Feature 16 Integration] Telemetry Data Contract Verification ---')
    const downloads = dm.getDownloads()
    assert(downloads.length >= 2, 'Downloads map populated with both transfers')
    const completedItem = downloads.find((d) => d.id === dl1.id)
    assert(completedItem !== undefined, 'Found completed download')
    assert(completedItem!.status === 'completed', 'Status is "completed"')
    assert(completedItem!.downloadedSize === completedItem!.totalSize, 'Downloaded size equals total size')
    assert(completedItem!.eta === 0, 'Completed ETA is 0')

    console.log('\n======================================================================')
    console.log(`🎉 ALL INTEGRATION TESTS PASSED: ${passed} / ${total} assertions verified!`)
    console.log('======================================================================')
  } finally {
    server.close()
    try {
      fs.rmSync(testDir, { recursive: true, force: true })
    } catch {}
    process.exit(0)
  }
}

main().catch((err) => {
  console.error('Integration test failed:', err)
  process.exit(1)
})
