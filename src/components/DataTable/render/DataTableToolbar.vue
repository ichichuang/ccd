<script setup lang="ts">
/**
 * DataTableToolbar - 纯展示工具栏
 * 仅通过 props 接收数据、通过 emit 上报操作，无 Pinia/API。
 */
defineOptions({ name: 'DataTableToolbar' })

export interface DataTableToolbarProps {
  /** 是否显示全局搜索框 */
  globalFilter?: boolean
  /** 搜索框当前值（受控） */
  searchValue?: string
  /** 搜索框占位文案 */
  searchPlaceholder?: string
  /** 是否显示导出按钮 */
  exportable?: boolean
  /** 导出按钮文案 */
  exportLabel?: string
  /** 是否显示刷新按钮 */
  showRefresh?: boolean
  /** 刷新按钮文案 */
  refreshLabel?: string
  /** 是否加载中（可选，用于禁用或样式） */
  loading?: boolean
}

withDefaults(defineProps<DataTableToolbarProps>(), {
  globalFilter: false,
  searchValue: '',
  searchPlaceholder: '',
  exportable: false,
  exportLabel: '',
  showRefresh: false,
  refreshLabel: '',
  loading: false,
})

const emit = defineEmits<{
  (e: 'update:searchValue', value: string): void
  (e: 'refresh'): void
  (e: 'export', format: 'csv' | 'xlsx' | 'json'): void
  (e: 'clearFilters'): void
}>()

function onSearchInput(val: string | undefined) {
  emit('update:searchValue', val ?? '')
}

function onExport() {
  emit('export', 'csv')
}

function onRefresh() {
  emit('refresh')
}

function onClearFilters() {
  emit('clearFilters')
}
</script>

<template>
  <div
    v-if="
      $slots.header ||
      $slots['header-left'] ||
      $slots['header-right'] ||
      globalFilter ||
      exportable ||
      showRefresh
    "
    class="c-data-table-header flex justify-between items-center gap-sm px-padding-md py-padding-sm"
  >
    <template v-if="$slots.header">
      <slot name="header" />
    </template>
    <template v-else>
      <div class="flex-1 flex items-center gap-md">
        <slot name="header-left" />
      </div>
      <div class="flex gap-md items-center fs-md">
        <slot name="header-right" />
        <IconField
          v-if="globalFilter"
          class="flex items-center"
        >
          <InputIcon>
            <Icons
              name="i-lucide-search"
              size="sm"
            />
          </InputIcon>
          <InputText
            :model-value="searchValue"
            :placeholder="searchPlaceholder"
            class="min-w-[var(--spacing-4xl)] sm:min-w-[var(--spacing-5xl)] max-w-full"
            @update:model-value="onSearchInput"
          />
          <span
            v-if="searchValue"
            class="cursor-pointer inline-flex"
            @click="onClearFilters"
          >
            <InputIcon>
              <Icons
                name="i-lucide-x"
                size="sm"
              />
            </InputIcon>
          </span>
        </IconField>
        <Button
          v-if="exportable"
          severity="secondary"
          size="small"
          class="gap-sm"
          @click="onExport"
        >
          <Icons
            name="i-lucide-download"
            size="sm"
          />
          <span>{{ exportLabel }}</span>
        </Button>
        <Button
          v-if="showRefresh"
          severity="secondary"
          size="small"
          class="gap-sm"
          @click="onRefresh"
        >
          <Icons
            name="i-lucide-refresh-cw"
            size="sm"
          />
          <span>{{ refreshLabel }}</span>
        </Button>
      </div>
    </template>
  </div>
</template>
