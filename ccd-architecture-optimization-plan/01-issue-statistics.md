# 01 — 问题统计分析

## 按优先级统计

| 优先级 | 数量 |
| ------ | ---- |
| P0     | 9    |
| P1     | 25   |
| P2     | 15   |
| P3     | 3    |
| P4     | 1    |

## 按严重级别统计

| 严重级别 | 数量 |
| -------- | ---- |
| Critical | 1    |
| High     | 16   |
| Medium   | 32   |
| Low      | 4    |

## 按状态统计

| 状态                     | 数量 |
| ------------------------ | ---- |
| BLOCKED_BY_APPROVAL      | 4    |
| BLOCKED_BY_HTTP_CONTRACT | 1    |
| BLOCKED_BY_OPERATOR      | 1    |
| BLOCKED_BY_OWNER         | 2    |
| BLOCKED_BY_POLICY        | 1    |
| BLOCKED_BY_PRODUCT       | 1    |
| BLOCKED_BY_REVIEW        | 1    |
| DEFERRED                 | 2    |
| DONE                     | 10   |
| OPEN                     | 30   |

## 按模块统计

| 模块                              | 数量 | 负责人建议                |
| --------------------------------- | ---- | ------------------------- |
| 架构核心层与平台抽取              | 5    | Architect / Maintainer    |
| E2E QA 与 CI 反馈链路             | 8    | QA / Maintainer           |
| ProForm / ProTable / 通用组件迁移 | 5    | Senior Vue / Architect    |
| UI 与 PrimeVue 边界治理           | 5    | UI Platform               |
| HTTP / alova / contracts 边界     | 7    | Runtime / API Platform    |
| Layout Runtime 与 App Platform    | 4    | Frontend Platform         |
| CSS / Tokens / Vite Build         | 5    | Build / Frontend Platform |
| Governance / Guard / GitHub 治理  | 5    | Maintainer / Owner        |
| 依赖与工具链现代化                | 5    | Toolchain Maintainer      |
| 文档、风险与审批闭环              | 4    | PM / Architect            |

## 统计解读

- `P0` 阻断项中反馈链路、真实 E2E 失败、架构术语、审批结构已收敛；剩余 `GOV-001` 仍需 owner sign-off 后才能扩大 guard。
- `P1` 任务是主线架构优化：平台抽取、UI 边界、HTTP 边界、App Platform。
- `P2` 任务以治理/构建/依赖准备为主，必须在 P0/P1 稳定后分 lane 执行。
- `P3/P4` 不应混入当前修复，除非 owner 明确审批。

## 质量门槛

任一问题标记完成前必须同时满足：

1. 有实现或明确的 BLOCKED/DEFERRED 记录。
2. 有对应验证命令或人工审批证据。
3. 没有扩大到非本 lane 的源码范围。
4. 没有手工编辑 generated artifacts。
5. 对应文档和 ledger 状态已同步。
