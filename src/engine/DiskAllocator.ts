import * as fs from 'fs'
import * as path from 'path'

export class DiskAllocator {
  private static openHandles: Map<string, number> = new Map()

  public static ensureDirectory(dirPath: string): void {
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true })
    }
  }

  public static preallocateFile(filePath: string, sizeBytes: number): void {
    this.ensureDirectory(path.dirname(filePath))

    // Close any previous open handle for this file before re-creating
    this.closeFile(filePath)

    const fd = fs.openSync(filePath, 'w')
    try {
      if (sizeBytes > 0) {
        fs.ftruncateSync(fd, sizeBytes)
      }
    } finally {
      fs.closeSync(fd)
    }
  }

  public static openFile(filePath: string): number {
    let fd = this.openHandles.get(filePath)
    if (fd === undefined) {
      this.ensureDirectory(path.dirname(filePath))
      if (!fs.existsSync(filePath)) {
        fd = fs.openSync(filePath, 'w+')
      } else {
        fd = fs.openSync(filePath, 'r+')
      }
      this.openHandles.set(filePath, fd)
    }
    return fd
  }

  public static closeFile(filePath: string): void {
    const fd = this.openHandles.get(filePath)
    if (fd !== undefined) {
      try {
        fs.closeSync(fd)
      } catch (err) {
        console.error(`Failed to close file handle for ${filePath}:`, err)
      }
      this.openHandles.delete(filePath)
    }
  }

  public static closeAll(): void {
    for (const fd of this.openHandles.values()) {
      try {
        fs.closeSync(fd)
      } catch {
        // ignore
      }
    }
    this.openHandles.clear()
  }

  public static writeChunkAtOffset(filePath: string, buffer: Uint8Array, byteOffset: number): void {
    const fd = this.openFile(filePath)
    fs.writeSync(fd, buffer, 0, buffer.length, byteOffset)
  }
}
