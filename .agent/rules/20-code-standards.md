---
description: 代码规范：命名、目录结构与最佳实践
globs: **/*.ts, **/*.vue, **/*.tsx
alwaysApply: true
---

# 代码规范

## 1. 命名约定

- **组件**：`PascalCase`（例如，`UserCard.vue`、`UserProfile.tsx`）。
- **Composables**：`camelCase`，以 `use` 开头（例如，`useUserSession.ts`）。
- **API 文件**：`camelCase`（例如，`user.ts`、`orderService.ts`）。
- **常量**：`UPPER_SNAKE_CASE`（例如，`DEFAULT_PAGE_SIZE`）。
- **类型/接口**：`PascalCase`（例如，`UserDTO`、`ButtonProps`）。

## 2. 目录结构

### UI 组件

- **单文件**：`src/components/UserCard.vue`
- **复杂组件**：
  ```
  src/components/UserCard/
  ├── index.ts        # export * from './UserCard.vue'
  ├── UserCard.vue    # 主组件
  ├── components/     # 子组件
  │   └── UserAvatar.vue
  └── utils/          # 本地辅助函数
  ```

### 视图

- `src/views/<Module>/<Page>.vue`
- 尽可能在模块内保持扁平结构。

## 3. 导入与未使用代码

- **Vue**：不要手动从 `'vue'` 导入 `ref`、`computed`、`watch`（自动导入）；仅在导出接口时使用 `import type { Ref, ComputedRef } from 'vue'`。参见 `docs/BUILD_SYSTEM.md`。
- **未使用**：删除未使用的导入；对于有意未使用的变量/解构，使用 **`_`** 前缀（例如 `_apiData`、`selectionComputed: _selectionComputed`）。

## 4. TypeScript 最佳实践

- **禁止 `any`**：使用 `unknown` 或特定类型。
- **严格空值检查**：始终处理 `null`/`undefined`。
- **显式类型注解要求（强制）**：所有变量声明必须有显式类型注解。禁止对变量声明使用类型推断。
  - **常规变量**：
    - ❌ `const value = someFunction()`（依赖推断）
    - ✅ `const value: ReturnType = someFunction()`
    - ❌ `const items = []`（推断为 `never[]`）
    - ✅ `const items: Item[] = []`
  - **响应式变量（ref/computed/reactive）**：
    - ❌ `const loading = ref(false)`（推断为 `Ref<boolean>`）
    - ✅ `const loading = ref<boolean>(false)`
    - ❌ `const data = ref(null)`（推断为 `Ref<null>`）
    - ✅ `const data = ref<UserDTO | null>(null)`
    - ❌ `const result = computed(() => value.value)`（推断）
    - ✅ `const result = computed<ProcessedResult>(() => processValue(value.value))`
    - ❌ `const state = reactive({ count: 0 })`（推断）
    - ✅ `const state = reactive<{ count: number }>({ count: 0 })`
- **函数签名**：所有函数参数和返回类型必须有显式类型。
  - ❌ `function process(data) { ... }`
  - ✅ `function process(data: ProcessData): ProcessResult { ... }`
  - ❌ `const handler = (e) => { ... }`
  - ✅ `const handler = (e: Event) => { ... }`
- **复杂类型**：将复杂类型提取到 `src/types/` 或同位置的 `interface` 或 `type` 定义。
  - 对于可能被扩展的对象形状，优先使用 `interface`。
  - 对于联合、交集或计算类型，优先使用 `type`。
- **Props 定义**：
  ```ts
  // 推荐
  interface Props {
    title: string
    count?: number
  }
  const props = withDefaults(defineProps<Props>(), {
    count: 0,
  })
  ```

## 4a. Vue 模板语法约束（针对 AI Agents）

- **禁止**：在 Vue `<template>` 部分使用 TypeScript 语法。
  - ❌ `<div :prop="value as any">`
  - ❌ `<div :prop="value as MyType">`
  - ❌ `<div :prop="value: MyType">`
  - ❌ 在模板绑定中使用任何 TypeScript 类型断言（`as`）、类型注解（`:`）或泛型（`<>`）。
- **禁止多语句内联事件处理器**：`@click`、`@input` 等只能接受单条表达式；多行/多语句会触发 `Error parsing JavaScript expression`。必须将逻辑抽取到 `<script setup>` 中的方法，模板内仅调用方法。
  - ❌ `@click="a = 1; b = 2"` 或 `@input="x = $event.target.value; update()"`
  - ✅ `@click="handleClick"`，在 script 中定义 `function handleClick() { ... }`
- **正确方法**：在 `<script setup>` 中定义类型和方法，并在模板中直接使用类型化变量或方法调用。
  - ✅ 在 `<script setup>` 中：`const typedValue: MyType = value as MyType` 或 `function handleColorInputChange(event: Event) { ... }`
  - ✅ 在 `<template>` 中：`<div :prop="typedValue">` 或 `@input="handleColorInputChange"`
- **理由**：Vue 模板不支持 TypeScript；多语句会导致解析错误。类型定义与复杂逻辑必须在 `<script setup>` 中完成。
- **参考**：`docs/VUE_TEMPLATE_ANTIPATTERNS.md` 为 SSOT，列出完整反模式与正确写法。

## 5. 导出模式

- **仅命名导出**：用于 Utils、Hooks、API。
  - ✅ `export const useUser = ...`
  - ❌ `export default function ...`
- **允许默认导出**：仅用于 Vue 组件（`.vue`）。

## 6. 注释

- **JSDoc**：对所有导出的函数/类型使用 JSDoc。
- **分隔符**：使用 `// === Section ===` 分隔长文件。

## 7. 颜色类指南（针对 AI Agents）

- 生成 `bg-*` / `text-*` / `border-*` 类时，**仅使用设计系统中存在的标记**（`uno.config.ts` + 主题元数据）。边框须使用快捷类（`component-border` / `border-b-default` / `border-t-default`），禁止仅写 `border border-border`（缺 border-style 不显示）。
- **允许的背景语义（示例）**：
  - 页面/容器：`bg-background`
  - 卡片/面板：`bg-card`
  - 微妙块/代码背景：`bg-muted`
  - 状态颜色：`bg-primary` / `bg-accent` / `bg-danger` / `bg-warn` / `bg-success` / `bg-info`（以及 `-hover`/`-light`）
  - 侧栏：`bg-sidebar` 系列
  - PrimeVue 主题兼容性：`bg-surface-ground` 是**唯一**可以使用的 `surface-*` 类。
- **Agent 禁止**：
  - 发明 Tailwind/PrimeVue 风格的类：`bg-surface-100/200/...`、`bg-surface-ground/50`、`bg-surface-hover`、`dark:bg-surface-700` 等。
  - 使用任何未由 `uno.config.ts` 或文档化设计标记支持的 `bg-*` 类。
- 如果在生成的代码中需要新的背景语义：
  - 优先将其映射到上述现有标记之一。
  - 如果不够，请要求人类扩展主题系统，而不是在模板中创建新的 `bg-*` 字符串。

## 8. 宽度与最大宽度指南（针对 AI Agents）

- 生成与宽度相关的类时，**不要使用 Uno/Tailwind 预设尺寸，如 `max-w-2xl` ~ `max-w-7xl`**：
  - 这些映射到固定的 `rem` 值，与我们的视口/基于百分比的布局策略冲突。
  - 将所有 `max-w-?xl` 工具类视为业务代码中的禁止项。

- 内容容器的首选模式：
  - 全宽居中内容：`w-full max-w-[80vw] mx-auto`
  - 文档/配置页面：`w-full max-w-[90vw] mx-auto`
  - 窄文本块或示例：`w-full max-w-[60vw] mx-auto`

- 如果需要可复用的语义宽度：
  - 优先使用通过 `LAYOUT_DIMENSION_KEYS` 定义的现有布局变量（`w-sidebarWidth` 等）。
  - 如有必要，请要求人类扩展 `LAYOUT_DIMENSION_KEYS` + `uno.config.ts`，而不是发明新的 `max-w-*` 字符串。

- Agent 摘要：
  - ✅ 使用 `%`、`vw`、`vh` 或通过 `uno.config.ts` 中定义的 `w-*` / `max-w-*` 布局变量。
  - ❌ 不要在生成的代码中使用 Tailwind 风格的 `max-w-2xl` / `max-w-3xl` / `max-w-4xl` / `max-w-5xl` / `max-w-6xl` / `max-w-7xl`。
