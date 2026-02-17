---
description: 逻辑层规范：API -> Hook -> UI 分层架构
globs: **/*.vue, **/*.ts, **/*.tsx
alwaysApply: true
---

# 逻辑层规范

## 1. 三层架构

对于任何数据驱动的功能，必须严格遵循此流程：

1.  **第 1 层：API 定义**（`src/api/<module>/<feature>.ts`）
    - 定义类型（DTO）。
    - 使用 `alovaInstance` 定义方法构建器。
    - **不要**在这里放置 Hook 逻辑，只是纯 API 定义。

2.  **第 2 层：业务 Hook**（`src/hooks/modules/use<Feature>.ts`）
    - 导入 API 方法。
    - 使用 `useHttpRequest` 管理状态（`loading`、`data`、`error`）。
    - 向 UI 导出响应式状态和方法。

3.  **第 3 层：UI 消费者**（`src/views/...` 或 `src/components/...`）
    - 导入 Hook：`const { list, loading, refresh } = useFeature()`
    - 绑定到模板：`:loading="loading"`、`v-for="item in list"`。
    - UI 中**零** API 调用。UI 中**零**复杂数据处理。

## 2. 逻辑放置映射

| 逻辑类型              | 正确位置                                   |
| :-------------------- | :----------------------------------------- |
| HTTP 请求             | `src/api/`                                 |
| 业务状态              | `src/hooks/modules/`                       |
| 全局状态（用户/主题） | `src/stores/modules/`                      |
| UI 状态（切换、表单） | `src/components/`（本地 `ref`/`reactive`） |
| 数据格式化            | `src/utils/` 或 `useDateUtils`             |
| 元素调整大小          | `useAppElementSize`                        |

## 3. 明确禁止

- ❌ **禁止**在组件中使用 `axios.get()` 或 `fetch()`。
- ❌ **禁止**在 `.vue` 文件中定义接口/类型（移至 `src/types/` 或 `src/api/`）。
- ❌ **禁止**直接使用 `localStorage`（使用 `safeStorage` 或 `Pinia persist`）。
