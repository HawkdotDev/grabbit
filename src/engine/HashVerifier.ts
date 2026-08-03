import * as crypto from 'crypto'
import * as fs from 'fs'

export class HashVerifier {
  public static async calculateHash(
    filePath: string,
    algorithm: 'sha256' | 'md5' | 'sha512' = 'sha256'
  ): Promise<string> {
    return new Promise((resolve, reject) => {
      const hash = crypto.createHash(algorithm)
      const stream = fs.createReadStream(filePath)

      stream.on('data', (data) => hash.update(data))
      stream.on('end', () => resolve(hash.digest('hex')))
      stream.on('error', (err) => reject(err))
    })
  }

  public static async verifyHash(
    filePath: string,
    expectedHash: string,
    algorithm: 'sha256' | 'md5' | 'sha512' = 'sha256'
  ): Promise<boolean> {
    const actual = await this.calculateHash(filePath, algorithm)
    return actual.toLowerCase().trim() === expectedHash.toLowerCase().trim()
  }
}
