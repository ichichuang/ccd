<script setup lang="ts">
/**
 * Dashboard — Phase 12.65: Absolute semantics & VH fluidity.
 * Uses vh for chart height, semantic spacing tokens, shadow-sm/dark:shadow-md; no rem/em or raw shadow.
 */
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

// --- Mock Data: System Events & Service Nodes (Phase 12.7) ---
interface SystemEventItem {
  id: string
  title: string
  description: string
  type: 'info' | 'success' | 'warn' | 'error'
  icon: string
  time: string
}

interface ServiceNodeItem {
  id: string
  name: string
  status: 'Healthy' | 'Degraded'
  region: string
  uptime: string
}

const systemEvents = ref<SystemEventItem[]>([
  {
    id: 'evt-1',
    title: 'Deployment completed',
    description: 'Production release v2.4.1 has been successfully deployed to all regions',
    type: 'success',
    icon: 'i-lucide-check-circle',
    time: '2 mins ago',
  },
  {
    id: 'evt-2',
    title: 'Database backup initiated',
    description: 'Scheduled full backup started for primary cluster',
    type: 'info',
    icon: 'i-lucide-database',
    time: '15 mins ago',
  },
  {
    id: 'evt-3',
    title: 'High memory usage alert',
    description: 'Auth service memory utilization exceeded 85% threshold',
    type: 'warn',
    icon: 'i-lucide-alert-triangle',
    time: '32 mins ago',
  },
  {
    id: 'evt-4',
    title: 'Cache node reconnected',
    description: 'Redis replica node redis-03 recovered from transient network partition',
    type: 'success',
    icon: 'i-lucide-zap',
    time: '1 hr ago',
  },
  {
    id: 'evt-5',
    title: 'API rate limit exceeded',
    description: 'External partner API returned 429; retry scheduled',
    type: 'error',
    icon: 'i-lucide-alert-circle',
    time: '2 hrs ago',
  },
])

const serviceNodes = ref<ServiceNodeItem[]>([
  { id: 'svc-1', name: 'Database', status: 'Healthy', region: 'us-east-1', uptime: '99.98%' },
  { id: 'svc-2', name: 'Auth', status: 'Healthy', region: 'us-east-1', uptime: '99.95%' },
  { id: 'svc-3', name: 'Cache', status: 'Degraded', region: 'eu-west-1', uptime: '98.2%' },
  {
    id: 'svc-4',
    name: 'API Gateway',
    status: 'Healthy',
    region: 'ap-northeast-1',
    uptime: '99.99%',
  },
])

const eventTypeStyles: Record<SystemEventItem['type'], string> = {
  info: 'bg-info/90 text-info-foreground',
  success: 'bg-success/90 text-success-foreground',
  warn: 'bg-warn/90 text-warn-foreground',
  error: 'bg-danger/90 text-danger-foreground',
}

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
  <div data-archetype="A3-stats-grid">
    <div
      class="col-stack-xl py-sm md:py-md xl:py-lg 2xl:py-xl mx-auto max-w-[92%] sm:max-w-[94%] md:max-w-[92%] lg:max-w-[90%] xl:max-w-[88%] 2xl:max-w-[86%] 3xl:max-w-[84%]"
    >
      <!-- Header Section -->
      <header class="col-stack-sm">
        <h1 class="text-2xl font-bold text-foreground m-0 tracking-tight">System Data Overview</h1>
        <p class="text-sm text-muted-foreground m-0">
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
          class="bg-accent/10 dark:bg-accent/5 rounded-xl shadow-sm dark:shadow-md transition-all duration-md ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-1 hover:shadow-md dark:hover:shadow-[0_0_0_1px_rgb(var(--foreground)/0.12),0_8px_30px_rgb(var(--background)/0.85)] p-lg row-y-center gap-lg group"
        >
          <div
            class="shrink-0 w-[var(--spacing-3xl)] h-[var(--spacing-3xl)] rounded-lg surface-item center transition-[transform,opacity] duration-md ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-105"
          >
            <Icons
              :name="m.icon"
              size="5xl"
              :class="m.color"
            />
          </div>
          <div class="column">
            <span class="text-xs font-medium text-accent uppercase tracking-wider">
              {{ m.label }}
            </span>
            <span class="text-2xl font-bold text-foreground tabular-nums">{{ m.value }}</span>
          </div>
        </div>
      </div>

      <!-- Chart Grid -->
      <div
        data-region="chart-grid"
        class="grid grid-cols-1 gap-lg"
      >
        <div
          class="bg-card rounded-md shadow-sm dark:shadow-md py-md px-lg flex flex-col gap-lg min-h-[50vh]"
        >
          <div class="row-between shrink-0">
            <div class="col-stack-xs">
              <h3 class="text-lg font-semibold text-foreground m-0">Performance Analytics</h3>
              <p class="text-xs text-muted-foreground m-0">
                Live telemetry of core system resources
              </p>
            </div>
            <div
              class="bg-primary/10 text-primary rounded-full px-md py-xs row-y-center gap-sm shadow-sm dark:shadow-md"
            >
              <span
                class="w-[var(--spacing-sm)] h-[var(--spacing-sm)] rounded-full bg-primary animate-pulse shrink-0"
              />
              <span class="text-xs font-medium">Live Data</span>
            </div>
          </div>

          <div class="flex-1 w-full overflow-hidden">
            <UseEcharts :option="chartOptions" />
          </div>
        </div>
      </div>

      <!-- Data Lists: 2:1 Asymmetric Grid (Phase 12.7) -->
      <div
        data-region="data-lists"
        class="grid grid-cols-1 lg:grid-cols-3 gap-lg"
      >
        <!-- Recent System Events (Left, 2/3) -->
        <div
          class="bg-primary/20 dark:bg-primary/10 rounded-xl shadow-sm dark:shadow-md p-xl col-stack-lg lg:col-span-2 transition-all duration-md ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-1 hover:shadow-md dark:hover:shadow-[0_0_0_1px_rgb(var(--foreground)/0.12),0_8px_30px_rgb(var(--background)/0.85)]"
        >
          <div class="row-between shrink-0">
            <h3 class="text-lg font-semibold text-foreground m-0">Recent System Events</h3>
            <a
              href="#"
              class="text-sm text-primary interactive-click"
              @click.prevent
            >
              View All
            </a>
          </div>
          <div class="layout-stack gap-md">
            <div
              v-for="evt in systemEvents"
              :key="evt.id"
              class="surface-item rounded-md p-md row-between behavior-hover-transition hover:bg-foreground/5"
            >
              <div class="row-y-center gap-md min-w-0 flex-1">
                <div
                  class="shrink-0 w-[var(--spacing-2xl)] h-[var(--spacing-2xl)] rounded-md center"
                  :class="eventTypeStyles[evt.type]"
                >
                  <Icons
                    :name="evt.icon"
                    class="text-inherit!"
                    size="xl"
                  />
                </div>
                <div class="column min-w-0 flex-1">
                  <span class="text-sm font-medium text-foreground">{{ evt.title }}</span>
                  <span class="text-muted-foreground text-single-line-ellipsis text-xs">
                    {{ evt.description }}
                  </span>
                </div>
              </div>
              <span class="text-secondary-foreground text-xs whitespace-nowrap shrink-0 ml-md">
                {{ evt.time }}
              </span>
            </div>
          </div>
        </div>

        <!-- Active Service Nodes (Right, 1/3) -->
        <div
          class="bg-primary/20 dark:bg-primary/10 rounded-xl shadow-sm dark:shadow-md p-xl col-stack-lg lg:col-span-1 transition-all duration-md ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-1 hover:shadow-md dark:hover:shadow-[0_0_0_1px_rgb(var(--foreground)/0.12),0_8px_30px_rgb(var(--background)/0.85)]"
        >
          <div class="row-between shrink-0">
            <h3 class="text-lg font-semibold text-foreground m-0">Active Service Nodes</h3>
            <span
              class="w-[var(--spacing-sm)] h-[var(--spacing-sm)] rounded-full bg-success animate-pulse shrink-0"
            />
          </div>
          <div class="layout-stack gap-md">
            <div
              v-for="node in serviceNodes"
              :key="node.id"
              class="surface-item rounded-md p-md row-between behavior-hover-transition hover:bg-foreground/5"
            >
              <div class="column min-w-0">
                <span class="text-sm font-medium text-foreground">{{ node.name }}</span>
                <span class="text-muted-foreground text-xs">{{ node.region }}</span>
              </div>
              <div class="column items-end shrink-0">
                <span
                  class="text-xs px-sm py-xs rounded-full font-medium"
                  :class="
                    node.status === 'Healthy'
                      ? 'bg-success/20 text-success'
                      : 'bg-warn/20 text-warn'
                  "
                >
                  {{ node.status }}
                </span>
                <span class="text-secondary-foreground text-xs mt-padding-xs">
                  {{ node.uptime }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
