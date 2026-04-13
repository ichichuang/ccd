<div align="center">

# CCD — Enterprise Vue 3 Architecture

### 企业级 Vue 3 中后台架构底座（非模板堆砌）

<br />

[![Vue 3.5](https://img.shields.io/badge/Vue-3.5+-42b883?style=flat-square&logo=vuedotjs&logoColor=white)](https://vuejs.org/)
[![Vite 7](https://img.shields.io/badge/Vite-7-646cff?style=flat-square&logo=vite&logoColor=white)](https://vite.dev/)
[![PrimeVue 4](https://img.shields.io/badge/PrimeVue-4-41B883?style=flat-square)](https://primevue.org/)
[![UnoCSS](https://img.shields.io/badge/UnoCSS-66-333?style=flat-square&logo=unocss&logoColor=white)](https://unocss.dev/)
[![TypeScript 5.8](https://img.shields.io/badge/TypeScript-5.8-3178c6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Pinia 3](https://img.shields.io/badge/Pinia-3-ffd859?style=flat-square)](https://pinia.vuejs.org/)
[![ECharts 6](https://img.shields.io/badge/ECharts-6-aa344d?style=flat-square)](https://echarts.apache.org/)

[![Node.js >= 22](https://img.shields.io/badge/Node.js-%3E%3D22-339933?style=flat-square&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![pnpm](https://img.shields.io/badge/pnpm-10-f69220?style=flat-square&logo=pnpm&logoColor=white)](https://pnpm.io/)
[![License: GPL v3](https://img.shields.io/badge/License-GPL_v3-blue?style=flat-square)](./LICENSE)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen?style=flat-square)](https://github.com/ichichuang/ccd/pulls)

<br />

**CCD** 提供清晰的分层与边界实践，内置 **ProForm（DAG）**、**ProTable（配置驱动）** 与 **语义化设计系统**，可直接作为中后台产品的起点。

[在线演示](https://ichichuang.github.io/ccd/) · [快速开始](#快速开始) · [架构与特性](./docs/architecture.md)

</div>

---

## 快速开始

> **Quick Start**：下列步骤覆盖本地开发与生产构建。

### 环境要求

| 工具        | 版本       |
| ----------- | ---------- |
| **Node.js** | >= 22.12.0 |
| **pnpm**    | >= 10.0.0  |

### 安装与运行

```bash
git clone https://github.com/ichichuang/ccd.git
cd ccd
pnpm install
pnpm dev
```

### 构建与预览

```bash
pnpm build
pnpm preview
```

---

## 深入了解

| 文档                                         | 说明                                                              |
| -------------------------------------------- | ----------------------------------------------------------------- |
| [**架构与特性详解**](./docs/architecture.md) | 分层拓扑（Mermaid）、子系统能力、目录说明、Example 模块、常用脚本 |

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
