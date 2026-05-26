<script setup lang="ts">
import { computed, ref } from 'vue'
import { storeToRefs } from 'pinia'
import { UseEcharts as PackageUseEcharts } from '@ccd/vue-charts'
import type {
  ChartInstance,
  ChartSetOptionOptions,
  ChartThemeRuntimeState,
  UseEchartsProps,
} from '@ccd/vue-charts'
import type { EChartsOption } from 'echarts'
import { useI18n } from 'vue-i18n'
import { useThemeStore, useSizeStore } from '@/stores/modules/system'

defineOptions({
  name: 'UseEcharts',
  inheritAttrs: false,
})

const props = defineProps<UseEchartsProps & { group?: string }>()
const chartRef = ref<ChartInstance | null>(null)

const { t, locale } = useI18n()
const themeStore = useThemeStore()
const sizeStore = useSizeStore()
const { themeName, mode } = storeToRefs(themeStore)
const { sizeName } = storeToRefs(sizeStore)

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object'
}

const effectiveLoadingOptions = computed<Record<string, unknown>>(() => {
  const raw: unknown = props.loadingOptions
  const base = typeof raw === 'function' ? raw() : isRecord(raw) ? raw : {}
  const currentText = base.text

  if (typeof currentText === 'string' && currentText.trim().length > 0) {
    return base
  }

  return {
    ...base,
    text: t('common.loading'),
  }
})

const themeRuntime = computed<ChartThemeRuntimeState>(() => ({
  themeName: themeName.value,
  mode: mode.value,
  isDark: themeStore.isDark,
  sizeName: sizeName.value,
  localeKey: String(locale.value),
  translate: t,
}))

defineExpose<ChartInstance>({
  getChartInstance: () => chartRef.value?.getChartInstance() ?? null,
  getEchartsInstance: () => chartRef.value?.getEchartsInstance() ?? null,
  setOption: (option: EChartsOption, opts?: boolean | ChartSetOptionOptions) => {
    chartRef.value?.setOption(option, opts)
  },
  resize: () => {
    chartRef.value?.resize()
  },
  clear: () => {
    chartRef.value?.clear()
  },
  dispose: () => {
    chartRef.value?.dispose()
  },
  getConnectState: () => chartRef.value?.getConnectState() ?? {},
  setConnectState: state => {
    chartRef.value?.setConnectState(state)
  },
  triggerConnect: (eventType, params) => {
    chartRef.value?.triggerConnect(eventType, params)
  },
})
</script>

<template>
  <PackageUseEcharts
    ref="chartRef"
    v-bind="props"
    :theme-runtime="themeRuntime"
    :loading-options="effectiveLoadingOptions"
    v-on="$attrs"
  />
</template>
