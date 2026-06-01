# D-024 Risk Notes

- Runtime behavior was intended to remain equivalent: migrated controls forward attrs,
  props, events, and slots through the existing `createCcdPrimeControl()` pattern.
- `usePrimeVueConfirmService()` is a narrow adapter facade over PrimeVue `useConfirm()`;
  it does not change confirmation service semantics.
- The native color input inside the custom color-field demo was not changed; D-024 only
  migrates raw PrimeVue imports and does not broaden into unrelated showcase UX cleanup.
- In-app Browser reached the login guard and could not complete auth state updates through
  its read-only page context. Full visual/interaction smoke was completed with local
  Playwright against the same dev server.
- No package manifests, lockfile, Clawd/theme code, safeStorage crypto/HMAC/WebCrypto
  ownership, or lz-string ownership changed.
