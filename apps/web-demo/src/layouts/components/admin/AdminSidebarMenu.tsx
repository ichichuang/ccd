import { h, type PropType } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import {
  getAdminMenuTree,
  getAuthorizedMenuTree,
  menuItemToPrimeModel,
} from '@/router/utils/helper'
import { useLayoutStore } from '@/stores/modules/system'
import { useUserStore } from '@/stores/modules/session'
import type { SidebarState } from '@/layouts/runtime/layoutRuntime'
import inlineSidebarMenu from '@/layouts/components/admin/AdminSidebarMenuInline'
import collapsedSidebarMenu from '@/layouts/components/admin/AdminSidebarMenuCollapsed'
import {
  areExpandedKeyRecordsEqual,
  buildSidebarRouteSyncStamp,
  buildExpandedKeysForRoute,
  type SidebarMenuDensity,
} from '@/layouts/components/admin/adminSidebarMenu.shared'

export interface AdminSidebarMenuProps {
  sidebarState: SidebarState
  density?: SidebarMenuDensity
}

export default defineComponent({
  name: 'AdminSidebarMenu',
  props: {
    sidebarState: {
      type: String as PropType<SidebarState>,
      required: true,
    },
    density: {
      type: String as PropType<SidebarMenuDensity>,
      default: 'regular',
    },
  },
  setup(props) {
    const { t } = useI18n()
    const route = useRoute()
    const layoutStore = useLayoutStore()
    const userStore = useUserStore()
    const userRoles = computed(() => userStore.getUserRoles || [])
    const userPermissions = computed(() => userStore.getUserPermissions || [])

    const panelMenuModel = computed(() => {
      const tree = getAdminMenuTree()
      const authorizedTree = getAuthorizedMenuTree(userRoles.value, userPermissions.value, tree)
      return authorizedTree.map(item => menuItemToPrimeModel(item, t))
    })

    const allowMultiple = computed(() => !layoutStore.sidebarUniqueOpened)
    const rootKeys = computed(() =>
      panelMenuModel.value
        .map(item => item.key)
        .filter((key): key is string => typeof key === 'string' && key.length > 0)
    )

    const syncExpandedKeysToRoute = (): void => {
      const nextKeys = buildExpandedKeysForRoute(route, allowMultiple.value, rootKeys.value)
      if (!areExpandedKeyRecordsEqual(nextKeys, layoutStore.getExpandedMenuKeys)) {
        layoutStore.setExpandedMenuKeys(nextKeys)
      }
    }

    watch(
      () => props.sidebarState,
      sidebarState => {
        if (sidebarState === 'expanded' || sidebarState === 'expanded-shell') {
          syncExpandedKeysToRoute()
          return
        }

        if (Object.keys(layoutStore.getExpandedMenuKeys).length > 0) {
          layoutStore.setExpandedMenuKeys({})
        }
      },
      { immediate: true }
    )

    watch(
      () => buildSidebarRouteSyncStamp(route),
      () => {
        if (props.sidebarState !== 'expanded' && props.sidebarState !== 'expanded-shell') return
        syncExpandedKeysToRoute()
      },
      { immediate: true }
    )

    watch([allowMultiple, rootKeys], () => {
      if (props.sidebarState !== 'expanded' && props.sidebarState !== 'expanded-shell') return
      syncExpandedKeysToRoute()
    })

    return () =>
      props.sidebarState === 'expanded' || props.sidebarState === 'expanded-shell'
        ? h(inlineSidebarMenu, {
            key: 'inline',
            model: panelMenuModel.value,
            allowMultiple: allowMultiple.value,
            rootKeys: rootKeys.value,
            density: props.density,
            sidebarState: props.sidebarState,
          })
        : h(collapsedSidebarMenu, {
            key: 'collapsed',
            model: panelMenuModel.value,
            density: props.density,
          })
  },
})
