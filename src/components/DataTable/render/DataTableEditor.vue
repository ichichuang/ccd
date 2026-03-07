<script setup lang="ts">
/**
 * DataTableEditor - 纯展示单元格编辑器（#editor 槽内容）
 * 仅通过 props 接收 data/value/field 并渲染 editorRenderer，Enter 时 emit，无 Pinia/API。
 */
defineOptions({ name: 'DataTableEditor' })

export interface DataTableEditorProps {
  /** 当前行数据 */
  data: Record<string, unknown>
  /** 当前单元格值 */
  value: unknown
  /** 字段名 */
  field: string
  /** 列 editorRenderer：接收 data/value/field 返回 VNode/string（data: object 兼容父组件 T extends object） */
  editorRenderer: (params: {
    data: object
    value: unknown
    field: string
  }) => import('vue').VNode | string
}

const props = defineProps<DataTableEditorProps>()

const emit = defineEmits<{
  (e: 'enter', event: Event): void
}>()

const editorContent = computed(() =>
  props.editorRenderer({
    data: props.data,
    value: props.value,
    field: props.field,
  })
)

function onKeydown(e: Event) {
  emit('enter', e)
}
</script>

<template>
  <div
    class="w-full h-full min-w-0 max-h-full overflow-hidden flex items-center"
    @keydown.enter.capture.prevent="onKeydown"
  >
    <component
      :is="editorContent"
      v-if="typeof editorContent === 'object' && editorContent"
    />
    <template v-else-if="typeof editorContent === 'string'">
      {{ editorContent }}
    </template>
  </div>
</template>
