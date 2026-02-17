---
description: 构建 UI 组件：Scaffold -> Style -> Verify
globs: src/components/**/*.vue
---

# 构建 UI 组件技能

## 1. 目标

创建一个可复用的、符合项目架构的 Vue 3 组件。

## 2. 步骤

### 步骤 1：脚手架

创建文件 `src/components/<Name>/<Name>.vue`。

```vue
<script setup lang="ts">
interface Props {
  // 定义 props
}
const props = withDefaults(defineProps<Props>(), {
  // 默认值
})

// 所有变量必须有显式类型
const loading = ref<boolean>(false)
const data = ref<DataItem[]>([])
const computedValue = computed<string>(() => {
  // ...
})
</script>

<template>
  <div>
    <!-- 内容 -->
  </div>
</template>
```

### 步骤 2：样式（仅 UnoCSS）

- 使用语义类：`p-md`、`bg-card`、`text-primary`。
- **禁止**使用 `<style>` 标签，除非用于复杂动画。
- **禁止**硬编码 hex 颜色。
- **禁止在模板中使用 TypeScript 语法**：禁止在 `<template>` 中使用 `as`、类型注解 `:` 或泛型 `<>`。在 `<script setup>` 中定义类型，并在模板中直接使用类型化变量。
- **需要显式类型**：所有变量（包括 ref/computed/reactive）必须有显式类型注解：
  - ❌ `const loading = ref(false)` → ✅ `const loading = ref<boolean>(false)`
  - ❌ `const data = ref(null)` → ✅ `const data = ref<DataType | null>(null)`
  - ❌ `const result = computed(() => ...)` → ✅ `const result = computed<ResultType>(() => ...)`
  - ❌ `const items = []` → ✅ `const items: Item[] = []`

### 步骤 3：导出

创建 `src/components/<Name>/index.ts`：

```ts
import <Name> from './<Name>.vue'
export { <Name> }
export default <Name>
```

### 步骤 4：验证

- 使用 `browser` 工具。
- 检查控制台错误。
- 验证响应式（调整窗口大小）。

**自动导入**：`src/components/` 下的组件会自动导入；在 views/pages 中使用它们时无需手动 `import`。`src/layouts/` 中的布局组件**不会**自动导入，必须在使用时显式导入。
