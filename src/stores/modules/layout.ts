import type { BreakpointKey } from '@/constants/breakpoints'
import type { Orientation } from '@/types/systems/device'
import {
  DEFAULT_LAYOUT_SETTING,
  DEFAULT_LAYOUT_VISIBILITY_SETTINGS,
  LAYOUT_PERSIST_PICK,
} from '@/constants/layout'
import { deepClone } from '@/utils/lodashes'
import store from '@/stores'
import { createPiniaEncryptedSerializer } from '@/utils/safeStorage/piniaSerializer'
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
    /** 表单记忆指针（formId -> storageKey） */
    formMemoryPointers: {} as Record<string, string>,
  }),

  getters: {
    isHorizontal: state => state.mode === 'horizontal',
    isMix: state => state.mode === 'mix',
    // --- active visibility (SSOT) ---
    activeVisibility: state => state.visibilitySettings[state.mode],
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
        vertical: { ...legacyVisibility },
        horizontal: { ...legacyVisibility },
        mix: { ...legacyVisibility },
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

    setLayoutMode(mode: AdminLayoutMode) {
      this.updateSetting('mode', mode)
      this.markUserAdjusted()
    },
    /**
     * 布局模块显隐字段限定类型，避免 UI 传入任意 key
     */
    setModuleVisible(key: LayoutModuleVisibilityKey, visible: boolean, mode?: AdminLayoutMode) {
      const targetMode = mode ?? this.mode

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
      this.markUserAdjusted()
    },
    toggleModuleVisible(key: LayoutModuleVisibilityKey) {
      this.setModuleVisible(key, !this.visibilitySettings[this.mode][key])
    },
    toggleCollapse() {
      this.sidebarCollapse = !this.sidebarCollapse
      this.userAdjusted = true // 标记为用户手动调整
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
        // 移动端：始终使用顶栏菜单模式 (horizontal)，小屏最佳展示；侧栏显隐由展示层「有效显隐」控制
        this.updateSetting('sidebarCollapse', true)
        this.updateSetting('mode', 'horizontal')
      } else {
        // 离开移动端布局（大视口恢复）：恢复侧栏模式，sidebarCollapse 由后续 adaptPcByBreakpoint 按断点设置
        this.updateSetting('mode', 'vertical')
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
        // 平板：默认收起侧边栏，但允许展开
        this.updateSetting('sidebarCollapse', true)
        this.updateSetting('mode', 'vertical')
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
      if (orientation === 'vertical') {
        this.updateSetting('mode', 'horizontal')
      }
    },
    /**
     * [NEW] PC/平板端按断点适配：仅当「展示侧边栏」时，根据断点动态设置展开/收缩；
     * 不修改 visibilitySettings，完全遵循 SettingsContent 的布局模块显隐配置。
     *
     * @param breakpoint - 当前断点 (xs~5xl)
     * @param force - 是否强制应用（忽略 userAdjusted）
     */
    adaptPcByBreakpoint(breakpoint: BreakpointKey, force = false) {
      if (!this.showSidebar) return
      if (this.userAdjusted && !force) return
      // xs/sm/md 收缩；lg 及以上自动展开（PC 横屏）
      const collapseBreakpoints: BreakpointKey[] = ['xs', 'sm', 'md']
      const expandBreakpoints: BreakpointKey[] = ['lg', 'xl', '2xl', '3xl', '4xl', '5xl']
      if (collapseBreakpoints.includes(breakpoint)) {
        this.updateSetting('sidebarCollapse', true)
      } else if (expandBreakpoints.includes(breakpoint)) {
        this.updateSetting('sidebarCollapse', false)
      }
    },
    /**
     * [NEW] 标记为用户手动调整（在用户手动操作时调用）
     */
    markUserAdjusted() {
      this.userAdjusted = true
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
    serializer: createPiniaEncryptedSerializer(),
    pick: LAYOUT_PERSIST_PICK,
  },
})

/** 在 setup 外使用（如 useLoading、router guard）时使用 */
export const useLayoutStoreWithOut = () => useLayoutStore(store)
