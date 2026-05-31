# M16 Stale Reference Cleanup Table

## Baseline

- Branch: `main`
- Commit: `cc255d1a`
- Accepted baseline: `M14_STATUS_LEDGER_RECONCILED_NO_GO`
- Prior lane: `M15_NO_GO_SURFACE_SYNCHRONIZED`

## Cleanup Table

| file | stale_reference | reference_type | current_claim | expected_claim | related_issue_ids | required_change | behavior_risk | validation_needed |
|---|---|---|---|---|---|---|---|---|
| `docs/ai-plan/PLAN.md` | `apps/web-demo/src/components/ProForm/**` | STALE_APP_COMPONENT_PATH | ProForm lives under removed app component directory | `packages/vue-ui/src/ProForm/**` owns public UI primitive; `apps/web-demo/src/plugins/modules/proform.ts` is app integration facade | D-08, D-11 | Replace planning paths with package owner plus app facade paths | Agents may inspect nonexistent app paths | `pnpm docs:commands`, stale path grep |
| `docs/ai-plan/PLAN.md` | `apps/web-demo/src/components/ProTable/**` | STALE_APP_COMPONENT_PATH | ProTable lives under removed app component directory | `packages/vue-ui/src/ProTable/**` owns public UI primitive; app plugin/facade paths remain app-owned | B-12, D-08, D-11 | Replace planning paths with package owner plus app facade paths | Agents may inspect nonexistent app paths | `pnpm docs:commands`, stale path grep |
| `docs/ai-plan/PLAN.md` | `apps/web-demo/src/components/ProTable/index.ts` | STALE_APP_COMPONENT_PATH | Public API boundary is app-local index | `packages/vue-ui/src/ProTable/index.ts` is package public boundary | D-08, D-11 | Point export boundary to package index | Export planning may target removed app API | `pnpm docs:commands`, `pnpm api:report` |
| `docs/zh/04-project-control-center.md` | `apps/web-demo/src/components/PrimeDialog` | STALE_APP_COMPONENT_PATH | PrimeDialog is app-local shared candidate | `@ccd/vue-ui` owns PrimeDialog public primitive | D-08 | Remove from app-local candidate list; add package ownership note | Contributor docs steer to removed path | `pnpm docs:commands`, stale path grep |
| `docs/zh/04-project-control-center.md` | `apps/web-demo/src/components/ProForm` | STALE_APP_COMPONENT_PATH | ProForm is app-local shared candidate | `@ccd/vue-ui` owns ProForm public primitive | D-08 | Remove from app-local candidate list | Contributor docs steer to removed path | `pnpm docs:commands`, stale path grep |
| `docs/zh/04-project-control-center.md` | `apps/web-demo/src/components/ProTable` | STALE_APP_COMPONENT_PATH | ProTable is app-local shared candidate | `@ccd/vue-ui` owns ProTable public primitive | D-08 | Remove from app-local candidate list | Contributor docs steer to removed path | `pnpm docs:commands`, stale path grep |
| `docs/zh/04-project-control-center.md` | `apps/web-demo/src/components/ProForm/**` | STALE_APP_COMPONENT_PATH | Do-not-move section lists removed app component tree | App plugin/facade compatibility surfaces remain app-owned | D-08 | Replace do-not-move app component globs with app-local compatibility facade wording | Release/control docs preserve stale ownership hints | `pnpm docs:commands` |
| `docs/zh/04-project-control-center.md` | `apps/web-demo/src/components/ProTable/**` | STALE_APP_COMPONENT_PATH | Do-not-move section lists removed app component tree | App plugin/facade compatibility surfaces remain app-owned | D-08 | Replace do-not-move app component globs with app-local compatibility facade wording | Release/control docs preserve stale ownership hints | `pnpm docs:commands` |
| `docs/zh/08-release.md` | `apps/web-demo/src/components/PrimeDialog` | STALE_APP_COMPONENT_PATH | Release doc lists PrimeDialog as app-local candidate | `@ccd/vue-ui` owns PrimeDialog public primitive | D-08 | Remove from app-local candidate list; add package ownership note | Release prep may target removed path | `pnpm docs:commands`, stale path grep |
| `docs/zh/08-release.md` | `apps/web-demo/src/components/ProForm` | STALE_APP_COMPONENT_PATH | Release doc lists ProForm as app-local candidate | `@ccd/vue-ui` owns ProForm public primitive | D-08 | Remove from app-local candidate list | Release prep may target removed path | `pnpm docs:commands`, stale path grep |
| `docs/zh/08-release.md` | `apps/web-demo/src/components/ProTable` | STALE_APP_COMPONENT_PATH | Release doc lists ProTable as app-local candidate | `@ccd/vue-ui` owns ProTable public primitive | D-08 | Remove from app-local candidate list | Release prep may target removed path | `pnpm docs:commands`, stale path grep |
| `docs/zh/08-release.md` | `apps/web-demo/src/components/ProForm/**` | STALE_APP_COMPONENT_PATH | Release do-not-move section lists removed app component tree | App plugin/facade compatibility surfaces remain app-owned | D-08 | Replace do-not-move app component globs with app-local compatibility facade wording | Release docs preserve stale ownership hints | `pnpm docs:commands` |
| `docs/zh/08-release.md` | `apps/web-demo/src/components/ProTable/**` | STALE_APP_COMPONENT_PATH | Release do-not-move section lists removed app component tree | App plugin/facade compatibility surfaces remain app-owned | D-08 | Replace do-not-move app component globs with app-local compatibility facade wording | Release docs preserve stale ownership hints | `pnpm docs:commands` |
| `scripts/ai-route-view-scaffold.mjs` | removed app component type imports | STALE_TOOLING_TEMPLATE | M15 already aligned generated imports to `@ccd/vue-ui` | No additional M16 change required | D-11 | NO_ACTION in M16 | None | `pnpm ai:guard`, scaffold dry-run if changed |
| `scripts/ai-architecture-guard.mjs` | removed app component allowlist rows | STALE_TOOLING_TEMPLATE | Guard still references removed app component paths | Owner-approved M12 reduction updates allowlists | D-11, C-06 | Out of M16 scope | Guard may mention removed paths until approved lane | `pnpm ai:guard` |
| `docs/ai-plan/ARCHITECTURE_ISSUE_REPAIR_LOG.md` | M15-only final status | STALE_LANE_STATUS | Ledger stopped at M15 | Record M16 lane, issue updates, and final M16 status | D-08, D-11, G-02 | Add M16 section and update issue statuses | Ledger lags cleanup evidence | `pnpm docs:commands`, `pnpm ai:doctor --open` |
| `docs/ai-plan/STATUS.md` | M15-only current lane | STALE_LANE_STATUS | Current lane still described as M15 | Current lane is M16 cleanup with `NO_GO` preserved | G-02 | Add M16 status note | Top-level status can lag cleanup lane | `pnpm docs:commands` |
| `docs/ai-plan/FINAL_GO_NO_GO.md` | M15-only cleanup note | STALE_LANE_STATUS | Final doc references only M15 review package | Add M16 cleanup note without changing `NO_GO` | G-03 | Add M16 note only | Full GO could be misread if lane status lags | `pnpm docs:commands` |
| `README.md` | `apps/web-demo/src/layouts/runtime/layoutRuntime.ts` | NO_ACTION | App-local compatibility facade over `@ccd/vue-app-platform` | Correct current classification | A-03 | None | None | stale path grep |
| `docs/generated/**` | generated topology/API outputs | NO_ACTION | Command-owned generated outputs | Do not manually edit | D-01, D-04 | None | Manual edits violate generated-file rule | `pnpm validate:governance` |

## Counts

| Metric | Before M16 | After M16 |
|---|---:|---:|
| Stale removed app component path references in M16 target docs (`PLAN.md`, `docs/zh/04-project-control-center.md`, `docs/zh/08-release.md`) | 17 | 0 |
| Stale removed app component path references in `scripts/ai-route-view-scaffold.mjs` | 0 (fixed in M15) | 0 |
| Remaining removed app component path references in `scripts/ai-architecture-guard.mjs` | 6 allowlist rows | 6 allowlist rows (owner-approved M12 follow-up) |

## Result

All known M15 out-of-scope stale documentation references in the M16 allowed file set are resolved. Guard allowlist cleanup remains deferred to owner-approved M12 work.
