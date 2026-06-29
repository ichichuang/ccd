<script setup lang="ts">
defineOptions({ name: 'ProTablePagination' })

import Paginator from 'primevue/paginator'
import Select from 'primevue/select'
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
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

const { t } = useI18n()
const pageSizeOptions = computed(() =>
  (props.pageSizeOptions ?? [...PAGINATION_DEFAULTS.pageSizeOptions]).map(v => ({
    label: String(v),
    value: v,
  }))
)

function onPageChange(event: { page: number; rows: number }): void {
  const nextPage = event.page + 1
  const nextRows = event.rows
  if (nextPage === props.page && nextRows === props.pageSize) return
  if (nextPage !== props.page) emit('update:page', nextPage)
  if (nextRows !== props.pageSize) emit('update:pageSize', nextRows)
}

function handlePageSizeChange(next: number): void {
  if (next === props.pageSize) return
  emit('update:pageSize', next)
}
</script>

<template>
  <div class="row-between px-sm">
    <span class="text-sm text-muted-foreground">
      {{ t('proTable.total', { total }) }}
    </span>
    <Paginator
      template="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink"
      :rows="pageSize"
      :total-records="total"
      :first="(page - 1) * pageSize"
      @page="onPageChange"
    >
      <template #end>
        <Select
          :model-value="pageSize"
          :options="pageSizeOptions"
          option-label="label"
          option-value="value"
          append-to="self"
          :aria-label="t('proTable.pageSizeAria')"
          class="pro-table-page-size ml-sm shrink-0"
          @update:model-value="handlePageSizeChange"
        />
      </template>
    </Paginator>
  </div>
</template>

<style scoped>
/* Page-size selector width. Was `min-w-[90px] w-[90px]` — a hardcoded px value in
   vue-ui-only arbitrary utilities that the host UnoCSS pipeline never generates
   (dist is excluded from the content scan), so the Select width was uncontrolled.
   Scoped CSS ships in dist/vue-ui.css and uses a spacing token instead of raw px. */
.pro-table-page-size {
  width: var(--spacing-4xl);
}
</style>
