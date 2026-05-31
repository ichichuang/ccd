# Next Lane Authorization

## Decision Review Outcome

- `D-016`: `NO_OWNER_APPROVAL_RECORDED`
- `D-017`: `NO_OWNER_APPROVAL_RECORDED`
- Final M6b status target: `M6B_NO_OWNER_APPROVAL_RECORDED` if validation passes.

## Authorized Next Lanes

### Limited Authorization: `M7-safeStorage-codec-foundation`

`M7-safeStorage-codec-foundation` may start only if it stays within the non-crypto codec/compression foundation scope already described by M6:

- Allowed: pure serialization, compression, codec, compatibility facade, and focused parity tests.
- Forbidden: crypto/HMAC/Web Crypto implementation movement, package manifest changes, lockfile changes, runtime behavior changes, auth/HTTP behavior, or moving anything into `packages/core`.
- `B-07` remains `BLOCKED` for crypto ownership.

## Blocked Next Lanes

### Blocked: `M12-primevue-allowlist-reduction`

`M12-primevue-allowlist-reduction` is blocked because no owner approval source was found for `D-017`.

Before M12 can start, owner approval must identify:

- selected reduction group;
- allowed app/package paths;
- wrapper or adapter ownership;
- visual/e2e validation budget;
- generated typing strategy if generated output is touched.

### Still Blocked: Crypto Movement Under `B-07`

Any safeStorage crypto ownership or implementation movement is blocked until owner approval explicitly resolves `D-016`.

## Status Preservation

- `B-07`: remains `BLOCKED`.
- `C-06`: remains `OPEN`.
- `G-03`: remains `BLOCKED`.
- No implementation issue is marked `DONE` by this lane.
