<script setup lang="ts">
import { ref } from 'vue'

const size = ref()
</script>
<template lang="pug">
.grid.grid-cols-4.center
  b.full.c-border.fs-appFontSizex.color-primary100.center Button
  .full.c-border.center.gap-gap.fs-appFontSizes
    Checkbox(v-model='size', input-id='size_small', name='size', value='Small', size='small')
    label(for='size_small') Small
  .full.c-border.center.gap-gap
    Checkbox(v-model='size', input-id='size_default', name='size', value='Default')
    label(for='size_default') Default
  .full.c-border.center.gap-gap.fs-appFontSizex
    Checkbox(v-model='size', input-id='size_large', name='size', value='Large', size='large')
    label(for='size_large') Large
</template>
<style lang="scss" scope></style>
