# Build System & Auto Imports (SSOT)

> **Target reader: AI**. This doc is for AI when generating code; required reading for build config, auto-imports, and type generation.

This doc describes the **actual behavior** of `build/*`, `vite.config.ts`, auto-imports (AutoImport/Components), and generated type files. When you wonder “why don’t I need to import ref/computed in the page?” or “why can I use this function directly?”, use this as the source of truth.

## 0. Package manager and command convention

- **Package manager:** The project uses **pnpm** (`package.json` declares `packageManager: "pnpm@10.28.2"`).
- **Command preference:** For any install/build/script command, **use pnpm first** (e.g. `pnpm install`, `pnpm dev`, `pnpm build`); use npm only if pnpm is not available.
- **Must:** When generating commands, docs, or README, default to pnpm (e.g. `pnpm install`, `pnpm dev`).
- **Forbidden:** Defaulting to `npm install` or `npm run dev` unless explicitly labeled “when pnpm is unavailable”.

## 1. Plugin entry and responsibility split

- **Entry:** `vite.config.ts` → `build/plugins.ts#getPluginsList(env, command)`
- **build/:** Only build tooling (plugins, injection, optimization, auto-import, icon safelist, etc.).
- **src/:** Only app code and SSOT (constants, types, utils, hooks, components).

### 1.1 build/ file roles

| File                   | Responsibility                                                                                                                                                                       |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `build/plugins.ts`     | Plugin entry: AutoImport, Components, UnoCSS, Vue, JSX, HTML injection, icon watcher, compress, bundle analysis, Legacy, etc.                                                        |
| `build/optimize.ts`    | Pre-bundling: `optimizeDeps.include` / `exclude` for `vite.config.ts`                                                                                                                |
| `build/uno-icons.ts`   | Icons and class names: router/API icon scan, custom SVG set, UnoCSS safelist (`getDynamicSafelist`), custom collection loader (`getPresetIconsCollections`), used by `uno.config.ts` |
| `build/html.ts`        | Inject brand config into `index.html` (from `src/constants/brand.ts`: title, og:title, og:description, author)                                                                       |
| `build/compress.ts`    | Gzip/brotli for build output (enabled via `VITE_COMPRESSION`)                                                                                                                        |
| `build/info.ts`        | Build info (version, duration, bundle size)                                                                                                                                          |
| `build/legacy.ts`      | `@vitejs/plugin-legacy` for older browsers (when `VITE_LEGACY` is true)                                                                                                              |
| `build/performance.ts` | `rollup-plugin-visualizer`. Enable: `pnpm build:analyze` (`--mode analyze` loads `.env.analyze`, `VITE_BUILD_ANALYZE=true`) → `dist/stats.html`                                      |
| `build/utils.ts`       | Path aliases (`@`, `@!`, `@&`), env helpers, `__APP_INFO__`, `getPackageSize`, etc.                                                                                                  |

### 1.2 Pre-bundling (optimizeDeps)

Configured in `vite.config.ts` as `optimizeDeps.include` / `exclude`; **source of data:** `build/optimize.ts`.

- **Purpose:** Vite pre-compiles listed dependencies to ESM and caches in `node_modules/.vite`, reducing dev requests and cold start.
- **include** (see `build/optimize.ts`): Core (vue, vue-router, pinia, alova, @vueuse/core), utils (dayjs, lodash-es, yup), charts (echarts, vue-echarts), PrimeVue forms and subpath components (@primevue/forms, primevue/button, primevue/inputtext, etc.).
- **exclude:** Currently empty; use for .wasm or non-standard ESM when needed.

When adding a dependency that must be pre-bundled, update the `include` array in `build/optimize.ts`; do not hardcode in `vite.config.ts`.

## 2. AutoImport (function/variable auto-import)

Configured in `build/plugins.ts` under `AutoImport({ ... })`.

### 2.1 Auto-imported libraries (imports)

- `vue`: `ref`, `computed`, `watch`, `onMounted`, etc. can be used in pages/components without import
- `vue-router`
- `pinia`
- `@vueuse/core`
- `@/locales`: `t` is auto-mapped as `$t`

### 2.2 Scanned directories (dirs)

Current config (see `build/plugins.ts`; **only these** are scanned and auto-injected):

- `src/stores/modules`
- `src/hooks/**/*`

Modules **not** in these dirs (e.g. `src/router/**`, `src/utils/**`, `src/api/**`, `src/constants/**`, `src/plugins/**`) are **not** auto-injected. Using `@/utils/ids`, `@/api/*`, `@/constants/*`, etc. requires **explicit import**, or runtime will throw `xxx is not defined` (types may still exist via generated dts).

### 2.3 Outputs

- Type declarations: `src/types/auto-imports.d.ts`
- ESLint globals: `./.eslintrc-auto-import.json`

### 2.4 Usage rules (when writing code)

- In `src/**/*.vue` and `src/**/*.ts` you usually **do not** need to write `import { ref, computed } from 'vue'`.
- If an **exported type** needs `Ref`, `ComputedRef`, etc., use only `import type { Ref, ComputedRef } from 'vue'`; runtime APIs (ref, computed, watch) still come from auto-import.
- **Remove unused imports.** For intentionally unused variables or destructuring (e.g. composable return values), use a **`_` prefix**, matching `eslint.config.ts` `varsIgnorePattern: '^_'`.
- **Low-level libs** (e.g. `src/utils/http/*`) should be **explicitly imported**; do not rely on auto-import.
- **.ts modules outside dirs** (e.g. `src/router/utils/helper.ts`, `src/plugins/**`): when using `@/utils/ids`, `@/api/*`, `@/constants/*`, etc., **must explicitly import**; otherwise runtime `ReferenceError: xxx is not defined`.

### 2.5 Common pitfalls (must read)

- In **non-dirs** (e.g. `src/router/**`, `src/utils/**`, `src/plugins/**`) using `generateIdFromKey`, API functions, etc., you must add an explicit `import { ... } from '@/utils/ids'` (or the right module) at the top; otherwise types may exist via dts but runtime will be undefined.
- When extending AutoImport scan scope, update the `dirs` in `build/plugins.ts` and keep this doc §2.2 in sync.

## 3. Components (component auto-import)

Configured in `build/plugins.ts` under `Components({ ... })`.

### 3.1 Scan scope and exclusions

- Scan directory: `src/components` (deep=true)
- Excluded: `src/layouts` (layout components must be explicitly imported per architecture)
- PrimeVue: via `PrimeVueResolver()`, on-demand (imported when used in templates)

### 3.2 Outputs

- `src/types/components.d.ts`

### 3.3 Usage rules

- When using `src/components/*` and PrimeVue components, you usually do not need to write imports (component name is enough).
- Layout components (`src/layouts/**`) must be explicitly imported (they are not scanned).

## 4. Icon change watch and safelist

Relevant files:

- `build/plugins.ts`: In dev, icon watcher is enabled (full reload on change)
- `build/uno-icons.ts`: Scans router/api icon strings + custom SVG, produces UnoCSS safelist and custom collection loader
- `uno.config.ts`: Consumes the above via `getDynamicSafelist` / `getPresetIconsCollections`

Summary:

- In app code use the `Icons` component with `i-lucide` / `i-mdi` / `i-logos` / `i-custom:`
- Custom SVGs go under `src/assets/icons/**` and get `fill="currentColor"` injected automatically

### 4.1 UnoCSS safelist and demo mode

- **Production build:** Safelist uses only `getDynamicSafelist()` (icons found by dynamic scan for routes/API).
- **Lite mode:** By default `UNO_DEMO` is `false`; the icon demo page shows a small set of ~20 common icons and does not load large Iconify JSON, improving cold start and avoiding Vercel timeouts.
- **Full demo mode:** When `UNO_DEMO=true` (e.g. `pnpm dev:demo`), safelist loads the full icon subset (Lucide 500, MDI 500, etc.) and merges `themeDemoSafelist`.

## 5. Vite build splitting and first-frame size

### 5.1 Chunk strategy (manualChunks)

Configured in `vite.config.ts` under `build.rollupOptions.output.manualChunks`.

- **vendor-echarts:** ECharts
- **vendor-primevue:** PrimeVue + PrimeIcons
- **vendor-date-holidays:** date-holidays (dynamic import, loaded on first holiday API use)
- **vendor-utils:** lodash, dayjs, etc.
- **vendor-vue:** Vue, VueRouter, Pinia, @vueuse/core
- **vendor-libs:** Other third-party libs

`chunkSizeWarningLimit: 2500` is set for chunk size warnings (aligned with vite.config.ts).

### 5.2 First-frame FOUC and size injection

- Entry `src/main.ts` calls `preload()` (from `src/utils/theme/sizeEngine.ts`) before `createApp(App)`.
- `preload()` reads persisted size (key in `src/constants/size.ts`: `SIZE_PERSIST_KEY`), applies the size preset, and writes root font and other CSS variables to avoid first-frame size/font flash (FOUC).
