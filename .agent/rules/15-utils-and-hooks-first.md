---
description: Utilities/hooks-first: reuse src/utils and src/hooks before adding new code; defines where to place new helpers
globs: src/**/*.{ts,vue}
alwaysApply: true
---

# Utilities & Hooks First (Must Follow)

## 0. Primary Directive

Before writing any new logic, you MUST first look for an existing implementation in `src/utils/` or `src/hooks/` and reuse it.

If you find an existing utility/hook that covers most of the need, you MUST extend it (minimal change) rather than re-implementing logic in views/components.

## 1. Mandatory Lookup Map (must use first when needed)

### HTTP / Requests

- `src/utils/http/*` (Alova instance, interceptors, methods)
- `src/utils/http/connection.ts` (ConnectionManager: network status, auto-reconnect, health check)
- `src/utils/http/uploadManager.ts` (UploadManager: chunked upload, resume, pause/resume)
- `src/hooks/modules/useHttpRequest.ts` (typed request hook wrapper)

### Secure Storage / Persistence

- `src/utils/safeStorage/*`

### Global Events

- `src/utils/mitt.ts`

### Lodash Wrappers (adapter layer)

- `src/utils/lodashes.ts`
  - For data ops: prefer `deepClone`, `deepEqual`, `deepMerge`, `objectPick`, `objectOmit`
  - For debounce/throttle in components: prefer `@vueuse/core` (`useDebounceFn` / `useThrottleFn`) over lodash wrappers

### IDs

- `src/utils/ids.ts` (`generateUniqueId`, `generateIdFromKey`)
- **Explicit import in non–AutoImport-dirs**: In files outside `src/stores/modules` and `src/hooks/**` (e.g. `src/router/**`, `src/plugins/**`), you **must** explicitly `import { generateIdFromKey } from '@/utils/ids'` (and same for other utils/api/constants); auto-import does not inject there, so omitting the import causes runtime `ReferenceError: xxx is not defined`.

### Date / Timezone

- `src/utils/date/` (same structure as http: types, constants, holidaysLoader, timezone, dateUtils, index)
- `src/hooks/modules/useDateUtils.ts`

### Strings

- `src/utils/strings.ts`

### Device / Breakpoint Sync

- `src/utils/deviceSync.ts` (pure functions, no Pinia; for pre-mount logic)
  - `getDeviceTypeSync()` → sync device type (matches device store)
  - `getBreakpointSync(width?)` → sync current breakpoint

### ECharts Theme System

- `src/hooks/modules/useChartTheme/` (reactive ECharts theme hook)
  - `useChartTheme(option, opacityConfig?, advancedConfig?)` → returns computed themed option
  - `applyThemeToOption(option, ...)` → imperative (non-reactive)
  - 20+ apply\*Styles modules, auto-aligns with ThemeStore colors

### Element Size Observation

- `src/hooks/modules/useAppElementSize.ts`

### Core System Hooks

- `src/hooks/modules/useThemeSwitch.ts`
- `src/hooks/modules/useLocale.ts`

### Layout / Infra Hooks

- `src/hooks/layout/usePageTitle.ts` (page title, calculatePageTitle)
- `src/hooks/layout/useLoading.ts` (loadingStart/loadingDone、pageLoadingStart/pageLoadingDone)
- `src/hooks/layout/useNprogress.ts` (startProgress、doneProgress)
- Fullscreen: use `@vueuse/core` `useFullscreen` (useFull removed)

### Form/Table 相关 Hooks

（旧表单/表格架构已移除；待 Phase 19 以 ProForm/ProTable 重新定义统一入口）

## 2. Import Rules (Hard Requirements)

- FORBIDDEN: scattered direct imports from `lodash-es` inside business code. Prefer `@/utils/lodashes` unless the file already follows a project-established exception.
- FORBIDDEN: creating a new event bus instance. MUST use `@/utils/mitt`.
- FORBIDDEN: theme switching logic outside `@/hooks/modules/useThemeSwitch`.
- FORBIDDEN: locale switching logic outside `@/hooks/modules/useLocale`.
- FORBIDDEN: fetch/axios in business code. MUST use `@/utils/http` / `useHttpRequest`.

## 3. When you need new helpers

1. Prefer extending an existing file in the map above.
2. If no suitable file exists:
   - You MAY create a new file under `src/utils/` (pure utilities) or `src/hooks/modules/` (Vue composables).
   - File MUST have a clear responsibility and boundaries in a header comment.
   - File MUST export named functions (no default export), and follow the style of neighboring files.

## 3a. Method Lookup Workflow

When you need a method/function for a task:

### Step 1: Mandatory Lookup

Before implementing any logic, search in this order:

1. **Global utils**: `src/utils/` (lodashes, date, strings, ids, safeStorage, http/\*, mitt, deviceSync, etc.)

Use `grep` / codebase_search for function names or semantics before writing code.

### Step 2: If Found → Use Directly

Import from the existing module. Do NOT re-implement or copy-paste equivalent logic.

### Step 3: If NOT Found → Analyze & Inform User

Before adding the method inline or creating a new file:

1. **Analyze** whether the method is suitable for global reuse:
   - Used by multiple modules? → Likely global.
   - Pure function, no UI/store coupling? → Likely global.
   - Form-specific only? → Prefer a dedicated `src/components/<Form>/hooks/` or `utils/`.
   - Single-use, tightly coupled to one component? → May stay local.

2. **Output a brief analysis** to the user:
   - Method purpose
   - Suitable for global use? (Yes/No + reason)
   - Recommended placement: `src/utils/<file>.ts` OR `src/components/<Feature>/hooks/` OR keep at usage site
   - Ask: "Should I add this to the utils/hooks directory, or keep it locally?"

3. **Wait for user decision** before placing the method.

## 4. Placement Rules

- HTTP related → `src/utils/http/*` or a composable under `src/hooks/modules/`
- Crypto / storage / persistence → `src/utils/safeStorage/*`
- Strings → `src/utils/strings.ts`
- IDs → `src/utils/ids.ts`
- Browser / platform: browser.ts removed; use @vueuse/core or window API for detection
- Date / timezone → `src/utils/date/` or `src/hooks/modules/useDateUtils.ts`
- Element size observation → `src/hooks/modules/useAppElementSize.ts`
- Layout / infra hooks → `src/hooks/layout/`

## 5. Function-Level Catalog

When a task matches the following needs, you MUST use the specified exports:

### Lodash (src/utils/lodashes.ts)

- Deep clone → `deepClone`
- Deep equal → `deepEqual`
- Deep merge → `deepMerge`
- Pick/Omit → `objectPick` / `objectOmit`
- Debounce/Throttle (fallback) → `debounceFn` / `throttleFn`
  - In Vue components prefer `@vueuse/core`: `useDebounceFn` / `useThrottleFn`

### IDs (src/utils/ids.ts)

- Unique id → `generateUniqueId`
- Stable id from key → `generateIdFromKey`

### Strings (src/utils/strings.ts)

- camelCase/PascalCase → kebab-case → `toKebabCase`

### Browser (browser.ts removed)

- System color mode: use `window.matchMedia('(prefers-color-scheme: dark)')` or ThemeStore

### Global events (src/utils/mitt.ts)

- MUST use `useMitt()` and the singleton emitter defined there.

### HTTP (src/hooks/modules/useHttpRequest.ts + src/utils/http/\*)

- Prefer `useHttpRequest<TData>(buildMethod, options?)`
- Use `alovaInstance` when you need direct Method construction.
- Use `isHttpRequestError` / `HttpRequestError` for error narrowing.
- Connection management → `connectionManager` / `getConnectionState()` / `addConnectionListener()` / `reconnect()`
- Chunked upload → `addUploadTask(file, config?)` / `pauseUploadTask` / `resumeUploadTask` / `cancelUploadTask`

### Device Sync (src/utils/deviceSync.ts)

- Pre-mount device detection → `getDeviceTypeSync()` → `DeviceType`
- Pre-mount breakpoint → `getBreakpointSync(width?)` → `BreakpointKey`

### ECharts (src/hooks/modules/useChartTheme/\*)

- Reactive theming → `useChartTheme(option, opacityConfig?, advancedConfig?)`
- Imperative theming → `applyThemeToOption(option, opacityConfig?, advancedConfig?)`

### Safe storage (src/utils/safeStorage/\*)

- Encrypt/decrypt → `encrypt` / `decrypt` / `encryptSync` / `decryptSync`
- Pack/unpack → `packData` / `unpackData` / `packDataSync` / `unpackDataSync`
- Pinia serializer → `createPiniaEncryptedSerializer`

### Date / Timezone (src/hooks/modules/useDateUtils.ts)

- Prefer `useDateUtils()` as the reactive gateway (do NOT reinvent timezone/locale sync).

### Element size (src/hooks/modules/useAppElementSize.ts)

- Use `useAppElementSize(...)` (do NOT re-implement ResizeObserver patterns).

### Core system hooks

- Theme switching → `useThemeSwitch()` (+ `isThemeLocked()` if needed)
- Locale switching → `useLocale()`

### Form/Table

（旧表单/表格架构已移除；待 Phase 19 以 ProForm/ProTable 补齐对应目录与函数目录表）

### Layout / Infra hooks (src/hooks/layout/\*)

- Page title → `usePageTitle(router?)`, `calculatePageTitle(route, appTitle, t)`
- Loading → `useLoading()` → `loadingStart`, `loadingDone`, `pageLoadingStart`, `pageLoadingDone`
- NProgress → `useNprogress()` → `startProgress`, `doneProgress`
- Fullscreen → use `@vueuse/core` `useFullscreen(target?)` directly

## 6. Explicit Anti-Patterns (Forbidden)

- FORBIDDEN: Re-implementing utility logic inline inside Vue components when a utility/hook exists above.
- FORBIDDEN: Direct `lodash-es` imports in business code (prefer `@/utils/lodashes`).
- FORBIDDEN: Creating a new event bus (use `@/utils/mitt` singleton + `useMitt()`).
- FORBIDDEN: `fetch`/`axios` in business code.
