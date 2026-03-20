import { defineComponent } from 'vue'
import { brand } from '@/constants/brand'

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
    const appVersion: string =
      typeof __APP_INFO__ === 'object' && __APP_INFO__ !== null
        ? (__APP_INFO__?.pkg?.version ?? '')
        : (() => {
            try {
              const parsed = JSON.parse(__APP_INFO__ as string) as { pkg?: { version?: string } }
              return parsed?.pkg?.version ?? ''
            } catch {
              return ''
            }
          })()
    const version = appVersion ? `v${appVersion}` : ''

    return () => {
      if (!props.show) return null

      return (
        <footer class="w-full h-footerHeight center px-lg text-xs text-muted-foreground">
          <div class="center flex-wrap gap-x-gap-md gap-y-gap-xs">
            <span>{brand.displayName}</span>
            {version && (
              <>
                <span class="text-border">·</span>
                <span>{version}</span>
              </>
            )}
            {brand.description && (
              <>
                <span class="text-border">·</span>
                <span
                  class="max-w-[50vw] truncate"
                  title={brand.description}
                >
                  {brand.description}
                </span>
              </>
            )}
          </div>
        </footer>
      )
    }
  },
})
