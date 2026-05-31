# M5 SafeStorage Extraction Plan

## Current Split

| surface | current path | current role | target owner | M5 action |
| --- | --- | --- | --- | --- |
| Storage contracts | `packages/contracts/src/storage.ts` | type-only policy, codec, adapter contracts | `packages/contracts` | keep; only refine if future source lane needs a missing type |
| JSON storage codec | `packages/shared-utils/src/storageCodec.ts` | pure JSON parse/stringify result helpers | `packages/shared-utils` | keep; use as existing package owner |
| Pack/unpack orchestration | `apps/web-demo/src/utils/safeStorage/core.ts` | JSON + compression + crypto pipeline plus app key/env/logger coupling | split: pure helper to `shared-utils`, app key/runtime to `apps/web-demo` | plan source split only |
| Compression wrapper | `apps/web-demo/src/utils/safeStorage/lzstring.ts` | pure LZ-String base64 wrapper | `packages/shared-utils` if reused; otherwise app-private | future lane must preserve exact round-trip behavior |
| Crypto helper | `apps/web-demo/src/utils/safeStorage/crypto.ts` | Web Crypto/crypto-es runtime implementation and HMAC behavior | blocked: app adapter or approved web-library package | keep blocked until owner decision |
| Browser storage adapter | `apps/web-demo/src/utils/safeStorage/storageMaintenance.ts` | concrete `localStorage`/`sessionStorage` adapter and maintenance helpers | `apps/web-demo` | keep app-owned |
| Pinia serializer | `apps/web-demo/src/utils/safeStorage/piniaSerializer.ts` | Pinia persistedstate serializer and fallback decode | `apps/web-demo` | keep app-owned; source lane must preserve persisted format |
| Compatibility barrel | `apps/web-demo/src/utils/safeStorage/index.ts`, `safeStorage.ts` | public-looking app import facade and deprecated aliases | app-local facade | keep until migrations finish, then shrink |

## Proposed API Shapes

| future API | owner | shape | notes |
| --- | --- | --- | --- |
| `SafeStoragePolicy`, `StorageCodec`, `SyncStorageCodec`, `SafeStorageAdapter` | `packages/contracts` | existing type exports | no browser implementation belongs here |
| `stringifyJsonStorageValue`, `parseJsonStorageValue` | `packages/shared-utils` | existing pure helpers | already used by `core.ts` |
| optional storage compression helpers | `packages/shared-utils` | `compressToStorageBase64(value: string): string`; `decompressFromStorageBase64(value: string): string | null` | add only if reuse is approved |
| app codec factory | `apps/web-demo` facade over package helpers | `createAppSafeStorageCodec({ secret, previousSecrets, logger })` | source lane only; should preserve `packDataSync`/`unpackDataSync` compatibility |
| crypto runtime | unresolved | `CryptoProvider` contract only if needed; implementation app-owned unless approved | B-07 remains blocked |

## Future Migration Lanes

| lane | scope | prerequisites | validation |
| --- | --- | --- | --- |
| M5-source-storage-1 | extract/centralize pure compression or codec helpers | persisted format fixture inventory | shared-utils tests, safeStorage round-trip tests |
| M5-source-storage-2 | split app key/env/logger resolver from pack/unpack pipeline | storage codec tests passing | web-demo type-check, Pinia serializer tests |
| M5-source-storage-3 | adapterize browser storage maintenance and ProForm draft injection | app codec facade stable | ProForm draft tests, system store specs |
| blocked-storage-crypto | decide crypto runtime owner | owner decision for B-07 | `pnpm arch:runtime`, focused crypto tests |

## Required Tests

- Round-trip current encrypted compressed payload for representative objects.
- Decode previous-key payloads from `VITE_PUBLIC_STORAGE_OBFUSCATION_KEY_PREVIOUS`.
- HMAC failure returns `null` without leaking secret or ciphertext.
- Empty and malformed payloads preserve current fallback behavior.
- Pinia serializer returns object fallback for legacy plaintext JSON.
- ProForm draft storage still reads/writes with the same prefix and codec.

## Residual Risk

B-07 is unresolved because `crypto.ts` has runtime and security semantics. It must not move into `packages/core` or `packages/contracts`; source migration should remain partial until the owner chooses app-only adapter versus approved web-library ownership.
