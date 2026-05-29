# 文档、风险与审批闭环

## 目标

修正过期计划段落，补齐 ADR/decision record，确保每个 blocker 有 owner 或 operator 路径。

## 负责人建议

PM / Architect

## 问题清单

| ID      | Priority | Severity | Status   | Paths                                                                                           | Problem                                                                         | Best solution                                                                                                                            | Validation                                      |
| ------- | -------- | -------- | -------- | ----------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------- |
| DOC-001 | P0       | High     | OPEN     | docs/architecture/adr/\*\*<br>docs/ai-plan/DECISIONS.md<br>.ai/runtime/owner_decisions.md       | 多个 BLOCKED 项需要 owner/operator 决策，但缺少集中 ADR 输出结构。              | 新增 ADR 目录并为 UI boundary、HTTP contracts、guard scope、GitHub governance、Vite lane 分别建 ADR；owner_decisions.md 只做索引和状态。 | pnpm docs:commands                              |
| DOC-002 | P1       | Medium   | OPEN     | docs/ai-plan/RISK_REGISTER.md<br>docs/ai-plan/NEXT_ACTIONS.md<br>docs/ai-plan/FINAL_GO_NO_GO.md | 风险与行动项需要从 milestone 叙事转为 blocker/task ledger，便于统计。           | 建立 issue ledger：id/module/priority/path/owner/status/exit criteria/evidence；所有 docs 用同一 ID。                                    | pnpm ai:doctor --open && docs consistency check |
| DOC-003 | P3       | Medium   | DEFERRED | apps/web-demo/src/views/login/\*\*<br>docs/ai-plan/PLAN.md                                      | Login Diorama 属于 P3 feature/refactor，当前不应早于 P1/P2 稳定性工作。         | 维持 blocked/deferred；待 E2E、UI boundary、HTTP/auth retry policy 稳定后再开单独 feature lane。                                         | owner approval + auth/e2e regression            |
| DOC-004 | P4       | Low      | DEFERRED | docs/ai-plan/PLAN.md<br>docs/ai-plan/FINAL_GO_NO_GO.md                                          | 新组织、starter、design-system、Reka/TanStack 等战略工作超出当前 repair scope。 | 保持 P4 deferred；必须有独立 business case、owner approval、branch strategy。                                                            | owner approval only                             |

## 执行原则

1. 只处理本模块列出的路径和直接调用面。
2. 先验证当前失败，再改代码。
3. 涉及审批门禁的任务只更新决策记录，不擅自实现。
4. 所有迁移必须保持 `packages/contracts -> packages/core -> apps/*` 方向。
5. 不手动编辑 generated artifacts。
