import { TorrentWorker } from '../src/engine/workers/TorrentWorker'

async function testPeerId() {
  const peerId = TorrentWorker.generatePeerId()
  console.log(`Generated peerId: "${peerId}" (Length: ${peerId.length})`)
  console.log(`Buffer length: ${Buffer.from(peerId).length}`)

  const client = await TorrentWorker.getClient()
  console.log('Client peerId:', (client as any).peerId)
  console.log('Client peerId length:', (client as any).peerId ? (client as any).peerId.length : 0)

  process.exit(0)
}

testPeerId().catch(console.error)
