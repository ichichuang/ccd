# CCD Desktop 开发与治理白皮书

## 基座架构参考

本手册只讲桌面端独有能力。

- 通用 Web 架构、状态分层、UI 基座、通用组件规范：请参考 `main` 分支
  - <https://github.com/ichichuang/ccd/blob/main/README.md>
  - <https://github.com/ichichuang/ccd/blob/main/docs/architecture.md>
- 当前文档聚焦：
  - `windowAdapter` 跨端窗口能力
  - Tauri 安全沙箱与 Capability
  - `isDesktop()` 环境探针与 WebView 渲染降级
  - 桌面构建、同步、调试与漂移治理

---

## 1. 跨端窗口适配器

### 设计目标

业务层不应该再自己区分：

- Web 原生新窗口能力
- Tauri 原生子窗口能力
- Web 原生全屏能力
- Tauri 原生窗口全屏能力

这些差异统一收敛到 `src/utils/windowAdapter.ts`。

### 统一能力

`windowAdapter` 当前提供四类核心能力：

- `openLink(url)`
  - Web：浏览器新标签页打开
  - Tauri：通过 `@tauri-apps/plugin-shell` 调系统默认浏览器
- `openRoute(options)`
  - Web：根据 `windowMode` 决定当前路由或新窗口
  - Tauri：根据 `windowMode` 创建或复用 `WebviewWindow`
- `isFullscreen()`
  - Web：读取浏览器真实全屏状态
  - Tauri：读取原生窗口真实全屏状态
- `toggleFullscreen()`
  - Web：切换 DOM 全屏
  - Tauri：切换原生窗口全屏

### 推荐调用方式

#### 外链

```ts
import { windowAdapter } from '@/utils/windowAdapter'

await windowAdapter.openLink('https://docs.example.com')
```

#### 新开业务子窗口

```ts
import { windowAdapter } from '@/utils/windowAdapter'

await windowAdapter.openRoute({
  route: {
    name: 'ReportPreview',
    path: '/report/preview',
    meta: {
      title: 'Report Preview',
      windowMode: 'new-window',
      reuseWindow: true,
    },
  },
  query: { id: 'report-001' },
})
```

#### 响应式全屏按钮

```ts
import { useWindowAdapter } from '@/utils/windowAdapter'

const { isFullscreen, toggleFullscreen } = useWindowAdapter()

await toggleFullscreen()
console.log(isFullscreen.value)
```

### 路由契约

`goToRoute` 不再猜测窗口行为。

- 使用 `meta.windowMode`
  - `'current'`
  - `'new-window'`
  - `'external'`
- 使用 `meta.reuseWindow` 决定新窗口是否可复用
- 路由名解析失败时直接 `console.warn`，不再偷偷降级为 path

这意味着窗口行为现在是显式契约，而不是隐式副作用。

---

## 2. 安全沙箱与权限控制

### Capability 规则

桌面权限定义位于 `src-tauri/capabilities/default.json`。

当前只保留桌面端真实使用到的能力：

- `core:window:default`
- `core:webview:default`
- `core:window:allow-create`
- `core:webview:allow-create-webview-window`
- `shell:allow-open`
- `window-state:default`

新增 Capability 时必须遵守两条规则：

1. 先证明业务真的需要该原生能力
2. 只加最小权限，不要一次性放开整组宽泛权限

### Shell 打开限制

`src-tauri/tauri.conf.json` 中已经收紧：

```json
"plugins": {
  "shell": {
    "open": "https?://\\S+"
  }
}
```

这意味着桌面端外链只允许 `http/https`，不能把任意协议开放给 shell。

### CSP 铁律

`src-tauri/tauri.conf.json` 使用严格 CSP，核心要求是：

- `script-src 'self'`
- 禁止内联 `<script>`
- 禁止 `onclick=` 等内联事件
- 样式允许 `unsafe-inline` 仅用于现有运行时样式策略，不代表脚本也可放宽

开发规则：

- 页面初始化逻辑放到 `src/**` 模块文件里
- 事件绑定使用框架事件或 `addEventListener`
- 不要在 HTML 字符串里注入可执行脚本

如果你改了前端引导或错误回退逻辑，先检查是否会破坏 CSP 自洽性。

---

## 3. 环境探针与渲染降级

### `isDesktop()` 的作用

`src/utils/env.ts` 提供：

```ts
export const isDesktop = (): boolean => isTauri()
```

它是业务与基础设施判断桌面环境的唯一轻量入口。

适合使用 `isDesktop()` 的场景：

- 选择 Web / Tauri 窗口实现
- 选择桌面端性能降级策略
- 选择桌面端特有交互增强

不适合的场景：

- 在业务组件里散落大量平台分支
- 直接绕过 `windowAdapter` 调原始 API

### 为什么桌面端要做动画降级

`src/layouts/components/AnimateRouterView.vue` 中，当桌面环境命中默认的 `cinematic-fade` 时，会降级成 `fade-slide`。

原因不是视觉喜好，而是 WebView 成本：

- `blur` / `filter` 在桌面 WebView 中更容易引发掉帧
- 路由切换是高频操作，不能默认绑定高成本滤镜
- 桌面端要优先保证持续稳定的 60fps 体验

开发要求：

- 如果动画含 `blur`、重阴影、大面积滤镜，先评估桌面端性能
- 需要桌面端专属动画时，优先做“同语义、低成本”的替代方案

---

## 4. 构建与调试链路

### `pnpm dev:desktop` 实际做了什么

入口命令：

```bash
pnpm dev:desktop
```

执行顺序：

1. `predev`
2. `pnpm sync:version`
3. `pnpm sync:desktop-config`
4. `tauri dev`
5. Tauri 再根据 `src-tauri/tauri.conf.json` 的 `beforeDevCommand` 启动 `pnpm dev`
6. Vite 提供 `http://localhost:8088`
7. Rust 侧创建桌面窗口并连接到该前端地址

### 构建链路

```bash
pnpm build:desktop
```

执行顺序：

1. `prebuild`
2. `pnpm sync:brand`
3. `pnpm sync:version`
4. `pnpm sync:desktop-config`
5. `tauri build`
6. `beforeBuildCommand` 执行 `pnpm build`
7. Rust / Tauri 组装平台安装包

### 如何调试 Rust 后端逻辑

Rust 入口：

- `src-tauri/src/main.rs`
- `src-tauri/src/lib.rs`

当前行为：

- `main.rs` 只负责转发到 `app_lib::run()`
- `lib.rs` 在 debug 构建下启用了 `tauri-plugin-log`
- 默认日志级别为 `Info`

推荐调试方式：

1. 保持 `pnpm dev:desktop` 持续运行
2. 在运行该命令的终端观察 Rust 输出
3. 需要额外日志时，在 `src-tauri/src/lib.rs` 或相关 Rust 模块中加入 `log::info!`、`log::warn!`、`log::error!`
4. 如需更细粒度排查，可临时提高 debug 日志级别后再恢复

这条链路的原则是：

- 前端逻辑在浏览器开发者工具中观察
- Rust / Tauri 逻辑在启动终端与插件日志中观察

---

## 5. 漂移治理清单

桌面端提交前至少执行：

```bash
pnpm type-check
pnpm ai:doctor
pnpm check:drift
```

当你修改以下内容时，还应补跑：

- 修改 `.ai/**`
  - `pnpm ai:sync`
  - `pnpm ai:sync:codex`
- 修改版本、品牌、Tauri 配置
  - `pnpm sync:version`
  - `pnpm sync:desktop-config`

### 自检重点

- 有没有绕过 `windowAdapter` 直接调用原始窗口 API
- 有没有新增不必要的 Capability
- 有没有在 HTML / Vue 模板里引入内联脚本或内联事件
- 有没有给桌面端带回高成本 `blur` 动画
- 有没有修改源文件却忘记同步 AI 适配层

---

## 6. 最后原则

桌面分支不是 Web 分支文档的复制品。

它应该只回答四个问题：

1. 这项能力在桌面端如何桥接
2. 这项能力在 Tauri 沙箱里如何受控
3. 这项能力在 WebView 环境下如何避免性能退化
4. 这项能力在交付链路里如何防止漂移

如果一段文档不能回答这四个问题中的任意一个，它大概率不属于当前分支。
