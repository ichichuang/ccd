# P0 稳定性与决策基础计划

## 目标

先解决会阻断后续架构迁移的反馈链路、真实 E2E 失败、术语歧义和 owner decision 输出结构。

## 执行顺序

| Order | ID       | Module                           | Severity | Status           |
| ----- | -------- | -------------------------------- | -------- | ---------------- |
| 1     | E2E-001  | E2E QA 与 CI 反馈链路            | Critical | DONE             |
| 2     | ARCH-001 | 架构核心层与平台抽取             | High     | DONE             |
| 3     | ARCH-002 | 架构核心层与平台抽取             | High     | DONE             |
| 4     | DOC-001  | 文档、风险与审批闭环             | High     | DONE             |
| 5     | E2E-002  | E2E QA 与 CI 反馈链路            | High     | DONE             |
| 6     | E2E-003  | E2E QA 与 CI 反馈链路            | High     | DONE             |
| 7     | E2E-004  | E2E QA 与 CI 反馈链路            | High     | DONE             |
| 8     | E2E-005  | E2E QA 与 CI 反馈链路            | High     | DONE             |
| 9     | GOV-001  | Governance / Guard / GitHub 治理 | High     | BLOCKED_BY_OWNER |

## 任务详情

| ID       | Module                           | Severity | Status           | Paths                                                                                                                                                                 | Best solution                                                                                                                                    | Validation                                                                                                                                         |
| -------- | -------------------------------- | -------- | ---------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| E2E-001  | E2E QA 与 CI 反馈链路            | Critical | DONE             | package.json<br>playwright.config.ts<br>.github/workflows/ci.yml                                                                                                      | 已拆分 e2e:qa 与 e2e:qa:prepared；CI 先运行一次 pnpm ci:prepare-internal，然后执行 prepared suite；Playwright webServer.command 不再构建内部包。 | pnpm ci:prepare-internal && pnpm e2e:qa:prepared                                                                                                   |
| ARCH-001 | 架构核心层与平台抽取             | High     | DONE             | docs/en/architecture-contract.md<br>docs/architecture/ownership-boundaries.md<br>docs/ai-plan/SPEC.md<br>docs/ai-plan/PLAN.md                                         | 已将 common platform layer 定义为 packages/\* 平台层组合；packages/core 只保留 runtime-neutral orchestration；ADR-005 固化分层术语。             | pnpm docs:commands && pnpm arch:graphs && pnpm api:report                                                                                          |
| ARCH-002 | 架构核心层与平台抽取             | High     | DONE             | packages/core/src/index.ts<br>packages/contracts/src/index.ts<br>packages/_/package.json<br>apps/_/package.json                                                       | 已建立 extraction decision matrix，明确各类候选代码的目标 package 与禁止迁移边界。                                                               | pnpm arch:runtime && pnpm arch:boundaries && pnpm api:report                                                                                       |
| DOC-001  | 文档、风险与审批闭环             | High     | DONE             | docs/adr/\*\*<br>docs/ai-plan/DECISIONS.md<br>.ai/runtime/owner_decisions.md                                                                                          | 已新增 ADR-005/ADR-006；owner_decisions.md 改为索引和状态；审批门禁集中到 ADR-006。                                                              | pnpm docs:commands                                                                                                                                 |
| E2E-002  | E2E QA 与 CI 反馈链路            | High     | DONE             | playwright.config.ts<br>package.json                                                                                                                                  | 已拆四类 suite：e2e:smoke 并发、e2e:perf 单 worker、e2e:layout 2 workers、e2e:visual 单 worker。视觉截图和性能预算串行，普通 smoke 并发。        | pnpm e2e:smoke && pnpm e2e:perf && pnpm e2e:layout && pnpm e2e:visual                                                                              |
| E2E-003  | E2E QA 与 CI 反馈链路            | High     | DONE             | e2e/layout-runtime-geometry.spec.ts<br>packages/vue-ui/src/CScrollbar/**<br>apps/web-demo/src/layouts/**                                                              | 已定位为 OverlayScrollbars CSS 消费链路缺失，并修复 @ccd/vue-ui CSS 导出/应用入口导入；测试选择器改为真实 viewport。                             | pnpm exec playwright test e2e/layout-runtime-geometry.spec.ts -g "AppContainer CScrollbar restores persisted scroll memory smoothly after refresh" |
| E2E-004  | E2E QA 与 CI 反馈链路            | High     | DONE             | e2e/qa-regression.spec.ts<br>e2e/**snapshots**/qa-regression.spec.ts/qa-dashboard-desktop.png<br>apps/web-demo/src/views/dashboard/**<br>apps/web-demo/src/layouts/** | 已将 visual case 标记为 @visual 并通过 focused baseline 验证。                                                                                   | pnpm exec playwright test e2e/qa-regression.spec.ts -g "visual baselines catch silent layout collapse"                                             |
| E2E-005  | E2E QA 与 CI 反馈链路            | High     | DONE             | apps/web-demo/src/components/ProTable/**<br>apps/web-demo/src/views/example/components/primevue-collection/pro-table/**                                               | 已通过 dev/prod 浏览器几何诊断确认 ProTable 非零高，并补充 layout E2E 回归断言。                                                                 | pnpm build:web-demo && production preview geometry check && focused layout E2E                                                                     |
| GOV-001  | Governance / Guard / GitHub 治理 | High     | BLOCKED_BY_OWNER | .ai/runtime/owner_decisions.md<br>.ai/runtime/rule_coverage_matrix.md<br>scripts/ai-architecture-guard.mjs                                                            | 一次只决策一个 owner decision；为每个决策写 ADR，随后再加 guard。不要未审批直接扩大 guard。                                                      | pnpm ai:doctor && pnpm ai:guard && pnpm docs:commands                                                                                              |

## 完成标准

- 本计划内所有 `OPEN` 项完成并通过验证；或明确 `BLOCKED/DEFERRED` 并记录证据。
- 没有无关源码漂移。
- 没有 generated artifacts 手工编辑。
- 对应 `docs/ai-plan/STATUS.md`、risk/decision docs、active report 已同步。
- 必要时更新 `FINAL_GO_NO_GO.md` 和 `NEXT_ACTIONS.md`。
