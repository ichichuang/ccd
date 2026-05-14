<div align="center">

# CCD

### 企业级 Vue 3 架构底座

[![Vue 3.5](https://img.shields.io/badge/Vue-3.5+-42b883?style=flat-square&logo=vuedotjs&logoColor=white)](https://vuejs.org/)
[![Vite 7](https://img.shields.io/badge/Vite-7-646cff?style=flat-square&logo=vite&logoColor=white)](https://vite.dev/)
[![PrimeVue 4](https://img.shields.io/badge/PrimeVue-4-41B883?style=flat-square)](https://primevue.org/)
[![UnoCSS](https://img.shields.io/badge/UnoCSS-66-333?style=flat-square&logo=unocss&logoColor=white)](https://unocss.dev/)
[![TypeScript 5.8](https://img.shields.io/badge/TypeScript-5.8-3178c6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Pinia 3](https://img.shields.io/badge/Pinia-3-ffd859?style=flat-square)](https://pinia.vuejs.org/)
[![Node.js 26.1](https://img.shields.io/badge/Node.js-26.1-339933?style=flat-square&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![pnpm](https://img.shields.io/badge/pnpm-10-f69220?style=flat-square&logo=pnpm&logoColor=white)](https://pnpm.io/)
[![License: GPL v3](https://img.shields.io/badge/License-GPL_v3-blue?style=flat-square)](./LICENSE)

**CCD** 不是模板堆砌，而是一套可持续演进的中后台前端架构。
它把分层边界、设计系统、低代码表单表格引擎、AI 协作规范和交付治理收敛到一个统一仓库中。

[在线演示](https://ichichuang.github.io/ccd/) · [架构文档](./docs/architecture.md) · [分支模型](./docs/branch-model.md) · [AI 工作区总览](./docs/ai-workspace.md) · [AI 工作区规范](./.ai/README.md)

</div>

---

## 项目定位

CCD 面向“需要长期维护”的 Vue 3 产品项目，而不是一次性 Demo。

你可以把它理解为一套已经内建以下约束的工程底座：

- 明确的分层与依赖方向：`HTTP -> Adapters -> API -> Hooks -> Stores -> Views`
- 可复用的中后台能力：`ProForm`、`ProTable`、RBAC、主题系统、图表主题管线
- 受治理的状态同步能力：`syncAction -> registry -> middleware -> transport -> owner store`
- 严格的 TypeScript 与工程化校验
- 面向多 AI 工具统一治理的协作协议
- 可审计、可阻断的生成层与架构治理链路

---

## 架构亮点

| 能力                        | 解决的问题                                                   | CCD 的做法                                                           |
| --------------------------- | ------------------------------------------------------------ | -------------------------------------------------------------------- |
| **State Governance System** | 多 Tab / 多设备同步容易失控、隐式广播、难追踪                | 通过 `syncAction(type, payload)` 和 registry 白名单显式声明同步能力  |
| **Owner Store Boundary**    | 同一状态被多个 store 同步或互相覆盖                          | handler 只能 patch owner store，副作用在 domain handler 中集中执行   |
| **Transport Isolation**     | 业务代码直接写 `BroadcastChannel` / `WebSocket` 导致旁路同步 | 状态同步传输收敛到 `src/sync/**`，非状态通道必须进入 guard allowlist |
| **Robust Chart Runtime**    | ECharts 在 Tabs、KeepAlive、隐藏容器、父容器 resize 下易空白 | `UseEcharts` 通过 ResizeObserver、IntersectionObserver、RAF 调度闭环 |
| **AI-Readable Governance**  | 人能理解但 AI 容易误用架构边界                               | `.ai/rules/**`、`.ai/README.md`、`pnpm ai:guard` 共同约束生成行为    |

这套同步能力不是“自动同步所有 store”，而是把跨端一致性建模为一种显式能力：

```text
User Intent
  -> syncAction(type, payload)
  -> registry allowlist
  -> middleware pipeline
  -> BroadcastChannel / WebSocket / Cloud
  -> owner store handler
```

因此 CCD 可以清楚回答三个问题：

- 哪些状态会同步
- 谁拥有这些状态
- 哪些传输通道被允许参与同步

完整设计见 [Explicit Sync Boundary](./docs/architecture.md#explicit-sync-boundary) 与 [.ai State Synchronization Contract](./.ai/README.md#state-synchronization-contract)。

---

## 分支与交付模型

当前仓库采用三条同级交付线，均从已优化完成的 `main` 基线派生：

| 分支                    | 定位                                                             | 维护边界                                                                   |
| ----------------------- | ---------------------------------------------------------------- | -------------------------------------------------------------------------- |
| `main`                  | CCD Web 架构主线，保留完整示例、架构文档、AI 治理与演示站能力    | 通用 Web 架构能力、设计系统、Pro 组件、AI 协议和工程门禁优先在这里演进     |
| `desktop-version`       | 基于最终 `main` 重新构建的 Tauri v2 桌面应用系统                 | Desktop/Tauri 运行时、桥接层、权限能力、桌面交付与桌面专项验证只在此线推进 |
| `main-portable-version` | 面向新项目拉取的纯净便携底座，移除不必要示例、演示目录和冗余配置 | 只保留可复用架构骨架、AI 治理最小集、基础工程命令与必要文档                |

`feat/tauri-integration` 已停止作为桌面开发目标，只保留为历史分支；不要再把它作为合并来源或冲突修复对象。

交付原则：

- 通用架构优化进入 `main`，再按需显式同步到 `desktop-version` 或 `main-portable-version`
- 桌面运行时能力只在 `desktop-version` 重建，不再把 Tauri 资产直接维护在 `main`
- 便携版清理只在 `main-portable-version` 进行，避免把示例删除反向带回 `main`
- 生成层与治理层变更统一通过 `pnpm ai:sync`、`pnpm ai:sync:codex`、`pnpm ai:doctor` 收敛；Codex 本地启动前再运行 `pnpm codex:preflight`
- CI 会运行 `pnpm ai:sync`、`pnpm ai:doctor`，并重新执行 `pnpm ai:sync && pnpm ai:sync:codex` 对 `AGENTS.md`、`CLAUDE.md`、`.ai/manifests/skills-lock.json` 做防漂移阻断

完整分支契约见 [Branch Model](./docs/branch-model.md)。

---

## 核心能力

### 1. 分层架构

- `src/adapters` 负责防腐层与 DTO 收敛
- `src/api` 负责 Alova 方法构建与模块边界
- `src/hooks` 负责组合式逻辑复用
- `src/stores` 负责 Pinia 状态管理
- `src/views` 负责业务与示例承载

### 2. ProForm DAG 引擎

- 使用拓扑排序管理字段依赖
- 内建 `disabledIf`、`requiredIf`、`visibleIf` 逻辑流水线
- 适合复杂联动表单而不是散乱的 watch 链

### 3. ProTable 配置驱动引擎

- 以配置描述列表页而不是重复样板
- 内建分页、筛选、排序、枚举渲染、虚拟滚动
- 让 CRUD 页面具备一致的实现边界

### 4. 三层设计系统

- Tier 1：CSS Variables 语义变量
- Tier 2：UnoCSS 语义 token 与 shortcuts
- Tier 3：PrimeVue Pass-Through 预设
- 主题预设维护：[Theme Presets](./docs/theme-presets.md)

目标不是“换皮”，而是让 UI 语言可审计、可约束、可复用。

### 5. 图表渲染基础设施

- 业务图表统一使用 `UseEcharts`，主题合并统一走 `useChartTheme`
- 渲染调度由 `echarts-render-core` 管理，覆盖尺寸变化、可见性变化与 KeepAlive 恢复
- `setOption` 支持 ECharts options 对象，并在容器未就绪时进入 pending flush
- 回归验证覆盖真实 canvas paint、Tabs、父容器 resize、`display:none -> block`、容器复用与 option 更新

更多细节见 [UseEcharts README](./src/components/UseEcharts/README.md) 与 [ECharts 与主题](./docs/architecture.md#echarts-与主题)。

### 6. 显式状态同步治理

- 同步入口统一为 `syncAction(type, payload)`
- 同步类型必须在 `src/sync/registry.ts` 或 domain registration 中注册
- middleware 统一处理本地持久化、传输和云端保存
- `BroadcastChannel` / `WebSocket` 不允许在业务层直接发送状态同步帧
- `theme`、`layout`、`size`、`locale` 等系统偏好已按 owner store 模式接入

这让状态同步从“store 变化监听”升级为“可审计、可扩展、可阻断的系统能力”。

### 7. AI 协作治理

- `.ai/**` 是唯一规范源
- `AGENTS.md`、`CLAUDE.md` 都只是兼容适配输出
- Codex 通过仓库 canonical source 驱动，并把本机 `~/.codex/skills/**` 当作执行入口
- Claude AI 通过 `CLAUDE.md` 指向同一份 `AGENTS.md` 协议入口

---

## 快速开始

### 环境要求

| 工具    | 版本        |
| ------- | ----------- |
| Node.js | `>= 26.1.0` |
| pnpm    | `>= 10.0.0` |

### 安装

```bash
git clone git@github.com:ichichuang/ccd.git
cd ccd
pnpm install
```

### 初始化 AI 工作区

首次安装依赖后，先生成本地兼容适配文件：

```bash
pnpm ai:setup:codex
```

等价展开：

```bash
pnpm ai:sync
pnpm ai:sync:codex
pnpm ai:doctor
pnpm codex:preflight
```

说明：

- `pnpm ai:sync`：从 `.ai/**` 生成 `AGENTS.md` 与 `CLAUDE.md`
- `pnpm ai:sync:codex`：把 `.ai/skills/core/** + .ai/skills/codex/**` 安装到本机 `~/.codex/skills/**`
- `pnpm ai:setup:codex`：执行 `ai:sync + ai:sync:codex + ai:doctor + codex:preflight`
- `pnpm ai:guard`：检查业务页面、路由模块、stores 是否违反架构生成约束
- `pnpm ai:doctor`：检查 canonical 资产与适配器是否漂移，并自动运行 `ai:guard` 与 `validate:tokens`
- `pnpm validate:tokens`：校验主题 token 对比度
- `pnpm drift-check`：检查页面 archetype、样式 token、构建文档/配置漂移
- `pnpm sync:desktop-config`：`desktop-version` 中 desktop/Tauri 相关改动时检查桌面配置面
- `pnpm codex:preflight`：检查 Codex 工作所需规则、技能、依赖是否齐备

### 启动开发

```bash
pnpm dev
```

### 构建与预览

```bash
pnpm build
pnpm preview
```

---

## AI 工作区规范

仓库已经完成 AI 配置统一收敛，当前标准如下：

- 唯一源目录：`.ai/`
- 规则目录：`.ai/rules/**`
- 技能目录：`.ai/skills/**`
- 协议目录：`.ai/protocol/**`
- 配置目录：`.ai/config/**`
- 清单与锁文件：`.ai/manifests/**`
- 本地运行态：`.ai/runtime/**`

### 你应该编辑什么

只编辑 `.ai/**` 下的 canonical 文件。

### 你不应该手动维护什么

以下文件属于生成出来的兼容适配层，不应作为源文件直接维护：

- [AGENTS.md](./AGENTS.md)
- [CLAUDE.md](./CLAUDE.md)

### 本地运行态文件

- versioned template: [.ai/runtime/repair_list.template.txt](./.ai/runtime/repair_list.template.txt)
- local generated state: `.ai/runtime/repair_list.txt`

这意味着仓库现在已经摆脱“规则、技能、入口文件四处分散维护”的状态，所有 AI 工具都回到同一个源头。Codex 使用本机 `~/.codex/skills/**` 作为技能发现入口，但这些技能同样由仓库里的 `.ai/skills/core/** + .ai/skills/codex/**` 统一生成。

更多细节见：[.ai/README.md](./.ai/README.md)

---

## 日常开发命令

```bash
pnpm dev             # 本地开发
pnpm build           # 生产构建
pnpm preview         # 本地预览
pnpm type-check      # vue-tsc
pnpm lint:check      # ESLint 检查
pnpm test:run        # Vitest 单次运行
pnpm check           # type-check + lint:check
pnpm ai:sync         # 生成 AI 兼容适配层
pnpm ai:sync:codex   # 安装本机 Codex skills
pnpm ai:setup:codex # ai:sync + ai:sync:codex + ai:doctor + codex:preflight
pnpm ai:clean        # 保守清理空会话目录与本地 AI/浏览器残留
pnpm ai:clean -- --all # 激进清理 browser artifacts、tmp 与本机 Codex 浏览器缓存
pnpm ai:route:skills "任务描述" # 低 token 选择最小 skill 集合
pnpm ai:scaffold:view-route -- --segment system/user --title-key router.system.user.index --kind table # 生成页面/路由/Hook 骨架
pnpm ai:guard        # 检查 AI 生成结果是否违反架构约束
pnpm ai:doctor       # 检查 AI 工作区结构，并自动运行 ai:guard + validate:tokens
pnpm validate:tokens # 校验主题 token 对比度
pnpm drift-check     # 检查 archetype、样式 token、构建文档/配置漂移
pnpm sync:desktop-config # desktop-version 中 desktop/Tauri 相关改动时检查桌面配置面
pnpm codex:preflight # 检查 Codex 开发前置条件
```

---

## 推荐开发流程

### 新环境启动

```bash
pnpm install
pnpm ai:setup:codex
pnpm dev
```

### 提交前最少检查

```bash
pnpm ai:doctor    # includes ai:guard and validate:tokens
pnpm type-check
pnpm drift-check
pnpm test:run
pnpm lint:check
```

Husky pre-commit additionally runs `pnpm lint:staged:safe`; lint-staged reruns `pnpm ai:guard --staged` for staged Vue/TS surfaces.

### 当你修改了 `.ai/**`

```bash
pnpm ai:sync
pnpm ai:sync:codex
pnpm ai:doctor
pnpm codex:preflight
```

不要直接改生成适配器，否则后续同步时一定会被覆盖。

### 当你让 AI 新增业务页面/路由

```bash
pnpm ai:scaffold:view-route -- --segment system/user --title-key router.system.user.index --kind table
pnpm ai:guard
pnpm ai:doctor
```

先生成骨架，再让 AI 在骨架上填充业务逻辑；不要让 AI 自由生成整套 page/route/hook。

---

## 关键文档

| 文档                                                                 | 说明                                        |
| -------------------------------------------------------------------- | ------------------------------------------- |
| [README.md](./README.md)                                             | 仓库入口、分支模型、启动方式、AI 统一规范   |
| [docs/branch-model.md](./docs/branch-model.md)                       | main / desktop-version / portable 分支契约  |
| [docs/architecture.md](./docs/architecture.md)                       | 架构拓扑、显式状态同步边界、核心能力细节    |
| [docs/ai-workspace.md](./docs/ai-workspace.md)                       | AI 工作区、技能拓扑、浏览器自动化、清理策略 |
| [docs/codex/quickstart.md](./docs/codex/quickstart.md)               | Codex 启动、技能路由、CRX 录制与回放        |
| [.ai/README.md](./.ai/README.md)                                     | AI 工作区标准、同步契约与生成适配规则       |
| [.ai/protocol/AI.entry.md](./.ai/protocol/AI.entry.md)               | AI 协议统一入口                             |
| [.ai/protocol/adapters/README.md](./.ai/protocol/adapters/README.md) | Codex / Claude 适配说明索引                 |

---

## 面向产品项目的使用方式

如果你是基于 CCD 孵化业务项目，建议遵循以下原则：

- 新项目优先从 `main-portable-version` 拉取纯净架构底座
- 通用能力回补到 `main`，桌面运行时能力进入 `desktop-version`
- 保持 `.ai/**` 为单一事实来源，让不同 AI 工具共享同一套边界
- 优先复用现有抽象，不为单个需求破坏模块边界
- 用规则约束生成质量，而不是依赖一次性 prompt 运气

这样 Codex 与 Claude AI 才能在你的项目里共享同一套架构协议，成为“遵守架构的工程执行者”，而不是随机生成器。

### 低 Token 浏览器自动化

当前推荐链路：

- 用 Playwright CRX 录制真实浏览器操作并导出 Python
- 用 `.ai/skills/codex/architecture-browser-master/scripts/browser_automator.py flow-import` 导入为本地 flow JSON
- 用 `flow-run` 复用同一条自动化流，并结合 `state-save/state-load` 复用登录态

这让 AI 负责高层编排与结果判断，本地脚本负责重复浏览器动作，从而显著减少反复读取 DOM、截图和日志带来的 token 开销。

### 文档系统升级后的阅读顺序

如果你想完整理解这套架构，建议按这个顺序阅读：

1. [README.md](./README.md)
2. [docs/architecture.md](./docs/architecture.md)
3. [docs/ai-workspace.md](./docs/ai-workspace.md)
4. [docs/codex/quickstart.md](./docs/codex/quickstart.md)

这样可以把产品架构、AI 工作区、Codex 操作流程和桌面交付同步放在同一套认知模型里，而不是分散理解。

---

## 贡献

提交前请至少保证：

1. 遵守 [Conventional Commits](https://www.conventionalcommits.org/)
2. 本地通过 `pnpm ai:doctor`、`pnpm type-check`、`pnpm drift-check`、`pnpm test:run`、`pnpm lint:check`
3. 如涉及 AI 配置更新，执行 `pnpm ai:sync`、`pnpm ai:sync:codex`、`pnpm codex:preflight`

欢迎基于 `main` 提交通用架构优化；Desktop / Tauri 运行时资产请进入 `desktop-version`，便携底座清理请进入 `main-portable-version`。

---

## 许可证

[GNU General Public License v3.0](./LICENSE)
