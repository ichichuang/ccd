<script setup lang="ts">
import { useSizeStore } from '@/stores'
import { useI18nFontSizeOptions } from '@/utils'
import { computed, type ComputedRef } from 'vue'

const sizeStore = useSizeStore()

/* 尺寸变量配置相关 fontSize */
const fontSizeOptions = useI18nFontSizeOptions() as ComputedRef<FontSizeOptions[]>
const fontSize = computed(() => sizeStore.getFontSize)

const setFontSize = (value: FontSizeOptions['key']) => {
  sizeStore.setFontSize(value)
}
</script>
<template lang="pug">
ButtonGroup
  template(v-for='item in fontSizeOptions', :key='item.value')
    Button(
      :label='item.label',
      :severity='fontSize === item.key ? "help" : "secondary"',
      @click='setFontSize(item.key)'
    )
</template>
