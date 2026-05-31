import {
  DEFAULT_LAYOUT_SETTING,
  DEFAULT_LAYOUT_VISIBILITY_SETTINGS,
  LAYOUT_PERSIST_PICK,
} from '@/constants/layout'
import { useDeviceStore } from '@/stores/modules/system/device'
import { castValue, deepClone } from '@ccd/shared-utils'
import { createPiniaEncryptedSerializer } from '@/utils/safeStorage/piniaSerializer'
import store from '@/stores'
import {
  enforceLayoutModeVisibilityConstraints,
  resolveLayoutEffectiveMode,
  resolveLayoutModuleVisibilityChange,
  type LayoutModuleVisibilityKey,
} from '@ccd/vue-app-platform'
import { syncAction } from '@/sync/syncAction'
import { defineStore } from 'pinia'
/**
 * 缓存 deviceStore，避免 effectiveMode getter 每次求值都调用 useDeviceStore()。
 * 安全性：Pinia 单例模式下 module-level 缓存不会跨实例泄露；
 * HMR 场景下 store 实例不变（Pinia 内部管理），引用仍然有效。
 */
let _deviceStore: ReturnType<typeof useDeviceStore> | null = null

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
    contentScrollMemory: {},
  }),

  getters: {
    effectiveMode: (state): AdminLayoutMode => {
      if (!_deviceStore) _deviceStore = useDeviceStore()
      return resolveLayoutEffectiveMode({
        deviceType: _deviceStore.type,
        breakpoint: _deviceStore.currentBreakpoint,
        preferredMode: state.preferredMode,
      })
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
    syncLayoutPreference() {
      syncAction('layout:update', {
        layout: {
          layout: this.preferredMode,
          collapsed: this.sidebarCollapse,
        },
        updatedAt: Date.now(),
      })
    },
    setExpandedMenuKeys(keys: Record<string, boolean>) {
      this.expandedMenuKeys = keys || {}
    },
    setFormMemoryPointer(formId: string, storageKey: string) {
      this.formMemoryPointers[formId] = storageKey
    },
    getContentScrollMemory(key: string) {
      return this.contentScrollMemory[key]
    },
    setContentScrollMemory(key: string, position: { scrollTop: number; scrollLeft: number }) {
      this.contentScrollMemory[key] = position
    },
    /**
     * 旧版持久化迁移：
     * - 旧结构：showXxx 直接平铺在 root
     * - 新结构：visibilitySettings[mode].showXxx
     */
    migrateLegacyVisibilityIfNeeded() {
      const legacy = castValue<Record<string, unknown>>(this.$state)
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

      const def = DEFAULT_LAYOUT_VISIBILITY_SETTINGS.vertical
      const legacyVisibility: LayoutVisibilitySetting = {
        showHeader:
          (typeof legacy.showHeader === 'boolean' ? legacy.showHeader : undefined) ??
          def.showHeader,
        showMenu:
          (typeof legacy.showMenu === 'boolean' ? legacy.showMenu : undefined) ?? def.showMenu,
        showSidebar:
          (typeof legacy.showSidebar === 'boolean' ? legacy.showSidebar : undefined) ??
          def.showSidebar,
        showBreadcrumb:
          (typeof legacy.showBreadcrumb === 'boolean' ? legacy.showBreadcrumb : undefined) ??
          def.showBreadcrumb,
        showBreadcrumbIcon:
          (typeof legacy.showBreadcrumbIcon === 'boolean'
            ? legacy.showBreadcrumbIcon
            : undefined) ?? def.showBreadcrumbIcon,
        showTabs:
          (typeof legacy.showTabs === 'boolean' ? legacy.showTabs : undefined) ?? def.showTabs,
        showFooter:
          (typeof legacy.showFooter === 'boolean' ? legacy.showFooter : undefined) ??
          def.showFooter,
        showLogo:
          (typeof legacy.showLogo === 'boolean' ? legacy.showLogo : undefined) ?? def.showLogo,
      }

      // 迁移策略：用旧配置快照初始化三种模式（用户升级后不会丢失习惯）
      this.visibilitySettings = {
        vertical: enforceLayoutModeVisibilityConstraints('vertical', { ...legacyVisibility }),
        horizontal: enforceLayoutModeVisibilityConstraints('horizontal', { ...legacyVisibility }),
        mix: enforceLayoutModeVisibilityConstraints('mix', { ...legacyVisibility }),
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
      this.visibilitySettings[mode] = enforceLayoutModeVisibilityConstraints(mode, {
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
      const result = resolveLayoutModuleVisibilityChange({
        mode: targetMode,
        key,
        visible,
        visibility: this.visibilitySettings[targetMode],
        restoreCache: this.moduleRestoreCache[targetMode],
      })

      this.visibilitySettings[targetMode] = result.visibility
      this.moduleRestoreCache[targetMode] = result.restoreCache
      this.markUserAdjusted()
    },
    toggleModuleVisible(key: LayoutModuleVisibilityKey) {
      this.setModuleVisible(key, !this.visibilitySettings[this.preferredMode][key])
    },
    toggleCollapse() {
      this.sidebarCollapse = !this.sidebarCollapse
      this.userAdjusted = true // 标记为用户手动调整
      this.syncLayoutPreference()
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
    updateSetting<K extends keyof LayoutSetting>(
      key: K,
      value: LayoutSetting[K],
      options: { sync?: boolean } = {}
    ) {
      castValue<Record<string, unknown>>(this.$state)[key] = value
      if (options.sync === false) return
      if (key === 'preferredMode' || key === 'sidebarCollapse') {
        this.syncLayoutPreference()
      }
    },
    resetSetting(options: { sync?: boolean } = {}) {
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
      if (options.sync !== false) {
        this.syncLayoutPreference()
      }
    },
    resetState() {
      this.resetSetting({ sync: false })
    },
    /**
     * @deprecated 请优先使用 beginGlobalLoading / endGlobalLoading（并发安全）
     * 仅用于兼容旧调用：true => 置 count>=1；false => 清零 count
     */
    setIsLoading(loading: boolean) {
      console.warn(
        '[Layout Store] setIsLoading() is deprecated and corrupts concurrent loading counter. Use beginGlobalLoading()/endGlobalLoading() instead.'
      )
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
      console.warn(
        '[Layout Store] setIsPageLoading() is deprecated. Use beginPageLoading()/endPageLoading() instead.'
      )
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
     * @deprecated Layout adaptation is resolved by `useLayoutRuntime()`.
     * Kept as a compatibility no-op so older callers cannot create a second state machine.
     */
    adaptToMobile(_isMobile: boolean, _force = false) {},
    /**
     * @deprecated Layout adaptation is resolved by `useLayoutRuntime()`.
     * Kept as a compatibility no-op so older callers cannot create a second state machine.
     */
    adaptToTablet(_isTablet: boolean, _force = false) {},
    /**
     * @deprecated Layout adaptation is resolved by `useLayoutRuntime()`.
     * Kept as a compatibility no-op so older callers cannot create a second state machine.
     */
    adaptPcByOrientation(_orientation: string) {},
    /**
     * @deprecated Layout adaptation is resolved by `useLayoutRuntime()`.
     * Kept as a compatibility no-op so older callers cannot create a second state machine.
     */
    adaptPcByBreakpoint(_breakpoint: string, _force = false) {},
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
    serializer: createPiniaEncryptedSerializer(),
    pick: LAYOUT_PERSIST_PICK,
  },
})

/** 在 setup 外使用（如 useLoading、router guard）时使用 */
export const useLayoutStoreWithOut = () => useLayoutStore(store)
