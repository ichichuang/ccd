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

| 目录                            | 角色                           |
| ------------------------------- | ------------------------------ |
| `packages/design-tokens`        | 设计 token 源                  |
| `packages/shared-utils`         | 纯共享工具函数                 |
| `packages/unocss-preset`        | 共享 UnoCSS 预设               |
| `packages/vue-hooks`            | 共享 Vue / 浏览器组合式函数    |
| `packages/vue-app-platform`     | 共享前端应用启动与平台编排原语 |
| `packages/vue-ui`               | 共享 Vue UI 基础组件           |
| `packages/vue-primevue-adapter` | PrimeVue 专用主题与适配层      |
| `packages/vue-charts`           | 共享图表运行时与辅助函数       |

### 应用层

| 目录            | 角色                                                                                                         |
| --------------- | ------------------------------------------------------------------------------------------------------------ |
| `apps/web-demo` | 浏览器 `web-demo` 应用外壳、路由、页面 / views、插件、stores、应用适配层与兼容门面；不是公共能力导出面       |
| `apps/desktop`  | 专用 Tauri 桌面运行时外壳，拥有自己的前端入口、桌面适配层与 `src-tauri` 后端边界；不是 `web-demo` 的完整复制 |

### 根

| 目录   | 角色     |
| ------ | -------- |
| `root` | 编排外壳 |

这些前端共享包仍然必须遵守各自的治理角色、包导出边界和运行时边界规则。

`packages/core` 不是前端共享能力的大桶；它只承担最小运行时无关适配门面职责。

当前接受的目标定义：

- `apps/*` 拥有运行时外壳、应用适配层、路由 / 页面 / 插件 / store 表面与兼容门面。
- 可复用或需要对 monorepo 公开的能力，必须进入受治理的 `packages/*`，并通过包导出暴露。
- `apps/*` 可以临时承载已分类的 app-local 候选模块，但这不授权把 app 路径变成公共共享能力导出面。
- `packages/core` 必须保持最小、运行时无关，不得演变为前端共享杂物桶。

应用角色边界：

- `apps/web-demo` 是浏览器 `web-demo` 应用外壳，拥有浏览器入口、路由、页面 / views、stores、应用适配层与应用级 plugin wiring。
- `apps/desktop` 是专用 Tauri 桌面运行时外壳，拥有自己的前端入口、桌面适配层与 `apps/desktop/src-tauri/**` 后端边界；它不复制 `apps/web-demo` 的完整应用。
- 共享 components、tokens、hooks、UI primitives、PrimeVue adapter、contracts、runtime-neutral logic 和其他可公开复用能力归 `packages/*`。
- App-specific routes、stores、pages / views、plugin wiring、运行时能力接入与兼容门面保持 app-local。

## 工作区职责矩阵

| 工作区                          | 当前职责                                                                                                  |
| ------------------------------- | --------------------------------------------------------------------------------------------------------- |
| `packages/contracts`            | 跨运行时接口与 DTO 契约，仅承担契约边界职责                                                               |
| `packages/core`                 | 最小运行时无关适配门面，不承担前端共享平台收纳职责                                                        |
| `packages/design-tokens`        | 设计 token 与纯 theme / size / breakpoint / device derivation                                             |
| `packages/shared-utils`         | 纯共享工具函数                                                                                            |
| `packages/unocss-preset`        | 共享 UnoCSS 预设、safelist 与构建期样式辅助                                                               |
| `packages/vue-hooks`            | 共享 Vue / 浏览器组合式函数                                                                               |
| `packages/vue-app-platform`     | 适用时仅拥有纯 app-platform / layout helpers                                                              |
| `packages/vue-ui`               | 共享 Vue UI 基础组件                                                                                      |
| `packages/vue-primevue-adapter` | PrimeVue 专用主题与适配层                                                                                 |
| `packages/vue-charts`           | 共享图表运行时与辅助函数                                                                                  |
| `apps/web-demo`                 | 浏览器 `web-demo` 应用外壳、路由 / 页面 / views / 插件 / stores、应用适配层与兼容门面；不是公共能力导出面 |
| `apps/desktop`                  | 专用 Tauri 桌面运行时外壳、自有前端入口、桌面适配层与 `src-tauri` 后端边界；不是公共能力导出面            |

## App-local shared candidates

以下路径目前仍归 `apps/web-demo` 所有，但应被视为已分类的 app-local surfaces，不是立即迁移目标。分类只记录当前角色和未来 owner lane，不表示批准永久留在 app 内，也不表示允许从这些 app 路径直接形成公共共享能力导出面。

- `apps/web-demo/src/hooks/modules/useAutoMitt.ts`
- `apps/web-demo/src/hooks/modules/useDialog.tsx`
- `apps/web-demo/src/hooks/modules/useProTableUrlSync.ts`
- `apps/web-demo/src/layouts/runtime/layoutRuntime.ts`
- `apps/web-demo/src/plugins/modules/primevue.ts`
- `apps/web-demo/src/plugins/modules/proform.ts`
- `apps/web-demo/src/plugins/modules/protable.ts`
- `apps/web-demo/src/utils/http/**`（app HTTP infrastructure；未批准 runtime migration）
- `apps/web-demo/src/utils/theme/engine.ts`（兼容 facade）
- `apps/web-demo/src/utils/theme/sizeEngine.ts`（兼容 facade；M8 后纯尺寸 resolver 位于 `packages/design-tokens`）
- `apps/web-demo/src/utils/theme/mode.ts` 与 `apps/web-demo/src/utils/theme/transitions.ts`（M5 migration candidates）
- `apps/web-demo/src/utils/theme/**` 下的纯 helper residue（目标为 `packages/design-tokens` 或 stale-doc cleanup）
- `apps/web-demo/src/utils/deviceSync.ts`（M5 migration candidate）
- `apps/web-demo/src/utils/safeStorage`（app-owned safeStorage runtime facade、browser storage、security/crypto、compression、serializer、storage maintenance 与 migration behavior；JSON codec helpers 由 `@ccd/shared-utils` package-owned，type-only storage contracts 由 `@ccd/contracts` package-owned）
- `apps/web-demo/src/stores/modules/system/**`（app stores；未来只抽取纯逻辑或 runtime primitives）

M3 已将现有非适配层浏览器运行时访问登记为 `.ai/governance/policies/runtime.json` 中的精确 file/surface 例外。它们只表示现有债务已分类，不表示允许新增同类路径或扩散运行时访问。

M5 extraction planning 进一步细化这些候选，但不迁移 source code：

- safeStorage 的 storage contracts 是 `@ccd/contracts` package-owned 的 type-only contracts。JSON codec helpers 由 `@ccd/shared-utils` package-owned；app pack/unpack orchestration 仍归 app，因为它组合 app crypto、`lz-string`、env、browser storage、logging 与 migration behavior。
- D-016 已批准 safeStorage crypto/security behavior 归 app 所有：Crypto/HMAC/Web Crypto、frontend obfuscation-key resolution、app env access 与 logger coupling 都是 `apps/web-demo` 下的 terminal runtime boundaries。前端 encryption/obfuscation 是 client-visible，不能描述为 server-grade 或 secret-grade security。
- D-019 已批准 `lz-string` compression 归 app 所有。`lz-string` compression、Pinia serializer、storage maintenance helpers、migration/fallback behavior、browser storage access 与 app safeStorage facade exports 都是 `apps/web-demo` 下的 app-owned terminal/runtime boundaries；它们不再以 `@ccd/shared-utils` 为迁移目标。
- theme、size、device 拆分为：纯 theme/size/breakpoint/device derivation 进入 `packages/design-tokens`；`packages/vue-app-platform` 适用时仅拥有纯 app-platform/layout helpers。浏览器 DOM 写入、`style.cssText` mutation、storage persistence、preload reads、device listeners、transitions、desktop root-var setup 与 Pinia store wiring 都归 app 所有。
- `useAutoMitt`、`useDialog`、`useProTableUrlSync` 保持为基于 `packages/vue-hooks` / `packages/vue-ui` primitives 与 adapter keys 的 thin app facades。

M6 只记录更早的 proposed decision packet。当前 active safeStorage ownership 已由 D-016 与 D-019 取代：crypto/security 与 `lz-string` compression 是已批准的 app-owned terminal boundaries，JSON codec helpers 与 type-only storage contracts 分别保持在 `@ccd/shared-utils` 和 `@ccd/contracts`。

M8 已将纯尺寸变量生成、根字号决策、布局尺寸决策、预设回退和局部内容尺寸变量 resolver 建立在 `packages/design-tokens`。D-025 theme-runtime repair 将纯 theme/size/device derivation 保持在 `packages/design-tokens`，并从 `@ccd/vue-app-platform` public API 移除 browser-coupled theme DOM/storage writer。浏览器 DOM 写入、`style.cssText` mutation、storage persistence、preload reads、device collectors/listeners、transitions、desktop root-var setup 与 Pinia store 行为仍归 app 所有。

M9 已将纯 device、OS、breakpoint、orientation、viewport metrics resolver 建立在 `packages/design-tokens`。浏览器采集、listener lifecycle、`visualViewport`、rAF/timer 与 Pinia state 仍归 `apps/web-demo`。

M10 已将纯 layout visibility reducer 建立在 `packages/vue-app-platform`。`apps/web-demo/src/stores/modules/system/layout.ts` 仍拥有 Pinia layout state、persistence、`syncAction`、loading counters、mobile drawer runtime state 与 app singleton access。

M11 已验证 hook/facade 收敛，但不迁移生产行为。`useAutoMitt`、`useDialog`、`useProTableUrlSync` 继续分别作为 app event map、app i18n defaults、app router query semantics 的兼容 facade。ProForm 与 ProTable plugin modules 继续作为 app integration shells，把 app date/storage/router capabilities 注入 `@ccd/vue-ui`。

## PrimeVue 边界

`packages/vue-primevue-adapter` 拥有 PrimeVue theme、PT、locale、runtime install、services 和 integration adapters。`packages/vue-ui` 可以在内部组合 PrimeVue，但公开 API 必须是 CCD-owned props/types，不能把 raw PrimeVue components 作为松散 public bucket 导出。

App bootstrap/plugin 文件通过 adapter-owned `installPrimeVueRuntime()` 安装 PrimeVue；该入口组合 `createPrimeVueAdapterConfig()` 与 `installPrimeVueServices()`。App global shell 文件通过 `PrimeVueGlobalToast`、`PrimeVueGlobalConfirmPopup`、`PrimeVueGlobalDynamicDialog`、`usePrimeVueToastService`、`usePrimeVueRuntimeConfig`、locale helpers 和 global message helpers 等 adapter facades 消费 PrimeVue 行为，不再持有 raw PrimeVue imports。

P29/P31 后的当前状态：app-side PrimeVue exact allowlist 为 0 行，`apps/web-demo/src/views/example/components/primevue-collection/**` showcase exception 已移除，`C-06` 已关闭。Generated/build references 由各自 command-owned boundaries 另行治理，不属于 app exact allowlist rows。

新增 app 侧 raw `primevue/*` 或 `@primevue/*` imports 仍被禁止，除非未来 explicit owner decision 授权并分类 exact exception。

历史说明：M5/M6 记录的是 source migration 之前无安全未授权缩减的状态。P26 到 P31 已通过受治理 adapter/UI 边界迁移 bootstrap、generated registry、global shell 与 showcase usage，并取代该 active status。

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
- 注入 router/store/i18n/browser capabilities 的 app-local compatibility facades

## 运行时无关规则

`packages/contracts` 和 `packages/core` 必须保持严格运行时无关，不得出现以下内容：

- 浏览器全局对象
- Node 内建模块
- Tauri API
- `fetch`
- `console`
- `crypto`
- `localStorage` / `sessionStorage`
- `setTimeout` / `setInterval` 等定时器直接使用

运行时能力必须通过 contracts 定义的接口注入。

`packages/design-tokens` 与 `packages/shared-utils` 也属于运行时无关包类。当前少量诊断或测试重置相关 runtime 引用被登记为待清理候选，不是包级运行时授权。

## 适配层边界

运行时能力优先由应用适配层拥有：

- `apps/web-demo/src/adapters/**`
- `apps/desktop/src/adapters/**`

适配层只负责翻译与接入，不应当成为业务规则中心。

现有非适配层浏览器 runtime 使用必须通过精确例外登记；新增未分类 production runtime surface 会被 `pnpm arch:runtime` 拦截。M3 不迁移 hooks、stores、utils、views 或 package runtime source。

## 包输出模型

内部 workspace 包的对外消费形式均为构建产物：

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

应用 tsconfig 不应 include `../../packages/*/src/**` 源码通配符。M13 已将 `apps/web-demo` 和 `apps/desktop` 改为通过 workspace 包导出和 `pnpm ci:prepare-internal` 生成的构建产物进行类型检查，并由 `pnpm arch:boundaries` 防止回退。

Root tooling scripts 不应 import `apps/web-demo/src/utils/theme/**`、`@/utils/theme/**` 或 app-local `src/utils/theme/**`。M13a 已将 `scripts/upgrade-all-themes.mjs` 与 `scripts/validate-token-contrast.ts` 改为通过 `@ccd/design-tokens/theme-engine` public exports 使用纯 theme helpers，并由 `pnpm arch:boundaries` 防止回退。

## 推荐阅读

- 架构总览：[docs/architecture.md](../architecture.md)
- 架构契约（英文 AI）：[docs/en/architecture-contract.md](../en/architecture-contract.md)
