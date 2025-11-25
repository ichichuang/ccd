# 全局配置

## 全局防抖/节流配置说明

定义位置：`src/constants/modules/layout.ts`

- `STRATEGY`: 全局默认策略（'debounce' | 'throttle'）
- `INTERVAL`: 全局默认触发间隔（毫秒）

使用位置（文件相对位置: 作用）

- `src/layouts/components/AppContainer.vue`: useElementSize 与滚动位置持久化
- `src/layouts/components/AppTabs.vue`: useElementSize
- `src/layouts/components/AppTopMenu.vue`: 侧边栏折叠切换
- `src/layouts/components/app-sidebar/AppSidebar.vue`: 折叠状态更新
- `src/components/modules/scrollbar-wrapper/ScrollbarWrapper.vue`: getThrottleFunction ；滚动结束检测/保存滚动位置
- `src/components/modules/use-echarts/UseEcharts.vue`: 图表自适应 resizeHandler ；容器变化监听 delay
- `src/layouts/index.vue`: 窗口 resize 固定防抖 300ms（特殊例外，不走全局配置）

导入约定（统一即可）

- 防抖/节流：`import { debounce, throttle } from '@/common'`
- 全局配置：`import { STRATEGY, INTERVAL } from '@/constants/modules/layout'`

## Mitt 事件说明

此框架封装了 `mitt`（轻量级事件总线），封装文件：`src/utils/modules/mitt.ts`。

- 使用方式：`const { on, off, emit, onAll, offAll, clear, getAll } = useMitt()`
- 主要 API：
  - `on(type, handler)`：监听事件
  - `off(type, handler?)`：移除监听
  - `emit(type, payload?)`：触发事件
  - `onAll(handler)` / `offAll(handler?)`：监听/移除所有事件
  - `clear()`：清空所有事件监听
  - `getAll()`：获取所有事件监听器 Map

### 已抛出的事件（实际使用）

- `windowResize`: `src/layouts/index.vue` 抛出；`src/stores/modules/postcss.ts`、`src/stores/modules/size.ts` 监听

## 工具与基础模块说明（文件相对位置: 作用）

- `src/utils/modules/deviceInfo.ts`: 运行时采集设备与屏幕信息（类型、系统、方向、页面/物理尺寸、导航/底部栏预估等）
- `src/utils/modules/moduleLoader.ts`: 通用模块自动导入（支持异步 `autoImportModules` 与同步 `autoImportModulesSync`）
- `src/utils/modules/env.ts`: 环境变量访问与校验（类型安全 `env.*`、`isDev/isProd`、`EnvValidator` 验证）

## Hooks 使用说明（文件相对位置: 作用）

### layout 目录

- `src/hooks/layout/useFull.ts`: 全屏开关与状态管理（进入/退出全屏、状态响应）
- `src/hooks/layout/usePageTitle.ts`: 动态页面标题管理（根据路由元信息与 i18n 设置 `document.title`）
- `src/hooks/layout/useLoading.ts`: 页面/区域加载状态控制（开始/结束/自动超时）
- `src/hooks/layout/useNprogress.ts`: 顶部进度条控制（启动/结束、路由切换集成）

### modules 目录

- `src/hooks/modules/useChartTheme.ts`: ECharts 主题与图表配置增强（动画、坐标轴、工具箱、标记点/线等默认合并）
- `src/hooks/modules/useDateUtils.ts`: 日期处理工具（格式化、区间、解析、偏移、校验等）
- `src/hooks/modules/useElementSize.ts`: 元素尺寸监听（基于 ResizeObserver，支持防抖/节流策略）
- `src/hooks/modules/useLocale.ts`: i18n 使用封装（`t/$t`、切换语言、辅助状态如 RTL）

> 说明：`windowResize` 事件用于跨模块同步窗口变化，避免各处重复绑定 `resize` 监听。

### 预置事件类型（类型声明，供扩展）

在 `src/utils/modules/mitt.ts` 中声明了可用的事件类型（部分节选）：

- 全局：`appLoading`、`appError`、`appSuccess`、`appNotification`
- 用户：`userLogin`、`userLogout`、`userProfileUpdate`
- 路由：`routerBeforeRoute`、`routerAfterRoute`
- 组件通信：`componentRefresh`、`componentClose`、`componentOpen`
- 数据：`dataRefresh`、`dataUpdate`、`dataDelete`
- 主题：`themeChange`、`themeToggle`
- 语言：`localeChange`、`localeReload`
- 布局：`layoutSidebarToggle`、`layoutSidebarCollapse`、`layoutFullscreen`

这些事件目前为类型声明，具体是否使用以项目代码为准，推荐统一使用 `useMitt()` 进行触发与监听。
