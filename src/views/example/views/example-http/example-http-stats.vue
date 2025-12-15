<script setup lang="ts">
import { getExampleList, getRequestStatsApi } from '@/api/modules/example'
import { ref, onMounted, onUnmounted } from 'vue'

/* 请求统计 */
const requestStats = ref({
  pendingRequests: 0,
  queueLength: 0,
  runningCount: 0,
  maxConcurrent: 5,
})

const updateStats = () => {
  const stats = getRequestStatsApi()
  requestStats.value = {
    pendingRequests: stats.pendingRequests || 0,
    queueLength: stats.queueLength || 0,
    runningCount: stats.runningCount || 0,
    maxConcurrent: stats.maxConcurrent || 5,
  }
}

// 定时更新统计信息
let statsTimer: NodeJS.Timeout | null = null

onMounted(() => {
  updateStats()
  statsTimer = setInterval(updateStats, 500)
})

onUnmounted(() => {
  if (statsTimer) {
    clearInterval(statsTimer)
  }
})

/* 批量请求测试 */
const batchCount = ref<number>(10)
const batchLoading = ref(false)
const batchResults = ref<string[]>([])

const handleBatchRequest = async () => {
  batchLoading.value = true
  batchResults.value = []

  const promises = []
  for (let i = 0; i < batchCount.value; i++) {
    promises.push(
      getExampleList({ page: i + 1, pageSize: 10 })
        .then(() => {
          batchResults.value.push(`✅ 请求 ${i + 1} 成功`)
        })
        .catch(() => {
          batchResults.value.push(`❌ 请求 ${i + 1} 失败`)
        })
    )
  }

  await Promise.allSettled(promises)
  batchLoading.value = false
}

/* 并发控制测试 */
const concurrentLoading = ref(false)
const concurrentResults = ref<string[]>([])

const handleConcurrentRequest = async () => {
  concurrentLoading.value = true
  concurrentResults.value = []

  // 发送20个请求，测试并发控制（默认最多5个并发）
  const promises = []
  for (let i = 0; i < 20; i++) {
    const startTime = Date.now()
    promises.push(
      getExampleList({ page: i + 1, pageSize: 5 })
        .then(() => {
          const duration = Date.now() - startTime
          concurrentResults.value.push(`请求 ${i + 1}: ${duration}ms`)
        })
        .catch(() => {
          concurrentResults.value.push(`请求 ${i + 1}: 失败`)
        })
    )
    // 延迟一点，避免同时创建所有请求
    await new Promise(resolve => setTimeout(resolve, 50))
  }

  await Promise.allSettled(promises)
  concurrentLoading.value = false
}
</script>

<template lang="pug">
.p-paddingl.between-col.justify-start.gap-gapl
  //- 请求统计信息
  .between-col.justify-start.gap-gap
    b.fs-appFontSizel 📊 请求统计信息
    p.color-text200.fs-appFontSizes 演示 HTTP 请求统计、并发控制功能

  //- 统计数据
  .grid.grid-cols-1.gap-gap(class='lg:grid-cols-4')
    .c-card.between-col.items-center.gap-gap
      .fs-appFontSizes.color-text200 待处理请求
      b.fs-appFontSizel.color-primary400 {{ requestStats.pendingRequests }}
      .fs-appFontSizes.color-text200 Pending Requests

    .c-card.between-col.items-center.gap-gap
      .fs-appFontSizes.color-text200 队列长度
      b.fs-appFontSizel.color-warning400 {{ requestStats.queueLength }}
      .fs-appFontSizes.color-text200 Queue Length

    .c-card.between-col.items-center.gap-gap
      .fs-appFontSizes.color-text200 运行中请求
      b.fs-appFontSizel.color-success400 {{ requestStats.runningCount }}
      .fs-appFontSizes.color-text200 Running Count

    .c-card.between-col.items-center.gap-gap
      .fs-appFontSizes.color-text200 最大并发数
      b.fs-appFontSizel.color-info400 {{ requestStats.maxConcurrent }}
      .fs-appFontSizes.color-text200 Max Concurrent

  //- 批量请求测试
  .c-card.between
    .flex-1.between-col.items-start.gap-gap
      .flex.items-center.gap-gap
        b 批量请求测试
        span.fs-appFontSizes.bg-primary100.color-primary400.px-padding.py-padding.rounded-rounded 并发执行

      .between-start.gap-gap.items-center.w-full
        label.fs-appFontSizes.w-24 请求数量:
        InputNumber.flex-1(v-model='batchCount', :min='1', :max='50')

      .fs-appFontSizes.color-text200
        | 💡 发送多个请求，测试并发控制机制（最多 {{ requestStats.maxConcurrent }} 个并发）

      Button(
        label='发送批量请求',
        :loading='batchLoading',
        @click='handleBatchRequest',
        severity='primary'
      )

    .flex-1.full.between-col.justify-start.items-start.gap-gap
      template(v-if='batchResults.length > 0')
        b.color-text200 请求结果：
        .c-card.between-col.gap-gaps.max-h-80.overflow-auto.w-full
          .fs-appFontSizes(v-for='(result, index) in batchResults', :key='index') {{ result }}

  //- 并发控制测试
  .c-card.between
    .flex-1.between-col.items-start.gap-gap
      .flex.items-center.gap-gap
        b 并发控制测试
        span.fs-appFontSizes.bg-warning100.color-warning400.px-padding.py-padding.rounded-rounded 队列管理

      .fs-appFontSizes.color-text200
        | 💡 发送 20 个请求，观察并发控制效果

      .fs-appFontSizes.color-text200
        | 📝 前 {{ requestStats.maxConcurrent }} 个请求会立即执行，后续请求会进入队列等待

      Button(
        label='测试并发控制（20个请求）',
        :loading='concurrentLoading',
        @click='handleConcurrentRequest',
        severity='warning'
      )

    .flex-1.full.between-col.justify-start.items-start.gap-gap
      template(v-if='concurrentResults.length > 0')
        b.color-text200 请求耗时统计：
        .c-card.between-col.gap-gaps.max-h-80.overflow-auto.w-full
          .fs-appFontSizes(v-for='(result, index) in concurrentResults', :key='index') {{ result }}

  //- 并发控制原理
  .between-col.justify-start.gap-gap.color-info100.c-border-info.p-paddingl
    b.fs-appFontSizex 🔍 并发控制原理
    .between-col.justify-start.gap-gap.fs-appFontSizes
      .between-start.gap-gap
        b 请求队列
        | ：所有请求先进入队列，按顺序处理
      .between-start.gap-gap
        b 并发限制
        | ：同时只执行最多
        code.bg-info100.color-primary400.rounded-rounded.px-padding.py-paddings.mx-gaps {{ requestStats.maxConcurrent }}
        | 个请求
      .between-start.gap-gap
        b 自动排队
        | ：超出并发限制的请求自动排队等待，前一个完成后自动执行下一个
      .between-start.gap-gap
        b 请求去重
        | ：相同的请求（相同 URL 和参数）会自动去重，只执行一次
      .between-start.gap-gap
        b 性能优化
        | ：防止同时发送大量请求导致服务器压力过大或浏览器崩溃

  //- 使用说明
  .between-col.justify-start.gap-gap.color-accent100.c-border-accent.p-paddingl
    b.fs-appFontSizex 📖 使用说明
    .between-col.justify-start.gap-gap.fs-appFontSizes
      .between-start.gap-gap
        b 自动管理
        | ：请求统计和并发控制由框架自动管理，无需手动配置
      .between-start.gap-gap
        b 实时监控
        | ：可通过
        code.bg-accent100.color-primary400.rounded-rounded.px-padding.py-paddings.mx-gaps getRequestStatsApi()
        | 实时查看请求统计信息
      .between-start.gap-gap
        b 并发配置
        | ：最大并发数在
        code.bg-accent100.color-primary400.rounded-rounded.px-padding.py-paddings.mx-gaps HTTP_CONFIG
        | 中配置，默认为 5
      .between-start.gap-gap
        b 批量请求
        | ：使用
        code.bg-accent100.color-primary400.rounded-rounded.px-padding.py-paddings.mx-gaps Promise.all()
        | 发送批量请求，框架自动处理并发控制
      .between-start.gap-gap
        b 适用场景
        | ：批量数据导入、文件批量上传、多页面数据加载等场景
</template>
