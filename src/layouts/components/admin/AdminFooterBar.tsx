import { defineComponent } from 'vue'
import { useI18n } from 'vue-i18n'

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
    const { t } = useI18n()
    return () => {
      if (!props.show) return null

      return (
        <footer class="w-full h-footerHeight flex items-center justify-center px-padding-lg fs-sm text-muted-foreground">
          <div>{t('layout.footer')}</div>
        </footer>
      )
    }
  },
})
