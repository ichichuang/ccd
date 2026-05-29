# M3 Complete — ProTable typings and helper boundary

## Scope

- Task IDs: `P1-ProTable`, `P1-ProTable-Exports`, `P1-ProTable-Validation`
- Lane: M3 only.
- Out of scope: HTTP contract migration, UI library boundary enforcement, PrimeVue replacement, table runtime redesign.

## Findings

- `useProTableInfiniteScroll` exists at `apps/web-demo/src/components/ProTable/engine/hooks/useProTableInfiniteScroll.ts`.
- `useProTableUrlSync` exists at `apps/web-demo/src/components/ProTable/engine/hooks/useProTableUrlSync.ts`.
- Both helpers are consumed internally by `apps/web-demo/src/components/ProTable/ProTable.vue`; inventory found no public consumers.
- One example file imported `ProTableApiExecutor` through the internal `engine/types/props` path.
- ProTable props/config imported `RequestConfig` from `@/utils/http/types`, creating an avoidable type dependency on the app HTTP layer.

## Changes

- Exported public API types from `apps/web-demo/src/components/ProTable/index.ts`:
  - `ProTableApiConfig`
  - `ProTableApiExecutor`
  - `ProTableApiExecutorContext`
  - `ProTableUrlSyncOptions`
- Kept `useProTableInfiniteScroll` and `useProTableUrlSync` internal-only.
- Added local structural `ProTableApiConfig` in `apps/web-demo/src/components/ProTable/engine/types/props.ts`.
- Updated `apps/web-demo/src/components/ProTable/engine/config/apiAdapter.ts` to use `ProTableApiConfig`.
- Updated the ProTable example executor import to use the public `@/components/ProTable` boundary.
- Updated `apps/web-demo/src/components/ProTable/README.md`.
- Ran official `pnpm api:report`, which updated `docs/generated/api-surface-report.json`.

## Validation

| Command or check | Result | Evidence |
|---|---|---|
| M3 ProTable helper inventory | PASS | `docs/ai-runs/20260529-070550-ccd-architecture-repair/command-logs/M3-T1-20260529-074338-protable-helper-inventory.log` |
| `pnpm --filter @ccd/web-demo type-check` | PASS | `docs/ai-runs/20260529-070550-ccd-architecture-repair/command-logs/M3-T2-20260529-074407-web-demo-type-check.log` |
| Focused ProTable Vitest | PASS | `docs/ai-runs/20260529-070550-ccd-architecture-repair/command-logs/M3-T3-20260529-074417-protable-focused-vitest.log` |
| `pnpm api:report` | PASS | `docs/ai-runs/20260529-070550-ccd-architecture-repair/command-logs/M3-T2-20260529-074425-pnpm-api-report.log` |
| `pnpm ai:ledger:json` | PASS | `docs/ai-runs/20260529-070550-ccd-architecture-repair/command-logs/M3-20260529-074528-pnpm-ai-ledger-json.log` |
| `pnpm ai:doctor --open` | PASS, 111 open tasks | `docs/ai-runs/20260529-070550-ccd-architecture-repair/command-logs/M3-20260529-074535-pnpm-ai-doctor-open.log` |
| `pnpm docs:commands` | PASS | `docs/ai-runs/20260529-070550-ccd-architecture-repair/command-logs/M3-20260529-074549-post-update-pnpm-docs-commands.log` |
| `git diff --check` | PASS | `docs/ai-runs/20260529-070550-ccd-architecture-repair/command-logs/M3-20260529-074552-post-update-git-diff-check.log` |

## Residual risks

- M4 UI boundary and M5 HTTP contract lanes remain open and must be handled separately.
- Known unrelated generated drift remains in `apps/web-demo/src/types/auto-imports.d.ts` and `apps/web-demo/src/views/example/components/icons/configs/iconLists.generated.ts`.
