<script setup lang="ts">
import { PAGINATION_DEFAULTS } from '../engine/config'

const props = defineProps<{
  page: number
  pageSize: number
  total: number
  pageSizeOptions?: number[]
}>()

const emit = defineEmits<{
  'update:page': [page: number]
  'update:pageSize': [pageSize: number]
}>()

const pageSizeOptionsList = computed(() =>
  (props.pageSizeOptions ?? [...PAGINATION_DEFAULTS.pageSizeOptions]).map(v => ({
    label: String(v),
    value: v,
  }))
)

function onPageChange(event: { page: number; rows: number }): void {
  emit('update:page', event.page + 1)
  if (event.rows !== props.pageSize) {
    emit('update:pageSize', event.rows)
  }
}
</script>

<template>
  <div class="row-between pt-padding-sm">
    <span class="fs-sm text-muted-foreground">
      {{ $t('proTable.total', { total }) }}
    </span>
    <Paginator
      :rows="pageSize"
      :total-records="total"
      :first="(page - 1) * pageSize"
      :rows-per-page-options="pageSizeOptionsList.map(o => o.value)"
      @page="onPageChange"
    />
  </div>
</template>
