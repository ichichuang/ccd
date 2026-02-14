import { computed, defineComponent, type PropType } from 'vue'
import Button from 'primevue/button'
import Menubar from 'primevue/menubar'
import { Icons } from '@/components/Icons'
import GlobalSetting from '@/layouts/components/GlobalSetting/index.vue'
import User from '@/layouts/components/User/index.vue'
import { AUTH_ENABLED } from '@/constants/router'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import {
  getAdminMenuTree,
  getAuthorizedMenuTree,
  getActiveMenuPath,
  goToRoute,
  menuItemToPrimeModel,
  type PrimeMenuModelItem,
} from '@/router/utils/helper'
import { useUserStore } from '@/stores/modules/user'

export interface AdminHeaderProps {
  mode: AdminLayoutMode
  showHeader: boolean
  showLogo: boolean
  showMenu: boolean
  headerFixed: boolean
  isDark: boolean
  isAnimating: boolean
  onToggleTheme: (event: MouseEvent) => void | Promise<void>
  /** 是否显示侧边栏展开/收缩按钮（vertical/mix 且 showSidebar 时为 true） */
  showSidebarToggle: boolean
  sidebarCollapse: boolean
  onToggleCollapse: (event: MouseEvent) => void
}

export default defineComponent({
  name: 'AdminHeader',
  props: {
    mode: {
      type: String as PropType<AdminLayoutMode>,
      required: true,
    },
    showHeader: {
      type: Boolean,
      required: true,
    },
    showLogo: {
      type: Boolean,
      required: true,
    },
    showMenu: {
      type: Boolean,
      required: true,
    },
    headerFixed: {
      type: Boolean,
      required: true,
    },
    isDark: {
      type: Boolean,
      required: true,
    },
    isAnimating: {
      type: Boolean,
      required: true,
    },
    onToggleTheme: {
      type: Function as PropType<(event: MouseEvent) => void | Promise<void>>,
      required: true,
    },
    showSidebarToggle: {
      type: Boolean,
      required: true,
    },
    sidebarCollapse: {
      type: Boolean,
      required: true,
    },
    onToggleCollapse: {
      type: Function as PropType<(event: MouseEvent) => void>,
      required: true,
    },
  },
  setup(props) {
    const { t } = useI18n()
    const route = useRoute()
    const userStore = useUserStore()

    const isHorizontal = computed(() => props.mode === 'horizontal')
    const isMix = computed(() => props.mode === 'mix')
    const userRoles = computed(() => userStore.getUserRoles || [])
    const isLogin = computed(() => userStore.getIsLogin)
    const showUserEntry = computed(() => AUTH_ENABLED && isLogin.value)

    // --- Menu Logic (Reused from AdminSidebar logic but for Horizontal) ---
    const menuModel = computed(() => {
      // In Mix mode, header might show root items only, but for now let's show full tree or
      // let the helper handle it. Usually horizontal menu shows the full authorized tree.
      // If mix mode requires split menu (header roots + sidebar children), that's a specific requirement.
      // Assuming standard horizontal menu for now.
      const tree = getAdminMenuTree()
      const authorizedTree = getAuthorizedMenuTree(userRoles.value, tree)
      return authorizedTree.map(item => menuItemToPrimeModel(item, t))
    })

    const isActiveMenuItem = (item: PrimeMenuModelItem): boolean => {
      const activePath = getActiveMenuPath(route)
      return item.route?.path === activePath
    }

    const isParentOfActive = (item: PrimeMenuModelItem): boolean => {
      const parentPaths = Array.isArray(route.meta?.parentPaths)
        ? (route.meta?.parentPaths as string[])
        : []
      return parentPaths.includes(item.key)
    }

    // --- Render Custom Menu Item (Modern Pill Style) ---
    const renderMenuItem = ({
      item,
      root,
      hasSubmenu,
    }: {
      item: PrimeMenuModelItem
      root: boolean
      hasSubmenu: boolean
    }) => {
      const isActive = isActiveMenuItem(item)
      const isParentActive = isParentOfActive(item)

      // Common: Smooth transition, flex layout
      const commonClasses =
        'flex items-center gap-sm cursor-pointer transition-all duration-scale-md ease-in-out select-none'

      // Root Item Styling: Block shape (rounded-md), subtle hover
      const rootClasses = `
        px-padding-sm py-padding-xs rounded-scale-md fs-sm font-medium
        ${
          isActive || isParentActive
            ? 'bg-primary/10 text-primary'
            : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
        }
      `

      // Submenu Item Styling: Clean block
      const subClasses = `
        px-padding-sm py-padding-sm rounded-scale-md fs-sm mx-margin-xs my-margin-xs
        ${
          isActive
            ? 'bg-primary/10 text-primary font-medium'
            : isParentActive
              ? 'text-primary bg-primary/5'
              : 'text-foreground hover:bg-accent hover:text-accent-foreground'
        }
      `

      const linkClass = `${commonClasses} ${root ? rootClasses : subClasses} ${
        root ? 'mx-margin-xs' : 'w-full'
      }`

      const content = (
        <>
          {item.icon && (
            <Icons
              name={item.icon}
              class={`shrink-0 ${root ? 'fs-lg opacity-80' : 'fs-md opacity-70'} ${
                (isActive || isParentActive) && root ? 'text-primary opacity-100' : ''
              }`}
            />
          )}
          <span class="truncate">{item.label}</span>
          {hasSubmenu && (
            <Icons
              name={root ? 'i-lucide-chevron-down' : 'i-lucide-chevron-right'}
              class={`ml-auto fs-xs opacity-50 transition-transform duration-scale-md ${
                root ? 'group-hover:rotate-180' : ''
              }`}
            />
          )}
        </>
      )

      const onClick = (e: MouseEvent) => {
        if (item.route?.path) {
          e.preventDefault()
          goToRoute(item.route?.name ?? item.route?.path, undefined, undefined, false)
        } else {
          e.preventDefault()
        }
      }

      if (item.route?.path) {
        return (
          <a
            href={item.route.path}
            role="menuitem"
            class={linkClass}
            onClick={onClick}
          >
            {content}
          </a>
        )
      }

      return (
        <div
          role="menuitem"
          class={linkClass}
          onClick={onClick}
        >
          {content}
        </div>
      )
    }

    const renderThemeAndSetting = () => (
      <div class="flex items-center gap-sm">
        {props.showSidebarToggle && (
          <Button
            variant="text"
            severity="secondary"
            class="center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            onClick={(e: Event) => props.onToggleCollapse(e as MouseEvent)}
          >
            <Icons
              name={
                props.sidebarCollapse ? 'i-lucide-panel-left-open' : 'i-lucide-panel-left-close'
              }
              size="xl"
            />
          </Button>
        )}
        <Button
          variant="text"
          severity="secondary"
          class="center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          disabled={props.isAnimating}
          onClick={(e: Event) => props.onToggleTheme(e as MouseEvent)}
        >
          <Icons
            name={props.isDark ? 'i-lucide-sun' : 'i-lucide-moon'}
            size="xl"
          />
        </Button>
        <GlobalSetting />
        {showUserEntry.value && <User />}
      </div>
    )

    return () => {
      if (!props.showHeader) return null

      return (
        <header
          class={[
            'w-full h-headerHeight flex items-center justify-between px-padding-lg border-b border-border bg-background/80 backdrop-blur-md z-30 transition-all sticky top-0',
            props.headerFixed ? 'admin-header--fixed' : '',
          ]}
        >
          {/* Left: Logo */}
          <div class="flex items-center gap-md shrink-0">
            {props.showLogo && (
              <div
                class="flex items-center gap-sm cursor-pointer hover:opacity-80 transition-opacity"
                onClick={() => goToRoute('/')}
              >
                <div class="w-[var(--spacing-xl)] h-[var(--spacing-xl)] rounded-scale-xl bg-primary text-primary-foreground flex items-center justify-center shadow-lg shadow-primary/20">
                  <span class="fs-md font-bold">C</span>
                </div>
                <div class="hidden md:flex flex-col leading-none">
                  <span class="fs-sm font-bold tracking-tight">{t('layout.appName')}</span>
                  <span class="fs-xs text-muted-foreground font-medium">
                    {t('layout.appSubtitle')}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Middle: Horizontal Menu */}
          {props.showMenu && (isHorizontal.value || isMix.value) && (
            <div class="flex-1 min-w-0 px-padding-lg flex justify-start">
              <Menubar
                model={menuModel.value}
                class="admin-menubar w-full border-none bg-transparent p-0"
                v-slots={{
                  item: renderMenuItem,
                }}
                pt={{
                  root: { class: 'bg-transparent border-none' },
                  menu: { class: 'gap-xs' },
                }}
              />
            </div>
          )}

          {/* Right: Actions */}
          <div class="shrink-0 ml-auto flex items-center">{renderThemeAndSetting()}</div>

          <style>{`
            /* Force Hover Behavior for Desktop */
            .p-menubar .p-menuitem:hover > .p-submenu-list {
              display: block !important;
              animation: slideUpIn var(--transition-md) ease-out forwards;
            }

            /* Dropdown styling overriding PrimeVue defaults */
            :deep(.p-submenu-list) {
              background: rgb(var(--background) / 0.95);
              backdrop-filter: blur(var(--spacing-sm));
              border-radius: var(--radius-md);
              border: 1px solid rgb(var(--border));
              box-shadow: var(--shadow-md, 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06));
              padding: var(--spacing-xs);
              min-width: var(--spacing-4xl);
              z-index: 100;
              margin-top: var(--spacing-xs);
            }
            :deep(.dark .p-submenu-list) {
              background: rgb(var(--background) / 0.95);
            }

            /* Submenu Animation */
            @keyframes slideUpIn {
              from {
                opacity: 0;
                transform: translateY(var(--spacing-xs));
              }
              to {
                opacity: 1;
                transform: translateY(0);
              }
            }
          `}</style>
        </header>
      )
    }
  },
})
