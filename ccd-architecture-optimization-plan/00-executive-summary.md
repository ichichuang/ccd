# 00 — 执行摘要

## 结论

CCD 的优化目标不是“把所有通用代码移动到 `packages/core`”，而是建立稳定的 **platform core layer**：

```text
root = orchestration only
packages/contracts = pure contracts / DTOs / policy types
packages/core = runtime-neutral orchestration facade
packages/* platform = shared utilities, hooks, UI primitives, adapters, charts, app platform
apps/* = project shells + routes + stores + runtime adapters + app-specific views
```

当前仓库已经具备该方向的基础，但仍存在 9 类工程问题：

| 模块                              | 问题数 | 主要风险                                                                                                                         |
| --------------------------------- | ------ | -------------------------------------------------------------------------------------------------------------------------------- |
| 架构核心层与平台抽取              | 5      | 定义 common core layer 的真实含义：不是把所有能力塞进 packages/core，而是形成 contracts/core/platform packages/apps 的稳定分层。 |
| E2E QA 与 CI 反馈链路             | 8      | 消除重复内部包构建，拆分 QA 套件，修复当前真实失败，并沉淀更快的 PR 反馈路径。                                                   |
| ProForm / ProTable / 通用组件迁移 | 5      | 将 apps/web-demo 中具备平台复用价值的高级组件拆为 contracts/shared-utils/vue-ui 或新增 vue-pro-components。                      |
| UI 与 PrimeVue 边界治理           | 5      | PrimeVue 继续保留，但业务/平台组件不得无边界地直接依赖 PrimeVue；先 policy，后 wrapper，最后 guard。                             |
| HTTP / alova / contracts 边界     | 7      | 保留 alova；新增 HTTP contracts 前必须先审批 request/error/retry/timeout/auth policy shape。                                     |
| Layout Runtime 与 App Platform    | 4      | 将跨 app 的 layout runtime、theme runtime、safe storage policy 从 web-demo app 层迁入平台层。                                    |
| CSS / Tokens / Vite Build         | 5      | 减少全局 px-to-rem 脆弱性，保护 UnoCSS/PrimeVue 样式，隔离 Vite 8 迁移风险。                                                     |
| Governance / Guard / GitHub 治理  | 5      | 将 owner decisions、guard coverage、generated discipline、GitHub branch protection 串成可执行治理体系。                          |
| 依赖与工具链现代化                | 5      | 所有依赖升级必须单 lane、单分支/工作树、先官方文档与 targeted validation，再全量验证。                                           |
| 文档、风险与审批闭环              | 4      | 修正过期计划段落，补齐 ADR/decision record，确保每个 blocker 有 owner 或 operator 路径。                                         |

## 当前最高优先级

1. **P0：E2E QA 反馈链路与真实失败修复**
   - 去除 E2E job 中重复 `ci:prepare-internal`。
   - 修复 CScrollbar scroll memory、dashboard screenshot 高度、ProTable `.p-datatable` height 0。
2. **P0：核心层术语与 owner decision 输出结构**
   - 明确 `common core layer != packages/core 大杂烩`。
   - 建立 ADR/decision record，解除 BLOCKED 项。
3. **P1：ProForm/ProTable/PrimeDialog/layoutRuntime 平台化**
   - 先稳定测试，再迁移。
4. **P1：PrimeVue 和 HTTP 边界治理**
   - 先 policy，后 wrapper/contracts，再 guard。
5. **P2+：Vite 8、依赖升级、Login Diorama、P4 战略事项**
   - 全部必须独立 lane，不能混入修复主线。

## 风险判断

当前最大风险不是 build/type-check，而是：

- E2E QA 真实失败会掩盖后续架构迁移质量。
- 将通用能力直接塞入 `packages/core` 会破坏 runtime-neutral invariant。
- PrimeVue/HTTP guard 没有 policy 前强制启用会制造大量 false positives。
- Vite 8 / dependency lane 若混入组件迁移，将难以回滚和归因。
