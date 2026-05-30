# HTTP-007 Runtime Tests-First Report

## Scope

- Lane: HTTP-007 runtime implementation tests-first.
- Target: `restoreLoginFromToken()` retry, timeout, terminal auth, 403, fail-closed, and user-message policy.
- Out of scope and untouched: dependencies, Vite, GitHub remote, `.github/**`, P4, `packages/core/src/http/**`, app HTTP migration, Login Diorama.

## Tests Added

- `apps/web-demo/src/hooks/modules/useAuth.spec.ts`
  - missing token clears stale login state without API calls
  - invalid token does not retry and clears session
  - 403 does not retry or perform token-expired logout
  - transient 5xx retries and succeeds
  - transient retry stops on later 401
  - network retry exhaustion fails closed with one non-sensitive message
  - timeout exhaustion uses 5000 ms per attempt and fails closed
  - offline read-only startup remains blocked by clearing unverified protected state

## Implementation

- `apps/web-demo/src/hooks/modules/useAuth.ts`
  - Adds HTTP-007 restore policy: 5000 ms per attempt, retry delays 1000/2000/4000 ms, transient-only retries, 401/auth-code fail-closed, 403 passthrough, single-shot non-sensitive user notification.
  - Uses VueUse `useTimeoutFn` to satisfy the timer guard.
- `apps/web-demo/src/router/utils/permission.ts`
  - Reuses `restoreLoginFromToken()` for protected-route persisted-session validation, so route refresh follows the same retry/timeout/fail-closed policy.
  - Keeps 403 permission failures on the forbidden route path instead of token-expired logout.
- `apps/web-demo/src/locales/lang/core/en-US.ts`
- `apps/web-demo/src/locales/lang/core/zh-CN.ts`
  - Adds session verification copy.
- `apps/web-demo/src/types/auto-imports.d.ts`
  - Tool-generated auto-import declaration formatting update from validation/type-check flow.

## Validation Evidence

- Red test: `command-logs/02-red-useAuth-spec-isolated.log` failed as expected before implementation.
- Focused auth tests: `command-logs/26-focused-auth-tests-after-router-policy.log` passed, 4 files / 31 tests.
- Final required validation logs:
  - `27-pnpm-filter-web-demo-type-check-after-router-policy.log`
  - `28-pnpm-test-run-after-router-policy.log`
  - `29-pnpm-e2e-smoke-after-router-policy.log`
  - `30-pnpm-e2e-qa-prepared-after-router-policy.log`
  - `31-pnpm-validate-governance-after-router-policy.log`
  - `32-pnpm-type-check-after-router-policy.log`
  - `33-pnpm-docs-commands-after-router-policy.log`
  - `34-pnpm-ai-doctor-after-router-policy.log`
  - `35-pnpm-codex-preflight-after-router-policy.log`

## Residual Risks

- `apps/web-demo/src/types/auto-imports.d.ts` changed only through the generated auto-import output path during validation.
