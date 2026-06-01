# D-020 Risk Notes

## Controlled Risks

- Public API surface changed by adding `installPrimeVueRuntime()` and `PrimeVueRuntimeInstallOptions`; the API report was regenerated with `pnpm api:report`.
- Service install order is behavior-sensitive; focused adapter tests assert config installation before services and support `services: false`.
- Web bootstrap still owns app-specific dialog runtime config, avoiding an oversized adapter boundary.

## Non-Changes

- No Clawd/theme work.
- No safeStorage crypto, HMAC, WebCrypto, or lz-string ownership change.
- No dependency, `package.json`, or `pnpm-lock.yaml` change.
- No Tauri capability, metadata, or Rust source change.
- No manual generated output edit.

## Residual Risks

- C-06 remains open for D-021 build/generated rows, D-022 global shell row, and D-024 showcase cleanup.
- G-02 remains unchanged at 78 open tasks.
- Full GO is still unauthorized until all approved residual lanes and the final validation matrix pass.
