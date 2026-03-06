<script setup lang="ts">
const props = defineProps<{
  pagination: boolean
  paginationDisabled?: boolean
  globalFilter: boolean
  exportable: boolean
  selectable: boolean
  showHeader: boolean
}>()

const emit = defineEmits<{
  (e: 'update:pagination', value: boolean): void
  (e: 'update:globalFilter', value: boolean): void
  (e: 'update:exportable', value: boolean): void
  (e: 'update:selectable', value: boolean): void
  (e: 'update:showHeader', value: boolean): void
}>()

const localPagination = ref(props.pagination)
const localGlobalFilter = ref(props.globalFilter)
const localExportable = ref(props.exportable)
const localSelectable = ref(props.selectable)
const localShowHeader = ref(props.showHeader)

watch(
  () => props.pagination,
  v => (localPagination.value = v)
)
watch(
  () => props.globalFilter,
  v => (localGlobalFilter.value = v)
)
watch(
  () => props.exportable,
  v => (localExportable.value = v)
)
watch(
  () => props.selectable,
  v => (localSelectable.value = v)
)
watch(
  () => props.showHeader,
  v => (localShowHeader.value = v)
)

function sync() {
  emit('update:pagination', localPagination.value)
  emit('update:globalFilter', localGlobalFilter.value)
  emit('update:exportable', localExportable.value)
  emit('update:selectable', localSelectable.value)
  emit('update:showHeader', localShowHeader.value)
}

watch([localPagination, localGlobalFilter, localExportable, localSelectable, localShowHeader], sync)
</script>

<template>
  <div class="flex flex-col gap-sm">
    <div class="flex items-center justify-between">
      <label class="fs-sm">分页 (Pagination):</label>
      <ToggleSwitch
        v-model="localPagination"
        :disabled="paginationDisabled"
        @change="sync"
      />
    </div>

    <div class="flex items-center justify-between">
      <label class="fs-sm">全局搜索 (GlobalFilter):</label>
      <ToggleSwitch
        v-model="localGlobalFilter"
        @change="sync"
      />
    </div>

    <div class="flex items-center justify-between">
      <label class="fs-sm">导出 (Exportable):</label>
      <ToggleSwitch
        v-model="localExportable"
        @change="sync"
      />
    </div>

    <div class="flex items-center justify-between">
      <label class="fs-sm">行选择 (Selectable):</label>
      <ToggleSwitch
        v-model="localSelectable"
        @change="sync"
      />
    </div>

    <div class="flex items-center justify-between">
      <label class="fs-sm">显示表头栏 (ShowHeader):</label>
      <ToggleSwitch
        v-model="localShowHeader"
        @change="sync"
      />
    </div>
  </div>
</template>
