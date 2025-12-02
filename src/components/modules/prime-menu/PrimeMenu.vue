<script setup lang="ts">
import { computed } from 'vue'
import CustomMenu from './components/CustomMenu.tsx'
import MegaMenu from './components/MegaMenu.tsx'
import Menubar from './components/Menubar.tsx'
import PanelMenu from './components/PanelMenu.tsx'
import TieredMenu from './components/TieredMenu.tsx'
import type { MenuType, TypedMenuProps } from './utils/types.ts'

const props = withDefaults(defineProps<TypedMenuProps<MenuType>>(), {
  type: 'custom' as const,
  items: () => [] as any[], // 使用 any[] 作为默认值，因为类型是动态的
  componentsProps: () => ({}),
})

// 根据类型选择对应的菜单组件
const menuComponents = {
  custom: CustomMenu,
  mega: MegaMenu,
  bar: Menubar,
  panel: PanelMenu,
  tier: TieredMenu,
} as const

const childProps = computed(() => {
  // 如果 componentsProps 是空对象，不传递它，让子组件使用默认值
  const componentsProps = props.componentsProps
  const isEmpty = !componentsProps || Object.keys(componentsProps).length === 0

  return {
    type: props.type,
    items: props.items,
    // 只有当 componentsProps 有值时才传递
    ...(isEmpty ? {} : { componentsProps }),
  }
})
</script>

<template lang="pug">
component(:is='menuComponents[props.type]', v-bind='childProps')
  template(#headericon='{ item, class: iconClass }')
    OhVueIcon(
      v-if='item?.icon',
      :name='item.icon',
      :class='[iconClass, "w-appFontSize h-appFontSize"]'
    )
  template(#itemicon='{ item, class: iconClass }')
    OhVueIcon(
      v-if='item?.icon',
      :name='item.icon',
      :class='[iconClass, "w-appFontSizes h-appFontSizes"]'
    )
</template>
