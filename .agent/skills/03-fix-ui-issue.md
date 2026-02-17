---
description: 修复 UI 问题：Reproduce -> Fix -> Verify
globs: **/*.vue, **/*.ts
---

# 修复 UI 问题技能

## 1. 目标

修复报告的 UI Bug 或回归问题。

## 2. 步骤

### 步骤 1：复现

1. 使用 `browser` 工具访问 URL。
2. 确认问题存在（如有用，截图）。
3. 检查控制台错误。

### 步骤 2：定位原因（LCD）

- 检查组件代码。
- 检查 `uno.config.ts` 是否有缺失的类。
- 检查逻辑 Hook 是否有数据问题。
- **Vue 模板相关**（若报 `Error parsing JavaScript expression`、构建失败或 TS 类型错误）：
  - 多语句内联事件处理器 → 抽取到 script 方法。
  - 模板中使用 TypeScript 语法（`as`、`:`、`<>`）→ 移到 script 中。
  - `readonly` 数组 `includes` 类型不兼容 → 使用 `(ARRAY as readonly string[]).includes(val)`，赋值时显式断言。
  - 详见 `docs/VUE_TEMPLATE_ANTIPATTERNS.md`。
- **PrimeVue 组件配色**：若问题涉及 Button/Dialog 等组件的 hover、pressed、outlined/text 变体状态：
  - 检查 `src/utils/theme/primevue-preset.ts` 的 `initComponentButtonColorSchemeOptionsItems`
  - 确认 text/outlined 使用 `get('Light')` 作为 hover 背景，而非 `get('Text')`（\*-foreground）或 `get('')`（实色）
  - 详见 `docs/PRIMEVUE_THEME.md`

### 步骤 3：修复

- 应用修复。
- 确保遵循"禁止硬编码"规则。

### 步骤 4：验证

1. 在 `browser` 中刷新页面。
2. 确认 Bug 已消失。
3. 检查相关区域是否有回归。
