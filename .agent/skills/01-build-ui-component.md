---
description: Build UI component: Scaffold -> Style -> Verify
globs: src/components/**/*.vue
---

# Build UI Component Skill

## 1. Goal

Create a reusable Vue 3 component that follows project architecture.

## 2. Steps

### Step 1: Scaffold

Create file `src/components/<Name>/<Name>.vue`.

```vue
<script setup lang="ts">
interface Props {
  // define props
}
const props = withDefaults(defineProps<Props>(), {
  // defaults
})

// All variables MUST have explicit type annotations
const loading = ref<boolean>(false)
const data = ref<DataItem[]>([])
const computedValue = computed<string>(() => {
  // ...
})
</script>

<template>
  <div>
    <!-- content -->
  </div>
</template>
```

### Step 2: Styling (UnoCSS only)

- Use semantic classes: `p-md`, `bg-card`, `text-primary`.
- **FORBIDDEN**: `<style>` tags except for complex animations.
- **FORBIDDEN**: Hardcoded hex colors.
- **FORBIDDEN TypeScript in templates**: No `as`, type annotations `:`, or generics `<>` in `<template>`. Define types in `<script setup>` and use typed variables in template.
- **Explicit types required**: All variables (including ref/computed/reactive) MUST have explicit type annotations:
  - ❌ `const loading = ref(false)` → ✅ `const loading = ref<boolean>(false)`
  - ❌ `const data = ref(null)` → ✅ `const data = ref<DataType | null>(null)`
  - ❌ `const result = computed(() => ...)` → ✅ `const result = computed<ResultType>(() => ...)`
  - ❌ `const items = []` → ✅ `const items: Item[] = []`

### Step 3: Export

Create `src/components/<Name>/index.ts`:

```ts
import <Name> from './<Name>.vue'
export { <Name> }
export default <Name>
```

### Step 4: Verify

- Use `browser` tool.
- Check console for errors.
- Verify reactivity (resize window).

**Auto-import**: Components under `src/components/` are auto-imported; no manual `import` needed when using in views/pages. Layout components in `src/layouts/` are NOT auto-imported and must be explicitly imported.
