# CCD 快速开始

## 环境要求

| 工具    | 版本        |
| ------- | ----------- |
| Node.js | `24.x`      |
| pnpm    | `>= 10.0.0` |

## 安装

```bash
git clone git@github.com:ichichuang/ccd.git
cd ccd
pnpm install --frozen-lockfile
```

## 启动 web-demo

```bash
pnpm dev:web-demo
```

## 启动 desktop

```bash
pnpm dev:desktop
```

## 构建

### 验证构建（CI 思路）

```bash
pnpm build:ci
```

### 部署构建（Vercel 思路）

```bash
pnpm vercel:build
```

### web-demo 静态构建

```bash
pnpm build:web-demo
```

### desktop 外壳构建

```bash
pnpm build:desktop
```

### 仅构建内部依赖

```bash
pnpm ci:prepare-internal
```

### 仅验证包解析

```bash
pnpm ci:smoke:packages
```

## 日常开发流程

推荐顺序：

```bash
pnpm ccd:doctor
pnpm ccd:fix
pnpm ccd:ship -- "feat: describe change"
```

说明：

- `ccd:doctor`：检查配置、元数据、git 状态
- `ccd:fix`：修复元数据、刷新生成产物、格式化并校验
- `ccd:ship`：修复、校验、暂存、提交，并经过 Husky / commitlint

## 提交前校验

```bash
pnpm lint:check
pnpm type-check
pnpm governance:gate
```

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
| `pnpm e2e:qa`                      | QA 回归测试                                        | UI、路由、布局或运行时变更后          |
| `pnpm ai:sync`                     | 同步 AI 协议适配器                                 | AI 协议或适配器源变更后               |
| `pnpm ai:sync:codex`               | 同步 Codex 相关 AI 产物                            | Skill 或 Codex 适配器变更后           |
| `pnpm ai:doctor`                   | 检查 AI 工作区健康状态                             | AI 工作流或协议变更后                 |

## 推送前建议

在向远端推送前，建议至少确认：

1. `pnpm ccd:doctor` 正常
2. `pnpm lint:check` 通过
3. `pnpm type-check` 通过
4. `pnpm governance:gate` 通过
5. `git diff --check` 无空白问题
