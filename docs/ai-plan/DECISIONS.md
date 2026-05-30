# CCD Architecture Decision Log

## Decision template

- Decision ID:
- Date:
- Status: `PROPOSED` | `APPROVED` | `REJECTED` | `SUPERSEDED` | `DEFERRED`
- Context:
- Options considered:
- Decision:
- Rationale:
- Trade-offs:
- Rejected alternatives:
- Risks:
- Follow-up validation:
- Evidence:

---

## ADR mapping

| Topic                                                   | ADR                                                            | Status     |
| ------------------------------------------------------- | -------------------------------------------------------------- | ---------- |
| Common platform layer terminology and extraction matrix | [ADR-005](../adr/ADR-005-common-platform-layer-terminology.md) | `PROPOSED` |
| Approval-gated architecture lanes                       | [ADR-006](../adr/ADR-006-approval-gated-architecture-lanes.md) | `PROPOSED` |

---

## D-001 — Planning docs location

- Status: `PROPOSED`
- Date: TBD

### Context

CCD root `AGENTS.md` is generated from `.ai/protocol/AI.entry.md`. Direct manual edits may make `ai:doctor` fail.

### Options considered

1. Directly edit root `AGENTS.md`.
2. Keep root `AGENTS.md` untouched and create `docs/ai-plan/AGENTS_DRAFT.md`.
3. Update `.ai/protocol/AI.entry.md` and regenerate `AGENTS.md`.

### Decision

Default to option 2. Option 3 requires explicit operator approval.

### Rationale

Avoid stale generated adapter drift.

### Trade-offs

Codex prompt must explicitly tell the agent to read `docs/ai-plan/**`.

### Follow-up validation

Run `pnpm ai:doctor` if `.ai/protocol/AI.entry.md` or `AGENTS.md` changes.

---

## D-002 — First implementation lane

- Status: `PROPOSED`
- Date: TBD

### Context

Remaining P1 areas include Bridge, ProTable, UI boundary, HTTP boundary, and guard coverage.

### Options considered

1. Capability Bridge generics.
2. ProTable typings.
3. UI boundary policy.
4. HTTP contract boundary.
5. Guard coverage.

### Decision

Start with Capability Bridge generics after baseline checkpoint.

### Rationale

Smallest blast radius and lowest coupling.

### Trade-offs

Does not immediately address larger UI/HTTP boundary risks.

### Follow-up validation

Focused shared-utils tests, type-check, and affected bridge tests.

---

## D-003 — UI boundary enforcement order

- Status: `APPROVED`
- Date: 2026-05-29

### Context

Direct PrimeVue imports exist across apps/packages. Guard enforcement before policy may create false positives. The approved enforcement model is an exact app allowlist: existing app import debt is grandfathered by file path, but new app direct PrimeVue imports must fail guard.

### Decision

Approved PrimeVue boundary:

- `packages/vue-primevue-adapter/**` may import PrimeVue theme/config/service/PT APIs and owns global adapter configuration helpers.
- App bootstrap files may import `primevue/config` only to install PrimeVue with `createPrimeVueAdapterConfig()` and `installPrimeVueServices()`.
- App build tooling may use the PrimeVue component resolver.
- App global shell files may import global PrimeVue surfaces such as Toast, ConfirmPopup, DynamicDialog, `useToast`, and `usePrimeVue` only while they own app-wide global UI behavior.
- `packages/vue-ui/**` may compose PrimeVue inside CCD-owned primitives, but must not re-export raw PrimeVue components as a loose bucket.
- App feature/example components may continue direct PrimeVue imports until wrappers or migration tasks exist; these are candidate migration surfaces, not current violations.
- Tests may mock PrimeVue modules used by the files under test.
- `scripts/ai-architecture-guard.mjs` enforces this with `primevue-direct-import-boundary` and `primevue-public-api-leak`.

Approved exact app allowlist:

- `apps/desktop/src/plugins/index.ts`
- `apps/web-demo/build/plugins.ts`
- `apps/web-demo/src/hooks/layout/useAdminBreadcrumbs.ts`
- `apps/web-demo/src/layouts/components/AppPrimeVueGlobals.vue`
- `apps/web-demo/src/layouts/components/admin/AdminSidebarMenuCollapsed.tsx`
- `apps/web-demo/src/layouts/components/admin/AdminSidebarMenuInline.tsx`
- `apps/web-demo/src/plugins/modules/primevue.ts`
- `apps/web-demo/src/router/utils/helper.ts`
- `apps/web-demo/src/types/components.d.ts`
- `apps/web-demo/src/views/dashboard/index.vue`
- `apps/web-demo/src/views/example/components/primevue-collection/overview/index.vue`
- `apps/web-demo/src/views/example/components/primevue-collection/prime-dialog/index.vue`
- `apps/web-demo/src/views/example/components/primevue-collection/pro-form/advanced/index.vue`
- `apps/web-demo/src/views/example/components/primevue-collection/pro-form/plugins/components/ColorPickerField.tsx`
- `apps/web-demo/src/views/example/components/primevue-collection/pro-form/plugins/components/MyColorCustomInput.tsx`
- `apps/web-demo/src/views/example/components/primevue-collection/pro-table/advanced/configs/columns.tsx`
- `apps/web-demo/src/views/example/components/primevue-collection/pro-table/advanced/index.vue`
- `apps/web-demo/src/views/example/components/primevue-collection/pro-table/columns/columns.tsx`
- `apps/web-demo/src/views/example/components/primevue-collection/pro-table/form-table-combo/components/TablePanel.vue`
- `apps/web-demo/src/views/example/components/primevue-collection/pro-table/server/columns.tsx`
- `apps/web-demo/src/views/example/hooks/layout-breadcrumbs.vue`
- `apps/web-demo/src/views/example/hooks/use-app-element-size.vue`
- `apps/web-demo/src/views/example/system-configuration/layout.vue`

Current decision: exact allowlist guard is approved and enabled. New app direct imports from `primevue/*` or `@primevue/*` must either migrate behind `@ccd/vue-ui` / `@ccd/vue-primevue-adapter` or receive a future owner-approved allowlist update.

### Rationale

The current direct import surface is broad and includes valid bootstrap, adapter, generated typing, global shell, package primitive, demo, and test cases. Exact allowlisting prevents new PrimeVue leakage without requiring a same-lane component migration.

### Follow-up validation

Guard validation, governance gate, API report, and focused package builds:

- `pnpm ai:guard -- --format=json`
- `pnpm governance:gate`
- `pnpm ai:doctor`
- `pnpm api:report`
- `pnpm --filter @ccd/vue-ui build`
- `pnpm --filter @ccd/vue-primevue-adapter build`

### Evidence

- `docs/ai-runs/20260529-070550-ccd-architecture-repair/reports/M4-T1-primevue-import-audit.md`
- `docs/ai-runs/20260529-070550-ccd-architecture-repair/command-logs/M4-T1-20260529-074704-primevue-import-audit.log`

---

## D-004 — HTTP contract migration order

- Status: `PROPOSED`
- Date: 2026-05-29

### Context

HTTP app layer contains alova, retry, cache, auth bridge, Zod validation, raw fetch exceptions, and UI notifications.

### Decision

Inventory first; contract proposal second; implementation only after runtime-neutral proof and operator approval.

Proposed HTTP boundary:

- Keep alova as the high-level request toolkit.
- Keep current app HTTP infrastructure under `apps/web-demo/src/utils/http/**` unless the owner approves a broad move to `apps/web-demo/src/adapters/http/**`; existing rules already name `@/utils/http/**` as the canonical infrastructure path.
- Keep Zod payload validation at app HTTP/API boundaries through `apps/web-demo/src/adapters/http.adapter.ts` and `responseSchema`.
- Do not add `packages/contracts/src/http/**` without explicit operator approval.
- Do not add `packages/core/src/http/**` unless a runtime-neutral orchestration need is proven.
- Preserve auth/router/store decoupling through `@/infra/auth/tokenProvider` and do not import Pinia/router into HTTP infrastructure.
- Preserve documented raw transport exceptions. Current inventory adds `utils/http/connection.ts#performHealthCheck` as an infrastructure exception candidate because it sits below the alova instance and cannot import `methods.ts` without a cycle.

### Follow-up validation

`pnpm arch:runtime`, `pnpm api:report`, type-check, request-layer tests, and owner review before contracts/core path creation.

### Evidence

- `docs/ai-runs/20260529-070550-ccd-architecture-repair/reports/M5-T1-http-boundary-inventory.md`
- `docs/ai-runs/20260529-070550-ccd-architecture-repair/command-logs/M5-T1-20260529-075115-http-boundary-inventory.log`

---

## D-014 — HTTP-001 contract shape owner decision

- Status: `APPROVED`
- Date: 2026-05-30

### Context

HTTP-001 was blocked because `packages/contracts/src/http/**` needed an owner-approved shape before any contract files could be added. Current evidence shows:

- `packages/contracts/src/network.ts` already provides a low-level runtime-neutral `NetworkClient`, `NetworkRequest`, and `NetworkResponse`.
- `packages/core/src/index.ts` only proxies the injected network adapter and has no proven need for HTTP orchestration.
- `apps/web-demo/src/utils/http/**` owns the current alova implementation, retry/cache/deduplication/timeout behavior, raw transport exceptions, and auth bridge wiring.
- `apps/web-demo/src/adapters/http.adapter.ts` owns Zod payload parsing and backend route payload validation.

### Decision

HTTP-001 is approved for a future implementation lane with strict type-only scope:

- `packages/contracts/src/http/**` may be created only for runtime-neutral TypeScript types and interfaces.
- Allowed shapes: request method/headers/query/body contracts, request config, response envelope, error shape, retry policy, timeout policy, auth policy, and transport client/request/response interfaces.
- `packages/contracts/src/network.ts` remains the low-level network contract; future HTTP contracts may reference it through type-only imports if that keeps the public surface smaller.
- `packages/core/src/http/**` remains blocked. Core must not gain HTTP orchestration until multiple runtimes need shared retry/timeout/auth behavior and the behavior can be expressed without runtime APIs.
- `apps/web-demo/src/utils/http/**` remains the canonical app HTTP infrastructure path for now. No move to `apps/web-demo/src/adapters/http/**` is approved in this decision.
- This decision does not approve HTTP runtime migration, alova replacement/upgrade, auth-flow changes, request behavior changes, dependency changes, or generated governance edits.

### Forbidden

Future `packages/contracts/src/http/**` files must not import or encode:

- browser/runtime APIs such as `fetch`, `Request`, `Response`, `Headers`, `AbortSignal`, `Blob`, `File`, `FormData`, `DOMException`, `window`, `document`, timers, or storage;
- app/runtime libraries such as alova, Vue, Pinia, Vue Router, Zod type/runtime imports, i18n, notification, logger adapters, or `@/` app aliases;
- concrete token refresh behavior, 401/logout UX, offline-session policy, default retry timers, cache implementations, upload/download helpers, or UI error presentation;
- classes, executable helpers, side effects, default runtime instances, or dependency additions.

HTTP-007 remains separate and was product-blocked before D-015. Auth policy contracts may define type shape only and must follow the D-015 product decision without adding runtime behavior in contracts.

### Follow-up validation

For the future contracts-only implementation lane, minimum validation is:

- `pnpm --filter @ccd/contracts build`
- `pnpm build:core`
- `pnpm api:report`
- `pnpm arch:runtime`
- `pnpm ai:doctor`
- `pnpm codex:preflight`
- `pnpm validate:governance`
- `git diff --check`
- `git status --short --untracked-files=all`

If any app code consumes the new contracts, also run:

- `pnpm --filter @ccd/web-demo type-check`
- `pnpm exec vitest run apps/web-demo/src/adapters/http.adapter.spec.ts apps/web-demo/src/utils/http`
- `pnpm test:run` if runtime behavior changes.

### Evidence

- `docs/ai-runs/20260529-070550-ccd-architecture-repair/reports/M5-T1-http-boundary-inventory.md`
- `docs/ai-runs/20260530-162440-ccd-http-001-decision/reports/HTTP-001-owner-decision.md`

---

## D-015 — HTTP-007 restore login retry and offline policy

- Status: `APPROVED`
- Date: 2026-05-30

### Context

HTTP-007 was blocked because `restoreLoginFromToken()` did not have a product-approved failure policy for invalid tokens, transient server/network failures, timeouts, retry exhaustion, and offline behavior.

Current evidence shows:

- `apps/web-demo/src/hooks/modules/useAuth.ts` currently calls `requestAuthCurrentUser(userStore.token)` and clears user info for any thrown error.
- `apps/web-demo/src/router/utils/permission.ts` also validates persisted sessions through `requestAuthCurrentUser()` and clears user info for any validation failure.
- `apps/web-demo/src/utils/http/**` already classifies 401/403 as `AUTH`, 5xx as retryable server errors, and network/timeout errors as retryable HTTP errors.
- Existing E2E coverage verifies hard refresh rehydration, invalid persisted token redirect, delayed storage reads, logout redirect, and multi-tab logout convergence.
- There is no approved offline read-only product mode, and no E2E coverage for offline restore behavior.

### Decision

HTTP-007 is approved for a future implementation lane with this product policy:

- 401, token-expired, invalid-token, missing-token, and other explicit token-authentication failures are terminal. Do not retry. Immediately clear the authenticated session through the existing auth/logout boundary and let the router guard redirect to `/login?redirect=...`.
- 403 permission failures are not retryable and are not treated as token-expired logout events. Preserve existing business/route error handling for insufficient permission.
- 5xx, network, and timeout failures during the current-user restore request are transient. Retry only the idempotent current-user restore request, not login mutations or other non-idempotent requests.
- Retry budget is three retries after the initial restore attempt. Retry delays use exponential backoff: 1000 ms, 2000 ms, and 4000 ms. Retrying must stop immediately if a later error becomes a terminal token-authentication failure or a 403 permission failure.
- Each restore attempt has a 5000 ms timeout. The future implementation may use the existing HTTP timeout surface, but this decision does not change `HTTP_CONFIG.timeout`.
- Retry exhaustion fails closed. Clear the untrusted session, redirect to login, and show the approved session-verification failure message. The app must not enter protected routes or show protected data when the session cannot be verified.
- Offline read-only mode is not approved. Offline startup with a persisted token must not grant dashboard, route, store, or cached-data access unless a separate future product/security decision approves a constrained read-only model.
- User messaging must be single-shot and non-sensitive: auth failures show a session-expired/sign-in-again message; retry exhaustion shows a connection/server validation failure message with a sign-in-again or retry action. Do not show one toast per retry attempt and do not duplicate interceptor-level notifications.
- This decision does not approve runtime auth behavior changes, dependency changes, Vite changes, Login Diorama work, P4 work, generated governance edits, or HTTP migration code changes.

### Required Future Tests

Minimum unit coverage for the future implementation lane:

- `restoreLoginFromToken()` returns `null` without API calls when auth is disabled or no token exists.
- invalid token, token-expired, missing-token, and 401 errors clear the session immediately, do not retry, and emit only the approved terminal user message.
- 403 permission errors do not retry and continue through the existing business/route error handling path instead of the token-expired logout path.
- 5xx, network, and timeout errors retry according to the three-retry budget and stop on success.
- A retry sequence that changes from transient failure to 401 stops retrying and performs the terminal auth failure path.
- A retry sequence that changes from transient failure to 403 stops retrying and performs the existing permission/business error path.
- Retry exhaustion fails closed and does not leave protected route/store state active.
- Non-retryable client, validation, security, and abort errors do not use the transient retry policy.
- User messaging is single-shot across retry attempts.

Minimum E2E coverage for the future implementation lane:

- Existing invalid persisted token redirect remains covered and passing.
- Persisted valid token plus transient current-user 5xx failure that succeeds on retry restores the dashboard without a blank shell.
- Persisted valid token plus network retry exhaustion clears the untrusted session, redirects to login, shows the approved single-shot message, and shows no protected content.
- Persisted valid token plus current-user timeout uses the approved 5000 ms per-attempt timeout policy.
- User messaging remains single-shot for invalid token, retry success after transient failure, retry exhaustion, and timeout scenarios.
- Browser offline at startup with a persisted token does not enter dashboard or expose protected route data.
- After transient recovery, manual sign-in or approved retry action can restore normal authenticated navigation.

### Evidence

- `.ai/runtime/owner_decisions.md`
- `docs/ai-plan/STATUS.md`
- `ccd-architecture-optimization-plan/ledgers/issue-ledger.md`
- `ccd-architecture-optimization-plan/ledgers/task-ledger.md`
- `ccd-architecture-optimization-plan/modules/04-http-contract-boundary/README.md`
- `ccd-architecture-optimization-plan/modules/04-http-contract-boundary/issues.md`
- `apps/web-demo/src/hooks/modules/useAuth.ts`
- `apps/web-demo/src/router/utils/permission.ts`
- `apps/web-demo/src/api/auth/auth.api.ts`
- `apps/web-demo/src/infra/auth/tokenProvider.ts`
- `apps/web-demo/src/utils/http/**`
- `e2e/qa-regression.spec.ts`
- `docs/ai-runs/20260530-173553-ccd-http-007-product-decision/reports/HTTP-007-product-decision.md`

---

## D-005 — Vite 8 lane isolation

- Status: `PROPOSED`
- Date: TBD

### Context

Vite 8/Rolldown/Oxc migration affects build configuration assumptions and must not mix with UI, HTTP, or dependency modernization.

### Decision

Vite 8 work must use an isolated worktree/branch and cannot mix with UI/HTTP/dependency lanes.

### Follow-up validation

`pnpm build:ci`, `pnpm vercel:build`, `pnpm e2e:qa`, bundle budget checks.

---

## D-006 — Dependency modernization policy

- Status: `PROPOSED`
- Date: 2026-05-29

### Context

Dependency updates are high risk and version-specific.

### Decision

One dependency lane at a time; no blind latest upgrade; cite official changelog/migration docs.

### Follow-up validation

Targeted checks, then full baseline or `pnpm validate`.

### Evidence

- `docs/ai-runs/20260529-070550-ccd-architecture-repair/reports/M7-governance-github.md`

---

## D-007 — P4 strategic deferral

- Status: `PROPOSED`
- Date: TBD

### Context

New organization, starter extraction, standalone design-system split, Reka UI, TanStack Query, and desktop drift CI are strategic work items.

### Decision

Keep P4 items deferred unless prerequisites are stable and operator explicitly approves.

### Follow-up validation

Human review and updated `NEXT_ACTIONS.md`.

---

## D-008 — GitHub repository governance posture

- Status: `PROPOSED`
- Date: 2026-05-29

### Context

M7 inventory found local GitHub governance files already present:

- `.github/CODEOWNERS`
- `.github/PULL_REQUEST_TEMPLATE.md`
- `.github/ISSUE_TEMPLATE/bug_report.md`
- `.github/ISSUE_TEMPLATE/feature_request.md`
- `.github/workflows/ci.yml`
- `.github/workflows/deploy.yml`

Remote branch-protection settings cannot be inspected or changed without external GitHub access and explicit operator approval.

### Decision

Document local governance as the current source of evidence. Do not change remote branch protection, push settings, or `.github/**` files in this run.

Recommended main-branch protection:

- require pull requests before merge;
- require conversation resolution;
- require linear history if the team wants rebase/squash-only history;
- require `Core Quality` and `E2E QA` CI jobs from `.github/workflows/ci.yml`;
- treat `validate:governance` as the required governance gate because it maps to `pnpm governance:gate`;
- keep generated AI artifact sync check required in CI.

Local `.github` follow-up candidates:

- expand `CODEOWNERS` for all public/internal packages beyond `packages/contracts` and `packages/core`;
- add PR checklist sections for architecture boundary changes, UI visual changes, dependency lanes, and generated artifact drift;
- add dependency update policy automation only after owner approval.

### Rationale

Local governance evidence is strong enough to document, but remote branch protection and `.github/**` edits are approval-gated by the execution protocol.

### Follow-up validation

`pnpm governance:github-workflows`, `pnpm governance:gate`, and owner review before any remote or `.github/**` mutation.

### Evidence

- `docs/ai-runs/20260529-070550-ccd-architecture-repair/command-logs/M7-T1-20260529-075728-governance-github-inventory.log`
- `docs/ai-runs/20260529-070550-ccd-architecture-repair/reports/M7-governance-github.md`

---

## D-009 — Common platform layer terminology

- Status: `PROPOSED`
- Date: 2026-05-29
- ADR: [ADR-005](../adr/ADR-005-common-platform-layer-terminology.md)

### Decision

Use `common platform layer` for the governed `packages/*` package set. Do not use `common core layer` to imply that shared code belongs in `packages/core`.

`packages/core` remains a minimal runtime-neutral orchestration/facade package and may depend only on `@ccd/contracts`.

### Follow-up validation

`pnpm docs:commands`, `pnpm arch:runtime`, `pnpm arch:boundaries`, and `pnpm api:report`.

---

## D-010 — Approval-gated architecture lanes

- Status: `PROPOSED`
- Date: 2026-05-29
- ADR: [ADR-006](../adr/ADR-006-approval-gated-architecture-lanes.md)

### Decision

UI boundary enforcement, HTTP contracts/core paths, guard strictness expansion, GitHub remote governance, Vite major migration, and dependency modernization require explicit owner/operator approval before implementation.

Without approval, the default action is audit/document only and keep implementation blocked/deferred.

### Follow-up validation

`pnpm docs:commands`, `pnpm ai:doctor`, and the lane-specific validation listed in the approval record.

---

## D-011 — P2 PrimeVue showcase exception scope

- Status: `APPROVED`
- Date: 2026-05-30

### Context

P1 approved exact allowlisting for existing app direct PrimeVue imports. P2 UI-005 found the `apps/web-demo/src/views/example/components/primevue-collection/**` showcase area is intentionally PrimeVue-facing and should not require one-off exact allowlist edits for every example file.

### Decision

`apps/web-demo/src/views/example/components/primevue-collection/**` is an approved showcase exception for direct `primevue/*` and `@primevue/*` imports.

All other app files remain governed by the exact allowlist in `scripts/ai-architecture-guard.mjs`. New non-showcase app direct PrimeVue imports must either migrate behind `@ccd/vue-ui` / `@ccd/vue-primevue-adapter` or receive a future owner-approved allowlist update.

### Rationale

This keeps the example collection inspectable as a PrimeVue showcase while preventing the exception from becoming a general app-domain escape hatch.

### Follow-up validation

`pnpm ai:guard`, `pnpm arch:boundaries`, and focused UI smoke.

### Evidence

- `docs/ai-runs/20260530-104228-ccd-p2-governance-css-build-modernization/`

---

## D-012 — P2 broad package split remains blocked

- Status: `DEFERRED`
- Date: 2026-05-30

### Context

COMP-005 proposes a future `packages/vue-pro-components` split if ProForm/ProTable growth would overload `packages/vue-ui`. The current task explicitly forbids broad rewrites without approval.

### Decision

Do not create `packages/vue-pro-components` in the P2 governance/css/build modernization lane. Treat COMP-005 as `BLOCKED_BY_OWNER` until an owner approves package topology, migration scope, export policy, and validation budget.

### Rationale

Adding a new workspace package would alter package topology, API reporting, internal prepare order, and migration scope. That is a separate package-boundary lane, not a low-risk P2 cleanup.

### Follow-up validation

When approved: `pnpm ci:prepare-internal`, `pnpm arch:graphs`, `pnpm api:report`, package build, web-demo type-check, and relevant ProForm/ProTable tests.

### Evidence

- `ccd-architecture-optimization-plan/plans/02-P2-governance-css-build-modernization.md`
- `.ai/runtime/owner_decisions.md`

---

## D-013 — P3 execution boundary

- Status: `ACTIVE`
- Date: 2026-05-30

### Context

The active P3 request asked Codex to execute every implementable P3 item while keeping dependency upgrades, auth/product decisions, Vite 8, GitHub remote governance, broad rewrites, and P4 work blocked unless explicit approval exists.

### Decision

No P3 source lane is currently implementable without approval. Keep these statuses:

- `DEPS-004` remains `BLOCKED_BY_REVIEW`; do not upgrade PrimeVue or mutate package manifests/lockfile.
- `DEPS-005` remains `BLOCKED_BY_HTTP_CONTRACT`; do not upgrade alova or restructure HTTP contracts.
- `DOC-003` and runtime-ledger `P3-Login-*` remain deferred/blocked pending M11 product/owner approval and prerequisite stability.

### Follow-up validation

Run the P3 final validation matrix and preserve the active run evidence directory.

### Evidence

- `docs/ai-runs/20260530-114939-ccd-p3-feature-and-runtime-refactors/command-logs/M0-20260530-114939-pnpm-ai-doctor-open.log`
- `docs/ai-runs/20260530-114939-ccd-p3-feature-and-runtime-refactors/command-logs/M0-20260530-114939-p3-actionable-scan.log`
