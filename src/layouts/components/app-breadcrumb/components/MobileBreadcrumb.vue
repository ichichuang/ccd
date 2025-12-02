<script setup lang="ts">
interface HomeConfig {
  icon: string
  route: string
}

interface BreadcrumbItem {
  label: string
  route?: string
  icon?: string
}

const props = defineProps<{
  home: HomeConfig
  items: BreadcrumbItem[]
  currentRouteTitle: string
}>()
</script>
<template lang="pug">
.fs-appFontSize(class='sm:hidden')
  b {{ props.currentRouteTitle }}
Breadcrumb.fs-appFontSize.hidden(class='sm:block', :model='props.items')
  template(#item='{ item }')
    template(v-if='!item.route')
      template(v-if='item.label === props.currentRouteTitle')
        span.select-none.fs-appFontSizes(class='sm:fs-appFontSize') {{ item.label }}
      template(v-else)
        span.color-text200.select-none {{ item.label }}
</template>
<style lang="scss" scope></style>
