---
description: Antigravity Skills 索引
globs: **/*
---

# Antigravity Skills（技能文件索引）

本目录包含 Antigravity Agent 的标准操作流程（SOP）。每个 Skill 文件定义了特定任务的详细步骤和最佳实践。

## 📋 Skills 列表

### UI 组件与页面

1. **`01-build-ui-component.md`** - 构建 UI 组件
   - **功能**：创建可复用的 Vue 3 组件
   - **流程**：Scaffold（脚手架） -> Style（样式） -> Verify（验证）
   - **适用范围**：`src/components/**/*.vue`
   - **关键步骤**：
     - 组件结构搭建
     - Props/Emits 定义
     - UnoCSS 样式应用
     - 浏览器验证

2. **`02-build-page-view.md`** - 构建页面视图
   - **功能**：组装完整页面视图
   - **流程**：Layout（布局） -> Components（组件） -> Logic Integration（逻辑集成）
   - **适用范围**：`src/views/**/*.vue`
   - **关键步骤**：
     - 布局选择
     - 组件复用
     - 逻辑 Hook 集成
     - 类型安全检查

### 问题修复与重构

3. **`03-fix-ui-issue.md`** - 修复 UI 问题
   - **功能**：调试和修复 UI Bug
   - **流程**：Reproduce（复现） -> Locate（定位） -> Fix（修复） -> Verify（验证）
   - **适用范围**：`**/*.vue, **/*.ts`
   - **关键步骤**：
     - 问题复现
     - 根因定位
     - 修复实施
     - 浏览器验证

4. **`05-refactor-component.md`** - 重构组件
   - **功能**：提取逻辑并标准化样式
   - **流程**：Extract Logic（提取逻辑） -> Hooks & Style Audit（Hook 与样式审计）
   - **适用范围**：`**/*.vue, **/*.ts`
   - **关键步骤**：
     - 逻辑提取到 Hook
     - 样式标准化（UnoCSS）
     - 类型安全检查

5. **`06-style-audit.md`** - 样式审计
   - **功能**：修复硬编码样式，强制 UnoCSS 合规
   - **流程**：Find Hardcoded（查找硬编码） -> Replace with UnoCSS（替换为 UnoCSS）
   - **适用范围**：`**/*.vue, **/*.css, **/*.scss`
   - **关键步骤**：
     - 扫描硬编码值
     - 查找语义类替代
     - 替换并验证

### 完整功能开发

6. **`04-full-feature.md`** - 全功能开发
   - **功能**：端到端功能实现
   - **流程**：API Definition（API 定义） -> Business Hook（业务 Hook） -> UI Integration（UI 集成）
   - **适用范围**：`**/*`
   - **关键步骤**：
     - API 层定义（`src/api/<module>/<feature>.ts`）
     - 业务逻辑 Hook（`src/hooks/modules/useXxx.ts`）
     - UI 层集成（`src/views/**/*.vue`）
     - 类型安全与验证

### 表单组件

7. **`07-SchemaForm.md`** - SchemaForm 表单组件
   - **功能**：多字段表单、校验、分步、分组、动态字段
   - **流程**：阅读文档 -> 定义 Schema -> 使用 useSchemaForm -> 集成 UI
   - **适用范围**：`src/views/**/*.vue, src/components/**/*.vue`
   - **前置要求**：必须先阅读 `docs/SCHEMA_FORM_COMPONENT.md`
   - **关键步骤**：
     - Schema 定义
     - useSchemaForm Hook 使用
     - 动态字段管理
     - 校验与提交

### 反馈与提示

8. **`08-toast-message-feedback.md`** - Toast & Message 反馈提示
   - **功能**：Toast 和 Message 反馈提示使用规范与实现要点
   - **流程**：判断场景 -> 选择 $message 或 $toast -> 调用 -> 验证
   - **适用范围**：`src/**/*.{ts,vue}`
   - **前置要求**：阅读 `docs/TOAST_AND_MESSAGE.md`、`docs/TOAST_UI_OVERRIDES.md`
   - **关键步骤**：
     - 组件内轻量通知 → `useToast()`
     - 非组件环境（拦截器、工具函数）→ `window.$toast` / `window.$message`
     - $message：居中纯提示（正中央、无关闭按钮）
     - $toast：按位置显示、带关闭按钮
     - 实现要点（居中样式、关闭按钮位置、内边距配置）

### 图表组件

9. **`09-use-echarts.md`** - UseEcharts 图表组件
   - **功能**：图表展示与交互，自动主题集成
   - **流程**：阅读文档 -> 使用 UseEcharts 组件 -> 配置 option -> 处理事件
   - **适用范围**：`src/views/**/*.vue, src/components/**/*.vue`
   - **前置要求**：必须先阅读 `docs/ECHARTS_THEME.md`
   - **关键步骤**：
     - 使用 `<UseEcharts>` 组件
     - 传入 `option` prop（EChartsOption）
     - 事件处理（on\* props）
     - 多图表联动（group/connectConfig）
     - 程序化控制（ref + ChartInstance）
   - **禁止**：手动实例化 ECharts、硬编码颜色、手动监听 ThemeStore

## 📖 使用指南

### 选择正确的 Skill

当收到任务时，根据任务类型选择对应的 Skill：

- **创建新组件** → `01-build-ui-component.md`
- **创建新页面** → `02-build-page-view.md`
- **修复 UI Bug** → `03-fix-ui-issue.md`
- **完整功能开发** → `04-full-feature.md`
- **重构组件** → `05-refactor-component.md`
- **修复样式问题** → `06-style-audit.md`
- **表单相关任务** → `07-SchemaForm.md`
- **反馈提示** → `08-toast-message-feedback.md`

### Skill 执行流程

1. **阅读相关规则**：在执行 Skill 前，先阅读相关的 Rules 文件
2. **遵循 Skill 步骤**：严格按照 Skill 文件中定义的步骤执行
3. **验证结果**：使用浏览器工具验证最终结果
4. **检查清单**：完成 Skill 文件中的检查清单

### 前置文档

某些 Skill 需要先阅读相关文档：

- **SchemaForm**：必须先阅读 `docs/SCHEMA_FORM_COMPONENT.md`
- **Toast/Message**：必须先阅读 `docs/TOAST_AND_MESSAGE.md`、`docs/TOAST_UI_OVERRIDES.md`
- **布局相关**：必须阅读 `docs/ADAPTIVE_LAYOUT.md`
- **认证相关**：必须阅读 `docs/AUTH_AND_LOGIN_FLOW.md`

## 🔗 相关资源

- **Rules 文件**：`.agent/rules/`
- **项目协议**：`docs/PROJECT_PROTOCOL.md`
- **黄金样本**：`docs/GOLDEN_SAMPLES/`
- **Cursor Skills**：`.cursor/skills/`（参考对应关系）

## 📝 与 Cursor Skills 的对应关系

虽然 Skills 的具体实现可能不同，但功能对应关系如下：

- `01-build-ui-component.md` ↔ Cursor 中通过 `06-assemble-ui-handoff.md` 交接
- `02-build-page-view.md` ↔ Cursor 中通过 `06-assemble-ui-handoff.md` 交接
- `03-fix-ui-issue.md` ↔ `03-fix-logic-only.md`（Cursor 专注逻辑）
- `04-full-feature.md` ↔ `01-generate-api-module.md` + `02-generate-feature-composable.md` + `06-assemble-ui-handoff.md`
- `05-refactor-component.md` ↔ `04-refactor-composable.md`
- `06-style-audit.md` ↔ Cursor 中通过规则自动检查
- `07-SchemaForm.md` ↔ `08-SchemaForm.md`
- `08-toast-message-feedback.md` ↔ `07-toast-message-feedback.md`
