---
description: 全功能开发：API Definition -> Business Hook -> UI Integration
globs: **/*
---

# 全功能开发技能

## 1. 目标

从后端 API 定义到前端 UI 实现完整功能。

## 2. 步骤

### 步骤 1：API 定义（第 1 层）

- 创建 `src/api/<module>/<feature>.ts`。
- 定义 `Req` / `Res` / `DTO` 接口。
- 使用 `alovaInstance` 导出 `build<Feature>Method`。

### 步骤 2：业务逻辑 Hook（第 2 层）

- 创建 `src/hooks/modules/use<Feature>.ts`。
- 从步骤 1 导入 API。
- 使用 `useHttpRequest` 包装 API 调用。
- 导出响应式状态（`data`、`loading`、`error`）和方法（`fetch`、`submit`）。
- **类型安全**：所有变量必须有显式类型注解：
  - ❌ `const loading = ref(false)` → ✅ `const loading = ref<boolean>(false)`
  - ❌ `const data = ref(null)` → ✅ `const data = ref<FeatureData | null>(null)`
  - ❌ `const result = computed(() => ...)` → ✅ `const result = computed<ResultType>(() => ...)`

### 步骤 3：UI 实现（第 3 层）

- 创建 `src/views/<Module>/<Page>.vue`。
- 从步骤 2 导入 Hook。
- 将响应式状态绑定到模板。
- 使用 `UnoCSS` 进行样式设置。
- 使用 `src/components/` 中的组件，**无需**手动导入（自动导入）。`src/layouts/` 中的布局组件需要**显式**导入。

### 步骤 4：验证

1. 检查控制台中的 API 错误。
2. 在 `browser` 中检查网络标签。
3. 验证 UI 状态（加载、错误、成功）。
