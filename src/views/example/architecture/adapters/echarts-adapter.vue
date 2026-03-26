<script setup lang="ts">
import { parseEChartsOption } from '@/adapters/echarts.adapter'
import type { EChartsOption } from 'echarts'

defineOptions({ name: 'ArchitectureAdapterEcharts' })

const defaultJson = `{
  "xAxis": { "type": "category", "data": ["Mon", "Tue", "Wed", "Thu", "Fri"] },
  "yAxis": { "type": "value" },
  "series": [{ "data": [120, 200, 150, 80, 70], "type": "bar" }]
}`

const playgroundInput = ref<string>(defaultJson)

interface ParseResult {
  option: EChartsOption
  isValid: boolean
  isJsonError: boolean
  errorMsg: string | null
}

const parseResult = computed<ParseResult>(() => {
  let raw: unknown
  try {
    raw = JSON.parse(playgroundInput.value)
  } catch (e) {
    return {
      option: {} as EChartsOption,
      isValid: false,
      isJsonError: true,
      errorMsg: e instanceof Error ? e.message : 'JSON parse error',
    }
  }
  const option: EChartsOption = parseEChartsOption(raw)
  const isValid: boolean = Object.keys(option).length > 0
  return { option, isValid, isJsonError: false, errorMsg: null }
})

function resetToDefault(): void {
  playgroundInput.value = defaultJson
}
</script>

<template>
  <div class="animate__animated animate__fadeIn col-stretch gap-md">
    <div class="layout-narrow col-stretch gap-md">
      <section class="material-elevated col-stretch gap-md">
        <div class="row-between">
          <div class="col-stretch gap-xs">
            <h2 class="text-lg font-semibold text-foreground m-0">ECharts Adapter</h2>
            <p class="text-sm text-muted-foreground m-0">
              parseEChartsOption() — 校验并安全转换原始对象为 EChartsOption
            </p>
          </div>
          <Tag
            value="@/adapters/echarts.adapter"
            severity="secondary"
          />
        </div>
        <Divider />
        <p class="text-sm text-muted-foreground m-0">
          ECharts 配置来自 HTTP 或用户输入时，必须经过
          <code class="code-inline">parseEChartsOption</code>
          校验。拒绝数组、null、原始类型；合法对象安全转型为
          <code class="code-inline">EChartsOption</code>
          ； 非法输入返回空对象，图表渲染为空白。
        </p>
      </section>

      <section class="material-elevated col-stretch gap-md">
        <div class="row-between">
          <h3 class="text-md font-semibold text-foreground m-0">Live Playground</h3>
          <Button
            label="Reset"
            size="small"
            severity="secondary"
            @click="resetToDefault"
          />
        </div>
        <Divider />
        <Textarea
          v-model="playgroundInput"
          :rows="7"
          class="font-mono text-sm w-full"
          placeholder="Paste ECharts option JSON here..."
        />
        <div class="row-between">
          <span class="text-sm text-muted-foreground">parseEChartsOption(raw) →</span>
          <Tag
            :value="
              parseResult.isJsonError
                ? 'JSON Parse Error'
                : parseResult.isValid
                  ? 'Valid EChartsOption ✓'
                  : 'Empty option (rejected) ✗'
            "
            :severity="parseResult.isValid ? 'success' : 'danger'"
          />
        </div>
        <Message
          v-if="parseResult.isJsonError"
          severity="error"
          :closable="false"
        >
          {{ parseResult.errorMsg }}
        </Message>
        <Message
          v-else-if="!parseResult.isValid"
          severity="warn"
          :closable="false"
        >
          Input is not a plain object. parseEChartsOption() returns {} — chart renders empty.
        </Message>
      </section>

      <section
        v-if="parseResult.isValid"
        class="material-elevated col-stretch gap-md"
      >
        <h3 class="text-md font-semibold text-foreground m-0">Chart Preview</h3>
        <Divider />
        <div class="h-[280px] w-full">
          <UseEcharts :option="parseResult.option" />
        </div>
      </section>

      <section class="material-elevated col-stretch gap-md">
        <h3 class="text-md font-semibold text-foreground m-0">Source</h3>
        <Divider />
        <pre class="code-block">
import type { EChartsOption } from 'echarts'

export function parseEChartsOption(raw: unknown): EChartsOption {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
    console.warn('[Boundary Error] Invalid ECharts option format:', raw)
    return {} as EChartsOption
  }
  // Validation passed, safe to cast
  return raw as EChartsOption
}</pre
        >
        <p class="text-sm text-muted-foreground m-0">
          此处是架构中唯一允许使用
          <code class="code-inline">as EChartsOption</code>
          强制转型的地方。其余所有图表配置代码均应先经过此边界函数。
        </p>
      </section>
    </div>
  </div>
</template>
