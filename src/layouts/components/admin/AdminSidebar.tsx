import AdminSidebarLogo from '@/layouts/components/admin/AdminSidebarLogo'
import AdminSidebarMenu from '@/layouts/components/admin/AdminSidebarMenu'
import { CScrollbar } from '@/components/CScrollbar'
import type { SidebarState } from '@/layouts/runtime/layoutRuntime'

export interface AdminSidebarProps {
  showSidebar: boolean
  sidebarVisualCollapse: boolean
  sidebarFixed: boolean
  sidebarWidthClass: string
  enableTransition: boolean
  isAnimating: boolean
  sidebarState: SidebarState
}

export default defineComponent({
  name: 'AdminSidebar',
  props: {
    showSidebar: {
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
    sidebarState: {
      type: String as PropType<SidebarState>,
      default: 'expanded',
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
            `admin-sidebar--${props.sidebarState}`,
            props.enableTransition ? 'sidebar-width-transition' : '',
            'h-full min-h-0 overflow-hidden shrink-0 flex flex-col select-none [contain:layout_paint]',
          ]}
        >
          <AdminSidebarLogo />
          <CScrollbar
            class="col-fill min-h-0 px-sm"
            options={{
              overflow: {
                x: 'hidden',
              },
            }}
          >
            <AdminSidebarMenu sidebarState={props.sidebarState} />
          </CScrollbar>
        </aside>
      )
    }
  },
})
