import { useLayoutStore } from '@/stores'
import { computed, defineComponent } from 'vue'
import DesktopHeader from './components/DesktopHeader.vue'
import MobileHeader from './components/MobileHeader.vue'

export default defineComponent({
  name: 'AppHeader',
  setup() {
    const layoutStore = useLayoutStore()
    const isMobile = computed(() => layoutStore.getIsMobile)
    return () => (
      <div class="full between">{isMobile.value ? <MobileHeader /> : <DesktopHeader />}</div>
    )
  },
})
