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

## Skills 列表

1. `01-generate-api-module.md`：新增接口（先落 `src/api/<module>/<feature>.ts`）
2. `02-generate-feature-composable.md`：生成业务 Hook（用 `useHttpRequest` 串 API）
3. `03-fix-logic-only.md`：只修逻辑不动 UI（不改 template/class）
4. `04-refactor-composable.md`：把膨胀逻辑抽到 `src/hooks/modules/`
5. `05-add-icon.md`：智能选图标（Lucide→MDI→Logos→custom SVG）
6. `06-assemble-ui-handoff.md`：生成交接给 Antigravity 的 UI 指令（只做 UI）

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
```
