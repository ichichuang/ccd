# Date Utils Blueprint

Safe, locale-aware date handling in Vue 3 components.

## Why `new Date()` Is Banned

`DateUtils` / `useDateUtils()` implicitly handles concerns the native `Date` object ignores:

- **Timezone normalization** — converts server UTC to the user's local timezone
- **Locale-aware formatting** — renders `2026-03-22` as `2026年3月22日` or `March 22, 2026` depending on `vue-i18n` locale
- **Holiday awareness** — downstream calendar and scheduling integrations hook into this layer
- **DST transitions** — Day.js timezone plugin is loaded and configured centrally at app boot

One raw `new Date(isoString)` call silently produces wrong output for users outside the server's timezone. There is no linter error — just broken data.

## In Vue Components — `useDateUtils()`

```vue
<script setup lang="ts">
import { useDateUtils } from '@/hooks/modules/useDateUtils'

const props = defineProps<{
  date: string        // ISO 8601 string from API
  updatedAt?: string
}>()

const { formatDate, formatDateTime, formatRelative, isInitialized } = useDateUtils()

// CRITICAL: Always gate behind isInitialized.
// The composable loads timezone + locale data asynchronously at boot.
// Before isInitialized === true, all format functions return ''.
const displayDate = computed<string>(() =>
  isInitialized.value ? formatDate(props.date) : '—'
)

const displayDateTime = computed<string>(() =>
  isInitialized.value ? formatDateTime(props.date) : '—'
)

const relativeTime = computed<string>(() =>
  isInitialized.value && props.updatedAt
    ? formatRelative(props.updatedAt)
    : '—'
)
</script>

<template>
  <div class="col-fill gap-xs">
    <!-- Safe: computed already guards initialization -->
    <span class="text-sm text-foreground">{{ displayDate }}</span>
    <span class="text-xs text-muted-foreground">{{ displayDateTime }}</span>
    <span class="text-xs text-muted-foreground">{{ relativeTime }}</span>
  </div>
</template>
```

## In Standalone TypeScript — `DateUtils` (static)

For non-component contexts (stores, utils, API transformers) where composables cannot be called:

```typescript
import { DateUtils } from '@/utils/date/DateUtils'

// Format an ISO string
const label = DateUtils.format(isoString, 'YYYY-MM-DD')

// Relative time ("3 hours ago")
const ago = DateUtils.fromNow(isoString)

// Compare two dates
const isExpired = DateUtils.isBefore(isoString, DateUtils.now())

// Get current timestamp (replaces Date.now())
const ts = DateUtils.now()  // returns Day.js instance, not number
const tsMs = DateUtils.nowMs() // returns number (milliseconds)
```

## Available Format Tokens

| Method | Output Example | Use Case |
|---|---|---|
| `formatDate(iso)` | `2026-03-22` | Table cells, labels |
| `formatDateTime(iso)` | `2026-03-22 14:30` | Audit logs, timestamps |
| `formatRelative(iso)` | `3 hours ago` | Feed items, notifications |
| `formatShort(iso)` | `Mar 22` | Compact calendar displays |
| `formatFull(iso)` | `Sunday, March 22, 2026` | Detail pages, headings |

## The Initialization Guard Pattern

```typescript
// Pattern A — computed (preferred for reactive display)
const display = computed<string>(() =>
  isInitialized.value ? formatDate(props.date) : '—'
)

// Pattern B — watchEffect (for imperative side-effects)
watchEffect(() => {
  if (!isInitialized.value) return
  chart.setOption({ xAxis: { data: dates.map(formatDate) } })
})

// Pattern C — async wait (for one-shot logic outside components)
await until(isInitialized).toBe(true)
const formatted = formatDate(isoString)
```

## Anti-Patterns

```typescript
// FORBIDDEN
const d = new Date(props.date)
const label = `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`

// FORBIDDEN — no initialization guard
const display = computed(() => formatDate(props.date))

// FORBIDDEN — direct Day.js import in component
import dayjs from 'dayjs'
const label = dayjs(props.date).format('YYYY-MM-DD')
```
