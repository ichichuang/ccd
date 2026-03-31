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
