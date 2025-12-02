<script setup lang="ts">
import { useSizeStore } from '@/stores'
import { useI18nSizeOptions } from '@/utils'
import { computed, type ComputedRef } from 'vue'

const sizeStore = useSizeStore()

const sizeOptions = useI18nSizeOptions() as ComputedRef<SizeOptions[]>
const size = computed(() => sizeStore.getSize)

const setSize = (value: SizeOptions['value']) => {
  sizeStore.setSize(value)
}
</script>
<template lang="pug">
ButtonGroup
  template(v-for='item in sizeOptions', :key='item.value')
    Button(
      :label='item.label',
      :severity='size === item.value ? "help" : "secondary"',
      @click='setSize(item.value)'
    )
</template>
