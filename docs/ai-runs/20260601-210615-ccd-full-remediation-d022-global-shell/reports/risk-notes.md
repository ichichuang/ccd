# D-022 Risk Notes

## Risks Addressed

- Direct app-level PrimeVue shell imports were removed from the final exact allowlist row.
- Global service mounting logic is now tested in the adapter rather than embedded in the app shell.
- `@ccd/vue-ui` was not used to publicly re-export raw PrimeVue modules.
- No package manifest, lockfile, dependency, Clawd/theme, safeStorage crypto/HMAC/WebCrypto, or lz-string ownership change was made.

## Residual Risks

- C-06 remains open because the `primevue-collection/**` showcase exception remains for D-024.
- G-02 remains 78 owner-accepted deferred tasks until D-023.
- The in-app browser plugin's read-only page scope could not observe `window.$toast` / `window.$message`; main-world Playwright verified those APIs instead.

## Rollback Surface

- Revert adapter facade exports and the `AppPrimeVueGlobals.vue` import migration together if runtime PrimeVue global shell behavior regresses.
- Restore the guard allowlist row only if source rollback reintroduces direct app PrimeVue imports.
