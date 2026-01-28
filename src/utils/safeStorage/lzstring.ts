import LZString from 'lz-string'

export function compress(str: string): string {
  if (!str) return ''
  return LZString.compressToBase64(str)
}

export function decompress(str: string): string | null {
  if (!str) return null
  return LZString.decompressFromBase64(str)
}
