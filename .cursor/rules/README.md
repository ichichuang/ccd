# Cursor 规则文件索引

本目录包含 Cursor AI 编辑器必须遵循的规则文件。规则文件定义了强制约束和禁止项。

> **注意**：Rules（`.cursor/rules/*.mdc`）负责"强制约束/禁止项"；Skills（`.cursor/skills/*.md`）负责"如何下指令/如何拆解任务"。

## 📋 规则分类

### 核心架构规则（自动应用）

1. **`00-core-architecture.mdc`** - 核心架构约束
   - **功能**：适用于所有生成任务的核心约束
   - **适用范围**：`src/**/*.{ts,vue}`
   - **自动应用**：是（`alwaysApply: true`）
   - **关键内容**：
     - 包管理器（pnpm 优先）
     - 绝对禁止项（Options API、fetch/axios、硬编码等）
     - TypeScript 语法约束（禁止模板中使用 TS 语法、禁止隐式类型推断）
     - 设计系统要求（Theme、Size、Layout、Responsive）
     - 路由系统要求
     - 认证流程要求

### 逻辑层规则

2. **`10-logic-layer.mdc`** - 逻辑层规则
   - **功能**：生成 Hooks 和业务逻辑时的规则
   - **适用范围**：`src/hooks/**/*.ts`
   - **自动应用**：否（按文件匹配）
   - **关键内容**：
     - 结构遵循黄金样本（`docs/GOLDEN_SAMPLES/useFeatureLogic.ts`）
     - 使用 `useHttpRequest` 进行 HTTP 请求
     - 显式类型注解要求（ref/computed/reactive）
     - 禁止 `any`（边界层例外）

3. **`12-api-layer.mdc`** - API 层规范
   - **功能**：扁平化 src/api 二级目录，新增接口先落 src/api
   - **适用范围**：`src/**/*.{ts,vue}`
   - **自动应用**：是（`alwaysApply: true`）
   - **关键内容**：
     - 扁平化目录结构（禁止三级目录）
     - 禁止 `export default`
     - 禁止通用导出名（get/list/data 等）
     - 导出命名模式（`build<Domain><Feature>Method`）

### 工具与组件规则

4. **`15-utils-and-hooks-first.mdc`** - 工具优先策略
   - **功能**：遇到需求先复用 src/utils 与 src/hooks
   - **适用范围**：`src/**/*.{ts,vue}`
   - **自动应用**：是（`alwaysApply: true`）
   - **关键内容**：
     - 强制查找现有工具（HTTP、Storage、Date、Strings、Browser 等）
     - 工具查找工作流
     - 函数级目录（精确到函数名）
     - 新增工具的归档规则

5. **`18-components-and-icons.mdc`** - 组件与图标规范
   - **功能**：优先复用 src/components，图标必须走 Icons
   - **适用范围**：`src/**/*.vue`
   - **自动应用**：是（`alwaysApply: true`）
   - **关键内容**：
     - 组件复用映射（CScrollbar、AnimateWrapper、Icons、UseEcharts、SchemaForm、DataTable、PrimeDialog）
     - 图标智能选择规则（Lucide → MDI → Logos → custom SVG）
     - Icons 颜色与权重：class 不生效时加 `!` 或改用 `color` prop；Icons 的 group-hover 须在自身加 transition；详见 `docs/UNOCSS_AND_ICONS.md` §6.3.1、§6.3.2
     - 禁止模式（禁止 raw SVG、禁止外部图标 URL）

### UI/样式规则

6. **`20-ui-styling.mdc`** - UI/样式层规则
   - **功能**：配色、尺寸、布局、UnoCSS、SCSS、交互过渡
   - **适用范围**：`src/**/*.vue`
   - **自动应用**：否（按文件匹配）
   - **关键内容**：
     - 配色系统（Theme Store、语义变量）
     - 尺寸系统（Size Store、语义类）
     - 布局与响应式系统（Breakpoints、Layout Store）
     - UnoCSS 类使用规范（含 Transition & Interaction：hover/active/focus 须配 transition；Icons 的 group-hover 须在 Icons 自身加 transition；duration-scale 须与 transition\* 搭配；pt content 同样需 transition）
     - SCSS 使用限制

7. **`22-layouts.mdc`** - Layouts 系统
   - **功能**：LayoutMode、AdminLayoutMode、布局壳扩展
   - **适用范围**：`src/layouts/**/*.{ts,vue}`
   - **自动应用**：否（按文件匹配）
   - **关键内容**：
     - LayoutMode 枚举
     - AdminLayoutMode 子模式
     - 布局壳扩展方式
     - 布局相关 Store

### 特定场景规则

8. **`24-tsx-rendering.mdc`** - TSX 渲染规范
   - **功能**：程序化渲染必须用 TSX，禁止使用 h()
   - **适用范围**：`src/**/*.{vue,tsx}`
   - **自动应用**：是（`alwaysApply: true`）
   - **关键内容**：
     - 何时使用 TSX（render functions、动态 slot content、table cell renderers）
     - TSX 使用方式（Vue SFC 中、独立 .tsx 组件）
     - 禁止模式（禁止 `h()`、禁止 `createElement`）

9. **`25-html-tag-semantics.mdc`** - HTML 标签语义与格式化规范
   - **功能**：正确使用 code/span/div/pre，避免格式化冲突和语法错误
   - **适用范围**：`src/**/*.{vue,tsx}`
   - **自动应用**：是（`alwaysApply: true`）
   - **关键内容**：
     - `<code>` 仅用于 `<pre><code>` 代码块组合
     - `<span>` 用于内联样式，特别是在 `<p>` 标签内
     - `<div>` 用于块级容器和可点击块（不能在 `<p>` 内）
     - HTML 嵌套规则（块级元素不能在 `<p>` 内）
     - Prettier/ESLint 格式化冲突解决

10. **`08-auth-login-flow.mdc`** - 登录/鉴权流程

- **功能**：登录/登出、token、401、路由守卫
- **适用范围**：`src/**/*.{ts,vue}`
- **自动应用**：否（按文件匹配）
- **详细文档**：`docs/AUTH_AND_LOGIN_FLOW.md`
- **关键内容**：
  - 登录流程
  - Token 管理
  - 401 处理
  - 路由守卫
  - 动态路由

11. **`26-repair-list-workflow.mdc`** - 修复清单工作流

- **功能**：repair_list.txt 的创建、写入、进度跟踪与清空
- **适用范围**：项目根目录，检查/修复类任务
- **自动应用**：是（`alwaysApply: true`）
- **关键内容**：
  - Ask 模式询问是否写入，Agent 模式自动写入
  - 纯 txt 格式，✅ 标记进度
  - 全部解决后清空内容
  - 已加入 .gitignore，不提交

## 📖 使用指南

### 自动应用规则

标记了 `alwaysApply: true` 的规则会自动应用，无需手动引用。这些规则会在所有任务中生效：

- `00-core-architecture.mdc`
- `12-api-layer.mdc`
- `15-utils-and-hooks-first.mdc`
- `18-components-and-icons.mdc`
- `24-tsx-rendering.mdc`
- `25-html-tag-semantics.mdc`
- `26-repair-list-workflow.mdc`

### 文件匹配规则

带有 `globs` 字段的规则会根据当前编辑的文件自动匹配：

- 编辑 `src/hooks/**/*.ts` → `10-logic-layer.mdc` 自动应用
- 编辑 `src/layouts/**/*.{ts,vue}` → `22-layouts.mdc` 自动应用
- 编辑 `src/**/*.vue` → `20-ui-styling.mdc` 自动应用

### 手动引用

对于复杂任务，建议显式引用相关规则：

```
先阅读 @docs/PROJECT_PROTOCOL.md
遵循 @.cursor/rules/00-core-architecture.mdc
同时遵循与任务相关的 rules：
- @.cursor/rules/10-logic-layer.mdc（逻辑）
- @.cursor/rules/12-api-layer.mdc（新增接口）
- @.cursor/rules/15-utils-and-hooks-first.mdc（工具优先）
- @.cursor/rules/18-components-and-icons.mdc（组件/图标）
- @.cursor/rules/20-ui-styling.mdc（UI/样式）
- @.cursor/rules/22-layouts.mdc（布局壳/Admin 子模式）
- @.cursor/rules/24-tsx-rendering.mdc（程序化渲染用 TSX，禁止 h()）
- @.cursor/rules/25-html-tag-semantics.mdc（HTML 标签语义与格式化规范）
```

### 规则元数据说明

每个规则文件都包含元数据：

- **`description`**：规则描述（用于 AI 理解）
- **`globs`**：文件匹配模式（用于自动应用）
- **`alwaysApply`**：是否总是应用（true/false）

## 🔗 相关文档

- **项目协议**：`docs/PROJECT_PROTOCOL.md`（必读）
- **Cursor Skills**：`.cursor/skills/`
- **Antigravity 规则**：`.agent/rules/`（参考对应关系）
- **详细文档**：`docs/` 目录下的各专项文档

## 📝 规则与 Antigravity 的对应关系

虽然 `.cursor` 目录用于 Cursor AI 编辑器，`.agent` 目录用于 Antigravity Agent，但两者的规则应该保持一致：

- `00-core-architecture.mdc` ↔ `00-primary-directive.md`
- `10-logic-layer.mdc` ↔ `12-logic-awareness.md`
- `12-api-layer.mdc` ↔ 无直接对应（.cursor 特有）
- `15-utils-and-hooks-first.mdc` ↔ `15-toolchain-first.md`
- `18-components-and-icons.mdc` ↔ `10-ui-architecture.md`（部分）
- `20-ui-styling.mdc` ↔ `10-ui-architecture.md`（部分）
- `22-layouts.mdc` ↔ `25-adaptive-layout.md`
- `24-tsx-rendering.mdc` ↔ 无直接对应（.cursor 特有）
- `25-html-tag-semantics.mdc` ↔ `25-html-tag-semantics.md`
- `08-auth-login-flow.mdc` ↔ `08-auth-login-flow.md`
- `26-repair-list-workflow.mdc` ↔ `26-repair-list-workflow.md`

注意：`.agent` 特有的规则（如 `22-verification.md`、`20-code-standards.md`）在 Cursor 中可能分散在其他规则文件中。
