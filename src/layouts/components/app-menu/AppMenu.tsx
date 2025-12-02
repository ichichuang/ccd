import { useLayoutStore } from '@/stores'
import { computed, defineComponent } from 'vue'
import DesktopMenu from './components/DesktopMenu.vue'
import MobileMenu from './components/MobileMenu.vue'

export default defineComponent({
  name: 'AppUser',
  setup() {
    const layoutStore = useLayoutStore()
    const isMobile = computed(() => layoutStore.getIsMobile)
    return () => (
      <div class="select-none h-full between-start">
        {isMobile.value ? <MobileMenu /> : <DesktopMenu />}
      </div>
    )
  },
})
