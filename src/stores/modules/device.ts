// src/stores/modules/device.ts
import { defineStore } from 'pinia'
import { debounce } from 'lodash-es'
import { BREAKPOINTS, type BreakpointKey } from '@/constants/breakpoints'
import { useMitt } from '@/utils/mitt'
import type { DeviceState } from '@/types/systems/device'

// 防抖间隔，300ms 比较温和，适合 resize
const RESIZE_INTERVAL = 300

export const useDeviceStore = defineStore('device', {
  state: (): DeviceState => ({
    width: 0,
    height: 0,
    currentBreakpoint: 'xs' as BreakpointKey, // [修正] 明确类型断言
    type: 'PC',
    os: 'Unknown',
    orientation: 'horizontal',
    pixelRatio: 1,
    screenWidth: 0,
    screenHeight: 0,
    screenShortSide: 0,
    screenLongSide: 0,
    navHeight: 0,
    tabHeight: 0,
  }),

  getters: {
    /* ==============================================
     * v2.0 新版逻辑 Getters (推荐业务使用)
     * ============================================== */
    // 布局判定：基于宽度断点
    isMobileLayout: state => state.width < BREAKPOINTS.lg,
    isTabletLayout: state => state.width >= BREAKPOINTS.md && state.width < BREAKPOINTS.lg,
    isPCLayout: state => state.width >= BREAKPOINTS.lg,

    // 物理判定：基于 UA 和 触摸能力
    isTouchDevice: state =>
      state.type === 'Mobile' || state.type === 'Tablet' || 'ontouchstart' in window,

    /* ==============================================
     * v1.0 兼容性 Getters (确保旧代码不报错)
     * ============================================== */
    isMobile: state => state.width < BREAKPOINTS.lg,
    isTablet: state => state.width >= BREAKPOINTS.md && state.width < BREAKPOINTS.lg,
    isDesktop: state => state.width >= BREAKPOINTS.lg,
    getCurrentBreakpoint: (state): BreakpointKey => state.currentBreakpoint,
    getWidth: (state): number => state.width,
    getHeight: (state): number => state.height,
    getDefinitely: (state): number => state.screenShortSide, // 兼容原 definitely
    getDeviceWidth: (state): number => state.screenWidth,
    getDeviceHeight: (state): number => state.screenHeight,
  },

  actions: {
    /**
     * 核心检测逻辑
     */
    detectDeviceInfo() {
      const ua = navigator.userAgent
      const screenW = window.screen.width
      const screenH = window.screen.height
      const pageW = window.innerWidth
      const pageH = window.innerHeight

      this.width = pageW
      this.height = pageH
      this.screenWidth = screenW
      this.screenHeight = screenH
      this.pixelRatio = window.devicePixelRatio || 1

      this.orientation = pageW >= pageH ? 'horizontal' : 'vertical'
      this.screenShortSide = Math.min(pageW, pageH)
      this.screenLongSide = Math.max(pageW, pageH)

      // 系统类型判定
      if (/Windows/i.test(ua)) this.os = 'Windows'
      else if (/Mac OS/i.test(ua)) this.os = 'MacOS'
      else if (/Android/i.test(ua)) this.os = 'Android'
      else if (/iPhone|iPad|iPod/i.test(ua)) this.os = 'iOS'
      else if (/Linux/i.test(ua)) this.os = 'Linux'
      else this.os = 'Unknown'

      // 设备类型判定
      const isMobileUA = /Android|webOS|iPhone|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua)
      const isTabletUA = /iPad/i.test(ua) || (isMobileUA && this.screenShortSide >= 600)

      if (isTabletUA) this.type = 'Tablet'
      else if (isMobileUA) this.type = 'Mobile'
      else this.type = 'PC'

      // 移动端 UI 高度预估
      if (this.type !== 'PC') {
        if (this.os === 'iOS') {
          this.navHeight = 44
          this.tabHeight = 34
        } else if (this.os === 'Android') {
          this.navHeight = 48
          this.tabHeight = 48
        }
      } else {
        this.navHeight = 0
        this.tabHeight = 0
      }

      this.updateBreakpoint()

      // 触发事件总线 (使用类型断言兼容 mitt 类型定义)
      try {
        ;(useMitt().emit as any)('windowResize', { width: pageW, height: pageH })
      } catch (_e) {
        // ignore
      }
    },

    /**
     * 更新断点 (v2.0 标准)
     */
    updateBreakpoint() {
      const bps = Object.entries(BREAKPOINTS).sort((a, b) => b[1] - a[1])
      const match = bps.find(([_, val]) => this.width >= val)
      // [修正] 确保赋值给 state 的类型匹配 BreakpointKey
      this.currentBreakpoint = (match ? match[0] : 'xs') as BreakpointKey
    },

    /**
     * 初始化监听 (带清理功能)
     */
    init() {
      // 立即执行一次
      this.detectDeviceInfo()

      // 创建防抖函数并保存引用
      const handleResize = debounce(() => {
        this.detectDeviceInfo()
      }, RESIZE_INTERVAL)

      const handleOrientation = () => {
        setTimeout(handleResize, 300)
      }

      const handleVisibility = () => {
        if (document.visibilityState === 'visible') {
          handleResize()
        }
      }

      // [核心修正] 保存所有处理函数的引用，以便 removeEventListener 能正确清理
      const handlers = {
        resize: handleResize,
        orientation: handleOrientation,
        pageshow: handleResize, // pageshow 复用 resize 逻辑
        visibility: handleVisibility,
      }

      window.addEventListener('resize', handlers.resize)
      window.addEventListener('orientationchange', handlers.orientation)
      window.addEventListener('pageshow', handlers.pageshow)
      window.addEventListener('visibilitychange', handlers.visibility)

      // 返回清理函数 (Vue 组件 onUnmounted 时可调用，或在 HMR 时自动清理)
      return () => {
        window.removeEventListener('resize', handlers.resize)
        window.removeEventListener('orientationchange', handlers.orientation)
        window.removeEventListener('pageshow', handlers.pageshow)
        window.removeEventListener('visibilitychange', handlers.visibility)
      }
    },
  },
})
