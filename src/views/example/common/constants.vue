<script setup lang="ts">
defineOptions({ name: 'CommonConstants' })

import { HTTP_CONFIG } from '@/constants/http'
import { DEFAULT_LAYOUT_SETTING } from '@/constants/layout'
import { SIZE_PRESETS } from '@/constants/size'

type ConstSourceId = 'HTTP_CONFIG' | 'DEFAULT_LAYOUT_SETTING' | 'SIZE_PRESETS'

type ConstSourceKind = 'object' | 'array'

interface ConstSource {
  id: ConstSourceId
  label: string
  kind: ConstSourceKind
  data: unknown
}

interface ConstRow {
  key: string
  valueType: string
  valueText: string
}

const constSources: ConstSource[] = [
  { id: 'HTTP_CONFIG', label: 'HTTP_CONFIG', kind: 'object', data: HTTP_CONFIG },
  {
    id: 'DEFAULT_LAYOUT_SETTING',
    label: 'DEFAULT_LAYOUT_SETTING',
    kind: 'object',
    data: DEFAULT_LAYOUT_SETTING,
  },
  { id: 'SIZE_PRESETS', label: 'SIZE_PRESETS', kind: 'array', data: SIZE_PRESETS },
]

const selectedSourceId = ref<ConstSourceId>('HTTP_CONFIG')
const searchKey = ref<string | undefined>('')
const copyToastGroup = 'tr' as const

function valueTypeOf(v: unknown): string {
  if (v === null) return 'null'
  if (Array.isArray(v)) return 'array'
  const t = typeof v
  if (t === 'object') return 'object'
  return t
}

function formatValueText(v: unknown): string {
  if (v === undefined) return '—'
  if (typeof v === 'string') return v.length > 0 ? v : '—'
  if (typeof v === 'number' || typeof v === 'boolean') return String(v)

  // Avoid JSON.stringify for functions / symbols. For these constant surfaces it's fine to show placeholder.
  if (typeof v === 'function') return '[function]'
  if (typeof v === 'symbol') return '[symbol]'

  try {
    const json = JSON.stringify(v, null, 2)
    return json && json.length > 0 ? json : '—'
  } catch {
    return '—'
  }
}

function safeCopy(text: string): Promise<void> {
  return navigator.clipboard
    .writeText(text)
    .then(() => {
      window.$toast?.add({
        severity: 'success',
        summary: '已复制',
        detail: 'Constants JSON 已复制到剪贴板',
        life: 2000,
        group: copyToastGroup,
      })
    })
    .catch(() => {
      window.$toast?.add({
        severity: 'error',
        summary: '复制失败',
        detail: '请检查剪贴板权限',
        life: 2000,
        group: copyToastGroup,
      })
    })
}

const selectedSource = computed<ConstSource>(() => {
  return constSources.find(s => s.id === selectedSourceId.value) ?? constSources[0]
})

const constOptions = computed(() =>
  constSources.map(s => ({
    label: s.label,
    value: s.id,
  }))
)

const allRows = computed<ConstRow[]>(() => {
  const src = selectedSource.value
  const q = (searchKey.value ?? '').trim().toLowerCase()

  if (src.kind === 'array') {
    const arr = Array.isArray(src.data) ? (src.data as unknown[]) : []
    return arr
      .map((item, idx) => {
        const key = String(idx)
        return {
          key,
          valueType: valueTypeOf(item),
          valueText: formatValueText(item),
        }
      })
      .filter(r => (q ? r.key.toLowerCase().includes(q) : true))
  }

  const obj = src.data && typeof src.data === 'object' ? (src.data as Record<string, unknown>) : {}
  return Object.entries(obj)
    .map(([k, v]) => ({
      key: k,
      valueType: valueTypeOf(v),
      valueText: formatValueText(v),
    }))
    .filter(r => (q ? r.key.toLowerCase().includes(q) : true))
})

const selectedJsonText = computed<string>(() => formatValueText(selectedSource.value.data))

async function copyAll(): Promise<void> {
  await safeCopy(selectedJsonText.value)
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
                  name="i-lucide-book-open"
                  size="xl"
                  class="text-primary"
                />
              </div>
              <div class="col-stretch gap-xs min-w-0">
                <div class="row-start gap-xs min-w-0 flex-wrap">
                  <span class="text-lg font-bold text-foreground text-no-wrap">Constants</span>
                  <span
                    class="surface-primary rounded-md px-sm py-xs text-xs font-semibold uppercase"
                  >
                    COMMON
                  </span>
                </div>
                <span class="text-sm text-muted-foreground text-ellipsis-1">
                  Constants 是运行期对象，支持遍历展示：选定对象后可按 key 过滤并查看结构化值。
                </span>
              </div>
            </div>
            <div class="row-center gap-sm shrink-0">
              <Button
                size="small"
                severity="secondary"
                icon="i-lucide-copy"
                label="复制当前 JSON"
                @click="copyAll"
              />
            </div>
          </div>
        </header>

        <section class="material-elevated col-stretch gap-md min-w-0">
          <div class="row-between items-end gap-md flex-wrap min-w-0">
            <div class="col-stretch gap-xs min-w-0">
              <label class="text-xs text-muted-foreground">数据源</label>
              <Select
                v-model="selectedSourceId"
                :options="constOptions"
                option-label="label"
                option-value="value"
                class="w-[280px]"
              />
            </div>

            <div class="col-stretch gap-xs flex-1 min-w-0">
              <label class="text-xs text-muted-foreground">Key 过滤</label>
              <InputText
                v-model="searchKey"
                placeholder="例如 timeout / sidebarWidth / 0 ..."
                class="w-full"
              />
            </div>
          </div>

          <DataTable
            :value="allRows"
            :row-hover="true"
            :paginator="false"
            class="w-full"
          >
            <Column
              header="Key"
              field="key"
            ></Column>
            <Column
              header="Type"
              field="valueType"
            ></Column>
            <Column header="Value">
              <template #body="slotProps">
                <pre class="text-xs text-foreground text-ellipsis-2 m-0">
                    {{ slotProps.data.valueText }}
                  </pre
                >
              </template>
            </Column>
          </DataTable>
        </section>

        <section class="material-elevated col-stretch gap-md min-w-0">
          <Message severity="info">
            这是"Living Dictionary"页面：展示内容直接来自运行期导出的常量对象（例如 `HTTP_CONFIG` /
            `SIZE_PRESETS`）。 适合作为架构与用法参考；不要把 UI 展示当作业务逻辑来源。
          </Message>
        </section>
      </div>
    </div>
  </div>
</template>
