# Empty State & UI Robustness (Industrial Pattern)

> **Target reader: AI**. This doc defines the Industrial Empty State Pattern and robustness rules for monitoring/dashboard UIs. Follow it when generating pages with tables, charts, or overview cards.

## 1. Core Principles

- **No visual void**: Never show a single line of tiny text or large dark blank areas on 1080p+ screens.
- **Disambiguate failures**: When there is no data, clearly distinguish: "user has not acted yet" vs "query returned empty" vs "connection lost". Never leave the user guessing if the system is frozen.
- **Emotional value**: For alert systems, empty data should convey "safe, healthy". For config systems, empty should guide "click, create".

## 2. Industrial Empty State Pattern

Use the `EmptyState` component (`src/components/EmptyState`) for all empty states. Structure:

| Element                   | Spec                                                                        |
| ------------------------- | --------------------------------------------------------------------------- |
| Background watermark icon | Lucide via `<Icons>`, size `fs-5xl`, `text-muted-foreground opacity-25`     |
| Primary title             | `fs-md font-semibold`, direct tone (e.g. "All clear", "No report selected") |
| Secondary description     | `fs-sm text-muted-foreground`, tell the user what to do next                |
| Action button (Mandatory) | `severity="secondary"` or outlined, MUST provide a clear CTA to break out   |

**Rule: The Call to Action (CTA)**
Every empty state MUST have a clear, primary CTA button to help the user break out of the dead end (e.g., "Create New Data Group"). Never leave the user stranded on a blank list.

**Example**:

```vue
<EmptyState
  icon="i-lucide-shield-check"
  :title="$t('emptyState.safeNoData')"
  :description="$t('emptyState.safeNoDataDesc')"
/>
```

### 2.1 Scenario → Icon Mapping (AI MUST follow)

Choose the EmptyState `icon` by scenario. Use Lucide icons via `<Icons>`; prefix with `i-lucide-`.

| Scenario                  | Recommended Icon                        | i18n key example              |
| ------------------------- | --------------------------------------- | ----------------------------- |
| Alert all clear / safe    | `i-lucide-shield-check`                 | `emptyState.safeNoData`       |
| No search result          | `i-lucide-search-x` or `i-lucide-inbox` | `emptyState.noSearchResult`   |
| No chart data             | `i-lucide-line-chart`                   | `emptyState.noChartData`      |
| No report/config selected | `i-lucide-file-question`                | `emptyState.noReportSelected` |
| Connection lost           | `i-lucide-wifi-off`                     | `emptyState.connectionLost`   |
| Generic fallback          | `i-lucide-inbox`                        | —                             |

**Rule**: Use semantic icons that match the scenario. Never use decorative icons (e.g. `i-lucide-home`) for empty states.

## 3. Double-Render Fix (Anti-pattern)

**Rule**: When data array is empty, use `v-if` to hide the data view (table or chart) and show `EmptyState` instead.

**Wrong**: An empty table header plus floating "No data" text.

**Correct**:

```vue
<template>
  <div v-if="loading"><Skeleton /></div>
  <div
    v-else-if="data.length"
    ...
  />
  <EmptyState
    v-else
    icon="..."
    :title="..."
    :description="..."
  />
</template>
```

Alternatively, use the table component's built-in empty slot (if available) with `EmptyState` content.

## 5. UseEcharts No-Data Handling

- UseEcharts has no built-in no-data overlay.
- **Recommended**: Wrap with `v-if`. When `series` is empty and not loading, hide the chart and show `<EmptyState>`.

```vue
<UseEcharts v-if="hasChartData" :option="chartOption" />
<EmptyState v-else icon="i-lucide-line-chart" :title="$t('emptyState.noChartData')" ... />
```

## 6. Connection Awareness (Overview Pages)

For real-time dashboards and when polling fails:

- **Offline / polling failure**: Show a warning bar with `text-danger` and `bg-danger/20`. For data cards that are stale or indicate offline, apply `text-danger` (for text) and `bg-danger/20` (for background). Do NOT use `opacity-60` for dimming.
- **Unconfigured**: Show "No data points selected" and a button linking to Settings → Data Groups.

Use `getConnectionState()` and `addConnectionListener()` from `@/utils/http/connection`.

## 7. i18n Requirement

All empty-state titles and descriptions MUST be in `src/locales/lang/` (en-US.ts, zh-CN.ts). Use keys under `emptyState.*`. Never hardcode empty-state strings.

## 8. Class Reference (SSOT)

| Use                 | Class                                      |
| ------------------- | ------------------------------------------ |
| Watermark icon size | `fs-5xl` (project max; no fs-6xl)          |
| Watermark opacity   | `opacity-25` or `text-muted-foreground/25` |
| Title               | `fs-md font-semibold`                      |
| Description         | `fs-sm text-muted-foreground`              |
