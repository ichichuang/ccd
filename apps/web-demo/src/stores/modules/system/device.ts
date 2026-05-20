// src/stores/modules/device.ts
import { defineStore } from 'pinia'
import { BREAKPOINTS, type BreakpointKey } from '@ccd/design-tokens'
import { useEventListener } from '@vueuse/core'
import { debounceFn } from '@ccd/shared-utils'
import { useMitt } from '@/utils/mitt'
import type { DeviceState } from '@/types/systems/device'
import { getDeviceTypeSync, getOsTypeSync } from '@/utils/deviceSync'
import { resolveLayoutDeviceFlags } from '@/layouts/runtime/layoutRuntime'

// 防抖间隔，300ms 比较温和，适合 resize
const RESIZE_INTERVAL = 300
/** 最后一次原生 resize 事件后多久视为"拖拽结束" */
const RESIZE_IDLE_TIMEOUT = 150

/**
 * iOS Safari：地址栏显隐 / 滚动锁定（blockScroll）常引起仅纵向 innerHeight 抖动。
 * 若宽度未变且高度变化小于此阈值，视为噪声，不触发 `isResizing`（避免 app-resizing 误杀全局过渡）。
 */
const VIEWPORT_HEIGHT_NOISE_THRESHOLD_PX = 100

/** 供 markResizing 与上一次原生 resize 比对（独立于 store，避免与 debounce 的 detectViewportInfo 竞态） */
let lastResizeViewportWidth = typeof window === 'undefined' ? 0 : window.innerWidth
let lastResizeViewportHeight = typeof window === 'undefined' ? 0 : window.innerHeight
let cleanupDeviceRuntime: (() => void) | undefined
let viewportRafId: number | undefined

/** 模块级缓存：断点按阈值降序排列，避免每次 resize 重复排序 */
const SORTED_BREAKPOINTS: [string, number][] = [...Object.entries(BREAKPOINTS)].sort(
  (a, b) => b[1] - a[1]
)

/** 根据宽度同步计算断点（使用缓存的排序结果） */
function resolveBreakpoint(width: number): BreakpointKey {
  const match = SORTED_BREAKPOINTS.find(([, val]) => width >= val)
  return match ? (match[0] as BreakpointKey) : 'xs'
}

/** SSR 安全的初始视口宽度 */
const INITIAL_WIDTH: number = typeof window === 'undefined' ? 0 : window.innerWidth
const INITIAL_HEIGHT: number = typeof window === 'undefined' ? 0 : window.innerHeight
const INITIAL_DEVICE_TYPE = getDeviceTypeSync()
const INITIAL_OS_TYPE = getOsTypeSync()

export const useDeviceStore = defineStore('device', {
  state: (): DeviceState => ({
    width: INITIAL_WIDTH,
    height: INITIAL_HEIGHT,
    currentBreakpoint: resolveBreakpoint(INITIAL_WIDTH),
    type: INITIAL_DEVICE_TYPE,
    os: INITIAL_OS_TYPE,
    orientation: INITIAL_WIDTH >= INITIAL_HEIGHT ? 'horizontal' : 'vertical',
    pixelRatio: typeof window === 'undefined' ? 1 : window.devicePixelRatio || 1,
    screenWidth: typeof window === 'undefined' ? 0 : window.screen.width,
    screenHeight: typeof window === 'undefined' ? 0 : window.screen.height,
    screenShortSide: Math.min(INITIAL_WIDTH, INITIAL_HEIGHT),
    screenLongSide: Math.max(INITIAL_WIDTH, INITIAL_HEIGHT),
    navHeight: 0,
    tabHeight: 0,
    isResizing: false,
  }),

  getters: {
    /* ==============================================
     * v2.0 新版逻辑 Getters (推荐业务使用)
     * ============================================== */
    // 布局判定：基于断点 + 设备类型，与 layout.effectiveMode 逻辑一致
    isMobileLayout: state =>
      resolveLayoutDeviceFlags({
        deviceType: state.type,
        breakpoint: state.currentBreakpoint,
      }).isMobile,
    isTabletLayout: state =>
      resolveLayoutDeviceFlags({
        deviceType: state.type,
        breakpoint: state.currentBreakpoint,
      }).isTablet,
    isPCLayout: state =>
      resolveLayoutDeviceFlags({
        deviceType: state.type,
        breakpoint: state.currentBreakpoint,
      }).isDesktop,

    // 物理判定：基于 UA 和 触摸能力
    isTouchDevice: state =>
      state.type === 'Mobile' ||
      state.type === 'Tablet' ||
      (typeof window !== 'undefined' && 'ontouchstart' in window),
    isMobileTerminal: state => state.type === 'Mobile',
    isTabletTerminal: state => state.type === 'Tablet',

    /* ==============================================
     * v1.0 兼容性 Getters (确保旧代码不报错)
     * ============================================== */
    isMobile: state =>
      resolveLayoutDeviceFlags({
        deviceType: state.type,
        breakpoint: state.currentBreakpoint,
      }).isMobile,
    isTablet: state =>
      resolveLayoutDeviceFlags({
        deviceType: state.type,
        breakpoint: state.currentBreakpoint,
      }).isTablet,
    isDesktop: state =>
      resolveLayoutDeviceFlags({
        deviceType: state.type,
        breakpoint: state.currentBreakpoint,
      }).isDesktop,
    getCurrentBreakpoint: (state): BreakpointKey => state.currentBreakpoint,
    getWidth: (state): number => state.width,
    getHeight: (state): number => state.height,
    getDefinitely: (state): number => state.screenShortSide, // 兼容原 definitely
    getDeviceWidth: (state): number => state.screenWidth,
    getDeviceHeight: (state): number => state.screenHeight,
  },

  actions: {
    /**
     * 1. 静态硬件检测 (仅在 init 时运行一次)
     * 解析 User Agent，确定操作系统和物理设备类型
     */
    initHardwareInfo() {
      this.os = getOsTypeSync()
      this.type = getDeviceTypeSync()

      // 移动端 UI 预估高度 (硬件决定，不会随视口变化)
      if (this.type !== 'PC') {
        this.navHeight = this.os === 'iOS' ? 44 : 48
        this.tabHeight = this.os === 'iOS' ? 34 : 48
      } else {
        this.navHeight = 0
        this.tabHeight = 0
      }
    },

    /**
     * 2. 动态视口检测 (在 resize 时高频触发)
     * 仅计算与窗口尺寸相关的值
     */
    detectViewportInfo() {
      const pageW = window.innerWidth
      const pageH = window.innerHeight

      this.width = pageW
      this.height = pageH
      this.screenWidth = window.screen.width
      this.screenHeight = window.screen.height
      this.pixelRatio = window.devicePixelRatio || 1

      this.orientation = pageW >= pageH ? 'horizontal' : 'vertical'
      this.screenShortSide = Math.min(pageW, pageH)
      this.screenLongSide = Math.max(pageW, pageH)

      this.updateBreakpoint()
      useMitt().emit('windowResize', { width: pageW, height: pageH })
    },

    /**
     * 更新断点 (v2.0 标准)
     */
    updateBreakpoint() {
      this.currentBreakpoint = resolveBreakpoint(this.width)
    },

    /**
     * 初始化监听 (带清理功能)
     */
    init() {
      if (typeof window === 'undefined') {
        return () => {}
      }
      if (cleanupDeviceRuntime) {
        return cleanupDeviceRuntime
      }

      // 首次加载：先测硬件，再测视口
      this.initHardwareInfo()
      this.detectViewportInfo()

      lastResizeViewportWidth = window.innerWidth
      lastResizeViewportHeight = window.innerHeight

      // --- isResizing 标记：原生 resize 立即置 true，空闲后恢复 ---
      let resizeIdleTimer: ReturnType<typeof setTimeout> | undefined
      const markResizing = () => {
        const w = window.innerWidth
        const h = window.innerHeight

        const widthChanged = w !== lastResizeViewportWidth
        if (!widthChanged) {
          const dh = Math.abs(h - lastResizeViewportHeight)
          if (dh > 0 && dh < VIEWPORT_HEIGHT_NOISE_THRESHOLD_PX) {
            lastResizeViewportWidth = w
            lastResizeViewportHeight = h
            return
          }
        }

        lastResizeViewportWidth = w
        lastResizeViewportHeight = h

        this.isResizing = true
        if (resizeIdleTimer !== undefined) clearTimeout(resizeIdleTimer)
        resizeIdleTimer = setTimeout(() => {
          this.isResizing = false
          resizeIdleTimer = undefined
        }, RESIZE_IDLE_TIMEOUT)
      }

      const detectInAnimationFrame = () => {
        if (viewportRafId !== undefined) return
        viewportRafId = window.requestAnimationFrame(() => {
          viewportRafId = undefined
          this.detectViewportInfo()
        })
      }

      // 绑定的全都是纯净的视口计算函数：debounce 合并 resize storm，rAF 对齐渲染帧。
      const handleResize = debounceFn(() => {
        detectInAnimationFrame()
      }, RESIZE_INTERVAL)

      const handleVisualViewportResize = debounceFn(() => {
        detectInAnimationFrame()
      }, RESIZE_INTERVAL)

      const handleImmediateViewportSync = () => {
        detectInAnimationFrame()
      }

      const handleVisibility = () => {
        if (document.visibilityState === 'visible') {
          handleImmediateViewportSync()
        }
      }

      const cleanupFns: Array<() => void> = [
        useEventListener(window, 'resize', markResizing),
        useEventListener(window, 'resize', handleResize),
        useEventListener(window, 'orientationchange', handleImmediateViewportSync),
        useEventListener(window, 'pageshow', handleImmediateViewportSync),
        useEventListener(document, 'visibilitychange', handleVisibility),
      ]

      if (window.visualViewport) {
        cleanupFns.push(
          useEventListener(window.visualViewport, 'resize', handleVisualViewportResize)
        )
        cleanupFns.push(
          useEventListener(window.visualViewport, 'scroll', handleVisualViewportResize)
        )
      }

      cleanupDeviceRuntime = () => {
        cleanupFns.forEach(cleanup => cleanup())
        if (resizeIdleTimer !== undefined) clearTimeout(resizeIdleTimer)
        if (viewportRafId !== undefined) {
          window.cancelAnimationFrame(viewportRafId)
          viewportRafId = undefined
        }
        this.isResizing = false
        cleanupDeviceRuntime = undefined
      }

      return cleanupDeviceRuntime
    },
  },
})
