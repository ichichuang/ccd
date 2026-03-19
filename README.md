# Enterprise Vue 3 Admin Template

一个基于 **Vue 3 + TypeScript + Vite + PrimeVue v4 + UnoCSS + Pinia + Alova** 的企业级中后台管理模板，用于快速搭建高质量的后台管理系统。

> 本仓库是通用模板，不绑定具体业务或公司名称，适合作为新项目的起步脚手架。

---

## ✨ 核心特性

- **现代技术栈**
  - Vue 3 `<script setup>` + TypeScript 严格模式
  - Vite 7 构建，开发体验与构建速度兼顾
  - PrimeVue v4（Unstyled 模式）+ UnoCSS 语义化原子类
  - Pinia 3 状态管理，Alova HTTP 请求封装

- **企业级架构**
  - 清晰的目录结构与分层：`api → hooks → stores → views`
  - 模块化路由，动态路由与权限体系
  - 严格的编码规范与 ESLint + vue-tsc 校验
  - 通过 `CLAUDE.md` 与 `.cursor/rules` 固化的工程规范

- **高级表单 / 表格引擎**
  - **ProForm**：完全 schema 驱动的企业级表单引擎（依赖、可见性、校验、动态字段、插件化字段注册）
  - **ProTable**：schema 驱动的数据表格引擎（列配置、渲染函数、筛选器等），与 ProForm 协同

- **设计系统与 UI 规范**
  - 语义化颜色系统与统一的设计 Tokens（颜色、尺寸、间距、圆角、阴影）
  - UnoCSS 自定义 shortcuts（如 `surface-elevated`、`layout-stack`、`interactive-hover-card`）
  - PrimeVue 组件统一通过 `pt` 属性接入设计系统，未使用官方主题 CSS
  - Icon 体系统一通过 `Icons` 组件管理（Lucide / Solar / Phosphor / Logos）

- **工程体验**
  - CI 检查：类型检查 + 严格 Lint + 生产构建
  - Husky + lint-staged 提交前自动检查
  - 统一的 API 规范与分层：`src/api` + `src/hooks/modules` + `src/stores`

---

## 🚀 快速开始

### 环境要求

根据 `package.json` 与 `.nvmrc` 要求：

- **Node.js ≥ 24.3.0**
- **pnpm ≥ 10.0.0**（仓库中 `packageManager` 为 `pnpm@10.28.2`，建议使用相同版本）

本地常用操作（在你自己的终端执行）：

```bash
# 使用 nvm（如已安装）切换 Node 版本
nvm use 24.3.0

# 查看 pnpm 版本
pnpm -v
```

### 安装与启动

```bash
# 安装依赖
pnpm install

# 启动开发服务器
pnpm dev
```

### 常用脚本

| 命令              | 说明                                      |
| ----------------- | ----------------------------------------- |
| `pnpm dev`        | 启动开发服务器                            |
| `pnpm dev:demo`   | 启动带 Demo/展示配置的开发服务器          |
| `pnpm build`      | 生产构建（先 vue-tsc 再 Vite 构建）       |
| `pnpm preview`    | 本地预览构建产物                          |
| `pnpm type-check` | 严格类型检查（`vue-tsc --build --force`） |
| `pnpm lint`       | ESLint 检查                               |
| `pnpm lint:fix`   | ESLint 检查并自动修复                     |
| `pnpm check`      | 类型检查 + Lint 综合校验                  |
| `pnpm test`       | 运行 Vitest 测试                          |

> CI 中使用 Node 24.3.0 + pnpm 10 运行 `pnpm install --frozen-lockfile`、`pnpm type-check`、`pnpm lint:check` 与 `pnpm build`。

---

## 📁 目录结构概览

项目主要结构如下（精简版）：

```text
.
├── build/                    # 构建与打包相关配置
├── docs/                     # 项目文档与架构说明
│   ├── README.md             # 文档入口
│   ├── QUICK_START.md        # 快速上手说明
│   ├── DEPLOYMENT.md         # 部署指南
│   ├── architecture/         # 架构与目录设计
│   │   ├── ARCHITECTURE_OVERVIEW.md
│   │   ├── DIRECTORY_STRUCTURE.md
│   │   └── TECH_STACK.md
│   └── ai-specs/             # 设计系统 & 规范（AI/人类共用）
│       ├── PROJECT_PROTOCOL.md
│       ├── BUILD_SYSTEM.md
│       ├── PRIMEVUE_V4_API.md
│       ├── UNOCSS_AND_ICONS.md
│       ├── ADAPTIVE_LAYOUT.md
│       ├── PRO_FORM_ENGINE_ARCHITECTURE.md
│       ├── PRO_FORM_INTEGRATION_GUIDE.md
│       ├── PRO_TABLE_ENGINE_ARCHITECTURE.md
│       └── PRO_TABLE_INTEGRATION_GUIDE.md
├── src/
│   ├── api/                  # API 定义（严格的 module/feature 结构）
│   ├── assets/               # 静态资源
│   ├── components/           # 通用组件（ProForm、ProTable、UseEcharts、Icons 等）
│   ├── constants/            # 设计系统常量、路由常量等
│   ├── hooks/                # 组合式逻辑（useXxx 系列）
│   ├── layouts/              # 布局壳（Admin 布局、全屏布局等）
│   ├── locales/              # 国际化配置
│   ├── plugins/              # Vite / Vue 插件初始化
│   ├── router/               # 路由配置与动态路由工具
│   ├── stores/               # Pinia stores
│   ├── types/                # 全局与领域类型定义
│   ├── utils/                # 工具函数与适配层（HTTP、日期、存储等）
│   └── views/                # 页面视图（按业务域划分）
├── uno.config.ts             # UnoCSS 配置（tokens 与 shortcuts）
├── CLAUDE.md                 # 项目 AI / 架构总说明（强制规范）
└── package.json
```

---

## 🧩 核心架构概览

### 1. 分层与依赖方向

推荐调用链路：

`src/api/**` → `src/hooks/modules/useXxx.ts` → `src/stores/**` → `src/views/**`

约束摘录（详细见 `CLAUDE.md` 与 `.cursor/rules`）：

- **API 层**：`src/api/<module>/<feature>.ts`，两级目录，不允许更深嵌套
  - 定义 DTO 类型（`<Domain><Feature>Req/Res/DTO`）
  - 暴露方法构造器：`build<Domain><Feature>Method`
  - 可选包装请求方法：`request<Domain><Feature>`
  - 禁止使用 `fetch` / `axios`，统一走 Alova 实例（`@/utils/http`）

- **Hooks 层**：`src/hooks/modules/useXxx.ts`
  - 使用 `useHttpRequest` 消费 API，并输出业务友好的状态（loading、data、error）

- **Stores 层**：`src/stores/**`
  - Pinia store 只管理状态与业务行为
  - 禁止直接调用 API 或操作路由（使用 hooks / router helper）

- **Views 层**：`src/views/**`
  - 只负责布局和页面组合，不直接持有 URL / DTO 细节

### 2. 表单与表格（Schema 驱动）

- **ProForm**
  - 通过 `FormSchema` 描述字段、分组、依赖、可见性和校验规则
  - 引擎核心与渲染层解耦：`engine/**` 不依赖 PrimeVue/DOM
  - 支持 `visibleIf` / `disabledIf` / `requiredIf` / `computed` / `options` 等逻辑
  - 提供 `useForm`、`useField`、`useFieldArray` 等组合式 API

- **ProTable**
  - 列配置与渲染函数通过 `.tsx` 配置文件定义，支持 TSX VNode 渲染
  - 与 ProForm 协同构建查询 + 列表的一体化体验

### 3. 设计系统与 UnoCSS

- 颜色语义来源：`src/constants/theme/colorUsage.ts`
- 强制禁止使用任意 `px/rem` 和硬编码颜色；全部用设计 Tokens 与 UnoCSS shortcuts
- 布局与密度通过诸如 `layout-stack`、`density-normal`、`surface-elevated`、`interactive-hover-card` 等 shortcut 管理
- 所有滚动区域必须使用 `CScrollbar`，所有 Icon 必须使用 `Icons` 组件

---

## 📚 文档导航

建议阅读顺序（开发者上手）：

1. **整体概览**
   - `docs/README.md`
   - `docs/QUICK_START.md`
   - `docs/architecture/ARCHITECTURE_OVERVIEW.md`
   - `docs/architecture/DIRECTORY_STRUCTURE.md`
   - `docs/architecture/TECH_STACK.md`

2. **AI / 规范协议（人类同样受益）**
   - `CLAUDE.md`（强制架构规则与关键文件索引）
   - `docs/ai-specs/PROJECT_PROTOCOL.md`（整体协议与工作方式）
   - `docs/ai-specs/BUILD_SYSTEM.md`（构建系统与自动导入）
   - `docs/ai-specs/TYPESCRIPT_AND_LINTING.md`（TS 严格模式与 Lint）

3. **设计系统与 UI**
   - `docs/ai-specs/UNOCSS_AND_ICONS.md`
   - `docs/ai-specs/PRIMEVUE_THEME.md`
   - `docs/ai-specs/PRIMEVUE_V4_API.md`
   - `docs/ai-specs/SEMANTIC_UI_GOLDEN_RULES.md`
   - `docs/ai-specs/ADAPTIVE_LAYOUT.md`
   - `docs/ai-specs/LOADING_SYSTEM.md`
   - `docs/ai-specs/EMPTY_STATE_AND_ROBUSTNESS.md`
   - `docs/ai-specs/FOCUS_AND_OUTLINE_STYLING.md`

4. **表单 / 表格 / 图表**
   - `docs/ai-specs/PRO_FORM_ENGINE_ARCHITECTURE.md`
   - `docs/ai-specs/PRO_FORM_INTEGRATION_GUIDE.md`
   - `docs/ai-specs/PRO_TABLE_ENGINE_ARCHITECTURE.md`
   - `docs/ai-specs/PRO_TABLE_INTEGRATION_GUIDE.md`
   - `docs/ai-specs/ECHARTS_THEME.md`

5. **认证与路由**
   - `docs/ai-specs/AUTH_AND_LOGIN_FLOW.md`
   - `docs/ai-specs/LAYOUT_ARCHITECTURE.md`
   - `docs/ai-specs/ENTERPRISE_GUARDRAILS.md`

---

## 🔧 开发规范摘要

详细规范请参考 `CLAUDE.md` 与 `.cursor/rules/*.md`，这里只列几个关键点：

- 所有组件使用 **Composition API + `<script setup lang="ts">`**（需要 TSX 时使用 `lang="tsx"`）
- 禁止在 `<template>` 中写任何 TypeScript 语法（`as`、泛型等）
- 禁止在业务代码中使用 `any`，类型必须明确
- 禁止手动 `import { ref, computed } from 'vue'` 或 PrimeVue 组件（自动导入已配置）
- 需要程序化渲染（VNode/Render 函数）时 **必须使用 TSX**，禁止使用 `h()` 与 `resolveComponent()`
- 路由只允许在 `src/router/modules/*.ts` 中静态定义；动态路由通过 `DynamicRouteManager` 管理
- 数据修改必须遵守不可变性原则（不要原地 `sort` / `splice`）

---

## 📄 License

本仓库作为企业内部或自用模板，请根据实际使用场景补充许可证说明（例如 MIT、私有协议等）。

> 建议：如果需要对外开源或在公司内部推广，请在根目录新增或补充 `LICENSE` 文件，并在本节明确授权条款。
