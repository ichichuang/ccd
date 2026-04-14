<script setup lang="ts">
defineOptions({ name: 'CommonEnums' })

import { ErrorType } from '@/utils/http/errors'
import { ConnectionStatus } from '@/utils/http/connection'
import { DateFormatEnum } from '@/utils/date/types'

type TagSeverity = 'primary' | 'secondary' | 'success' | 'info' | 'warn' | 'danger' | 'contrast'

type EnumSourceId = 'ErrorType' | 'ConnectionStatus' | 'DateFormatEnum'

interface EnumRow {
  key: string
  value: string
  mappedSeverity: TagSeverity
}

interface EnumSource {
  id: EnumSourceId
  label: string
  enumObj: Record<string, unknown>
  sourceSnippet: string
  mapSeverity: (key: string, value: string) => TagSeverity
}

const enumSources: EnumSource[] = [
  {
    id: 'ErrorType',
    label: 'ErrorType',
    enumObj: ErrorType,
    sourceSnippet: `export enum ErrorType {
  NETWORK = 'NETWORK',
  TIMEOUT = 'TIMEOUT',
  AUTH = 'AUTH',
  SERVER = 'SERVER',
  CLIENT = 'CLIENT',
  SECURITY = 'SECURITY',
  UNKNOWN = 'UNKNOWN',
}`,
    mapSeverity: (key: string) => {
      const map: Record<string, TagSeverity> = {
        NETWORK: 'warn',
        TIMEOUT: 'warn',
        AUTH: 'danger',
        SERVER: 'danger',
        CLIENT: 'secondary',
        SECURITY: 'danger',
        UNKNOWN: 'secondary',
      }
      return map[key] ?? 'secondary'
    },
  },
  {
    id: 'ConnectionStatus',
    label: 'ConnectionStatus',
    enumObj: ConnectionStatus,
    sourceSnippet: `export enum ConnectionStatus {
  CONNECTED = 'connected',
  DISCONNECTED = 'disconnected',
  RECONNECTING = 'reconnecting',
  ERROR = 'error',
}`,
    mapSeverity: (key: string) => {
      const map: Record<string, TagSeverity> = {
        CONNECTED: 'success',
        DISCONNECTED: 'warn',
        RECONNECTING: 'info',
        ERROR: 'danger',
      }
      return map[key] ?? 'secondary'
    },
  },
  {
    id: 'DateFormatEnum',
    label: 'DateFormatEnum',
    enumObj: DateFormatEnum,
    sourceSnippet: `export enum DateFormatEnum {
  Date = 'YYYY-MM-DD',
  Time = 'HH:mm:ss',
  Datetime = 'YYYY-MM-DD HH:mm:ss',
  DatetimeMinute = 'YYYY-MM-DD HH:mm',
  Iso = 'YYYY-MM-DDTHH:mm:ss.SSSZ',
  ChineseDate = 'YYYY年MM月DD日',
  ChineseDatetime = 'YYYY年MM月DD日 HH:mm:ss',
  ShortDate = 'M/D/YYYY',
  LongDate = 'dddd, MMMM D, YYYY',
  Time12 = 'h:mm A',
  Datetime12 = 'YYYY-MM-DD h:mm A',
}`,
    mapSeverity: (key: string) => {
      const map: Record<string, TagSeverity> = {
        Iso: 'success',
        ChineseDate: 'success',
        ChineseDatetime: 'success',
        Date: 'info',
        Time: 'primary',
        Datetime: 'primary',
        DatetimeMinute: 'primary',
        ShortDate: 'secondary',
        LongDate: 'secondary',
        Time12: 'info',
        Datetime12: 'info',
      }
      return map[key] ?? 'secondary'
    },
  },
]

function enumToStringMembers(
  enumObj: Record<string, unknown>
): Array<{ key: string; value: string }> {
  return Object.entries(enumObj)
    .filter(([, v]) => typeof v === 'string')
    .map(([k, v]) => ({ key: k, value: v as string }))
}

const selectedEnumId = ref<EnumSourceId>('ErrorType')
const currentValue = ref<string>('')

const selectedSource = computed<EnumSource>(() => {
  return enumSources.find(s => s.id === selectedEnumId.value) ?? enumSources[0]
})

const enumRows = computed<EnumRow[]>(() => {
  const members = enumToStringMembers(selectedSource.value.enumObj)
  return members.map(m => ({
    key: m.key,
    value: m.value,
    mappedSeverity: selectedSource.value.mapSeverity(m.key, m.value),
  }))
})

watch(
  enumRows,
  newRows => {
    if (newRows.length === 0) {
      currentValue.value = ''
      return
    }
    if (!newRows.some(r => r.value === currentValue.value)) {
      currentValue.value = newRows[0].value
    }
  },
  { immediate: true }
)

const currentRow = computed<EnumRow | null>(() => {
  const found = enumRows.value.find(r => r.value === currentValue.value)
  return found ?? enumRows.value[0] ?? null
})

const valueOptions = computed(() =>
  enumRows.value.map(r => ({
    label: `${r.key} = ${r.value}`,
    value: r.value,
  }))
)
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
                  name="i-lucide-list-ordered"
                  size="xl"
                  class="text-primary"
                />
              </div>
              <div class="col-stretch gap-xs min-w-0">
                <div class="row-start gap-xs min-w-0 flex-wrap">
                  <span class="text-lg font-bold text-foreground text-no-wrap">Enums</span>
                  <span
                    class="surface-primary rounded-md px-sm py-xs text-xs font-semibold uppercase"
                  >
                    COMMON
                  </span>
                </div>
                <span class="text-sm text-muted-foreground text-ellipsis-1">
                  Enums 在运行期表现为对象。本页把枚举成员映射成 PrimeVue Tag 的
                  severity，帮助理解语义层级。
                </span>
              </div>
            </div>
            <div class="row-center gap-sm shrink-0">
              <Tag
                :value="currentRow ? currentRow.key : '—'"
                :severity="currentRow?.mappedSeverity ?? 'secondary'"
              />
            </div>
          </div>
        </header>

        <section class="material-elevated col-stretch gap-md min-w-0">
          <div class="row-between items-end gap-md flex-wrap min-w-0">
            <div class="col-stretch gap-xs min-w-0">
              <label class="text-xs text-muted-foreground">枚举选择</label>
              <Select
                v-model="selectedEnumId"
                :options="enumSources.map(s => ({ label: s.label, value: s.id }))"
                option-label="label"
                option-value="value"
                class="w-[260px]"
              />
            </div>

            <div class="col-stretch gap-xs flex-1 min-w-0">
              <label class="text-xs text-muted-foreground">当前成员</label>
              <Select
                v-model="currentValue"
                :options="valueOptions"
                option-label="label"
                option-value="value"
                class="w-full"
              />
            </div>
          </div>

          <div class="grid grid-cols-1 lg:grid-cols-2 gap-md min-w-0">
            <Panel header="Enum Source">
              <div class="col-stretch gap-xs min-w-0">
                <Message severity="warn">
                  这里展示的是"源代码片段"（静态字符串），用于阅读与对照；不要把展示当作运行期逻辑来源。
                </Message>
                <pre class="code-block">
                    {{ selectedSource.sourceSnippet }}
                  </pre
                >
              </div>
            </Panel>

            <Panel header="Mapping Demo · Enum → Tag(severity)">
              <div class="col-stretch gap-sm min-w-0">
                <DataTable
                  :value="enumRows"
                  :paginator="false"
                  :row-hover="true"
                  class="w-full"
                >
                  <Column
                    header="Key"
                    field="key"
                  ></Column>
                  <Column
                    header="Value"
                    field="value"
                  ></Column>
                  <Column header="UI">
                    <template #body="slotProps">
                      <Tag
                        :value="slotProps.data.mappedSeverity"
                        :severity="slotProps.data.mappedSeverity"
                        rounded
                      />
                    </template>
                  </Column>
                </DataTable>

                <div class="row-between min-w-0">
                  <span class="text-xs text-muted-foreground">当前映射：</span>
                  <span class="text-xs text-foreground text-ellipsis-1">
                    {{ currentRow ? `${currentRow.key} → ${currentRow.mappedSeverity}` : '—' }}
                  </span>
                </div>
              </div>
            </Panel>
          </div>
        </section>
      </div>
    </div>
  </div>
</template>
