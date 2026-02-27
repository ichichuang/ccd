# Toast & Message 全局 API

> **目标读者：AI**。本文档供 AI 在代码生成时参照，涉及非组件环境的反馈提示时必读。
>
> 基于 PrimeVue Toast，在 `AppPrimeVueGlobals.vue` 中挂载并暴露 `window.$toast` / `window.$message`，
> 供**非组件环境**（HTTP 拦截器、全局错误处理、工具函数等）使用。组件内轻量通知仍可使用 PrimeVue `useToast()`。

## 1. 概述

- **集成位置**：`AppPrimeVueGlobals.vue`（`src/layouts/components/AppPrimeVueGlobals.vue`），由 `App.vue` 引入。
- **组件内**：使用 PrimeVue `useToast()`，在 setup 中调用。
- **非组件环境**：使用 `window.$toast` / `window.$message`（仅在 App 挂载后可用）。

## 2. 使用方式

### 2.1 window.$message（居中纯提示）

**特性**：正中央展示、无关闭按钮、纯提示（life 后自动消失）。

```ts
// 任意位置（拦截器、errorHandler、工具函数等）
window.$message?.success('操作成功')
window.$message?.danger('发生错误', '错误标题')
window.$message?.info('提示信息')
window.$message?.warn('请注意')
```

| 方法                       | 说明          |
| -------------------------- | ------------- |
| `success(message, title?)` | 成功提示      |
| `danger(message, title?)`  | 错误/危险提示 |
| `info(message, title?)`    | 信息提示      |
| `warn(message, title?)`    | 警告提示      |

### 2.2 window.$toast（按位置 + severity）

```ts
window.$toast?.successIn('top-right', '成功', '操作已完成')
window.$toast?.dangerIn('top-left', '错误', '详情内容')
window.$toast?.infoIn('top-center', '信息', '详情')
window.$toast?.warnIn('bottom-right', '警告', '详情')
window.$toast?.secondaryIn('bottom-center', '次要', '详情')
window.$toast?.contrastIn('top-center', '高对比', '详情')

// 原始 API
window.$toast?.add({
  severity: 'info',
  summary: '标题',
  detail: '详情',
  life: 3000,
  group: 'tl', // 可选，对应位置
})

// 清除
window.$toast?.clear() // 清除所有
window.$toast?.removeGroup?.('tl') // 清除指定位置
```

| 方法                                                                          | 说明                                                       |
| ----------------------------------------------------------------------------- | ---------------------------------------------------------- |
| `dangerIn` / `successIn` / `infoIn` / `warnIn` / `secondaryIn` / `contrastIn` | 在指定位置显示对应 severity                                |
| `add(options)`                                                                | 原始 PrimeVue add，可传 severity/summary/detail/life/group |
| `clear()`                                                                     | 清除所有 Toast（内部 removeAllGroups）                     |
| `removeGroup(group)`                                                          | 清除指定 group                                             |

## 3. 位置与 group

| 位置 (ToastPosition) | group  | 说明                       |
| -------------------- | ------ | -------------------------- |
| top-left             | tl     | 左上                       |
| top-center           | tc     | 上中                       |
| top-right            | tr     | 右上                       |
| bottom-left          | bl     | 左下                       |
| bottom-center        | bc     | 下中                       |
| bottom-right         | br     | 右下                       |
| center               | center | 正中央（供 $message 使用） |

`$message` 使用 `group="center"`、`closable: false`，在正中央展示纯提示。

## 4. 类型

- **定义**：`src/types/modules/utils.d.ts`
- **类型**：`ToastApi`、`MessageApi`、`ToastPosition`
- **Window**：`window.$toast?: ToastApi`、`window.$message?: MessageApi`

## 5. 注意事项

- **时机**：仅 App 挂载后可用；在拦截器、errorHandler 等处调用时需使用可选链（如 `window.$message?.danger(...)`），避免未挂载时报错。
- **禁止**：在业务中自建全局 Toast/Message 或通过 DOM 自造通知；非组件环境必须使用 `window.$toast` / `window.$message`，详见本文档。

## 6. 样式覆盖说明

本项目在 `AppPrimeVueGlobals.vue` 中对 PrimeVue Toast 做了以下样式覆盖，以符合设计规范。样式定义在该组件的 `<style>` 块中。

### 6.1 Message 居中 Toast（.p-toast-center）

- **目的**：`$message` 在视口正中央展示
- **实现**：`top: 50%`、`left: 50%`、`transform: translate(-50%, -50%)`
- **说明**：PrimeVue 默认 `position="center"` 仅设 `top/left 50%`，无 `transform`，导致左上角在中心而非整体居中，需在此补充

### 6.2 Toast 关闭按钮贴右上角

- **作用范围**：`.p-toast:not(.p-toast-center)`（排除无关闭按钮的 center Toast）
- **消息根**：`.p-toast-message` 设 `position: relative` 作为定位参考
- **关闭按钮**：`.p-toast-close-button` 设 `position: absolute; top: 0; right: 0`
- **内容区**：`.p-toast-message-content` 设 `padding-right` 为关闭按钮预留空间

### 6.3 Toast 内边距

- **位置**：`src/utils/theme/primevue-preset.ts` 中 `components.toast.content.padding`
- **值**：`var(--spacing-sm) var(--spacing-xs) var(--spacing-sm) var(--spacing-sm)`
- **说明**：替代 `overlay.popover.padding`，使用语义 spacing 变量，更紧凑

## 7. Toast/Message 默认 life 建议（工业场景）

| severity       | 建议 life (ms) | 说明                                               |
| -------------- | -------------- | -------------------------------------------------- |
| success        | 3000           | 与 `AppPrimeVueGlobals.vue` 当前 DEFAULT_LIFE 一致 |
| info           | 3000           | 同上                                               |
| warn           | 5000           | 便于阅读                                           |
| error / danger | 8000           | 便于阅读与排查                                     |

通过 `add({ life: N })` 或 `window.$toast?.add({ ..., life: 8000 })` 覆盖默认值。
