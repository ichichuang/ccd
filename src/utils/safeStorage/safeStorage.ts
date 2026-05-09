import { packData, unpackData, packDataSync, unpackDataSync } from './core'

/**
 * Correctly-named exports — pipeline is compress → encrypt (pack) / decrypt → decompress (unpack).
 */
export const compressAndEncrypt = packData
export const decryptAndDecompress = unpackData
export const compressAndEncryptSync = packDataSync
export const decryptAndDecompressSync = unpackDataSync

/**
 * @deprecated Use {@link compressAndEncrypt} — the old name implies encrypt-first, which is wrong.
 */
export const encryptAndCompress = packData
/**
 * @deprecated Use {@link decryptAndDecompress} — the old name implies decompress-first, which is wrong.
 */
export const decompressAndDecrypt = unpackData
/**
 * @deprecated Use {@link compressAndEncryptSync}
 */
export const encryptAndCompressSync = packDataSync
/**
 * @deprecated Use {@link decryptAndDecompressSync}
 */
export const decompressAndDecryptSync = unpackDataSync
