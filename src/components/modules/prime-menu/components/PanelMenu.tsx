import type { MenuItem } from 'primevue/menuitem'
import PanelMenu from 'primevue/panelmenu'
import { defineComponent, h } from 'vue'

export default defineComponent({
  name: 'PanelMenu',
  props: {
    type: {
      type: String,
      required: true,
    },
    items: {
      type: Array as () => MenuItem[],
      default: () => [],
    },
    componentsProps: {
      type: Object,
      default: () => ({}),
    },
  },
  setup(props, { slots }) {
    return () => {
      const componentsProps = props.componentsProps || {}

      return h(
        PanelMenu,
        {
          model: props.items,
          // 如果 componentsProps 为空对象，不传递任何属性，使用 PrimeVue 的默认值（multiple: false）
          // 如果 componentsProps 有值，则展开传递
          ...(Object.keys(componentsProps).length > 0 ? componentsProps : {}),
        },
        slots
      )
    }
  },
})
