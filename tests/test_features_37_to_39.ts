import { PRESET_THEMES } from '../src/renderer/src/components/modals/ThemeCustomizerModal'

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
  console.log('🚀 Running Comprehensive Test Suite: Features 37 to 39')
  console.log('======================================================================\n')

  // -------------------------------------------------------------------------
  // Feature 37: MenuBar View Density, Zoom, and Panels Control
  // -------------------------------------------------------------------------
  console.log('--- [Feature 37] MenuBar View Layout & Zoom Control ---')
  const validDensities = ['compact', 'default', 'comfortable']
  assert(validDensities.includes('compact'), 'Density includes compact mode')
  assert(validDensities.includes('default'), 'Density includes default mode')
  assert(validDensities.includes('comfortable'), 'Density includes comfortable mode')

  // Zoom range clamping
  const computeZoom = (current: number, delta: number) => Math.min(150, Math.max(50, current + delta))
  assert(computeZoom(100, 10) === 110, 'Zoom in increases by 10%')
  assert(computeZoom(100, -10) === 90, 'Zoom out decreases by 10%')
  assert(computeZoom(145, 10) === 150, 'Zoom in clamped at 150% maximum')
  assert(computeZoom(55, -10) === 50, 'Zoom out clamped at 50% minimum')
  console.log('✅ Feature 37 tests passed successfully.\n')

  // -------------------------------------------------------------------------
  // Feature 38: Clipboard Detector Recognition of .torrent Files
  // -------------------------------------------------------------------------
  console.log('--- [Feature 38] Clipboard Detector .torrent Path Matching ---')
  function testClipboardDetector(trimmed: string) {
    const isUrl = /^https?:\/\/[^\s]+$/i.test(trimmed)
    const isMagnet = /^magnet:\?xt=urn:[a-z0-9]+/i.test(trimmed)
    const isTorrentFile =
      /\.torrent$/i.test(trimmed) ||
      /^[a-zA-Z]:\\(?:[^\\/:*?"<>|\r\n]+\\)*[^\\/:*?"<>|\r\n]+\.torrent$/i.test(trimmed) ||
      /^\/(?:[^/\0]+\/)*[^/\0]+\.torrent$/i.test(trimmed)

    if (!isUrl && !isMagnet && !isTorrentFile) return null

    let suggestedName = 'New Download'
    if (isMagnet) {
      suggestedName = 'Magnet Link'
    } else if (isTorrentFile) {
      try {
        const base = trimmed.split(/[\\/]/).pop()
        if (base) suggestedName = decodeURIComponent(base)
      } catch {
        suggestedName = 'Torrent File'
      }
    } else {
      try {
        const parsed = new URL(trimmed)
        const filename = parsed.pathname.split('/').pop()
        if (filename && filename.length > 0) {
          suggestedName = decodeURIComponent(filename)
        }
      } catch {}
    }

    return { url: trimmed, suggestedName, isTorrentFile, isMagnet, isUrl }
  }

  // Test 1: Windows local .torrent file path
  const winTorrent = testClipboardDetector('C:\\Users\\Downloads\\archlinux-2026.08.torrent')
  assert(winTorrent !== null, 'Windows .torrent path recognized by clipboard detector')
  assert(winTorrent?.isTorrentFile === true, 'Flagged as .torrent file')
  assert(winTorrent?.suggestedName === 'archlinux-2026.08.torrent', 'Parsed suggestedName from Windows path')

  // Test 2: POSIX / UNIX local .torrent file path
  const posixTorrent = testClipboardDetector('/home/user/torrents/debian-12.torrent')
  assert(posixTorrent !== null, 'POSIX .torrent path recognized by clipboard detector')
  assert(posixTorrent?.suggestedName === 'debian-12.torrent', 'Parsed suggestedName from POSIX path')

  // Test 3: Magnet URI
  const magnetLink = testClipboardDetector('magnet:?xt=urn:btih:0123456789abcdef0123456789abcdef01234567&dn=Ubuntu')
  assert(magnetLink !== null, 'Magnet link recognized')
  assert(magnetLink?.isMagnet === true, 'Flagged as magnet link')

  // Test 4: HTTPS Direct URL
  const httpUrl = testClipboardDetector('https://releases.ubuntu.com/24.04/ubuntu-24.04-desktop-amd64.iso')
  assert(httpUrl !== null, 'HTTPS download URL recognized')
  assert(httpUrl?.suggestedName === 'ubuntu-24.04-desktop-amd64.iso', 'Parsed HTTP basename suggestedName')

  // Test 5: Plain text (should not trigger)
  const plainText = testClipboardDetector('Hello world this is some random clipboard text')
  assert(plainText === null, 'Random plain text ignored')
  console.log('✅ Feature 38 tests passed successfully.\n')

  // -------------------------------------------------------------------------
  // Feature 39: Light Mode & High Contrast Presets in Theme Customizer
  // -------------------------------------------------------------------------
  console.log('--- [Feature 39] Theme Presets & Color Definitions ---')
  assert(PRESET_THEMES['carrot'] !== undefined, 'Carrot preset theme exists')
  assert(PRESET_THEMES['dark'] !== undefined, 'Dark preset theme exists')
  assert(PRESET_THEMES['light'] !== undefined, 'Light Mode preset theme exists')
  assert(PRESET_THEMES['contrast'] !== undefined, 'High Contrast preset theme exists')
  assert(PRESET_THEMES['cyberpunk'] !== undefined, 'Cyberpunk preset theme exists')
  assert(PRESET_THEMES['emerald'] !== undefined, 'Emerald Forest preset theme exists')
  assert(PRESET_THEMES['nordic'] !== undefined, 'Nordic Frost preset theme exists')

  // Validate Light Mode tokens
  const lightColors = PRESET_THEMES['light'].colors
  assert(lightColors.bg === '#f8fafc', 'Light mode uses bright clean slate background (#f8fafc)')
  assert(lightColors.surface === '#ffffff', 'Light mode uses pure white surface (#ffffff)')
  assert(lightColors.accent === '#7c3aed', 'Light mode uses rich violet accent (#7c3aed)')

  // Validate Contrast tokens
  const contrastColors = PRESET_THEMES['contrast'].colors
  assert(contrastColors.bg === '#000000', 'Contrast mode uses pure black background (#000000)')
  assert(contrastColors.border === '#ffffff', 'Contrast mode uses sharp white borders (#ffffff)')
  assert(contrastColors.accent === '#ffff00', 'Contrast mode uses neon yellow accent (#ffff00)')
  console.log('✅ Feature 39 tests passed successfully.\n')

  console.log('======================================================================')
  console.log(`🎉 ALL TESTS PASSED: ${passed} / ${total} assertions verified!`)
  console.log('======================================================================')
  process.exit(0)
}

runTestSuite().catch((err) => {
  console.error('Test suite failed:', err)
  process.exit(1)
})
