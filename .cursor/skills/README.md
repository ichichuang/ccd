# Cursor Skills（项目架构指令库）

本目录用于保存**可复制粘贴的标准 Prompt 模板**，让 Cursor 在不同任务下稳定遵循项目架构（`docs/` + `.cursor/rules/*.mdc`）。

> 注意：Rules（`.cursor/rules/*.mdc`）负责“强制约束/禁止项”；Skills 负责“如何下指令/如何拆解任务”。
> 每次使用 Skill 时，请在 Prompt 中显式 @ 引用：`docs/PROJECT_PROTOCOL.md` 与相关 `.cursor/rules/*.mdc`。

## 约定（已确认）

- **API 类型命名**：使用域前缀 + feature 前缀，例如 `UserLoginReq` / `UserLoginRes`
- **API 文件导出**：允许同时导出：
  - `build<Domain><Feature>Method(...)`（推荐，配合 `useHttpRequest`）
  - `request<Domain><Feature>(...)`（可选便捷函数，内部仍必须走 Alova/`@/utils/http`）
- **API 文件限制**（AutoImport 扫描 `src/api/**/*`）：禁止 `export default`；禁止导出通用顶层名（get/list/data 等）

## 📋 Skills 列表

### API 与业务逻辑

1. **`01-generate-api-module.md`** - 生成 API 模块
   - **功能**：新增接口，先落 `src/api/<module>/<feature>.ts`
   - **流程**：定义 DTO 类型 → 创建 Method Builder → 可选便捷函数
   - **适用范围**：`src/api/**/*.ts`
   - **关键步骤**：
     - 扁平化目录结构（禁止三级目录）
     - 定义请求/响应类型（禁止 `any`）
     - 导出 `build<Domain><Feature>Method`
     - 禁止 `export default` 和通用导出名

2. **`02-generate-feature-composable.md`** - 生成业务 Hook
   - **功能**：生成业务逻辑 Hook，使用 `useHttpRequest` 串接 API
   - **流程**：创建 Hook 文件 → 使用 useHttpRequest → 定义状态与逻辑
   - **适用范围**：`src/hooks/modules/**/*.ts`
   - **关键步骤**：
     - 遵循黄金样本（`docs/GOLDEN_SAMPLES/useFeatureLogic.ts`）
     - 使用 `useHttpRequest` 进行 HTTP 请求
     - 显式类型注解（ref/computed/reactive）
     - 禁止 `any`（边界层例外）

3. **`03-fix-logic-only.md`** - 仅修复逻辑
   - **功能**：只修逻辑不动 UI（不改 template/class）
   - **流程**：定位问题 → 修复逻辑 → 验证
   - **适用范围**：`src/hooks/**/*.ts, src/utils/**/*.ts`
   - **关键步骤**：
     - 不修改 template 和 class
     - 只修改 script 逻辑
     - 保持类型安全

4. **`04-refactor-composable.md`** - 重构 Composable
   - **功能**：把膨胀逻辑抽到 `src/hooks/modules/`
   - **流程**：识别可提取逻辑 → 创建新 Hook → 重构引用
   - **适用范围**：`src/**/*.{ts,vue}`
   - **关键步骤**：
     - 识别重复/膨胀逻辑
     - 创建独立 Hook
     - 更新引用
     - 保持类型安全

### UI 组件与图标

5. **`05-add-icon.md`** - 添加图标
   - **功能**：智能选择图标（Lucide → MDI → Logos → custom SVG）
   - **流程**：搜索图标 → 选择最佳匹配 → 使用 Icons 组件
   - **适用范围**：`src/**/*.vue`
   - **关键步骤**：
     - 优先使用 Lucide
     - 缺失时使用 MDI
     - 品牌图标使用 Logos
     - 无匹配时创建 custom SVG
     - 必须使用 `<Icons>` 组件

6. **`06-assemble-ui-handoff.md`** - 组装 UI 交接指令
   - **功能**：生成交接给 Antigravity 的 UI 指令（只做 UI）
   - **流程**：分析需求 → 生成 UI 指令 → 包含完整上下文
   - **适用范围**：UI 开发任务
   - **关键步骤**：
     - 明确 UI 需求
     - 列出组件依赖
     - 提供完整上下文
     - 遵循组件复用规则

### 反馈与表单

7. **`07-toast-message-feedback.md`** - Toast & Message 反馈提示
   - **功能**：Toast 和 Message 反馈提示使用规范
   - **流程**：判断场景 → 选择 $message 或 $toast → 调用
   - **适用范围**：`src/**/*.{ts,vue}`
   - **前置要求**：阅读 `docs/TOAST_AND_MESSAGE.md`
   - **关键步骤**：
     - 组件内轻量通知 → `useToast()`
     - 非组件环境（拦截器、工具函数）→ `window.$toast` / `window.$message`
     - $message：居中纯提示（正中央、无关闭按钮）
     - $toast：按位置显示、带关闭按钮

8. **`08-SchemaForm.md`** - SchemaForm 表单组件
   - **功能**：多字段表单、校验、分步、分组、动态字段
   - **流程**：阅读文档 → 定义 Schema → 使用 useSchemaForm → 集成 UI
   - **适用范围**：`src/views/**/*.vue, src/components/**/*.vue`
   - **前置要求**：必须先阅读 `docs/SCHEMA_FORM_COMPONENT.md`
   - **关键步骤**：
     - Schema 定义
     - useSchemaForm Hook 使用
     - 动态字段管理
     - 校验与提交

### 图表组件

9. **`09-use-echarts.md`** - UseEcharts 图表组件
   - **功能**：图表展示与交互，自动主题集成
   - **流程**：阅读文档 → 使用 UseEcharts 组件 → 配置 option → 处理事件
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

- **新增接口** → `01-generate-api-module.md`
- **生成业务 Hook** → `02-generate-feature-composable.md`
- **修复逻辑 Bug** → `03-fix-logic-only.md`
- **重构逻辑** → `04-refactor-composable.md`
- **添加图标** → `05-add-icon.md`
- **UI 开发任务** → `06-assemble-ui-handoff.md`
- **反馈提示** → `07-toast-message-feedback.md`
- **表单相关任务** → `08-SchemaForm.md`

### Skill 执行流程

1. **阅读相关规则**：在执行 Skill 前，先阅读相关的 Rules 文件
2. **遵循 Skill 步骤**：严格按照 Skill 文件中定义的步骤执行
3. **验证结果**：完成 Skill 文件中的验证清单

### 前置文档

某些 Skill 需要先阅读相关文档：

- **SchemaForm**：必须先阅读 `docs/SCHEMA_FORM_COMPONENT.md`
- **Toast/Message**：必须先阅读 `docs/TOAST_AND_MESSAGE.md`
- **布局相关**：必须阅读 `docs/ADAPTIVE_LAYOUT.md`
- **数据表格**：必须阅读 `docs/DataTable_COMPONENT.md`

## 通用使用法（建议复制）

在每次任务的 Prompt 首部加上：

```
先阅读 @docs/PROJECT_PROTOCOL.md
并遵循 @.cursor/rules/00-core-architecture.mdc
同时遵循与任务相关的 rules：
- @.cursor/rules/10-logic-layer.mdc（逻辑）
- @.cursor/rules/12-api-layer.mdc（新增接口）
- @.cursor/rules/15-utils-and-hooks-first.mdc（工具优先）
- @.cursor/rules/18-components-and-icons.mdc（组件/图标）
- @.cursor/rules/20-ui-styling.mdc（UI/样式）
- @.cursor/rules/22-layouts.mdc（布局壳/Admin 子模式）
- @.cursor/rules/24-tsx-rendering.mdc（程序化渲染用 TSX，禁止 h()）
涉及布局/侧栏/响应式时，须阅读 @docs/ADAPTIVE_LAYOUT.md 并遵循适配规则。
涉及数据表格（列表/分页/排序/导出）时，须阅读 @docs/DataTable_COMPONENT.md 并优先使用 DataTable。
```
