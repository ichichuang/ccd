import { useLayoutStore } from '@/stores/modules/system'
import AdminSidebarLogo from '@/layouts/components/admin/AdminSidebarLogo'
import AdminSidebarMenu from '@/layouts/components/admin/AdminSidebarMenu'
import { CScrollbar } from '@/components/CScrollbar'

export interface AdminSidebarProps {
  mode: AdminLayoutMode
  showSidebar: boolean
  sidebarCollapse: boolean
  sidebarFixed: boolean
  sidebarWidthClass: string
}

export default defineComponent({
  name: 'AdminSidebar',
  props: {
    mode: {
      type: String as PropType<AdminLayoutMode>,
      required: true,
    },
    showSidebar: {
      type: Boolean,
      required: true,
    },
    sidebarCollapse: {
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
  },
  setup(props) {
    const layoutStore = useLayoutStore()
    const isHorizontal = computed(() => props.mode === 'horizontal')

    return () => {
      if (!props.showSidebar || isHorizontal.value) return null

      return (
        <aside
          class={[
            props.sidebarWidthClass,
            props.sidebarFixed ? 'admin-sidebar--fixed' : '',
            layoutStore.enableTransition ? 'sidebar-width-transition' : '',
            props.sidebarCollapse ? 'gap-md' : '',
            'h-full min-h-0 overflow-hidden shrink-0 transition-all duration-md ease-out flex flex-col select-none',
          ]}
        >
          <AdminSidebarLogo />
          <CScrollbar class="col-fill px-sm">
            <AdminSidebarMenu sidebarCollapse={props.sidebarCollapse} />
          </CScrollbar>
        </aside>
      )
    }
  },
})
