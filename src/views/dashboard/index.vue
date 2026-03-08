<script setup lang="ts">
import { useChartOptions } from './hooks/useChartOptions'
import type { SystemMetricsDTO } from './page.state'

defineOptions({ name: 'Dashboard' })

// --- Data Simulation ---
const metricsData = ref<SystemMetricsDTO[]>([])
const currentStats = ref({
  cpu: 0,
  memory: 0,
  network: 0,
  disk: 0,
})

const generateDataPoint = (index: number): SystemMetricsDTO => {
  const now = new Date()
  const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`

  // Base values for "organic" looking data
  const baseCpu = 20 + Math.sin(index / 5) * 10
  const baseMem = 40 + Math.cos(index / 8) * 5

  return {
    cpuUsage: Math.round(baseCpu + Math.random() * 10),
    memoryLoad: Math.round(baseMem + Math.random() * 5),
    networkTraffic: Math.round(Math.random() * 100),
    diskIo: Math.round(Math.random() * 50),
    timestamp: timeStr,
  }
}

// Initialize with some data
for (let i = 0; i < 20; i++) {
  metricsData.value.push(generateDataPoint(i))
}

const updateMetrics = () => {
  const newPoint = generateDataPoint(metricsData.value.length)

  metricsData.value.push(newPoint)
  if (metricsData.value.length > 30) {
    metricsData.value.shift()
  }

  // Update current stats for cards
  currentStats.value = {
    cpu: newPoint.cpuUsage,
    memory: newPoint.memoryLoad,
    network: newPoint.networkTraffic,
    disk: newPoint.diskIo,
  }
}

let timer: ReturnType<typeof setInterval>
onMounted(() => {
  updateMetrics() // initial update
  timer = setInterval(updateMetrics, 3000)
})

onUnmounted(() => {
  clearInterval(timer)
})

// --- Chart Options ---
const { chartOptions } = useChartOptions(metricsData)

// --- Summary Cards Definition ---
const metricsConfig = computed(() => [
  {
    label: 'CPU Usage',
    value: `${currentStats.value.cpu}%`,
    icon: 'i-lucide-cpu',
    color: 'text-primary',
  },
  {
    label: 'Memory Load',
    value: `${currentStats.value.memory}%`,
    icon: 'i-lucide-database',
    color: 'text-success',
  },
  {
    label: 'Network Traffic',
    value: `${currentStats.value.network} Mbps`,
    icon: 'i-lucide-activity',
    color: 'text-info',
  },
  {
    label: 'Disk I/O',
    value: `${currentStats.value.disk} MB/s`,
    icon: 'i-lucide-hard-drive',
    color: 'text-warn',
  },
])
</script>

<template>
  <div
    data-archetype="A3-stats-grid"
    class="h-full overflow-y-auto"
  >
    <div class="p-padding-xl flex flex-col gap-xl layout-content-wide">
      <!-- Header Section -->
      <header class="flex flex-col gap-sm">
        <h1 class="fs-2xl font-bold text-foreground m-0 tracking-tight">System Data Overview</h1>
        <p class="fs-sm text-muted-foreground m-0">
          Real-time performance monitoring and analytics.
        </p>
      </header>

      <!-- Metrics Header -->
      <div
        data-region="metrics-header"
        class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-lg"
      >
        <div
          v-for="m in metricsConfig"
          :key="m.label"
          class="surface-elevated default-rounded p-padding-lg behavior-hover-transition flex items-center gap-lg group hover:bg-foreground/5"
        >
          <div
            class="shrink-0 w-12 h-12 rounded-scale-md surface-item flex items-center justify-center behavior-hover-transition group-hover:scale-105"
          >
            <Icons
              :name="m.icon"
              size="lg"
              :class="m.color"
            />
          </div>
          <div class="flex flex-col">
            <span class="fs-xs font-medium text-muted-foreground uppercase tracking-wider">
              {{ m.label }}
            </span>
            <span class="fs-xl font-bold text-foreground tabular-nums">{{ m.value }}</span>
          </div>
        </div>
      </div>

      <!-- Chart Grid -->
      <div
        data-region="chart-grid"
        class="grid grid-cols-1 gap-lg"
      >
        <div
          class="surface-elevated rounded-scale-xl p-padding-xl flex flex-col gap-lg min-h-kpi-card"
        >
          <div class="flex items-center justify-between shrink-0">
            <div class="flex flex-col gap-xs">
              <h3 class="fs-lg font-semibold text-foreground m-0">Performance Analytics</h3>
              <p class="fs-xs text-muted-foreground m-0">Live telemetry of core system resources</p>
            </div>
            <div
              class="flex items-center gap-sm px-padding-md py-padding-xs rounded-full bg-primary/10"
            >
              <span class="w-2 h-2 rounded-full bg-primary animate-pulse shrink-0" />
              <span class="fs-xs font-medium text-primary">Live Data</span>
            </div>
          </div>

          <div class="flex-1 w-full overflow-hidden">
            <UseEcharts
              :option="chartOptions"
              class="w-full h-full"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* UnoCSS 已覆盖大部分样式，若有极少量微调可在此补充 */
</style>
