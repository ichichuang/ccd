# P3 Feature 与 Runtime Refactor 计划

## 目标

在架构边界稳定后推进 Login Diorama、PrimeVue/alova 单独升级等延后工作。

## 执行顺序

| Order | ID       | Module               | Severity | Status                   |
| ----- | -------- | -------------------- | -------- | ------------------------ |
| 1     | DEPS-004 | 依赖与工具链现代化   | Medium   | BLOCKED_BY_REVIEW        |
| 2     | DEPS-005 | 依赖与工具链现代化   | Medium   | BLOCKED_BY_HTTP_CONTRACT |
| 3     | DOC-003  | 文档、风险与审批闭环 | Medium   | DEFERRED                 |

## 任务详情

| ID       | Module               | Severity | Status                   | Paths                                                                                        | Best solution                                                                                         | Validation                                                       |
| -------- | -------------------- | -------- | ------------------------ | -------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------- |
| DEPS-004 | 依赖与工具链现代化   | Medium   | BLOCKED_BY_REVIEW        | package.json<br>packages/vue-primevue-adapter/**<br>packages/vue-ui/**<br>apps/web-demo/\*\* | 先完成 UI boundary policy 和 wrapper 迁移，再升级 PrimeVue；adapter tests + visual-token tests 必跑。 | pnpm --filter @ccd/vue-primevue-adapter build && pnpm e2e:visual |
| DEPS-005 | 依赖与工具链现代化   | Medium   | BLOCKED_BY_HTTP_CONTRACT | package.json<br>apps/web-demo/src/utils/http/\*\*                                            | 先完成 HTTP policy 和 request focused tests，再升级 alova；不要与 Vite/PrimeVue 同 lane。             | request-layer tests && pnpm type-check && pnpm e2e:smoke         |
| DOC-003  | 文档、风险与审批闭环 | Medium   | DEFERRED                 | apps/web-demo/src/views/login/\*\*<br>docs/ai-plan/PLAN.md                                   | 维持 blocked/deferred；待 E2E、UI boundary、HTTP/auth retry policy 稳定后再开单独 feature lane。      | owner approval + auth/e2e regression                             |

## 2026-05-30 执行记录

- Evidence directory: `docs/ai-runs/20260530-114939-ccd-p3-feature-and-runtime-refactors/`
- `pnpm ai:doctor --open` reported 80 open runtime-ledger tasks; P3 open tasks are Login Diorama tasks blocked pending M11 approval/prerequisite stability.
- P3 actionable scan across this plan, `ledgers/issue-ledger.md`, `ledgers/task-ledger.md`, and `.ai/runtime/repair_list.md` found zero unblocked P3 items.
- No source, dependency, lockfile, auth-flow, login UI, GitHub remote, Vite 8, or P4 change was made in this lane.

## 完成标准

- 本计划内所有 `OPEN` 项完成并通过验证；或明确 `BLOCKED/DEFERRED` 并记录证据。
- 没有无关源码漂移。
- 没有 generated artifacts 手工编辑。
- 对应 `docs/ai-plan/STATUS.md`、risk/decision docs、active report 已同步。
- 必要时更新 `FINAL_GO_NO_GO.md` 和 `NEXT_ACTIONS.md`。
