# HTTP-007 Product Decision

## Scope

- Lane: HTTP-007 product decision-only.
- Baseline requested: `main` at `de55e2e0`, HTTP-001 sealed, CI Guardian `26680102162` PASS.
- Runtime implementation: not performed.
- Auth runtime behavior: not changed.
- Dependencies, Vite, GitHub remote, Login Diorama, P4, generated governance files, and HTTP migration code: not touched.

## Evidence Reviewed

- `.ai/runtime/owner_decisions.md`
- `docs/ai-plan/DECISIONS.md`
- `docs/ai-plan/STATUS.md`
- `ccd-architecture-optimization-plan/ledgers/issue-ledger.md`
- `ccd-architecture-optimization-plan/ledgers/task-ledger.md`
- `ccd-architecture-optimization-plan/modules/04-http-contract-boundary/README.md`
- `ccd-architecture-optimization-plan/modules/04-http-contract-boundary/issues.md`
- `apps/web-demo/src/hooks/modules/useAuth.ts`
- `apps/web-demo/src/router/utils/permission.ts`
- `apps/web-demo/src/api/auth/auth.api.ts`
- `apps/web-demo/src/infra/auth/tokenProvider.ts`
- `apps/web-demo/src/infra/auth/tokenProvider.spec.ts`
- `apps/web-demo/src/plugins/modules/authBridge.ts`
- `apps/web-demo/src/stores/modules/session/user.ts`
- `apps/web-demo/src/constants/http.ts`
- `apps/web-demo/src/utils/http/errors.ts`
- `apps/web-demo/src/utils/http/instance.ts`
- `apps/web-demo/src/utils/http/interceptors.ts`
- `apps/web-demo/src/utils/http/methods.ts`
- `apps/web-demo/src/utils/http/connection.ts`
- `apps/web-demo/src/utils/http/policies/authRefreshPolicy.ts`
- `apps/web-demo/src/utils/http/policies/errorMappingPolicy.ts`
- `apps/web-demo/src/utils/http/policies/notificationPolicy.ts`
- `apps/web-demo/src/utils/http/policies/httpPolicies.spec.ts`
- `apps/web-demo/src/utils/http/interceptors.spec.ts`
- `apps/web-demo/src/hooks/modules/useHttpRequest.ts`
- `apps/web-demo/src/hooks/modules/useHttpRequest.spec.ts`
- `e2e/helpers/app.ts`
- `e2e/helpers/authState.ts`
- `e2e/global-setup.ts`
- `e2e/qa-regression.spec.ts`

## Product Decision

HTTP-007 is approved for a future implementation lane with a fail-closed restore-login policy.

### 401 Immediate Logout

401, token-expired, invalid-token, missing-token, and explicit token-authentication failures are terminal. The future implementation must not retry them. It must clear the authenticated session through the existing auth/logout boundary and let the router guard redirect to `/login?redirect=...`.

### 403 Permission Handling

403 permission failures are not retryable and are not treated as token-expired logout events. Preserve existing business/route error handling for insufficient permission.

### 5xx And Network Retry Policy

5xx, network, and timeout failures during `requestAuthCurrentUser()` are transient only for the idempotent current-user restore request. The approved retry budget is three retries after the initial restore attempt. Backoff is exponential: 1000 ms, 2000 ms, and 4000 ms. Retry must stop immediately if a later error becomes terminal token-authentication failure or 403 permission failure.

### Timeout Policy

Each restore attempt has a 5000 ms timeout. This decision does not change `HTTP_CONFIG.timeout`; the future implementation must introduce the behavior in a scoped auth-restore lane.

### Retry Exhausted Behavior

Retry exhaustion fails closed. Clear the untrusted session, redirect to login, and show the approved session-verification failure message. The app must not enter protected routes, reuse protected store state, or expose cached protected data when the session cannot be verified.

### User Messaging

Messaging must be single-shot and non-sensitive:

- Auth failure: session expired or sign in again.
- Permission failure: preserve existing insufficient-permission business/route handling.
- Retry exhaustion: unable to verify session because the service or network is unavailable.
- No per-retry toast spam.
- No duplicate interceptor-level and business-level error notifications.

### Offline Read-Only Mode

Offline read-only mode remains blocked. A persisted token plus offline startup must not grant dashboard, route, store, or cached-data access. A future read-only mode would require a separate product/security decision.

## Required Future Tests

Minimum unit tests:

- `restoreLoginFromToken()` returns `null` without API calls when auth is disabled or no token exists.
- Invalid token, token-expired, missing-token, and 401 errors clear the session immediately, do not retry, and emit only the approved terminal user message.
- 403 permission errors do not retry and continue through the existing business/route error handling path instead of the token-expired logout path.
- 5xx, network, and timeout errors retry according to the three-retry budget and stop on success.
- A retry sequence that changes from transient failure to 401 stops retrying and performs the terminal auth failure path.
- A retry sequence that changes from transient failure to 403 stops retrying and performs the existing permission/business error path.
- Retry exhaustion fails closed and does not leave protected route/store state active.
- Non-retryable client, validation, security, and abort errors do not use the transient retry policy.
- User messaging is single-shot across retry attempts.

Minimum E2E tests:

- Existing invalid persisted token redirect remains covered and passing.
- Persisted valid token plus transient current-user 5xx failure that succeeds on retry restores the dashboard without a blank shell.
- Persisted valid token plus network retry exhaustion clears the untrusted session, redirects to login, shows the approved single-shot message, and shows no protected content.
- Persisted valid token plus current-user timeout uses the approved 5000 ms per-attempt timeout policy.
- User messaging remains single-shot for invalid token, retry success after transient failure, retry exhaustion, and timeout scenarios.
- Browser offline at startup with a persisted token does not enter dashboard or expose protected route data.
- After transient recovery, manual sign-in or approved retry action can restore normal authenticated navigation.

## Decision Lane Validation

| Command | Result | Evidence |
| --- | --- | --- |
| `pnpm docs:commands` | PASS | `docs/ai-runs/20260530-173553-ccd-http-007-product-decision/command-logs/pnpm-docs-commands.log` |
| `pnpm ai:doctor` | PASS | `docs/ai-runs/20260530-173553-ccd-http-007-product-decision/command-logs/pnpm-ai-doctor.log` |
| `pnpm codex:preflight` | PASS | `docs/ai-runs/20260530-173553-ccd-http-007-product-decision/command-logs/pnpm-codex-preflight.log` |
| `pnpm validate:governance` | PASS | `docs/ai-runs/20260530-173553-ccd-http-007-product-decision/command-logs/pnpm-validate-governance.log` |
| `git diff --check` | PASS | `docs/ai-runs/20260530-173553-ccd-http-007-product-decision/command-logs/git-diff-check.log` |
| `git status --short --untracked-files=all` | PASS, expected decision docs and evidence only | `docs/ai-runs/20260530-173553-ccd-http-007-product-decision/command-logs/git-status-short-untracked.log` |

## Residual Blockers

- HTTP-007 implementation is not started.
- Offline read-only mode remains blocked.
- HTTP AuthPolicy contracts may encode the approved shape in a future lane, but must not add runtime behavior in `packages/contracts`.
