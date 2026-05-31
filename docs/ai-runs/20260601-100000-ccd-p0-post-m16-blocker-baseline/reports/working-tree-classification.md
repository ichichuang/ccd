# P0 Working Tree Classification

Generated: 2026-06-01  
Source: `command-logs/03-git-status-short-untracked-all.log` (917 lines)

## Summary

| Category | Approx. count | Policy |
|---|---|---|
| Modified tracked | 50 | inherited M1–M16a; do not clean |
| Untracked evidence (`docs/ai-runs/**`) | majority of `??` lines | lane evidence; review in P9 |
| Untracked docs/ai-plan | `ARCHITECTURE_ISSUE_REPAIR_LOG.md` | status ledger; commit in P9 group |
| Root duplicate input | `CCD_ARCHITECTURE_ISSUE_REPAIR_LOG.md` | exclusion candidate |
| Runtime source (web-demo stores/utils) | ~10 modified | M8–M11 inherited |
| Package source | design-tokens, vue-app-platform | M8–M13a inherited |
| Governance policies/generated | `.ai/governance/**`, `docs/generated/**` | command-owned; no manual edit |
| Cursor plan | `.cursor/plans/*.plan.md` | local IDE; exclusion candidate |

## Modified tracked files (50)

| git_status | file | lane_origin | category | requires_human_review |
|---|---|---|---|---|
| M | `.ai/generated/governance-report.json` | M1/M2/M14 validation | generated | yes |
| M | `.ai/governance/policies/api.json` | M1/M2/M3 | governance-policy | yes |
| M | `.ai/governance/policies/runtime.json` | M1/M2/M3 | governance-policy | yes |
| M | `.ai/governance/policies/topology.json` | M1/M2/M3 | governance-policy | yes |
| M | `.ai/rules/components/*.mdc` | M13a/M14 | governance-rule-doc | yes |
| M | `README.md` | M15 | doc/status-surface | yes |
| M | `apps/desktop/tsconfig.json` | M13 | config | yes |
| M | `apps/web-demo/src/stores/modules/system/*.ts` | M8–M10 | source | yes |
| M | `apps/web-demo/src/utils/deviceSync.ts` | M8–M10 | source | yes |
| M | `apps/web-demo/src/utils/http/requestLayer.spec.ts` | M7a | test-source | yes |
| M | `apps/web-demo/src/utils/theme/sizeEngine.*` | M8 | source/test | yes |
| M | `apps/web-demo/tsconfig.json` | M13 | config | yes |
| M | `docs/ai-plan/*` | M14–M16a | doc/status-surface | yes |
| M | `docs/architecture/ownership-boundaries.md` | M1/M3/M10 | doc/architecture | yes |
| M | `docs/en/architecture-contract.md` | M1/M3/M10 | doc/architecture | yes |
| M | `docs/generated/**` | validation-generated | generated | yes |
| M | `docs/runtime/*.md`, `docs/zh/*.md` | M1/M3/M16 | doc/architecture | yes |
| M | `packages/design-tokens/src/**` | M8/M13a | package-source | yes |
| M | `packages/vue-app-platform/src/**` | M10 | package-source | yes |
| M | `scripts/ai-route-view-scaffold.mjs` | M15 | tooling | yes |
| M | `scripts/architecture/*.mjs` | M1–M13a | governance-tooling | yes |

## Notable untracked

| git_status | file | lane_origin | category | should_commit |
|---|---|---|---|---|
| ?? | `.ai/governance/api-snapshots/ccd__vue-app-platform.json` | M2/M6a | generated | yes (after validation) |
| ?? | `docs/ai-plan/ARCHITECTURE_ISSUE_REPAIR_LOG.md` | M0–M16a | doc/status-surface | yes |
| ?? | `apps/web-demo/src/hooks/modules/*.spec.ts` | M11 | test-source | yes |
| ?? | `docs/ai-runs/**` (bulk) | M0–M16 | evidence | yes (grouped) |
| ?? | `CCD_ARCHITECTURE_ISSUE_REPAIR_LOG.md` | pre-M0 input | doc/input | owner decision |
| ?? | `.cursor/plans/m16a_ledger_polish_35c9e4d7.plan.md` | local IDE | plan | no |

## P0 actions taken

- No clean/reset/stage/commit
- No source edits
- Command-owned regeneration via `pnpm api:report` and `pnpm validate:governance` only

Full file list: `command-logs/03-git-status-short-untracked-all.log`
