<div align="center">

> 🚧 **本分支为 Tauri 桌面客户端分支**，基于 [`main`](https://github.com/ichichuang/ccd/tree/main) 的 Web 基座封装原生壳。若你只需要浏览器内的中后台，请直接使用 **main**，勿切换本分支。

# CCD Desktop — Enterprise Vue 3 + Tauri

### 企业级 Vue 3 中后台 · 桌面端衍生版

<br />

[![Vue 3.5](https://img.shields.io/badge/Vue-3.5+-42b883?style=flat-square&logo=vuedotjs&logoColor=white)](https://vuejs.org/)
[![Vite 7](https://img.shields.io/badge/Vite-7-646cff?style=flat-square&logo=vite&logoColor=white)](https://vite.dev/)
[![Tauri 2](https://img.shields.io/badge/Tauri-2-24c8d8?style=flat-square&logo=tauri&logoColor=white)](https://v2.tauri.app/)
[![PrimeVue 4](https://img.shields.io/badge/PrimeVue-4-41B883?style=flat-square)](https://primevue.org/)
[![TypeScript 5.8](https://img.shields.io/badge/TypeScript-5.8-3178c6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)

[![Node.js >= 22](https://img.shields.io/badge/Node.js-%3E%3D22-339933?style=flat-square&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![pnpm](https://img.shields.io/badge/pnpm-10-f69220?style=flat-square&logo=pnpm&logoColor=white)](https://pnpm.io/)
[![License: GPL v3](https://img.shields.io/badge/License-GPL_v3-blue?style=flat-square)](./LICENSE)

<br />

本分支在 **CCD Web 架构** 之上集成 **Tauri 2**，用于交付安装包形态的桌面应用。业务与 UI 仍由 Vue + Vite 驱动，原生侧负责窗口、系统集成等能力。

[环境准备](#桌面端环境准备-prerequisites) · [快速开始](#快速开始) · [架构文档（main）](https://github.com/ichichuang/ccd/blob/main/docs/architecture.md)

</div>

---

## 桌面端环境准备 (Prerequisites)

在安装 Node 依赖前，请先满足 **Rust 工具链** 与当前操作系统的 **原生构建依赖**（以 [Tauri 官方 Prerequisites](https://v2.tauri.app/start/prerequisites/) 为准）。

### 通用

| 项                | 要求                                                                         |
| ----------------- | ---------------------------------------------------------------------------- |
| **Rust**          | 安装 [rustup](https://rustup.rs/)，使用 **stable**，`rustc` / `cargo` 可执行 |
| **Rust 最低版本** | 与 `src-tauri/Cargo.toml` 中 `rust-version` 字段一致（当前 **>= 1.77.2**）   |
| **Node.js**       | **>= 22.12.0**                                                               |
| **pnpm**          | **>= 10.0.0**                                                                |

### 按平台

| 平台        | 需要                                                                                                                                            |
| ----------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| **macOS**   | Xcode Command Line Tools（`xcode-select --install`）                                                                                            |
| **Windows** | [Microsoft C++ Build Tools](https://visualstudio.microsoft.com/visual-cpp-build-tools/)（MSVC、Windows SDK）；多数环境需可用的 **WebView2**     |
| **Linux**   | 发行版对应的 **webkit2gtk**、**build-essential**、**libssl-dev** 等，参见官方 [Linux 依赖说明](https://v2.tauri.app/start/prerequisites/#linux) |

---

## 快速开始

### 克隆并切换到本分支

```bash
git clone https://github.com/ichichuang/ccd.git
cd ccd
git checkout feat/tauri-integration
pnpm install
```

### 调试桌面应用（推荐）

启动 Vite 并打开 **Tauri 原生窗口**：

```bash
pnpm dev:desktop
```

与 `pnpm tauri dev` 等价。

### 仅调试前端（不启动桌面壳）

用于纯 Web UI 排错：

```bash
pnpm dev
```

### 构建独立安装包

```bash
pnpm build:desktop
```

与 `pnpm tauri build` 等价。构建成功后，安装包位于 `src-tauri/target/release/bundle/`（子目录随平台变化，如 `.dmg`、`.msi`、`.deb` 等）。

### 类型检查与 Web 产物构建

```bash
pnpm type-check
pnpm build
```

`pnpm build` 仅产出前端静态资源；**可安装的桌面包**请使用 `pnpm build:desktop`。

---

## 深入了解

| 链接                                                                                   | 说明                                                    |
| -------------------------------------------------------------------------------------- | ------------------------------------------------------- |
| [**架构与特性详解**](https://github.com/ichichuang/ccd/blob/main/docs/architecture.md) | 分层拓扑、ProForm / ProTable、目录规约（位于 **main**） |
| [**Web 版 README**](https://github.com/ichichuang/ccd/blob/main/README.md)             | 通用仓库说明与在线演示入口                              |
| [**Tauri 文档**](https://v2.tauri.app/)                                                | 配置、插件、打包与平台细节                              |

---

## 贡献

1. [Conventional Commits](https://www.conventionalcommits.org/)
2. 本地通过 `pnpm check` 与 `pnpm test:run`

欢迎 Issue 与 Pull Request。

---

## 许可证

[GNU General Public License v3.0](./LICENSE)

---

<div align="center">

若对你有帮助，欢迎 Star

</div>
