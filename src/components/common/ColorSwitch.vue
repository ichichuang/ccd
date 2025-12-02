<script setup lang="ts">
import { useColorStore } from '@/stores'
import { computed } from 'vue'

const colorStore = useColorStore()

const themeOptions = computed(() => colorStore.getThemeOptions)
const themeValue = computed(() => colorStore.getThemeValue)

const setTheme = ({ value }: { value: ThemeColor['value'] }) => {
  colorStore.setTheme(value)
}
const items = computed(() => {
  return themeOptions.value.map(item => ({
    label: item.label,
    value: item.value,
    color: item.themeColors.primary100,
    command: () => setTheme(item),
  }))
})
</script>
<template lang="pug">
SpeedDial.select-none(:model='items', type='quarter-circle', direction='up-left', :radius='140')
  template(#item='{ item, toggleCallback }')
    .c-card.c-cp.rounded-full(
      :class='item.value === themeValue ? "c-border-accent p-paddings" : ""',
      :style='{ background: item.value === themeValue ? item.color : "transparent" }',
      @click='toggleCallback'
    )
      .w-appFontSizex.h-appFontSizex.rounded-full(:style='{ background: item.color }')
//- SpeedDial.flex.select-none(:model='items', direction='up', class='items-end!')
  // 按钮插槽
  template(#button='{ toggleCallback }')
    .c-card-accent.size-1-1(@click='toggleCallback')
      OhVueIcon.w-appFontSizel.h-appFontSizel(name='ri-cake-line')

  // 列表项插槽
  template(#item='{ item, toggleCallback }')
    .w-160.between.c-card.c-cp(
      :class='item.value === themeValue ? "c-border-accent" : ""',
      @click='toggleCallback'
    )
      .w-14.h-14.rounded-full(:style='{ background: item.color }')
      .flex-1.text-ellipsis {{ item.label }}

  Toast
</template>
