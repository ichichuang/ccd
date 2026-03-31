<script setup lang="ts">
/**
 * Dashboard — Phase 12.65: Absolute semantics & layout tokens.
 * Chart min-height uses spacing CSS vars; semantic shortcuts from semanticShortcuts; no arbitrary %/vh sizing.
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

// --- Summary Cards Definition (valueMain + unit for typographic hierarchy) ---
const metricsConfig = computed(() => [
  {
    label: 'CPU Usage',
    valueMain: String(currentStats.value.cpu),
    unit: '%',
    icon: 'i-lucide-cpu',
    color: 'text-primary!',
  },
  {
    label: 'Memory Load',
    valueMain: String(currentStats.value.memory),
    unit: '%',
    icon: 'i-lucide-database',
    color: 'text-success!',
  },
  {
    label: 'Network Traffic',
    valueMain: String(currentStats.value.network),
    unit: 'Mbps',
    icon: 'i-lucide-activity',
    color: 'text-info!',
  },
  {
    label: 'Disk I/O',
    valueMain: String(currentStats.value.disk),
    unit: 'MB/s',
    icon: 'i-lucide-hard-drive',
    color: 'text-warn!',
  },
])
</script>

<template>
  <div data-archetype="A3-stats-grid">
    <div class="layout-narrow">
      <!-- Header Section -->
      <header class="col-stretch gap-xs md:gap-sm">
        <h1 class="text-2xl font-bold text-foreground m-0 tracking-tight">System Data Overview</h1>
        <p class="text-sm text-muted-foreground m-0">
          Real-time performance monitoring and analytics.
        </p>
      </header>
      <!-- Metrics Header -->
      <div
        data-region="metrics-header"
        class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-sm md:gap-md lg:gap-lg"
      >
        <div
          v-for="m in metricsConfig"
          :key="m.label"
          class="rounded-xl p-md md:p-lg xl:p-xl col-stretch gap-xs sm:flex-row sm:items-center sm:gap-md md:gap-lg group interactive-card"
        >
          <div
            class="self-start shrink-0 w-[var(--spacing-3xl)] h-[var(--spacing-3xl)] rounded-lg center transition-[transform,opacity] duration-sm ease-spring group-hover:scale-105 sm:self-center"
          >
            <Icons
              :name="m.icon"
              size="5xl"
              :class="m.color"
            />
          </div>
          <div class="col-stretch gap-sm min-w-0 flex-1">
            <span class="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              {{ m.label }}
            </span>
            <div class="inline-flex flex-wrap items-baseline gap-x-xs gap-y-0">
              <span
                class="text-2xl font-bold text-foreground tabular-nums leading-none tracking-tight"
              >
                {{ m.valueMain }}
              </span>
              <span class="text-sm font-medium text-muted-foreground tabular-nums shrink-0">
                {{ m.unit }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Chart Grid -->
      <div
        data-region="chart-grid"
        class="grid grid-cols-1 gap-sm md:gap-md lg:gap-lg"
      >
        <div class="material-elevated col-stretch gap-xl">
          <div class="row-between shrink-0">
            <div class="col-stretch gap-xs">
              <p class="text-lg font-semibold">Performance Analytics</p>
              <p class="text-xs text-muted-foreground">Live telemetry of core system resources</p>
            </div>
            <div class="glass-capsule bg-primary/10 dark:bg-primary/20 center gap-sm">
              <span
                class="w-[var(--spacing-sm)] h-[var(--spacing-sm)] rounded-full bg-primary animate-pulse shrink-0"
              />
              <span class="text-xs">Live Data</span>
            </div>
          </div>

          <div class="h-30vh">
            <UseEcharts :option="chartOptions" />
          </div>
        </div>
      </div>

      <!-- Data Lists: 2:1 Asymmetric Grid (Phase 12.7) -->
      <div
        data-region="data-lists"
        class="grid grid-cols-1 lg:grid-cols-3 gap-md lg:gap-lg xl:gap-xl"
      >
        <!-- Recent System Events (Left, 2/3) -->
        <div
          class="material-elevated rounded-xl p-md md:p-xl lg:p-2xl col-stretch gap-md md:gap-lg xl:gap-xl lg:col-span-2 interactive-card"
        >
          <div class="row-between shrink-0 mb-md">
            <h3 class="text-lg font-semibold text-foreground m-0">Recent System Events</h3>
            <a
              href="#"
              class="text-sm text-primary interaction-shrink"
              @click.prevent
            >
              View All
            </a>
          </div>
          <div class="col-stretch gap-sm md:gap-md">
            <div
              v-for="evt in systemEvents"
              :key="evt.id"
              class="rounded-md p-md row-between interactive-item"
            >
              <div class="flex items-center gap-md min-w-0 flex-1">
                <div
                  class="shrink-0 w-[var(--spacing-2xl)] h-[var(--spacing-2xl)] rounded-md center"
                  :class="eventTypeStyles[evt.type]"
                >
                  <Icons
                    :name="evt.icon"
                    size="xl"
                  />
                </div>
                <div class="col-stretch min-w-0 flex-1">
                  <span class="text-sm font-medium text-foreground">{{ evt.title }}</span>
                  <span class="text-muted-foreground text-ellipsis-1 text-xs">
                    {{ evt.description }}
                  </span>
                </div>
              </div>
              <span class="text-secondary-foreground text-xs text-no-wrap shrink-0 ml-md">
                {{ evt.time }}
              </span>
            </div>
          </div>
        </div>

        <!-- Active Service Nodes (Right, 1/3) -->
        <div
          class="material-elevated rounded-xl p-md md:p-xl lg:p-2xl col-stretch gap-md md:gap-lg xl:gap-xl lg:col-span-1 interactive-card"
        >
          <div class="row-between shrink-0 mb-md">
            <h3 class="text-lg font-semibold text-foreground m-0">Active Service Nodes</h3>
            <span
              class="w-[var(--spacing-sm)] h-[var(--spacing-sm)] rounded-full bg-success animate-pulse shrink-0"
            />
          </div>
          <div class="col-stretch gap-sm md:gap-md">
            <div
              v-for="node in serviceNodes"
              :key="node.id"
              class="rounded-md p-md row-between interactive-item"
            >
              <div class="col-stretch min-w-0">
                <span class="text-sm font-medium text-foreground">{{ node.name }}</span>
                <span class="text-muted-foreground text-xs">{{ node.region }}</span>
              </div>
              <div class="flex flex-col items-end shrink-0">
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
                <span class="text-secondary-foreground text-xs mt-xs">
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
