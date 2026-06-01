# Final Risk Notes

## Closed Or Mitigated For Full GO

- PrimeVue bootstrap install semantics: mitigated by D-020 adapter migration and web/desktop build validation.
- Build resolver and generated registry ownership: mitigated by D-021 boundary plus generated drift checks.
- AppPrimeVueGlobals service/global shell behavior: mitigated by D-022 facade migration, tests, and final builds.
- Showcase direct PrimeVue imports: closed by D-024 wrapper/facade migration and guard exception removal.
- Repair-ledger overstatement risk: closed for current Full GO by D-023 decisions plus `pnpm ai:doctor --open` 0.
- Generated manual-edit risk: mitigated by owning generator commands and drift checks.

## Preserved Out Of Scope

- Clawd/theme import issues.
- safeStorage crypto/HMAC/WebCrypto ownership.
- lz-string ownership.
- Vite major migration, dependency modernization, GitHub remote/settings, `.github/**`, and Login Diorama product work.

These preserved items are not Full GO blockers under the P30 owner/operator/product decisions. Reopening them requires a new scoped lane.
