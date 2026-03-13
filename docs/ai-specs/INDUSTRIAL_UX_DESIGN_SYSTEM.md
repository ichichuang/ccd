# Industrial UX Design System（工业级 UX 设计系统）

> **目标读者：AI**。本文档供 AI 在生成工业监控/仪表盘类页面时参照。
> 颜色/尺寸/布局语义以 `src/constants/theme/colorUsage.ts`、`uno.config.ts`、`.cursor/rules/20-ui-styling.mdc` 为 SSOT；本文档仅做场景化落地说明。

## 1. 核心布局哲学：桌面应用感，而非普通网页

- **无全局页面滚动**：浏览器窗口不得产生全局滚动；页面内容在局部区域内滚动。
- **Golden Flex 骨架**：每个新页面根节点 MUST 使用 `<div class="h-full flex flex-col overflow-hidden">`。
- **固定 Chrome**：Toolbar、Filter、Tab 头 MUST 使用 `shrink-0` 保持可见。
- **局部滚动**：主内容区（Cards、Lists、Logs）MUST 使用 `flex-1 min-h-0` 配合 `<CScrollbar>`（见 `.cursor/rules/18-components-and-icons.mdc`），禁止 `overflow-auto`。

## 2. 视觉层级与排版

- **数据优先**：关键数值、实时数据为主角，使用 `font-mono fs-3xl font-bold text-foreground`。
- **标签弱化**：数据点名称、单位不得喧宾夺主，使用 `fs-sm text-muted-foreground`。
- **卡片式 UI**：逻辑相关的内容用 PrimeVue `<Card>` 或 UnoCSS equivalent：`bg-card component-border rounded-scale shadow-sm`；卡片需轻微 hover 效果，使用 `interactive-hover` 或 `behavior-hover-transition`。
- **渐进式披露 (Progressive Disclosure)**：界面默认必须保持极简（极低认知负荷）。高级、低频或具有破坏性的设置项**必须**隐藏在「高级选项」开关、PrimeVue `<Accordion>` 折叠面板或次要 Tab 之后。禁止在一屏内平铺复杂表单字段而没有任何逻辑分组或隐藏机制。

## 3. 工业状态色（严格语义）

遵循 `src/constants/theme/colorUsage.ts` 及 `.cursor/rules/21-color-semantic-usage.mdc`，禁止 hex 与 raw Tailwind 色：

| 状态            | 语义 Token       | 示例                                           |
| --------------- | ---------------- | ---------------------------------------------- |
| 故障/严重       | danger           | `text-danger`、`bg-danger/10`、`border-danger` |
| 警告            | warn             | `text-warn`、`bg-warn/10`                      |
| 运行/开/激活    | primary          | `text-primary`、`bg-primary/10`                |
| 正常/健康       | success          | `text-success`                                 |
| 离线/Standby/关 | muted-foreground | `text-muted-foreground`                        |

**禁止**：`text-red-500`、`bg-blue-500`、`text-muted-color`、`text-surface-400` 等非语义类。

## 4. PrimeVue 组件最佳实践

- **Tabs**：Tab 头 MUST 含语义图标（如 `i-lucide-settings`），降低认知负担。
- **Button**：主操作（Save、Deploy）用标准 `<Button>`；次要/ destructive 用 `severity="secondary"` 或 `severity="danger"`。

## 5. 防呆与反馈

- **Destructive 操作**：任何删除数据的操作（如 Clear Logs）MUST 用 PrimeVue Confirm 或 `useDialog().confirmDelete`。
- **空态**：禁止空白屏；表格/仪表盘无数据时 MUST 渲染空态插画/图标及可操作文案（如「暂无配置，点击添加创建」）。
- **Loading**：初始加载使用 PrimeVue `<Skeleton>`，禁止白屏等待。
- **Toast 时长**：Success=3000ms、Warn=5000ms、Error=8000ms；见 `TOAST_AND_MESSAGE.md` §7。

## 6. Connection Awareness (Overview Pages)

For real-time dashboards, use `getConnectionState()` and `addConnectionListener()` from `@/utils/http/connection`:

- **Offline / polling failure**: Show warning bar with `text-danger` and `bg-danger/20`; for stale data cards use `text-danger` and `bg-danger/20`. Do NOT use `opacity-60`.
- **Unconfigured**: Show "No data points selected" and a button linking to Settings → Data Groups.

## 7. 类名映射参考（AI 必遵）

本文档中的示例均使用项目 SSOT 类名；禁止在生成代码中使用下表左侧：

| ❌ 禁止                           | ✅ 正确                                  |
| --------------------------------- | ---------------------------------------- |
| `text-muted-color`                | `text-muted-foreground`                  |
| `text-surface-400`                | `text-muted-foreground`                  |
| `p-4`                             | `p-padding-md` 或 `px-padding-lg`        |
| `text-3xl`                        | `fs-3xl`                                 |
| `text-sm`                         | `fs-sm`                                  |
| `bg-surface-0` / `bg-surface-900` | `bg-card` / `bg-background`              |
| `border-surface-200`              | `component-border` 或 `border-b-default` |
| `rounded-xl`                      | `rounded-scale`                          |
