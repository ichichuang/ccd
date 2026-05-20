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

```text
packages/contracts  -> 公共 ABI：仅接口与共享类型
packages/core       -> 运行时无关平台逻辑
apps/web-demo       -> 单一浏览器运行时真相源
apps/desktop        -> Tauri 运行时外壳与桌面适配层
root                -> 仅编排外壳
```

规范依赖方向：

```text
@ccd/contracts -> @ccd/core -> apps/*
```

`packages/contracts` 和 `packages/core` 不得出现浏览器、Node、Tauri、定时器、crypto、storage、network、console 等运行时全局对象。

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

## 日常开发命令

```bash
pnpm project:doctor          # 检查配置、元数据、git 状态
pnpm ccd:doctor              # 校验项目主控信息
pnpm ccd:fix                 # 修复元数据、刷新生成产物并校验
pnpm ccd:ship -- "feat: 描述变更" # 修复、校验、暂存、提交并通过 Husky
```

规范命令：

```bash
pnpm governance:gate
pnpm build:ci
pnpm ci:prepare-internal
pnpm ci:smoke:packages
pnpm vercel:build
pnpm e2e:qa
```

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
