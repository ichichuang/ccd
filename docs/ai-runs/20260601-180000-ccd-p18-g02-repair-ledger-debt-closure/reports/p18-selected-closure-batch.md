# P18 Selected Closure Batch

Generated: 2026-06-01  
Baseline: `main` @ `f1880c1e`  
Run: `docs/ai-runs/20260601-180000-ccd-p18-g02-repair-ledger-debt-closure/`

## Summary

| metric | before | after |
|---|---|---|
| open tasks (`pnpm ai:doctor --open`) | 80 | 78 |
| tasks closed in this batch | — | 2 |
| G-02 classification | `ACCEPTED_DEFERRED_DEBT` | unchanged (78 remaining) |

## Selected tasks

### 1. P1-HttpContract-Contracts

| field | value |
|---|---|
| task_id | `P1-HttpContract-Contracts` |
| proposed_new_status | `DONE_WITH_EVIDENCE` |
| related_issue | D-014, D-10 |
| evidence | commit `892dad30`; `docs/ai-runs/20260530-205504-ccd-http-001-contracts-implementation/reports/http-001-contracts-implementation.md`; `packages/contracts/src/http/**`; `.ai/runtime/owner_decisions.md` HTTP scope `APPROVED` |
| reason | Type-only HTTP contracts were implemented and validated in HTTP-001 lane before P7/P15; ledger row remained open with stale BLOCKED wording |
| risk | low — contracts-only; no runtime migration performed |
| validation needed | `pnpm --filter @ccd/contracts build`, `pnpm arch:runtime`, full P18 validation matrix |

### 2. P2-Vite8-Progress

| field | value |
|---|---|
| task_id | `P2-Vite8-Progress` |
| proposed_new_status | `STALE_LEDGER_ENTRY` → closed as `DONE_WITH_EVIDENCE` |
| related_issue | G-02 |
| evidence | `docs/ai-runs/20260530-104228-ccd-p2-governance-css-build-modernization/reports/p2-governance-css-build-modernization.md` (BUILD-003); `[x] [P2-CSS-BuildPluginCompatibility]`; `apps/web-demo/build/plugins.ts` `BUILD_PLUGIN_COMPATIBILITY_NOTES` entry `keep: false` |
| reason | Active `vite-plugin-progress` usage was already removed in P2 CSS lane; open Vite8 row incorrectly stated plugin "remains unchanged" |
| risk | low — documentation/status correction only; no new source edits in P18 |
| validation needed | `pnpm build:web-demo`, full P18 validation matrix |

## Tasks not selected (78 remain)

All remaining open tasks stay blocked, deferred, or owner/operator/product gated per P7/P15 classification. No PrimeVue allowlist, Login Diorama, Clawd/theme, dependency, manifest, or lockfile work was attempted.
