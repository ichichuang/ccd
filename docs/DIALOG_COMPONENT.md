# prime-dialog 二次封装

> 项目基于 PrimeVue Dialog 的二次封装，支持便捷方法、自定义渲染器、多层弹窗、拦截器等。  
> 当需要**自定义弹窗、反馈提示、确认对话框**时，优先使用 `useDialog()`，禁止在业务中自行管理 Dialog 状态。

## 1. 概述

- **组件**：`PrimeVueDialog`（`src/components/prime-dialog`）
- **Hook**：`useDialog()`（`src/hooks/modules/useDialog`）
- **集成**：`PrimeVueDialog` 已在 `AppPrimeVueGlobals.vue`（由 `App.vue` 引入）中挂载，业务层只需调用 `useDialog()` 返回的方法，无需再挂载组件。

## 2. 快速使用

```ts
import { useDialog } from '@/hooks/modules/useDialog'

const { info, success, warning, error, confirm, confirmDelete, openDialog, closeDialog } =
  useDialog()

// 反馈弹窗（单按钮）
info('这是一条信息', '信息提示')
success('操作成功', '成功')
warning('请注意', '警告')
error('发生错误', '错误')

// 确认弹窗（双按钮）
confirm('确定要提交吗？', '确认', {
  onConfirm: () => { /* 确定后 */ },
  onCancel: () => { /* 取消后 */ },
})

confirmDelete('删除后无法恢复，确定吗？', '删除确认', {
  onConfirm: () => { /* 删除逻辑 */ },
})

// 完全自定义
const index = openDialog({
  header: '标题',
  contentRenderer: () => <div class="p-scale-md">自定义内容（TSX）</div>,
  footerButtons: [
    { label: '取消', severity: 'secondary', btnClick: ({ dialog }) => closeDialog(dialog.index) },
    { label: '确定', severity: 'primary', btnClick: ({ dialog }) => closeDialog(dialog.index) },
  ],
})
```

## 3. 与 PrimeVue 的分工

| 场景                                           | 使用                                                                  |
| ---------------------------------------------- | --------------------------------------------------------------------- |
| 简单确认（是/否）                              | PrimeVue `useConfirm().require()`                                     |
| 动态组件弹窗                                   | PrimeVue `useDialog().open()`                                         |
| 轻量通知（组件内）                             | PrimeVue `useToast()`                                                 |
| 轻量通知（非组件环境）                         | `window.$toast` / `window.$message`（见 `docs/TOAST_AND_MESSAGE.md`） |
| 自定义内容、反馈提示、需要拦截的确认、多层弹窗 | **useDialog()**                                                       |

## 4. API 速查

### useDialog() 返回值

| 方法                          | 说明                 |
| ----------------------------- | -------------------- |
| `openDialog(options)`         | 打开弹窗，返回 index |
| `closeDialog(index, args?)`   | 按 index 关闭        |
| `closeLastDialog(args?)`      | 关闭最后一个         |
| `closeAll()`                  | 关闭全部             |
| `update(value, key?, index?)` | 动态更新 header 等   |
| `getDialogCount()`            | 当前弹窗数量         |
| `info/success/warning/error`  | 反馈弹窗             |
| `confirm/confirmDelete`       | 确认弹窗             |

### DialogOptions 核心字段

| 字段                                      | 说明                                                                       |
| ----------------------------------------- | -------------------------------------------------------------------------- |
| `header`                                  | 标题（string \| () => string）                                             |
| `contentRenderer`                         | 内容渲染（TSX，params: { options, index }）                                |
| `headerRenderer`                          | 自定义头部（params: { close, maximize, minimize }）                        |
| `footerRenderer`                          | 自定义底部                                                                 |
| `footerButtons`                           | 底部按钮数组                                                               |
| `hideHeader` / `hideFooter` / `hideClose` | 隐藏元素                                                                   |
| `modal`                                   | 是否模态                                                                   |
| `closeOnEscape` / `closeOnMask`           | ESC/遮罩关闭（仅最上层响应）                                               |
| `closable`                                | 是否显示关闭图标                                                           |
| `beforeSure`                              | 拦截确定（done, { closeLoading }）                                         |
| `beforeCancel`                            | 拦截取消（done）                                                           |
| `sureBtnLoading`                          | 确定按钮 loading                                                           |
| `position`                                | 位置：center/top/bottom/left/right/topleft/topright/bottomleft/bottomright |
| `width` / `height`                        | 尺寸                                                                       |
| `open` / `close`                          | 生命周期回调                                                               |
| `openDelay`                               | 延迟打开                                                                   |

## 5. 注意事项

- **TSX**：`contentRenderer` 等需返回 VNode 时，使用 TSX（`<script setup lang="tsx">`），禁止 `h()`。
- **close 事件 & Fragment 根**：`PrimeVueDialog` 会在内容组件上绑定 `@close` 用于关闭弹窗。若业务组件模板为 **Fragment 根**（例如顶层 `v-for` 导致多根节点）且未声明 `emits: ['close']`，会触发 Vue 警告：`Extraneous non-emits event listeners (close) ... fragment root nodes`。解决方式：
  - 在业务组件中声明 `defineEmits(['close'])`（推荐，即使暂不 `emit` 也可消除警告）；或
  - 改为单一根节点容器（不推荐作为通用约束）。
- **多语言**：标题和按钮可用 `() => t('key')` 实现响应式文案。
- **多层弹窗**：ESC 仅关闭最上层；遮罩点击仅关闭最上层。
- **关闭幂等**：同一弹窗多次调用 `closeDialog` 仅生效一次（按 \_instanceId 去重）。
- **内容滚动（统一 CScrollbar）**：弹窗内容超出高度时，应让滚动发生在 `CScrollbar` 内，而不是 PrimeVue Dialog 默认的 `.p-dialog-content` 原生滚动条。若仍看到原生滚动条，通常是 `.p-dialog-content` 仍为 `overflow: auto` 且拥有高度约束。处理思路：
  - 使用 `pt`/`contentStyle` 将 `.p-dialog-content` 设为 `overflow-hidden`，并配合 `flex` 布局让内容区可 `flex: 1`；
  - 再由 `CScrollbar` 承担唯一滚动容器（内容区 `h-full`/`flex-1`）。
