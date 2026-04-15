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
它把分层边界、设计系统、低代码表单表格引擎、AI 协作规范和多分支交付流程收敛到一个统一仓库中。

[在线演示](https://ichichuang.github.io/ccd/) · [架构文档](./docs/architecture.md) · [AI 工作区规范](./.ai/README.md)

</div>

---

## 项目定位

CCD 面向“需要长期维护”的 Vue 3 产品项目，而不是一次性 Demo。

你可以把它理解为一套已经内建以下约束的工程底座：

- 明确的分层与依赖方向：`HTTP -> Adapters -> API -> Hooks -> Stores -> Views`
- 可复用的中后台能力：`ProForm`、`ProTable`、RBAC、主题系统、图表主题管线
- 严格的 TypeScript 与工程化校验
- 面向多 AI 工具统一治理的协作协议
- 主分支到桌面端分支的同步交付机制

---

## 分支模型

仓库采用“主分支为核心源，桌面端分支为派生交付”的模型：

- `main`
  - 核心分支
  - 保留 CCD 架构主体、示例模块、规范文档、AI 治理配置
  - 所有通用能力优化都应优先在 `main` 完成
- `feat/tauri-integration`
  - 桌面端派生分支
  - 基于 `main` 的架构能力进行 Tauri 集成与桌面端交付
  - 通过仓库脚本从 `main` 同步，避免把桌面端特化逻辑反向污染核心分支

如果你要做架构层优化，默认应该先在 `main` 改，再通过同步流程下发到桌面端分支。

---

## 主分支到桌面端同步

桌面端分支不是手工长期维护的平行代码线，而是从 `main` 派生出来的交付分支。

默认同步命令：

```bash
node scripts/sync-main-to-desktop.mjs
```

同步脚本当前行为：

- 先要求当前主工作区是干净状态
- 从 `origin/main` 与 `origin/feat/tauri-integration` 获取最新远端状态
- 使用临时 `git worktree` 在隔离目录内完成桌面端同步，不污染当前 `main` 工作区
- 在桌面端分支内执行 `merge main -> feat/tauri-integration`
- 自动剥离示例模块：`src/views/example`、`src/router/modules/example.ts`
- 自动把示例 locale 写回桌面端占位内容，避免主分支示例内容泄漏到桌面交付线
- 保留桌面端专属资产，例如 `src-tauri/**`、`scripts/sync-desktop-config.mjs`、`src/utils/env.ts`、`src/utils/tauriNativeUx.ts`、桌面端 CI 工作流等
- `package.json` 采用“主分支基础 + 桌面端增量”合并策略：版本号跟随 `main`，桌面端脚本和依赖继续保留
- 同步后自动执行桌面端分支的 `pnpm install --no-frozen-lockfile` 与 `pnpm type-check`
- 有改动时自动提交并推送到 `origin/feat/tauri-integration`

并发保护：

- 如果同步窗口内远端桌面端分支被别的进程推进，但最终树内容与本次同步结果一致，脚本会把它判定为“已同步”，不会再把这种场景误报为失败

使用约束：

- 同步前先把通用优化提交到 `main`
- 不要在脏工作区直接运行同步脚本
- 不要把桌面端分支当成示例页的承载分支；示例内容会被同步策略主动剥离
- 如果你要修改同步规则，应直接修改 [scripts/sync-main-to-desktop.mjs](./scripts/sync-main-to-desktop.mjs)

常见结果判断：

- 当前工作区始终留在 `main`：说明 worktree 隔离正常
- 桌面端分支与 `main` 不完全一致：这是预期行为，因为 README、Tauri 资产、桌面端脚本和部分运行时桥接文件会被保留
- 示例页面没有进入桌面端：这是同步策略，不是漏合并

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

| 文档                                                                 | 说明                                      |
| -------------------------------------------------------------------- | ----------------------------------------- |
| [README.md](./README.md)                                             | 仓库入口、分支模型、启动方式、AI 统一规范 |
| [docs/architecture.md](./docs/architecture.md)                       | 架构拓扑、目录规约、核心能力细节          |
| [.ai/README.md](./.ai/README.md)                                     | AI 工作区标准与生成适配规则               |
| [.ai/protocol/AI.entry.md](./.ai/protocol/AI.entry.md)               | AI 协议统一入口                           |
| [.ai/protocol/adapters/README.md](./.ai/protocol/adapters/README.md) | Codex / Claude / Cursor 适配说明索引      |

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
