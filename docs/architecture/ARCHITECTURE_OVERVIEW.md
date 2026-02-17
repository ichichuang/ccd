# 🏗️ 架构总览

> 本文档介绍 CCD 项目的整体架构设计、分层原则与核心流程，帮助开发者快速理解项目结构。

---

## 📐 设计原则

### 逻辑与 UI 分离

| 层级           | 职责                                          | 位置              |
| -------------- | --------------------------------------------- | ----------------- |
| **Views**      | 页面容器，仅组合 hooks + components           | `src/views/`      |
| **Components** | 纯 UI 组件，负责渲染与简单 UI 状态            | `src/components/` |
| **Hooks**      | 业务逻辑（Composables），数据处理、请求、状态 | `src/hooks/`      |

> 💡 **原则**：Views 不做业务逻辑，Components 不直接调 API，逻辑统一下沉到 Hooks。

### 类型安全

- 业务代码**严禁 `any`**，类型定义放在 `src/types/` 或与文件同级
- 边界封装层（如 useHttpRequest、safeStorage、UseEcharts）有受控例外
- 显式类型注解：`ref<Type>`、`computed<Type>` 等

### 单一真理来源（SSOT）

- **API 定义** → `src/api/`，禁止在 views/components 中写 URL
- **常量与配置** → `src/constants/`
- **类型定义** → `src/types/`

---

## 🧱 架构分层

```
┌─────────────────────────────────────────────────────────────┐
│                     Views (页面层)                            │
│   src/views/  —  仅组合 hooks + components，无业务逻辑         │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                  Components (组件层)                          │
│   src/components/  —  纯 UI，DataTable / SchemaForm / Icons   │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                   Hooks (逻辑层)                              │
│   src/hooks/  —  业务逻辑、请求封装、状态组合                  │
└─────────────────────────────────────────────────────────────┘
                              │
          ┌───────────────────┼───────────────────┐
          ▼                   ▼                   ▼
┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│   API 层     │    │   Store 层   │    │   Utils 层   │
│  src/api/    │    │ src/stores/  │    │  src/utils/  │
│  DTO+Method  │    │   Pinia      │    │  工具函数    │
└──────────────┘    └──────────────┘    └──────────────┘
          │                   │                   │
          └───────────────────┼───────────────────┘
                              ▼
┌─────────────────────────────────────────────────────────────┐
│            Constants & Types (常量与类型层)                    │
│   src/constants/  +  src/types/                              │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔄 核心数据流

### 请求流

```
View 调用 Hook  →  Hook 调用 API  →  API 使用 Alova  →  后端
                      ↓
              (useHttpRequest 可选)
```

### 状态流

```
Store (Pinia)  ←→  UI
       ↓
  persist（部分 Store 加密持久化）
```

### 路由流

```
静态路由 (router/modules)  +  动态路由 (后端返回)
                ↓
         routeUtils（菜单树、面包屑、keepAlive）
                ↓
         Vue Router + 权限守卫
                ↓
         meta.parent  →  选择布局壳 (Admin / FullScreen / Ratio)
```

### 布局适配流

```
deviceStore 变化（设备类型、断点、视口）
                ↓
     LayoutAdmin.runAdaptive()  （唯一驱动入口）
                ↓
     layoutStore（mode、侧栏收展、显隐）
                ↓
     有效显隐 → 渲染 AdminSidebar / AdminTabsBar 等
```

---

## 📁 目录职责速览

| 目录              | 职责                                          |
| ----------------- | --------------------------------------------- |
| `src/api/`        | 接口定义 SSOT，DTO + Method 构建              |
| `src/components/` | 通用 UI 组件                                  |
| `src/constants/`  | 常量与配置（断点、主题、尺寸、布局等）        |
| `src/hooks/`      | 组合式逻辑（layout 相关 + 业务 modules）      |
| `src/layouts/`    | 布局壳（Admin / FullScreen / Ratio）          |
| `src/plugins/`    | 应用插件（i18n、router、stores、PrimeVue 等） |
| `src/router/`     | 路由定义、守卫、工具                          |
| `src/stores/`     | Pinia 状态                                    |
| `src/types/`      | 全局类型定义                                  |
| `src/utils/`      | 工具函数（http、safeStorage、theme 等）       |
| `src/views/`      | 页面组件                                      |

---

## 🎯 设计系统

项目内置完整设计系统，开发时需遵循的规范详见 `docs/` 根目录下的相关文档：

| 系统                 | 说明                                 | 相关文档                              |
| -------------------- | ------------------------------------ | ------------------------------------- |
| **主题系统**         | 亮/暗模式、预设、PrimeVue 融合       | `PRIMEVUE_THEME.md`                   |
| **尺寸系统**         | 响应式尺寸阶梯、根字号、布局变量     | `uno.config.ts` + `constants/size.ts` |
| **布局系统**         | 断点、PC/平板/移动端适配、有效显隐   | `ADAPTIVE_LAYOUT.md`                  |
| **ECharts 主题系统** | UseEcharts、useChartTheme 图表主题化 | `ECHARTS_THEME.md`                    |
| **安全存储**         | 加密、压缩、Pinia 序列化             | `PROJECT_PROTOCOL.md` §8.4.7          |

---

## 📚 延伸阅读

- [技术栈详解](./TECH_STACK.md) — 各技术选型与版本
- [目录结构](./DIRECTORY_STRUCTURE.md) — 逐文件职责说明
- [项目协议](../PROJECT_PROTOCOL.md) — 开发时需遵循的编码规范与约束（详见 `docs/` 根目录）
