# HTTP-001 Owner Decision

## Scope

- Lane: HTTP-001 decision-only.
- Baseline requested: `main` at `8b958c8a`, CI Guardian `26678951041` PASS.
- Runtime implementation: not performed.
- Contract files: not created.
- Dependencies, Vite, GitHub remote, Login Diorama, and P4: not touched.
- Generated governance files: not manually edited; only official validation commands regenerated outputs.

## Evidence Reviewed

- `.ai/runtime/owner_decisions.md`
- `docs/ai-plan/DECISIONS.md`
- `docs/ai-plan/STATUS.md`
- `.ai/runtime/repair_list.md`
- `ccd-architecture-optimization-plan/modules/04-http-contract-boundary/README.md`
- `ccd-architecture-optimization-plan/modules/04-http-contract-boundary/issues.md`
- `ccd-architecture-optimization-plan/ledgers/issue-ledger.md`
- `ccd-architecture-optimization-plan/ledgers/task-ledger.md`
- `packages/contracts/src/network.ts`
- `packages/contracts/src/storage.ts`
- `packages/contracts/src/index.ts`
- `packages/core/src/index.ts`
- `apps/web-demo/src/adapters/http.adapter.ts`
- `apps/web-demo/src/utils/http/**`
- `docs/ai-runs/20260529-070550-ccd-architecture-repair/reports/M5-T1-http-boundary-inventory.md`

## Decision

HTTP-001 is approved for a future contracts-only implementation lane.

`packages/contracts/src/http/**` may be created only for runtime-neutral TypeScript type/interface contracts. The approved shape may include:

- request method, headers, query, body, and request config types;
- response envelope and response metadata types;
- HTTP error kind/error shape types;
- retry policy types;
- timeout policy types;
- auth policy types;
- transport client/request/response interfaces.

`packages/core/src/http/**` remains blocked because current evidence does not prove a shared runtime-neutral HTTP orchestration need.

`apps/web-demo/src/utils/http/**` remains the canonical app HTTP infrastructure path. The current alova implementation, interceptors, retry/cache/deduplication, raw transport exceptions, and auth bridge wiring stay in the app layer.

`apps/web-demo/src/adapters/http.adapter.ts` remains the app boundary for Zod payload parsing and backend route payload validation.

## Forbidden

Future `packages/contracts/src/http/**` files must not import or define runtime behavior involving:

- `fetch`, browser request/response classes, DOM types, timers, storage, `window`, or `document`;
- alova, Vue, Pinia, Vue Router, Zod type/runtime imports, app adapters, i18n, notifications, or `@/` app aliases;
- concrete token refresh behavior, 401/logout UX, offline-session semantics, default retry timers, cache implementation, upload/download helpers, or UI error handling;
- executable helpers, classes with behavior, singleton instances, side effects, or dependency changes.

HTTP-007 remains product-blocked. Auth policy contracts may define type shape only.

## Future Implementation Validation

Minimum validation for a future contracts-only lane:

```bash
pnpm --filter @ccd/contracts build
pnpm build:core
pnpm api:report
pnpm arch:runtime
pnpm ai:doctor
pnpm codex:preflight
pnpm validate:governance
git diff --check
git status --short --untracked-files=all
```

If app code consumes the new contracts:

```bash
pnpm --filter @ccd/web-demo type-check
pnpm exec vitest run apps/web-demo/src/adapters/http.adapter.spec.ts apps/web-demo/src/utils/http
pnpm test:run
```

`pnpm test:run` is required only if runtime behavior changes.

## Decision Lane Validation

Current decision-only validation logs:

- `command-logs/pnpm-docs-commands.log` — PASS.
- `command-logs/pnpm-ai-doctor.log` — PASS.
- `command-logs/pnpm-codex-preflight.log` — PASS.
- `command-logs/pnpm-validate-governance.log` — PASS.
- `command-logs/git-diff-check.log` — PASS.
- `command-logs/git-status-short-untracked.log` — recorded final unstaged/untracked evidence files.
