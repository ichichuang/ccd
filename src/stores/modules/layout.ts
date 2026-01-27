import { DEFAULT_LAYOUT_SETTING, LAYOUT_PERSIST_PICK } from '@/constants/layout'
import store from '@/stores'
import { createPiniaEncryptedSerializer } from '@/utils/safeStorage/piniaSerializer'
import { defineStore } from 'pinia'

export const useLayoutStore = defineStore('layout', {
  state: (): LayoutStoreState => ({
    ...DEFAULT_LAYOUT_SETTING,
    isLoading: true,
    isPageLoading: false,
    // [NEW] 用户手动调整标记：防止自动适配覆盖用户偏好
    userAdjusted: false,
  }),

  getters: {
    isHorizontal: state => state.mode === ('horizontal' as AdminLayoutMode),
    isMix: state => state.mode === ('mix' as AdminLayoutMode),
  },

  actions: {
    toggleCollapse() {
      this.sidebarCollapse = !this.sidebarCollapse
      this.userAdjusted = true // 标记为用户手动调整
    },
    updateSetting<K extends keyof LayoutSetting>(key: K, value: LayoutSetting[K]) {
      ;(this.$state as unknown as Record<string, unknown>)[key] = value
    },
    resetSetting() {
      const { isLoading, isPageLoading } = this
      Object.assign(this, {
        ...DEFAULT_LAYOUT_SETTING,
        isLoading,
        isPageLoading,
        userAdjusted: false,
      })
    },
    setIsLoading(loading: boolean) {
      this.isLoading = loading
    },
    setIsPageLoading(loading: boolean) {
      this.isPageLoading = loading
    },
    /**
     * [NEW] 响应式适配：根据设备状态智能调整布局
     *
     * 注意：只处理"物理限制导致必须改变"的配置
     * - 移动端：强制收起侧边栏、垂直布局、隐藏 Tabs
     * - PC 端：完全信任持久化数据，不做任何自动修改
     *
     * @param isMobile - 是否为移动端布局（基于断点判断）
     * @param force - 是否强制应用（忽略 userAdjusted 标记，用于初始化等场景）
     *
     * @example
     * // 移动端适配
     * layoutStore.adaptToMobile(true)
     *
     * // PC 端：不做任何修改（完全信任持久化数据）
     * layoutStore.adaptToMobile(false)
     *
     * // 强制适配（忽略用户偏好）
     * layoutStore.adaptToMobile(true, true)
     */
    adaptToMobile(isMobile: boolean, force = false) {
      // 如果用户已手动调整且不是强制模式，则不自动调整
      if (this.userAdjusted && !force) {
        return
      }

      if (isMobile) {
        // 移动端：强制应用最佳配置
        this.updateSetting('sidebarCollapse', true)
        this.updateSetting('mode', AdminLayoutMode.VERTICAL)
        this.updateSetting('showTabs', false)
      } else {
        // PC 端：完全信任持久化数据，不做任何修改！
        // 彻底避免 "PC端刷新导致用户配置被覆盖" 的问题
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
        this.updateSetting('mode', AdminLayoutMode.VERTICAL)
      }
      // 注意：当 isTablet = false 时（从平板切换到 PC），不需要特殊处理
      // 因为 adaptToMobile(false) 已经处理了恢复逻辑
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
