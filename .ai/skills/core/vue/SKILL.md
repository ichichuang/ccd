---
name: vue
description: Vue 3 Composition API, script setup macros, reactivity system, and built-in components. Use when writing Vue SFCs, defineProps/defineEmits/defineModel, watchers, or using Transition/Teleport/Suspense/KeepAlive.
metadata:
  author: Anthony Fu
  version: '2026.1.31'
  source: Generated from https://github.com/vuejs/docs, scripts at https://github.com/antfu/skills
---

# Vue

> Based on Vue 3.5. Always use Composition API with `<script setup lang="ts">`.

## CCD Project Overlay

- CCD auto-import rules override generic Vue examples. In auto-import-aware Vue/TS/TSX surfaces, use auto-imported Vue APIs as globals and keep Vue imports type-only unless `.ai/rules/core/07-vue-auto-imports.mdc` marks the path as outside the contract.
- Do not import or call the Vue `h` helper. Use SFC templates or TSX return/render output for component rendering; test harnesses should keep one reusable component per file and must not use the Vue `h` helper to avoid lint warnings.
- If a `.ts` test surface is not JSX-enabled, do not claim TSX compliance from that file. Convert to `.tsx` only when the existing test/build tooling already covers it; otherwise stop with a tooling-scope blocker or request an explicit scoped tooling change.

## Preferences

- Prefer TypeScript over JavaScript
- Prefer `<script setup lang="ts">` over `<script>`
- For performance, prefer `shallowRef` over `ref` if deep reactivity is not needed
- Always use Composition API over Options API
- Discourage using Reactive Props Destructure

## Core

| Topic                  | Description                                                                                                 | Reference                                                |
| ---------------------- | ----------------------------------------------------------------------------------------------------------- | -------------------------------------------------------- |
| Script Setup & Macros  | `<script setup>`, defineProps, defineEmits, defineModel, defineExpose, defineOptions, defineSlots, generics | [script-setup-macros](references/script-setup-macros.md) |
| Reactivity & Lifecycle | ref, shallowRef, computed, watch, watchEffect, effectScope, lifecycle hooks, composables                    | [core-new-apis](references/core-new-apis.md)             |

## Features

| Topic                            | Description                                                          | Reference                                            |
| -------------------------------- | -------------------------------------------------------------------- | ---------------------------------------------------- |
| Built-in Components & Directives | Transition, Teleport, Suspense, KeepAlive, v-memo, custom directives | [advanced-patterns](references/advanced-patterns.md) |

## Quick Reference

### Component Template

```vue
<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'

const props = defineProps<{
  title: string
  count?: number
}>()

const emit = defineEmits<{
  update: [value: string]
}>()

const model = defineModel<string>()

const doubled = computed(() => (props.count ?? 0) * 2)

watch(
  () => props.title,
  newVal => {
    console.log('Title changed:', newVal)
  }
)

onMounted(() => {
  console.log('Component mounted')
})
</script>

<template>
  <div>{{ title }} - {{ doubled }}</div>
</template>
```

### Key Imports

The following generic Vue imports are documentation reference only. In CCD auto-import-aware surfaces, follow the CCD overlay above and do not copy these as value imports.

```ts
// Reactivity
import { ref, shallowRef, computed, reactive, readonly, toRef, toRefs, toValue } from 'vue'

// Watchers
import { watch, watchEffect, watchPostEffect, onWatcherCleanup } from 'vue'

// Lifecycle
import {
  onMounted,
  onUpdated,
  onUnmounted,
  onBeforeMount,
  onBeforeUpdate,
  onBeforeUnmount,
} from 'vue'

// Utilities
import { nextTick, defineComponent, defineAsyncComponent } from 'vue'
```
