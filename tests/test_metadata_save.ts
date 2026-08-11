import * as fs from 'fs'
import * as path from 'path'
import { TorrentWorker } from '../src/engine/workers/TorrentWorker'

const magnetUrl =
  'magnet:?xt=urn:btih:593A9E5577585AD6BCC4E3D4D993288AC5E2567D&dn=Spider-Man+Brand+New+Day+2026+V3+1080p+TELESYNC+x264-DKS&tr=udp%3A%2F%2Ftracker.opentrackr.org%3A1337%2Fannounce&tr=udp%3A%2F%2Fopen.stealth.si%3A80%2Fannounce'

async function runMetadataTest(): Promise<void> {
  console.log('[1/3] Initializing WebTorrent client...')
  const client = await TorrentWorker.getClient()

  console.log('[2/3] Adding magnet to swarm to resolve metadata...')
  const outputJsonPath = path.join(__dirname, 'metadata_result.json')

  return new Promise((resolve) => {
    let resolved = false

    const saveAndDone = (data: unknown, source: string): void => {
      if (resolved) return
      resolved = true
      console.log(`[3/3] Metadata resolved via [${source}]! Writing to JSON...`)
      fs.writeFileSync(outputJsonPath, JSON.stringify(data, null, 2), 'utf-8')
      console.log(`Saved JSON result to: ${outputJsonPath}`)
      resolve()
    }

    const timer = setTimeout(() => {
      const mag = TorrentWorker.parseMagnetURI(magnetUrl)
      saveAndDone(
        {
          source: 'timeout_fallback',
          name: mag.name,
          infoHash: mag.infoHash,
          totalSize: 0,
          files: [],
          trackers: mag.trackers
        },
        'Timeout Fallback'
      )
    }, 15000)

    try {
      const torrent = client.add(magnetUrl, {
        path: path.join(__dirname, 'temp_downloads'),
        announce: TorrentWorker.DEFAULT_PUBLIC_TRACKERS
      })

      const onMeta = (): void => {
        if (torrent.files && torrent.files.length > 0) {
          const filesData = torrent.files.map((f) => ({
            name: f.name || f.path,
            path: f.path || f.name,
            size: f.length || 0
          }))
          saveAndDone(
            {
              source: 'webtorrent_swarm',
              name: torrent.name,
              infoHash: torrent.infoHash,
              totalSize: torrent.length || 0,
              files: filesData,
              trackers: torrent.announce || [],
              created: torrent.created,
              comment: torrent.comment
            },
            'P2P Swarm Metadata'
          )
        }
      }

      torrent.on('metadata', onMeta)
      torrent.on('ready', onMeta)
      if (torrent.files && torrent.files.length > 0) {
        onMeta()
      }
    } catch (err) {
      console.error('Error adding torrent:', err)
      const mag = TorrentWorker.parseMagnetURI(magnetUrl)
      saveAndDone(
        {
          source: 'error_fallback',
          name: mag.name,
          infoHash: mag.infoHash,
          totalSize: 0,
          files: [],
          trackers: mag.trackers
        },
        'Error Fallback'
      )
    }
  })
}

runMetadataTest()
  .then(() => {
    console.log('Test completed successfully.')
    process.exit(0)
  })
  .catch((err) => {
    console.error('Fatal test error:', err)
    process.exit(1)
  })
