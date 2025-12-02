import Menubar from 'primevue/menubar'
import type { MenuItem } from 'primevue/menuitem'
import { defineComponent, h } from 'vue'

export default defineComponent({
  name: 'Menubar',
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
        Menubar,
        {
          model: props.items,
          ...(props.componentsProps || {}),
        },
        slots
      )
  },
})
