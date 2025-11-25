/**
 * 尺寸状态管理
 */

import { cloneDeep, toKebabCase } from '@/common'
import { fontSizeOptions, paddingOptions, roundedOptions, sizeOptions } from '@/constants'
import { DEFAULT_CONFIG } from '@/constants/modules/layout'
import { comfortableSizes, sizePresetsMap } from '@/utils'
import store, { useLayoutStoreWithOut } from '@/stores'
import { env, useMitt } from '@/utils'
import { defineStore } from 'pinia'
import { nextTick } from 'vue'

// 显式为 getters 与 actions 补全类型，避免通过聚合导出时类型推断丢失
type SizeGetters = {
  currentLayout(state: SizeState): Layout
  isCompact(state: SizeState): boolean
  isComfortable(state: SizeState): boolean
  isLoose(state: SizeState): boolean

  getSizeOptions(state: SizeState): SizeOptions[]
  getSize(state: SizeState): SizeOptions['value']
  getSizeLabel(state: SizeState): string | undefined

  getSidebarWidth(state: SizeState): number
  getSidebarCollapsedWidth(state: SizeState): number
  getHeaderHeight(state: SizeState): number
  getBreadcrumbHeight(state: SizeState): number
  getFooterHeight(state: SizeState): number
  getTabsHeight(state: SizeState): number

  getContentHeight(state: SizeState): number
  getContentBreadcrumbHeight(state: SizeState): number
  getContentTabsHeight(state: SizeState): number
  getContentsHeight(state: SizeState): number
  getContentsBreadcrumbHeight(state: SizeState): number
  getContentsTabsHeight(state: SizeState): number

  getGap(state: SizeState): number
  getGaps(state: SizeState): number
  getGapx(state: SizeState): number
  getGapl(state: SizeState): number

  getPadding(state: SizeState): PaddingOptions['key']
  getPaddingValue(state: SizeState): number
  getPaddingsValue(state: SizeState): number
  getPaddingxValue(state: SizeState): number
  getPaddinglValue(state: SizeState): number
  getPaddingLabel(state: SizeState): string | undefined
  getPaddingOptions(state: SizeState): PaddingOptions[]

  getRounded(state: SizeState): RoundedOptions['key']
  getRoundedValue(state: SizeState): number
  getRoundedLabel(state: SizeState): string | undefined
  getRoundedOptions(state: SizeState): RoundedOptions[]

  getFontSize(state: SizeState): FontSizeOptions['key']
  getFontSizeOptions(state: SizeState): FontSizeOptions[]
  getFontSizeValue(state: SizeState): number
  getFontSizeLabel(state: SizeState): string | undefined
  getFontSizesValue(state: SizeState): number
  getFontSizexValue(state: SizeState): number
  getFontSizelValue(state: SizeState): number
}

type SizeActions = {
  setSize(this: any, size: SizeOptions['value']): void
  setPadding(this: any, padding: PaddingOptions['key']): void
  setRounded(this: any, rounded: RoundedOptions['key']): void
  setFontSize(this: any, fontSize: FontSizeOptions['key']): void
  setCssVariables(this: any): void
  init(this: any): void
  reset(this: any): void
}

export const useSizeStore = defineStore<'size', SizeState, SizeGetters, SizeActions>('size', {
  state: (): SizeState => ({
    size: 'comfortable',
    sizeOptions: [...sizeOptions], // 创建可变副本

    sizes: cloneDeep(comfortableSizes),

    padding: 'md',
    paddingOptions: [...paddingOptions], // 创建可变副本

    rounded: 'smooth',
    roundedOptions: [...roundedOptions], // 创建可变副本

    fontSize: 'md',
    fontSizeOptions: [...fontSizeOptions], // 创建可变副本

    // 添加窗口尺寸状态，用于触发 getter 重新计算（使用统一配置）
    windowSize: {
      width: Math.max(
        DEFAULT_CONFIG.windowSize.minWidth,
        Math.min(window.innerWidth, DEFAULT_CONFIG.windowSize.maxWidth)
      ),
      height: Math.max(
        DEFAULT_CONFIG.windowSize.minHeight,
        Math.min(window.innerHeight, DEFAULT_CONFIG.windowSize.maxHeight)
      ),
    },
  }),

  getters: {
    // 动态获取当前尺寸预设（根据窗口实时尺寸计算）
    currentLayout: (state: SizeState) => {
      try {
        const factory = sizePresetsMap[state.size]
        // 使用 state.windowSize 来确保 getter 会响应窗口尺寸变化
        // 通过访问 state.windowSize 来建立响应式依赖
        const _ = state.windowSize.width + state.windowSize.height
        return factory ? factory() : sizePresetsMap.comfortable()
      } catch (error) {
        console.warn('计算 currentLayout 失败，回退到 comfortable:', error)
        return sizePresetsMap.comfortable()
      }
    },
    // 验证当前是否为【紧凑模式】
    isCompact: (state: SizeState) => state.size === 'compact',
    // 验证当前是否为【舒适模式】
    isComfortable: (state: SizeState) => state.size === 'comfortable',
    // 验证当前是否为【宽松模式】
    isLoose: (state: SizeState) => state.size === 'loose',

    // 获取尺寸选择选项列表
    getSizeOptions: (state: SizeState) => state.sizeOptions,
    // 获取当前尺寸
    getSize: (state: SizeState) => state.size,
    // 获取当前尺寸标签
    getSizeLabel: (state: SizeState) =>
      state.sizeOptions.find(option => option.value === state.size)?.label,

    // 获取侧边栏宽度
    getSidebarWidth(_state: SizeState) {
      return this.currentLayout.sidebarWidth as number
    },
    // 获取侧边栏折叠宽度
    getSidebarCollapsedWidth(_state: SizeState) {
      return this.currentLayout.sidebarCollapsedWidth as number
    },
    // 获取头部高度
    getHeaderHeight(_state: SizeState) {
      return this.currentLayout.headerHeight as number
    },
    // 获取面包屑高度
    getBreadcrumbHeight(_state: SizeState) {
      return this.currentLayout.breadcrumbHeight as number
    },
    // 获取底部高度
    getFooterHeight(_state: SizeState) {
      return this.currentLayout.footerHeight as number
    },
    // 获取标签页高度
    getTabsHeight(_state: SizeState) {
      return this.currentLayout.tabsHeight as number
    },

    // 获取内容容器高度 = 窗口高度 - 头部 - 底部 - 面包屑 - 标签页
    getContentHeight(_state: SizeState) {
      const layoutStore = useLayoutStoreWithOut()
      const screenHeight = layoutStore.getHeight

      // 安全检查：确保设备信息已初始化
      if (!screenHeight || screenHeight <= 0) {
        console.warn('设备高度未初始化，使用默认值')
        return window.innerHeight - 120 // 默认减去一些固定高度
      }

      const showHeader = layoutStore.getShowHeader
      const showFooter = layoutStore.getShowFooter
      const showBreadcrumb = layoutStore.getShowBreadcrumb
      const showTabs = layoutStore.getShowTabs
      let height: number = 0
      if (showHeader) {
        height += this.getHeaderHeight
      }
      if (showFooter) {
        height += this.getFooterHeight
      }
      if (showBreadcrumb) {
        height += this.getBreadcrumbHeight
      }
      if (showTabs) {
        height += this.getTabsHeight
      }
      return (screenHeight - height) as number
    },
    // 获取包含面包屑内容容器高度 = 窗口高度 - 头部 - 底部 - 标签页
    getContentBreadcrumbHeight(_state: SizeState) {
      const layoutStore = useLayoutStoreWithOut()
      const screenHeight = layoutStore.getHeight

      // 安全检查：确保设备信息已初始化
      if (!screenHeight || screenHeight <= 0) {
        console.warn('设备高度未初始化，使用默认值')
        return window.innerHeight - 100 // 默认减去一些固定高度
      }

      const showHeader = layoutStore.getShowHeader
      const showFooter = layoutStore.getShowFooter
      const showTabs = layoutStore.getShowTabs
      let height: number = 0
      if (showHeader) {
        height += this.getHeaderHeight
      }
      if (showFooter) {
        height += this.getFooterHeight
      }
      if (showTabs) {
        height += this.getTabsHeight
      }
      return (screenHeight - height) as number
    },
    // 获取包含标签页内容容器高度 = 窗口高度 - 头部 - 底部 - 面包屑
    getContentTabsHeight(_state: SizeState) {
      const layoutStore = useLayoutStoreWithOut()
      const screenHeight = layoutStore.getHeight

      // 安全检查：确保设备信息已初始化
      if (!screenHeight || screenHeight <= 0) {
        console.warn('设备高度未初始化，使用默认值')
        return window.innerHeight - 100 // 默认减去一些固定高度
      }

      const showHeader = layoutStore.getShowHeader
      const showFooter = layoutStore.getShowFooter
      const showBreadcrumb = layoutStore.getShowBreadcrumb
      let height: number = 0
      if (showHeader) {
        height += this.getHeaderHeight
      }
      if (showFooter) {
        height += this.getFooterHeight
      }
      if (showBreadcrumb) {
        height += this.getBreadcrumbHeight
      }
      return (screenHeight - height) as number
    },
    // 获取包含面包屑和标签页内容容器高度 = 窗口高度 - 头部 - 底部
    getContentsHeight(_state: SizeState) {
      const layoutStore = useLayoutStoreWithOut()
      const screenHeight = layoutStore.getHeight

      // 安全检查：确保设备信息已初始化
      if (!screenHeight || screenHeight <= 0) {
        console.warn('设备高度未初始化，使用默认值')
        return window.innerHeight - 80 // 默认减去一些固定高度
      }

      const showBreadcrumb = layoutStore.getShowBreadcrumb
      const showTabs = layoutStore.getShowTabs
      let height: number = 0
      if (showBreadcrumb) {
        height += this.getBreadcrumbHeight
      }
      if (showTabs) {
        height += this.getTabsHeight
      }
      return (screenHeight - height) as number
    },
    // 获取包含面包屑内容容器高度 = 窗口高度 - 头部 - 底部 - 标签页
    getContentsBreadcrumbHeight(_state: SizeState) {
      const layoutStore = useLayoutStoreWithOut()
      const screenHeight = layoutStore.getHeight

      // 安全检查：确保设备信息已初始化
      if (!screenHeight || screenHeight <= 0) {
        console.warn('设备高度未初始化，使用默认值')
        return window.innerHeight - 60 // 默认减去一些固定高度
      }

      const showTabs = layoutStore.getShowTabs
      let height: number = 0
      if (showTabs) {
        height += this.getTabsHeight
      }
      return (screenHeight - height) as number
    },
    // 获取包含标签页内容容器高度 = 窗口高度 - 头部 - 底部 - 面包屑
    getContentsTabsHeight(_state: SizeState) {
      const layoutStore = useLayoutStoreWithOut()
      const screenHeight = layoutStore.getHeight

      // 安全检查：确保设备信息已初始化
      if (!screenHeight || screenHeight <= 0) {
        console.warn('设备高度未初始化，使用默认值')
        return window.innerHeight - 60 // 默认减去一些固定高度
      }

      const showBreadcrumb = layoutStore.getShowBreadcrumb
      let height: number = 0
      if (showBreadcrumb) {
        height += this.getBreadcrumbHeight
      }
      return (screenHeight - height) as number
    },

    // 获取间距
    getGap(_state: SizeState) {
      try {
        const layout = this.currentLayout
        const gap = layout?.gap
        if (gap === undefined || gap === null || isNaN(gap) || !isFinite(gap) || gap < 0) {
          console.warn('getGap: 无效的 gap 值，使用默认值 16')
          return 16
        }
        return gap as number
      } catch (error) {
        console.error('getGap: 获取 gap 失败，使用默认值 16:', error)
        return 16
      }
    },
    // 获取间距的一半 = 间距 / 2
    getGaps(_state: SizeState) {
      try {
        const gap = this.getGap
        return (gap / 2) as number
      } catch (error) {
        console.error('getGaps: 计算失败，使用默认值 8:', error)
        return 8
      }
    },
    // 获取间距的一半多 = 间距 + 间距 / 2
    getGapx(_state: SizeState) {
      try {
        const gap = this.getGap
        return (gap + gap / 2) as number
      } catch (error) {
        console.error('getGapx: 计算失败，使用默认值 24:', error)
        return 24
      }
    },
    // 获取间距的两倍
    getGapl(_state: SizeState) {
      try {
        const gap = this.getGap
        return (gap * 2) as number
      } catch (error) {
        console.error('getGapl: 计算失败，使用默认值 32:', error)
        return 32
      }
    },

    // padding
    getPadding: (state: SizeState) => {
      try {
        const list = state.paddingOptions
        const current = list.find(option => option.key === state.padding) as PaddingOptions
        return current?.key as PaddingOptions['key']
      } catch (error) {
        console.error('获取 padding 失败:', error)
        return 'md'
      }
    },
    getPaddingValue: (state: SizeState) => {
      try {
        return state.paddingOptions.find(option => option.key === state.padding)
          ?.value as PaddingOptions['value']
      } catch (error) {
        console.error('获取 paddingValue 失败:', error)
        return 12
      }
    },
    getPaddingsValue: (state: SizeState) => {
      try {
        const list = state.paddingOptions || []
        const current = list.find(option => option.key === state.padding)
        return ((current?.value ?? 12) / 2) as PaddingOptions['value']
      } catch (error) {
        console.error('获取 paddingsValue 失败:', error)
        return 6
      }
    },
    getPaddingxValue: (state: SizeState) => {
      try {
        const list = state.paddingOptions || []
        const current = list.find(option => option.key === state.padding)
        const val = current?.value ?? 12
        return (val + val / 2) as PaddingOptions['value']
      } catch (error) {
        console.error('获取 paddingxValue 失败:', error)
        return 18
      }
    },
    getPaddinglValue: (state: SizeState) => {
      try {
        const list = state.paddingOptions || []
        const current = list.find(option => option.key === state.padding)
        return ((current?.value ?? 12) * 2) as PaddingOptions['value']
      } catch (error) {
        console.error('获取 paddinglValue 失败:', error)
        return 24
      }
    },
    getPaddingLabel: (state: SizeState) => {
      try {
        return state.paddingOptions.find(option => option.key === state.padding)?.label
      } catch (error) {
        console.error('获取 paddingLabel 失败:', error)
        return '中'
      }
    },
    getPaddingOptions: (state: SizeState) => state.paddingOptions,

    // rounded
    getRounded: (state: SizeState) => state.rounded,
    getRoundedValue: (state: SizeState) => {
      try {
        return state.roundedOptions.find(option => option.key === state.rounded)
          ?.value as RoundedOptions['value']
      } catch (error) {
        console.error('获取 roundedValue 失败:', error)
        return 6
      }
    },
    getRoundedLabel: (state: SizeState) => {
      try {
        return state.roundedOptions.find(option => option.key === state.rounded)?.label
      } catch (error) {
        console.error('获取 roundedLabel 失败:', error)
        return '平滑'
      }
    },
    getRoundedOptions: (state: SizeState) => state.roundedOptions,

    // font size
    getFontSize: (state: SizeState) => state.fontSize,
    getFontSizeOptions: (state: SizeState) => state.fontSizeOptions,
    getFontSizeValue(state: SizeState) {
      try {
        // 建立与窗口尺寸的响应式依赖，确保缩放时会重新计算
        const _dep = state.windowSize.width + state.windowSize.height
        // 直接读取根元素当前字体大小（由 RemAdapter 设置），单位 px
        const rootFontSize = parseFloat(getComputedStyle(document.documentElement).fontSize)
        if (!isNaN(rootFontSize) && isFinite(rootFontSize) && rootFontSize > 0) {
          return rootFontSize
        }
      } catch (error) {
        console.error('获取 fontSizeValue 失败，使用回退值:', error)
      }
      // 回退：使用统一配置的默认值
      return DEFAULT_CONFIG.fontSize
    },
    getFontSizeLabel: (state: SizeState) => {
      try {
        return state.fontSizeOptions.find(option => option.key === state.fontSize)?.label
      } catch (error) {
        console.error('获取 fontSizeLabel 失败:', error)
        return '中号'
      }
    },
    getFontSizesValue(_state: SizeState) {
      try {
        const current = this.getFontSizeValue as number
        return current / 1.2
      } catch (error) {
        console.error('获取 fontSizesValue 失败:', error)
        return 13.33
      }
    },
    getFontSizexValue(_state: SizeState) {
      try {
        const current = this.getFontSizeValue as number
        return current + current / 2
      } catch (error) {
        console.error('获取 fontSizexValue 失败:', error)
        return 24
      }
    },
    getFontSizelValue(_state: SizeState) {
      try {
        const current = this.getFontSizeValue as number
        return current * 2
      } catch (error) {
        console.error('获取 fontSizelValue 失败:', error)
        return 32
      }
    },
  },

  actions: {
    // 内容高度按定义公式由 getters 动态计算，无需 actions 干预
    setSize(this: any, size: SizeOptions['value']) {
      this.size = size
      this.setCssVariables()
      // 兼容字体大小
      if (size === 'loose') {
        this.setFontSize('xl')
      } else if (size === 'comfortable') {
        this.setFontSize('md')
      } else if (size === 'compact') {
        this.setFontSize('xs')
      }
    },

    setPadding(this: any, padding: PaddingOptions['key']) {
      if (this.padding === padding) {
        return
      }
      this.padding = padding
      this.setCssVariables()
    },

    setRounded(this: any, rounded: RoundedOptions['key']) {
      if (this.rounded === rounded) {
        return
      }
      this.rounded = rounded
      this.setCssVariables()
    },

    setFontSize(this: any, fontSize: FontSizeOptions['key']) {
      if (this.fontSize === fontSize) {
        return
      }
      this.fontSize = fontSize
      this.setCssVariables()
      // switch (fontSize) {
      //   case 'xs':
      //     this.setSize('compact')
      //     break
      //   case 'sm':
      //   case 'md':
      //     this.setSize('comfortable')
      //     break
      //   case 'lg':
      //   case 'xl':
      //   case 'xls':
      //   case 'xxl':
      //   case 'xxxl':
      //     this.setSize('loose')
      //     break
      //   default:
      //     break
      // }
    },

    /* 更新 size css 变量 */
    setCssVariables(this: any) {
      const cssVariables: Record<string, string> = {
        [toKebabCase('sidebarWidth', '--')]: this.getSidebarWidth + 'px',
        [toKebabCase('sidebarCollapsedWidth', '--')]: this.getSidebarCollapsedWidth + 'px',
        [toKebabCase('headerHeight', '--')]: this.getHeaderHeight + 'px',
        [toKebabCase('breadcrumbHeight', '--')]: this.getBreadcrumbHeight + 'px',
        [toKebabCase('footerHeight', '--')]: this.getFooterHeight + 'px',
        [toKebabCase('tabsHeight', '--')]: this.getTabsHeight + 'px',
        [toKebabCase('contentHeight', '--')]: this.getContentHeight + 'px',
        [toKebabCase('contentBreadcrumbHeight', '--')]: this.getContentBreadcrumbHeight + 'px',
        [toKebabCase('contentTabsHeight', '--')]: this.getContentTabsHeight + 'px',
        [toKebabCase('contentsHeight', '--')]: this.getContentsHeight + 'px',
        [toKebabCase('contentsBreadcrumbHeight', '--')]: this.getContentsBreadcrumbHeight + 'px',
        [toKebabCase('contentsTabsHeight', '--')]: this.getContentsTabsHeight + 'px',

        [toKebabCase('gap', '--')]: this.getGap + 'px',
        [toKebabCase('gaps', '--')]: this.getGaps + 'px',
        [toKebabCase('gapx', '--')]: this.getGapx + 'px',
        [toKebabCase('gapl', '--')]: this.getGapl + 'px',

        [toKebabCase('padding', '--')]: (this.getPaddingValue || 0) + 'px',
        [toKebabCase('paddings', '--')]: (this.getPaddingsValue || 0) + 'px',
        [toKebabCase('paddingx', '--')]: (this.getPaddingxValue || 0) + 'px',
        [toKebabCase('paddingl', '--')]: (this.getPaddinglValue || 0) + 'px',

        [toKebabCase('rounded', '--')]: (this.getRoundedValue || 0) + 'px',

        [toKebabCase('appFontSize', '--')]: (this.getFontSizeValue || 0) + 'px',
        [toKebabCase('appFontSizes', '--')]: (this.getFontSizesValue || 0) + 'px',
        [toKebabCase('appFontSizex', '--')]: (this.getFontSizexValue || 0) + 'px',
        [toKebabCase('appFontSizel', '--')]: (this.getFontSizelValue || 0) + 'px',
      }
      Object.entries(cssVariables).forEach(([key, value]) => {
        document.documentElement.style.setProperty(key, value)
      })
    },

    init(this: any) {
      this.setSize(this.size)
      const { on } = useMitt()
      on('windowResize', async () => {
        // 更新窗口尺寸状态，触发 getter 重新计算（使用统一配置）
        this.windowSize = {
          width: Math.max(
            DEFAULT_CONFIG.windowSize.minWidth,
            Math.min(window.innerWidth, DEFAULT_CONFIG.windowSize.maxWidth)
          ),
          height: Math.max(
            DEFAULT_CONFIG.windowSize.minHeight,
            Math.min(window.innerHeight, DEFAULT_CONFIG.windowSize.maxHeight)
          ),
        }
        await nextTick()
        this.setCssVariables()
      })

      // 首次初始化时也根据当前窗口尺寸驱动一次，确保字体变量同步（使用统一配置）
      this.windowSize = {
        width: Math.max(
          DEFAULT_CONFIG.windowSize.minWidth,
          Math.min(window.innerWidth, DEFAULT_CONFIG.windowSize.maxWidth)
        ),
        height: Math.max(
          DEFAULT_CONFIG.windowSize.minHeight,
          Math.min(window.innerHeight, DEFAULT_CONFIG.windowSize.maxHeight)
        ),
      }
      this.setCssVariables()
    },

    reset(this: any) {
      this.size = 'comfortable'
      this.padding = 'md'
      this.rounded = 'smooth'
      this.sizes = cloneDeep(comfortableSizes)
      // 重置窗口尺寸状态（使用统一配置）
      this.windowSize = {
        width: Math.max(
          DEFAULT_CONFIG.windowSize.minWidth,
          Math.min(window.innerWidth, DEFAULT_CONFIG.windowSize.maxWidth)
        ),
        height: Math.max(
          DEFAULT_CONFIG.windowSize.minHeight,
          Math.min(window.innerHeight, DEFAULT_CONFIG.windowSize.maxHeight)
        ),
      }
      this.setCssVariables()
    },
  },

  // pinia-plugin-persistedstate
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  persist: {
    key: `${env.piniaKeyPrefix}-size`,
    storage: localStorage,
    serializer: {
      deserialize: (value: string) => {
        try {
          return JSON.parse(value)
        } catch {
          return {}
        }
      },
      serialize: (value: any) => JSON.stringify(value),
    },
  },
})

export const useSizeStoreWithOut = () => {
  return useSizeStore(store)
}
