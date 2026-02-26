# Build System & Auto Imports (SSOT)

> **目标读者：AI**。本文档供 AI 在代码生成时参照，涉及构建配置、自动导入、类型生成时必读。

本文档描述 `build/*`、`vite.config.ts`、自动导入（AutoImport/Components）与生成类型文件的**真实行为**。当你发现“为什么页面里不需要 import ref/computed？”或“为什么某个函数能直接用？”时，以此为准。

## 0. 包管理工具与命令约定

- **包管理器：** 本项目使用 **pnpm**（`package.json` 中已声明 `packageManager: "pnpm@10.28.2"`）
- **命令执行顺序：** 执行任何依赖/构建/脚本命令时，**优先使用 pnpm**（如 `pnpm install`、`pnpm dev`、`pnpm build`）；若环境无 pnpm 再使用 npm
- **应当：** AI 在生成命令、文档或 README 时，默认写 pnpm 命令（如 `pnpm install`、`pnpm dev`）
- **禁止：** 默认写 `npm install` 或 `npm run dev`，除非明确标注「pnpm 不可用时」

## 1. 插件入口与职责分层

- **入口**：`vite.config.ts` → `build/plugins.ts#getPluginsList(env, command)`
- **build/**：仅负责工程化与构建能力（插件、注入、优化、自动导入、icon safelist 等）
- **src/**：仅负责业务代码与 SSOT（constants/types/utils/hooks/components）

### 1.1 build/ 文件职责

| 文件                   | 职责                                                                                                                                                                       |
| ---------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `build/plugins.ts`     | 插件入口：AutoImport、Components、UnoCSS、Vue、JSX、HTML 注入、图标 watcher、压缩、体积分析、Legacy 等                                                                     |
| `build/optimize.ts`    | 依赖预构建：`optimizeDeps.include` / `exclude`，供 `vite.config.ts` 使用                                                                                                   |
| `build/uno-icons.ts`   | 图标与类名：路由/API icon 扫描、自定义 SVG 集合、UnoCSS safelist（`getDynamicSafelist`）、custom collection loader（`getPresetIconsCollections`），由 `uno.config.ts` 引用 |
| `build/html.ts`        | 向 `index.html` 注入品牌配置（来自 `src/constants/brand.ts`：title、og:title、og:description、author）                                                                     |
| `build/compress.ts`    | 构建产物 gzip/brotli 压缩（按 `VITE_COMPRESSION` 启用）                                                                                                                    |
| `build/info.ts`        | 构建信息输出（版本、耗时、产物体积）                                                                                                                                       |
| `build/legacy.ts`      | `@vitejs/plugin-legacy`，旧浏览器兼容（`VITE_LEGACY` 为 true 时）                                                                                                          |
| `build/performance.ts` | `rollup-plugin-visualizer`，体积分析（`VITE_BUILD_ANALYZE` 时生成 `dist/stats.html`）                                                                                      |
| `build/utils.ts`       | 路径别名（`@`、`@!`、`@&`）、环境变量包装、`__APP_INFO__`、`getPackageSize` 等                                                                                             |

### 1.2 依赖预构建（optimizeDeps）

配置位置：`vite.config.ts` 的 `optimizeDeps.include` / `exclude`，**数据来源**：`build/optimize.ts`。

- **作用**：Vite 启动时将 `include` 中的依赖预编译为 ESM 并缓存到 `node_modules/.vite`，减少 dev 时的请求数与冷启动时间。
- **include**（以 `build/optimize.ts` 为准）：核心框架（vue、vue-router、pinia、alova、@vueuse/core）、工具库（dayjs、lodash-es、yup）、图表（echarts、vue-echarts）、PrimeVue 表单与子路径组件（@primevue/forms、primevue/button、primevue/inputtext 等一批子路径）。
- **exclude**：当前为空数组；用于含 .wasm 或非标准 ESM 导出的库时再配置。

新增需要预构建的依赖时，应修改 `build/optimize.ts` 的 `include` 数组，勿在 `vite.config.ts` 中硬编码。

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
- `src/api/**/*`：接口定义层，目录已预置（见 `src/api/README.md`）
- `src/utils`（**仅顶层**，不递归；避免自动扫描 `src/utils/http` 产生重复导出/副作用）
- `src/constants/*`
- `src/components/CScrollbar`

### 2.3 生成物

- 类型声明：`src/types/auto-imports.d.ts`
- ESLint globals：`./.eslintrc-auto-import.json`

### 2.4 使用规则（写代码时）

- 在 `src/**/*.vue`、`src/**/*.ts` 中通常**不需要**手写 `import { ref, computed } from 'vue'`。
- 若**导出接口**需使用 `Ref`、`ComputedRef` 等类型，可仅写 `import type { Ref, ComputedRef } from 'vue'`；运行时 API（ref、computed、watch）仍由自动导入提供。
- **未使用的 import** 应删除；确需保留的未使用变量或解构（如 composable 返回值暂时不用）可用 **`_` 前缀**，与 `eslint.config.ts` 的 `varsIgnorePattern: '^_'` 一致。
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

### 4.1 UnoCSS safelist 与 demo 模式

- 生产构建：safelist 仅使用 `getDynamicSafelist()`（动态扫描到的类）。
- 开发/演示：当 `UNO_DEMO=true`（如 `pnpm dev:demo`）时，safelist 会合并 `themeDemoSafelist`，便于主题/尺寸演示页完整展示类名。日常开发无需开启。

## 5. Vite 构建拆包与首帧尺寸

### 5.1 拆包策略（manualChunks）

配置位置：`vite.config.ts` 的 `build.rollupOptions.output.manualChunks`。

- **vendor-echarts**：ECharts 相关
- **vendor-primevue**：PrimeVue + PrimeIcons
- **vendor-utils**：项目 `src/utils` 等工具
- **vendor-vue**：Vue + VueRouter + Pinia + @vueuse/core
- **vendor-libs**：其余第三方库

另设 `chunkSizeWarningLimit: 1500`，控制单 chunk 体积告警阈值。

### 5.2 首帧 FOUC 与尺寸注入

- 入口 `src/main.ts` 在 `createApp(App)` 之前会调用 `preload()`（来自 `src/utils/theme/sizeEngine.ts`）。
- `preload()` 会读取 size 持久化数据（key 见 `src/constants/size.ts` 的 `SIZE_PERSIST_KEY`），应用尺寸预设并写入根字体等 CSS 变量，避免首屏尺寸/字体闪烁（FOUC）。
