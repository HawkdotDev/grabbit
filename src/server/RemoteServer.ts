import * as http from 'http'
import { DownloadManager } from '../engine/DownloadManager'

export class RemoteServer {
  private server: http.Server | null = null
  private port: number = 6800

  constructor(private downloadManager: DownloadManager) {}

  public start(port: number = 6800): void {
    this.port = port
    this.server = http.createServer((req, res) => {
      // CORS Headers for Remote Control Web UI
      res.setHeader('Access-Control-Allow-Origin', '*')
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')

      if (req.method === 'OPTIONS') {
        res.writeHead(204)
        res.end()
        return
      }

      if (req.url === '/jsonrpc' || req.url === '/api/downloads') {
        if (req.method === 'GET') {
          const downloads = this.downloadManager.getDownloads()
          res.writeHead(200, { 'Content-Type': 'application/json' })
          res.end(JSON.stringify({ status: 'ok', downloads }))
          return
        }

        if (req.method === 'POST') {
          let body = ''
          req.on('data', (chunk) => (body += chunk))
          req.on('end', async () => {
            try {
              const data = JSON.parse(body)
              if (data.action === 'add' && data.url) {
                const item = await this.downloadManager.addDownload(data.url, {
                  filename: data.filename
                })
                res.writeHead(200, { 'Content-Type': 'application/json' })
                res.end(JSON.stringify({ status: 'ok', item }))
                return
              }
            } catch {
              // Ignore invalid JSON
            }
            res.writeHead(400, { 'Content-Type': 'application/json' })
            res.end(JSON.stringify({ error: 'Invalid JSON-RPC payload' }))
          })
          return
        }
      }

      res.writeHead(200, { 'Content-Type': 'text/plain' })
      res.end('Grabbit Download Manager Remote Server Gateway v0.0.2')
    })

    this.server.listen(this.port, '127.0.0.1', () => {
      console.log(`Grabbit Remote Control Gateway running at http://127.0.0.1:${this.port}/`)
    })
  }

  public stop(): void {
    if (this.server) {
      this.server.close()
      this.server = null
    }
  }
}
