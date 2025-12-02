<script setup lang="ts">
import { useSizeStore } from '@/stores'
import { useI18nRoundedOptions } from '@/utils'
import { computed, type ComputedRef } from 'vue'

const sizeStore = useSizeStore()

/* 尺寸变量配置相关 rounded */
const roundedOptions = useI18nRoundedOptions() as ComputedRef<RoundedOptions[]>
const rounded = computed(() => sizeStore.getRounded)

const setRounded = (value: RoundedOptions['key']) => {
  sizeStore.setRounded(value)
}
</script>
<template lang="pug">
ButtonGroup
  template(v-for='item in roundedOptions', :key='item.value')
    Button(
      :label='item.label',
      :severity='rounded === item.key ? "help" : "secondary"',
      @click='setRounded(item.key)'
    )
</template>
