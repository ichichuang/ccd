---
description: Toolchain first: mandatory lookup table
globs: **/*.ts, **/*.vue, **/*.tsx
alwaysApply: true
---

# Toolchain-First Strategy

Before implementing logic, check this map. **If it exists here, you MUST use it.**

## 1. Network & Data

- **HTTP**: `src/hooks/modules/useHttpRequest.ts`
- **Connection**: `src/utils/http/connection.ts` (network status, reconnect)
- **Upload**: `src/utils/http/uploadManager.ts` (chunked, pause/resume)
- **Secure storage**: `src/utils/safeStorage` (encrypt, persist)

## 2. UI & Interaction

- **Dialogs**: `src/hooks/modules/useDialog.tsx` (confirm, warn, custom)
- **Fullscreen**: `@vueuse/core` `useFullscreen` (useFull removed)
- **Loading**: `src/hooks/layout/useLoading.ts`
- **Theme**: `src/hooks/modules/useThemeSwitch.ts`
- **Locale**: `src/hooks/modules/useLocale.ts`
- **Element size**: `src/hooks/modules/useAppElementSize.ts`

## 3. Visualization

- **ECharts theme**: `src/hooks/modules/useChartTheme/` (auto theming)

## 4. Utilities

- **Date/time**: `src/hooks/modules/useDateUtils.ts`
- **Events**: `src/utils/mitt.ts` (global event bus)
- **Lodash**: `src/utils/lodashes.ts` (deep clone/merge)
- **IDs**: `src/utils/ids.ts`
- **Device**: `src/utils/deviceSync.ts` (pre-mount detection)

## 5. Schema-Form (mandatory when task involves form schema)

- **useSchemaForm**: `src/hooks/modules/useSchemaForm.ts` — Schema and formValues state (addField/removeField/updateField/moveField, etc.)
- **SchemaForm component**: `src/components/SchemaForm` — Schema-driven form render
- **Hooks**: `src/components/SchemaForm/hooks/` — useFormSync, useFormActions, useFormMemory, useLayout, useValidation, usePersistence, useSteps, useSubmit, useLifecycle
- See `docs/ai-specs/SCHEMA_FORM_COMPONENT.md`

## 5a. DataTable Column Persistence (mandatory when task involves table column config)

- **useTablePersistence**: `src/hooks/modules/useTablePersistence.ts` — DataTable column order/width/hidden persistence
- Use with `tableId`; data in `src/stores/modules/dataTable.ts`; see `docs/ai-specs/DataTable_COMPONENT.md`

## 6. Method Lookup Workflow

When you need a method:

1. Look up: `src/components/SchemaForm/hooks/` (if SchemaForm-related) + `src/utils/`
2. Found → use directly. Not found → analyze if suitable for global reuse.
3. Output analysis (purpose, global vs local, recommended placement).
4. Ask user: "Add to utils/hooks, or keep at usage site?" — wait for decision.
