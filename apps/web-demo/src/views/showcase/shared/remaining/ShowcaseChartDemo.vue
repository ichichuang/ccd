<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import {
  createShowcaseChartOption,
  type ShowcaseChartDemoKind,
} from '../../data/showcaseChartOptions'

defineOptions({ name: 'ShowcaseChartDemo' })

const props = defineProps<{
  kind: string
}>()

const { t } = useI18n()
const compact = ref(false)
const loading = ref(false)
const readyCount = ref(0)

const chartKind = computed<ShowcaseChartDemoKind>(() => {
  const value = props.kind.replace('chart-', '')
  if (
    value === 'dashboard-preview' ||
    value === 'events' ||
    value === 'overview' ||
    value === 'responsive' ||
    value === 'states' ||
    value === 'theme'
  ) {
    return value
  }
  return 'overview'
})

const option = computed(() => createShowcaseChartOption(chartKind.value))
const isResponsiveDemo = computed(() => chartKind.value === 'responsive')
const isStateDemo = computed(() => chartKind.value === 'states')
const isEventDemo = computed(() => chartKind.value === 'events')

function recordReady(): void {
  readyCount.value += 1
}
</script>

<template>
  <section class="col-stretch min-w-0 gap-md">
    <div class="row-between min-w-0 gap-sm flex-wrap">
      <div class="row-start min-w-0 gap-sm">
        <Tag
          :value="$t('showcase.remaining.chart.wrapperDriven')"
          severity="info"
        />
        <Tag
          v-if="isEventDemo"
          :value="$t('showcase.remaining.chart.readyCount', { count: readyCount })"
          severity="success"
        />
      </div>

      <div
        v-if="isResponsiveDemo || isStateDemo"
        class="row-start min-w-0 gap-sm"
      >
        <ToggleSwitch
          v-if="isResponsiveDemo"
          v-model="compact"
          input-id="showcase-chart-compact-width"
        />
        <label
          v-if="isResponsiveDemo"
          for="showcase-chart-compact-width"
          class="text-sm text-muted-foreground"
        >
          {{ $t('showcase.remaining.chart.compactWidth') }}
        </label>
        <ToggleSwitch
          v-if="isStateDemo"
          v-model="loading"
          input-id="showcase-chart-loading-state"
        />
        <label
          v-if="isStateDemo"
          for="showcase-chart-loading-state"
          class="text-sm text-muted-foreground"
        >
          {{ $t('showcase.remaining.chart.loading') }}
        </label>
      </div>
    </div>

    <div
      class="demo-stage h-[36vh] min-w-0"
      :class="{ 'max-w-[72%]': compact }"
    >
      <UseEcharts
        :option="option"
        :loading="loading"
        @chart-ready="recordReady"
      />
    </div>

    <p class="text-sm text-muted-foreground m-0">
      {{ t(`showcase.remaining.chart.${chartKind}.note`) }}
    </p>
  </section>
</template>
