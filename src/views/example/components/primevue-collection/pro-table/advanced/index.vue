<script setup lang="ts">
import { useConfirm } from 'primevue/useconfirm'
import { createAdvancedColumns, makeAdvancedMockData } from './configs/columns'
import type { AdvancedRow } from './configs/columns'

defineOptions({ name: 'ExampleProTableAdvancedPage' })

// ── Mock data ────────────────────────────────────────────────────────────────
const mockData = ref<AdvancedRow[]>(makeAdvancedMockData())

// ── Control panel state ──────────────────────────────────────────────────────
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
const tableContainerRef = useTemplateRef<HTMLElement>('tableContainerRef')
const tableContainerHeight = ref<number | undefined>(undefined)

// ── RBAC action handlers ─────────────────────────────────────────────────────
const confirm = useConfirm()

function onEdit(_event: MouseEvent, row: AdvancedRow): void {
  window.$toast?.infoIn('top-right', '编辑', `编辑员工：${row.name}`)
}

function onDelete(event: MouseEvent, row: AdvancedRow): void {
  confirm.require({
    target: event.currentTarget as HTMLElement,
    message: `确认删除「${row.name}」？此操作不可撤销。`,
    rejectProps: { label: '取消', severity: 'secondary' },
    acceptProps: { label: '删除', severity: 'danger' },
    accept: () => {
      mockData.value = mockData.value.filter(r => r.id !== row.id)
      window.$toast?.dangerIn('top-right', '已删除', row.name)
    },
  })
}

const { hasAuth } = useAuth()
const userStore = useUserStore()

const columns = computed(() => {
  void userStore.userInfo.permissions
  return createAdvancedColumns(onEdit, onDelete, hasAuth)
})

onMounted(() => {
  tableContainerHeight.value = tableContainerRef.value?.clientHeight ?? 0
})
</script>

<template>
  <!-- LAW 2.1: Transparent root, col-fill — NO background class -->
  <div
    class="col-fill"
    data-archetype="A1-toolbar-content"
  >
    <!-- Inner padding wrapper (col-fill preserves height budget; gap-md separates sections) -->
    <div class="col-fill px-md md:px-lg py-md gap-md">
      <!-- ── Section 0: Glass Header ── -->
      <header class="shrink-0 glass-panel col-stretch gap-md min-w-0">
        <div class="row-between gap-md min-w-0">
          <div class="row-start gap-sm min-w-0 flex-wrap">
            <div class="glass-icon-box shrink-0">
              <Icons
                name="i-lucide-settings-2"
                size="xl"
                class="text-primary"
              />
            </div>
            <div class="col-stretch gap-xs min-w-0">
              <div class="row-start gap-xs min-w-0 flex-wrap">
                <span class="text-lg font-bold text-foreground text-no-wrap">
                  ProTable 高级用法
                </span>
                <span class="surface-info rounded-md px-sm py-xs text-xs font-semibold uppercase">
                  PRO-TABLE
                </span>
              </div>
              <span class="text-sm text-muted-foreground text-ellipsis-1">
                列宽拖拽、列重排、状态记忆、RBAC 权限控制等高级功能演示。
              </span>
            </div>
          </div>
        </div>
      </header>

      <!-- ── Section 1: Control Panel ── -->
      <!-- LAW 2.3: material-elevated card; shrink-0 stays at content height -->
      <section class="material-elevated shrink-0 col-stretch gap-sm">
        <!-- Section header -->
        <div class="row-start gap-sm">
          <Icons
            name="i-lucide-settings-2"
            class="text-primary"
            size="sm"
          />
          <span class="text-sm font-semibold text-foreground tracking-wider uppercase">
            高级功能控制台 / Advanced Controls
          </span>
        </div>

        <!-- LAW 1: Pure PrimeVue components; 4-col responsive grid for live-reactive controls -->
        <div class="grid grid-cols-2 xl:grid-cols-4 gap-md">
          <!-- 列宽拖拽 -->
          <div class="col-stretch gap-xs">
            <div class="row-start gap-xs">
              <Icons
                name="i-lucide-move-horizontal"
                size="xs"
                class="text-muted-foreground shrink-0"
              />
              <p class="text-xs font-semibold text-muted-foreground uppercase tracking-wider m-0">
                列宽拖拽
              </p>
            </div>
            <div class="row-between">
              <label
                for="ctrl-resize"
                class="text-sm text-foreground cursor-pointer"
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
          <div class="col-stretch gap-xs">
            <div class="row-start gap-xs">
              <Icons
                name="i-lucide-columns-2"
                size="xs"
                class="text-muted-foreground shrink-0"
              />
              <p class="text-xs font-semibold text-muted-foreground uppercase tracking-wider m-0">
                拖拽模式
              </p>
            </div>
            <Select
              v-model="columnResizeMode"
              :options="RESIZE_MODE_OPTIONS"
              option-label="label"
              option-value="value"
            />
          </div>

          <!-- 列重排 -->
          <div class="col-stretch gap-xs">
            <div class="row-start gap-xs">
              <Icons
                name="i-lucide-arrow-left-right"
                size="xs"
                class="text-muted-foreground shrink-0"
              />
              <p class="text-xs font-semibold text-muted-foreground uppercase tracking-wider m-0">
                列重排
              </p>
            </div>
            <div class="row-between">
              <label
                for="ctrl-reorder"
                class="text-sm text-foreground cursor-pointer"
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
          <div class="col-stretch gap-xs">
            <div class="row-start gap-xs">
              <Icons
                name="i-lucide-database"
                size="xs"
                class="text-muted-foreground shrink-0"
              />
              <p class="text-xs font-semibold text-muted-foreground uppercase tracking-wider m-0">
                状态记忆
              </p>
            </div>
            <Select
              v-model="stateStorage"
              :options="STATE_STORAGE_OPTIONS"
              option-label="label"
              option-value="value"
            />
          </div>
        </div>

        <p class="text-xs text-muted-foreground m-0 leading-relaxed italic">
          <span class="font-bold not-italic">说明：</span>
          开启「列宽拖拽」后拖动表头列边界可调整列宽；「列重排」可拖动表头改变列顺序。
          启用「状态记忆」后，列宽与列顺序会写入浏览器存储，刷新或重新打开页面可恢复 （stateKey:
          pro-table-advanced-demo）。
        </p>
      </section>

      <!-- ── Section 2: ProTable ── -->
      <!-- LAW 2.3: material-elevated; col-fill so ProTable height-mode=fill has a constrained parent -->
      <!-- LAW 3.2 + LAW 6.1: height-mode=fill for full-page data grid -->
      <section
        ref="tableContainerRef"
        class="col-fill"
      >
        <template v-if="tableContainerHeight && tableContainerHeight > 0">
          <div
            class="material-elevated"
            :style="{ height: tableContainerHeight + 'px' }"
          >
            <ProTable
              :columns="columns"
              :data="mockData"
              row-key="id"
              height-mode="fill"
              :resizable-columns="resizableColumns"
              :column-resize-mode="columnResizeMode"
              :reorderable-columns="reorderableColumns"
              :state-storage="stateStorage === false ? undefined : stateStorage"
              :state-key="effectiveStateKey"
            />
          </div>
        </template>
      </section>
    </div>
  </div>
</template>
