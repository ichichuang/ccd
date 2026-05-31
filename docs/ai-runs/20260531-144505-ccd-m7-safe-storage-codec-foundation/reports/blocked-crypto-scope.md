# M7 Blocked Crypto Scope

## Status

- `B-07` remains `BLOCKED`.
- `D-016` remains `PROPOSED`.
- Owner approval status remains `NO_OWNER_APPROVAL_RECORDED`.

## Not Touched In M7

M7 did not move, modify, or re-export:

- `apps/web-demo/src/utils/safeStorage/crypto.ts`
- AES encryption/decryption behavior
- HMAC generation or verification
- Web Crypto `crypto.subtle` behavior
- `crypto-es` fallback behavior
- obfuscation key resolution
- `import.meta.env` usage
- app logger wiring
- browser storage wiring
- Pinia persistedstate serializer integration

## Reason

The crypto helper is not a codec/compression helper. It uses `crypto-es`, Web Crypto, HMAC, and the app logger. Moving it requires an owner-approved runtime/security boundary decision that does not exist in the current M6/M6b evidence.

## Future Requirement

Any future crypto lane must first record owner approval for one of the allowed ownership paths:

- keep crypto/HMAC permanently app-owned behind app adapters; or
- move to an explicitly approved web-library runtime package with tests and API governance.

`packages/core` and `packages/contracts` remain forbidden destinations for crypto implementation code.
