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
