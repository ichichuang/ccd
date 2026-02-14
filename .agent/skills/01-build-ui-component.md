---
description: 构建 UI 组件：Scaffold -> Style -> Verify
globs: src/components/**/*.vue
---

# Build UI Component Skill

## 1. Goal

Create a reusable, styled Vue 3 component following project architecture.

## 2. Steps

### Step 1: Scaffold

Create the file `src/components/<Name>/<Name>.vue`.

```vue
<script setup lang="ts">
interface Props {
  // Define props
}
// defineProps, emit...
</script>

<template>
  <div>
    <!-- Content -->
  </div>
</template>
```

### Step 2: Style (UnoCSS Only)

- Use semantic classes: `p-md`, `bg-card`, `text-primary`.
- **NO** `<style>` tags unless for complex animations.
- **NO** hardcoded hex colors.

### Step 3: Export

Create `src/components/<Name>/index.ts`:

```ts
import <Name> from './<Name>.vue'
export { <Name> }
export default <Name>
```

### Step 4: Verify

- Use `browser` tool.
- Check for console errors.
- Verify responsiveness (resize window).

**Auto-import**: Components under `src/components/` are auto-imported; use them in views/pages without manual `import`. Layout components in `src/layouts/` are **not** auto-imported and must be explicitly imported where used.
