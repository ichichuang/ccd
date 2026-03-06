<script setup lang="ts">
defineOptions({ name: 'StatsGridExampleIndex' })

const metrics = [
  { label: '总用户数', value: '12,458', icon: 'i-lucide-users' },
  { label: '今日访问', value: '3,892', icon: 'i-lucide-activity' },
  { label: '转化率', value: '24.6%', icon: 'i-lucide-trending-up' },
  { label: '活跃会话', value: '892', icon: 'i-lucide-zap' },
]
</script>

<template>
  <div
    data-archetype="A3-stats-grid"
    class="h-full overflow-y-auto"
  >
    <div class="p-padding-lg flex flex-col gap-padding-xl">
      <div
        data-region="metrics-header"
        class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-padding-md"
      >
        <div
          v-for="m in metrics"
          :key="m.label"
          class="rounded-scale-md border-default p-padding-lg bg-surface-ground shadow-soft flex items-center gap-padding-md"
        >
          <div
            class="shrink-0 w-10 h-10 rounded-scale-sm bg-primary/10 flex items-center justify-center"
          >
            <Icons
              :name="m.icon"
              size="md"
              class="text-primary"
            />
          </div>
          <div>
            <p class="fs-xs text-muted-foreground m-0">{{ m.label }}</p>
            <p class="fs-lg font-semibold text-foreground m-0">{{ m.value }}</p>
          </div>
        </div>
      </div>

      <div
        data-region="chart-grid"
        class="grid grid-cols-1 lg:grid-cols-2 gap-padding-lg"
      >
        <div
          class="rounded-scale-md border-default p-padding-lg bg-surface-ground shadow-soft min-h-kpi-card"
        >
          <h4 class="fs-sm font-semibold text-foreground m-0 mb-margin-md">图表占位</h4>
          <p class="fs-sm text-muted-foreground m-0">此处可接入 UseEcharts 渲染折线图、柱状图等</p>
        </div>
        <div
          class="rounded-scale-md border-default p-padding-lg bg-surface-ground shadow-soft min-h-kpi-card"
        >
          <h4 class="fs-sm font-semibold text-foreground m-0 mb-margin-md">图表占位</h4>
          <p class="fs-sm text-muted-foreground m-0">UseEcharts 自动集成主题与响应式</p>
        </div>
      </div>
    </div>
  </div>
</template>
