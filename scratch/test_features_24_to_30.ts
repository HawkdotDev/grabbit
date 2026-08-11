import * as fs from 'fs'
import * as path from 'path'
import { DownloadManager } from '../src/engine/DownloadManager'
import { RateLimiter } from '../src/engine/RateLimiter'
import { AdaptiveQoS } from '../src/engine/AdaptiveQoS'
import { PostProcessor } from '../src/engine/PostProcessor'
import { MediaWorker } from '../src/engine/workers/MediaWorker'
import { RemoteServer } from '../src/server/RemoteServer'
import {
  formatNativeMessage,
  parseNativeMessage,
  DEFAULT_EXTENSION_ORIGINS
} from '../src/main/browser-integration/native_messaging_host'
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
  console.log('🚀 Running Comprehensive Test Suite: Features 24 to 30')
  console.log('======================================================================\n')

  const testDir = path.join(process.cwd(), 'scratch', 'test_env_24_30')
  if (!fs.existsSync(testDir)) {
    fs.mkdirSync(testDir, { recursive: true })
  }

  const dm = new DownloadManager()

  // -------------------------------------------------------------------------
  // Feature 24: AdaptiveQoS Latency Throttling
  // -------------------------------------------------------------------------
  console.log('--- [Feature 24] AdaptiveQoS Latency Throttling ---')
  const limiter = new RateLimiter(0) // Unlimited
  const qos = new AdaptiveQoS(limiter)

  assert(!qos.isThrottled(), 'QoS initialized not throttled')

  // High latency trigger (e.g. 180ms gaming ping)
  qos.evaluateQoS(180)
  assert(qos.isThrottled(), 'QoS auto-throttles when ping > 120ms')
  assert(limiter.getLimitKbps() === 2048, 'Rate limiter clamped to 2048 KB/s (2 MB/s)')
  assert(qos.getLastPing() === 180, 'Last ping recorded as 180ms')

  // Low latency recovery (e.g. 35ms)
  qos.evaluateQoS(35)
  assert(!qos.isThrottled(), 'QoS restores normal state when ping <= 50ms')
  assert(limiter.getLimitKbps() === 0, 'Rate limiter restored to original limit (0 = unlimited)')
  console.log('✅ Feature 24 tests passed successfully.\n')

  // -------------------------------------------------------------------------
  // Feature 25: PostProcessor Automations & Archive Detection
  // -------------------------------------------------------------------------
  console.log('--- [Feature 25] PostProcessor Automations & Archive Detection ---')
  const dummyZip = path.join(testDir, 'sample_package.zip')
  fs.writeFileSync(dummyZip, 'dummy zip content')

  const zipResult = await PostProcessor.processCompletedFile(dummyZip)
  assert(zipResult.isArchive, 'ZIP file detected as archive')
  assert(zipResult.scanPassed, 'File scan passed for existing file')
  assert(zipResult.extractedPath !== undefined, 'Target extractedPath generated for archive')

  const dummyTxt = path.join(testDir, 'readme.txt')
  fs.writeFileSync(dummyTxt, 'plain text content')
  const txtResult = await PostProcessor.processCompletedFile(dummyTxt)
  assert(!txtResult.isArchive, 'TXT file not flagged as archive')

  // Event automation rule execution
  const mockDl: DownloadItem = {
    id: 'dl_event_test',
    url: 'https://example.com/test.zip',
    name: 'test.zip',
    savePath: dummyZip,
    totalSize: 1024,
    downloadedSize: 1024,
    speed: 0,
    eta: 0,
    status: 'completed',
    category: 'compressed',
    priority: 'normal',
    threadCount: 4,
    chunks: [],
    createdAt: Date.now()
  }

  await PostProcessor.handleDownloadEvent('onCompleted', mockDl)
  console.log('✅ Feature 25 tests passed successfully.\n')

  // -------------------------------------------------------------------------
  // Feature 26: MediaWorker Format Extraction
  // -------------------------------------------------------------------------
  console.log('--- [Feature 26] MediaWorker Format Extraction ---')
  const formats = await MediaWorker.extractVideoFormats('https://www.youtube.com/watch?v=dQw4w9WgXcQ')
  assert(Array.isArray(formats), 'Formats returned as array')
  assert(formats.length >= 1, 'At least one media format extracted')
  assert(typeof formats[0].resolution === 'string', 'Format has resolution property')
  assert(typeof formats[0].formatId === 'string', 'Format has formatId property')
  console.log('✅ Feature 26 tests passed successfully.\n')

  // -------------------------------------------------------------------------
  // Feature 27: RemoteServer REST & JSON-RPC Gateway with Auth
  // -------------------------------------------------------------------------
  console.log('--- [Feature 27] RemoteServer REST & JSON-RPC Gateway with Auth ---')
  const testPort = 6890
  const server = new RemoteServer(dm)
  server.start(testPort)

  // Wait 100ms for server to bind
  await new Promise((r) => setTimeout(r, 100))

  const activeSecret = dm.getSettings().rpcSecretToken || 'gbt_secret_rpc'

  // Test 27.1: REST GET /api/downloads
  const restRes = await fetch(`http://127.0.0.1:${testPort}/api/downloads?token=${activeSecret}`)
  const restData = await restRes.json()
  assert(restData.status === 'ok', 'REST /api/downloads returned status ok')
  assert(Array.isArray(restData.downloads), 'REST downloads returned array')

  // Test 27.2: JSON-RPC aria2.getVersion
  const rpcVerRes = await fetch(`http://127.0.0.1:${testPort}/jsonrpc`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      jsonrpc: '2.0',
      id: 'req_1',
      method: 'aria2.getVersion',
      params: [`token:${activeSecret}`]
    })
  })
  const rpcVerData = await rpcVerRes.json()
  assert(rpcVerData.jsonrpc === '2.0', 'JSON-RPC response specifies 2.0')
  assert(rpcVerData.id === 'req_1', 'JSON-RPC response preserves request ID')
  assert(rpcVerData.result?.version !== undefined, 'Aria2 version string present')

  // Test 27.3: JSON-RPC aria2.addUri
  const rpcAddRes = await fetch(`http://127.0.0.1:${testPort}/jsonrpc`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      jsonrpc: '2.0',
      id: 'req_2',
      method: 'aria2.addUri',
      params: [`token:${activeSecret}`, ['https://example.com/rpc_download.iso'], { out: 'rpc_download.iso' }]
    })
  })
  const rpcAddData = await rpcAddRes.json()
  assert(typeof rpcAddData.result === 'string', 'aria2.addUri returned GID')

  // Test 27.4: JSON-RPC aria2.getGlobalStat
  const rpcStatRes = await fetch(`http://127.0.0.1:${testPort}/jsonrpc`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      jsonrpc: '2.0',
      id: 'req_3',
      method: 'aria2.getGlobalStat',
      params: [`token:${activeSecret}`]
    })
  })
  const rpcStatData = await rpcStatRes.json()
  assert(rpcStatData.result?.downloadSpeed !== undefined, 'Global download speed reported')

  server.stop()
  console.log('✅ Feature 27 tests passed successfully.\n')

  // -------------------------------------------------------------------------
  // Feature 28: Native Messaging Host Protocol Encoding/Decoding
  // -------------------------------------------------------------------------
  console.log('--- [Feature 28] Native Messaging Host Protocol ---')
  const testPayload = { action: 'add_download', url: 'https://example.com/movie.mp4', filename: 'movie.mp4' }
  const formattedBuf = formatNativeMessage(testPayload)
  assert(formattedBuf.length >= 4, 'Formatted buffer has 4-byte header')
  const payloadLength = formattedBuf.readUInt32LE(0)
  assert(payloadLength === formattedBuf.length - 4, '32-bit LE length matches JSON byte length')

  const parsed = parseNativeMessage(formattedBuf)
  assert(parsed !== null, 'Buffer successfully parsed')
  assert(parsed?.action === 'add_download', 'Parsed action is add_download')
  assert(parsed?.url === 'https://example.com/movie.mp4', 'Parsed URL matches')
  assert(DEFAULT_EXTENSION_ORIGINS.length >= 1, 'Valid extension origins configured')
  console.log('✅ Feature 28 tests passed successfully.\n')

  // -------------------------------------------------------------------------
  // Feature 29: Companion Browser Extension Integrity
  // -------------------------------------------------------------------------
  console.log('--- [Feature 29] Companion Browser Extension Integrity ---')
  const extDir = path.join(process.cwd(), 'extensions', 'chrome')
  assert(fs.existsSync(path.join(extDir, 'manifest.json')), 'manifest.json exists')
  assert(fs.existsSync(path.join(extDir, 'background.js')), 'background.js exists')
  assert(fs.existsSync(path.join(extDir, 'popup.html')), 'popup.html exists')
  assert(fs.existsSync(path.join(extDir, 'popup.js')), 'popup.js exists')

  const manifestRaw = fs.readFileSync(path.join(extDir, 'manifest.json'), 'utf8')
  const manifestJson = JSON.parse(manifestRaw)
  assert(manifestJson.manifest_version === 3, 'Manifest version is 3 (Manifest V3)')
  assert(manifestJson.permissions.includes('nativeMessaging'), 'nativeMessaging permission present')
  assert(manifestJson.permissions.includes('contextMenus'), 'contextMenus permission present')
  console.log('✅ Feature 29 tests passed successfully.\n')

  // -------------------------------------------------------------------------
  // Feature 30: Extended Settings & Proxy / Category Controls
  // -------------------------------------------------------------------------
  console.log('--- [Feature 30] Extended Settings & Proxy / Category Controls ---')
  dm.updateSettings({
    enableAdaptiveQoS: true,
    enableRpcServer: true,
    rpcPort: 6800,
    rpcSecretToken: 'custom_token_123',
    proxyEnabled: true,
    proxyType: 'socks5',
    proxyHost: '127.0.0.1',
    proxyPort: 1080,
    categorySpeedLimitsKbps: {
      video: 5000,
      compressed: 2000
    }
  })

  const updatedSettings = dm.getSettings()
  assert(updatedSettings.enableAdaptiveQoS === true, 'enableAdaptiveQoS updated')
  assert(updatedSettings.rpcSecretToken === 'custom_token_123', 'rpcSecretToken updated')
  assert(updatedSettings.proxyEnabled === true, 'proxyEnabled updated')
  assert(updatedSettings.proxyType === 'socks5', 'proxyType updated to socks5')
  assert(updatedSettings.categorySpeedLimitsKbps?.video === 5000, 'Video category speed limit saved')
  assert(updatedSettings.categorySpeedLimitsKbps?.compressed === 2000, 'Compressed category speed limit saved')
  console.log('✅ Feature 30 tests passed successfully.\n')

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
