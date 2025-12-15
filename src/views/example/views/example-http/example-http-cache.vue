<script setup lang="ts">
import { clearCacheApi, getCacheStatsApi, getExampleList } from '@/api/modules/example'
import { ref, onMounted } from 'vue'

/* 缓存统计 */
const cacheStats = ref({
  size: 0,
  hitRate: 0,
  missRate: 0,
})

const updateCacheStats = () => {
  const stats = getCacheStatsApi()
  cacheStats.value = {
    size: stats.size || 0,
    hitRate: stats.hitRate || 0,
    missRate: stats.missRate || 0,
  }
}

/* 带缓存的请求 */
const cachedLoading = ref(false)
const cachedResult = ref<string | null>(null)
const cachedError = ref<string | null>(null)
const requestTime = ref<number>(0)

const handleCachedRequest = async () => {
  cachedLoading.value = true
  cachedError.value = null
  cachedResult.value = null

  const startTime = Date.now()

  getExampleList({ page: 1, pageSize: 10 })
    .then(res => {
      requestTime.value = Date.now() - startTime
      cachedResult.value = JSON.stringify(res, null, 2)
      updateCacheStats()
    })
    .catch(err => {
      cachedError.value = err instanceof Error ? err.message : '请求失败'
    })
    .finally(() => {
      cachedLoading.value = false
    })
}

/* 清除缓存 */
const handleClearCache = () => {
  clearCacheApi()
  updateCacheStats()
  cachedResult.value = null
  window.$toast.successIn('top-right', '缓存已清除', '所有缓存数据已被清除')
}

// 初始化
onMounted(() => {
  updateCacheStats()
})
</script>

<template lang="pug">
.p-paddingl.between-col.justify-start.gap-gapl
  //- 缓存管理
  .between-col.justify-start.gap-gap
    b.fs-appFontSizel 📦 缓存管理
    p.color-text200.fs-appFontSizes 演示 HTTP 请求缓存功能和统计信息

  //- 缓存统计信息
  .grid.grid-cols-1.gap-gap(class='lg:grid-cols-3')
    .c-card.between-col.items-center.gap-gap
      .fs-appFontSizes.color-text200 缓存大小
      b.fs-appFontSizel.color-primary400 {{ cacheStats.size }}
      .fs-appFontSizes.color-text200 个条目

    .c-card.between-col.items-center.gap-gap
      .fs-appFontSizes.color-text200 缓存命中率
      b.fs-appFontSizel.color-success400 {{ (cacheStats.hitRate * 100).toFixed(2) }}%
      .fs-appFontSizes.color-text200 Hit Rate

    .c-card.between-col.items-center.gap-gap
      .fs-appFontSizes.color-text200 缓存未命中率
      b.fs-appFontSizel.color-warning400 {{ (cacheStats.missRate * 100).toFixed(2) }}%
      .fs-appFontSizes.color-text200 Miss Rate

  //- 带缓存的请求
  .c-card.between
    .flex-1.between-col.items-start.gap-gap
      .flex.items-center.gap-gap
        b 带缓存的 GET 请求
        span.fs-appFontSizes.bg-success100.color-success400.px-padding.py-padding.rounded-rounded 自动缓存
      b.color-text200.fs-appFontSizes /api/example/list?page=1&pageSize=10

      .between-col.gap-gaps
        .fs-appFontSizes
          | 💡
          b 提示
          | ：第一次请求会从服务器获取数据，后续相同请求会从缓存中读取，速度更快
        .fs-appFontSizes
          | 📝 默认缓存时间：
          code.bg-primary100.color-primary400.rounded-rounded.px-padding.py-paddings.mx-gaps 5分钟

      .between-start.gap-gap
        Button(
          label='发送请求（会缓存）',
          :loading='cachedLoading',
          @click='handleCachedRequest',
          severity='success'
        )
        Button(label='清除缓存', @click='handleClearCache', severity='danger', outlined)
        Button(label='刷新统计', @click='updateCacheStats', severity='secondary', outlined)

      template(v-if='requestTime > 0')
        .fs-appFontSizes.color-text200
          | ⏱️ 请求耗时：
          b.color-primary400 {{ requestTime }}ms
          template(v-if='requestTime < 10')
            span.color-success400.ml-2 （来自缓存）
          template(v-else)
            span.color-warning400.ml-2 （来自服务器）

    .flex-1.full.between-col.justify-start.items-start.gap-gap
      template(v-if='cachedResult || cachedError')
        template(v-if='cachedResult')
          b.color-text200 ✅ 请求成功：
          pre.fs-appFontSizes.bg-bg300.p-padding.rounded-rounded.overflow-auto.max-h-96 {{ cachedResult }}
        template(v-if='cachedError')
          b.color-dangerColor ❌ 请求失败：
          .fs-appFontSizes.color-dangerColor {{ cachedError }}

  //- 缓存工作原理
  .between-col.justify-start.gap-gap.color-info100.c-border-info.p-paddingl
    b.fs-appFontSizex 🔍 缓存工作原理
    .between-col.justify-start.gap-gap.fs-appFontSizes
      .between-start.gap-gap
        b 第一次请求
        | ：数据从服务器获取，响应时间较长（通常 >100ms）
      .between-start.gap-gap
        b 后续请求
        | ：数据从内存缓存读取，响应时间极快（通常 <10ms）
      .between-start.gap-gap
        b 缓存失效
        | ：超过 TTL（默认5分钟）后，缓存自动失效，下次请求会重新获取
      .between-start.gap-gap
        b 手动清除
        | ：点击"清除缓存"按钮可立即清空所有缓存

  //- 使用说明
  .between-col.justify-start.gap-gap.color-accent100.c-border-accent.p-paddingl
    b.fs-appFontSizex 📖 使用说明
    .between-col.justify-start.gap-gap.fs-appFontSizes
      .between-start.gap-gap
        b 自动缓存
        | ：GET 请求默认启用缓存，相同 URL 的请求会直接从缓存返回
      .between-start.gap-gap
        b 缓存时间
        | ：默认缓存 5 分钟，可通过
        code.bg-accent100.color-primary400.rounded-rounded.px-padding.py-paddings.mx-gaps cacheTTL
        | 参数自定义
      .between-start.gap-gap
        b 禁用缓存
        | ：添加
        code.bg-accent100.color-primary400.rounded-rounded.px-padding.py-paddings.mx-gaps enableCache: false
        | 参数可禁用缓存
      .between-start.gap-gap
        b 缓存统计
        | ：实时查看缓存命中率，优化请求性能
      .between-start.gap-gap
        b 适用场景
        | ：适合数据变化不频繁的场景，如配置信息、字典数据等
</template>
