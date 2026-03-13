# Loading 系统架构

> **目标读者：AI**。本文档供 AI 在代码生成时参照，涉及全局/页面/组件级加载状态时必读。
>
> 本系统采用**三层加载架构**：Global（应用初始化/鉴权）、Page（路由切换）、Component（按钮/表格内部）。

## 1. 三层加载架构

| 层级          | 触发场景                         | 状态来源                                         | UI 渲染                                     | 典型用法                                      |
| ------------- | -------------------------------- | ------------------------------------------------ | ------------------------------------------- | --------------------------------------------- |
| **Global**    | 应用启动、动态路由加载、鉴权     | `layoutStore.loadingCount` / `isLoading`         | 全屏遮罩（`layouts/index.vue`）             | `useLoading().loadingStart/Done`              |
| **Page**      | 路由切换                         | `layoutStore.pageLoadingCount` / `isPageLoading` | 内容区遮罩（`AppContainer`、`LayoutRatio`） | `useLoading().pageLoadingStart/Done`          |
| **Component** | 按钮提交、表格拉数、表单异步选项 | 本地 `ref` 或 `useHttpRequest().loading`         | 按钮 loading、表格骨架、字段内 Spinner      | `loading` ref、`useHttpRequest`、`loadingMap` |

## 2. Global Loading（全局加载）

### 2.1 状态与触发

- **Store**：`src/stores/modules/layout.ts`
  - `loadingCount`：并发安全计数器，`> 0` 时显示
  - `isLoading`：由 `loadingCount` 推导
  - `beginGlobalLoading()` / `endGlobalLoading()`：计数 ±1

- **触发点**：
  - 应用启动：`setupPlugins` 的 `finally` 中调用 `loadingDone()` 结束初始 loading
  - 路由守卫：动态路由加载时 `loadingStart()`，完成后 `loadingDone()`

### 2.2 UI 渲染

- **位置**：`src/layouts/index.vue`
- **组件**：`AnimateWrapper` + `Loading-Wave`（Lottie 版 `BaseLottieLoader`）
- **样式**：全屏、`glass-surface`、`z-[999]`

### 2.3 使用方式

```ts
const { loadingStart, loadingDone, withLoading } = useLoading()

// 手动配对
loadingStart()
try {
  await initApp()
} finally {
  loadingDone()
}

// 自动配对（推荐）
await withLoading(async () => {
  await initApp()
})
```

## 3. Page Loading（页面级加载）

### 3.1 状态与触发

- **Store**：`layoutStore.pageLoadingCount` / `isPageLoading`
- **触发点**：`src/router/utils/permission.ts`
  - `beforeEach`：`pageLoadingStart()`
  - `afterEach`：`pageLoadingDone()`（含 `safeClearPageLoading` 兜底）

### 3.2 UI 渲染

- **位置**：`AppContainer.vue`、`LayoutRatio.vue`
- **组件**：`Transition name="fade"` + `BaseLottieLoader`（72×72）
- **样式**：`absolute inset-0`、`backdrop-blur-sm`、`bg-background/60`

### 3.3 使用方式

```ts
const { pageLoadingStart, pageLoadingDone, withPageLoading } = useLoading()

// 手动配对
pageLoadingStart()
try {
  await loadPageData()
} finally {
  pageLoadingDone()
}

// 自动配对
await withPageLoading(async () => {
  await loadPageData()
})
```

## 4. Component Loading（组件级加载）

### 4.1 useHttpRequest

- **位置**：`src/hooks/modules/useHttpRequest.ts`
- **返回**：`loading` ref（Alova 原生，不自动 sync 全局 store）
- **可选联动**：`globalLoading: true` 时与全局 loading 联动

```ts
// 仅组件级 loading（默认）
const { loading, data, send } = useHttpRequest(client => client.Get<UserDTO>('/user/me'))

// 与全局 loading 联动
const { loading, data, send } = useHttpRequest(client => client.Get<UserDTO>('/user/me'), {
  globalLoading: true,
})
```

（已移除旧表格/表单组件的 loading 说明）

## 5. 数据流总览

```
┌─────────────────────────────────────────────────────────────────────────┐
│ Request / Action                                                        │
└─────────────────────────────────────────────────────────────────────────┘
         │
         ├── setupPlugins / 动态路由 ──► loadingStart/Done ──► isLoading
         │
         ├── 路由 beforeEach/afterEach ──► pageLoadingStart/Done ──► isPageLoading
         │
         └── useHttpRequest(..., { globalLoading: true }) ──► loadingStart/Done ──► isLoading
              useHttpRequest(..., { globalLoading: false }) ──► 仅 base.loading（组件内）
```

## 6. 相关文件

| 文件                                      | 职责                                                                                       |
| ----------------------------------------- | ------------------------------------------------------------------------------------------ |
| `src/stores/modules/layout.ts`            | loadingCount、pageLoadingCount、begin/end 方法                                             |
| `src/hooks/layout/useLoading.ts`          | loadingStart、loadingDone、pageLoadingStart、pageLoadingDone、withLoading、withPageLoading |
| `src/hooks/layout/useNprogress.ts`        | NProgress 顶部进度条（路由切换）                                                           |
| `src/hooks/modules/useHttpRequest.ts`     | HTTP 请求封装，支持 `globalLoading`                                                        |
| `src/layouts/index.vue`                   | 全局 loading 遮罩                                                                          |
| `src/layouts/components/AppContainer.vue` | 内容区 page loading 遮罩                                                                   |
| `src/layouts/components/Loading-Wave.vue` | 全局 Lottie 加载动画                                                                       |
| `src/components/BaseLottieLoader/`        | 统一 Lottie 加载组件                                                                       |
