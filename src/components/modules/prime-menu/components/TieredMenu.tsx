import type { MenuItem } from 'primevue/menuitem'
import TieredMenu from 'primevue/tieredmenu'
import { defineComponent, h } from 'vue'

export default defineComponent({
  name: 'TieredMenu',
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
        TieredMenu,
        {
          model: props.items,
          ...(props.componentsProps || {}),
        },
        slots
      )
  },
})
