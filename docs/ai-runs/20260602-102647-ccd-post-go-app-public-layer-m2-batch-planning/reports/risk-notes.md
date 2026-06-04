# M2 Risk Notes

## Post-merge note

This document records the pre-merge execution and closeout state of the public-layer repair and post-GO apps public-layer certification lane. PR #38 has since been merged into `main`. Historical statements such as "ready for human review", "branch remains unmerged", or "do not merge" refer to the execution-time branch state rather than the current `main` branch state. Any residual risks noted here remain future improvement lanes, not blockers to the completed merge.

## Residual risks

- `M3-DESKTOP-THEME` has CSS variable parity risk because the desktop app
  currently derives theme/size variables locally and writes them to `document`.
- Route access utilities may appear pure, but they depend on app route/menu
  shapes and are used by permission flow, router transform logic, and session
  stores.
- DTO/Zod schema migration is blocked by D-A002 unless a later approval records
  the exact dependency and owner.
- `DateUtils` remains risky because it owns dayjs plugin setup, locale/timezone
  state, framework hydration, and event/listener integration.
- safeStorage crypto and compression remain app-owned by prior approved
  decisions; moving them would change security/dependency boundaries.
- Build/generator utilities have no governed package owner. M6 must classify
  rather than invent a package.

## Controls

- M2 approves only one implementation review path that should not need manifest
  or lockfile changes: desktop theme/size var derivation via existing
  `@ccd/design-tokens` APIs.
- All deferred candidates require a narrower future owner decision or parity
  proof before movement.
- M7 guard hardening must be deterministic and must preserve existing runtime,
  PrimeVue, generated-file, and package-boundary checks.

## No-go items

- No package manifest or lockfile changes.
- No manual generated registry edits.
- No safeStorage crypto/HMAC/WebCrypto movement.
- No lz-string ownership movement.
- No broad route/store/plugin/bootstrap migration.
- No destructive git operation and no push.
