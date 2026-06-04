# M3 Validation Summary

## Outcome

- Milestone: `M3 — API/DTO response contract normalization`
- Approval ID: `M3-PLAN-SCOPE-EXECUTION-APPROVED`
- Status: `DONE`
- Stop condition: Stop after M3; do not advance to M4.

## Implementation Summary

- Added type-only `BackendApiResponseEnvelope<TData>` to `@ccd/contracts`.
- Renamed app backend response usage from ambiguous `ApiResponse` to `BackendApiResponseEnvelope`.
- Renamed app HTTP runtime response shape to `HttpClientResponseEnvelope`.
- Kept Zod schemas, HTTP runtime, Alova, interceptors, auth refresh, browser upload/download, notification policy, and runtime behavior app-owned.
- Added scoped deterministic guard hardening against reintroduced app `ApiResponse` definitions.

## Validation Matrix

| Command | Result | Evidence |
| --- | --- | --- |
| `pnpm --filter @ccd/contracts type-check` | PASS | `../command-logs/m3-required-01-contracts-type-check.log` |
| `pnpm --filter @ccd/contracts test` | PASS | `../command-logs/m3-required-02-contracts-test.log` |
| `pnpm --filter @ccd/contracts build` | PASS | `../command-logs/m3-required-03-contracts-build.log` |
| `pnpm build:core` | PASS | `../command-logs/m3-required-04-build-core.log` |
| `pnpm ci:smoke:packages` | PASS | `../command-logs/m3-required-05-ci-smoke-packages.log` |
| `pnpm type-check` | PASS | `../command-logs/m3-required-06-type-check.log` |
| `pnpm lint:check` | FAIL_THEN_PASS | Initial `mise` trust shim failure: `../command-logs/m3-required-07-lint-check.log`; rerun with repo Node/pnpm path passed: `../command-logs/m3-required-07-lint-check-rerun-direct-node.log` |
| `pnpm test:run` | PASS | `../command-logs/m3-required-08-test-run.log` |
| `pnpm arch:boundaries` | PASS | `../command-logs/m3-required-09-arch-boundaries.log` |
| `pnpm arch:runtime` | PASS | `../command-logs/m3-required-10-arch-runtime.log` |
| `pnpm ai:guard -- --format=json` | PASS | `../command-logs/m3-required-11-ai-guard-json.log` |
| `pnpm drift-check` | PASS | `../command-logs/m3-required-12-drift-check.log` |
| `pnpm validate:governance` | FAIL_THEN_PASS | Initial generated sync failure: `../command-logs/m3-required-13-validate-governance.log`; generated diff evidence: `../command-logs/m3-generated-api-surface-diff-after-validate-governance.log`; rerun passed: `../command-logs/m3-required-13-validate-governance-rerun-after-api-surface-sync.log`; final clean env rerun passed: `../command-logs/m3-required-13-validate-governance-final-clean-env.log` |

`pnpm test:run` passed with 82 test files and 470 tests.

## Generated Evidence

- Generated files changed only in `docs/generated/api-surface-report.json` and `docs/generated/api-surface-report.md`.
- Owning command: `pnpm validate:governance -> pnpm governance:gate -> pnpm api:report -> node scripts/architecture/check-api-surface.mjs`.
- Generated status evidence: `../command-logs/m3-final-generated-status.log`.
- No generated graphs, generated registries, package manifests, lockfiles, or workspace manifests changed.

## Scope Guard

- Manifest/lockfile diff check was empty: `../command-logs/m3-final-manifest-diff-check.log`.
- Final response contract scan contains only the new precise names and guard self-reference: `../command-logs/m3-final-apiresponse-scan.log`.
- M3 did not modify `@ccd/vue-app-platform`; the conditional M3-only package validation for that package was not required.
- `@ccd/contracts` remains runtime-neutral; no Zod or runtime imports were added.

## Changed Files

- `packages/contracts/src/http/response.ts`
- `packages/contracts/src/http/index.ts`
- `packages/contracts/src/index.ts`
- `apps/web-demo/src/types/api.ts`
- `apps/web-demo/src/utils/http/types.ts`
- `apps/web-demo/src/api/example/users.ts`
- `apps/web-demo/src/api/example/users.spec.ts`
- `apps/web-demo/src/api/auth/auth.api.ts`
- `apps/web-demo/src/api/system/system.api.ts`
- `apps/web-demo/src/utils/http/requestLayer.spec.ts`
- `apps/web-demo/src/views/example/common/types.vue`
- `scripts/ai-architecture-guard.mjs`
- `docs/generated/api-surface-report.json`
- `docs/generated/api-surface-report.md`
- `ccd-public-layer-repair-plan-package/docs/ai-plan/STATUS.md`
- `ccd-public-layer-repair-plan-package/docs/ai-plan/DECISIONS.md`
- `ccd-public-layer-repair-plan-package/docs/ai-runs/20260602-165925-ccd-public-layer-repair/**`

## Notes

- The local `pnpm` shim initially failed because the isolated worktree `mise.toml` was not trusted. No global trust store was modified. Validation reruns used the repo-declared Node 24.11.1 path and, for the final clean governance run, process-local `MISE_TRUSTED_CONFIG_PATHS=$PWD/mise.toml`.
- M1/M2 accepted dirty baseline remains present and was not reverted.
