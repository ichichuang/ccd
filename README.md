# Enterprise Vue3 管理后台脚手架（V2.1）

![Vue 3](https://img.shields.io/badge/Vue-3.5+-42b883?style=for-the-badge&logo=vue.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.8+-3178c6?style=for-the-badge&logo=typescript)
![Vite](https://img.shields.io/badge/Vite-7.3+-646CFF?style=for-the-badge&logo=vite)
![UnoCSS](https://img.shields.io/badge/UnoCSS-Design%20Engine-000000?style=for-the-badge&logo=unocss)
![pnpm](https://img.shields.io/badge/pnpm-10.28.2-F69220?style=for-the-badge&logo=pnpm)

这是一个面向企业级场景的 **AI-Native、强约束** Vue 3 后台管理模板：通过语义化 UnoCSS 设计引擎、Pinia 状态隔离与可验证的 HTTP/路由/RBAC 契约，把“开发约定”固化成“工程规则”，让 Cursor/Claude 的生成式协作更稳定、更可落地。

---

## 1. 标题与简介

本项目目标不是“再造轮子”，而是把一套经过沉淀的架构法则写进代码与规则中：

- 用语义短路（semantic shortcuts）替代任意样式自由度，避免风格漂移与暗黑/主题失配
- 用状态边界与“核爆式重置”策略清理登录会话与运行期残留
- 用 HTTP 拦截器与路由权限守卫实现可验证的 401/鉴权/动态路由链路
- 用 PrimeVue PT（Pass-Through）实现稳定主题继承，避免 scoped 覆盖打破设计引擎

---

## 2. 核心技术栈

### 核心框架

- Vue 3（Composition API + `<script setup>`）
- TypeScript（`^5.8.3`）
- Vite（`^7.3.1`）

### 状态与路由

- Pinia（`^3.0.3`，并启用 persistedstate + 加密序列化）
- Vue Router（`^4.4.5`）
- 动态路由（DynamicRouteManager）
- RBAC（`v-auth` 指令 + 权限守卫）

### UI 与样式

- UnoCSS Design Engine（语义化 semantic shortcuts + 主题/尺寸/材质系统）
- PrimeVue（`^4.5.4`）Styled Mode + 自定义 PT 预设
- PrimeIcons（`^7.0.0`）

### 图表

- ECharts（`^6.0.0`）
- `vue-echarts`（`^8.0.0`）
- 项目级封装：`<UseEcharts>` + `useChartTheme()`，确保深浅色、品牌色、网格线、tooltip 等随主题正确更新

### 工程化

- pnpm（严格使用 pnpm）
- ESLint、Prettier
- Husky + lint-staged
- Vitest（`pnpm test`）

网络层（HTTP client）

- alova（`^3.3.3`）
- 统一走拦截器链路：401 刷新/未授权触发由拦截器协调，不在业务代码复制逻辑

---

## 3. 环境要求

- Node.js：`>= 24.3.0`（来自 `package.json#engines.node`）
- 包管理器：**仅** `pnpm`
  - 最低：`>= 10.0.0`（来自 `package.json#engines.pnpm`）
  - 当前：`pnpm@10.28.2`（来自 `packageManager` 字段）

---

## 4. 快速开始

```bash
git clone <你的仓库地址>
cd <项目目录>
pnpm install
pnpm dev
pnpm build
```

---

## 5. 🛡️ V2.1 架构法则与规范系统

> 这一节是项目“能长期演进”的关键：规则并不只是文档，而是由 `.cursor/rules/` 与代码实现共同校验。

### 5.1 设计引擎（Design Engine）：语义化、闭集化、主题安全

- UnoCSS 样式以 **semantic shortcuts** 为唯一主入口（见 `src/design-engine/shortcuts/semanticShortcuts.ts`）
- 视觉约束以规则形式固化：
  - z-index 必须使用语义 token（`z-base/z-content/z-layout/z-overlay/z-popover/z-toast`），禁止任意值
  - 材质（Material）使用 `material-* / glass-*` 公共快捷入口，禁止直接使用内部原语（`glass-base`）
  - 关键动画与 GPU 相关约束（例如 glass 的使用边界）由规则强约束
- 禁止“生成式随意拼样式”导致的 UnoCSS purge/主题失配：避免动态拼接类名，保持静态字符串的语义组合

关于 `require()`：

- 项目确实在 **构建/引擎侧** 使用了 Node 的受控加载方式加载 iconify 图标数据（见 `src/design-engine/safelist/index.ts`，通过 `createRequire/_require` 读取 `@iconify-json/*/icons.json`）。
- 因此 README 对 `require()` 的描述应当理解为：它存在于“受控的工程/构建侧”，而不是业务运行时的样式/业务数据加载方案。

### 5.2 状态管理（State Management）：数据流隔离 + “核爆式重置”

状态与 API 的不可变数据流：

`src/api/** → src/hooks/modules/use*.ts → src/stores/** → src/views/**`

Pinia store 的硬约束（防止状态泄漏/越权）：

- Store 绝不直接发起 HTTP（API 调用必须在 composable/Hook 编排完成）
- Store 绝不直接依赖 vue-router 导航
- 不同状态只允许一个 owner，避免跨 store 写入

核爆式重置（Nuclear Reset）的落地方式（重点两条链路）：

1. 401/未授权触发链路（HTTP → 未授权回调 → reload）
   - `src/utils/http/interceptors.ts`：`TokenRefreshCoordinator` 协调刷新；刷新失败/未授权条件触发 `triggerUnauthorized()`
   - `src/infra/auth/tokenProvider.ts`：提供 `setOnUnauthorized()` 注入点
   - `src/main.ts`：注入回调中会 `await useUserStoreWithOut().logout()`，随后执行 `window.location.reload()`（物理刷新清理运行期 SPA 状态与内存残留）

2. 用户显式退出链路（UI → logout 清理 → replace('/login') → reload）
   - `src/stores/modules/user.ts`：`logout()` 只做状态与持久化清理，不负责导航
   - `src/layouts/components/User/index.vue`：退出按钮逻辑 `await userStore.logout()` 后执行 `router.replace('/login')`，并在 replace 完成后 `window.location.reload()`，完成核爆式重置落地

这两条链路共同确保：登录态/主题/全局状态不会在退出后“残留污染”到登录页或后续会话。

### 5.3 组件通信与复杂对象边界：类型安全 + shallowRef

- Vue 组件结构与宏声明顺序由规则约束（`defineOptions`/`defineProps`/`defineEmits`/`defineModel`/`defineSlots`/业务逻辑/最后才 `defineExpose`）
- 对复杂外部对象（例如图表实例、外部库对象）使用 `shallowRef` 或封装组件管理边界，避免 Vue 深代理带来的性能与生命周期问题
- 图表必须通过主题系统注入（见下方 5.4）

### 5.4 路由与 RBAC：DynamicRouteManager + `v-auth` + 元信息契约

规则要点（可落地的禁令与约束）：

- 动态路由注册必须走 DynamicRouteManager（禁止业务里直接 `router.addRoute/removeRoute`）
- 权限检查必须走 `v-auth` 指令或 `useAuth()`，禁止在模板里写 ad-hoc 权限字符串判断
- 未登录重定向逻辑由权限守卫统一处理：
  - `src/router/utils/permission.ts`：当未登录且不在白名单时，重定向到 `/login?redirect=${encodeURIComponent(to.fullPath)}`
- 路由 meta 必须完整（title/parent/rank/roles/auths/keepAlive 等），缺失会导致守卫失败

### 5.5 HTTP 契约：alova 拦截器协调 401，不在业务复制逻辑

- HTTP client 必须使用项目的 alova 实例（由拦截器完成鉴权、401 刷新与错误通知）
- 业务代码通过 `useHttpRequest()` 消费，拦截器已完成：
  - 401 token 刷新与请求队列重放
  - 未授权触发（由注入回调完成 logout + reload）
  - 业务错误 success=false 的标准化抛错与错误类型映射

### 5.6 UI/组件主题系统：PrimeVue PT 与 ECharts 主题联动

- PrimeVue 的视觉定制必须走 PT（Pass-Through）系统，禁止 scoped 样式覆盖打破主题继承
- 图表必须通过 `useChartTheme()` 注入主题契约：
  - `useChartTheme()` 把文本/网格线/tooltip 背景/品牌色等映射到 ECharts option 中，并随主题切换保持响应
  - `<UseEcharts>` 负责渲染与生命周期边界（例如内部 ref 维护与注册逻辑），业务侧只提供“数据/结构”，不直接写颜色/字体等主题变量

### 5.7 链路可视化（401 与退出核爆式重置）

```mermaid
flowchart TD
User[请求触发 401/未授权] --> Interceptor[HTTP 拦截器]
Interceptor --> TokenRefresh[TokenRefreshCoordinator]
TokenRefresh -->|刷新成功| Retry[队列请求重放]
TokenRefresh -->|刷新失败| Unauthorized[triggerUnauthorized()]
Unauthorized --> Injected[注入回调: logout() + window.location.reload()]

User --> LogoutBtn[用户点击退出]
LogoutBtn --> StoreLogout[store.logout() 清理状态/持久化]
StoreLogout --> ReplaceLogin[router.replace('/login')]
ReplaceLogin --> Reload[window.location.reload()]
```

---

## 6. 🤖 AI 辅助开发指南

### 6.1 `.cursor/rules` 是 AI Supreme Law

本项目为 Cursor/Claude 准备了“可执行的架构真理源”：

- `.cursor/rules/` 下的 Guardrails/Laws 强约束样式、组件、网络、路由、状态与类型边界
- 规则覆盖了常见 AI 幻觉来源（例如任意 z-index、scoped 覆盖 PrimeVue、在 store 里发请求、重复 toast、绕过动态路由系统等）

### 6.2 本地 AI 技能安装与 Git/提交清洁策略

- `.cursor/skills` 与 `.claude/skills` 用于本地安装 AI 专项能力
- 它们在 `.gitignore` 中被忽略，以保证技能内容不会进入 Git 提交
- 同时 `repair_list.txt` 也被忽略，用于本地“修复/验收看板”（不影响仓库历史干净度）

---

## 最后：文档自检建议（写作/维护时）

- 依赖与脚本以 `package.json` 为唯一来源
- 架构法则以 `.cursor/rules/**/*.mdc` 为唯一来源
- 链路描述必须能在对应实现文件定位到（例如 401/未授权回调链路与核爆式 reload 落地点）
