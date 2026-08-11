import * as https from 'https'
import { URL } from 'url'

export interface DoHRecord {
  name: string
  type: number
  TTL: number
  data: string
}

export interface DoHResponse {
  Status: number
  TC: boolean
  RD: boolean
  RA: boolean
  AD: boolean
  CD: boolean
  Question: Array<{ name: string; type: number }>
  Answer?: DoHRecord[]
}

export class DoHResolver {
  private static cache: Map<string, { ip: string; expiresAt: number }> = new Map()

  public static getEndpointUrl(
    provider: 'cloudflare' | 'quad9' | 'google' | 'custom',
    customUrl?: string
  ): string {
    switch (provider) {
      case 'cloudflare':
        return 'https://1.1.1.1/dns-query'
      case 'quad9':
        return 'https://dns.quad9.net/dns-query'
      case 'google':
        return 'https://dns.google/resolve'
      case 'custom':
        return customUrl || 'https://1.1.1.1/dns-query'
      default:
        return 'https://1.1.1.1/dns-query'
    }
  }

  /**
   * Resolves a hostname (e.g. example.com) to an IPv4 address using DNS-over-HTTPS (DoH)
   */
  public static async resolve4(
    hostname: string,
    provider: 'cloudflare' | 'quad9' | 'google' | 'custom' = 'cloudflare',
    customUrl?: string
  ): Promise<string> {
    // Return IP directly if input is already an IP address
    if (/^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/.test(hostname)) {
      return hostname
    }

    const cached = this.cache.get(hostname)
    if (cached && cached.expiresAt > Date.now()) {
      return cached.ip
    }

    const endpoint = this.getEndpointUrl(provider, customUrl)
    const urlObj = new URL(endpoint)
    urlObj.searchParams.set('name', hostname)
    urlObj.searchParams.set('type', 'A')

    return new Promise((resolve, reject) => {
      const req = https.get(
        urlObj.toString(),
        {
          headers: {
            Accept: 'application/dns-json',
            'User-Agent': 'grabbit-doh/1.0'
          },
          timeout: 4000
        },
        (res) => {
          let body = ''
          res.on('data', (chunk) => (body += chunk))
          res.on('end', () => {
            try {
              if (res.statusCode && res.statusCode >= 400) {
                return reject(new Error(`DoH server returned HTTP ${res.statusCode}`))
              }
              const parsed: DoHResponse = JSON.parse(body)
              if (parsed.Answer && parsed.Answer.length > 0) {
                const aRecord = parsed.Answer.find((r) => r.type === 1) || parsed.Answer[0]
                if (aRecord && aRecord.data) {
                  const ttlMs = Math.max(30, aRecord.TTL || 300) * 1000
                  this.cache.set(hostname, {
                    ip: aRecord.data,
                    expiresAt: Date.now() + ttlMs
                  })
                  return resolve(aRecord.data)
                }
              }
              reject(new Error(`No IPv4 A records found for hostname: ${hostname}`))
            } catch (err) {
              reject(err)
            }
          })
        }
      )

      req.on('error', (err) => reject(err))
      req.on('timeout', () => {
        req.destroy()
        reject(new Error(`DoH query timeout for hostname: ${hostname}`))
      })
    })
  }

  public static clearCache(): void {
    this.cache.clear()
  }
}
