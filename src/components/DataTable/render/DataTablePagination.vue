<script setup lang="ts">
/**
 * DataTablePagination - 纯展示分页器
 * 仅通过 props 接收数据、通过 emit 上报翻页/每页条数变更，无 Pinia/API。
 */
import Paginator from 'primevue/paginator'

defineOptions({ name: 'DataTablePagination' })

export interface DataTablePaginationProps {
  /** 每页条数 */
  rows: number
  /** 当前第一条记录的偏移（first） */
  first: number
  /** 总记录数 */
  totalRecords: number
  /** 每页条数选项 */
  rowsPerPageOptions?: number[]
  /** PrimeVue Paginator 模板名 */
  template?: string
}

withDefaults(defineProps<DataTablePaginationProps>(), {
  rowsPerPageOptions: () => [10, 20, 50, 100],
  template: 'FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown',
})

const emit = defineEmits<{
  (e: 'page', event: { page: number; rows: number; first: number; totalRecords?: number }): void
  (e: 'update:page', page: number): void
  (e: 'update:limit', limit: number): void
  (e: 'change', event: { page: number; rows: number; first: number; totalRecords?: number }): void
}>()

function onPage(event: { page: number; rows: number; first: number; totalRecords?: number }) {
  emit('page', event)
  emit('update:page', event.page + 1)
  emit('update:limit', event.rows)
  emit('change', event)
}
</script>

<template>
  <div class="border-t-default bg-card rounded-b-[var(--radius-md)]">
    <Paginator
      :rows="rows"
      :first="first"
      :total-records="totalRecords"
      :rows-per-page-options="rowsPerPageOptions"
      :template="template"
      @page="onPage"
    />
  </div>
</template>
