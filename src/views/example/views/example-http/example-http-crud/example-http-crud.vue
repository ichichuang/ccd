<script setup lang="ts">
import type { ExampleListParams } from '@/api/modules/example'
import { useElementSize } from '@/hooks/modules/useElementSize'
import { computed, ref } from 'vue'
import Form from './components/Form.vue'
import Table from './components/Table.vue'

/* 计算table区域高度 */
const contentRef = ref<HTMLElement | null>(null)
const formContentRef = ref<HTMLElement | null>(null)

// 使用 useElementSize 监听容器尺寸变化
const { height: contentHeight } = useElementSize(contentRef, undefined, {
  mode: 'throttle',
  delay: 100,
})

const { height: formHeight } = useElementSize(formContentRef, undefined, {
  mode: 'throttle',
  delay: 100,
})

// 计算表格容器高度
const tableContentHeight = computed(() => {
  const calculatedHeight = contentHeight.value - formHeight.value
  return calculatedHeight > 0 ? calculatedHeight : 0
})

// ==================== 表格引用 ====================
const tableRef = ref<InstanceType<typeof Table> | null>(null)

// ==================== 搜索处理 ====================
const handleSearch = (params: { keyword?: string }) => {
  const searchParams: ExampleListParams = {
    keyword: params.keyword,
  }
  tableRef.value?.setSearchParams(searchParams)
}
</script>
<template lang="pug">
.full.between-col.justify-start(ref='contentRef')
  .w-full(ref='formContentRef')
    Form(@search='handleSearch')
  template(v-if='tableContentHeight > 0')
    .w-full(:style='{ height: `${tableContentHeight}px` }')
      Table(ref='tableRef')
</template>
<style lang="scss" scoped></style>
