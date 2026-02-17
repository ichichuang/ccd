# Toast & Message 样式覆盖说明

> **目标读者：AI**。本文档供 AI 在代码生成时参照，涉及 Toast/Message 样式定制时参阅。

## 1. 概述

本项目在 `AppPrimeVueGlobals.vue` 中对 PrimeVue Toast 做了以下样式覆盖，以符合设计规范。样式定义在该组件的 `<style>` 块中。

## 2. Message 居中 Toast（.p-toast-center）

- **目的**：`$message` 在视口正中央展示
- **实现**：`top: 50%`、`left: 50%`、`transform: translate(-50%, -50%)`
- **说明**：PrimeVue 默认 `position="center"` 仅设 `top/left 50%`，无 `transform`，导致左上角在中心而非整体居中，需在此补充

## 3. Toast 关闭按钮贴右上角

- **作用范围**：`.p-toast:not(.p-toast-center)`（排除无关闭按钮的 center Toast）
- **消息根**：`.p-toast-message` 设 `position: relative` 作为定位参考
- **关闭按钮**：`.p-toast-close-button` 设 `position: absolute; top: 0; right: 0`
- **内容区**：`.p-toast-message-content` 设 `padding-right` 为关闭按钮预留空间

## 4. Toast 内边距

- **位置**：`src/utils/theme/primevue-preset.ts` 中 `components.toast.content.padding`
- **值**：`var(--spacing-sm) var(--spacing-xs) var(--spacing-sm) var(--spacing-sm)`
- **说明**：替代 `overlay.popover.padding`，使用语义 spacing 变量，更紧凑

## 5. 相关文档

- API 使用：`docs/TOAST_AND_MESSAGE.md`
- 组件挂载：`src/layouts/components/AppPrimeVueGlobals.vue`
- 主题 preset：`src/utils/theme/primevue-preset.ts`
