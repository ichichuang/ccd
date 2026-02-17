---
description: Toast & Message 反馈提示：使用规范与实现要点
globs: src/**/*.{ts,vue}
---

# Toast & Message 反馈提示技能

## 1. 目标

在拦截器、errorHandler、工具函数等非组件环境需要轻量提示时，正确选用 `$message` 或 `$toast`。

## 2. 决策

- **$message**：居中纯提示（正中央、无关闭按钮、life 后自动消失）；适合错误/成功/信息/警告等一般反馈。
- **$toast**：可指定位置（tl/tc/tr/bl/bc/br）、可带关闭按钮；适合需定位或可交互的提示。

## 3. 使用

- **非组件环境**：`window.$message?.success('操作成功')` 或 `window.$toast?.dangerIn('top-right', '错误', '详情')`
- **组件内**：优先 PrimeVue `useToast()`
- **文档**：`docs/TOAST_AND_MESSAGE.md`、`docs/TOAST_UI_OVERRIDES.md`

## 4. 前置要求

- `docs/TOAST_AND_MESSAGE.md` - API 与使用方式
- `docs/TOAST_UI_OVERRIDES.md` - 样式覆盖说明（居中、关闭按钮、内边距）

## 5. 实现要点（技术细节）

### 5.1 $message 实现

- **buildMessageApi**：`group: 'center'`、`closable: false`
- **Toast 配置**：`position="center"`、`group="center"`

### 5.2 居中样式实现

- **CSS 类**：`.p-toast.p-toast-center`
- **样式规则**：
  - `top: 50%`
  - `left: 50%`
  - `transform: translate(-50%, -50%)`

### 5.3 关闭按钮位置

- **CSS 选择器**：`.p-toast:not(.p-toast-center)`
- **样式规则**：
  - `position: absolute`
  - `top: 0`
  - `right: 0`

### 5.4 内边距配置

- **配置文件**：`src/utils/theme/primevue-preset.ts`
- **配置项**：`toast.content.padding`
- **使用变量**：`var(--spacing-*)`

## 6. 相关文件

- `src/layouts/components/AppPrimeVueGlobals.vue` - 挂载、buildMessageApi、样式
- `src/utils/theme/primevue-preset.ts` - Toast content.padding
- `docs/TOAST_AND_MESSAGE.md` - API 文档
- `docs/TOAST_UI_OVERRIDES.md` - 样式覆盖说明

## 7. 验证

- 检查控制台是否有错误
- 验证 $message 居中显示
- 验证 $toast 按指定位置显示
- 验证关闭按钮位置正确
