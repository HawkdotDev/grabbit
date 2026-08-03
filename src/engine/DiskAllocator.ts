import * as fs from 'fs'
import * as path from 'path'

export class DiskAllocator {
  public static ensureDirectory(dirPath: string): void {
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true })
    }
  }

  public static preallocateFile(filePath: string, sizeBytes: number): void {
    this.ensureDirectory(path.dirname(filePath))

    // Truncate or preallocate file descriptor
    const fd = fs.openSync(filePath, 'w')
    try {
      if (sizeBytes > 0) {
        fs.ftruncateSync(fd, sizeBytes)
      }
    } finally {
      fs.closeSync(fd)
    }
  }

  public static writeChunkAtOffset(filePath: string, buffer: Uint8Array, byteOffset: number): void {
    const fd = fs.openSync(filePath, 'r+')
    try {
      fs.writeSync(fd, buffer, 0, buffer.length, byteOffset)
    } finally {
      fs.closeSync(fd)
    }
  }
}
