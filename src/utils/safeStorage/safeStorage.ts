import { packData, unpackData, packDataSync, unpackDataSync } from './core'

export const encryptAndCompress = packData
export const decompressAndDecrypt = unpackData
export const encryptAndCompressSync = packDataSync
export const decompressAndDecryptSync = unpackDataSync
