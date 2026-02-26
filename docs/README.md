# 📖 项目文档

## 👤 开发者必读

| 文档                                                   | 说明                                   |
| ------------------------------------------------------ | -------------------------------------- |
| [🚀 Quick Start](./QUICK_START.md)                     | 环境搭建、本地启动、创建新页面         |
| [🏗️ 架构总览](./architecture/ARCHITECTURE_OVERVIEW.md) | 分层设计、数据流、设计原则             |
| [🛠️ 技术栈](./architecture/TECH_STACK.md)              | 技术选型与版本                         |
| [📁 目录结构](./architecture/DIRECTORY_STRUCTURE.md)   | 逐目录职责说明                         |
| [🤝 AI 协作流程](./AI_COLLABORATION.md)                | Cursor + Antigravity 分工与常用 Prompt |

## 🤖 AI 文档（开发者无需关注）

`ai-specs/` 目录包含 AI 编码助手（Cursor / Antigravity）在代码生成时参考的规范文档。这些文档是 AI 的「知识库」，**不是为人类编写的使用手册**。

如需维护或调整 AI 行为规则，请查看：

- [AI 文档索引](./ai-specs/README.md) — AI 专用文档的完整索引
- `.agent/` — Antigravity Agent 的规则与技能
- `.cursor/` — Cursor AI 的规则与技能
