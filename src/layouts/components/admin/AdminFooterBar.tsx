import { defineComponent } from 'vue'

export interface AdminFooterBarProps {
  show: boolean
}

export default defineComponent({
  name: 'AdminFooterBar',
  props: {
    show: {
      type: Boolean,
      required: true,
    },
  },
  setup(props) {
    return () => {
      if (!props.show) return null

      return (
        <footer class="w-full h-footerHeight flex items-center justify-center px-padding-lg border-t border-border fs-sm text-muted-foreground">
          <div>footer</div>
        </footer>
      )
    }
  },
})
