<script setup lang="ts">
import { ref } from 'vue'

const value1 = ref()
const value2 = ref()
const value3 = ref()
</script>
<template lang="pug">
.grid.grid-cols-4.center
  b.full.c-border.fs-appFontSizex.color-primary100.center InputText
  .full.c-border.center
    InputText(v-model='value1', size='small', placeholder='Small')
  .full.c-border.center
    InputText(v-model='value2', placeholder='Default')
  .full.c-border.center
    InputText(v-model='value3', size='large', placeholder='Large')
</template>
<style lang="scss" scope></style>
