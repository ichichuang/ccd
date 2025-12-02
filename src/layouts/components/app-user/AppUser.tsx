import { useLayoutStore } from '@/stores'
import { computed, defineComponent } from 'vue'
import DesktopUser from './components/DesktopUser.vue'
import MobileUser from './components/MobileUser.vue'

export default defineComponent({
  name: 'AppUser',
  setup() {
    const layoutStore = useLayoutStore()
    const isMobile = computed(() => layoutStore.getIsMobile)
    return () => (
      <div class="select-none h-full between-start">
        {isMobile.value ? <MobileUser /> : <DesktopUser />}
      </div>
    )
  },
})
