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

- Status: `PROPOSED`
- Date: 2026-05-29

### Context

Direct PrimeVue imports exist across apps/packages. Guard enforcement before policy may create false positives.

### Decision

Proposed PrimeVue boundary:

- `packages/vue-primevue-adapter/**` may import PrimeVue theme/config/service/PT APIs and owns global adapter configuration helpers.
- App bootstrap files may import `primevue/config` only to install PrimeVue with `createPrimeVueAdapterConfig()` and `installPrimeVueServices()`.
- App build tooling may use the PrimeVue component resolver.
- App global shell files may import global PrimeVue surfaces such as Toast, ConfirmPopup, DynamicDialog, `useToast`, and `usePrimeVue` only while they own app-wide global UI behavior.
- `packages/vue-ui/**` may compose PrimeVue inside CCD-owned primitives, but must not re-export raw PrimeVue components as a loose bucket.
- App feature/example components may continue direct PrimeVue imports until wrappers or migration tasks exist; these are candidate migration surfaces, not current violations.
- Tests may mock PrimeVue modules used by the files under test.
- Guard enforcement must wait for operator approval and an explicit exception list.

Current decision: audit and proposed policy first; guard only after approval.

### Rationale

The current direct import surface is broad and includes valid bootstrap, adapter, generated typing, global shell, package primitive, demo, and test cases. A guard before policy approval would create large false-positive surface.

### Follow-up validation

Import audit, policy review, `pnpm arch:boundaries`, `pnpm type-check`, and later `pnpm ai:guard` only after approval.

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
