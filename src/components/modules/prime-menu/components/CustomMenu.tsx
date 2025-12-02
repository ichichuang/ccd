import Menu from 'primevue/menu'
import type { MenuItem } from 'primevue/menuitem'
import { defineComponent, h } from 'vue'

export default defineComponent({
  name: 'CustomMenu',
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
    return () =>
      h(
        Menu,
        {
          model: props.items,
          ...(props.componentsProps || {}),
        },
        slots
      )
  },
})
