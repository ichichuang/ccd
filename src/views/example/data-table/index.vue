<script setup lang="tsx">
import { createA4Columns, a4ApiConfig, A4_PAGE_SIZE, type PostItem } from './configs/a4ApiConfig'
import { DataTable as CDataTable } from '@/components/DataTable'
import { useTableDrawerStore } from '@/stores/modules/tableDrawer'
import { castRecord } from '@/utils/typeCasters'

defineOptions({ name: 'DataTableExampleIndex' })

const drawerStore = useTableDrawerStore()

const columns = createA4Columns((row: PostItem) => drawerStore.openDrawer(castRecord(row)))

function handleDrawerVisibleChange(v: boolean) {
  if (!v) drawerStore.closeDrawer()
}
</script>

<template>
  <div
    data-archetype="A4-table-drawer"
    class="h-full flex flex-col overflow-hidden"
  >
    <div
      data-region="toolbar"
      class="shrink-0 flex items-center justify-between gap-lg px-padding-lg py-padding-md border-b-default"
    >
      <span class="fs-sm text-muted-foreground">数据管理</span>
      <Button
        label="新建"
        icon="i-lucide-plus"
        size="small"
        @click="drawerStore.openDrawer(null)"
      />
    </div>

    <div
      data-region="datatable"
      class="flex-1 min-h-0"
    >
      <CDataTable
        table-id="example-a4-datatable"
        :columns="columns"
        :api="a4ApiConfig"
        size="large"
        pagination
        :paginator-config="{ rows: A4_PAGE_SIZE }"
        show-header
        global-filter
        exportable
        bordered
        show-gridlines
        row-hover
      />
    </div>

    <div
      data-region="drawer"
      class="contents"
    >
      <Drawer
        :visible="drawerStore.drawerVisible"
        position="right"
        :header="drawerStore.selectedRow ? '查看详情' : '新建记录'"
        class="w-full max-w-[min(24rem,90vw)] glass-surface shadow-float"
        @update:visible="handleDrawerVisibleChange"
      >
        <template v-if="drawerStore.selectedRow">
          <pre class="fs-sm text-muted-foreground m-0 whitespace-pre-wrap">{{
            JSON.stringify(drawerStore.selectedRow, null, 2)
          }}</pre>
        </template>
        <template v-else>
          <p class="text-muted-foreground fs-sm m-0">表单占位，后续接入 SchemaForm。</p>
        </template>
      </Drawer>
    </div>
  </div>
</template>
