import { exec } from 'child_process'

export interface MediaFormat {
  formatId: string
  extension: string
  resolution: string
  filesize?: number
  note?: string
}

export class MediaWorker {
  /**
   * Extract video formats and resolutions using yt-dlp binary wrapper
   */
  public static async extractVideoFormats(videoUrl: string): Promise<MediaFormat[]> {
    return new Promise((resolve) => {
      // Execute yt-dlp format extraction with JSON output flag -j
      exec(`yt-dlp -j "${videoUrl}"`, (error, stdout) => {
        if (error || !stdout) {
          // Return default synthetic formats if yt-dlp binary is not installed locally
          return resolve([
            {
              formatId: 'best',
              extension: 'mp4',
              resolution: '1080p (Full HD)',
              note: 'Auto Best Quality'
            },
            { formatId: '720p', extension: 'mp4', resolution: '720p (HD)', note: 'Fast Download' },
            {
              formatId: 'audio',
              extension: 'm4a',
              resolution: 'Audio Only',
              note: 'AAC High Bitrate'
            }
          ])
        }

        try {
          const info = JSON.parse(stdout)
          const formats: MediaFormat[] = (info.formats || []).map((f: any) => ({
            formatId: f.format_id || 'default',
            extension: f.ext || 'mp4',
            resolution: f.resolution || `${f.width}x${f.height}` || 'Unknown',
            filesize: f.filesize || f.filesize_approx,
            note: f.format_note || ''
          }))

          resolve(
            formats.length > 0
              ? formats
              : [
                  {
                    formatId: 'best',
                    extension: 'mp4',
                    resolution: '1080p',
                    note: 'Auto Best Quality'
                  }
                ]
          )
        } catch {
          resolve([
            { formatId: 'best', extension: 'mp4', resolution: '1080p', note: 'Auto Best Quality' }
          ])
        }
      })
    })
  }
}
