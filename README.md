<div align="center">

# CCD

### 企业级 Vue 3 架构底座

[![Vue 3.5](https://img.shields.io/badge/Vue-3.5+-42b883?style=flat-square&logo=vuedotjs&logoColor=white)](https://vuejs.org/)
[![Vite 7](https://img.shields.io/badge/Vite-7-646cff?style=flat-square&logo=vite&logoColor=white)](https://vite.dev/)
[![PrimeVue 4](https://img.shields.io/badge/PrimeVue-4-41B883?style=flat-square)](https://primevue.org/)
[![UnoCSS](https://img.shields.io/badge/UnoCSS-66-333?style=flat-square&logo=unocss&logoColor=white)](https://unocss.dev/)
[![TypeScript 5.8](https://img.shields.io/badge/TypeScript-5.8-3178c6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Pinia 3](https://img.shields.io/badge/Pinia-3-ffd859?style=flat-square)](https://pinia.vuejs.org/)
[![Node.js >= 22](https://img.shields.io/badge/Node.js-%3E%3D22-339933?style=flat-square&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![pnpm](https://img.shields.io/badge/pnpm-10-f69220?style=flat-square&logo=pnpm&logoColor=white)](https://pnpm.io/)
[![License: GPL v3](https://img.shields.io/badge/License-GPL_v3-blue?style=flat-square)](./LICENSE)

**CCD** 不是模板堆砌，而是一套可持续演进的中后台前端架构。
它把分层边界、设计系统、低代码表单表格引擎、AI 协作规范和交付治理收敛到一个统一仓库中。

[在线演示](https://ichichuang.github.io/ccd/) · [架构文档](./docs/architecture.md) · [AI 工作区总览](./docs/ai-workspace.md) · [AI 工作区规范](./.ai/README.md)

</div>

---

## 项目定位

CCD 面向“需要长期维护”的 Vue 3 产品项目，而不是一次性 Demo。

你可以把它理解为一套已经内建以下约束的工程底座：

- 明确的分层与依赖方向：`HTTP -> Adapters -> API -> Hooks -> Stores -> Views`
- 可复用的中后台能力：`ProForm`、`ProTable`、RBAC、主题系统、图表主题管线
- 严格的 TypeScript 与工程化校验
- 面向多 AI 工具统一治理的协作协议
- 可审计、可阻断的生成层与架构治理链路

---

## 交付模型

仓库以 `main` 作为唯一架构主线：

- CCD 架构主体、示例模块、规范文档、AI 治理配置都直接在 `main` 演进
- Desktop / Tauri 运行时资产如果存在，也直接随仓库维护，不再通过派生分支同步脚本下发
- 生成层与治理层变更统一通过 `pnpm ai:sync`、`pnpm ai:sync:codex`、`pnpm ai:doctor`、`pnpm codex:preflight` 收敛
- CI 会重新执行生成同步并对 `AGENTS.md`、`.cursor/**`、`skills-lock.json` 做防漂移阻断

如果你要做架构层优化，默认直接在当前主线完成，并让本地门禁和 CI 门禁验证结果。

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

目标不是“换皮”，而是让 UI 语言可审计、可约束、可复用。

### 5. AI 协作治理

- `.ai/**` 是唯一规范源
- `AGENTS.md`、`.cursor/**` 都只是兼容适配输出
- Codex 通过仓库 canonical source 驱动，并把本机 `~/.codex/skills/**` 当作执行入口
- Cursor 作为兼容层继续可用，但不再主导技能源目录结构

---

## 快速开始

### 环境要求

| 工具    | 版本         |
| ------- | ------------ |
| Node.js | `>= 22.12.0` |
| pnpm    | `>= 10.0.0`  |

### 安装

```bash
git clone git@github.com:ichichuang/ccd.git
cd ccd
pnpm install
```

### 初始化 AI 工作区

首次安装依赖后，先生成本地兼容适配文件：

```bash
pnpm ai:sync
pnpm ai:sync:codex
pnpm ai:doctor
pnpm codex:preflight
```

说明：

- `pnpm ai:sync`：从 `.ai/**` 生成 `AGENTS.md` 与 `.cursor/**`
- `pnpm ai:sync:codex`：把 `.ai/skills/core/** + .ai/skills/codex/**` 安装到本机 `~/.codex/skills/**`
- `pnpm ai:doctor`：检查 canonical 资产与适配器是否漂移
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

以下文件或目录属于生成出来的兼容适配层，不应作为源文件直接维护：

- [AGENTS.md](./AGENTS.md)
- [.cursor/settings.json](./.cursor/settings.json)
- `.cursor/rules/**`
- `.cursor/skills/**`

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
pnpm ai:clean        # 保守清理空会话目录与本地 AI/浏览器残留
pnpm ai:clean -- --all # 激进清理 browser artifacts、tmp 与本机 Codex 浏览器缓存
pnpm ai:route:skills "任务描述" # 低 token 选择最小 skill 集合
pnpm ai:doctor       # 检查 AI 工作区结构
pnpm codex:preflight # 检查 Codex 开发前置条件
```

---

## 推荐开发流程

### 新环境启动

```bash
pnpm install
pnpm ai:sync
pnpm ai:doctor
pnpm codex:preflight
pnpm dev
```

### 提交前最少检查

```bash
pnpm check
pnpm test:run
pnpm ai:doctor
```

### 当你修改了 `.ai/**`

```bash
pnpm ai:sync
pnpm ai:doctor
```

不要直接改生成适配器，否则后续同步时一定会被覆盖。

---

## 关键文档

| 文档                                                                 | 说明                                        |
| -------------------------------------------------------------------- | ------------------------------------------- |
| [README.md](./README.md)                                             | 仓库入口、分支模型、启动方式、AI 统一规范   |
| [docs/architecture.md](./docs/architecture.md)                       | 架构拓扑、目录规约、核心能力细节            |
| [docs/ai-workspace.md](./docs/ai-workspace.md)                       | AI 工作区、技能拓扑、浏览器自动化、清理策略 |
| [docs/codex/quickstart.md](./docs/codex/quickstart.md)               | Codex 启动、技能路由、CRX 录制与回放        |
| [.ai/README.md](./.ai/README.md)                                     | AI 工作区标准与生成适配规则                 |
| [.ai/protocol/AI.entry.md](./.ai/protocol/AI.entry.md)               | AI 协议统一入口                             |
| [.ai/protocol/adapters/README.md](./.ai/protocol/adapters/README.md) | Codex / Cursor 适配说明索引                 |

---

## 面向产品项目的使用方式

如果你是基于 CCD 孵化业务项目，建议遵循以下原则：

- 把 `main` 视为架构能力源，不在业务分支里反向定义核心规范
- 保持 `.ai/**` 为单一事实来源，让不同 AI 工具共享同一套边界
- 优先复用现有抽象，不为单个需求破坏模块边界
- 用规则约束生成质量，而不是依赖一次性 prompt 运气

这样 Codex 与 Cursor 才能在你的项目里真正成为“遵守架构的工程执行者”，而不是随机生成器。

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
2. 本地通过 `pnpm check`
3. 本地通过 `pnpm ai:doctor`
4. 如涉及 AI 配置更新，执行 `pnpm ai:sync`

欢迎基于 `main` 提交通用架构优化，再由分支同步流程分发到派生交付线。

---

## 许可证

[GNU General Public License v3.0](./LICENSE)
