import * as http from 'http'
import { DownloadManager } from '../engine/DownloadManager'
import packageJson from '../../package.json'
import { DownloadItem } from '../engine/types'

export class RemoteServer {
  private server: http.Server | null = null
  private port: number = 6800

  constructor(private downloadManager: DownloadManager) {}

  private isAuthorized(req: http.IncomingMessage, bodyParamsSecret?: string): boolean {
    const settings = this.downloadManager.getSettings()
    const expectedSecret = settings.rpcSecretToken
    if (!expectedSecret) return true // No secret required if unconfigured

    // Check Authorization header: Bearer <token>
    const authHeader = req.headers['authorization']
    if (authHeader) {
      const parts = authHeader.split(' ')
      if (parts.length === 2 && parts[0] === 'Bearer' && parts[1] === expectedSecret) {
        return true
      }
      if (parts[0] === expectedSecret) return true
    }

    // Check URL query param: ?token=<secret>
    if (req.url) {
      const urlObj = new URL(req.url, `http://localhost:${this.port}`)
      if (urlObj.searchParams.get('token') === expectedSecret) {
        return true
      }
    }

    // Check JSON-RPC token parameter: "token:<secret>"
    if (bodyParamsSecret && (bodyParamsSecret === expectedSecret || bodyParamsSecret === `token:${expectedSecret}`)) {
      return true
    }

    return false
  }

  private mapDownloadToAria2(d: DownloadItem) {
    let status: string = 'active'
    if (d.status === 'paused') status = 'paused'
    else if (d.status === 'completed') status = 'complete'
    else if (d.status === 'error') status = 'error'
    else if (d.status === 'queued') status = 'waiting'

    return {
      gid: d.id,
      status,
      totalLength: String(d.totalSize || 0),
      completedLength: String(d.downloadedSize || 0),
      downloadSpeed: String(d.speed || 0),
      uploadSpeed: String(d.upSpeed || 0),
      infoHash: d.infoHash || '',
      numSeeders: String(d.seedsCount || 0),
      connections: String(d.peersCount || 0),
      dir: d.savePath,
      files: [
        {
          index: '1',
          path: d.savePath,
          length: String(d.totalSize || 0),
          completedLength: String(d.downloadedSize || 0),
          selected: 'true',
          uris: [{ uri: d.url, status: 'used' }]
        }
      ]
    }
  }

  private handleJsonRpc(body: string, req: http.IncomingMessage, res: http.ServerResponse): void {
    let payload: Record<string, unknown>
    try {
      payload = JSON.parse(body)
    } catch {
      res.writeHead(400, { 'Content-Type': 'application/json' })
      res.end(JSON.stringify({ jsonrpc: '2.0', id: null, error: { code: -32700, message: 'Parse error' } }))
      return
    }

    const id = payload.id ?? null
    const method = String(payload.method || '')
    const rawParams = Array.isArray(payload.params) ? payload.params : []

    // Extract secret if present in first parameter (aria2 convention: token:SECRET)
    let secretParam: string | undefined
    let params = [...rawParams]
    if (typeof params[0] === 'string' && params[0].startsWith('token:')) {
      secretParam = params[0]
      params = params.slice(1)
    }

    if (!this.isAuthorized(req, secretParam)) {
      res.writeHead(401, { 'Content-Type': 'application/json' })
      res.end(
        JSON.stringify({
          jsonrpc: '2.0',
          id,
          error: { code: 401, message: 'Unauthorized: Invalid or missing RPC secret token' }
        })
      )
      return
    }

    const sendResult = (result: unknown) => {
      res.writeHead(200, { 'Content-Type': 'application/json' })
      res.end(JSON.stringify({ jsonrpc: '2.0', id, result }))
    }

    const sendError = (code: number, message: string) => {
      res.writeHead(200, { 'Content-Type': 'application/json' })
      res.end(JSON.stringify({ jsonrpc: '2.0', id, error: { code, message } }))
    }

    switch (method) {
      case 'aria2.addUri': {
        const uris = params[0]
        const options = params[1] as Record<string, unknown> | undefined
        const targetUrl = Array.isArray(uris) ? uris[0] : typeof uris === 'string' ? uris : null
        if (!targetUrl) {
          sendError(-32602, 'Invalid params: Missing URL')
          return
        }
        this.downloadManager
          .addDownload(targetUrl, {
            filename: typeof options?.out === 'string' ? options.out : undefined,
            savePath: typeof options?.dir === 'string' ? options.dir : undefined
          })
          .then((item) => sendResult(item.id))
          .catch((err) => sendError(-32000, err.message))
        break
      }

      case 'aria2.tellActive': {
        const active = this.downloadManager.getDownloads().filter((d) => d.status === 'downloading' || d.status === 'seeding')
        sendResult(active.map((d) => this.mapDownloadToAria2(d)))
        break
      }

      case 'aria2.tellWaiting': {
        const waiting = this.downloadManager.getDownloads().filter((d) => d.status === 'queued')
        sendResult(waiting.map((d) => this.mapDownloadToAria2(d)))
        break
      }

      case 'aria2.tellStopped': {
        const stopped = this.downloadManager.getDownloads().filter((d) => d.status === 'completed' || d.status === 'error' || d.status === 'paused')
        sendResult(stopped.map((d) => this.mapDownloadToAria2(d)))
        break
      }

      case 'aria2.tellStatus': {
        const targetGid = String(params[0] || '')
        const item = this.downloadManager.getDownloads().find((d) => d.id === targetGid)
        if (!item) {
          sendError(-32000, `Download with GID ${targetGid} not found`)
          return
        }
        sendResult(this.mapDownloadToAria2(item))
        break
      }

      case 'aria2.pause': {
        const targetGid = String(params[0] || '')
        this.downloadManager.pauseDownload(targetGid)
        sendResult(targetGid)
        break
      }

      case 'aria2.unpause': {
        const targetGid = String(params[0] || '')
        this.downloadManager.resumeDownload(targetGid)
        sendResult(targetGid)
        break
      }

      case 'aria2.remove': {
        const targetGid = String(params[0] || '')
        this.downloadManager.cancelDownload(targetGid)
        sendResult(targetGid)
        break
      }

      case 'aria2.getGlobalStat': {
        const downloads = this.downloadManager.getDownloads()
        const totalDlSpeed = downloads.reduce((acc, d) => acc + (d.speed || 0), 0)
        const totalUpSpeed = downloads.reduce((acc, d) => acc + (d.upSpeed || 0), 0)
        sendResult({
          downloadSpeed: String(totalDlSpeed),
          uploadSpeed: String(totalUpSpeed),
          numActive: String(downloads.filter((d) => d.status === 'downloading').length),
          numWaiting: String(downloads.filter((d) => d.status === 'queued').length),
          numStopped: String(downloads.filter((d) => d.status === 'completed' || d.status === 'error' || d.status === 'paused').length)
        })
        break
      }

      case 'aria2.getVersion': {
        sendResult({
          version: '1.36.0-grabbit',
          enabledFeatures: ['BitTorrent', 'HTTPS', 'JSON-RPC', 'AdaptiveQoS', 'AsyncIO']
        })
        break
      }

      default:
        sendError(-32601, `Method '${method}' not found`)
        break
    }
  }

  public start(port: number = 6800): void {
    this.port = port
    this.server = http.createServer((req, res) => {
      // Standard CORS Headers for Remote Web Dashboards & Extensions
      res.setHeader('Access-Control-Allow-Origin', '*')
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With')

      if (req.method === 'OPTIONS') {
        res.writeHead(204)
        res.end()
        return
      }

      const parsedUrl = new URL(req.url || '/', `http://localhost:${this.port}`)
      const pathname = parsedUrl.pathname

      // JSON-RPC 2.0 endpoint (Aria2 compatible)
      if (pathname === '/jsonrpc' || pathname === '/rpc') {
        if (req.method === 'POST') {
          let body = ''
          req.on('data', (chunk) => (body += chunk))
          req.on('end', () => this.handleJsonRpc(body, req, res))
          return
        }
      }

      // REST API: GET /api/downloads
      if (pathname === '/api/downloads' && req.method === 'GET') {
        if (!this.isAuthorized(req)) {
          res.writeHead(401, { 'Content-Type': 'application/json' })
          res.end(JSON.stringify({ error: 'Unauthorized' }))
          return
        }
        const downloads = this.downloadManager.getDownloads()
        res.writeHead(200, { 'Content-Type': 'application/json' })
        res.end(JSON.stringify({ status: 'ok', count: downloads.length, downloads }))
        return
      }

      // REST API: POST /api/downloads (Add new download)
      if (pathname === '/api/downloads' && req.method === 'POST') {
        if (!this.isAuthorized(req)) {
          res.writeHead(401, { 'Content-Type': 'application/json' })
          res.end(JSON.stringify({ error: 'Unauthorized' }))
          return
        }
        let body = ''
        req.on('data', (chunk) => (body += chunk))
        req.on('end', async () => {
          try {
            const data = JSON.parse(body)
            if (data.url) {
              const item = await this.downloadManager.addDownload(data.url, {
                filename: data.filename,
                savePath: data.savePath,
                category: data.category,
                tags: data.tags
              })
              res.writeHead(200, { 'Content-Type': 'application/json' })
              res.end(JSON.stringify({ status: 'ok', item }))
              return
            }
          } catch {}
          res.writeHead(400, { 'Content-Type': 'application/json' })
          res.end(JSON.stringify({ error: 'Invalid download payload' }))
        })
        return
      }

      // REST API: POST /api/downloads/pause
      if (pathname === '/api/downloads/pause' && req.method === 'POST') {
        if (!this.isAuthorized(req)) {
          res.writeHead(401, { 'Content-Type': 'application/json' })
          res.end(JSON.stringify({ error: 'Unauthorized' }))
          return
        }
        let body = ''
        req.on('data', (chunk) => (body += chunk))
        req.on('end', () => {
          try {
            const data = JSON.parse(body)
            if (data.id) {
              this.downloadManager.pauseDownload(data.id)
              res.writeHead(200, { 'Content-Type': 'application/json' })
              res.end(JSON.stringify({ status: 'ok', id: data.id }))
              return
            }
          } catch {}
          res.writeHead(400, { 'Content-Type': 'application/json' })
          res.end(JSON.stringify({ error: 'Invalid request: Missing download ID' }))
        })
        return
      }

      // REST API: POST /api/downloads/resume
      if (pathname === '/api/downloads/resume' && req.method === 'POST') {
        if (!this.isAuthorized(req)) {
          res.writeHead(401, { 'Content-Type': 'application/json' })
          res.end(JSON.stringify({ error: 'Unauthorized' }))
          return
        }
        let body = ''
        req.on('data', (chunk) => (body += chunk))
        req.on('end', () => {
          try {
            const data = JSON.parse(body)
            if (data.id) {
              this.downloadManager.resumeDownload(data.id)
              res.writeHead(200, { 'Content-Type': 'application/json' })
              res.end(JSON.stringify({ status: 'ok', id: data.id }))
              return
            }
          } catch {}
          res.writeHead(400, { 'Content-Type': 'application/json' })
          res.end(JSON.stringify({ error: 'Invalid request: Missing download ID' }))
        })
        return
      }

      // REST API: POST /api/downloads/cancel
      if (pathname === '/api/downloads/cancel' && req.method === 'POST') {
        if (!this.isAuthorized(req)) {
          res.writeHead(401, { 'Content-Type': 'application/json' })
          res.end(JSON.stringify({ error: 'Unauthorized' }))
          return
        }
        let body = ''
        req.on('data', (chunk) => (body += chunk))
        req.on('end', () => {
          try {
            const data = JSON.parse(body)
            if (data.id) {
              this.downloadManager.cancelDownload(data.id)
              res.writeHead(200, { 'Content-Type': 'application/json' })
              res.end(JSON.stringify({ status: 'ok', id: data.id }))
              return
            }
          } catch {}
          res.writeHead(400, { 'Content-Type': 'application/json' })
          res.end(JSON.stringify({ error: 'Invalid request: Missing download ID' }))
        })
        return
      }

      // REST API: GET /api/stats
      if (pathname === '/api/stats' && req.method === 'GET') {
        if (!this.isAuthorized(req)) {
          res.writeHead(401, { 'Content-Type': 'application/json' })
          res.end(JSON.stringify({ error: 'Unauthorized' }))
          return
        }
        const downloads = this.downloadManager.getDownloads()
        const totalDlSpeed = downloads.reduce((acc, d) => acc + (d.speed || 0), 0)
        const totalUpSpeed = downloads.reduce((acc, d) => acc + (d.upSpeed || 0), 0)
        const queueStats = this.downloadManager.getQueueStats()
        res.writeHead(200, { 'Content-Type': 'application/json' })
        res.end(
          JSON.stringify({
            status: 'ok',
            downloadSpeed: totalDlSpeed,
            uploadSpeed: totalUpSpeed,
            queue: queueStats,
            qosThrottled: this.downloadManager.getAdaptiveQoS().isThrottled(),
            pingMs: this.downloadManager.getAdaptiveQoS().getLastPing()
          })
        )
        return
      }

      // REST API: GET /api/settings
      if (pathname === '/api/settings' && req.method === 'GET') {
        if (!this.isAuthorized(req)) {
          res.writeHead(401, { 'Content-Type': 'application/json' })
          res.end(JSON.stringify({ error: 'Unauthorized' }))
          return
        }
        res.writeHead(200, { 'Content-Type': 'application/json' })
        res.end(JSON.stringify({ status: 'ok', settings: this.downloadManager.getSettings() }))
        return
      }

      // REST API: POST /api/settings
      if (pathname === '/api/settings' && req.method === 'POST') {
        if (!this.isAuthorized(req)) {
          res.writeHead(401, { 'Content-Type': 'application/json' })
          res.end(JSON.stringify({ error: 'Unauthorized' }))
          return
        }
        let body = ''
        req.on('data', (chunk) => (body += chunk))
        req.on('end', () => {
          try {
            const data = JSON.parse(body)
            this.downloadManager.updateSettings(data)
            res.writeHead(200, { 'Content-Type': 'application/json' })
            res.end(JSON.stringify({ status: 'ok', settings: this.downloadManager.getSettings() }))
            return
          } catch {}
          res.writeHead(400, { 'Content-Type': 'application/json' })
          res.end(JSON.stringify({ error: 'Invalid settings payload' }))
        })
        return
      }

      res.writeHead(200, { 'Content-Type': 'text/plain' })
      res.end(`Grabbit Download Manager Remote Server & JSON-RPC Gateway v${packageJson.version || '0.0.0'}`)
    })

    this.server.listen(this.port, '127.0.0.1', () => {
      console.log(`Grabbit Remote Control & JSON-RPC Gateway running at http://127.0.0.1:${this.port}/`)
    })
  }

  public stop(): void {
    if (this.server) {
      this.server.close()
      this.server = null
    }
  }
}
