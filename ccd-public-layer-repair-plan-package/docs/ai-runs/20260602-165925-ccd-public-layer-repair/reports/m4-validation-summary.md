# M4 Validation Summary

## Outcome

- Milestone: `M4 — System preference contract split`
- Approval IDs:
  - `M4-PLAN-SCOPE-EXECUTION-APPROVED`
  - `M4-AI-ADAPTER-MATERIALIZATION-APPROVED`
- Status: `DONE`
- Stop condition: Stop after M4; do not advance to M5.

## Implementation Summary

- Added type-only system preference contracts to `@ccd/contracts`:
  - `SystemPreferences`
  - `SystemPreferenceSyncType`
  - `SystemPreferencePayload`
  - `SystemPreferenceEnvelope`
  - nested theme/size/layout state contracts
- Re-exported the contracts through `packages/contracts/src/index.ts`.
- Updated app system preference type imports in guards/runtime/model/register/local persist/API/hook code to use `@ccd/contracts`.
- Kept app Zod schema, sanitizer runtime, sync runtime, stores, local persistence, and normalization app-owned.
- Added focused guard tests for complete payloads, partial payloads, missing numeric `updatedAt`, and unknown sync type rejection.

## Validation Matrix

| Command | Result | Evidence |
| --- | --- | --- |
| `pnpm --filter @ccd/contracts type-check` | PASS | `../command-logs/060-m4-required-01-contracts-type-check.log` |
| `pnpm --filter @ccd/contracts test` | PASS | `../command-logs/061-m4-required-02-contracts-test.log` |
| `pnpm --filter @ccd/contracts build` | PASS | `../command-logs/062-m4-required-03-contracts-build.log` |
| `pnpm build:core` | PASS | `../command-logs/063-m4-required-04-build-core.log` |
| `pnpm ci:smoke:packages` | PASS | `../command-logs/064-m4-required-05-ci-smoke-packages.log` |
| `pnpm --filter @ccd/web-demo type-check` | PASS | `../command-logs/065-m4-required-06-web-demo-type-check.log` |
| `pnpm type-check` | PASS | `../command-logs/066-m4-required-07-type-check.log` |
| `pnpm lint:check` | PASS | `../command-logs/067-m4-required-08-lint-check.log` |
| `pnpm test:run` | PASS | `../command-logs/068-m4-required-09-test-run.log` |
| `pnpm arch:boundaries` | PASS | `../command-logs/069-m4-required-10-arch-boundaries.log` |
| `pnpm arch:runtime` | PASS | `../command-logs/070-m4-required-11-arch-runtime.log` |
| `pnpm ai:guard -- --format=json` | PASS | `../command-logs/071-m4-required-12-ai-guard-json.log` |
| `pnpm drift-check` | PASS | `../command-logs/072-m4-required-13-drift-check.log` |
| `pnpm validate:governance` | FAIL_THEN_PASS | Initial generated sync failure: `../command-logs/073-m4-required-14-validate-governance.log`; generated diff: `../command-logs/074-m4-generated-api-surface-diff-after-validate-governance.log`; rerun passed: `../command-logs/076-m4-required-14-validate-governance-rerun-after-api-surface-sync.log` |
| `pnpm --filter @ccd/web-demo test src/sync/systemPreferences/guards.spec.ts` | PASS | `../command-logs/053-m4-focused-guards-vitest-rerun-package-path.log` |

`pnpm test:run` passed with 83 test files and 474 tests.

## Generated Evidence

- `docs/generated/api-surface-report.json` and `docs/generated/api-surface-report.md` were synchronized by the owning governance generator during `pnpm validate:governance`.
- Owning command chain: `pnpm validate:governance -> pnpm governance:gate -> pnpm api:report -> node scripts/architecture/check-api-surface.mjs`.
- `apps/web-demo/src/types/auto-imports.d.ts` changed through web-demo validation/auto-import generation; it was not manually edited.
- No package manifests, workspace manifests, lockfiles, generated registries, generated graphs, production config, deployment config, or secrets were manually changed.

## Scope Guard

- Manifest/lockfile diff check was empty: `../command-logs/079-m4-final-manifest-lock-diff-check.log`.
- `@ccd/contracts` has no non-type imports: `../command-logs/080-m4-final-boundary-scans.log`.
- App system preference runtime/API/hook type imports now consume `@ccd/contracts`; the remaining local import is the app-owned `systemPreferencesSchema`.
- M4 did not move Zod schemas, sanitizer runtime, sync runtime, app stores, safeStorage, or persistence behavior.
- M4 did not modify `@ccd/vue-app-platform`; the conditional package validation for that package was not required by M4.

## Changed Files

- `packages/contracts/src/preferences.ts`
- `packages/contracts/src/index.ts`
- `apps/web-demo/src/types/systems/preferences.ts`
- `apps/web-demo/src/sync/systemPreferences/guards.ts`
- `apps/web-demo/src/sync/systemPreferences/guards.spec.ts`
- `apps/web-demo/src/sync/systemPreferences/localPersist.ts`
- `apps/web-demo/src/sync/systemPreferences/model.ts`
- `apps/web-demo/src/sync/systemPreferences/register.ts`
- `apps/web-demo/src/sync/systemPreferences/runtime.ts`
- `apps/web-demo/src/api/system/preferences.api.ts`
- `apps/web-demo/src/hooks/modules/useSystemPreferencesSync.ts`
- `apps/web-demo/src/types/auto-imports.d.ts`
- `docs/generated/api-surface-report.json`
- `docs/generated/api-surface-report.md`
- `.ai/manifests/rule-index.json`
- `ccd-public-layer-repair-plan-package/docs/ai-plan/STATUS.md`
- `ccd-public-layer-repair-plan-package/docs/ai-plan/DECISIONS.md`
- `ccd-public-layer-repair-plan-package/docs/ai-runs/20260602-165925-ccd-public-layer-repair/**`

## Notes

- Literal `pnpm ai:sync` hit the local `mise.toml` trust shim before adapter materialization. The accepted rerun used process-local `MISE_TRUSTED_CONFIG_PATHS=$PWD/mise.toml`; no global trust store was modified.
- `pnpm ai:sync` reported legacy `.cursor` cleanup, but `.cursor` was absent before execution and absent after execution; no tracked deletion appeared.
- Prior accepted M1/M2/M3 dirty baseline remains present and was not reverted.
