# M7 Behavior Compatibility Notes

## Preserved Behavior

- `apps/web-demo/src/utils/safeStorage/core.ts` already delegates JSON stringify/parse to `@ccd/shared-utils` through `stringifyJsonStorageValue` and `parseJsonStorageValue`.
- No encrypted payload format was changed.
- No compression output format was changed.
- No unpack fallback behavior was changed.
- No Pinia serializer behavior was changed.
- No storage keys were changed.
- No warning/error logging behavior was changed.
- No previous-key fallback behavior was changed.
- No app compatibility exports were changed.

## Codec Foundation Status

The runtime-neutral JSON codec foundation is already present in:

- `packages/shared-utils/src/storageCodec.ts`
- `packages/shared-utils/src/index.ts`

The app safeStorage pipeline already consumes those helpers from `@ccd/shared-utils`, so M7 records this as an established non-crypto foundation rather than adding another wrapper or duplicating helpers.

## Compression Status

`apps/web-demo/src/utils/safeStorage/lzstring.ts` remains app-owned in M7.

Reason:

- It imports `lz-string`.
- `packages/shared-utils/package.json` declares only `lodash-es` and `uuid`.
- M7 forbids package manifest and lockfile edits.
- Moving the wrapper without a manifest change would create an undeclared dependency in `@ccd/shared-utils`.

Future compression extraction must preserve exact `LZString.compressToBase64` and `LZString.decompressFromBase64` compatibility because persisted safeStorage payloads depend on that format.

## Runtime Source Change Result

Runtime source files changed in M7: no.

This is intentional: the only eligible helpers are already established and consumed, while the remaining app-local helper requires dependency approval outside the authorized M7 scope.
