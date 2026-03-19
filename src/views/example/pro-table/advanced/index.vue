<script setup lang="ts">
import { advancedColumns, makeAdvancedMockData } from './columns'
import type { AdvancedRow } from './columns'

defineOptions({ name: 'ExampleProTableAdvancedPage' })

const mockData = ref<AdvancedRow[]>(makeAdvancedMockData())

// ── Control panel state ────────────────────────────────────────────────────
const resizableColumns = ref<boolean>(true)
const columnResizeMode = ref<'fit' | 'expand'>('fit')
const reorderableColumns = ref<boolean>(true)
const stateStorage = ref<'session' | 'local' | false>('session')

const RESIZE_MODE_OPTIONS: { label: string; value: 'fit' | 'expand' }[] = [
  { label: 'fit（保持表宽）', value: 'fit' },
  { label: 'expand（表宽随动）', value: 'expand' },
]

const STATE_STORAGE_OPTIONS: { label: string; value: 'session' | 'local' | false }[] = [
  { label: '关闭', value: false },
  { label: 'sessionStorage', value: 'session' },
  { label: 'localStorage', value: 'local' },
]

const effectiveStateKey = computed<string | undefined>(() =>
  stateStorage.value !== false ? 'pro-table-advanced-demo' : undefined
)
</script>

<template>
  <div
    data-archetype="A1-toolbar-content"
    class="layout-full px-padding-md md:px-padding-lg col-stack-sm min-h-0"
  >
    <!-- Toolbar: Hero Header (Transparent Root Policy: Inherit canvas) -->
    <header class="shrink-0 border-b-default">
      <div class="w-full py-padding-sm row-y-center gap-md">
        <div class="p-padding-md bg-primary/10 rounded-scale-lg shrink-0">
          <Icons
            name="i-lucide-columns-2"
            class="text-primary fs-2xl"
          />
        </div>
        <div class="col-stack-xs">
          <h1 class="fs-2xl font-bold text-foreground m-0">
            {{ $t('router.example.proTableAdvanced') }}
          </h1>
          <p class="text-muted fs-sm m-0">列宽拖拽 · 列重排 · 状态记忆（session/local）</p>
        </div>
      </div>
    </header>

    <!-- Content -->
    <div class="flex-1 min-h-0 col-stack-sm">
      <!-- Control Panel -->
      <div class="shrink-0 border-b-default">
        <div class="w-full py-padding-sm">
          <div class="panel-base">
            <div class="row-y-center gap-sm border-b-default pb-padding-sm mb-padding-sm">
              <Icons
                name="i-lucide-settings-2"
                class="text-primary"
                size="sm"
              />
              <span class="fs-sm font-semibold text-foreground tracking-wider uppercase">
                高级功能控制台 / Advanced Controls
              </span>
            </div>

            <div class="col-stack-md">
              <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-xl">
                <!-- 列宽拖拽 -->
                <div class="bg-muted/5 rounded-scale-md p-padding-md col-stack-md">
                  <div class="row-y-center gap-xs mb-padding-xs">
                    <Icons
                      name="i-lucide-move-horizontal"
                      size="xs"
                      class="text-muted-foreground shrink-0"
                    />
                    <p
                      class="fs-xs font-semibold text-muted-foreground uppercase tracking-wider m-0"
                    >
                      列宽拖拽
                    </p>
                  </div>
                  <div class="row-between">
                    <label
                      for="ctrl-resize"
                      class="fs-sm text-foreground cursor-pointer"
                    >
                      Resize
                    </label>
                    <ToggleSwitch
                      v-model="resizableColumns"
                      input-id="ctrl-resize"
                      class="shrink-0"
                    />
                  </div>
                </div>

                <!-- 拖拽模式 -->
                <div class="bg-muted/5 rounded-scale-md p-padding-md col-stack-md">
                  <div class="row-y-center gap-xs mb-padding-xs">
                    <Icons
                      name="i-lucide-columns-2"
                      size="xs"
                      class="text-muted-foreground shrink-0"
                    />
                    <p
                      class="fs-xs font-semibold text-muted-foreground uppercase tracking-wider m-0"
                    >
                      拖拽模式
                    </p>
                  </div>
                  <div class="row-y-center gap-md">
                    <label class="fs-sm text-foreground shrink-0 w-[var(--spacing-4xl)]">
                      Resize Mode
                    </label>
                    <Select
                      v-model="columnResizeMode"
                      :options="RESIZE_MODE_OPTIONS"
                      option-label="label"
                      option-value="value"
                      class="flex-1 min-w-0"
                    />
                  </div>
                </div>

                <!-- 列重排 -->
                <div class="bg-muted/5 rounded-scale-md p-padding-md col-stack-md">
                  <div class="row-y-center gap-xs mb-padding-xs">
                    <Icons
                      name="i-lucide-arrow-left-right"
                      size="xs"
                      class="text-muted-foreground shrink-0"
                    />
                    <p
                      class="fs-xs font-semibold text-muted-foreground uppercase tracking-wider m-0"
                    >
                      列重排
                    </p>
                  </div>
                  <div class="row-between">
                    <label
                      for="ctrl-reorder"
                      class="fs-sm text-foreground cursor-pointer"
                    >
                      Reorder
                    </label>
                    <ToggleSwitch
                      v-model="reorderableColumns"
                      input-id="ctrl-reorder"
                      class="shrink-0"
                    />
                  </div>
                </div>

                <!-- 状态记忆 -->
                <div class="bg-muted/5 rounded-scale-md p-padding-md col-stack-md">
                  <div class="row-y-center gap-xs mb-padding-xs">
                    <Icons
                      name="i-lucide-database"
                      size="xs"
                      class="text-muted-foreground shrink-0"
                    />
                    <p
                      class="fs-xs font-semibold text-muted-foreground uppercase tracking-wider m-0"
                    >
                      状态记忆
                    </p>
                  </div>
                  <div class="row-y-center gap-md">
                    <label class="fs-sm text-foreground shrink-0 w-[var(--spacing-4xl)]">
                      State Storage
                    </label>
                    <Select
                      v-model="stateStorage"
                      :options="STATE_STORAGE_OPTIONS"
                      option-label="label"
                      option-value="value"
                      class="flex-1 min-w-0"
                    />
                  </div>
                </div>
              </div>

              <div class="p-padding-md bg-muted/5 rounded-scale-md">
                <p class="fs-xs text-muted m-0 leading-relaxed italic">
                  <span class="font-bold not-italic">说明：</span>
                  开启「列宽拖拽」后拖动表头列边界可调整列宽；「列重排」可拖动表头改变列顺序。
                  启用「状态记忆」后，列宽与列顺序会写入浏览器存储，刷新或重新打开页面可恢复（stateKey:
                  pro-table-advanced-demo）。
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- ProTable -->
      <div class="flex-1 min-h-0">
        <ProTable
          :columns="advancedColumns"
          :data="mockData"
          title="高级功能演示"
          row-key="id"
          :resizable-columns="resizableColumns"
          :column-resize-mode="columnResizeMode"
          :reorderable-columns="reorderableColumns"
          :state-storage="stateStorage === false ? undefined : stateStorage"
          :state-key="effectiveStateKey"
          :pagination="{ pageSize: 12 }"
          :show-horizontal-lines="true"
        />
      </div>
    </div>
  </div>
</template>
