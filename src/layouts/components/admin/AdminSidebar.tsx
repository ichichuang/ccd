import AdminSidebarLogo from '@/layouts/components/admin/AdminSidebarLogo'
import AdminSidebarMenu from '@/layouts/components/admin/AdminSidebarMenu'
import { CScrollbar } from '@/components/CScrollbar'
import type { SidebarAnimationPhase } from '@/layouts/runtime/layoutRuntime'

export interface AdminSidebarProps {
  showSidebar: boolean
  sidebarCollapse: boolean
  sidebarVisualCollapse: boolean
  sidebarFixed: boolean
  sidebarWidthClass: string
  enableTransition: boolean
  isAnimating: boolean
  sidebarAnimationPhase: SidebarAnimationPhase
}

export default defineComponent({
  name: 'AdminSidebar',
  props: {
    showSidebar: {
      type: Boolean,
      required: true,
    },
    sidebarCollapse: {
      type: Boolean,
      required: true,
    },
    sidebarVisualCollapse: {
      type: Boolean,
      required: true,
    },
    sidebarFixed: {
      type: Boolean,
      required: true,
    },
    sidebarWidthClass: {
      type: String,
      required: true,
    },
    enableTransition: {
      type: Boolean,
      required: true,
    },
    isAnimating: {
      type: Boolean,
      default: false,
    },
    sidebarAnimationPhase: {
      type: String as PropType<SidebarAnimationPhase>,
      default: 'idle',
    },
  },
  setup(props) {
    return () => {
      if (!props.showSidebar) return null

      return (
        <aside
          class={[
            props.sidebarWidthClass,
            props.sidebarFixed ? 'admin-sidebar--fixed' : '',
            props.isAnimating ? 'admin-sidebar--animating' : '',
            props.sidebarVisualCollapse ? 'admin-sidebar--visual-collapsed' : '',
            props.enableTransition ? 'sidebar-width-transition' : '',
            'h-full min-h-0 overflow-hidden shrink-0 flex flex-col select-none [contain:layout_paint]',
          ]}
        >
          <AdminSidebarLogo />
          <CScrollbar
            native
            class="col-fill px-sm"
          >
            <AdminSidebarMenu
              sidebarCollapse={props.sidebarCollapse}
              sidebarVisualCollapse={props.sidebarVisualCollapse}
              sidebarAnimating={props.isAnimating}
              sidebarAnimationPhase={props.sidebarAnimationPhase}
            />
          </CScrollbar>
        </aside>
      )
    }
  },
})
