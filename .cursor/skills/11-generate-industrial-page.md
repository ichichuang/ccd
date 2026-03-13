---
description: Industrial monitoring/dashboard page generation SOP
globs: src/views/**/*.vue
---

# Skill: Generate Industrial Page

**Purpose**: Create new industrial monitoring/dashboard pages or rewrite complex pages.

## Steps

### 1. Information Gathering

- Read `@docs/ai-specs/INDUSTRIAL_UX_DESIGN_SYSTEM.md` and `@docs/ai-specs/EMPTY_STATE_AND_ROBUSTNESS.md`
- Identify main actions (Toolbar/Filter) and main data view (Table/Cards/Charts)

### 2. Build Flex Skeleton

- Root: `<div class="h-full flex flex-col overflow-hidden bg-surface-ground">`
- Header/Toolbar: `<div class="shrink-0 flex items-center justify-between p-padding-md component-border border-b-default">`

### 3. Build Content Area

- **Main content**: Use `<div data-region="content" class="flex-1 min-h-0">...</div>`. Wrap scrollable regions in `<CScrollbar>` per `docs/ai-specs/ARCHETYPE_SPEC.md` § Region scroll behavior (A1 content, A2 main-content/inspector, A5 form-body). A4 datatable region MUST NOT be wrapped (virtual scroll).

### 4. Empty State Handling

- **Empty state type**: Choose by scenario — "not operated yet" (safe/healthy), "no search result", or "connection lost"
- **Icon selection**: Choose icon per scenario per `EMPTY_STATE_AND_ROBUSTNESS.md` §2.1 (e.g. `i-lucide-shield-check` for safe, `i-lucide-wifi-off` for connection lost)
- **Component**: Use `<EmptyState>` with `icon`, `title`, `description`, optional `actionLabel` + `actionTo`
- **Double-blank fix**: When data is empty, use `v-if` to hide the data view (table/chart) and show `EmptyState`
- **i18n**: Add all empty-state titles/descriptions to `src/locales/lang/en-US.ts` and `zh-CN.ts` under `emptyState.*`

### 5. Polish

- Colors: Use semantic tokens (text-danger, text-warn, text-success, text-primary, text-muted-foreground)
- Loading: Wrap `v-if="isLoading"` content with PrimeVue `<Skeleton>`
- Overview connection: Use `getConnectionState()` / `addConnectionListener()`. When offline or polling fails, show warning bar and stale cards with `text-danger` and `bg-danger/20`. Do NOT use `opacity-60`.

### 6. Self-Check

Run through the `28-industrial-ux-standards` checklist (6 items). Rewrite if any answer is "No".
