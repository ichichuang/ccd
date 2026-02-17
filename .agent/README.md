# Antigravity 规则与技能系统

本目录包含 Antigravity Agent 的操作约束和能力定义。

## 📋 目录结构

- **`.agent/rules/`**：规则文件，定义 AI 必须遵循的强制约束
- **`.agent/skills/`**：技能文件，定义标准操作流程（SOP）

## 📚 Rules（规则文件）

规则文件定义了 AI 必须遵循的严格边界。标记了 `alwaysApply: true` 的规则会自动应用。

### 核心规则（自动应用）

1. **`00-primary-directive.md`** - 主指令与核心原则
   - **功能**：SSOT 遵循、工具优先、禁止硬编码
   - **适用范围**：所有文件（`globs: **/*`）
   - **自动应用**：是
   - **关键内容**：
     - 单一真理来源（SSOT）
     - 工具优先策略
     - 禁止硬编码值

2. **`10-ui-architecture.md`** - UI 架构规范
   - **功能**：UnoCSS 唯一、PrimeVue 集成、组件系统
   - **适用范围**：Vue/TSX/TS 文件（`globs: **/*.vue, **/*.tsx, **/*.ts`）
   - **自动应用**：是
   - **关键内容**：
     - UnoCSS 唯一样式方案
     - PrimeVue 组件使用规范
     - 组件复用规则

3. **`12-logic-awareness.md`** - 逻辑层规范
   - **功能**：API -> Hook -> UI 三层架构
   - **适用范围**：Vue/TS/TSX 文件（`globs: **/*.vue, **/*.ts, **/*.tsx`）
   - **自动应用**：是
   - **关键内容**：
     - 三层架构强制分离
     - API 层定义
     - Hook 层业务逻辑
     - UI 层纯展示

4. **`15-toolchain-first.md`** - 工具链优先
   - **功能**：必备工具查找表，强制复用现有工具
   - **适用范围**：TS/Vue/TSX 文件（`globs: **/*.ts, **/*.vue, **/*.tsx`）
   - **自动应用**：是
   - **关键内容**：
     - HTTP 请求工具
     - 安全存储工具
     - 日期/字符串工具
     - 全局事件工具

5. **`20-code-standards.md`** - 代码规范
   - **功能**：命名、目录结构、导出模式、TypeScript 最佳实践
   - **适用范围**：TS/Vue/TSX 文件（`globs: **/*.ts, **/*.vue, **/*.tsx`）
   - **自动应用**：是
   - **关键内容**：
     - 命名约定（camelCase/PascalCase/kebab-case）
     - 目录结构规范
     - 导出模式（禁止 default export）
     - TypeScript 类型注解要求
     - Vue 模板语法约束

6. **`22-verification.md`** - 验证规范
   - **功能**：Agent 自查与浏览器测试标准
   - **适用范围**：所有文件（`globs: **/*`）
   - **自动应用**：是
   - **关键内容**：
     - 验证循环流程
     - 浏览器工具使用
     - 常见失败模式检查
     - 完成定义（Definition of Done）

### 特定场景规则

7. **`25-adaptive-layout.md`** - 布局自适应规则
   - **功能**：PC/Tablet/Mobile、断点、有效显隐、userAdjusted
   - **适用范围**：layouts 相关文件（`globs: src/layouts/**/*, src/stores/modules/layout.ts, src/stores/modules/device.ts`）
   - **自动应用**：否（按文件匹配）
   - **详细文档**：`docs/ADAPTIVE_LAYOUT.md`
   - **关键内容**：
     - 单一驱动源
     - 断点系统
     - 有效显隐逻辑

8. **`08-auth-login-flow.md`** - 登录/鉴权流程
   - **功能**：登录/登出、token、401、路由守卫、白名单
   - **适用范围**：TS/Vue 文件（`globs: src/**/*.{ts,vue}`）
   - **自动应用**：否（按文件匹配）
   - **详细文档**：`docs/AUTH_AND_LOGIN_FLOW.md`
   - **关键内容**：
     - 登录流程
     - Token 管理
     - 401 处理
     - 路由守卫
     - 动态路由

## 🛠️ Skills（技能文件）

技能文件定义了常见任务的标准操作流程。

详见：`.agent/skills/README.md`

## 📖 使用指南

### 自动应用的规则

标记了 `alwaysApply: true` 的规则会自动应用，无需手动引用。这些规则会在所有任务中生效。

### 文件匹配规则

带有 `globs` 字段的规则会根据当前编辑的文件自动匹配。例如，编辑 `src/layouts/**/*` 文件时，`25-adaptive-layout.md` 会自动应用。

### 手动引用

对于复杂任务，建议显式引用相关规则：

```
先阅读 @docs/PROJECT_PROTOCOL.md
遵循 @.agent/rules/00-primary-directive.md
```

### Agent 工作流程

当 Agent 开始任务时，应该：

1. 阅读 **Rules** 以理解约束
2. 选择适当的 **Skill** 执行任务
3. 遵循 Skill 文件中的步骤
4. **验证**结果（使用浏览器工具检查）

## 🔗 相关文档

- **项目协议**：`docs/PROJECT_PROTOCOL.md`
- **黄金样本**：`docs/GOLDEN_SAMPLES/`
- **Cursor 规则**：`.cursor/rules/`
- **Cursor Skills**：`.cursor/skills/`

## 📝 规则与 Cursor 的对应关系

虽然 `.agent` 目录用于 Antigravity Agent，`.cursor` 目录用于 Cursor AI 编辑器，但两者的规则和技能应该保持一致：

- `.agent/rules/00-primary-directive.md` ↔ `.cursor/rules/00-core-architecture.mdc`
- `.agent/rules/10-ui-architecture.md` ↔ `.cursor/rules/20-ui-styling.mdc`
- `.agent/rules/12-logic-awareness.md` ↔ `.cursor/rules/10-logic-layer.mdc`
- `.agent/rules/15-toolchain-first.md` ↔ `.cursor/rules/15-utils-and-hooks-first.mdc`
- `.agent/rules/25-adaptive-layout.md` ↔ `.cursor/rules/22-layouts.mdc`
- `.agent/rules/08-auth-login-flow.md` ↔ `.cursor/rules/08-auth-login-flow.mdc`

注意：`.agent` 特有的规则（如 `22-verification.md`、`20-code-standards.md`）在 Cursor 中可能分散在其他规则文件中。
