<script setup lang="ts">
import { useSizeStore } from '@/stores'
import { useI18nPaddingOptions } from '@/utils'
import { computed, type ComputedRef } from 'vue'

const sizeStore = useSizeStore()

/* 尺寸变量配置相关 padding */
const paddingOptions = useI18nPaddingOptions() as ComputedRef<PaddingOptions[]>
const padding = computed(() => sizeStore.getPadding)

const setPadding = (value: PaddingOptions['key']) => {
  sizeStore.setPadding(value)
}
</script>
<template lang="pug">
ButtonGroup
  template(v-for='item in paddingOptions', :key='item.value')
    Button(
      :label='item.label',
      :severity='padding === item.key ? "help" : "secondary"',
      @click='setPadding(item.key)'
    )
</template>
