## ProTable Integration Guide (V1.0)

> **Recommended pre-read (specs & types first):** start with `src/components/ProTable/README.md` and the engine SSOT/config/types
> (`src/components/ProTable/engine/config.ts`, `src/components/ProTable/engine/types/props.ts`, `src/components/ProTable/engine/types/column.ts`).

> **Live examples:** if your project keeps example pages, check `src/views/pro-table/` (or your local feature module) for runnable usage.
> This guide stays minimal and does not assume a specific example directory exists.

### Quick Start (Generics + SSOT)

This is a minimal-but-correct ProTable wrapper pattern with E2E generics and SSOT defaults.

```vue
<script setup lang="ts" generic="TRow extends Record<string, unknown>">
import type { ProTableColumn } from '@/components/ProTable/engine/types/column'
import type { ProTableProps } from '@/components/ProTable/engine/types/props'
import { PAGINATION_DEFAULTS, PRO_TABLE_PROPS_DEFAULTS } from '@/components/ProTable/engine/config'

const columns = shallowRef<ProTableColumn<TRow>[]>([
  // ... columns
])

const rows = shallowRef<TRow[]>([])

const tableProps = computed<ProTableProps<TRow>>(() => ({
  columns: columns.value,
  data: rows.value,
  loading: PRO_TABLE_PROPS_DEFAULTS.loading,
  rowKey: PRO_TABLE_PROPS_DEFAULTS.rowKey,
  pagination: {
    pageSize: PAGINATION_DEFAULTS.pageSize,
    pageSizeOptions: [...PAGINATION_DEFAULTS.pageSizeOptions],
  },
  virtualScroll: PRO_TABLE_PROPS_DEFAULTS.virtualScroll,
}))
</script>

<template>
  <ProTable v-bind="tableProps" />
</template>
```

### Best Practices (Non-negotiable)

- **SSOT**: all defaults (page sizes, debounce timings, virtual row height/overscan, infinite-scroll thresholds, fallback strings) must come from `src/components/ProTable/engine/config.ts`.
- **Generics**: preserve your row type end-to-end: `ProTableColumn<TRow>[]` + `TRow[]`. Never use `any`.
- **Dual-engine**: `virtualScroll` switches the rendering paradigm. Do not mix PrimeVue DataTable-only patterns with the Virtual Grid path. Pagination UI is mutually exclusive with `virtualScroll`.
- **Clean view layer**: import canonical props/types from `engine/types/props.ts` instead of re-declaring large prop interfaces inline.
