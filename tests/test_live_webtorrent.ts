import WebTorrent from 'webtorrent'

const magnetUrl =
  'magnet:?xt=urn:btih:9063AA5D9D4F292A1F22593F131D32680A646760&dn=Ted.Lasso.S04E01.1080p.x265-ELiTE&tr=udp%3A%2F%2Fopen.stealth.si%3A80%2Fannounce&tr=udp%3A%2F%2Fevan.im%3A6969%2Fannounce&tr=udp%3A%2F%2Ftracker.qu.ax%3A6969%2Fannounce&tr=udp%3A%2F%2Ftracker.torrent.eu.org%3A451%2Fannounce&tr=udp%3A%2F%2Ftracker.opentrackr.org%3A1337%2Fannounce'

console.log('Initializing WebTorrent client...')

const client = new WebTorrent({
  dht: true,
  pex: true,
  lsd: true,
  tracker: {
    rtcConfig: false
  }
})

console.log('Adding magnet link...')

const torrent = client.add(magnetUrl, {
  path: './scratch/temp_download'
})

torrent.on('infoHash', () => {
  console.log('InfoHash resolved:', torrent.infoHash)
})

torrent.on('metadata', () => {
  console.log('Metadata received! Torrent name:', torrent.name)
  console.log('Files count:', torrent.files.length)
})

torrent.on('wire', (wire) => {
  console.log('Wire connected! Remote addr:', wire.remoteAddress, 'Type:', wire.type)
  wire.on('error', (err) => console.log('Wire error:', err.message))
})

const interval = setInterval(() => {
  console.log(
    `[Progress] Downloaded: ${(torrent.downloaded / 1024 / 1024).toFixed(2)} MB / ${(torrent.length / 1024 / 1024).toFixed(2)} MB | Speed: ${(torrent.downloadSpeed / 1024).toFixed(1)} KB/s | Peers: ${torrent.numPeers} | Wires: ${torrent.wires.length}`
  )
}, 1000)

setTimeout(() => {
  clearInterval(interval)
  client.destroy()
  console.log('Test completed.')
  process.exit(0)
}, 15000)
