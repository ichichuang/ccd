---
description: Antigravity 主指令与核心原则 (Primary Directive)
globs: **/*
alwaysApply: true
---

# Antigravity 主指令

你是一个能够进行全栈变更的自主 Agent。你的主要操作约束如下。

## 1. 单一真理来源（SSOT）遵循

- **文档即法律**：你必须优先遵循 `docs/PROJECT_PROTOCOL.md` 和 `docs/ANTIGRAVITY_UI_RULES.md`。
- **配置驱动**：`uno.config.ts`、`src/constants/` 和 `src/types/` 是样式和逻辑约束的 SSOT。不要在代码中发明新的颜色、尺寸或类型。
- **黄金样本**：创建文件时，必须严格模仿 `docs/GOLDEN_SAMPLES/` 的结构。
- **构建与自动导入**：自动导入库的完整列表（vue、vue-router、pinia、@vueuse/core、@/locales t/$t）、扫描目录（stores、hooks、api、utils、constants/\*、CScrollbar）和组件范围（仅 src/components；排除 src/layouts；PrimeVueResolver）在 **`docs/BUILD_SYSTEM.md`** 中。不确定什么可以在不使用 `import` 的情况下使用时，请查阅该文档。不要手动从 `'vue'` 导入 `ref`/`computed`/`watch`；删除未使用的导入；对于有意未使用的变量，使用 **`_`** 前缀。

## 2. "工具与 Hooks 优先"策略（严格）

在编写任何新的逻辑或样式代码之前：

1. **检查现有工具**：必须搜索 `src/utils/` 和 `src/hooks/` 以查找现有解决方案。
2. **复用，不要重新发明**：
   - 需要 HTTP？使用 `useHttpRequest` / `alovaInstance`。**永远不要**直接使用 `fetch`/`axios`。
   - 需要格式化？使用 `useDateUtils` / `strings.ts`。
   - 需要存储？使用 `safeStorage`。
   - 需要图标？使用 `<Icons name="..." />` 匹配 `uno-icons` safelist。

## 3. "禁止硬编码"策略

- **样式**：**永远不要**在 `<style>` 或 `:style` 中编写硬编码的 px/rem/hex 颜色。
  - ✅ 使用 UnoCSS 工具类（例如，`p-md`、`text-primary`、`bg-card`）。
  - ✅ 如果是动态的，使用 CSS 变量（例如，`style="--custom-height: 100px"`）。
- **文本**：如果可用，使用 i18n 键（检查 `src/locales`），或至少使用集中式常量。

## 4. 验证要求

你是一个 **Agent**，而不仅仅是代码生成器。你必须验证你的工作。

- **构建检查**：创建/修改文件后，如果不确定，始终运行构建检查或类型检查。
- **浏览器验证**：使用 `browser` 工具：
  1. 打开正在修改的页面。
  2. 验证没有控制台错误（红色文本）。
  3. 验证视觉布局符合预期（例如，"按钮是红色且居中"）。
  4. 验证交互性（点击按钮、提交表单）。

## 5. 文件与目录结构

- **API 层**：`src/api/<module>/<feature>.ts`（扁平两级）。
- **Hooks**：`src/hooks/modules/`（业务逻辑）或 `src/hooks/layout/`（UI/基础设施）。
- **组件**：`src/components/<PascalCase>/` 或 `src/views/<module>/`。
- **图片**：放置在 `src/assets/images` 或 `public/`。
