---
description: 样式审计：Find Hardcoded -> Replace with UnoCSS
globs: **/*.vue, **/*.css, **/*.scss
---

# 样式审计技能

## 1. 目标

识别并修复代码库中不合规的样式（硬编码值）。

## 2. 步骤

### 步骤 1：扫描

- 查找带有原始 CSS 值的 `<style>` 块。
- 查找带有硬编码值的 `style="..."` 属性。
- 查找非语义工具类（例如，`text-[#ff0000]`）。
- 查找 Vue 模板中的 TypeScript 语法（例如，`:prop="value as any"`、`:prop="value as MyType"`、`:prop="value: Type"`）。

### 步骤 2：映射到系统

- **颜色**：映射到 `primary`、`secondary`、`danger`、`success`、`info`、`warn`（及其 `-light`、`-hover` 变体）。
- **间距**：映射到 `xs`、`sm`、`md`、`lg`、`xl`、`2xl`...（`p-md`、`gap-lg`）。
- **布局**：映射到 `w-sidebarWidth`、`h-headerHeight`。

### 步骤 3：替换

- 转换 `style="color: red"` -> `class="text-danger"`。
- 转换 `padding: 20px` -> `class="p-xl"`（检查严格比例）。

### 步骤 4：验证

- 在 `browser` 中视觉验证更改。
- 确保没有布局破坏。
