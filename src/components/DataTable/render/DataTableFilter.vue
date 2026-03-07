<script setup lang="ts">
/**
 * DataTableFilter - 纯展示列筛选（#filter 槽内容）
 * 接收 filterModel、filterCallback 与 filterRenderer，渲染筛选 UI，无 Pinia/API。
 */
import type { DataTableColumn } from '../utils/types'

defineOptions({ name: 'DataTableFilter' })

export interface FilterModel {
  value: unknown
  matchMode: string
}

export interface DataTableFilterProps {
  /** 当前列筛选 model（与 PrimeVue 一致） */
  filterModel: FilterModel
  /** 应用筛选的回调（由父组件 wrap 后传入） */
  filterCallback: (value?: unknown) => void
  /** 列配置（含 filterRenderer） */
  column: DataTableColumn<unknown>
}

const props = defineProps<DataTableFilterProps>()

const filterContent = computed(() => {
  if (!props.filterModel || !props.column.filterRenderer) return null
  return props.column.filterRenderer({
    filterModel: {
      value: props.filterModel.value,
      matchMode: props.filterModel.matchMode ?? 'contains',
    },
    filterCallback: props.filterCallback,
  })
})
</script>

<template>
  <component :is="filterContent" />
</template>
