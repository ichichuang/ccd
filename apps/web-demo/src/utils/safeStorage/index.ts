/**
 * SafeStorage public facade (app-owned runtime).
 *
 * Ownership boundaries (D-016 Option A, D-019 Option A):
 * - JSON codec: `@ccd/shared-utils` (`stringifyJsonStorageValue`, `parseJsonStorageValue`)
 * - Crypto/HMAC/Web Crypto: `./crypto` (app-only, do not migrate)
 * - Compression (lz-string): `./lzstring` (app-only, do not migrate)
 * - Browser storage, obfuscation-key resolution, logger, env: `./core` (app-only)
 */
export * from './crypto'
export * from './lzstring'
export * from './core'
export * from './safeStorage'
export * from './piniaSerializer'
export * from './storageMaintenance'
