# Cursor 规则与技能系统

本目录包含 Cursor AI 编辑器的操作约束和能力定义。

## 📋 目录结构

- **`.cursor/rules/`**：规则文件，定义 AI 必须遵循的强制约束
- **`.cursor/skills/`**：技能文件，定义标准操作流程（SOP）

## 📚 Rules（规则文件）

规则文件定义了 AI 必须遵循的严格边界。标记了 `alwaysApply: true` 的规则会自动应用。

详见：`.cursor/rules/README.md`

## 🛠️ Skills（技能文件）

技能文件定义了常见任务的标准操作流程。

详见：`.cursor/skills/README.md`

## 📖 使用指南

### 自动应用的规则

标记了 `alwaysApply: true` 的规则会自动应用，无需手动引用。这些规则会在所有任务中生效。

### 文件匹配规则

带有 `globs` 字段的规则会根据当前编辑的文件自动匹配。例如，编辑 `src/hooks/**/*.ts` 文件时，`10-logic-layer.mdc` 会自动应用。

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
```

### Cursor 工作流程

当 Cursor 开始任务时，应该：

1. 阅读 **Rules** 以理解约束
2. 选择适当的 **Skill** 执行任务
3. 遵循 Skill 文件中的步骤
4. **验证**结果（类型检查、构建检查）

## 🔗 相关文档

- **项目协议**：`docs/PROJECT_PROTOCOL.md`
- **黄金样本**：`docs/GOLDEN_SAMPLES/`
- **Antigravity 规则**：`.agent/rules/`
- **Antigravity Skills**：`.agent/skills/`

## 📝 规则与 Antigravity 的对应关系

虽然 `.cursor` 目录用于 Cursor AI 编辑器，`.agent` 目录用于 Antigravity Agent，但两者的规则和技能应该保持一致：

- `.cursor/rules/00-core-architecture.mdc` ↔ `.agent/rules/00-primary-directive.md`
- `.cursor/rules/10-logic-layer.mdc` ↔ `.agent/rules/12-logic-awareness.md`
- `.cursor/rules/12-api-layer.mdc` ↔ 无直接对应（.cursor 特有）
- `.cursor/rules/15-utils-and-hooks-first.mdc` ↔ `.agent/rules/15-toolchain-first.md`
- `.cursor/rules/18-components-and-icons.mdc` ↔ `.agent/rules/10-ui-architecture.md`（部分）
- `.cursor/rules/20-ui-styling.mdc` ↔ `.agent/rules/10-ui-architecture.md`（部分）
- `.cursor/rules/22-layouts.mdc` ↔ `.agent/rules/25-adaptive-layout.md`
- `.cursor/rules/24-tsx-rendering.mdc` ↔ 无直接对应（.cursor 特有）
- `.cursor/rules/25-html-tag-semantics.mdc` ↔ `.agent/rules/25-html-tag-semantics.md`
- `.cursor/rules/08-auth-login-flow.mdc` ↔ `.agent/rules/08-auth-login-flow.md`

注意：`.agent` 特有的规则（如 `22-verification.md`、`20-code-standards.md`）在 Cursor 中可能分散在其他规则文件中。
