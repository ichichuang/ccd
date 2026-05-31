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
- `apps/web-demo/src/views/example/hooks/layout-breadcrumbs.vue`
- `apps/web-demo/src/views/example/hooks/use-app-element-size.vue`
- `apps/web-demo/src/views/example/system-configuration/layout.vue`

Current decision: exact allowlist guard is approved and enabled. New app direct imports from `primevue/*` or `@primevue/*` must either migrate behind `@ccd/vue-ui` / `@ccd/vue-primevue-adapter` or receive a future owner-approved allowlist update.

D-011 replaces the former per-file `apps/web-demo/src/views/example/components/primevue-collection/**` exact entries with a path-scoped showcase exception.

M4 classification update (2026-05-31):

- PrimeVue direct import inventory found 163 source import rows across apps/packages; all are currently allowed by the existing package/internal, adapter, exact allowlist, generated typing, or showcase policy.
- `C-06` remains `OPEN` because app direct imports still depend on exact allowlists and the `apps/web-demo/src/views/example/components/primevue-collection/**` showcase exception.
- `apps/web-demo/src/hooks/modules/useProTableUrlSync.ts` and `apps/web-demo/src/plugins/modules/protable.ts` are classified as app-local ProTable URL-sync compatibility surfaces (`B-12`); router coupling stays in the app and is injected into `@ccd/vue-ui`.
- App-local classification does not approve indefinite app ownership. M5 owns safeStorage/theme/size/device cleanup planning.
- Evidence: `docs/ai-runs/20260531-104447-ccd-m4-primevue-app-local-classification/reports/`.

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

## D-016 — B-07 safeStorage crypto owner decision

- Status: `APPROVED`
- Date: 2026-05-31
- Approved option: **Option A** — keep crypto/HMAC/obfuscation/Web Crypto implementation app-owned under `apps/web-demo/src/utils/safeStorage/crypto.ts`
- Approved date: 2026-06-01

### Context

`apps/web-demo/src/utils/safeStorage/crypto.ts` owns AES/HMAC behavior, Web Crypto fallback, `crypto-es`, and app logger coupling. M5 marked `B-07` as `BLOCKED` because moving this implementation into `packages/core`, `packages/contracts`, or a shared package without an owner decision would blur runtime and security boundaries.

### Options considered

1. Keep crypto/HMAC/obfuscation app-owned; move only pure JSON/storage serialization helpers later.
2. Define crypto/storage capability interfaces in `@ccd/contracts` and keep browser crypto implementation in app adapters.
3. Move runtime-neutral crypto orchestration into `@ccd/core` only if it depends solely on injected contracts and proves multi-runtime value.
4. Move deterministic pure helper code to `@ccd/shared-utils` only when it has no browser globals, app logger, `import.meta.env`, storage globals, or runtime side effects.
5. Defer all safeStorage crypto movement and extract non-crypto codec helpers first.

### Decision

**Owner-approved (2026-06-01, P1 lane): Option A.**

Crypto/HMAC/obfuscation/Web Crypto implementation remains permanently app-owned under `apps/web-demo/src/utils/safeStorage/crypto.ts` and app adapters. Pure JSON codec helpers remain in `@ccd/shared-utils` (already established by M7). Compression remains app-owned per D-019 (B-08 Option A).

This approval does not authorize moving Web Crypto/fallback implementation into `packages/contracts`, `packages/core`, or `@ccd/shared-utils`, and does not authorize package manifest, lockfile, or persisted-format changes for crypto behavior.

### Rationale

The non-crypto codec/compression work can reduce app-local residue without touching security-sensitive runtime behavior. `packages/contracts` may hold type-only shapes only after an approved API need exists. `packages/core` has no proven crypto orchestration need.

### Rejected alternatives

- Option 2 is rejected as an immediate lane because current app code can proceed without new crypto contracts.
- Option 3 is rejected now because `packages/core` must remain a minimal runtime-neutral facade and no multi-runtime orchestration value is proven.
- Option 4 is accepted only for deterministic pure helpers, not for crypto/HMAC/Web Crypto behavior.

### Risks

- Persisted storage payload compatibility can regress if codec boundaries change without fixtures.
- Client-visible obfuscation can be overstated as real secret management.
- Leaving crypto app-owned keeps `B-07` blocked until the owner records the final ownership decision.

### Follow-up validation

Minimum validation for any future storage lane:

- focused safeStorage round-trip and key-rotation tests
- HMAC failure tests that do not leak secret/ciphertext
- Pinia serializer compatibility tests
- ProForm draft storage tests
- `pnpm --filter @ccd/web-demo type-check`
- `pnpm arch:runtime`
- `pnpm arch:boundaries`
- `pnpm api:report` if contracts or package exports change

### Evidence

- `docs/ai-runs/20260531-121402-ccd-m5-cleanup-planning/reports/safe-storage-plan.md`
- `docs/ai-runs/20260531-130051-ccd-m6-owner-decision-packet/reports/b07-safe-storage-crypto-owner-decision.md`

### M6b owner decision review

> **Historical (superseded):** Pre-P1 M6b review snapshot. Authoritative status is recorded in **P1 post-M16 owner decision (2026-06-01)** below.

- Review run: `docs/ai-runs/20260531-142414-ccd-m6b-owner-decision-review/`
- Owner approval status: `NO_OWNER_APPROVAL_RECORDED`
- Decision log status at time of review: `PROPOSED`.
- Evidence reviewed: M6 decision packet, M6a reconciliation summary, this decision log, architecture issue repair log, and `.ai/runtime/owner_decisions.md`.
- Result: no explicit owner approval, rejection, deferral, or revision request was found for options 1-5.
- Authorization effect at time of review: `B-07` remained `BLOCKED` for crypto ownership.

### M7 safeStorage codec foundation note

> **Historical (superseded):** Pre-P1 M7 snapshot. Authoritative status is recorded in **P1 post-M16 owner decision (2026-06-01)** below.

- Review run: `docs/ai-runs/20260531-144505-ccd-m7-safe-storage-codec-foundation/`
- M7 established the non-crypto JSON codec foundation as already package-owned by `@ccd/shared-utils` and already consumed by `apps/web-demo/src/utils/safeStorage/core.ts`.
- M7 did not move compression because `@ccd/shared-utils` does not declare `lz-string` and this lane forbids package manifest/lockfile changes.
- M7 did not move or modify AES, HMAC, Web Crypto, obfuscation-key resolution, app logger wiring, `import.meta.env`, browser storage, or Pinia serializer behavior.
- Decision log status at time of review: `PROPOSED`; `B-07` remained `BLOCKED`.

### M7a validation closure note

> **Historical (superseded):** Pre-P1 M7a snapshot. Authoritative status is recorded in **P1 post-M16 owner decision (2026-06-01)** below.

- Review run: `docs/ai-runs/20260531-153347-ccd-m7a-web-demo-filtered-test-cwd-repair/`
- M7a repaired the test-only cwd-sensitive path in `apps/web-demo/src/utils/http/requestLayer.spec.ts` that made `pnpm --filter @ccd/web-demo test` resolve `apps/web-demo/apps/web-demo/src/utils/http`.
- The repair changed only test path normalization. It did not change HTTP runtime behavior, safeStorage runtime behavior, package manifests, lockfile, generated outputs manually, AES, HMAC, Web Crypto, obfuscation-key resolution, app logger wiring, `import.meta.env`, browser storage, or Pinia serializer behavior.
- M7 strict validation is now closed as `M7_SCOPE_ACCEPTED_VALIDATION_CLOSED`.
- Decision log status at time of review: `PROPOSED`; `B-07` remained `BLOCKED`.

### M8 theme-size resolver note

> **Historical (superseded):** Pre-P1 M8 snapshot. Authoritative status is recorded in **P1 post-M16 owner decision (2026-06-01)** below.

- Review run: `docs/ai-runs/20260531-160123-ccd-m8-theme-size-resolver-foundation/`
- M8 did not move or modify safeStorage crypto, HMAC, Web Crypto, compression ownership, obfuscation-key resolution, app logger wiring, `import.meta.env`, browser storage ownership, or Pinia serializer behavior.
- Decision log status at time of review: `PROPOSED`; `B-07` remained `BLOCKED`.

### M14 status reconciliation note

> **Historical (superseded):** Pre-P1 M14 snapshot. Authoritative status is recorded in **P1 post-M16 owner decision (2026-06-01)** below.

- Review run: `docs/ai-runs/20260531-212101-ccd-m14-status-ledger-reconciliation/`
- M14 found no explicit owner approval, rejection, deferral, or revision request for D-016 after M6b.
- Decision log status at time of review: `PROPOSED`; `B-07` remained `BLOCKED`.
- `B-08` remained `OPEN` because compression extraction still required dependency/manifest approval and persisted-format parity evidence.

### M15 surface synchronization note

> **Historical (superseded):** Pre-P1 M15 snapshot. Authoritative status is recorded in **P1 post-M16 owner decision (2026-06-01)** below.

- Review run: `docs/ai-runs/20260531-215707-ccd-m15-no-go-surface-sync-review-package/`
- M15 updates top-level status surfaces only and does not record owner approval, rejection, deferral, or revision request for D-016.
- Decision log status at time of review: `PROPOSED`; `B-07` remained `BLOCKED`.
- `B-08` remained `OPEN`; no package manifest, lockfile, compression, crypto, HMAC, Web Crypto, or runtime behavior was changed.

### P1 post-M16 owner decision (2026-06-01)

- Review run: `docs/ai-runs/20260601-101000-ccd-p1-d016-safe-storage-crypto-decision/`
- Owner approval status: `APPROVED_OPTION_A`
- Approved scope: crypto/HMAC/Web Crypto/obfuscation-key resolution remain app-owned; no crypto migration into packages.
- Authorization effect: `D-016` is `APPROVED`; `B-07` is resolved as app-owned terminal boundary (`DONE` in architecture issue repair log).
- Non-crypto safeStorage cleanup may proceed in P4 only within approved non-crypto scope.

---

## D-017 — C-06 PrimeVue allowlist reduction strategy

- Status: `APPROVED`
- Date: 2026-05-31
- Approved options: **Option A + Option D + Option E** (E approved 2026-06-01, P13 lane)
- Approved date: 2026-06-01

### Context

M4 classified current PrimeVue imports and M5 found 0 allowlist rows removable without source migration. `C-06` remains `OPEN` because app direct imports still depend on exact allowlists, generated typing, app shell/plugin exceptions, and the path-scoped showcase exception.

### Options considered

1. Keep exact allowlist and showcase exceptions as temporary debt; reduce only through future component migration lanes.
2. Prioritize selected app feature usage behind `@ccd/vue-ui` wrappers.
3. Prioritize global service/config usage behind `@ccd/vue-primevue-adapter`.
4. Keep showcase paths as long-lived demo exceptions but prevent new non-showcase direct imports.
5. Create a future PrimeVue reduction lane that handles one feature area at a time.

### Decision

**Owner-approved (2026-06-01, P3 lane): Options A + D.**

Keep exact allowlists and showcase exceptions as documented architecture debt. Prevent new non-showcase direct PrimeVue app imports via existing guard enforcement. Option E staged reduction lanes and M12 allowlist row removal are **not approved** in this decision.

This approval does not authorize reducing allowlists, editing PrimeVue imports, changing generated type output manually, or weakening guard behavior.

### Rationale

The current guard already prevents new non-showcase direct app imports while preserving known app/plugin/generated/showcase surfaces. Removing rows without wrapper or adapter migration would be cosmetic and risky. One feature area per lane gives reviewable diffs and focused visual validation.

### Rejected alternatives

- Broad allowlist deletion is rejected because M5 found no safe immediate removals.
- Broad wrapper migration is rejected because it mixes unrelated UI surfaces and raises regression risk.
- Long-lived showcase exception is tolerated only while new non-showcase direct imports remain blocked.

### Risks

- Exact allowlists can become permanent if M12 is not executed.
- Wrapper migration can change PrimeVue behavior, PT styling, focus handling, or generated typings.
- Showcase exceptions can hide demo debt if they are not reviewed by owner/product.

### Follow-up validation

Minimum validation for any future reduction lane:

- `pnpm ai:guard -- --format=json`
- `pnpm api:report`
- affected `@ccd/vue-ui` and `@ccd/vue-primevue-adapter` tests/builds
- `pnpm --filter @ccd/web-demo type-check`
- focused visual/e2e smoke for touched UI
- generated type registry validation if the generator output changes

### Evidence

- `docs/ai-runs/20260531-121402-ccd-m5-cleanup-planning/reports/primevue-allowlist-reduction-plan.md`
- `docs/ai-runs/20260531-130051-ccd-m6-owner-decision-packet/reports/c06-primevue-allowlist-decision.md`

### M6b owner decision review

> **Historical (superseded):** Pre-P3 M6b review snapshot. Authoritative status is recorded in **P3 post-M16 owner decision (2026-06-01)** below.

- Review run: `docs/ai-runs/20260531-142414-ccd-m6b-owner-decision-review/`
- Owner approval status: `NO_OWNER_APPROVAL_RECORDED`
- Decision log status at time of review: `PROPOSED`.
- Evidence reviewed: M6 decision packet, M6a reconciliation summary, this decision log, architecture issue repair log, and `.ai/runtime/owner_decisions.md`.
- Result: no explicit owner approval, rejection, deferral, or revision request was found for options 1-5.
- Authorization effect at time of review: `C-06` remained `OPEN`; `M12-primevue-allowlist-reduction` remained blocked.

### M14 status reconciliation note

> **Historical (superseded):** Pre-P3 M14 snapshot. Authoritative status is recorded in **P3 post-M16 owner decision (2026-06-01)** below.

- Review run: `docs/ai-runs/20260531-212101-ccd-m14-status-ledger-reconciliation/`
- M14 found no explicit owner approval, rejection, deferral, or revision request for D-017 after M6b.
- Decision log status at time of review: `PROPOSED`; `C-06` remained `OPEN`.
- `M12-primevue-allowlist-reduction` remained blocked at time of review.

### M15 surface synchronization note

> **Historical (superseded):** Pre-P3 M15 snapshot. Authoritative status is recorded in **P3 post-M16 owner decision (2026-06-01)** below.

- Review run: `docs/ai-runs/20260531-215707-ccd-m15-no-go-surface-sync-review-package/`
- M15 updates top-level status surfaces only and does not record owner approval, rejection, deferral, or revision request for D-017.
- Decision log status at time of review: `PROPOSED`; `C-06` remained `OPEN`.
- `M12-primevue-allowlist-reduction` remained blocked at time of review.

### P3 post-M16 owner decision (2026-06-01)

- Review run: `docs/ai-runs/20260601-103000-ccd-p3-d017-primevue-reduction-decision/`
- Owner approval status: `APPROVED_OPTIONS_A_AND_D`
- Approved scope: maintain exact allowlists and showcase exceptions; block new non-showcase direct imports via guard; no allowlist reduction or M12 source migration in this program.

### P13 post-P12 owner decision (2026-06-01)

- Review run: `docs/ai-runs/20260601-151000-ccd-p13-primevue-m12-owner-decision/`
- Owner approval status: `APPROVED_OPTION_E_STAGED_REDUCTION`
- Approved scope: staged PrimeVue allowlist reduction by feature slice (E, E1–E4); one slice per commit; remove allowlist rows only after source migration and validation; keep bootstrap installs, generated type registry, and showcase exceptions unless explicitly approved for cleanup.
- Authorization effect: `M12-primevue-allowlist-reduction` is **APPROVED** and unlocked for P14 implementation; `C-06` remains `OPEN` until reduction completes or owner accepts residual debt; Options A+D guard posture remains in force for new non-showcase imports.
- Recommended first slice: **E1** — adapter-only global PrimeVue service/config/directive reduction (`AdminSidebarMenuCollapsed.tsx`, `AdminSidebarMenuInline.tsx`, narrow `AppPrimeVueGlobals.vue`).

---

## D-019 — B-08 safeStorage compression owner decision

- Status: `APPROVED`
- Date: 2026-06-01
- Approved option: **Option A** — keep `lz-string` compression app-owned under `apps/web-demo/src/utils/safeStorage/lzstring.ts`

### Context

M7 found compression is pure but depends on `lz-string`, which is declared only in `apps/web-demo/package.json`. Moving compression to `@ccd/shared-utils` would require manifest and lockfile changes plus persisted-format parity tests.

### Decision

**Owner-approved (2026-06-01, P2 lane): Option A.**

Compression remains app-owned. Do not add `lz-string` to `@ccd/shared-utils` in this program. P5 compression migration lane is skipped.

### Authorization effect

- `B-08` resolves as app-owned terminal boundary (`DONE` in architecture issue repair log).
- No package manifest, lockfile, or compression behavior changes are authorized.

### Evidence

- `docs/ai-runs/20260601-102000-ccd-p2-b08-compression-lz-string-decision/reports/b08-compression-analysis.md`
- `docs/ai-runs/20260531-144505-ccd-m7-safe-storage-codec-foundation/reports/safe-storage-codec-dependency-map.md`

---

## D-018 — M8 design-tokens size resolver public API

- Status: `APPROVED`
- Date: 2026-05-31

### Context

M8 was explicitly authorized as the `theme-size resolver foundation execution and evidence lane`. The lane required moving or exposing only runtime-neutral theme/size calculation while preserving app-owned DOM, storage, preload, and Pinia behavior.

### Decision

Approve `@ccd/design-tokens` root exports for pure size resolver helpers:

- `generateSizeVars`
- `decideRootFontSize`
- `decideLayoutDimensions`
- `deriveRuntimeFontSizeVars`
- `resolveSizePreset`
- `getScopedContentSizeVars`
- associated runtime-neutral types

`apps/web-demo/src/utils/theme/sizeEngine.ts` remains the app compatibility facade and may delegate to these package helpers. DOM writes, preload, `localStorage`, browser device collection, and Pinia stores remain app-owned.

This decision does not approve package manifest changes, lockfile changes, DOM/preload migration, store migration, PrimeVue allowlist reduction, safeStorage crypto movement, or runtime enforcement weakening.

### Follow-up validation

- focused design-tokens resolver spec
- app size facade spec
- filtered `@ccd/web-demo` test
- root `pnpm test:run`
- `pnpm type-check`
- `pnpm api:report`
- `pnpm validate:governance`

### Evidence

- `docs/ai-runs/20260531-160123-ccd-m8-theme-size-resolver-foundation/reports/summary.md`
- `docs/ai-runs/20260531-160123-ccd-m8-theme-size-resolver-foundation/reports/resolver-eligibility.md`

---

## D-019 — M10 vue-app-platform layout visibility reducer public API

- Status: `APPROVED`
- Date: 2026-05-31

### Context

M10 was authorized only for runtime-neutral pure state helper extraction from system stores. The layout store contained deterministic parent/child module visibility constraints, per-mode hidden-module constraints, and restore-cache behavior embedded inside Pinia actions.

### Decision

Approve `@ccd/vue-app-platform` root exports for pure layout visibility helpers:

- `enforceLayoutVisibilityParentRequirements`
- `enforceLayoutModeVisibilityConstraints`
- `resolveLayoutModuleVisibilityChange`
- related layout module dependency constants and types

`apps/web-demo/src/stores/modules/system/layout.ts` remains the Pinia owner and delegates only pure visibility reduction. Store ID, state shape, persisted key/pick list, `syncAction`, loading counters, mobile drawer runtime state, device-store dependency, and app singleton access remain app-owned.

This decision does not approve moving Pinia stores, persistence wiring, browser runtime listeners, `localStorage`, device lifecycle, `syncAction`, loading behavior, package manifests, lockfile, or runtime enforcement policy.

### Follow-up validation

- package layout runtime spec
- app layout store spec
- focused size/device store specs
- `pnpm --filter @ccd/vue-app-platform build`
- `pnpm --filter @ccd/web-demo test`
- `pnpm arch:runtime`
- `pnpm arch:boundaries`
- `pnpm api:report`
- `pnpm validate:governance`

### Evidence

- `docs/ai-runs/20260531-185509-ccd-m10-system-store-pure-state-extraction/reports/system-store-pure-helper-eligibility.md`
- `docs/ai-runs/20260531-185509-ccd-m10-system-store-pure-state-extraction/reports/summary.md`

---

## D-020 — M11 hook-facade convergence verification

- Status: `APPROVED`
- Date: 2026-05-31

### Context

M11 was authorized only for behavior-preserving app hook/facade convergence. The inspected surfaces were `useAutoMitt`, `useDialog`, `useProTableUrlSync`, and the ProForm/ProTable plugin integration shells.

### Decision

Do not move production behavior in M11:

- `apps/web-demo/src/hooks/modules/useAutoMitt.ts` stays as the app event-map binding over `@ccd/vue-hooks/createAutoMittHook`.
- `apps/web-demo/src/hooks/modules/useDialog.tsx` stays as the app translated dialog convenience facade over `@ccd/vue-ui` dialog core.
- `apps/web-demo/src/hooks/modules/useProTableUrlSync.ts` stays as the app router adapter injected into `@ccd/vue-ui`.
- `apps/web-demo/src/plugins/modules/proform.ts` and `apps/web-demo/src/plugins/modules/protable.ts` stay app-owned capability injection shells.

M11 adds focused tests for current facade behavior and records eligibility evidence. This does not mark `B-01`, `B-02`, or `B-12` resolved.

### Forbidden

This decision does not approve package manifest changes, lockfile changes, raw PrimeVue export changes, PrimeVue allowlist reduction, dialog UX changes, ProTable URL query behavior changes, or moving app router/i18n/storage/date capabilities into packages.

### Follow-up validation

- `pnpm --filter @ccd/vue-hooks test`
- `pnpm --filter @ccd/vue-ui test`
- focused app facade Vitest specs
- `pnpm --filter @ccd/web-demo test`
- governance validation matrix

### Evidence

- `docs/ai-runs/20260531-192122-ccd-m11-hook-facade-convergence/reports/hook-facade-eligibility.md`
- `docs/ai-runs/20260531-192122-ccd-m11-hook-facade-convergence/reports/summary.md`

---

## D-021 — M13a root theme tooling public API boundary

- Status: `APPROVED`
- Date: 2026-05-31

### Context

M13a was scoped to `F-04`: root theme tooling scripts still imported app theme utilities from `apps/web-demo/src/utils/theme/**`.

### Decision

Root theme tooling must consume `@ccd/design-tokens/theme-engine` public exports for pure theme color, generation, and contrast validation helpers. The app theme utilities remain app compatibility/runtime facades and must not be imported by root scripts.

M13a adds only narrow theme-engine public barrel exports for pure helpers already owned by `packages/design-tokens`; it does not approve app runtime movement, package manifest changes, dependency changes, lockfile changes, or moving app theme runtime into `packages/core`.

### Follow-up validation

- `pnpm exec vitest run packages/design-tokens/src/theme-engine/index.spec.ts`
- `pnpm --filter @ccd/design-tokens build`
- `pnpm validate:tokens`
- `pnpm arch:boundaries`
- `pnpm api:report`
- full M13a validation matrix

### Evidence

- `docs/ai-runs/20260531-203406-ccd-m13a-root-theme-tooling-boundary-repair/reports/root-theme-tooling-boundary-analysis.md`
- `docs/ai-runs/20260531-203406-ccd-m13a-root-theme-tooling-boundary-repair/reports/validation-closure.md`

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

- Status: `ACTIVE`
- Date: 2026-05-30

### Context

New organization, starter extraction, standalone design-system split, Reka UI, TanStack Query, and desktop drift CI are strategic work items. The 2026-05-30 P4 lane is planning-only and does not approve implementation.

### Decision

Keep P4 items deferred or blocked unless prerequisites are stable and the appropriate owner explicitly approves a separate lane:

- `DOC-004` P4 umbrella: `DEFERRED`.
- New GitHub organization or repository: `OUT_OF_SCOPE` for the current repair program.
- `ccd-vue-starter`: `APPROVAL_REQUIRED`.
- Standalone design-system repository/package split: `APPROVAL_REQUIRED`.
- Reka UI evaluation: `BLOCKED_BY_OWNER`.
- TanStack Query Vue evaluation: `BLOCKED_BY_PRODUCT`.
- Desktop drift CI: `BLOCKED_BY_OPERATOR`.

This decision does not approve package creation, source moves, dependency upgrades, Vite 8, GitHub remote mutation, `.github/**` edits, auth-flow changes, HTTP runtime changes, runtime UI changes, package manifest edits, or manual generated-file edits.

### Follow-up validation

Human review plus the P4 planning-only validation set:

- `pnpm docs:commands`
- `pnpm ai:doctor --open`
- `pnpm codex:preflight`
- `pnpm validate:governance`
- `git diff --check`
- `git status --short --untracked-files=all`

### Evidence

- `ccd-architecture-optimization-plan/plans/04-P4-strategic-deferred-work.md`
- `docs/ai-runs/20260530-192455-ccd-p4-planning-only/`

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
