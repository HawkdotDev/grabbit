import * as fs from 'fs'
import * as path from 'path'
import { getParseTorrentFn } from '../src/engine/workers/TorrentWorker'

const testInfoHash = '593A9E5577585AD6BCC4E3D4D993288AC5E2567D'.toLowerCase() // Spider-Man magnet!

async function testCacheEndpoints(): Promise<void> {
  const endpoints = [
    `https://itorrents.org/torrent/${testInfoHash}.torrent`,
    `https://torrage.info/torrent.php?h=${testInfoHash}`,
    `https://btcache.me/torrent/${testInfoHash.toUpperCase()}`,
    `https://api.bittorrent.ws/meta/${testInfoHash}`
  ]

  console.log(`Testing torrent cache resolution for infoHash: ${testInfoHash}...`)
  const parseTorrent = await getParseTorrentFn()

  for (const url of endpoints) {
    try {
      console.log(`Fetching from: ${url}...`)
      const resp = await fetch(url, {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        }
      })

      if (resp.ok) {
        const arrayBuf = await resp.arrayBuffer()
        const buf = Buffer.from(arrayBuf)
        console.log(`Received buffer of size ${buf.length} bytes from ${url}`)

        try {
          const parsed = await parseTorrent(buf)
          if (parsed && (parsed.files?.length || parsed.length)) {
            const files = (parsed.files || []).map((f) => ({
              name: f.name || f.path || 'file',
              path: f.path || f.name || 'file',
              size: f.length || 0
            }))
            const totalSize = parsed.length || files.reduce((a, b) => a + b.size, 0)
            const result = {
              source: url,
              name: parsed.name || 'Torrent',
              infoHash: parsed.infoHash || testInfoHash,
              totalSize,
              files,
              trackers: parsed.announce
                ? Array.isArray(parsed.announce)
                  ? parsed.announce
                  : [parsed.announce]
                : [],
              created: parsed.created
                ? new Date(parsed.created).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                  })
                : undefined
            }

            const jsonPath = path.join(__dirname, 'metadata_result.json')
            fs.writeFileSync(jsonPath, JSON.stringify(result, null, 2), 'utf-8')
            console.log(`SUCCESS! Saved complete metadata JSON to: ${jsonPath}`)
            console.log('Result:', JSON.stringify(result, null, 2))
            return
          }
        } catch (pErr) {
          console.log(`Failed to parse torrent buffer from ${url}:`, pErr)
        }
      } else {
        console.log(`HTTP ${resp.status} from ${url}`)
      }
    } catch (err) {
      console.log(`Failed to fetch from ${url}:`, (err as Error).message)
    }
  }

  console.log('Cache test ended.')
}

testCacheEndpoints().catch(console.error)
