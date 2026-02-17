# 📁 CCD 项目架构目录说明

> 逐目录、逐文件说明架构职责与实现内容，供开发者快速了解项目结构。

---

## 📂 一、项目根目录

| 文件                         | 职责说明                                            |
| ---------------------------- | --------------------------------------------------- |
| `package.json`               | 依赖管理、脚本命令、包管理器声明（pnpm）            |
| `pnpm-lock.yaml`             | pnpm 锁文件，锁定依赖版本                           |
| `index.html`                 | 应用 HTML 入口                                      |
| `vite.config.ts`             | Vite 构建配置：别名、端口、代理、拆包、PostCSS 等   |
| `uno.config.ts`              | UnoCSS 配置：语义类、布局变量、断点、图标 preset 等 |
| `tsconfig.json`              | TypeScript 根配置                                   |
| `tsconfig.app.json`          | 业务代码 TS 配置（路径别名、JSX 等）                |
| `tsconfig.node.json`         | Node/构建脚本 TS 配置                               |
| `eslint.config.ts`           | ESLint 扁平配置                                     |
| `.eslintrc-auto-import.json` | AutoImport 生成的 ESLint globals                    |
| `.prettierrc.json`           | Prettier 格式化配置                                 |
| `.editorconfig`              | 编辑器统一配置                                      |
| `.gitattributes`             | Git 行尾、合并策略等                                |
| `.gitignore`                 | Git 忽略规则                                        |
| `.npmrc`                     | npm/pnpm 配置                                       |
| `.nvmrc`                     | Node 版本声明                                       |
| `commitlint.config.ts`       | 提交信息规范                                        |

### 环境变量

| 文件               | 职责说明         |
| ------------------ | ---------------- |
| `.env`             | 所有环境共用变量 |
| `.env.development` | 开发环境变量     |
| `.env.production`  | 生产环境变量     |

---

## 🔧 二、build/ 构建层

> 工程化与构建相关，业务开发通常无需修改。

| 文件             | 职责说明                                                                                          |
| ---------------- | ------------------------------------------------------------------------------------------------- |
| `plugins.ts`     | 插件入口，组装 AutoImport、Components、UnoCSS、Vue、JSX、HTML 注入、图标 watcher、压缩、Legacy 等 |
| `optimize.ts`    | 依赖预构建配置（optimizeDeps）                                                                    |
| `uno-icons.ts`   | 图标扫描、自定义 SVG 加载、UnoCSS safelist、custom collection                                     |
| `html.ts`        | 向 index.html 注入环境变量                                                                        |
| `compress.ts`    | gzip/brotli 压缩插件                                                                              |
| `info.ts`        | 构建信息输出                                                                                      |
| `legacy.ts`      | 旧浏览器兼容                                                                                      |
| `performance.ts` | 体积分析                                                                                          |
| `utils.ts`       | 路径别名、环境变量包装、**APP_INFO** 等                                                           |

---

## 📦 三、src/ 业务源码

### 3.1 入口文件

| 文件      | 职责说明                                                                              |
| --------- | ------------------------------------------------------------------------------------- |
| `main.ts` | 应用入口：样式导入、preload 尺寸、createApp、setupPlugins、挂载                       |
| `App.vue` | 根组件：LayoutManager、AppPrimeVueGlobals、根字号 watchEffect、设备检测、多窗口初始化 |

---

### 3.2 src/api/ API 层

接口定义 SSOT，仅允许 `src/api/<module>/<feature>.ts` 两级目录。

| 文件            | 职责说明                        |
| --------------- | ------------------------------- |
| `README.md`     | API 层规范说明                  |
| `user/types.ts` | 用户相关 DTO 类型               |
| `user/login.ts` | 登录接口：Method 构建、请求函数 |

---

### 3.3 src/assets/ 静态资源

| 文件/目录                       | 职责说明                                          |
| ------------------------------- | ------------------------------------------------- |
| `styles/reset.scss`             | 样式重置                                          |
| `styles/custom-nprogress.css`   | NProgress 自定义样式                              |
| `styles/theme/transitions.scss` | 主题切换过渡                                      |
| `styles/theme/modes/*.scss`     | 主题切换效果（circle、diamond、curtain、fade 等） |
| `icons/custom/*.svg`            | 自定义 SVG 图标                                   |

---

### 3.4 src/components/ 组件层

#### AnimateWrapper

| 文件                 | 职责说明              |
| -------------------- | --------------------- |
| `AnimateWrapper.vue` | 进场/离场动画包装组件 |
| `index.ts`           | 导出                  |
| `utils/types.ts`     | 动画类型              |
| `utils/constants.ts` | 动画常量              |

#### CScrollbar

| 文件             | 职责说明                          |
| ---------------- | --------------------------------- |
| `CScrollbar.vue` | 自定义滚动条（OverlayScrollbars） |
| `index.ts`       | 导出                              |
| `utils/types.ts` | 类型定义                          |

#### DataTable

| 文件                               | 职责说明                                                  |
| ---------------------------------- | --------------------------------------------------------- |
| `DataTable.vue`                    | 表格主组件：列配置、API、分页、排序、筛选、导出、列持久化 |
| `BodyCellRenderer.tsx`             | 表体单元格渲染                                            |
| `RenderFn.tsx`                     | 渲染函数封装                                              |
| `composables/useTableSelection.ts` | 行选择                                                    |
| `composables/useTableData.ts`      | 数据加载与状态                                            |
| `composables/useTableExport.ts`    | 导出 CSV/JSON/XLSX                                        |
| `composables/useTableLayout.ts`    | 布局与列宽                                                |
| `utils/helper.ts`                  | 工具函数                                                  |
| `utils/executeTableApi.ts`         | API 请求执行                                              |
| `utils/types.ts`                   | 类型定义                                                  |

#### Icons

| 文件              | 职责说明                                |
| ----------------- | --------------------------------------- |
| `Icons.vue`       | 统一图标入口（Lucide/MDI/Logos/custom） |
| `utils/types.ts`  | IconsProps 类型                         |
| `utils/helper.ts` | 图标名称转换                            |

#### PrimeDialog

| 文件                         | 职责说明               |
| ---------------------------- | ---------------------- |
| `PrimeVueDialog.vue`         | Dialog 二次封装        |
| `useDialog.ts`               | useDialogCore 核心逻辑 |
| `MessageContent.tsx`         | 默认消息内容渲染       |
| `defaultContentRenderer.tsx` | 默认 content 渲染器    |
| `utils/types.ts`             | 弹窗选项、事件类型     |
| `utils/constants.ts`         | 弹窗默认配置           |

#### SchemaForm

| 文件                                      | 职责说明                                                      |
| ----------------------------------------- | ------------------------------------------------------------- |
| `SchemaForm.vue`                          | Schema 驱动表单主组件                                         |
| `components/FormItems.tsx`                | 表单项渲染                                                    |
| `components/DefaultRenderer.vue`          | 默认字段渲染器                                                |
| `components/SectionsRenderer.vue`         | 分组渲染                                                      |
| `components/StepsRenderer.vue`            | 分步表单渲染                                                  |
| `components/StepsHeader.vue`              | 分步头部                                                      |
| `components/StepNavigation.vue`           | 分步导航                                                      |
| `components/componentMap.ts`              | 字段类型到组件映射                                            |
| `components/utils/buildComponentProps.ts` | 根据 schema 构建组件 props                                    |
| `components/wrappers/*.vue`               | PrimeVue 组件封装（AutoComplete、ColorPicker、DatePicker 等） |
| `hooks/useFormSync.ts`                    | 表单值与 schema 同步                                          |
| `hooks/useFormActions.ts`                 | 提交、重置、清空                                              |
| `hooks/useFormMemory.ts`                  | 表单记忆/草稿                                                 |
| `hooks/useLayout.ts`                      | 表单布局                                                      |
| `hooks/usePersistence.ts`                 | 表单持久化                                                    |
| `hooks/useSteps.ts`                       | 分步逻辑                                                      |
| `hooks/useSubmit.ts`                      | 提交逻辑                                                      |
| `hooks/useLifecycle.ts`                   | 生命周期                                                      |
| `utils/useValidation.ts`                  | 校验逻辑                                                      |
| `utils/helper.ts`                         | 工具函数                                                      |
| `utils/types.ts`                          | schema、字段类型                                              |

#### UseEcharts

| 文件                 | 职责说明                                       |
| -------------------- | ---------------------------------------------- |
| `UseEcharts.vue`     | 图表组件，基于 vue-echarts，接入 useChartTheme |
| `utils/types.ts`     | Props、事件类型                                |
| `utils/constants.ts` | 图表常量                                       |

---

### 3.5 src/constants/ 常量层

| 文件             | 职责说明                           |
| ---------------- | ---------------------------------- |
| `breakpoints.ts` | 响应式断点（xs~5xl）               |
| `theme.ts`       | 主题预设、默认主题名               |
| `size.ts`        | 尺寸预设、布局维度 key、持久化 key |
| `sizeScale.ts`   | 尺寸阶梯、字体/间距比例            |
| `layout.ts`      | 布局默认配置、持久化字段           |
| `router.ts`      | 路由白名单、错误页、rootRedirect   |
| `http.ts`        | HTTP 常量                          |
| `locale.ts`      | 默认语言、回退语言                 |
| `login.ts`       | 登录常量                           |

---

### 3.6 src/hooks/ 逻辑层

#### hooks/layout/

| 文件              | 职责说明                                                   |
| ----------------- | ---------------------------------------------------------- |
| `usePageTitle.ts` | 页面标题管理、calculatePageTitle                           |
| `useLoading.ts`   | loadingStart/loadingDone、pageLoadingStart/pageLoadingDone |
| `useNprogress.ts` | NProgress startProgress/doneProgress                       |
| `useFull.ts`      | 全屏控制（VueUse useFullscreen）                           |

#### hooks/modules/

| 文件                     | 职责说明                                                                   |
| ------------------------ | -------------------------------------------------------------------------- |
| `useHttpRequest.ts`      | Alova 请求 Hook 封装                                                       |
| `useDialog.tsx`          | 弹窗 Hook：info、success、warn、danger、confirm、confirmDelete、openDialog |
| `useLocale.ts`           | 多语言切换                                                                 |
| `useThemeSwitch.ts`      | 主题切换、动画锁                                                           |
| `useSchemaForm.ts`       | SchemaForm 无头状态：addField、removeField、updateField、moveField         |
| `useTablePersistence.ts` | DataTable 列持久化                                                         |
| `useDateUtils.ts`        | 日期/时区响应式工具                                                        |
| `useAppElementSize.ts`   | 元素尺寸监听（ResizeObserver）                                             |

#### hooks/modules/useChartTheme/

| 文件                          | 职责说明                               |
| ----------------------------- | -------------------------------------- |
| `index.ts`                    | useChartTheme、applyThemeToOption 导出 |
| `defaults.ts`                 | 主题默认配置                           |
| `mergeAdvancedConfigs.ts`     | 高级主题配置合并                       |
| `utils.ts`                    | 工具函数                               |
| `types.ts`                    | 主题类型                               |
| `applyAxisStyles.ts`          | 坐标轴主题                             |
| `applySeriesStyles.ts`        | 系列主题                               |
| `applyTooltipStyles.ts`       | 提示框主题                             |
| `applyLegendStyles.ts`        | 图例主题                               |
| `applyTitleStyles.ts`         | 标题主题                               |
| `applyBrushStyles.ts`         | 刷选主题                               |
| `applyDataZoomStyles.ts`      | 数据区域缩放主题                       |
| `applyVisualMapStyles.ts`     | 视觉映射主题                           |
| `applyToolboxStyles.ts`       | 工具箱主题                             |
| `applyFontStyles.ts`          | 字体主题                               |
| `applyPieStyles.ts`           | 饼图主题                               |
| `applyLinesStyles.ts`         | 折线图主题                             |
| `applyRadarStyles.ts`         | 雷达图主题                             |
| `applyGaugeStyles.ts`         | 仪表盘主题                             |
| `applyFunnelStyles.ts`        | 漏斗图主题                             |
| `applyHeatmapStyles.ts`       | 热力图主题                             |
| `applyGraphStyles.ts`         | 关系图主题                             |
| `applyTreeStyles.ts`          | 树图主题                               |
| `applyTreemapStyles.ts`       | 矩形树图主题                           |
| `applySunburstStyles.ts`      | 旭日图主题                             |
| `applySankeyStyles.ts`        | 桑基图主题                             |
| `applyParallelStyles.ts`      | 平行坐标系主题                         |
| `applyThemeRiverStyles.ts`    | 主题河流图主题                         |
| `applyBoxplotStyles.ts`       | 箱线图主题                             |
| `applyCandlestickStyles.ts`   | K 线图主题                             |
| `applyEffectScatterStyles.ts` | 涟漪散点图主题                         |
| `applyPictorialBarStyles.ts`  | 象形柱图主题                           |

---

### 3.7 src/layouts/ 布局层

| 文件                                           | 职责说明                                                                         |
| ---------------------------------------------- | -------------------------------------------------------------------------------- |
| `index.vue`                                    | 布局入口，根据 meta.parent 切换 Admin/FullScreen/Ratio                           |
| `components/AppContainer.vue`                  | 布局容器                                                                         |
| `components/AppPrimeVueGlobals.vue`            | 全局 UI：Toast、ConfirmPopup、DynamicDialog、PrimeDialog、window.$toast/$message |
| `components/ToastMessageContent.vue`           | 居中 Message 内容                                                                |
| `components/ContextMenuProvider.vue`           | 右键菜单提供者                                                                   |
| `components/AnimateRouterView.vue`             | 带过渡的路由视图                                                                 |
| `components/ParentView.vue`                    | 父级路由视图                                                                     |
| `components/Loading*.vue`                      | 加载动画组件                                                                     |
| `components/User/index.vue`                    | 用户头像/下拉                                                                    |
| `components/admin/AdminHeader.tsx`             | Admin 顶栏                                                                       |
| `components/admin/AdminSidebar.tsx`            | Admin 侧栏                                                                       |
| `components/admin/AdminTabsBar.tsx`            | Admin 标签页栏                                                                   |
| `components/admin/AdminBreadcrumbBar.tsx`      | Admin 面包屑                                                                     |
| `components/admin/AdminFooterBar.tsx`          | Admin 底栏                                                                       |
| `components/GlobalSetting/index.vue`           | 设置面板入口                                                                     |
| `components/GlobalSetting/SettingsContent.vue` | 设置面板内容                                                                     |
| `modules/LayoutAdmin.tsx`                      | Admin 布局壳，runAdaptive 唯一入口                                               |
| `modules/LayoutFullScreen.vue`                 | 全屏布局壳                                                                       |
| `modules/LayoutRatio.vue`                      | 比例布局壳                                                                       |

---

### 3.8 src/plugins/ 插件层

| 文件                      | 职责说明                   |
| ------------------------- | -------------------------- |
| `index.ts`                | setupPlugins 统一入口      |
| `modules/errorHandler.ts` | 全局错误兜底               |
| `modules/locales.ts`      | vue-i18n 初始化            |
| `modules/stores.ts`       | Pinia 挂载                 |
| `modules/router.ts`       | Vue Router 挂载            |
| `modules/primevue.ts`     | PrimeVue 配置              |
| `modules/scrollbar.ts`    | OverlayScrollbars 默认配置 |
| `modules/date.ts`         | DateUtils 初始化           |
| `modules/echarts.ts`      | ECharts 注册               |

---

### 3.9 src/router/ 路由层

| 文件                    | 职责说明                                                                               |
| ----------------------- | -------------------------------------------------------------------------------------- |
| `index.ts`              | 创建 router、routeUtils、dynamicRouteManager，注册守卫                                 |
| `modules/core.ts`       | 根、登录、系统配置路由                                                                 |
| `modules/dashboard.ts`  | 仪表盘路由                                                                             |
| `modules/example.ts`    | 示例页路由                                                                             |
| `utils/common.ts`       | processAsyncRoutes、createRouteUtils、createDynamicRouteManager、权限过滤、菜单/面包屑 |
| `utils/guards.ts`       | registerRouterGuards、initDynamicRoutes                                                |
| `utils/permission.ts`   | usePermissionGuard                                                                     |
| `utils/helper.ts`       | goBack、goToRoute、replaceRoute、refreshCurrentRoute、多窗口                           |
| `utils/moduleLoader.ts` | 路由模块自动加载                                                                       |

---

### 3.10 src/stores/ 状态层

| 文件                    | 职责说明                                |
| ----------------------- | --------------------------------------- |
| `index.ts`              | Pinia 实例、persistedstate 插件         |
| `modules/theme.ts`      | 主题模式、预设、CSS 变量                |
| `modules/size.ts`       | 尺寸预设、根字号                        |
| `modules/device.ts`     | 设备类型、断点、视口、orientation       |
| `modules/layout.ts`     | 布局 mode、侧栏收展、显隐、adapt\* 方法 |
| `modules/locale.ts`     | 当前语言                                |
| `modules/user.ts`       | 用户信息、token                         |
| `modules/permission.ts` | 静态/动态路由、tabs、windows            |
| `modules/dataTable.ts`  | DataTable 列持久化                      |

---

### 3.11 src/types/ 类型层

| 文件                  | 职责说明                                                  |
| --------------------- | --------------------------------------------------------- |
| `index.d.ts`          | 全局类型声明                                              |
| `env.d.ts`            | 环境变量类型                                              |
| `auto-imports.d.ts`   | AutoImport 生成（自动维护）                               |
| `modules/router.d.ts` | RouteMeta、RouteConfig、BackendRouteConfig、RouteUtils 等 |
| `modules/utils.d.ts`  | 通用工具类型                                              |
| `modules/vue.d.ts`    | Vue 扩展                                                  |
| `systems/theme.d.ts`  | ThemeMode、ThemePreset、ThemeCssVars                      |
| `systems/size.d.ts`   | SizeMode、SizePreset、SizeCssVars                         |
| `systems/layout.d.ts` | LayoutMode、AdminLayoutMode、LayoutSetting                |
| `systems/device.d.ts` | DeviceType、OsType、DeviceState                           |

---

### 3.12 src/utils/ 工具层

| 文件                                                                | 职责说明                                                |
| ------------------------------------------------------------------- | ------------------------------------------------------- |
| `browser.ts`                                                        | getSystemColorMode                                      |
| `date.ts`                                                           | 日期工具（dayjs、date-holidays）                        |
| `deviceSync.ts`                                                     | getDeviceTypeSync、getBreakpointSync                    |
| `ids.ts`                                                            | generateUniqueId、generateIdFromKey                     |
| `lodashes.ts`                                                       | deepClone、deepEqual、deepMerge、objectPick、objectOmit |
| `mitt.ts`                                                           | 全局事件总线 useMitt                                    |
| `strings.ts`                                                        | toKebabCase                                             |
| `http/instance.ts`                                                  | Alova 实例                                              |
| `http/methods.ts`                                                   | get/post/put/del/patch/head/uploadFile/downloadFile     |
| `http/interceptors.ts`                                              | 请求/响应拦截                                           |
| `http/errors.ts`                                                    | HttpRequestError、isHttpRequestError                    |
| `http/types.ts`                                                     | HTTP 相关类型                                           |
| `http/index.ts`                                                     | HTTP 模块导出                                           |
| `http/connection.ts`                                                | ConnectionManager（网络状态、重连、健康检查）           |
| `http/uploadManager.ts`                                             | UploadManager（分片上传、断点续传、暂停/恢复）          |
| `safeStorage/*`                                                     | 加密、压缩、序列化                                      |
| `theme/engine.ts`                                                   | 主题应用引擎                                            |
| `theme/sizeEngine.ts`                                               | 尺寸预设、preload、根字号                               |
| `theme/metadata.ts`                                                 | 主题元数据                                              |
| `theme/primevue-preset.ts`                                          | PrimeVue 主题融合                                       |
| `theme/transitions.ts`                                              | 主题切换过渡                                            |
| `theme/primevue-theme-helpers.ts`、`theme/primevue-theme-engine.ts` | PrimeVue 主题引擎                                       |
| `theme/colors.ts`、`theme/*.json`                                   | 颜色与主题配置                                          |
| `theme/chartUtils.ts`                                               | 图表颜色工具                                            |

---

### 3.13 src/locales/ 国际化

| 文件            | 职责说明                              |
| --------------- | ------------------------------------- |
| `index.ts`      | vue-i18n、setupI18n、t/d/n、setLocale |
| `lang/zh-CN.ts` | 中文语言包                            |
| `lang/en-US.ts` | 英文语言包                            |
| `primevue-*.ts` | PrimeVue 语言包                       |

---

### 3.14 src/views/ 页面层

| 目录/文件                                | 职责说明                                                               |
| ---------------------------------------- | ---------------------------------------------------------------------- |
| `login/login.vue`                        | 登录页                                                                 |
| `dashboard/dashboard.vue`                | 仪表盘                                                                 |
| `notfound/404.vue`、`403.vue`、`500.vue` | 错误页                                                                 |
| `system-configuration/*.vue`             | 主题、尺寸、断点、滚动条、UnoCSS 配置                                  |
| `example/PrimeVue/*`                     | PrimeVue 示例                                                          |
| `example/PrimeVueDialog/*`               | PrimeDialog 示例                                                       |
| `example/PrimeVueToast/*`                | Toast 示例                                                             |
| `example/SchemaForm/*`                   | SchemaForm 示例                                                        |
| `example/DataTable/*`                    | DataTable 示例                                                         |
| `example/UseEcharts/*`                   | UseEcharts 示例                                                        |
| `example/IconsExample/*`                 | Icons 示例                                                             |
| `example/icons/`                         | IconsExample 的 iconLists 配置（iconLists.ts、iconLists.generated.ts） |

---

## 📚 四、docs/ 文档层

| 文件                        | 职责说明                                                       |
| --------------------------- | -------------------------------------------------------------- |
| `README.md`                 | 文档索引与使用指南                                             |
| `PROJECT_PROTOCOL.md`       | 项目协议（SSOT）                                               |
| `BUILD_SYSTEM.md`           | 构建系统、AutoImport                                           |
| `TYPESCRIPT_AND_LINTING.md` | TypeScript、ESLint                                             |
| `PRIMEVUE_THEME.md`         | PrimeVue 主题                                                  |
| `UNOCSS_AND_ICONS.md`       | UnoCSS、Icons                                                  |
| `ECHARTS_THEME.md`          | UseEcharts、useChartTheme                                      |
| `SCHEMA_FORM_COMPONENT.md`  | SchemaForm 使用                                                |
| `DataTable_COMPONENT.md`    | DataTable 使用                                                 |
| `DIALOG_COMPONENT.md`       | PrimeDialog、useDialog                                         |
| `TOAST_AND_MESSAGE.md`      | window.$toast、$message                                        |
| `TOAST_UI_OVERRIDES.md`     | Toast 样式覆盖                                                 |
| `ADAPTIVE_LAYOUT.md`        | 布局适配                                                       |
| `AUTH_AND_LOGIN_FLOW.md`    | 登录鉴权                                                       |
| `ENV_AND_RUNTIME.md`        | 环境变量、代理                                                 |
| `GOLDEN_SAMPLES/`           | 黄金样本                                                       |
| `SKILLS_WORKFLOWS.md`       | AI Skills 工作流程（Cursor + Antigravity 两步走、常用 Prompt） |
| `ANTIGRAVITY_UI_RULES.md`   | Antigravity Agent 专用 UI 规则                                 |

---

## ⚙️ 五、.cursor/ 与 .agent/

| 目录              | 职责说明               |
| ----------------- | ---------------------- |
| `.cursor/rules/`  | Cursor 强制规则        |
| `.cursor/skills/` | Cursor 操作流程        |
| `.agent/rules/`   | Antigravity Agent 规则 |
| `.agent/skills/`  | Antigravity Agent 流程 |

---

## 🔄 六、数据流与依赖关系概要

- **请求流**：View → Hook → API → Alova → 后端
- **状态流**：Store ↔ UI，部分 Store 持久化
- **路由流**：静态路由 + 动态路由 → routeUtils → 守卫 → meta.parent 选择布局
- **布局适配**：deviceStore → LayoutAdmin.runAdaptive() → layoutStore → 有效显隐

---

## 📖 延伸阅读

| 文档                                   | 说明                         |
| -------------------------------------- | ---------------------------- |
| [架构总览](./ARCHITECTURE_OVERVIEW.md) | 分层设计、设计原则、核心流程 |
| [技术栈详解](./TECH_STACK.md)          | 各项技术的版本与用途         |
| [项目协议](../PROJECT_PROTOCOL.md)     | 开发时需遵循的编码规范与约束 |
