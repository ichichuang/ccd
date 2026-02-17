# Vue 模板反模式与正确写法 (SSOT)

> **目标读者：AI**。本文档列出 Vue 模板中常见的错误模式及正确写法，供 AI 在生成/修复代码时参照。出现 `Error parsing JavaScript expression`、构建失败或 TypeScript 类型错误时，优先查阅本文档。

---

## 1. 多语句内联事件处理器（FORBIDDEN）

### 问题

Vue 模板中的 `@click`、`@input` 等事件绑定**只能接受单条 JavaScript 表达式**。多行、多语句写法会导致编译错误：

```
Error parsing JavaScript expression: Unexpected token, expected "," (3:14)
```

### 错误写法

```vue
<!-- ❌ FORBIDDEN -->
<Button
  @click="
    sizeScale = key
    updateSize()
  "
/>

<input
  @input="
    colorInput = $event.target.value
    updateColor()
  "
/>
```

### 正确写法

在 `<script setup>` 中定义方法，模板中仅调用：

```vue
<script setup lang="ts">
function handleSizeScaleClick(key: IconSize): void {
  sizeScale.value = key
  updateSize()
}

function handleColorInputChange(): void {
  updateColor()
}
</script>

<template>
  <Button @click="handleSizeScaleClick(key)" />
  <input @input="handleColorInputChange" />
</template>
```

---

## 2. 模板中的 TypeScript 语法（FORBIDDEN）

### 问题

Vue 模板编译器**不支持 TypeScript 语法**。使用 `as`、`:`、`<>` 等会导致解析失败或构建错误。

### 错误写法

```vue
<!-- ❌ FORBIDDEN -->
<input @input="colorInput = ($event.target as HTMLInputElement).value" />
<div :prop="value as MyType" />
<div :items="list as Item[]" />
```

### 正确写法

将类型断言和类型逻辑全部放在 `<script setup>` 中：

```vue
<script setup lang="ts">
function handleColorInputChange(event: Event): void {
  const target = event.target as HTMLInputElement
  colorInput.value = target.value
  updateColor()
}
</script>

<template>
  <input @input="handleColorInputChange" />
</template>
```

---

## 3. readonly 数组 includes 与类型收窄

### 问题

当使用 `as const` 定义的数组时，`Array.prototype.includes` 的参数类型为字面量联合类型。传入普通 `string` 会报错：

```
类型"string"的参数不能赋给类型""xs" | "sm" | "md" | ..."的参数
```

### 错误写法

```ts
const SIZE_SCALE_KEYS = ['xs', 'sm', 'md', 'lg', 'xl', '2xl', '3xl', '4xl', '5xl'] as const
type SizeScaleKey = (typeof SIZE_SCALE_KEYS)[number]

// ❌ FORBIDDEN - 类型不兼容
if (SIZE_SCALE_KEYS.includes(val as IconSize)) {
  sizeScale.value = val // val 仍为 string，赋值可能报错
}
```

### 正确写法

放宽 `includes` 的入参类型，并在赋值时显式断言：

```ts
if (typeof val === 'string' && (SIZE_SCALE_KEYS as readonly string[]).includes(val)) {
  if (sizeScale.value !== val) sizeScale.value = val as SizeScaleKey
}
```

---

## 4. 引用

- Vue 模板约束详见 `docs/TYPESCRIPT_AND_LINTING.md` §6.5
- TypeScript 类型注解详见 `docs/TYPESCRIPT_AND_LINTING.md` §6
- 项目协议中的模板约束：`docs/PROJECT_PROTOCOL.md` §5.1
- `.agent/rules/20-code-standards.md` §4a
- `.cursor/rules/00-core-architecture.mdc` 中的 NO TypeScript Syntax in Templates
