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

## 架构定位

本仓库的核心目标不是“前端重构”，而是建立一个可长期维护、可自动守护、可跨运行时演进的平台骨架。

关键设计决策：

- `packages/contracts` 只放接口与共享类型
- `packages/core` 必须保持运行时无关
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
packages/vue-ui             -> 共享 Vue UI 基础组件
packages/vue-primevue-adapter -> PrimeVue 集成适配器
packages/vue-charts         -> 图表集成层
apps/web-demo               -> 浏览器运行时真相源
apps/desktop                -> Tauri 桌面运行时外壳与适配层
root                        -> 仅编排外壳
```

这些前端共享包仍然是受治理保护的工作区包，仍然必须遵守各自的治理角色、包导出边界和运行时边界规则。运行时能力只允许出现在应用适配层。根目录只负责编排。

## 快速开始

```bash
git clone git@github.com:ichichuang/ccd.git
cd ccd
pnpm install --frozen-lockfile
pnpm dev:web
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
   pnpm dev:web
   ```

2. **先看哪里**
   - `apps/web-demo`: 浏览器运行时真相源
   - `apps/desktop`: Tauri 桌面运行时外壳与适配层
   - `packages/contracts`: 公共 ABI、接口与共享类型
   - `packages/core`: 运行时无关平台逻辑
   - `packages/design-tokens`: 设计 token
   - `packages/shared-utils`: 共享工具函数
   - `packages/unocss-preset`: 共享 UnoCSS 预设
   - `packages/vue-hooks`: Vue 组合式函数
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

| 命令                               | 用途                                             | 何时运行                              |
| ---------------------------------- | ------------------------------------------------ | ------------------------------------- |
| `pnpm project:doctor`              | 检查项目元数据与受控配置                         | 提交前、修改 `project.config.json` 后 |
| `pnpm ccd:doctor`                  | 日常项目健康检查                                 | 本地开发前、准备发布前                |
| `pnpm ccd:fix`                     | 同步元数据、刷新生成产物、格式化与校验           | 提交变更前                            |
| `pnpm ccd:ship -- "type: message"` | 修复、校验、暂存并提交，经过 Husky 与 commitlint | 创建本地常规提交时                    |
| `pnpm ci:prepare-internal`         | 构建内部工作区包                                 | 应用构建、Vercel 构建或包解析排查前   |
| `pnpm ci:smoke:packages`           | 验证工作区包解析与 dist 产物                     | 内部包构建后或部署构建前              |
| `pnpm governance:refresh`          | 刷新治理生成产物                                 | API、拓扑、策略或报告源变更后         |
| `pnpm governance:gate`             | 运行统一架构与治理门禁                           | 提交前、CI 中、刷新治理后             |
| `pnpm build:ci`                    | CI 验证构建                                      | 推送前或复现 CI 时                    |
| `pnpm vercel:build`                | Vercel 部署构建                                  | 仅用于 Vercel 部署校验                |
| `pnpm build:web-demo`              | web-demo 静态构建                                | GitHub Pages 与本地静态构建校验       |
| `pnpm e2e:qa`                      | QA 回归测试                                      | UI、路由、布局或运行时变更后          |
| `pnpm ai:sync`                     | 同步 AI 协议适配器                               | AI 协议或适配器源变更后               |
| `pnpm ai:sync:codex`               | 同步 Codex 相关 AI 产物                          | Skill 或 Codex 适配器变更后           |
| `pnpm ai:doctor`                   | 检查 AI 工作区健康状态                           | AI 工作流或协议变更后                 |

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
