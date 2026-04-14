<div align="center">

> 🚧 **本分支为 Tauri 桌面客户端分支**，基于 [`main`](https://github.com/ichichuang/ccd/tree/main) 的 CCD Web 架构封装原生壳。若你只需要浏览器内的中后台，请直接使用 **main**。

# CCD Desktop

### 企业级 Vue 3 架构底座 · Tauri 桌面端衍生版

[![Vue 3.5](https://img.shields.io/badge/Vue-3.5+-42b883?style=flat-square&logo=vuedotjs&logoColor=white)](https://vuejs.org/)
[![Vite 7](https://img.shields.io/badge/Vite-7-646cff?style=flat-square&logo=vite&logoColor=white)](https://vite.dev/)
[![Tauri 2](https://img.shields.io/badge/Tauri-2-24c8d8?style=flat-square&logo=tauri&logoColor=white)](https://v2.tauri.app/)
[![PrimeVue 4](https://img.shields.io/badge/PrimeVue-4-41B883?style=flat-square)](https://primevue.org/)
[![UnoCSS](https://img.shields.io/badge/UnoCSS-66-333?style=flat-square&logo=unocss&logoColor=white)](https://unocss.dev/)
[![TypeScript 5.8](https://img.shields.io/badge/TypeScript-5.8-3178c6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Pinia 3](https://img.shields.io/badge/Pinia-3-ffd859?style=flat-square)](https://pinia.vuejs.org/)
[![Node.js >= 22](https://img.shields.io/badge/Node.js-%3E%3D22-339933?style=flat-square&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![pnpm](https://img.shields.io/badge/pnpm-10-f69220?style=flat-square&logo=pnpm&logoColor=white)](https://pnpm.io/)
[![License: GPL v3](https://img.shields.io/badge/License-GPL_v3-blue?style=flat-square)](./LICENSE)

**CCD Desktop** 在 CCD Web 基座上集成 **Tauri 2**，用于交付安装包形态的桌面应用。
业务与 UI 仍由 Vue + Vite 驱动，原生侧负责窗口、系统集成与桌面能力桥接。

[主分支架构文档](https://github.com/ichichuang/ccd/blob/main/docs/architecture.md) · [AI 工作区规范](./.ai/README.md) · [Tauri 官方文档](https://v2.tauri.app/)

</div>

---

## 分支定位

仓库采用“`main` 为核心源，`feat/tauri-integration` 为桌面端派生交付”的模型：

- `main`
  - 保留 CCD 核心架构、示例模块、AI 治理配置、通用规范
  - 所有通用能力优化应优先在 `main` 完成
- `feat/tauri-integration`
  - 基于 `main` 的能力承接 Tauri 2 桌面端集成
  - 删除示例页面与示例路由，只保留桌面端交付所需实现
  - 通过同步脚本从 `main` 下发更新

如果你要做通用架构演进，应先改 `main`，再同步到当前分支。

---

## 桌面端环境准备

在安装 Node 依赖前，请先满足 **Rust 工具链** 与当前操作系统的 **原生构建依赖**。
以 [Tauri 官方 Prerequisites](https://v2.tauri.app/start/prerequisites/) 为准。

### 通用

| 项目          | 要求                                                                     |
| ------------- | ------------------------------------------------------------------------ |
| Rust          | 安装 [rustup](https://rustup.rs/)，使用 stable，`rustc` / `cargo` 可执行 |
| Rust 最低版本 | 与 `src-tauri/Cargo.toml` 中 `rust-version` 一致                         |
| Node.js       | `>= 22.12.0`                                                             |
| pnpm          | `>= 10.0.0`                                                              |

### 按平台

| 平台    | 需要                                                          |
| ------- | ------------------------------------------------------------- |
| macOS   | Xcode Command Line Tools：`xcode-select --install`            |
| Windows | MSVC、Windows SDK、可用的 WebView2                            |
| Linux   | 发行版对应的 `webkit2gtk`、`build-essential`、`libssl-dev` 等 |

---

## 快速开始

### 克隆并切换到桌面端分支

```bash
git clone git@github.com:ichichuang/ccd.git
cd ccd
git checkout feat/tauri-integration
pnpm install
```

### 初始化 AI 工作区

```bash
pnpm ai:sync
pnpm ai:doctor
pnpm codex:preflight
```

### 调试桌面应用

```bash
pnpm dev:desktop
```

`pnpm dev:desktop` 会通过 Tauri 的 `beforeDevCommand` 触发 `pnpm dev`。
当前分支已接入 `predev`，启动前会自动执行：

```bash
pnpm sync:version
pnpm sync:desktop-config
```

### 仅调试前端

```bash
pnpm dev
```

### 构建桌面安装包

```bash
pnpm build:desktop
```

当前分支已接入 `prebuild`，构建前会自动执行：

```bash
pnpm sync:brand
pnpm sync:version
pnpm sync:desktop-config
```

### 类型检查与 Web 产物构建

```bash
pnpm type-check
pnpm build
```

`pnpm build` 仅产出前端静态资源；可安装的桌面包请使用 `pnpm build:desktop`。

---

## 新项目初始化配置教程

如果你是基于当前桌面端分支启动一个新产品项目，建议按下面顺序初始化，不要分散修改多个文件。

### 第一步：修改品牌源

编辑 `src/constants/brand.ts`，这是品牌相关配置的唯一源头。

你通常会改这些字段：

- `id`
  - 例如：`com.yourcompany.desktopapp`
  - 用于 Tauri bundle identifier
- `name`
  - 例如：`your-desktop-app`
  - 用于 `package.json.name` 与 `tauri.conf.json.productName`
- `displayName`
  - 例如：`Your Desktop App`
  - 用于窗口标题和界面展示名称
- `description`
  - 用于应用描述、包描述
- `author`
  - 用于作者信息

修改后执行：

```bash
pnpm sync:brand
```

这会自动同步：

- `package.json`
- `src-tauri/tauri.conf.json`
- `src-tauri/Cargo.toml`

### 第二步：修改版本号源

编辑 `package.json` 的 `version`。

例如：

```json
{
  "version": "1.0.0"
}
```

修改后执行：

```bash
pnpm sync:version
```

这会自动同步：

- `src-tauri/tauri.conf.json`
- `src-tauri/Cargo.toml`

### 第三步：修改开发端口源

编辑 `.env` 或 `.env.development` 中的 `VITE_PORT`。

例如：

```bash
VITE_PORT=9001
```

修改后执行：

```bash
pnpm sync:desktop-config
```

这会自动同步：

- `src-tauri/tauri.conf.json` 的 `build.devUrl`
- `.vscode/launch.json` 的调试地址

### 第四步：执行一次完整对齐

初始化一个新桌面端项目后，建议统一执行一遍：

```bash
pnpm sync:brand
pnpm sync:version
pnpm sync:desktop-config
pnpm ai:sync
pnpm ai:doctor
pnpm codex:preflight
```

### 第五步：开始开发前做一次校验

```bash
pnpm check
pnpm test:run
pnpm build:ci
```

### 初始化阶段的禁止事项

- 不要手改 `src-tauri/tauri.conf.json` 的 `version`
- 不要手改 `src-tauri/tauri.conf.json` 的 `build.devUrl`
- 不要手改 `.vscode/launch.json` 的调试端口
- 不要手改 `package.json` 的 `name` / `description` / `author` 作为品牌初始化入口

正确做法是始终回到单一源修改。

---

## 配置单一源

桌面端分支已经收敛为“改一处，同步其余配置”的模式。

### 开发端口

- 单一源：`.env` / `.env.development` 中的 `VITE_PORT`
- 自动同步目标：
  - `src-tauri/tauri.conf.json` 的 `build.devUrl`
  - `.vscode/launch.json` 的前端调试 `url`
- 同步命令：

```bash
pnpm sync:desktop-config
```

也就是说，之后调整桌面端开发端口时，只改 `VITE_PORT`，不要再手改 `src-tauri/tauri.conf.json` 或 `.vscode/launch.json`。

### 版本号

- 单一源：`package.json` 的 `version`
- 自动同步目标：
  - `src-tauri/tauri.conf.json` 的 `version`
  - `src-tauri/Cargo.toml` 的 `version`
- 同步命令：

```bash
pnpm sync:version
```

### 品牌与桌面元数据

- 单一源：`src/constants/brand.ts`
- 自动同步目标：
  - `package.json` 的 `name` / `description` / `author`
  - `src-tauri/tauri.conf.json` 的 `identifier` / `productName` / `window.title`
  - `src-tauri/Cargo.toml` 的 `description` / `authors`
- 同步命令：

```bash
pnpm sync:brand
```

### 当前桌面端配置链路

```text
VITE_PORT (.env)               -> pnpm sync:desktop-config -> tauri.conf.json / .vscode/launch.json
version (package.json)         -> pnpm sync:version        -> tauri.conf.json / Cargo.toml
brand (src/constants/brand.ts) -> pnpm sync:brand          -> package.json / tauri.conf.json / Cargo.toml
```

如果仍然遇到端口漂移，`vite.config.ts` 中保留了最后一道保护校验，会直接提示先执行 `pnpm sync:desktop-config`。

---

## AI 工作区规范

当前分支已经跟随主分支收敛为统一 AI 工作区：

- 唯一源目录：`.ai/`
- 规则目录：`.ai/rules/**`
- 技能目录：`.ai/skills/**`
- 协议目录：`.ai/protocol/**`
- 配置目录：`.ai/config/**`
- 清单与锁文件：`.ai/manifests/**`
- 本地运行态：`.ai/runtime/**`

只编辑 `.ai/**` 下的 canonical 文件。

以下路径只是本地兼容适配输出，不应手动维护：

- `AGENTS.md`
- `CLAUDE.md`
- `.cursor/settings.json`
- `.claude/settings.local.json`
- `.cursor/rules/**`
- `.cursor/skills/**`
- `.claude/skills/**`

维护命令：

```bash
pnpm ai:sync
pnpm ai:doctor
pnpm codex:preflight
```

---

## 日常开发命令

```bash
pnpm dev             # Web 开发模式
pnpm dev:desktop     # Tauri 桌面开发模式
pnpm build           # Web 构建
pnpm build:desktop   # 桌面安装包构建
pnpm type-check      # vue-tsc
pnpm lint:check      # ESLint 检查
pnpm test:run        # Vitest 单次运行
pnpm check           # type-check + lint:check
pnpm ai:sync         # 生成 AI 兼容适配层
pnpm ai:doctor       # 检查 AI 工作区结构
pnpm codex:preflight # 检查 Codex 开发前置条件
pnpm sync:brand      # 同步品牌元数据
pnpm sync:version    # 同步版本号到 Tauri / Cargo
pnpm sync:desktop-config # 同步桌面端开发端口到 Tauri / VS Code
```

---

## 已验证链路

本分支当前 README 对应的桌面端流程，已实际通过以下命令校验：

```bash
pnpm ai:sync
pnpm ai:doctor
pnpm codex:preflight
pnpm sync:desktop-config
pnpm sync:version
pnpm check
pnpm test:run
pnpm build:ci
```

---

## 关键文档

| 文档                                                                                          | 说明                             |
| --------------------------------------------------------------------------------------------- | -------------------------------- |
| [README.md](./README.md)                                                                      | 当前桌面端分支说明               |
| [main/docs/architecture.md](https://github.com/ichichuang/ccd/blob/main/docs/architecture.md) | CCD 主架构拓扑与核心能力         |
| [.ai/README.md](./.ai/README.md)                                                              | AI 工作区标准                    |
| [docs/codex/quickstart.md](./docs/codex/quickstart.md)                                        | CCD 架构下的 Codex 使用说明      |
| [Tauri 官方文档](https://v2.tauri.app/)                                                       | Tauri 配置、插件、打包与平台细节 |

---

## 贡献

提交前请至少保证：

1. 遵守 [Conventional Commits](https://www.conventionalcommits.org/)
2. 本地通过 `pnpm check`
3. 本地通过 `pnpm test:run`
4. 如涉及 AI 配置更新，执行 `pnpm ai:sync` 与 `pnpm ai:doctor`

---

## 许可证

[GNU General Public License v3.0](./LICENSE)
