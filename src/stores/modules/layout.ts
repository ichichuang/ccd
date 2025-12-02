import { INTERVAL } from '@/constants/modules/layout'
import { breakpoints } from '@/constants/modules/rem'
import store from '@/stores'
import { env, getDeviceInfo } from '@/utils'
import { debounce } from 'lodash-es'
import { defineStore } from 'pinia'

/** 布局配置接口 */
interface LayoutConfig {
  showHeader: boolean
  showMenu: boolean
  showSidebar: boolean
  showBreadcrumb: boolean
  showFooter: boolean
  showTabs: boolean
}

/** 布局状态接口 */
interface LayoutState {
  // 当前布局模式
  currentLayout: LayoutMode
  // 布局配置
  layoutConfig: LayoutConfig
  // 侧边栏折叠状态
  sidebarCollapsed: boolean
  // 移动端侧边栏可见状态
  mobileSidebarVisible: boolean
  // 展开的菜单项 key 映射，便于持久化
  expandedMenuKeys: Record<string, boolean>

  // 框架加载状态
  isLoading: boolean
  // 页面加载状态
  isPageLoading: boolean

  // 设备信息
  deviceInfo: DeviceInfo

  // 当前断点
  currentBreakpoint: Breakpoint

  // 记住的滚动条距离
  layoutScrollbarTop: number

  // 滚动位置记忆存储
  scrollPositions: Record<string, { scrollLeft: number; scrollTop: number }>

  // 表单内容记忆指针：仅保存指向 IndexedDB 的键
  formMemoryPointers: Record<string, string>
}

/* 布局配置 */
const layoutConfig: LayoutConfig = {
  showHeader: true,
  showMenu: true,
  showSidebar: true,
  showBreadcrumb: true,
  showFooter: true,
  showTabs: true,
}

export const useLayoutStore = defineStore('layout', {
  state: (): LayoutState => ({
    currentLayout: 'admin',

    layoutConfig: layoutConfig,
    sidebarCollapsed: false,
    mobileSidebarVisible: false,
    expandedMenuKeys: {},

    isLoading: true,
    isPageLoading: false,

    deviceInfo: getDeviceInfo(),
    currentBreakpoint: 'md',

    layoutScrollbarTop: 0,

    scrollPositions: {},

    formMemoryPointers: {},
  }),

  getters: {
    // 获取当前模式
    getCurrentLayout: (state: LayoutState) => state.currentLayout,

    // 是否展示头部
    getShowHeader: (state: LayoutState) => state.layoutConfig.showHeader,
    // 是否展示顶部菜单
    getShowMenu: (state: LayoutState) => state.layoutConfig.showMenu,
    // 是否展示侧边栏
    getShowSidebar: (state: LayoutState) => state.layoutConfig.showSidebar,
    // 是否展示面包屑
    getShowBreadcrumb: (state: LayoutState) => state.layoutConfig.showBreadcrumb,
    // 是否展示底部
    getShowFooter: (state: LayoutState) => state.layoutConfig.showFooter,
    // 是否展示标签页
    getShowTabs: (state: LayoutState) => state.layoutConfig.showTabs,

    // 是否折叠侧边栏
    getSidebarCollapsed: (state: LayoutState) => state.sidebarCollapsed,
    // 是否移动端侧边栏可见
    getMobileSidebarVisible: (state: LayoutState) => state.mobileSidebarVisible,
    // 获取展开的菜单项 key 对象
    getExpandedMenuKeys: (state: LayoutState) => state.expandedMenuKeys,

    // 框架加载状态
    getIsLoading: (state: LayoutState) => state.isLoading,
    // 页面加载状态
    getIsPageLoading: (state: LayoutState) => state.isPageLoading,

    /* 设备信息 */
    // 是否是 PC 端
    getIsPC: (state: LayoutState) => state.deviceInfo.type === 'PC',
    // 是否是 Mobile 端
    getIsMobile: (state: LayoutState) => state.deviceInfo.type === 'Mobile',
    // 设备宽度
    getDeviceWidth: (state: LayoutState) => state.deviceInfo.screen.deviceWidth,
    // 设备高度
    getDeviceHeight: (state: LayoutState) => state.deviceInfo.screen.deviceHeight,
    // 设备方向
    getDeviceOrientation: (state: LayoutState) => state.deviceInfo.screen.orientation,
    // 实际宽度
    getWidth: (state: LayoutState) => state.deviceInfo.screen.width,
    // 实际高度
    getHeight: (state: LayoutState) => state.deviceInfo.screen.height,
    // 绝对大小
    getDefinitely: (state: LayoutState) => state.deviceInfo.screen.definitely,
    // 系统导航栏高度
    getNavHeight: (state: LayoutState) => state.deviceInfo.screen.navHeight,
    // 系统标签栏高度
    getTabHeight: (state: LayoutState) => state.deviceInfo.screen.tabHeight,
    // 系统
    getSystem: (state: LayoutState) => state.deviceInfo.system,
    // 当前断点
    getCurrentBreakpoint: (state: LayoutState) => state.currentBreakpoint,

    // 记住的滚动条距离
    getLayoutScrollbarTop: (state: LayoutState) => state.layoutScrollbarTop,

    // 获取滚动位置记忆存储
    getScrollPositions: (state: LayoutState) => state.scrollPositions,

    // 获取表单内容记忆指针映射
    getFormMemoryPointers: (state: LayoutState) => state.formMemoryPointers,
  },

  actions: {
    // 设置当前布局模式
    setCurrentLayout(layout: LayoutMode) {
      this.currentLayout = layout
    },

    /* 布局显示状态设置 */
    // 设置头部显示状态
    setShowHeader(show: boolean) {
      this.layoutConfig.showHeader = show
    },
    // 设置菜单显示状态
    setShowMenu(show: boolean) {
      this.layoutConfig.showMenu = show
    },
    // 设置侧边栏显示状态
    setShowSidebar(show: boolean) {
      this.layoutConfig.showSidebar = show
    },
    // 设置面包屑显示状态
    setShowBreadcrumb(show: boolean) {
      this.layoutConfig.showBreadcrumb = show
    },
    // 设置底部显示状态
    setShowFooter(show: boolean) {
      this.layoutConfig.showFooter = show
    },
    // 设置标签页显示状态
    setShowTabs(show: boolean) {
      this.layoutConfig.showTabs = show
    },

    // 设置侧边栏折叠状态
    setSidebarCollapsed(collapsed: boolean) {
      this.sidebarCollapsed = collapsed
    },
    // 设置移动端侧边栏可见状态
    setMobileSidebarVisible(visible: boolean) {
      this.mobileSidebarVisible = visible
    },

    // 设置展开的菜单项 key 对象（持久化）
    setExpandedMenuKeys(keys: Record<string, boolean>) {
      this.expandedMenuKeys = keys
    },

    // 设置框架加载状态
    setIsLoading(loading: boolean) {
      this.isLoading = loading
    },
    // 设置页面加载状态
    setIsPageLoading(loading: boolean) {
      this.isPageLoading = loading
    },

    // 设置记住的滚动条距离
    setLayoutScrollbarTop(top: number) {
      this.layoutScrollbarTop = top
    },

    // 设置滚动位置
    setScrollPosition(key: string, scrollLeft: number, scrollTop: number) {
      this.scrollPositions[key] = { scrollLeft, scrollTop }
    },

    // 获取滚动位置
    getScrollPosition(key: string): { scrollLeft: number; scrollTop: number } | null {
      return this.scrollPositions[key] || null
    },

    // 清除滚动位置
    clearScrollPosition(key: string) {
      delete this.scrollPositions[key]
    },

    // 清除所有滚动位置
    clearAllScrollPositions() {
      this.scrollPositions = {}
    },

    /* ======= 表单内容记忆指针 ======= */
    // 设置表单指针（formId -> idbKey）
    setFormMemoryPointer(formId: string, idbKey: string) {
      this.formMemoryPointers[formId] = idbKey
    },

    // 获取表单指针
    getFormMemoryPointer(formId: string): string | null {
      return this.formMemoryPointers[formId] ?? null
    },

    // 清除表单指针
    clearFormMemoryPointer(formId: string) {
      delete this.formMemoryPointers[formId]
    },

    // 初始化设备信息
    initDeviceInfo() {
      this.deviceInfo = getDeviceInfo()
      // 根据屏幕宽度更新当前断点（使用统一的断点判断逻辑）
      const width = this.deviceInfo.screen.width
      if (width >= breakpoints.xxxl) {
        this.currentBreakpoint = 'xxxl'
      } else if (width >= breakpoints.xxl) {
        this.currentBreakpoint = 'xxl'
      } else if (width >= breakpoints.xls) {
        this.currentBreakpoint = 'xls'
      } else if (width >= breakpoints.xl) {
        this.currentBreakpoint = 'xl'
      } else if (width >= breakpoints.lg) {
        this.currentBreakpoint = 'lg'
      } else if (width >= breakpoints.md) {
        this.currentBreakpoint = 'md'
      } else if (width >= breakpoints.sm) {
        this.currentBreakpoint = 'sm'
      } else {
        this.currentBreakpoint = 'xs'
      }
    },

    init() {
      // 立即初始化设备信息，确保能快速获取到正确的尺寸
      this.initDeviceInfo()

      // resize 等事件触发频繁，建议加防抖（debounce）避免连续高频触发影响性能。
      // 使用统一配置的防抖时间
      const handler = debounce(this.initDeviceInfo.bind(this), INTERVAL)

      const events = [
        'resize', // 浏览器窗口尺寸变化
        'orientationchange', // 横竖屏切换
        'pageshow', // 页面显示（如从缓存中返回）
        'visibilitychange', // 标签页激活/隐藏
      ]

      events.forEach(event => window.addEventListener(event, handler))

      // 返回移除函数，让组件中去处理
      return () => {
        events.forEach(event => window.removeEventListener(event, handler))
      }
    },
  },

  persist: {
    key: `${env.piniaKeyPrefix}-layout`,
    storage: localStorage,
  },
})

export const useLayoutStoreWithOut = () => {
  return useLayoutStore(store)
}
