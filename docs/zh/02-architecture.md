# CCD 架构

## 包角色

### 核心架构不变量

简化的核心依赖方向仍然是：

```text
@ccd/contracts -> @ccd/core -> apps/*
```

这是硬约束，不能反向依赖，也不能跨层穿透。

实际工作区还包含一组受治理保护的前端共享包。

### 核心层

| 目录                 | 角色                       |
| -------------------- | -------------------------- |
| `packages/contracts` | 公共 ABI：仅接口与共享类型 |
| `packages/core`      | 最小运行时无关适配门面     |

### 前端共享包（受治理保护的工作区包）

| 目录                            | 角色                        |
| ------------------------------- | --------------------------- |
| `packages/design-tokens`        | 设计 token 源               |
| `packages/shared-utils`         | 纯共享工具函数              |
| `packages/unocss-preset`        | 共享 UnoCSS 预设            |
| `packages/vue-hooks`            | 共享 Vue / 浏览器组合式函数 |
| `packages/vue-ui`               | 共享 Vue UI 基础组件        |
| `packages/vue-primevue-adapter` | PrimeVue 专用主题与适配层   |
| `packages/vue-charts`           | 共享图表运行时与辅助函数    |

### 应用层

| 目录            | 角色                                                                         |
| --------------- | ---------------------------------------------------------------------------- |
| `apps/web-demo` | 应用外壳、路由、页面、stores、应用适配层，以及暂时仍留在应用内的共享候选模块 |
| `apps/desktop`  | Tauri 桌面外壳与桌面适配层                                                   |

### 根

| 目录   | 角色     |
| ------ | -------- |
| `root` | 编排外壳 |

这些前端共享包仍然必须遵守各自的治理角色、包导出边界和运行时边界规则。

`packages/core` 不是前端共享能力的大桶；它只承担最小运行时无关适配门面职责。

## 工作区职责矩阵

| 工作区                          | 当前职责                                                                     |
| ------------------------------- | ---------------------------------------------------------------------------- |
| `packages/contracts`            | 跨运行时接口与 DTO 契约，仅承担契约边界职责                                  |
| `packages/core`                 | 最小运行时无关适配门面，不承担前端共享平台收纳职责                           |
| `packages/shared-utils`         | 纯共享工具函数                                                               |
| `packages/vue-hooks`            | 共享 Vue / 浏览器组合式函数                                                  |
| `packages/vue-ui`               | 共享 Vue UI 基础组件                                                         |
| `packages/vue-primevue-adapter` | PrimeVue 专用主题与适配层                                                    |
| `packages/vue-charts`           | 共享图表运行时与辅助函数                                                     |
| `apps/web-demo`                 | 应用外壳、路由、页面、stores、应用适配层，以及暂时仍留在应用内的共享候选模块 |
| `apps/desktop`                  | Tauri 桌面外壳与桌面适配层                                                   |

## App-local shared candidates

以下路径目前仍归 `apps/web-demo` 所有，但应被视为“应用内共享候选模块”，不是立即迁移目标：

- `apps/web-demo/src/hooks/modules/useAutoMitt.ts`
- `apps/web-demo/src/hooks/modules/useDialog.tsx`
- `apps/web-demo/src/utils/theme/engine.ts`（兼容 facade）
- `apps/web-demo/src/utils/theme/sizeEngine.ts`
- `apps/web-demo/src/utils/safeStorage`

## Do not move yet

以下区域当前不应作为 Phase 1 的迁移对象：

- `packages/core/src/index.ts`
- `apps/web-demo/src/main.ts`
- `apps/web-demo/src/plugins/**`
- `apps/web-demo/src/router/**`
- `apps/web-demo/src/stores/**`
- `apps/web-demo/src/views/**`
- `apps/web-demo/src/utils/date/dateUtils.ts`
- `apps/web-demo/src/utils/theme/engine.ts`
- `apps/web-demo/src/components/ProForm/**`
- `apps/web-demo/src/components/ProTable/**`

## 运行时无关规则

`packages/contracts` 和 `packages/core` 不得出现以下内容：

- 浏览器全局对象
- Node 内建模块
- Tauri API
- `fetch`
- `console`
- `crypto`
- `localStorage` / `sessionStorage`
- `setTimeout` / `setInterval` 等定时器直接使用

运行时能力必须通过 contracts 定义的接口注入。

## 适配层边界

运行时能力只能出现在应用适配层：

- `apps/web-demo/src/adapters/**`
- `apps/desktop/src/adapters/**`

适配层只负责翻译与接入，不应当成为业务规则中心。

## 包输出模型

`packages/contracts` 与 `packages/core` 的对外消费形式均为构建产物：

- `dist/index.js`
- `dist/index.d.ts`

应用包通过 workspace 包引用这些构建产物，而不是直接把源码当运行时入口。

## 为什么 tsconfig.base.json 不能包含全局 @ccd/\* 路径

`tsconfig.base.json` 不应包含全局 `@ccd/*` 路径映射。

原因：

- 本仓库是多包 monorepo
- 包之间应通过 workspace 协议与构建产物边界解耦
- 全局路径映射会掩盖真实依赖关系
- 它会导致类型检查、构建和运行时边界校验结果不一致

正确做法是让每个包维护自己的 `tsconfig.json`，并依赖包导出与构建产物。

## 推荐阅读

- 架构总览：[docs/architecture.md](../architecture.md)
- 架构契约（英文 AI）：[docs/en/architecture-contract.md](../en/architecture-contract.md)
