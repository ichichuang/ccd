import { useLayoutStore } from '@/stores'
import { computed, defineComponent } from 'vue'
import DesktopTitle from './components/DesktopTitle.vue'
import MobileTitle from './components/MobileTitle.vue'

export default defineComponent({
  name: 'AppTitle',
  setup() {
    const layoutStore = useLayoutStore()
    const isMobile = computed(() => layoutStore.getIsMobile)
    return () => (
      <div class="select-none full center">
        {isMobile.value ? <MobileTitle /> : <DesktopTitle />}
      </div>
    )
  },
})
