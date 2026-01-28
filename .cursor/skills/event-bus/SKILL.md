# 事件总线系统 (Event Bus / useMitt) — 任务指引

当用户要求**实现事件传递/发布订阅**、**在不同组件/模块间传递数据或通知**，或你判断使用全局事件总线是最佳方案时，使用本技能。

本项目已对 `mitt` 做二次封装，提供类型安全且统一的全局事件总线：`src/utils/mitt.ts`。

## 文件角色

| 文件                | 职责                                                                                                                                                                                                      |
| ------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `src/utils/mitt.ts` | 全局事件总线单例。定义 `Events` 类型（集中声明所有事件），创建 `emitter`，导出 `useMitt()` Hook，封装 `on` / `off` / `emit` / `onAll` / `offAll` / `clear`。所有跨组件/跨模块事件传递必须优先使用本文件。 |

> 如需查找事件的生产方/消费方，可在全局搜索 `useMitt()` 或具体事件名（如 `windowResize`），但事件声明的**唯一入口**应始终是 `src/utils/mitt.ts` 的 `Events` 类型。

## 新增一个全局事件

### 1. 在 `Events` 中声明事件类型

在 `src/utils/mitt.ts` 中的 `Events` 类型上新增键值对，集中声明事件名与载荷类型。例如：

```ts
export type Events = {
  // 窗口尺寸变化 (由 Device Store 触发)
  windowResize: { width: number; height: number }

  // 新增：用户登录成功事件
  userLoggedIn: { id: string; name: string }
}
```

- **命名约定**：使用小驼峰英文单词组合（如 `userLoggedIn`、`sidebarToggled`），避免中文或带空格的事件名。
- **载荷类型**：总是显式声明字段结构，避免 `any`。

### 2. 在“发送方”使用 `useMitt().emit`

在需要广播事件的地方导入并使用 `useMitt()`：

```ts
import { useMitt } from '@/utils/mitt'

const { emit } = useMitt()

// 触发登录事件
emit('userLoggedIn', { id, name })
```

- 发送时事件名必须是 `Events` 的键（TS 会自动提示），载荷类型与声明保持一致。

### 3. 在“接收方”使用 `useMitt().on` 并在合适的生命周期清理

在组件或 Hook 中监听事件，并在销毁时取消订阅：

```ts
import { onMounted, onUnmounted } from 'vue'
import { useMitt } from '@/utils/mitt'

const { on, off } = useMitt()

const handleUserLoggedIn = (payload: Events['userLoggedIn']) => {
  // TODO: 处理登录成功逻辑
}

onMounted(() => {
  on('userLoggedIn', handleUserLoggedIn)
})

onUnmounted(() => {
  off('userLoggedIn', handleUserLoggedIn)
})
```

- 始终使用**同一个 handler 引用**进行 `on` 与 `off`，避免无法取消订阅。
- 对于仅在某个局部生效的事件监听，优先在组件生命周期内注册/注销。

### 4. 监听所有事件（调试/监控场景）

如需监听所有事件（例如在调试时记录日志）：

```ts
import { onMounted, onUnmounted } from 'vue'
import { useMitt } from '@/utils/mitt'

const { onAll, offAll } = useMitt()

const logAllEvents: Parameters<typeof onAll>[0] = (type, payload) => {
  console.debug('[EventBus]', type, payload)
}

onMounted(() => {
  onAll(logAllEvents)
})

onUnmounted(() => {
  offAll(logAllEvents)
})
```

> `useMitt` 中的 `onAll` / `offAll` 已修复包装函数导致 `off` 失效的问题：内部直接传递 handler 引用。

## 清空与重置

在极少数场景（例如做全局重置/热重载处理）需要清空所有监听时，可以使用：

```ts
const { clear } = useMitt()
clear() // 清空 emitter.all 中的所有监听
```

> **慎用**：`clear()` 会移除所有事件监听，包括其他模块注册的 handler。通常只在测试或全局重置逻辑中使用。

## 何时优先使用 Event Bus，而不是其他方案？

- 适合：
  - 并不存在明确父子关系或共享 store 的组件之间，一次性或低耦合的消息通知（如“某操作完成”、“开启/关闭全局 Loading”、“广播窗口尺寸变化”等）。
  - 需要同时通知多个订阅者的广播式事件。
- 不适合：
  - 需要长期持久化/响应式共享的状态（使用 Pinia store 更合适）。
  - 局部组件内部的简单数据传递（直接 props/emits 或组合式函数更清晰）。

## 排错：事件不触发 / 无法取消订阅

1. **事件名是否一致**：发送与接收是否使用了同一个 `Events` 键（TS 会自动提示，避免手写字符串拼错）。
2. **handler 引用是否一致**：`off('xxx', handler)` 时是否传入了与 `on('xxx', handler)` 相同的函数引用（不要在 `off` 时重新声明匿名函数）。
3. **是否使用了全局单例**：确认所有地方都从 `@/utils/mitt` 导入 `useMitt()`；避免新建 `mitt()` 实例。
4. **清理过度**：确认是否在不合适的地方调用了 `clear()`，导致其他模块的监听也被移除。
