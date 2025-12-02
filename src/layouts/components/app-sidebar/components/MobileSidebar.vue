<script setup lang="ts">
import { ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import Popover from 'primevue/popover'
import type { MenuItem } from 'primevue/menuitem'
import AppBreadcrumb from '@/layouts/components/app-breadcrumb/AppBreadcrumb'

const props = defineProps<{
  items: MenuItem[]
  componentsProps: Record<string, any>
}>()

type PopoverInstance = InstanceType<typeof Popover>
const menuPopoverRef = ref<PopoverInstance | null>(null)
const triggerRef = ref<HTMLElement | null>(null)
const route = useRoute()

const handleToggle = (event: MouseEvent) => {
  menuPopoverRef.value?.toggle(event)
}

const handleHide = () => {
  menuPopoverRef.value?.hide()
}

watch(
  () => route.fullPath,
  () => {
    handleHide()
  }
)
</script>
<template lang="pug">
//- 使用 AppBreadcrumb 作为触发容器
div(ref='triggerRef', role='button', tabindex='0', @click='handleToggle')
  AppBreadcrumb

//- Popover 面板
Popover.overflow-hidden.rounded-rounded(ref='menuPopoverRef', :dismissable='true')
  .full.w-80vw.h-80vh.p-0.rounded-rounded.overflow-hidden(class='sm:w-60vw', @click.self='handleHide')
    ScrollbarWrapper(
      style='background: transparent; height: 100%',
      :color-scheme='{ thumbColor: "transparent", thumbHoverColor: "transparent", thumbActiveColor: "transparent", trackColor: "transparent", trackHoverColor: "transparent", trackActiveColor: "transparent" }',
      @container-click='handleHide'
    )
      .rounded-rounded
        PrimeMenu(:type='"panel"', :items='props.items', :components-props='props.componentsProps')
</template>
