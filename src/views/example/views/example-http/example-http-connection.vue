<script setup lang="ts">
import { getConnectionStateApi } from '@/api/modules/example'
import { addConnectionListener, disconnect, reconnect } from '@/utils/modules/http/connection'
import { computed, onMounted, onUnmounted, ref } from 'vue'

/* 连接状态 */
const connectionState = ref({
  isConnected: true,
  isReconnecting: false,
  lastConnectedAt: undefined as Date | undefined,
  disconnectReason: undefined as string | undefined,
  reconnectAttempts: 0,
  maxReconnectAttempts: 5,
})

const statusColor = computed(() => {
  if (connectionState.value.isConnected) {
    return 'success'
  }
  if (connectionState.value.isReconnecting) {
    return 'warning'
  }
  return 'danger'
})

const statusText = computed(() => {
  if (connectionState.value.isConnected) {
    return '已连接'
  }
  if (connectionState.value.isReconnecting) {
    return '重连中...'
  }
  return '已断开'
})

// 更新连接状态
const updateConnectionState = () => {
  const state = getConnectionStateApi()
  connectionState.value = {
    ...state,
    lastConnectedAt: state.lastConnectedAt ?? new Date(),
    disconnectReason: state.disconnectReason ?? undefined,
  }
}

// 监听连接状态变化
let removeListener: (() => void) | null = null

onMounted(() => {
  updateConnectionState()

  // 添加连接状态监听器
  removeListener = addConnectionListener(state => {
    connectionState.value = {
      ...state,
      lastConnectedAt: state.lastConnectedAt ?? new Date(),
      disconnectReason: state.disconnectReason ?? undefined,
    }
  })
})

onUnmounted(() => {
  // 移除监听器
  if (removeListener) {
    removeListener()
  }
})

/* 手动断开连接 */
const handleDisconnect = () => {
  disconnect('用户手动断开连接')
  updateConnectionState()
}

/* 手动重连 */
const reconnecting = ref(false)
const handleReconnect = async () => {
  reconnecting.value = true
  try {
    await reconnect()
    window.$toast.successIn('top-right', '重连成功', '网络连接已恢复')
  } catch (_error) {
    window.$toast.errorIn('top-right', '重连失败', '无法连接到服务器')
  } finally {
    reconnecting.value = false
    updateConnectionState()
  }
}

/* 模拟网络状态变化 */
const handleSimulateOffline = () => {
  window.dispatchEvent(new Event('offline'))
  setTimeout(() => {
    updateConnectionState()
  }, 100)
}

const handleSimulateOnline = () => {
  window.dispatchEvent(new Event('online'))
  setTimeout(() => {
    updateConnectionState()
  }, 100)
}
</script>

<template lang="pug">
.p-paddingl.between-col.justify-start.gap-gapl
  //- 连接状态管理
  .between-col.justify-start.gap-gap
    b.fs-appFontSizel 🌐 连接状态管理
    p.color-text200.fs-appFontSizes 演示网络连接状态监控、自动重连功能

  //- 当前连接状态
  .c-card.between
    .flex-1.between-col.items-start.gap-gap
      .flex.items-center.gap-gap
        b 当前连接状态
        Badge(:value='statusText', :severity='statusColor')

      .grid.grid-cols-1.gap-gap.w-full(class='lg:grid-cols-2')
        .between-col.gap-gaps.c-card.c-border-text300
          .fs-appFontSizes.color-text200 连接状态
          b.fs-appFontSizex(
            :class='connectionState.isConnected ? "color-success400" : "color-danger400"'
          )
            | {{ connectionState.isConnected ? '✅ 已连接' : '❌ 已断开' }}

        .between-col.gap-gaps.c-card.c-border-text300
          .fs-appFontSizes.color-text200 重连状态
          b.fs-appFontSizex(
            :class='connectionState.isReconnecting ? "color-warning400" : "color-text200"'
          )
            | {{ connectionState.isReconnecting ? '🔄 重连中' : '⏸️ 未重连' }}

        .between-col.gap-gaps.c-card.c-border-text300
          .fs-appFontSizes.color-text200 重连次数
          b.fs-appFontSizex.color-primary400
            | {{ connectionState.reconnectAttempts }} / {{ connectionState.maxReconnectAttempts }}

        .between-col.gap-gaps.c-card.c-border-text300
          .fs-appFontSizes.color-text200 最后连接时间
          b.fs-appFontSizes.color-text100
            | {{ connectionState.lastConnectedAt ? new Date(connectionState.lastConnectedAt).toLocaleString() : '-' }}

      template(v-if='connectionState.disconnectReason')
        .c-card.c-border-danger.between-col.gap-gaps.w-full
          .fs-appFontSizes.color-text200 断开原因
          b.fs-appFontSizes.color-danger400 {{ connectionState.disconnectReason }}

    .flex-1.full.between-col.justify-start.items-start.gap-gap
      b.color-text200 操作面板

      .between-col.gap-gap.w-full
        Button.w-full(
          label='手动断开',
          :disabled='!connectionState.isConnected',
          @click='handleDisconnect',
          severity='danger'
        )

        Button.w-full(
          label='手动重连',
          :loading='reconnecting',
          :disabled='connectionState.isConnected',
          @click='handleReconnect',
          severity='success'
        )

        Divider

        .fs-appFontSizes.color-text200.text-center 模拟网络状态变化

        .grid.grid-cols-2.gap-gap
          Button(label='模拟离线', @click='handleSimulateOffline', severity='warning', outlined)

          Button(label='模拟上线', @click='handleSimulateOnline', severity='info', outlined)

        Button.w-full(label='刷新状态', @click='updateConnectionState', severity='secondary', outlined)

  //- 自动重连机制
  .between-col.justify-start.gap-gap.color-info100.c-border-info.p-paddingl
    b.fs-appFontSizex 🔄 自动重连机制
    .between-col.justify-start.gap-gap.fs-appFontSizes
      .between-start.gap-gap
        b 断线检测
        | ：自动监听浏览器 online/offline 事件，实时检测网络状态
      .between-start.gap-gap
        b 自动重连
        | ：网络断开后自动尝试重连，默认最多重试 5 次
      .between-start.gap-gap
        b 指数退避
        | ：重连延迟逐次增加（1s → 2s → 4s → 8s），避免服务器压力
      .between-start.gap-gap
        b 健康检查
        | ：定期 ping 服务器（默认 30 秒），确保连接有效性
      .between-start.gap-gap
        b 状态通知
        | ：连接状态变化时自动触发监听器回调

  //- 使用说明
  .between-col.justify-start.gap-gap.color-accent100.c-border-accent.p-paddingl
    b.fs-appFontSizex 📖 使用说明
    .between-col.justify-start.gap-gap.fs-appFontSizes
      .between-start.gap-gap
        b 连接监控
        | ：系统自动监控网络连接状态，无需手动干预
      .between-start.gap-gap
        b 状态监听
        | ：使用
        code.bg-accent100.color-primary400.rounded-rounded.px-padding.py-paddings.mx-gaps addConnectionListener
        | 监听连接状态变化
      .between-start.gap-gap
        b 手动控制
        | ：可通过
        code.bg-accent100.color-primary400.rounded-rounded.px-padding.py-paddings.mx-gaps disconnect
        | 和
        code.bg-accent100.color-primary400.rounded-rounded.px-padding.py-paddings.mx-gaps reconnect
        | 手动控制连接
      .between-start.gap-gap
        b 测试功能
        | ：使用"模拟离线/上线"按钮测试自动重连功能
      .between-start.gap-gap
        b 适用场景
        | ：长时间运行的应用、实时数据更新、离线恢复等场景
</template>
