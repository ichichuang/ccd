# Project Index

本仓库是一套 **Architecture OS**。架构约束与协作入口的单一事实源（SSOT）在 **`.cursor/`** 下：编辑器/Agent 设置、规则（Rules）、技能（Skills）。

---

## 工作区与 Agent 设置

| 路径                                             | 用途                                                |
| ------------------------------------------------ | --------------------------------------------------- |
| [`.cursor/settings.json`](.cursor/settings.json) | Cursor 工作区设置（与 AI/编辑器行为相关的本地配置） |

---

## 规则（Rules）— 必读约束

根目录：[`.cursor/rules/`](.cursor/rules/)

| 域       | 路径                                                           | 说明                                       |
| -------- | -------------------------------------------------------------- | ------------------------------------------ |
| 架构     | [`.cursor/rules/architecture/`](.cursor/rules/architecture/)   | 认证、RBAC 等横切架构规则                  |
| 组件     | [`.cursor/rules/components/`](.cursor/rules/components/)       | PrimeVue、Pro 组件、ECharts 等组件层法则   |
| 核心     | [`.cursor/rules/core/`](.cursor/rules/core/)                   | 全局工程、Vue/TS、类型与状态边界等核心法则 |
| 设计系统 | [`.cursor/rules/design-system/`](.cursor/rules/design-system/) | UnoCSS、主题 Token、材质与尺寸密度         |
| 集成     | [`.cursor/rules/integrations/`](.cursor/rules/integrations/)   | HTTP（Alova）、路由、布局、日期、存储等    |

**速查**

- **全局法则**：优先阅读 `core/`
- **UI 与 Token**：`design-system/` 与 `components/`
- **网络与路由/状态**：`integrations/` 与 `core/` 中的状态边界

---

## 技能（Skills）— 按需加载的工作流

根目录：[`.cursor/skills/`](.cursor/skills/)

| 技能               | 路径                                                                                                   |
| ------------------ | ------------------------------------------------------------------------------------------------------ |
| 标准 CRUD 模块生成 | [`.cursor/skills/generate-standard-crud/`](.cursor/skills/generate-standard-crud/)（入口：`SKILL.md`） |
| GitHub CLI         | [`.cursor/skills/github/`](.cursor/skills/github/)                                                     |
| Playwright MCP     | [`.cursor/skills/playwright-mcp/`](.cursor/skills/playwright-mcp/)                                     |
| ProTable 专家      | [`.cursor/skills/pro-table-expert/`](.cursor/skills/pro-table-expert/)                                 |

执行任务前：若任务匹配某技能说明中的场景，应先打开对应目录下的 **`SKILL.md`** 并按其步骤执行。
