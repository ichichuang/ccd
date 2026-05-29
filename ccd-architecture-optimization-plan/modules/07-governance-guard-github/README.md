# Governance / Guard / GitHub 治理

## 目标

将 owner decisions、guard coverage、generated discipline、GitHub branch protection 串成可执行治理体系。

## 负责人建议

Maintainer / Owner

## 问题清单

| ID      | Priority | Severity | Status              | Paths                                                                                                             | Problem                                                                                                           | Best solution                                                                                                                                        | Validation                                                          |
| ------- | -------- | -------- | ------------------- | ----------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------- |
| GOV-001 | P0       | High     | BLOCKED_BY_OWNER    | .ai/runtime/owner_decisions.md<br>.ai/runtime/rule_coverage_matrix.md<br>scripts/ai-architecture-guard.mjs        | guard coverage、rule contradictions、design-token canonical file、desktop drift CI 多项 owner decisions pending。 | 一次只决策一个 owner decision；为每个决策写 ADR，随后再加 guard。不要未审批直接扩大 guard。                                                          | pnpm ai:doctor && pnpm ai:guard && pnpm docs:commands               |
| GOV-002 | P1       | High     | OPEN                | docs/ai-plan/FINAL_GO_NO_GO.md<br>docs/ai-plan/FINAL_VALIDATION_MATRIX.md<br>docs/ai-plan/CHANGE_SUMMARY.md       | 最终状态是 NO_GO，原因不是全量验证失败，而是 blocker 未解除/未接受。                                              | 将 blocker 转化为 owner-accepted exception 或实际修复 lane；每个 blocker 必须有 owner、due date、exit criteria。                                     | pnpm ai:doctor --open && open actionable scan                       |
| GOV-003 | P1       | Medium   | BLOCKED_BY_OPERATOR | .github/workflows/ci.yml<br>.github/CODEOWNERS<br>.github/PULL_REQUEST_TEMPLATE.md<br>.github/ISSUE_TEMPLATE/\*\* | .github/\*\* 变更与 remote branch protection 需要 operator approval。                                             | 审批后设置 required checks：Core Quality、E2E smoke、governance gate、type-check、lint、build:ci；CODEOWNERS 覆盖 .ai/docs/packages/apps/workflows。 | GitHub branch protection review + PR dry run                        |
| GOV-004 | P1       | Medium   | OPEN                | docs/generated/**<br>.ai/generated/**<br>.ai/governance/api-snapshots/\*\*<br>package.json                        | generated artifacts 必须用官方命令刷新，不能手改；治理 gate 可能要求 generated-sync rerun。                       | 所有涉及 API/dependency/graph/supply-chain 的变更后运行 pnpm governance:refresh，再运行 pnpm governance:gate；文档明确 generated drift 处理流程。    | pnpm governance:refresh && pnpm governance:gate && git diff --check |
| GOV-005 | P2       | Medium   | OPEN                | docs/ai-plan/NEXT_ACTIONS.md<br>docs/ai-plan/PLAN.md<br>docs/en/architecture-contract.md                          | 部分计划文档存在历史阶段段落，与当前“下一步 B-007”存在语义 drift。                                                | 重写 Next Actions 为当前优先级版本；保留历史内容到 archived section，避免 AI/人误执行旧 M2 建议。                                                    | pnpm docs:commands                                                  |

## 执行原则

1. 只处理本模块列出的路径和直接调用面。
2. 先验证当前失败，再改代码。
3. 涉及审批门禁的任务只更新决策记录，不擅自实现。
4. 所有迁移必须保持 `packages/contracts -> packages/core -> apps/*` 方向。
5. 不手动编辑 generated artifacts。
