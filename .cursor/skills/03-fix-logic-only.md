# Skill 03：Fix Logic Only（只修逻辑，不动 UI）

## Goal

修复 bug / 优化逻辑时，**只修改逻辑层**（`<script setup>` / composable / store），不破坏现有 UI 结构与 UnoCSS 类名。

## Inputs

- 具体问题描述（报错、复现步骤、期望行为）
- 涉及文件路径（若已知）

## Pre-check（强制）

- `@docs/PROJECT_PROTOCOL.md`
- `@.cursor/rules/00-core-architecture.mdc`
- `@.cursor/rules/10-logic-layer.mdc`
- `@.cursor/rules/15-utils-and-hooks-first.mdc`

## Task

1. 定位逻辑问题并修复
2. 必要时把复杂逻辑抽到 `src/hooks/modules/`（保持 UI 不动）
3. 若涉及请求：必须通过 `src/api/**` + `useHttpRequest`

## Output

- 仅输出被修改的逻辑代码/文件（并说明未触碰 template/class）

## Hard Constraints

- CRITICAL：不修改 `<template>` 结构与任何 UnoCSS class（除非用户明确允许）
- 禁止新增 raw CSS
- 禁止 fetch/axios
- 禁止 any

## Prompt 模板（复制使用）

```
先阅读 @docs/PROJECT_PROTOCOL.md
遵循 @.cursor/rules/00-core-architecture.mdc @.cursor/rules/10-logic-layer.mdc @.cursor/rules/15-utils-and-hooks-first.mdc

任务：修复逻辑问题（只改逻辑，不动 UI）

CRITICAL：
- 不修改 <template> 与任何 class
- 只修改 <script setup> / composable / store

问题描述：
<粘贴报错/复现/期望>
```
