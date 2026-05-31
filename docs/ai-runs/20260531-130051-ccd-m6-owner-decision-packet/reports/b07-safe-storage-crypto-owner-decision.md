# B-07 SafeStorage Crypto Owner Decision Packet

## Status

- Issue: `B-07`
- Current status: `BLOCKED`
- Decision status: `PROPOSED`
- Recommendation: extract non-crypto codec helpers first; keep crypto/HMAC/obfuscation app-owned unless an owner explicitly approves a reusable web-library runtime.
- Source migration in M6: none

## Evidence

- `apps/web-demo/src/utils/safeStorage/crypto.ts` imports `crypto-es`, uses Web Crypto `crypto.subtle` when available, falls back to synchronous `crypto-es` HMAC, and logs through the app logger.
- `apps/web-demo/src/utils/safeStorage/core.ts` mixes JSON codec, compression, key resolution, env fallback, logger behavior, and crypto calls.
- `packages/contracts/src/crypto.ts` currently exposes a minimal `CryptoProvider` type shape only.
- `packages/core/src/index.ts` accepts an injected optional `crypto?: CryptoProvider`, but current evidence does not prove shared crypto orchestration value.
- M5 already found that browser storage, key/env/logger behavior must stay app-owned.

## Option Matrix

| option | target package/path | allowed dependencies | forbidden dependencies | runtime classification | API surface impact | required manifest changes | tests required | migration complexity | security risk | compatibility facade requirement | rollback plan | recommendation | rejected alternatives |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| A. Keep crypto/HMAC/obfuscation app-owned; move only pure JSON/storage serialization later | `apps/web-demo/src/utils/safeStorage/crypto.ts`; pure helpers in `packages/shared-utils` only when behavior is deterministic | app logger, `crypto-es`, Web Crypto through app runtime, shared pure codec helpers | `packages/core`, `packages/contracts` implementation code, browser globals in runtime-neutral packages | app runtime / app infrastructure | no package API impact unless pure helpers are exported | none for crypto; possible shared-utils manifest only if new public entrypoint is added | crypto round-trip, HMAC failure, key rotation, Pinia serializer, ProForm draft | low-mid for non-crypto helpers; high if crypto touched | medium: app-owned crypto keeps client-visible obfuscation semantics honest | keep `@/utils/safeStorage` facade stable | revert app facade/helper changes; persisted format should remain readable | recommended default crypto owner boundary | rejects moving runtime crypto to core/contracts |
| B. Define crypto/storage capability interfaces in `@ccd/contracts`; keep browser crypto in app adapters | optional `packages/contracts/src/crypto.ts` refinement; implementation under app adapter/infrastructure | type-only imports from contracts | Web Crypto, `crypto-es`, app logger, concrete defaults, side effects | contracts type-only plus app runtime implementation | public API expands; requires API report | no dependency manifest change expected unless export map changes | contracts build, API report, app adapter tests | mid | low if type-only; medium if contracts over-specify security semantics | app facade still required | revert contract shape and app adapter binding | acceptable only after API need is proven | immediate contract expansion rejected for M7 because codec foundation does not need it |
| C. Move runtime-neutral crypto orchestration into `@ccd/core` | `packages/core` only if injected contracts prove multi-runtime value | `@ccd/contracts` only | Vue, browser globals, Node crypto, Web Crypto, `crypto-es`, logger implementation, timers, storage | strict runtime-neutral orchestration | core public API expands | no dependency changes allowed beyond `@ccd/contracts` | core build, arch runtime, contracts/core tests, multi-runtime adapter tests | high | high: easy to imply false shared security policy | app facade required and adapters must inject all behavior | revert core API and app adapter bridge | not recommended now | rejected because no proven multi-runtime orchestration value |
| D. Move deterministic pure helper code to `@ccd/shared-utils` | `packages/shared-utils/src/storageCodec.ts`; optional `storageCompression.ts` | pure functions, `lz-string` only if already acceptable and reused | browser globals, app logger, `import.meta.env`, storage globals, side effects | runtime-neutral utility | shared-utils public API may expand | possible export update; no new dependency unless owner approves | shared-utils unit tests, app safeStorage parity tests | low-mid | low if no crypto/security behavior moves | app facade may re-export during migration | revert pure helper export and app call site | recommended for JSON/compression only | rejected for crypto/HMAC/Web Crypto behavior |
| E. Defer all safeStorage crypto movement and extract non-crypto codec helpers first | `packages/shared-utils` for pure codec/compression; app safeStorage facade remains | contracts/shared-utils/app facade | crypto implementation movement, package manifest churn, lockfile changes | runtime-neutral helpers plus app runtime | small or none if existing helpers are reused | none unless new helper export is added | storage codec, serializer, draft storage, web-demo type-check | lowest initial complexity | lowest immediate security risk | yes, keep app compatibility facade | revert helper/facade edits only | recommended next lane sequence | rejects crypto movement until owner approval exists |

## Proposed Decision

Approve option E as the next implementation sequence and option A as the default crypto ownership boundary. This keeps `B-07` blocked for crypto movement while allowing M7 to reduce non-crypto codec residue.

## Required Owner Approval Before Crypto Movement

- Whether crypto/HMAC implementation must remain app-owned permanently.
- Whether any reusable web-library crypto runtime is allowed.
- Whether `packages/contracts/src/crypto.ts` should grow beyond the current minimal provider shape.
- Whether persisted data format and key-rotation policy are frozen for migration.

## Minimum Future Validation

- focused safeStorage round-trip tests for representative objects
- previous-key decode fixtures
- HMAC mismatch returns `null` without leaking secret/ciphertext
- malformed/empty payload behavior parity
- Pinia serializer legacy JSON fallback
- ProForm draft read/write compatibility
- `pnpm --filter @ccd/web-demo type-check`
- `pnpm arch:runtime`
- `pnpm arch:boundaries`
- `pnpm api:report` if public package exports change
