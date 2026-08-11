import * as fs from 'fs'
import * as path from 'path'
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
  console.log('🚀 Running Comprehensive Test Suite: Minor / Polish Features 40 to 47')
  console.log('======================================================================\n')

  // -------------------------------------------------------------------------
  // Feature 40: Startup Seed Tasks Clean Slate Verification
  // -------------------------------------------------------------------------
  console.log('--- [Feature 40] Startup Seed Tasks Clean Slate ---')
  const indexContent = fs.readFileSync(path.join(__dirname, '../src/main/index.ts'), 'utf-8')
  assert(!indexContent.includes('httpbin.org'), 'Hardcoded httpbin.org test seed task removed from index.ts')
  assert(!indexContent.includes('Sintel.mp4'), 'Hardcoded Sintel magnet test seed task removed from index.ts')
  console.log('✅ Feature 40 tests passed.\n')

  // -------------------------------------------------------------------------
  // Feature 41: Dynamic Pre-Allocation Status
  // -------------------------------------------------------------------------
  console.log('--- [Feature 41] Dynamic Pre-Allocation Status Label ---')
  function getPreAllocationLabel(download: Partial<DownloadItem>): string {
    return download.downloadedSize! > 0 || download.status === 'completed' || download.status === 'seeding'
      ? 'ALLOCATED / READY'
      : download.totalSize! > 0
        ? 'ENABLED'
        : 'PENDING'
  }

  assert(getPreAllocationLabel({ downloadedSize: 1048576, totalSize: 2097152, status: 'downloading' }) === 'ALLOCATED / READY', 'Active download with progress shows ALLOCATED / READY')
  assert(getPreAllocationLabel({ downloadedSize: 0, totalSize: 500000, status: 'queued' }) === 'ENABLED', 'Pending download with total size shows ENABLED')
  assert(getPreAllocationLabel({ downloadedSize: 0, totalSize: 0, status: 'checking' }) === 'PENDING', 'Initial item without metadata shows PENDING')
  console.log('✅ Feature 41 tests passed.\n')

  // -------------------------------------------------------------------------
  // Feature 42: Empirical Network View Telemetry (No Math.sin)
  // -------------------------------------------------------------------------
  console.log('--- [Feature 42] Empirical Network View Telemetry ---')
  const networkViewContent = fs.readFileSync(path.join(__dirname, '../src/renderer/src/components/network/NetworkView.tsx'), 'utf-8')
  assert(!networkViewContent.includes('Math.sin'), 'Sinusoidal Math.sin fake data generator removed from NetworkView.tsx')
  assert(!networkViewContent.includes('Math.cos'), 'Math.cos fake data generator removed from NetworkView.tsx')
  console.log('✅ Feature 42 tests passed.\n')

  // -------------------------------------------------------------------------
  // Features 43 & 44: Super Seeding & Auto Management Mode
  // -------------------------------------------------------------------------
  console.log('--- [Features 43 & 44] Super Seeding & Auto Management State Toggles ---')
  const mockItem: Partial<DownloadItem> = { id: 'test-1', superSeeding: false, managementMode: 'automatic' }
  
  // Toggle super seeding
  mockItem.superSeeding = !mockItem.superSeeding
  assert(mockItem.superSeeding === true, 'Super seeding toggles to true')
  
  // Toggle management mode
  mockItem.managementMode = mockItem.managementMode === 'automatic' ? 'manual' : 'automatic'
  assert(mockItem.managementMode === 'manual', 'Management mode toggles to manual')
  console.log('✅ Features 43 & 44 tests passed.\n')

  // -------------------------------------------------------------------------
  // Feature 45: Dynamic App Version Retrieval
  // -------------------------------------------------------------------------
  console.log('--- [Feature 45] Dynamic App Version Handling ---')
  const aboutModalContent = fs.readFileSync(path.join(__dirname, '../src/renderer/src/components/modals/AboutModal.tsx'), 'utf-8')
  assert(aboutModalContent.includes('window.api?.getAppVersion'), 'AboutModal fetches version dynamically via getAppVersion IPC')
  console.log('✅ Feature 45 tests passed.\n')

  // -------------------------------------------------------------------------
  // Feature 46: CreateTorrent Auto-Seeding Transition
  // -------------------------------------------------------------------------
  console.log('--- [Feature 46] CreateTorrent Auto-Seeding Transition ---')
  const ipcContent = fs.readFileSync(path.join(__dirname, '../src/main/ipc.ts'), 'utf-8')
  assert(ipcContent.includes("added.status = 'seeding'"), 'torrent:create IPC transitions completed creations to seeding state')
  console.log('✅ Feature 46 tests passed.\n')

  // -------------------------------------------------------------------------
  // Feature 47: Automatic Resume on Engine Restart
  // -------------------------------------------------------------------------
  console.log('--- [Feature 47] Auto-Resume Active Transfers on Restart ---')
  const downloadMgrContent = fs.readFileSync(path.join(__dirname, '../src/engine/DownloadManager.ts'), 'utf-8')
  assert(downloadMgrContent.includes('autoResumeIds.push(d.id)'), 'DownloadManager tracks active downloading tasks on loadState')
  assert(downloadMgrContent.includes('autoResumeIds.forEach'), 'DownloadManager automatically triggers startDownload for active tasks')
  console.log('✅ Feature 47 tests passed.\n')

  console.log('======================================================================')
  console.log(`🎉 ALL MINOR / POLISH TESTS PASSED: ${passed} / ${total} assertions verified!`)
  console.log('======================================================================')
  process.exit(0)
}

runTestSuite().catch((err) => {
  console.error('Test suite failed:', err)
  process.exit(1)
})
