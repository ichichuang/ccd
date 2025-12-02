<script setup lang="ts">
import { goToRoute } from '@/common'
import { useLocale } from '@/hooks'

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

const { $t } = useLocale()
</script>
<template lang="pug">
Breadcrumb.fs-appFontSize(class='md:hidden', :model='props.items')
  template(#item='{ item }')
    template(v-if='!item.route')
      template(v-if='item.label === props.currentRouteTitle')
        span.select-none.fs-appFontSizes(class='sm:fs-appFontSize') {{ item.label }}
      template(v-else)
        span.color-text200.select-none.fs-appFontSizes {{ item.label }}
Breadcrumb.fs-appFontSizes.hidden(class='md:block', :home='props.home', :model='props.items')
  template(#item='{ item }')
    template(v-if='item.route')
      .center(v-tooltip.bottom='$t("layout.breadcrumb.backToHome")')
        OhVueIcon.c-cp.w-appFontSizex.h-appFontSizex(
          v-if='item.icon',
          @click='goToRoute(item.route)',
          :name='item.icon',
          animation='spin',
          speed='slow',
          hover
        )
    template(v-else)
      template(v-if='item.label === props.currentRouteTitle')
        span.select-none.fs-appFontSize {{ item.label }}
      template(v-else)
        span.color-text200.select-none {{ item.label }}
</template>
<style lang="scss" scoped></style>
