# CCD Request-Layer Tests Expansion

## Scope

- Added focused request-layer tests under `apps/web-demo/src/utils/http/**`.
- Runtime HTTP behavior, package manifests, lockfile, Vite, GitHub remote, `.github/**`, P4, Login Diorama, `packages/core/src/http/**`, and UI/runtime surfaces were not changed.
- Evidence reviewed: `packages/contracts/src/http/**`, `apps/web-demo/src/utils/http/**`, `apps/web-demo/src/adapters/http.adapter.ts`, `apps/web-demo/src/api/**`, HTTP-001 evidence, and HTTP-007 evidence.

## Tests Added

- `apps/web-demo/src/utils/http/requestLayer.spec.ts`
  - Request config mapping strips request-manager fields and preserves Alova boundary fields.
  - Response unwrap validates `success: true` data before exposing it.
  - Schema validation stops invalid unwrapped payloads at the HTTP boundary.
  - Error mapping covers 403 non-retry auth classification and 503 retryable server classification.
  - Retry policy covers retryable network failures and non-transient retry exclusions.
  - Deduplication covers identical in-flight GET requests.
  - Cancellation covers `cancelPrevious` abort signaling.
  - Auth header behavior is driven through the token-provider bridge.
  - Source coupling scan covers HTTP, adapter, and API files for router/store/session-storage imports.

## Validation

| Command | Result | Evidence |
| --- | --- | --- |
| `pnpm exec vitest run apps/web-demo/src/utils/http` | PASS, 4 files / 34 tests | `command-logs/15-request-layer-focused-vitest-final.log` |
| `pnpm --filter @ccd/web-demo type-check` | PASS | `command-logs/16-web-demo-type-check-final.log` |
| `pnpm test:run` | PASS, 74 files / 429 tests | `command-logs/17-pnpm-test-run-final.log` |
| `pnpm validate:governance` | PASS | `command-logs/24-pnpm-validate-governance-after-report.log` |
| `pnpm type-check` | PASS, 22 tasks | `command-logs/19-pnpm-type-check-final.log` |
| `pnpm docs:commands` | PASS | `command-logs/23-pnpm-docs-commands-after-report.log` |
| `pnpm ai:doctor` | PASS | `command-logs/25-pnpm-ai-doctor-after-report.log` |
| `pnpm codex:preflight` | PASS | `command-logs/26-pnpm-codex-preflight-after-report.log` |
| `git diff --check` | PASS | `command-logs/27-git-diff-check-final.log` |
| `git status --short --untracked-files=all` | PASS, expected untracked test and evidence files | `command-logs/28-git-status-short-untracked-final.log` |
| `pnpm exec eslint apps/web-demo/src/utils/http/requestLayer.spec.ts` | PASS | `command-logs/14-eslint-request-layer-new-spec-rerun.log` |

## Notes

- Intermediate red logs are retained: `01-request-layer-new-spec.log` captured timing-sensitive test failures fixed in the spec, and `13-eslint-request-layer-new-spec.log` captured naming violations fixed before final validation.
- HTTP-007 runtime implementation remains outside this lane; offline read-only mode remains blocked by product decision.
