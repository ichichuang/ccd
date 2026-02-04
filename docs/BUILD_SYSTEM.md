# Build System & Auto Imports (SSOT)

本文档描述 `build/*`、`vite.config.ts`、自动导入（AutoImport/Components）与生成类型文件的**真实行为**。当你发现“为什么页面里不需要 import ref/computed？”或“为什么某个函数能直接用？”时，以此为准。

## 1. 插件入口与职责分层

- **入口**：`vite.config.ts` → `build/plugins.ts#getPluginsList(env, command)`
- **build/**：仅负责工程化与构建能力（插件、注入、优化、自动导入、icon safelist 等）
- **src/**：仅负责业务代码与 SSOT（constants/types/utils/hooks/components）

## 2. AutoImport（函数/变量自动导入）

配置位置：`build/plugins.ts` 的 `AutoImport({ ... })`。

### 2.1 自动导入的库（imports）

- `vue`：`ref`、`computed`、`watch`、`onMounted` 等可以在页面/组件直接使用
- `vue-router`
- `pinia`
- `@vueuse/core`
- `@/locales`：将 `t` 自动映射为 `$t`

### 2.2 扫描目录（dirs）

当前配置（以 `build/plugins.ts` 为准）：

- `src/stores/modules`
- `src/hooks/**/*`
- `src/api/**/*`
- `src/utils`（**仅顶层**，不递归；避免自动扫描 `src/utils/http` 产生重复导出/副作用）
- `src/constants/*`
- `src/components/CScrollbar`

### 2.3 生成物

- 类型声明：`src/types/auto-imports.d.ts`
- ESLint globals：`./.eslintrc-auto-import.json`

### 2.4 使用规则（写代码时）

- 在 `src/**/*.vue`、`src/**/*.ts` 中通常**不需要**手写 `import { ref, computed } from 'vue'`。
- **HTTP 等底层库**（例如 `src/utils/http/*`）按当前策略应**显式 import** 使用（不要依赖自动导入）。

### 2.5 常见坑（必须读）

你已将 API 规则改为扁平化：`src/api/<module>/<feature>.ts`。  
因此 `dirs` 必须递归覆盖二级文件（`src/api/**/*`），否则会出现“API 函数无法自动使用/类型声明未生成”的错觉。

> 这不是业务代码问题，而是构建配置的扫描范围问题。出现“某个 api 函数不能自动用/类型声明没生成”时，优先检查这里。

## 3. Components（组件自动导入）

配置位置：`build/plugins.ts` 的 `Components({ ... })`。

### 3.1 扫描范围与排除

- 扫描目录：`src/components`（deep=true）
- 排除：`src/layouts`（符合“布局组件需显式引入”的架构约束）
- PrimeVue：通过 `PrimeVueResolver()` 按需自动 import（模板中用到即导入）

### 3.2 生成物

- `src/types/components.d.ts`

### 3.3 使用规则

- 使用 `src/components/*` 与 PrimeVue 组件时，通常无需手写 import（保持组件名即可）。
- 布局层组件（`src/layouts/**`）若使用，需显式引入（不会被自动扫描）。

## 4. 图标变更监听与 safelist

相关文件：

- `build/plugins.ts`：开发环境启用图标 watcher（变更后触发 full reload）
- `build/uno-icons.ts`：扫描 router/api/icon 字符串 + 自定义 SVG，生成 UnoCSS safelist 与 custom collection loader
- `uno.config.ts`：通过 `getDynamicSafelist/getPresetIconsCollections` 接入上面的结果

结论：

- 业务中应通过 `Icons` 组件 + `i-lucide/i-mdi/i-logos/i-custom:` 使用图标
- 自定义 SVG 放在 `src/assets/icons/**`，并会被自动注入 `fill=\"currentColor\"`
