---
description: 工具链优先：必备工具查找表 (Mandatory Lookup)
globs: **/*.ts, **/*.vue, **/*.tsx
alwaysApply: true
---

# Toolchain First Policy

Before implementing logic, checkout this map. **If it exists here, you MUST use it.**

## 1. Network & Data

- **HTTP**: `src/hooks/modules/useHttpRequest.ts`
- **Connection**: `src/utils/http/connection.ts` (Network status, reconnect)
- **Upload**: `src/utils/http/uploadManager.ts` (Chunked, pause/resume)
- **Safe Storage**: `src/utils/safeStorage` (Encryption, persistence)

## 2. UI & Interaction

- **Dialogs**: `src/hooks/modules/useDialog.tsx` (Confirm, Alert, Custom)
- **Fullscreen**: `src/hooks/layout/useFull.ts`
- **Loading**: `src/hooks/layout/useLoading.ts`
- **Theme**: `src/hooks/modules/useThemeSwitch.ts`
- **Locale**: `src/hooks/modules/useLocale.ts`
- **Element Size**: `src/hooks/modules/useAppElementSize.ts`

## 3. Visualization

- **ECharts Theme**: `src/hooks/modules/useChartTheme/` (Automatic theming)

## 4. Utils

- **Date/Time**: `src/hooks/modules/useDateUtils.ts`
- **Events**: `src/utils/mitt.ts` (Global event bus)
- **Lodash**: `src/utils/lodashes.ts` (Deep clone/merge)
- **IDs**: `src/utils/ids.ts`
- **Device**: `src/utils/deviceSync.ts` (Pre-mount detection)

## 5. Schema-Form (表单 Schema 相关任务必查)

- **Hooks**: `src/components/schema-form/hooks/` — useFormSync, useFormActions, useFormMemory, useLayout, useValidation, usePersistence, useSteps, useSubmit, useLifecycle

## 6. Method Lookup Workflow

When needing a method:

1. Lookup: `src/components/schema-form/hooks/` (if schema-form related) + `src/utils/`
2. Found → use directly. Not found → analyze suitability for global reuse.
3. Output analysis (purpose, global vs local, recommended placement).
4. Ask user: "Add to utils/hooks, or keep at usage site?" — wait for decision.
