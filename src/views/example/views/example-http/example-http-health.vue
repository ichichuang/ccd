<script setup lang="ts">
import { checkHealth } from '@/api/modules/health'
import { ref } from 'vue'

export interface HealthResponse {
  /** 服务器状态（'ok' 表示正常） */
  status: string
  /** 检查时间戳（ISO 字符串） */
  timestamp: string
  /** 服务器运行时间（秒） */
  uptime: number
  /** 运行环境（development/production） */
  environment: string
}
/* 健康检查 */
const healthLoading = ref(false)
const healthData = ref<HealthResponse | null>(null)
const healthError = ref<string | null>(null)

const checkHealthStatus = async () => {
  healthLoading.value = true
  healthError.value = null
  healthData.value = null

  checkHealth()
    .then(res => {
      healthData.value = res
    })
    .catch(err => {
      healthError.value = err instanceof Error ? err.message : '健康检查失败'
    })
    .finally(() => {
      healthLoading.value = false
    })
}

// 自动检查
checkHealthStatus()

// 定时刷新（每30秒）
setInterval(() => {
  if (!healthLoading.value) {
    checkHealthStatus()
  }
}, 30000)
</script>

<template lang="pug">
.p-paddingl.between-col.justify-start.gap-gapl
  //- 健康检查示例
  .between-col.justify-start.gap-gap
    b.fs-appFontSizel 💚 健康检查示例
    p.color-text200.fs-appFontSizes 演示服务器健康检查功能，用于连接状态监控

  .c-card.between
    .flex-1.between-col.items-start.gap-gap
      .flex.items-center.gap-gap
        b 健康检查
        span.fs-appFontSizes.bg-success100.color-success400.px-padding.py-padding.rounded-rounded(
          v-if='healthData?.status === "ok"'
        ) 正常
        span.fs-appFontSizes.bg-danger100.color-danger400.px-padding.py-padding.rounded-rounded(
          v-else-if='healthError'
        ) 异常
        span.fs-appFontSizes.bg-warning100.color-warning400.px-padding.py-padding.rounded-rounded(
          v-else
        ) 检查中
      b.color-text200.fs-appFontSizes /api/health
      Button(
        label='刷新检查',
        :loading='healthLoading',
        @click='checkHealthStatus',
        severity='success'
      )
    .flex-1.full.between-col.justify-start.items-start.gap-gap
      template(v-if='healthData || healthError')
        template(v-if='healthData')
          b.color-text200 ✅ 服务器状态：
          .between-col.gap-gaps.mt-gap
            .c-card.between-start.gap-gap
              .flex-1.between-col.items-start.gap-gaps
                .between-start.gap-gap
                  b 状态：
                  span.color-success400 {{ healthData.status }}
                .between-start.gap-gap
                  b 环境：
                  span {{ healthData.environment }}
                .between-start.gap-gap
                  b 运行时间：
                  span {{ Math.floor(healthData.uptime / 60) }} 分钟
                .between-start.gap-gap
                  b 检查时间：
                  span {{ new Date(healthData.timestamp).toLocaleString() }}
          pre.fs-appFontSizes.bg-bg300.p-padding.rounded-rounded.overflow-auto.mt-gap {{ JSON.stringify(healthData, null, 2) }}
        template(v-if='healthError')
          b.color-dangerColor ❌ 检查失败：
          .fs-appFontSizes.color-dangerColor {{ healthError }}

  //- 使用说明
  .between-col.justify-start.gap-gap.color-accent100.c-border-accent.p-paddingl
    b.fs-appFontSizex 📖 使用说明
    .between-col.justify-start.gap-gap.fs-appFontSizes
      .between-start.gap-gap
        b 健康检查
        | ：用于监控服务器连接状态，前端连接管理器会定期调用此接口
      .between-start.gap-gap
        b 自动刷新
        | ：此页面每30秒自动刷新一次健康状态
      .between-start.gap-gap
        b 连接管理
        | ：当健康检查失败时，连接管理器会自动尝试重连
      .between-start.gap-gap
        b HEAD 请求
        | ：连接管理器使用 HEAD /api/health 进行轻量级健康检查
</template>
