## ProForm Integration Guide (V1.0)

> **Recommended pre-read (specs & types first):** start with `src/components/ProForm/README.md` and the engine SSOT/config/constants
> (`src/components/ProForm/engine/config.ts`, `src/components/ProForm/engine/constants.ts`).
> This guide is intentionally minimal: it provides a V1.0 boilerplate and non-negotiable best practices without relying on any example directory structure.

### Quick Start (Generics + SSOT)

This is the smallest "complete" V1.0 integration template: **E2E Generic Propagation**, **SSOT config**, and **standardized logger**.

```vue
<script setup lang="ts" generic="TValues extends Record<string, unknown>">
import type { FormSchema } from '@/components/ProForm'
import { useForm } from '@/components/ProForm'
import {
  PRO_FORM_DEFAULTS,
  PRO_FORM_LAYOUT_DEFAULTS,
  PRO_FORM_TEXT_DEFAULTS,
} from '@/components/ProForm/engine/config'
import { PRO_FORM_LOGGER as ProFormLogger } from '@/components/ProForm/engine/utils/logger'

const schema = reactive<FormSchema>({
  fields: [
    // ... fields
    // IMPORTANT: if you need a fallback span, use SSOT instead of hardcoding 12/6/4
    // { name: 'name', component: 'input', span: PRO_FORM_LAYOUT_DEFAULTS.gridSpan, ... }
  ],
})

const { handleSubmit } = useForm<TValues>({
  schema,
  // initialValues / validateOn / persistKey are business-specific
})

const onSubmit = handleSubmit(async (values: TValues) => {
  try {
    // ... call API
  } catch (err: unknown) {
    ProFormLogger.error('submit failed', err)
  }
})

const fallbackKeys = computed(() => ({
  tabPrefixKey: PRO_FORM_TEXT_DEFAULTS.tabPrefixKey,
  stepPrefixKey: PRO_FORM_TEXT_DEFAULTS.stepPrefixKey,
  booleanTrueKey: PRO_FORM_TEXT_DEFAULTS.booleanTrueKey,
  booleanFalseKey: PRO_FORM_TEXT_DEFAULTS.booleanFalseKey,
}))
</script>

<template>
  <ProForm
    :schema="schema"
    :layout="PRO_FORM_DEFAULTS.layout"
    @submit="onSubmit"
  />
</template>
```

### Best Practices (Non-negotiable)

### Best Practices (Non-negotiable)

- **SSOT**: all defaults/text/i18n keys/debounce timings/spans must come from `src/components/ProForm/engine/config.ts`.
- **Generics**: wrapper components must use `<script setup ... generic="TValues ...">`, and explicitly call `useForm<TValues>` / `useFormContext<TValues>()`.
- **InjectionKey**: use only InjectionKeys exported from `src/components/ProForm/engine/constants.ts`; string keys are forbidden.
- **Logging**: do not call `console.error` directly; always use `import { PRO_FORM_LOGGER as ProFormLogger } from '@/components/ProForm/engine/utils/logger'`.
