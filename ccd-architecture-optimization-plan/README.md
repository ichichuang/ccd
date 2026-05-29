# CCD Monorepo 架构修复与优化任务体系

生成日期：2026-05-29

本压缩包是一套面向 `ichichuang/ccd` 当前架构的工程化任务体系。它不是一次性重构说明，而是可拆分执行的多阶段计划。核心原则：

1. `apps/*` 只保留项目壳、routes、stores、runtime adapters、app-specific views。
2. 可复用能力进入 `packages/*` 平台层，但不能全部塞进 `packages/core`。
3. `packages/contracts` 只放 contracts/DTO/policy types。
4. `packages/core` 只放 runtime-neutral orchestration facade。
5. Vue/PrimeVue/browser 相关通用能力进入 `vue-hooks`、`vue-app-platform`、`vue-ui`、`vue-primevue-adapter`、`vue-charts` 或新增 `vue-pro-components`。
6. 不在同一 lane 混合 Vite major、依赖升级、UI 边界迁移、HTTP contract、新 feature。

## 目录结构

```text
ccd-architecture-optimization-plan/
  README.md
  00-executive-summary.md
  01-issue-statistics.md
  02-target-architecture.md
  03-master-priority-roadmap.md
  04-validation-and-evidence-strategy.md
  05-approval-gates.md
  ledgers/
    issue-ledger.md
    task-ledger.md
    issue-ledger.json
    issue-ledger.csv
  modules/
    00-architecture-core-layer/
    01-e2e-ci-quality/
    02-pro-components-extraction/
    03-ui-primevue-boundary/
    04-http-contract-boundary/
    05-layout-app-platform/
    06-css-vite-build/
    07-governance-guard-github/
    08-dependencies-toolchain/
    09-docs-risk-approvals/
  plans/
    00-P0-stabilization-and-decision-foundation.md
    01-P1-platform-extraction-and-boundaries.md
    02-P2-governance-css-build-modernization.md
    03-P3-feature-and-runtime-refactors.md
    04-P4-strategic-deferred-work.md
  checklists/
    implementation-lane-checklist.md
    pull-request-checklist.md
    no-go-exit-checklist.md
```

## 快速使用

1. 先读 `00-executive-summary.md` 和 `03-master-priority-roadmap.md`。
2. 执行时每次只选择一个 `plans/*.md` 中的 lane。
3. 每个问题必须按 `ledgers/issue-ledger.md` 中的 `最佳解决方案` 和 `验证命令` 收口。
4. 需要审批的项必须先更新 `05-approval-gates.md`，不得直接实现。
5. 任何源码变更后必须补齐对应 module 文档中的验证证据。
