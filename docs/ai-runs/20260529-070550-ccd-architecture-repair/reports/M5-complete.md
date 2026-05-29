# M5 Complete — HTTP Contract and Request Boundary

## Scope

- Task IDs: `P1-HttpContract-Contracts`, `P1-HttpContract-Core`, `P1-HttpContract-Adapter`, `P1-HttpContract-Zod`, `P1-HttpContract-NoCoupling`, `P1-HttpContract-Validation`
- Lane: M5 only.
- Out of scope: replacing alova, introducing Axios/Ky/TanStack Query, auth-flow redesign, broad HTTP import-path migration, new contract/core paths without owner approval.

## Changes

- Added HTTP inventory report:
  - `docs/ai-runs/20260529-070550-ccd-architecture-repair/reports/M5-T1-http-boundary-inventory.md`
- Updated D-004 in `docs/ai-plan/DECISIONS.md`.
- Added owner decision 6 in `.ai/runtime/owner_decisions.md`.
- Updated canonical ledger and plan/status files.
- No HTTP runtime code was changed.

## Findings

- `packages/contracts/src/network.ts` already provides a runtime-neutral low-level `NetworkClient` contract.
- No `packages/contracts/src/http/**` or `packages/core/src/http/**` exists.
- Existing architecture rules approve `apps/web-demo/src/utils/http/**` as the app HTTP infrastructure path.
- `apps/web-demo/src/adapters/http.adapter.ts` owns Zod/route payload validation.
- HTTP/API surfaces do not directly import Pinia stores, router, native storage, or session storage outside tests.
- Zod validation is already present at stable app HTTP/API boundaries through `parseZodHttpPayload()` and `responseSchema`.

## Blocked item

`P1-HttpContract-Contracts` is BLOCKED pending owner approval recorded as `.ai/runtime/owner_decisions.md` Decision 6. No `packages/contracts/src/http/**` or `packages/core/src/http/**` files were created.

## Validation

| Command or check | Result | Evidence |
|---|---|---|
| M5 HTTP boundary inventory | PASS | `docs/ai-runs/20260529-070550-ccd-architecture-repair/command-logs/M5-T1-20260529-075115-http-boundary-inventory.log` |
| `pnpm arch:runtime` | PASS | `docs/ai-runs/20260529-070550-ccd-architecture-repair/command-logs/M5-20260529-075212-pnpm-arch-runtime.log` |
| `pnpm api:report` | PASS | `docs/ai-runs/20260529-070550-ccd-architecture-repair/command-logs/M5-20260529-075216-pnpm-api-report.log` |
| `pnpm type-check` | PASS | `docs/ai-runs/20260529-070550-ccd-architecture-repair/command-logs/M5-20260529-075219-pnpm-type-check.log` |
| Request-layer focused Vitest | PASS | `docs/ai-runs/20260529-070550-ccd-architecture-repair/command-logs/M5-20260529-075232-request-layer-focused-vitest.log` |

## Residual risks

- HTTP contract package scope remains a pending owner decision.
- Raw `fetch` in `utils/http/connection.ts#performHealthCheck` should be treated as an infrastructure exception candidate in the guard/owner-decision lane.
- Non-HTTP raw `fetch` findings in `LoadingLottie.vue` and `utils/date/timezone.ts` remain outside M5 scope.
