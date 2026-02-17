---
description: 重构组件：Extract Logic -> Hooks & Style Audit
globs: **/*.vue, **/*.ts
---

# 重构组件技能

## 1. 目标

通过提取逻辑和标准化样式来清理组件。

## 2. 步骤

### 步骤 1：逻辑提取

- 识别 `<script setup>` 中的复杂逻辑。
- 在 `src/hooks/modules/use<Feature>.ts` 中创建新的 Hook。
- 将特定逻辑（状态、方法、computed）移至 Hook。
- 在组件中导入并使用 Hook。
- **类型安全**：确保所有提取的变量都有显式类型注解：
  - ❌ `const loading = ref(false)` → ✅ `const loading = ref<boolean>(false)`
  - ❌ `const data = ref(null)` → ✅ `const data = ref<DataType | null>(null)`
  - ❌ `const items = []` → ✅ `const items: Item[] = []`

### 步骤 2：工具替换

- 扫描内联 `axios`/`fetch` 调用 → 替换为 `useHttpRequest`。
- 扫描内联日期格式化 → 替换为 `useDateUtils`。
- 扫描内联元素调整大小 → 替换为 `useAppElementSize`。

### 步骤 3：验证

- 确保功能保持不变（回归测试）。
- 检查 `browser` 控制台错误。
