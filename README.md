<div align="center">

# CCD

### 自保护确定性多运行时平台架构

[![Vue 3.5](https://img.shields.io/badge/Vue-3.5+-42b883?style=flat-square&logo=vuedotjs&logoColor=white)](https://vuejs.org/)
[![Vite 7](https://img.shields.io/badge/Vite-7-646cff?style=flat-square&logo=vite&logoColor=white)](https://vite.dev/)
[![TypeScript 5.8](https://img.shields.io/badge/TypeScript-5.8-3178c6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Turborepo](https://img.shields.io/badge/Turborepo-2-black?style=flat-square&logo=turborepo)](https://turbo.build/repo)
[![pnpm](https://img.shields.io/badge/pnpm-10-f69220?style=flat-square&logo=pnpm&logoColor=white)](https://pnpm.io/)
[![License: GPL v3](https://img.shields.io/badge/License-GPL_v3-blue?style=flat-square)](./LICENSE)

[中文文档](./docs/README.md) · [English AI Docs](./README.en.md) · [治理总览](./docs/governance.md) · [API Surface](./docs/generated/api-surface-report.md) · [治理报告](./docs/generated/governance-report.md)

</div>

---

## CCD 是什么

CCD 是一个面向确定性、AI 安全、多运行时产品体系的企业级受控平台仓库。

它不只是一个 monorepo，而是一套自保护平台架构：

- 机器可读的架构策略
- 运行时无关的 `contracts` 与 `core`
- 隔离的应用运行时适配层
- 公共 API 快照治理
- 供应链治理
- 发布拓扑校验
- AI 生成代码护栏
- GitHub CI 统一治理门禁

## 当前治理状态

- 当前修复车道：`P4_REMOTE_GOVERNANCE_CLOSURE`
- P1/P2/P3 已完成项保持关闭；当前分支仅收敛 GitHub 远端治理、P4 战略延期说明与本地治理文档状态。
- `pnpm ai:doctor --open` 以 `.ai/runtime/repair_list.md` 当前 ledger 为准；不再沿用旧的 0 open tasks 文案。
- GitHub `main` branch protection 已按 2026-06-08 P4 授权收敛：要求 PR、1 个 approval、conversation resolution、linear history、禁止 force push/delete，并要求 `Core Quality` 与 `E2E QA`。

## 架构定位

本仓库的核心目标不是“前端重构”，而是建立一个可长期维护、可自动守护、可跨运行时演进的平台骨架。

关键设计决策：

- `packages/contracts` 只放接口与共享类型
- `packages/core` 是最小运行时无关适配门面，不是前端共享大桶
- `apps/web-demo` 是浏览器 `web-demo` 应用外壳；`apps/desktop` 是专用 Tauri 桌面运行时外壳；它们都不是 monorepo 公共能力导出层
- 可复用或需要对 monorepo 公开的能力，必须进入受治理的 `packages/*`，并通过包导出暴露
- 除非未来有明确 owner decision，禁止从 `apps/*` 新建公共共享 capability exports
- 浏览器能力只在 `apps/web-demo` 的适配层出现
- 桌面能力只在 `apps/desktop` 的适配层出现
- 根目录只负责编排，不承载业务运行时代码

## 核心拓扑

简化的架构不变量仍然是：

```text
@ccd/contracts -> @ccd/core -> apps/*
```

这是硬约束，不能反向依赖，也不能跨层穿透。

`packages/contracts` 和 `packages/core` 不得出现浏览器、Node、Tauri、定时器、crypto、storage、network、console 等运行时全局对象。

### 完整工作区包图

实际工作区还包含一组受治理保护的前端共享包。

```text
packages/contracts          -> 公共 ABI：仅接口与共享类型
packages/core               -> 运行时无关平台逻辑
packages/design-tokens      -> 设计 token 源
packages/shared-utils       -> 共享运行时安全工具
packages/unocss-preset      -> 共享 UnoCSS 预设
packages/vue-hooks          -> 可复用 Vue 组合式函数
packages/vue-app-platform   -> 共享前端应用启动、生命周期与平台编排原语
packages/vue-ui             -> 共享 Vue UI 基础组件
packages/vue-primevue-adapter -> PrimeVue 集成适配器
packages/vue-charts         -> 图表集成层
apps/web-demo               -> 浏览器 web-demo 应用外壳、路由、stores、views 与应用适配层
apps/desktop                -> Tauri 桌面运行时外壳、自有前端入口与 src-tauri 后端边界
root                        -> 仅编排外壳
```

这些前端共享包仍然是受治理保护的工作区包，仍然必须遵守各自的治理角色、包导出边界和运行时边界规则。运行时能力只允许出现在应用适配层。根目录只负责编排。

## 工作区职责矩阵

| 工作区                          | 当前职责                                                                                                     |
| ------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| `packages/contracts`            | 跨运行时接口与 DTO 契约，仅承担契约边界职责                                                                  |
| `packages/core`                 | 最小运行时无关适配门面，不承担前端共享平台收纳职责                                                           |
| `packages/design-tokens`        | 设计 token、主题、尺寸、断点原语与纯 size/device resolver                                                    |
| `packages/shared-utils`         | 纯共享工具函数                                                                                               |
| `packages/unocss-preset`        | 共享 UnoCSS 预设、safelist 与构建期样式辅助                                                                  |
| `packages/vue-hooks`            | 共享 Vue / 浏览器组合式函数                                                                                  |
| `packages/vue-app-platform`     | 共享前端应用启动、生命周期与平台编排原语                                                                     |
| `packages/vue-ui`               | 共享 Vue UI 基础组件                                                                                         |
| `packages/vue-primevue-adapter` | PrimeVue 专用主题与适配层                                                                                    |
| `packages/vue-charts`           | 共享图表运行时与辅助函数                                                                                     |
| `apps/web-demo`                 | 浏览器 `web-demo` 应用外壳、路由、页面、views、stores、插件装配、应用适配层与兼容门面；不是公共能力导出面    |
| `apps/desktop`                  | 专用 Tauri 桌面运行时外壳，拥有自己的前端入口、桌面适配层与 `src-tauri` 后端边界；不是 `web-demo` 的完整复制 |

## 应用角色与共享归属

- `apps/web-demo` 是浏览器 `web-demo` 应用外壳，拥有浏览器入口、路由、页面 / views、stores、应用适配层与应用级插件装配。
- `apps/desktop` 是专用 Tauri 桌面运行时外壳，拥有自己的前端入口、桌面适配层与 `apps/desktop/src-tauri/**` 后端边界；它不是 `apps/web-demo` 的完整复制。
- 共享 components、design tokens、hooks、UI primitives、PrimeVue adapter、contracts、runtime-neutral logic 与可公开复用的能力归 `packages/*`，不得在两个 app 内重复沉淀为公共能力。
- App-specific routes、stores、pages / views、plugin wiring、运行时能力接入与兼容门面保持 app-local；跨运行时复用必须先经过 `packages/contracts` / `packages/core` / 对应 `packages/*` 公共导出。

## App-local shared candidates

以下路径目前仍归 `apps/web-demo` 所有，但应被视为“应用内共享候选模块”，不是立即迁移目标，也不是从 `apps/*` 直接对外公开的候选导出列表：

- `apps/web-demo/src/layouts/runtime/layoutRuntime.ts`
- `apps/web-demo/src/hooks/modules/useAutoMitt.ts`
- `apps/web-demo/src/hooks/modules/useDialog.tsx`
- `apps/web-demo/src/hooks/modules/useProTableUrlSync.ts`
- `apps/web-demo/src/plugins/modules/primevue.ts`
- `apps/web-demo/src/plugins/modules/proform.ts`
- `apps/web-demo/src/plugins/modules/protable.ts`
- `apps/web-demo/src/utils/http/**`
- `apps/web-demo/src/utils/theme/engine.ts`
- `apps/web-demo/src/utils/theme/sizeEngine.ts`
- `apps/web-demo/src/utils/deviceSync.ts`
- `apps/web-demo/src/utils/safeStorage`
- `apps/web-demo/src/stores/modules/system/**`

这些模块已分类为 app-local facades、integration shells、runtime adapters 或未来迁移候选。分类不是永久归属批准；后续只应通过小步、分阶段、证据驱动的 owner-approved lane 推进。

## 暂时不要移动

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

## 快速开始

```bash
git clone git@github.com:ichichuang/ccd.git
cd ccd
pnpm install --frozen-lockfile
pnpm dev:web-demo
```

环境要求：

| 工具    | 版本        |
| ------- | ----------- |
| Node.js | `24.x`      |
| pnpm    | `>= 10.0.0` |

## 新手 15 分钟上手路径

按这个顺序走一遍，你就能从零完成一次安全的本地改动。

1. **安装并启动**

   ```bash
   git clone git@github.com:ichichuang/ccd.git
   cd ccd
   pnpm install --frozen-lockfile
   pnpm dev:web-demo
   ```

2. **先看哪里**
   - `apps/web-demo`: 浏览器 `web-demo` 应用外壳
   - `apps/desktop`: 专用 Tauri 桌面运行时外壳，拥有自有前端入口与 `src-tauri` 后端边界
   - `packages/contracts`: 公共 ABI、接口与共享类型
   - `packages/core`: 运行时无关平台逻辑
   - `packages/design-tokens`: 设计 token
   - `packages/shared-utils`: 共享工具函数
   - `packages/unocss-preset`: 共享 UnoCSS 预设
   - `packages/vue-hooks`: Vue 组合式函数
   - `packages/vue-app-platform`: 共享前端应用启动、生命周期与平台编排原语
   - `packages/vue-ui`: 共享 Vue UI 基础组件
   - `packages/vue-primevue-adapter`: PrimeVue 集成适配器
   - `packages/vue-charts`: 图表集成层

3. **第一次应该改哪里**
   - UI 或页面级改动：`apps/web-demo`
   - 共享 UI 基础组件：`packages/vue-ui`
   - 主题或 token 改动：`packages/design-tokens`
   - 运行时无关逻辑：`packages/core`
   - 公共接口或类型：`packages/contracts`

4. **最小验证**

   ```bash
   pnpm project:doctor
   pnpm ci:prepare-internal
   pnpm type-check
   ```

5. **完整验证**

   ```bash
   pnpm lint:check
   pnpm type-check
   pnpm governance:gate
   pnpm build:ci
   ```

6. **部署角色说明**
   - `GitHub Actions` 是质量门禁。
   - `Vercel` 使用 `pnpm vercel:build`。
   - `GitHub Pages` 使用 `pnpm build:web-demo`，并配合 `VITE_PUBLIC_PATH=/ccd/`。

7. **延伸阅读**
   - [docs/README.md](./docs/README.md)
   - [docs/zh/01-quickstart.md](./docs/zh/01-quickstart.md)
   - [docs/zh/02-architecture.md](./docs/zh/02-architecture.md)
   - [docs/zh/03-governance.md](./docs/zh/03-governance.md)
   - [docs/zh/05-ci-deploy.md](./docs/zh/05-ci-deploy.md)
   - [docs/zh/07-troubleshooting.md](./docs/zh/07-troubleshooting.md)

## 命令决策矩阵

| 命令                               | 用途                                               | 何时运行                              |
| ---------------------------------- | -------------------------------------------------- | ------------------------------------- |
| `pnpm project:doctor`              | 检查项目元数据与受控配置                           | 提交前、修改 `project.config.json` 后 |
| `pnpm ccd:doctor`                  | 日常项目健康检查                                   | 本地开发前、准备发布前                |
| `pnpm ccd:fix`                     | 同步元数据、刷新生成产物、格式化与校验             | 提交变更前                            |
| `pnpm ccd:ship -- "type: message"` | 修复、校验、暂存并提交，经过 Husky 与 commitlint   | 创建本地常规提交时                    |
| `pnpm ci:prepare-internal`         | 构建内部工作区包                                   | 应用构建、Vercel 构建或包解析排查前   |
| `pnpm ci:smoke:packages`           | 验证工作区包解析与 dist 产物                       | 内部包构建后或部署构建前              |
| `pnpm governance:refresh`          | 刷新治理生成产物                                   | API、拓扑、策略或报告源变更后         |
| `pnpm governance:gate`             | 运行统一架构与治理门禁                             | 提交前、CI 中、刷新治理后             |
| `pnpm type-check`                  | 运行工作区 TypeScript 类型检查                     | TS、Vue、契约或包导出变更后           |
| `pnpm lint:check`                  | 运行工作区 ESLint 静态检查                         | 代码、脚本或 Vue SFC 变更后           |
| `pnpm check`                       | 运行类型检查与 lint 检查                           | 快速本地质量验证                      |
| `pnpm build:ci`                    | CI 验证构建                                        | 推送前或复现 CI 时                    |
| `pnpm vercel:build`                | Vercel 部署构建                                    | 仅用于 Vercel 部署校验                |
| `pnpm dev:web-demo`                | 启动浏览器 `web-demo` 应用开发服务                 | 本地浏览器应用开发                    |
| `pnpm dev:desktop`                 | 启动桌面外壳前端开发服务                           | 本地桌面前端开发                      |
| `pnpm build:web-demo`              | web-demo 静态构建                                  | GitHub Pages 与本地静态构建校验       |
| `pnpm build:desktop`               | Tauri 桌面运行时外壳前端构建                       | 桌面外壳前端构建校验                  |
| `pnpm desktop:security`            | 校验 Tauri CSP、capabilities、插件、窗口与导航策略 | 桌面安全边界变更后                    |
| `pnpm desktop:smoke:dev`           | 校验 Tauri dev 编译路径                            | Tauri 配置或桌面依赖变更后            |
| `pnpm desktop:smoke:release`       | 校验 Tauri release 编译路径（不打包 bundle）       | Tauri 发布配置或 CI 复现时            |
| `pnpm desktop:smoke`               | 串行运行桌面安全、dev smoke 与 release smoke       | 桌面 P3 全量本地 smoke                |
| `pnpm budget:desktop`              | 校验桌面前端构建产物预算                           | 桌面构建后                            |
| `pnpm validate`                    | 运行治理、运行时、类型与构建验证链路               | 合并前或需要完整本地验证时            |
| `pnpm e2e:qa`                      | QA 回归测试                                        | UI、路由、布局或运行时变更后          |
| `pnpm ai:sync`                     | 同步 AI 协议适配器                                 | AI 协议或适配器源变更后               |
| `pnpm ai:sync:codex`               | 同步 Codex 相关 AI 产物                            | Skill 或 Codex 适配器变更后           |
| `pnpm ai:doctor`                   | 检查 AI 工作区健康状态                             | AI 工作流或协议变更后                 |

## 常见失败先看这里

1. **Vercel failed**
   先确认 Vercel 实际执行的是 `pnpm vercel:build`，而不是 `pnpm build:ci`。
   参考：[docs/zh/05-ci-deploy.md](./docs/zh/05-ci-deploy.md)、[docs/zh/07-troubleshooting.md](./docs/zh/07-troubleshooting.md)

2. **@ccd/core 无法解析 @ccd/contracts**
   执行：

   ```bash
   pnpm ci:prepare-internal
   pnpm ci:smoke:packages
   ```

   参考：[docs/zh/07-troubleshooting.md](./docs/zh/07-troubleshooting.md)

3. **生成产物漂移**
   执行：

   ```bash
   pnpm governance:refresh
   pnpm governance:gate
   ```

   不要手动编辑生成文件。

4. **AI 产物过期**
   执行：

   ```bash
   pnpm ai:sync
   pnpm ai:sync:codex
   ```

5. **Commitlint failed**
   使用：

   ```bash
   pnpm ccd:ship -- "type: message"
   ```

   避免提交主题末尾带标点。

6. **GitHub Preview 仍显示旧的失败部署**
   先确认是否为过期的非活跃部署记录。
   如需要，从当前 main 重新触发一次 Preview。
   不要把 Vercel 改回 `build:ci`。

## 一键自动化工作流

日常最常用的闭环是：

```bash
pnpm ccd:doctor
pnpm ccd:fix
pnpm ccd:ship -- "feat: describe change"
```

`ccd:ship` 是幂等的：如果校验后工作区已经干净，它会成功退出，不会创建空提交。

## GitHub Actions / Vercel / GitHub Pages 分工

```text
GitHub Actions  -> 质量门禁与验证构建
Vercel          -> 部署构建
GitHub Pages    -> web-demo 静态部署
```

注意区分：

- `pnpm build:ci`：面向 CI 的完整验证链路
- `pnpm vercel:build`：面向 Vercel 的部署链路

如果 Vercel 错误地执行了 `build:ci`，应优先修复部署配置，而不是削弱治理。

## 文档入口

- 中文文档入口：[docs/README.md](./docs/README.md)
- 英文 AI 文档入口：[README.en.md](./README.en.md)
- 架构文档：[docs/zh/02-architecture.md](./docs/zh/02-architecture.md)
- 治理文档：[docs/zh/03-governance.md](./docs/zh/03-governance.md)
- 项目主控中心：[docs/zh/04-project-control-center.md](./docs/zh/04-project-control-center.md)
- CI / 部署：[docs/zh/05-ci-deploy.md](./docs/zh/05-ci-deploy.md)
- AI 工作流：[docs/zh/06-ai-workflow.md](./docs/zh/06-ai-workflow.md)

## 生成物不可手改规则

`docs/generated/**`、`.ai/generated/**`、`.ai/governance/api-snapshots/**` 均为生成产物。

不要手动编辑这些文件。刷新方式：

```bash
pnpm governance:refresh
pnpm governance:gate
```

## License

[GNU General Public License v3.0](./LICENSE)
