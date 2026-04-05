<script setup lang="tsx">
import SearchPanel from './components/SearchPanel.vue'
import TablePanel from './components/TablePanel.vue'

defineOptions({ name: 'ExampleProTableFormTableCombo' })

const searchParams = ref<Record<string, unknown>>({})
const tablePanelRef = ref<InstanceType<typeof TablePanel> | null>(null)

function onSearch(values: Record<string, unknown>): void {
  searchParams.value = { ...values }
  void nextTick(() => {
    tablePanelRef.value?.reload()
  })
}

function onReset(): void {
  searchParams.value = {}
  void nextTick(() => {
    tablePanelRef.value?.reload()
  })
}
</script>

<template>
  <div
    data-archetype="A1-toolbar-content"
    class="layout-container"
  >
    <header class="shrink-0 glass-panel col-stretch gap-md min-w-0">
      <div class="row-between gap-md min-w-0">
        <div class="row-start gap-sm min-w-0 flex-wrap">
          <div class="glass-icon-box shrink-0">
            <Icons
              name="i-lucide-layout-list"
              size="xl"
              class="text-primary"
            />
          </div>
          <div class="col-stretch gap-xs min-w-0">
            <div class="row-start gap-xs min-w-0 flex-wrap">
              <span class="text-lg font-bold text-foreground text-no-wrap">ProTable 搜索表格</span>
              <span class="surface-info rounded-md px-sm py-xs text-xs font-semibold uppercase">
                PRO-TABLE
              </span>
            </div>
            <span class="text-sm text-muted-foreground text-ellipsis-1">
              搜索面板与数据表格联动，表单提交触发服务端分页查询与重置。
            </span>
          </div>
        </div>
      </div>
    </header>

    <SearchPanel
      @search="onSearch"
      @reset="onReset"
    />

    <TablePanel
      ref="tablePanelRef"
      :search-params="searchParams"
    />
  </div>
</template>
