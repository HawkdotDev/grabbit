import { DownloadCategory } from './types'

const CATEGORY_EXTENSIONS: Record<Exclude<DownloadCategory, 'all' | 'other'>, string[]> = {
  documents: [
    'pdf',
    'doc',
    'docx',
    'txt',
    'rtf',
    'odt',
    'epub',
    'mobi',
    'ppt',
    'pptx',
    'xls',
    'xlsx'
  ],
  compressed: ['zip', 'rar', '7z', 'tar', 'gz', 'bz2', 'xz', 'iso', 'dmg', 'tgz'],
  video: ['mp4', 'mkv', 'avi', 'mov', 'webm', 'flv', 'wmv', 'm4v', '3gp', 'ts'],
  audio: ['mp3', 'wav', 'flac', 'aac', 'ogg', 'm4a', 'wma', 'opus', 'alac'],
  executables: ['exe', 'msi', 'app', 'deb', 'rpm', 'apk', 'bin', 'sh', 'bat'],
  images: ['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp', 'bmp', 'ico', 'tiff', 'avif'],
  code: [
    'ts',
    'js',
    'json',
    'py',
    'java',
    'c',
    'cpp',
    'html',
    'css',
    'go',
    'rs',
    'php',
    'sql',
    'sh'
  ]
}

export class CategoryManager {
  public static detectCategory(filename: string): DownloadCategory {
    const ext = filename.split('.').pop()?.toLowerCase() || ''
    if (!ext) return 'other'

    for (const [category, extensions] of Object.entries(CATEGORY_EXTENSIONS)) {
      if (extensions.includes(ext)) {
        return category as DownloadCategory
      }
    }

    return 'other'
  }

  public static getAllCategories(): Record<DownloadCategory, string[]> {
    return {
      all: [],
      other: [],
      documents: [...CATEGORY_EXTENSIONS.documents],
      compressed: [...CATEGORY_EXTENSIONS.compressed],
      video: [...CATEGORY_EXTENSIONS.video],
      audio: [...CATEGORY_EXTENSIONS.audio],
      executables: [...CATEGORY_EXTENSIONS.executables],
      images: [...CATEGORY_EXTENSIONS.images],
      code: [...CATEGORY_EXTENSIONS.code]
    }
  }

  public static getCategoryLabel(category: DownloadCategory): string {
    switch (category) {
      case 'all':
        return 'All Downloads'
      case 'documents':
        return 'Documents'
      case 'compressed':
        return 'Archives'
      case 'video':
        return 'Videos'
      case 'audio':
        return 'Audio'
      case 'executables':
        return 'Executables'
      case 'images':
        return 'Images'
      case 'code':
        return 'Code & Data'
      case 'other':
        return 'Other Files'
    }
  }
}
