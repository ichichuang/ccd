---
description: 构建页面视图：Layout -> Components -> Logic Integration
globs: src/views/**/*.vue
---

# 构建页面视图技能

## 1. 目标

使用现有组件和逻辑 Hook 组装完整页面视图。

## 2. 步骤

### 步骤 1：布局选择

- 确定所需布局（默认 `LayoutAdmin`）。
- 如需要，在 `route.meta` 中配置。

### 步骤 2：逻辑集成

- 导入业务逻辑 Hook：`import { useFeature } from '@/hooks/modules/useFeature'`
- 解构状态：`const { loading, data } = useFeature()`
- **类型安全检查**：确保所有本地变量都有显式类型注解：
  - ❌ `const localData = ref(null)`
  - ✅ `const localData = ref<FeatureData | null>(null)`
  - ❌ `const computedValue = computed(() => data.value?.name)`
  - ✅ `const computedValue = computed<string | undefined>(() => data.value?.name)`
  - ❌ `const items = []`
  - ✅ `const items: Item[] = []`

### 步骤 3：模板组装

- 如需要，使用 `AdminBreadcrumb`。
- 使用 `PageContainer` 或类似的包装器。
- 将状态绑定到组件。

### 步骤 4：验证

1. 在 `browser` 中打开页面。
2. 检查网络请求（通过控制台日志或 Hook 状态）。
3. 验证空状态和加载状态。
