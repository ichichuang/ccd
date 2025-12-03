<script setup lang="ts">
import { goToRoute } from '@/common'
import AppTopMenu from '@/layouts/components/app-menu/AppMenu'
import AppSidebar from '@/layouts/components/app-sidebar/AppSidebar.vue'
import Image from 'primevue/image'
</script>
<template lang="pug">
.full.between.gap-gap
  .center.py-paddings.gap-gap
    .w-appFontSizel.h-appFontSizel(@touch='goToRoute("")', @click='goToRoute("")')
      Image.full(src='./face.png')
  .center.flex-1
    AppSidebar
  AppTopMenu
</template>
<style lang="scss" scoped></style>
