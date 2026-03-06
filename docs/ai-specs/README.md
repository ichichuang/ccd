# 项目文档索引

> **目标读者：AI**。本索引供 AI 在代码生成任务时查阅规范与组件文档。**人类**了解项目架构请访问 [architecture/](../architecture/README.md)。

---

## 📂 一、架构文档（面向开发者）

供人类开发者与 GitHub 访客了解项目架构，详见：

| 文档                                                                              | 说明                         |
| --------------------------------------------------------------------------------- | ---------------------------- |
| [architecture/README.md](../architecture/README.md)                               | 架构文档目录索引             |
| [architecture/ARCHITECTURE_OVERVIEW.md](../architecture/ARCHITECTURE_OVERVIEW.md) | 架构总览、分层设计、核心流程 |
| [architecture/TECH_STACK.md](../architecture/TECH_STACK.md)                       | 技术栈详解                   |
| [architecture/DIRECTORY_STRUCTURE.md](../architecture/DIRECTORY_STRUCTURE.md)     | 目录结构说明                 |

---

## 🤖 二、规范与组件文档（面向 AI）

供 AI 在代码生成时遵循的**单一真理来源（SSOT）**。生成代码前必须按任务类型阅读相关文档。

### 2.1 核心规范（AI 必读）

0. **UI State Contract Package**（State Authority）
   - **`UI_STATE_CONTRACT.md`** - UIDesignState 定义、Primary vs Derived、禁止组合、校验规则
   - **`INTENT_PROFILES.md`** - 查表核心，intent → derived state
   - **`ARCHETYPE_SPEC.md`** - 布局原型（A1~A5）结构、scroll model、component map、FORBIDDEN
   - **使用场景**：生成/修改页面 UI 前必读；AI 必须先产出 UIDesignState 再写代码
   - **引用**：`@./UI_STATE_CONTRACT.md`

1. **`PROJECT_PROTOCOL.md`** - 项目协议
   - **功能**：技术栈、目录规范、编码规范、路由系统、认证、设计系统
   - **使用场景**：所有代码生成任务前必须阅读
   - **引用**：`@./PROJECT_PROTOCOL.md`

1a. **`AI_CODING_PROTOCOL.md`** - AI 编码协议

- **功能**：生成前决策流程、TSX/lang 切换、VNode vs 模板字符串、生成后自检清单
- **使用场景**：涉及 DataTable 列 body/renderer、Dialog contentRenderer、SchemaForm 自定义渲染等程序化渲染时必读
- **引用**：`@./AI_CODING_PROTOCOL.md`

2. **`BUILD_SYSTEM.md`** - 构建系统与自动导入
   - **功能**：Vite 配置、AutoImport、类型生成、组件扫描范围
   - **引用**：`@./BUILD_SYSTEM.md`

3. **`TYPESCRIPT_AND_LINTING.md`** - TypeScript 与 Linting
   - **功能**：严格模式、显式类型注解、禁止 any、ESLint、Vue 模板约束
   - **引用**：`@./TYPESCRIPT_AND_LINTING.md`

4. **`VUE_TEMPLATE_ANTIPATTERNS.md`** - Vue 模板反模式
   - **功能**：多语句内联处理器、模板中 TS 语法、readonly 数组 includes 等反模式及正确写法
   - **使用场景**：出现 `Error parsing JavaScript expression`、构建失败或 TS 类型错误时优先查阅
   - **引用**：`@./VUE_TEMPLATE_ANTIPATTERNS.md`

### 2.2 设计系统

- **颜色语义权威**：`src/constants/theme/colorUsage.ts`（SSOT），详见 `.cursor/rules/21-color-authority.mdc`

5. **`PRIMEVUE_V4_API.md`** - PrimeVue v4 API 规范（禁止 v3 弃用组件名，以 https://primevue.org/ 为准）
6. **`PRIMEVUE_THEME.md`** - PrimeVue 主题
7. **`UNOCSS_AND_ICONS.md`** - UnoCSS 与图标
8. **`FOCUS_AND_OUTLINE_STYLING.md`** - Focus/Outline 样式（最小化 suppression，禁止冗长链）
   - **使用场景**：菜单项、面包屑、可聚焦按钮等
   - **引用**：`@./FOCUS_AND_OUTLINE_STYLING.md`
9. **`ECHARTS_THEME.md`** - ECharts 与主题
10. **`INDUSTRIAL_UX_DESIGN_SYSTEM.md`** - 工业级 UX 设计系统

- **功能**：桌面级布局骨架、工业状态色、防呆设计、Toast 时长建议、连接感知
- **使用场景**：工业监控/仪表盘类页面
- **引用**：`@./INDUSTRIAL_UX_DESIGN_SYSTEM.md`

20. **`EMPTY_STATE_AND_ROBUSTNESS.md`** - Empty State & UI Robustness

- **功能**：Industrial Empty State Pattern、EmptyState 组件、消除双重空白、i18n 强制检查
- **使用场景**：表格/图表/仪表盘无数据、连接中断、空态设计
- **引用**：`@./EMPTY_STATE_AND_ROBUSTNESS.md`

### 2.3 组件文档

9. **`SCHEMA_FORM_COMPONENT.md`** - SchemaForm 表单
10. **`DataTable_COMPONENT.md`** - DataTable 表格
11. **`DIALOG_COMPONENT.md`** - PrimeDialog 弹窗
12. **`TOAST_AND_MESSAGE.md`** - Toast & Message（含 §6 样式覆盖：居中、关闭按钮、内边距）

### 2.4 布局与路由

14. **`ADAPTIVE_LAYOUT.md`** - 布局适配系统
15. **`AUTH_AND_LOGIN_FLOW.md`** - 登录与鉴权

### 2.5 工作流程与环境

16. **`AI_COLLABORATION.md`**（`docs/` 根目录）- Cursor + Antigravity 协作、AI Skills 工作流程、常用 Prompt
17. **`ANTIGRAVITY_UI_RULES.md`** - Antigravity Agent 专用 UI 规则（长版，与 `.agent/rules/` 互补；规则以 `.agent/rules/` 为权威）
18. **`ENV_AND_RUNTIME.md`** - 环境变量与运行时

---

## 📖 AI 使用指南

### 必读文档

所有代码生成任务前，必须阅读：`@./PROJECT_PROTOCOL.md`

**架构理解（推荐首读或按需查阅）：**

- `@docs/architecture/ARCHITECTURE_OVERVIEW.md` — 分层设计、数据流、设计原则、目录职责
- `@docs/architecture/DIRECTORY_STRUCTURE.md` — 逐目录、逐文件职责说明

> 架构文档帮助 AI 理解 Views → Components → Hooks → API/Store/Utils 的分层关系与数据流，避免生成偏离架构的代码。

### 按场景选择文档

| 任务类型                              | 引用文档                                                                                   |
| ------------------------------------- | ------------------------------------------------------------------------------------------ |
| 理解架构/目录结构                     | `@docs/architecture/ARCHITECTURE_OVERVIEW.md`、`@docs/architecture/DIRECTORY_STRUCTURE.md` |
| Cursor+Antigravity 协作、常用 Prompt  | `@docs/AI_COLLABORATION.md`                                                                |
| 表单（多字段/校验/分步/分组/动态）    | `@docs/SCHEMA_FORM_COMPONENT.md`                                                           |
| 数据表格（列表/分页/排序/筛选/导出）  | `@docs/DataTable_COMPONENT.md`、`@docs/AI_CODING_PROTOCOL.md`（列 body/renderer 自定义时） |
| 布局/侧栏/响应式                      | `@./ADAPTIVE_LAYOUT.md`                                                                    |
| 登录/鉴权                             | `@./AUTH_AND_LOGIN_FLOW.md`                                                                |
| 反馈提示（非组件环境）                | `@./TOAST_AND_MESSAGE.md`                                                                  |
| 弹窗/对话框                           | `@docs/DIALOG_COMPONENT.md`                                                                |
| 样式编写                              | `@./UNOCSS_AND_ICONS.md`、`@./PRIMEVUE_THEME.md`                                           |
| PrimeVue 组件（下拉/日期/抽屉等）     | `@./PRIMEVUE_V4_API.md`（禁止 v3 弃用名，以 https://primevue.org/ 为准）                   |
| 图表开发                              | `@./ECHARTS_THEME.md`                                                                      |
| 类型定义/注解                         | `@./TYPESCRIPT_AND_LINTING.md`                                                             |
| Vue 模板解析错误/构建失败/TS 类型错误 | `@./VUE_TEMPLATE_ANTIPATTERNS.md`                                                          |
| 构建/自动导入                         | `@./BUILD_SYSTEM.md`                                                                       |
| 环境配置                              | `@./ENV_AND_RUNTIME.md`                                                                    |
| 部署/Nginx/gzip 预压缩                | `@../DEPLOYMENT.md`                                                                        |
| 右键菜单（ContextMenu）               | `@./PROJECT_PROTOCOL.md` §8.5.5                                                            |
| 网络状态/大文件上传                   | `@./PROJECT_PROTOCOL.md` §8.4.6                                                            |
| 工业/仪表盘页面                       | `@./INDUSTRIAL_UX_DESIGN_SYSTEM.md`                                                        |
| 空状态/鲁棒性                         | `@./EMPTY_STATE_AND_ROBUSTNESS.md`                                                         |

### 引用方式

在 Prompt 中使用 `@` 引用：

```
先阅读 @docs/ai-specs/PROJECT_PROTOCOL.md
涉及表单时，阅读 @docs/ai-specs/SCHEMA_FORM_COMPONENT.md
涉及布局时，阅读 @docs/ai-specs/ADAPTIVE_LAYOUT.md
```

### 文档原则

- 文档是**单一真理来源（SSOT）**
- 代码生成必须严格遵循文档
- 禁止在代码中硬编码与文档冲突的逻辑

---

## 🔗 相关配置

- **Cursor Rules**：`.cursor/rules/`（强制约束）
- **Cursor Skills**：`.cursor/skills/`（操作流程）
- **Antigravity Rules**：`.agent/rules/`（权威规则，AI 必须遵循）
- **Antigravity Skills**：`.agent/skills/`
- **`ANTIGRAVITY_UI_RULES.md`**：Antigravity 专用 UI 长版说明，与 `.agent/rules/10-ui-architecture.md` 等互补；规则冲突时以 `.agent/rules/` 为准
- **黄金样本**：`docs/ai-specs/GOLDEN_SAMPLES/` — 基础模式（useFeatureLogic、UIComponent、ApiModule、StoreExample）；**DataTable 列 body** 见 `DataTableBodyColumn.vue`
- **示例页面**：`src/views/example/` — DataTable、SchemaForm、UseEcharts、PrimeDialog 等复杂组件的完整用法示例，生成同类功能时优先参考对应目录
- **系统配置页**：`src/views/system-configuration/` — 主题、尺寸、断点、布局/设备、滚动条、UnoCSS 等核心系统能力演示；与 example 区别：system-configuration 展示架构基础设施，example 展示业务组件用法

---

## 🎯 AI 快速查找

| 需求                | 文档                                                                                             |
| ------------------- | ------------------------------------------------------------------------------------------------ |
| 理解架构            | `architecture/ARCHITECTURE_OVERVIEW.md`、`DIRECTORY_STRUCTURE.md`                                |
| 系统配置 vs 示例页  | system-configuration=架构能力演示；example=业务组件用法示例                                      |
| 用什么组件          | `PROJECT_PROTOCOL.md` §1.1                                                                       |
| 怎么写样式          | `UNOCSS_AND_ICONS.md`                                                                            |
| 怎么写表单          | `SCHEMA_FORM_COMPONENT.md`                                                                       |
| 怎么写表格          | `DataTable_COMPONENT.md`                                                                         |
| Schema-First 策略   | `.cursor/rules/35-schema-driven-development.mdc`、`.agent/rules/35-schema-driven-development.md` |
| 怎么写类型          | `TYPESCRIPT_AND_LINTING.md`                                                                      |
| 模板解析错误/反模式 | `VUE_TEMPLATE_ANTIPATTERNS.md`                                                                   |
| 怎么写路由          | `PROJECT_PROTOCOL.md` §10                                                                        |
| 怎么写认证          | `AUTH_AND_LOGIN_FLOW.md`                                                                         |
| 怎么写布局          | `ADAPTIVE_LAYOUT.md`                                                                             |
| 怎么写反馈提示      | `TOAST_AND_MESSAGE.md`                                                                           |
| 怎么写弹窗/对话框   | `DIALOG_COMPONENT.md`                                                                            |
| 怎么写图表          | `ECHARTS_THEME.md`                                                                               |
| 怎么写右键菜单      | `PROJECT_PROTOCOL.md` §8.5.5                                                                     |
| 网络状态/大文件上传 | `PROJECT_PROTOCOL.md` §8.4.6                                                                     |
| 部署/Nginx/gzip     | `DEPLOYMENT.md`                                                                                  |
