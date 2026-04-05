import type { BreakpointKey } from '@/constants/breakpoints'
import type { Orientation } from '@/types/systems/device'
import {
  DEFAULT_LAYOUT_SETTING,
  DEFAULT_LAYOUT_VISIBILITY_SETTINGS,
  LAYOUT_PERSIST_PICK,
} from '@/constants/layout'
import { useDeviceStore } from '@/stores/modules/device'
import { deepClone } from '@/utils/lodashes'
import store from '@/stores'
/** 缓存 deviceStore，避免 effectiveMode getter 每次求值都调用 useDeviceStore() */
let _deviceStore: ReturnType<typeof useDeviceStore> | null = null
import { defineStore } from 'pinia'

type LayoutModuleVisibilityKey =
  | 'showHeader'
  | 'showMenu'
  | 'showSidebar'
  | 'showBreadcrumb'
  | 'showBreadcrumbIcon'
  | 'showTabs'
  | 'showFooter'
  | 'showLogo'

const MODULE_DEPENDENCIES: Partial<Record<LayoutModuleVisibilityKey, LayoutModuleVisibilityKey[]>> =
  {
    // Header 是父模块：承载 Logo/Menu
    showHeader: ['showLogo', 'showMenu'],
    // Breadcrumb 是父模块：承载 Icon（当前 LayoutAdmin 还未渲染 icon，但语义上依赖存在）
    showBreadcrumb: ['showBreadcrumbIcon'],
  }

const MODULE_PARENT_REQUIREMENTS: Partial<
  Record<LayoutModuleVisibilityKey, LayoutModuleVisibilityKey>
> = {
  showLogo: 'showHeader',
  showMenu: 'showHeader',
  showBreadcrumbIcon: 'showBreadcrumb',
}

function enforceParentRequirements(visibility: LayoutVisibilitySetting): LayoutVisibilitySetting {
  const next: LayoutVisibilitySetting = { ...visibility }
  ;(Object.keys(MODULE_PARENT_REQUIREMENTS) as LayoutModuleVisibilityKey[]).forEach(key => {
    const parentKey = MODULE_PARENT_REQUIREMENTS[key]
    if (parentKey && !next[parentKey]) {
      next[key] = false
    }
  })
  return next
}

/**
 * 各布局模式下“不会被渲染”的模块开关，统一在 Store 层做兜底约束，
 * 避免出现“状态被打开但当前模式永远不渲染”的错配体验。
 */
const MODE_HIDDEN_MODULES: Record<AdminLayoutMode, LayoutModuleVisibilityKey[]> = {
  vertical: ['showMenu'],
  horizontal: ['showSidebar'],
  mix: [],
}

function enforceModeVisibilityConstraints(
  mode: AdminLayoutMode,
  visibility: LayoutVisibilitySetting
): LayoutVisibilitySetting {
  const next: LayoutVisibilitySetting = enforceParentRequirements(visibility)
  MODE_HIDDEN_MODULES[mode].forEach(key => {
    next[key] = false
  })
  return next
}

export const useLayoutStore = defineStore('layout', {
  state: (): LayoutStoreState => ({
    ...DEFAULT_LAYOUT_SETTING,
    visibilitySettings: deepClone(DEFAULT_LAYOUT_VISIBILITY_SETTINGS),
    // 侧边栏多级菜单展开状态（可持久化）
    expandedMenuKeys: {},
    // 模块父子联动：运行时恢复缓存（不持久化）
    moduleRestoreCache: {
      vertical: {},
      horizontal: {},
      mix: {},
    },
    // ===== 运行时 Loading（并发安全：使用计数器作为 SSOT）=====
    // 启动阶段默认处于全局 loading（由 setupPlugins finally 结束）
    loadingCount: 1,
    pageLoadingCount: 0,
    /** 全局加载遮罩（由 loadingCount 推导并同步） */
    isLoading: true,
    /** 内容区加载遮罩（由 pageLoadingCount 推导并同步） */
    isPageLoading: false,
    // [NEW] 用户手动调整标记：防止自动适配覆盖用户偏好
    userAdjusted: false,
    /** 移动端抽屉侧边栏打开状态（运行时状态，不持久化） */
    mobileDrawerOpen: false,
    /** 表单记忆指针（formId -> storageKey） */
    formMemoryPointers: {} as Record<string, string>,
  }),

  getters: {
    effectiveMode: (state): AdminLayoutMode => {
      if (!_deviceStore) _deviceStore = useDeviceStore()
      const type = _deviceStore.type
      const bp = _deviceStore.currentBreakpoint

      // 1. Drawer Zone & Narrow Fallback Zone (< 1280px)
      // Mobile device OR any breakpoint below 'xl' → horizontal (LayoutAdmin decides Drawer vs Top Menu)
      const isDrawerOrNarrow = type === 'Mobile' || ['xs', 'sm', 'md', 'lg'].includes(bp)
      if (isDrawerOrNarrow) {
        return 'horizontal'
      }

      // 2. Wide Zone (>= 1280px)
      if (type === 'Tablet') return 'vertical' // iPad Pro landscape prefers sidebar
      return state.preferredMode // PC respects user choice
    },
    mode(): AdminLayoutMode {
      return this.effectiveMode
    },
    isHorizontal(): boolean {
      return this.effectiveMode === 'horizontal'
    },
    isMix(): boolean {
      return this.effectiveMode === 'mix'
    },
    // --- active visibility (SSOT) ---
    activeVisibility(state): LayoutVisibilitySetting {
      return state.visibilitySettings[this.effectiveMode]
    },
    // --- 兼容字段：对外仍以 showXxx 形式暴露，但实际读取 activeVisibility ---
    showHeader(): boolean {
      return this.activeVisibility.showHeader
    },
    showMenu(): boolean {
      return this.activeVisibility.showMenu
    },
    showSidebar(): boolean {
      return this.activeVisibility.showSidebar
    },
    showBreadcrumb(): boolean {
      return this.activeVisibility.showBreadcrumb
    },
    showBreadcrumbIcon(): boolean {
      return this.activeVisibility.showBreadcrumbIcon
    },
    showTabs(): boolean {
      return this.activeVisibility.showTabs
    },
    showFooter(): boolean {
      return this.activeVisibility.showFooter
    },
    showLogo(): boolean {
      return this.activeVisibility.showLogo
    },
    getExpandedMenuKeys(): Record<string, boolean> {
      return this.expandedMenuKeys || {}
    },
  },

  actions: {
    setExpandedMenuKeys(keys: Record<string, boolean>) {
      this.expandedMenuKeys = keys || {}
    },
    setFormMemoryPointer(formId: string, storageKey: string) {
      this.formMemoryPointers[formId] = storageKey
    },
    /**
     * 旧版持久化迁移：
     * - 旧结构：showXxx 直接平铺在 root
     * - 新结构：visibilitySettings[mode].showXxx
     */
    migrateLegacyVisibilityIfNeeded() {
      const legacy = this.$state as unknown as Record<string, unknown>
      const hasLegacy =
        typeof legacy.showHeader === 'boolean' ||
        typeof legacy.showMenu === 'boolean' ||
        typeof legacy.showSidebar === 'boolean' ||
        typeof legacy.showBreadcrumb === 'boolean' ||
        typeof legacy.showBreadcrumbIcon === 'boolean' ||
        typeof legacy.showTabs === 'boolean' ||
        typeof legacy.showFooter === 'boolean' ||
        typeof legacy.showLogo === 'boolean'

      if (!hasLegacy) return

      const legacyVisibility: LayoutVisibilitySetting = {
        showHeader:
          (legacy.showHeader as boolean) ?? DEFAULT_LAYOUT_VISIBILITY_SETTINGS.vertical.showHeader,
        showMenu:
          (legacy.showMenu as boolean) ?? DEFAULT_LAYOUT_VISIBILITY_SETTINGS.vertical.showMenu,
        showSidebar:
          (legacy.showSidebar as boolean) ??
          DEFAULT_LAYOUT_VISIBILITY_SETTINGS.vertical.showSidebar,
        showBreadcrumb:
          (legacy.showBreadcrumb as boolean) ??
          DEFAULT_LAYOUT_VISIBILITY_SETTINGS.vertical.showBreadcrumb,
        showBreadcrumbIcon:
          (legacy.showBreadcrumbIcon as boolean) ??
          DEFAULT_LAYOUT_VISIBILITY_SETTINGS.vertical.showBreadcrumbIcon,
        showTabs:
          (legacy.showTabs as boolean) ?? DEFAULT_LAYOUT_VISIBILITY_SETTINGS.vertical.showTabs,
        showFooter:
          (legacy.showFooter as boolean) ?? DEFAULT_LAYOUT_VISIBILITY_SETTINGS.vertical.showFooter,
        showLogo:
          (legacy.showLogo as boolean) ?? DEFAULT_LAYOUT_VISIBILITY_SETTINGS.vertical.showLogo,
      }

      // 迁移策略：用旧配置快照初始化三种模式（用户升级后不会丢失习惯）
      this.visibilitySettings = {
        vertical: enforceModeVisibilityConstraints('vertical', { ...legacyVisibility }),
        horizontal: enforceModeVisibilityConstraints('horizontal', { ...legacyVisibility }),
        mix: enforceModeVisibilityConstraints('mix', { ...legacyVisibility }),
      }

      // 清理旧字段（避免继续被误用）
      delete legacy.showHeader
      delete legacy.showMenu
      delete legacy.showSidebar
      delete legacy.showBreadcrumb
      delete legacy.showBreadcrumbIcon
      delete legacy.showTabs
      delete legacy.showFooter
      delete legacy.showLogo
    },

    setPreferredMode(mode: AdminLayoutMode) {
      this.updateSetting('preferredMode', mode)
      this.visibilitySettings[mode] = enforceModeVisibilityConstraints(mode, {
        ...this.visibilitySettings[mode],
      })
      this.markUserAdjusted()
    },
    /**
     * @deprecated 请使用 setPreferredMode
     */
    setLayoutMode(mode: AdminLayoutMode) {
      this.setPreferredMode(mode)
    },
    /**
     * 布局模块显隐字段限定类型，避免 UI 传入任意 key
     */
    setModuleVisible(key: LayoutModuleVisibilityKey, visible: boolean, mode?: AdminLayoutMode) {
      const targetMode = mode ?? this.preferredMode
      const parentKey = MODULE_PARENT_REQUIREMENTS[key]
      if (visible && parentKey && !this.visibilitySettings[targetMode][parentKey]) {
        this.visibilitySettings[targetMode][parentKey] = true
      }
      if (MODE_HIDDEN_MODULES[targetMode].includes(key)) {
        this.visibilitySettings[targetMode][key] = false
        this.markUserAdjusted()
        return
      }

      const children = MODULE_DEPENDENCIES[key]
      if (children && children.length > 0) {
        const modeCache = this.moduleRestoreCache[targetMode]

        if (!visible) {
          // 关闭父模块：缓存子模块当前状态并强制关闭
          modeCache[key] = children.reduce<Partial<LayoutVisibilitySetting>>((acc, childKey) => {
            acc[childKey] = this.visibilitySettings[targetMode][childKey]
            return acc
          }, {})
          children.forEach(childKey => {
            this.visibilitySettings[targetMode][childKey] = false
          })
        } else {
          // 开启父模块：如有缓存则恢复子模块状态，并清空缓存
          const cache = modeCache[key]
          if (cache) {
            children.forEach(childKey => {
              const cached = cache[childKey]
              if (typeof cached === 'boolean') {
                this.visibilitySettings[targetMode][childKey] = cached
              }
            })
            delete modeCache[key]
          }
        }
      }

      this.visibilitySettings[targetMode][key] = visible
      this.visibilitySettings[targetMode] = enforceModeVisibilityConstraints(targetMode, {
        ...this.visibilitySettings[targetMode],
      })
      this.markUserAdjusted()
    },
    toggleModuleVisible(key: LayoutModuleVisibilityKey) {
      this.setModuleVisible(key, !this.visibilitySettings[this.preferredMode][key])
    },
    toggleCollapse() {
      this.sidebarCollapse = !this.sidebarCollapse
      this.userAdjusted = true // 标记为用户手动调整
    },
    /**
     * 移动端抽屉导航开关
     */
    toggleMobileDrawer() {
      this.mobileDrawerOpen = !this.mobileDrawerOpen
    },
    /**
     * 显式设置移动端抽屉导航状态
     */
    setMobileDrawerOpen(open: boolean) {
      this.mobileDrawerOpen = open
    },
    updateSetting<K extends keyof LayoutSetting>(key: K, value: LayoutSetting[K]) {
      ;(this.$state as unknown as Record<string, unknown>)[key] = value
    },
    resetSetting() {
      // resetSetting 不触碰运行时 loading 计数器
      const { loadingCount, pageLoadingCount } = this
      Object.assign(this, {
        ...DEFAULT_LAYOUT_SETTING,
        visibilitySettings: deepClone(DEFAULT_LAYOUT_VISIBILITY_SETTINGS),
        moduleRestoreCache: {
          vertical: {},
          horizontal: {},
          mix: {},
        },
        loadingCount,
        pageLoadingCount,
        // 始终由计数器推导，保证 SSOT 一致性
        isLoading: loadingCount > 0,
        isPageLoading: pageLoadingCount > 0,
        userAdjusted: false,
      })
    },
    /**
     * @deprecated 请优先使用 beginGlobalLoading / endGlobalLoading（并发安全）
     * 仅用于兼容旧调用：true => 置 count>=1；false => 清零 count
     */
    setIsLoading(loading: boolean) {
      if (loading) {
        this.loadingCount = Math.max(1, this.loadingCount)
        this.isLoading = true
        return
      }
      this.loadingCount = 0
      this.isLoading = false
    },
    /**
     * @deprecated 请优先使用 beginPageLoading / endPageLoading（并发安全）
     * 仅用于兼容旧调用：true => 置 count>=1；false => 清零 count
     */
    setIsPageLoading(loading: boolean) {
      if (loading) {
        this.pageLoadingCount = Math.max(1, this.pageLoadingCount)
        this.isPageLoading = true
        return
      }
      this.pageLoadingCount = 0
      this.isPageLoading = false
    },
    /** 并发安全：开始全局 loading（计数 +1） */
    beginGlobalLoading() {
      this.loadingCount += 1
      this.isLoading = this.loadingCount > 0
    },
    /** 并发安全：结束全局 loading（计数 -1，带下限保护） */
    endGlobalLoading() {
      this.loadingCount = Math.max(0, this.loadingCount - 1)
      this.isLoading = this.loadingCount > 0
    },
    /** 并发安全：开始内容区 loading（计数 +1） */
    beginPageLoading() {
      this.pageLoadingCount += 1
      this.isPageLoading = this.pageLoadingCount > 0
    },
    /** 并发安全：结束内容区 loading（计数 -1，带下限保护） */
    endPageLoading() {
      this.pageLoadingCount = Math.max(0, this.pageLoadingCount - 1)
      this.isPageLoading = this.pageLoadingCount > 0
    },
    /**
     * [NEW] 响应式适配：根据设备状态智能调整布局
     *
     * - 移动端 (isMobile=true)：强制顶栏菜单模式 (horizontal)，小屏最佳展示；显隐由展示层「有效显隐」控制
     * - 离开移动端布局 (isMobile=false)：恢复侧栏模式 (vertical)，sidebarCollapse 由调用方后续 adaptPcByBreakpoint 按断点设置
     * - PC 端不会调用本方法，由 adaptPcByOrientation + adaptPcByBreakpoint 处理
     *
     * @param isMobile - 是否为移动端布局（基于断点判断）
     * @param force - 是否强制应用（忽略 userAdjusted 标记，用于初始化等场景）
     *
     * @example
     * layoutStore.adaptToMobile(true)   // 进入移动端布局 → 顶栏模式
     * layoutStore.adaptToMobile(false, true)  // 离开移动端布局（如 Mobile 大视口）→ 恢复侧栏模式
     */
    adaptToMobile(isMobile: boolean, force = false) {
      // 如果用户已手动调整且不是强制模式，则不自动调整
      if (this.userAdjusted && !force) {
        return
      }

      if (isMobile) {
        // 进入移动端布局时，确保抽屉初始为关闭状态，避免历史状态残留
        this.mobileDrawerOpen = false
        // 移动端 effectiveMode 为 horizontal，主侧栏不渲染，由 Drawer 替代；不修改 sidebarCollapse，以便恢复桌面时正确还原
      } else {
        // 离开移动端布局（恢复到 PC/大视口）时关闭抽屉，避免在后台保持打开状态
        this.mobileDrawerOpen = false
      }
    },
    /**
     * [NEW] 平板适配
     *
     * 平板设备的布局策略：
     * - 默认收起侧边栏（但用户可以手动展开）
     * - 使用垂直布局模式
     *
     * 注意：当从平板切换到 PC 时，由 adaptToMobile(false) 处理恢复逻辑
     *
     * @param isTablet - 是否为平板布局（基于断点判断）
     * @param force - 是否强制应用（忽略 userAdjusted 标记）
     *
     * @example
     * // 进入平板模式
     * layoutStore.adaptToTablet(true)
     */
    adaptToTablet(isTablet: boolean, force = false) {
      if (this.userAdjusted && !force) {
        return
      }

      if (isTablet) {
        // 平板侧栏收展由 adaptPcByBreakpoint 按 md 断点统一处理，此处不覆盖持久化状态
      } else {
        // 从平板切换回 PC 或大视口时，确保移动端抽屉关闭
        this.mobileDrawerOpen = false
      }
      // 注意：当 isTablet = false 时（从平板切换到 PC），不需要特殊处理
      // 因为 adaptToMobile(false) 已经处理了恢复逻辑
    },
    /**
     * [NEW] PC 端按横竖屏智能切换布局模式：仅竖屏强制顶栏，横屏尊重用户/持久化选择。
     * - 竖屏 (vertical) → 顶栏模式 (horizontal)
     * - 横屏：不覆盖 mode，由设置面板与持久化决定
     */
    adaptPcByOrientation(orientation: Orientation) {
      // effectiveMode 已在 getter 中对「PC 竖屏」强制返回 horizontal；
      // 这里不再覆盖 sidebarCollapse（它是用户偏好且会被持久化），避免在模式来回切换时丢失“上次展开/收起状态”。
      if (orientation === 'vertical') return
    },
    /**
     * [NEW] PC/平板端按断点适配（弃用写入）：
     * 响应式阶段不再覆写持久化 sidebarCollapse，避免窗口尺寸变化破坏用户偏好。
     *
     * @deprecated 请在展示层使用派生态控制侧栏呈现，不要在 Store 中改写 sidebarCollapse。
     */
    adaptPcByBreakpoint(_breakpoint: BreakpointKey, _force = false) {},
    /**
     * [NEW] 标记为用户手动调整（在用户手动操作时调用）
     */
    markUserAdjusted() {
      this.userAdjusted = true
    },
    /**
     * [NEW] 重置用户调整标记，恢复响应式自动折叠/展开行为
     */
    resetUserAdjusted() {
      this.userAdjusted = false
    },
    /**
     * [NEW] 关闭侧边栏并标记为用户调整（用于移动端遮罩层等场景）
     */
    closeSidebarWithUserMark() {
      this.updateSetting('sidebarCollapse', true)
      this.markUserAdjusted()
    },
  },

  persist: {
    key: `${import.meta.env.VITE_PINIA_PERSIST_KEY_PREFIX}-layout`,
    storage: localStorage,
    pick: LAYOUT_PERSIST_PICK,
  },
})

/** 在 setup 外使用（如 useLoading、router guard）时使用 */
export const useLayoutStoreWithOut = () => useLayoutStore(store)
