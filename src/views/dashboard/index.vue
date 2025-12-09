<script setup lang="ts">
import PvButton from './components/PvButton.vue'
import PvCascadeSelect from './components/PvCascadeSelect.vue'
import PvCheckbox from './components/PvCheckbox.vue'
import PvInput from './components/PvInput.vue'

// 设置组件名称，用于 keep-alive 匹配
defineOptions({
  name: 'Dashboard',
})
</script>
<template lang="pug">
.container.between-col.justify-start.gap-gapl
  .grid.grid-cols-4.center
    b.center component
    b.center.fs-appFontSizes small
    b.center default
    b.center.fs-appFontSizex large
  PvButton
  PvCascadeSelect
  PvCheckbox
  PvInput
</template>
