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
  try {
    const option: EChartsOption = parseEChartsOption(raw)
    return { option, isValid: true, isJsonError: false, errorMsg: null }
  } catch (e) {
    return {
      option: {} as EChartsOption,
      isValid: false,
      isJsonError: false,
      errorMsg: e instanceof Error ? e.message : 'Validation failed',
    }
  }
})

function resetToDefault(): void {
  playgroundInput.value = defaultJson
}
</script>

<template>
  <div
    class="col-stretch"
    data-archetype="A1-toolbar-content"
  >
    <div class="col-stretch gap-md min-h-0 min-w-0">
      <div class="layout-narrow col-stretch gap-md min-w-0">
        <header class="shrink-0 glass-panel col-stretch gap-md min-w-0">
          <div class="row-between gap-md min-w-0">
            <div class="row-start gap-sm min-w-0 flex-wrap">
              <div class="glass-icon-box shrink-0">
                <Icons
                  name="i-lucide-chart-line"
                  size="xl"
                  class="text-primary"
                />
              </div>
              <div class="col-stretch gap-xs min-w-0">
                <div class="row-start gap-xs min-w-0 flex-wrap">
                  <span class="text-lg font-bold text-foreground text-no-wrap">
                    ECharts Adapter
                  </span>
                  <span class="surface-warn rounded-md px-sm py-xs text-xs font-semibold uppercase">
                    ADAPTER
                  </span>
                </div>
                <span class="text-sm text-muted-foreground text-ellipsis-1">
                  parseEChartsOption() — 校验并安全转换原始对象为 EChartsOption
                </span>
              </div>
            </div>
            <Tag
              value="@/adapters/echarts.adapter"
              severity="secondary"
              class="shrink-0"
            />
          </div>
          <p class="text-sm text-muted-foreground m-0">
            ECharts 配置来自 HTTP 或用户输入时，必须经过
            <code class="code-inline">parseEChartsOption</code>
            校验。拒绝数组、null、原始类型；合法对象安全转型为
            <code class="code-inline">EChartsOption</code>
            ； 非法输入抛出 HttpRequestError。
          </p>
        </header>

        <section class="material-elevated col-stretch gap-md min-w-0">
          <div class="row-between gap-sm min-w-0 shrink-0">
            <div class="row-start gap-xs min-w-0">
              <Icons
                name="i-lucide-play"
                size="sm"
                class="text-muted-foreground"
              />
              <span class="text-sm font-semibold text-foreground text-no-wrap">
                Live Playground
              </span>
            </div>
            <Button
              label="Reset"
              size="small"
              severity="secondary"
              class="interaction-shrink"
              @click="resetToDefault"
            />
          </div>
          <Textarea
            v-model="playgroundInput"
            :rows="7"
            class="font-mono text-sm w-full"
            placeholder="Paste ECharts option JSON here..."
          />
          <div class="row-between min-w-0">
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
            {{ parseResult.errorMsg ?? 'Input rejected by adapter boundary.' }}
          </Message>
        </section>

        <section
          v-if="parseResult.isValid"
          class="material-elevated col-stretch gap-md min-w-0"
        >
          <div class="row-start gap-xs min-w-0">
            <Icons
              name="i-lucide-bar-chart-3"
              size="sm"
              class="text-muted-foreground"
            />
            <span class="text-sm font-semibold text-foreground text-no-wrap">Chart Preview</span>
          </div>
          <div class="h-[280px] w-full">
            <UseEcharts :option="parseResult.option" />
          </div>
        </section>

        <section class="glass-card col-stretch gap-md min-w-0">
          <div class="row-start gap-xs min-w-0">
            <Icons
              name="i-lucide-code"
              size="sm"
              class="text-muted-foreground"
            />
            <span class="text-sm font-semibold text-foreground text-no-wrap">Source</span>
          </div>
          <pre class="code-block">
import type { EChartsOption } from 'echarts'

export function parseEChartsOption(raw: unknown): EChartsOption {
  if (!isRecord(raw)) {
    throw new HttpRequestError(
      'ECharts adapter: input is not a plain object',
      ErrorType.VALIDATION, ...
    )
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
  </div>
</template>
