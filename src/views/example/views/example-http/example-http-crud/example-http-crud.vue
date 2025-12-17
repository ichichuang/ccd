<script setup lang="ts">
import { computed, ref } from 'vue'
import Form from './components/Form.vue'
import Table from './components/Table.vue'

/* 计算table区域高度 */
const contentRef = ref<HTMLElement>()
const formContentRef = ref<HTMLElement>()
const tableContentHeight = computed(() => {
  return (contentRef.value?.offsetHeight || 0) - (formContentRef.value?.offsetHeight || 0) || 0
})
console.log(tableContentHeight.value)
</script>
<template lang="pug">
.full.between-col.justify-start(ref='contentRef')
  .w-full(ref='formContentRef')
    Form
  template(v-if='tableContentHeight > 0')
    .w-full(:style='{ height: `${tableContentHeight}px` }')
      Table
</template>
<style lang="scss" scope></style>
