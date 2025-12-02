import MegaMenu from 'primevue/megamenu'
import type { MenuItem } from 'primevue/menuitem'
import { defineComponent, h } from 'vue'

export default defineComponent({
  name: 'MegaMenu',
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
        MegaMenu,
        {
          model: props.items,
          ...(props.componentsProps || {}),
        },
        slots
      )
  },
})
