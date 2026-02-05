# Toast & Message 全局 API

> 基于 PrimeVue Toast，在 `AppPrimeVueGlobals.vue` 中挂载并暴露 `window.$toast` / `window.$message`，  
> 供**非组件环境**（HTTP 拦截器、全局错误处理、工具函数等）使用。组件内轻量通知仍可使用 PrimeVue `useToast()`。

## 1. 概述

- **集成位置**：`AppPrimeVueGlobals.vue`（`src/layouts/components/AppPrimeVueGlobals.vue`），由 `App.vue` 引入。
- **组件内**：使用 PrimeVue `useToast()`，在 setup 中调用。
- **非组件环境**：使用 `window.$toast` / `window.$message`（仅在 App 挂载后可用）。

## 2. 使用方式

### 2.1 window.$message（Element Plus 风格）

```ts
// 任意位置（拦截器、errorHandler、工具函数等）
window.$message?.success('操作成功')
window.$message?.error('发生错误', '错误标题')
window.$message?.info('提示信息')
window.$message?.warning('请注意')
```

| 方法                       | 说明     |
| -------------------------- | -------- |
| `success(message, title?)` | 成功提示 |
| `error(message, title?)`   | 错误提示 |
| `info(message, title?)`    | 信息提示 |
| `warning(message, title?)` | 警告提示 |

### 2.2 window.$toast（按位置 + severity）

```ts
window.$toast?.successIn('top-right', '成功', '操作已完成')
window.$toast?.errorIn('top-left', '错误', '详情内容')
window.$toast?.infoIn('top-center', '信息', '详情')
window.$toast?.warnIn('bottom-right', '警告', '详情')

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

| 方法                                  | 说明                                                       |
| ------------------------------------- | ---------------------------------------------------------- |
| `errorIn(position, summary, detail?)` | 在指定位置显示错误                                         |
| `successIn` / `infoIn` / `warnIn`     | 同上                                                       |
| `add(options)`                        | 原始 PrimeVue add，可传 severity/summary/detail/life/group |
| `clear()`                             | 清除所有 Toast（内部 removeAllGroups）                     |
| `removeGroup(group)`                  | 清除指定 group                                             |

## 3. 位置与 group

| 位置 (ToastPosition) | group | 说明 |
| -------------------- | ----- | ---- |
| top-left             | tl    | 左上 |
| top-center           | tc    | 上中 |
| top-right            | tr    | 右上 |
| bottom-left          | bl    | 左下 |
| bottom-center        | bc    | 下中 |
| bottom-right         | br    | 右下 |

无 group 的 Toast 用于 `$message`，默认显示在右上（PrimeVue 默认）。

## 4. 类型

- **定义**：`src/types/modules/utils.d.ts`
- **类型**：`ToastApi`、`MessageApi`、`ToastPosition`
- **Window**：`window.$toast?: ToastApi`、`window.$message?: MessageApi`

## 5. 注意事项

- **时机**：仅 App 挂载后可用；在拦截器、errorHandler 等处调用时需使用可选链（如 `window.$message?.error(...)`），避免未挂载时报错。
- **禁止**：在业务中自建全局 Toast/Message 或通过 DOM 自造通知；非组件环境必须使用 `window.$toast` / `window.$message`，详见本文档。
