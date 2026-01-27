/**
 * 主题切换 Hook（支持多模式动画）
 * 采用策略模式，将动画逻辑与状态管理分离
 */

import { ref, computed } from 'vue'
import { useThemeStore } from '@/stores/modules/theme'
import {
  getTransitionConfig,
  getBackgroundColor,
  calculateCircleRadius,
} from '@/utils/theme/transitions'

type ViewTransition = {
  ready: Promise<void>
  finished: Promise<void>
}

/**
 * 创建淡入淡出蒙层
 */
function createFadeOverlay(color: string, duration: number, blur?: number) {
  const overlay = document.createElement('div')
  overlay.className = 'theme-fade-overlay'
  overlay.style.background = color
  overlay.style.position = 'fixed'
  overlay.style.inset = '0'
  overlay.style.zIndex = '2000'
  overlay.style.opacity = '0'
  overlay.style.pointerEvents = 'none'
  overlay.style.transition = `opacity ${duration}ms ease`
  if (blur) {
    overlay.style.backdropFilter = `blur(${blur}px)`
  }
  document.body.appendChild(overlay)
  return overlay
}

/**
 * 注入用于 CSS 动画的动态坐标变量
 */
function applyTransitionVariables(event: MouseEvent | null) {
  if (event) {
    const { clientX, clientY } = event
    const radius = calculateCircleRadius(clientX, clientY)
    document.documentElement.style.setProperty('--transition-x', `${clientX}px`)
    document.documentElement.style.setProperty('--transition-y', `${clientY}px`)
    document.documentElement.style.setProperty('--transition-radius', `${radius}px`)
  } else {
    document.documentElement.style.setProperty('--transition-x', '50%')
    document.documentElement.style.setProperty('--transition-y', '50%')
    document.documentElement.style.setProperty('--transition-radius', '150%')
  }
}

export function useThemeSwitch() {
  const themeStore = useThemeStore()
  const isAnimating = ref(false)

  // 计算属性
  const mode = computed(() => themeStore.mode)
  const isDark = computed(() => {
    if (themeStore.mode === 'auto') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches
    }
    return themeStore.mode === 'dark'
  })
  const transitionMode = computed(() => themeStore.transitionMode)

  /**
   * 设置主题模式（无动画）
   */
  const setMode = (newMode: ThemeMode) => {
    themeStore.setMode(newMode)
  }

  /**
   * 获取下一个模式（排除 auto）
   */
  const getNextMode = (): ThemeMode => {
    const currentIsDark = isDark.value
    return currentIsDark ? 'light' : 'dark'
  }

  /**
   * 切换主题模式（无动画）
   */
  const toggleMode = () => {
    const nextMode = getNextMode()
    setMode(nextMode)
  }

  /**
   * 核心动画逻辑：使用 View Transition API 切换到指定模式
   */
  const toggleThemeWithAnimation = async (
    event: MouseEvent | null = null,
    mode: ThemeTransitionMode | null = null
  ) => {
    if (isAnimating.value) return
    isAnimating.value = true

    const currentIsDark = isDark.value
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    const nextMode = getNextMode()
    const willBeDark = nextMode === 'dark' || (nextMode === 'auto' && systemPrefersDark)

    // 切换到 auto 且当前已是深色且系统也是深色时，直接切换不播动画
    const shouldSkipAnimation = nextMode === 'auto' && currentIsDark && systemPrefersDark
    if (shouldSkipAnimation) {
      setMode(nextMode)
      isAnimating.value = false
      return
    }

    // 检查浏览器支持
    if (!document?.startViewTransition) {
      setMode(nextMode)
      isAnimating.value = false
      return
    }

    // 获取过渡模式配置
    const transitionModeToUse = mode || transitionMode.value
    const config = getTransitionConfig(transitionModeToUse, event)

    // 设置 data-transition 属性
    document.documentElement.setAttribute('data-transition', transitionModeToUse)

    // 注入动态坐标变量，供 CSS keyframes 使用
    applyTransitionVariables(event)

    const applyModeChange = () => setMode(nextMode)

    try {
      // 保存旧背景色
      const oldBg = getBackgroundColor('--background')
      document.documentElement.style.setProperty('--bg100-old', oldBg)
      document.documentElement.classList.add('theme-transition')

      const transition = document.startViewTransition(async () => {
        applyModeChange()
        document.documentElement.classList.toggle('dark', willBeDark)
        const newBg = getBackgroundColor('--background')
        document.documentElement.style.setProperty('--bg100-new', newBg)
      }) as ViewTransition

      await transition.ready

      // 创建蒙层（如果需要）
      let overlay: HTMLElement | null = null
      if (config.overlay) {
        const targetBg = getBackgroundColor('--background')
        const { blur, opacity } = config.overlay
        overlay = createFadeOverlay(targetBg, config.duration, blur)
        requestAnimationFrame(() => {
          if (overlay && typeof opacity === 'number') {
            overlay.style.opacity = String(opacity)
          }
        })
      }

      await transition.finished

      // 清理蒙层
      if (overlay) {
        overlay.style.opacity = '0'
        setTimeout(() => overlay?.remove(), config.duration)
      }

      // 清理状态
      document.documentElement.classList.remove('theme-transition')
      document.documentElement.style.removeProperty('--bg100-old')
      document.documentElement.style.removeProperty('--bg100-new')
      document.documentElement.removeAttribute('data-transition')
    } catch (error) {
      console.error('Theme transition failed:', error)
      applyModeChange()
      document.documentElement.classList.remove('theme-transition')
      document.documentElement.style.removeProperty('--bg100-old')
      document.documentElement.style.removeProperty('--bg100-new')
      document.documentElement.removeAttribute('data-transition')
    } finally {
      // 清理动态坐标变量
      document.documentElement.style.removeProperty('--transition-x')
      document.documentElement.style.removeProperty('--transition-y')
      document.documentElement.style.removeProperty('--transition-radius')
      isAnimating.value = false
    }
  }

  /**
   * 切换到指定模式并播放动画
   */
  const setThemeWithAnimation = async (
    targetMode: ThemeMode,
    event: MouseEvent | null = null,
    transitionModeOverride: ThemeTransitionMode | null = null
  ) => {
    if (mode.value === targetMode) return

    if (isAnimating.value) return
    isAnimating.value = true

    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    const willBeDark = targetMode === 'dark' || (targetMode === 'auto' && systemPrefersDark)

    // 检查浏览器支持
    if (!document?.startViewTransition) {
      setMode(targetMode)
      isAnimating.value = false
      return
    }

    // 获取过渡模式配置
    const transitionModeToUse = transitionModeOverride || transitionMode.value
    const config = getTransitionConfig(transitionModeToUse, event)

    // 设置 data-transition 属性
    document.documentElement.setAttribute('data-transition', transitionModeToUse)

    // 注入动态坐标变量，供 CSS keyframes 使用
    applyTransitionVariables(event)

    const applyModeChange = () => setMode(targetMode)

    try {
      // 保存旧背景色
      const oldBg = getBackgroundColor('--background')
      document.documentElement.style.setProperty('--bg100-old', oldBg)
      document.documentElement.classList.add('theme-transition')

      const transition = document.startViewTransition(async () => {
        applyModeChange()
        document.documentElement.classList.toggle('dark', willBeDark)
        const newBg = getBackgroundColor('--background')
        document.documentElement.style.setProperty('--bg100-new', newBg)
      }) as ViewTransition

      await transition.ready

      // 创建蒙层（如果需要）
      let overlay: HTMLElement | null = null
      if (config.overlay) {
        const targetBg = getBackgroundColor('--background')
        const { blur, opacity } = config.overlay
        overlay = createFadeOverlay(targetBg, config.duration, blur)
        requestAnimationFrame(() => {
          if (overlay && typeof opacity === 'number') {
            overlay.style.opacity = String(opacity)
          }
        })
      }

      await transition.finished

      // 清理蒙层
      if (overlay) {
        overlay.style.opacity = '0'
        setTimeout(() => overlay?.remove(), config.duration)
      }

      // 清理状态
      document.documentElement.classList.remove('theme-transition')
      document.documentElement.style.removeProperty('--bg100-old')
      document.documentElement.style.removeProperty('--bg100-new')
      document.documentElement.removeAttribute('data-transition')
    } catch (error) {
      console.error('Theme transition failed:', error)
      applyModeChange()
      document.documentElement.classList.remove('theme-transition')
      document.documentElement.style.removeProperty('--bg100-old')
      document.documentElement.style.removeProperty('--bg100-new')
      document.documentElement.removeAttribute('data-transition')
    } finally {
      // 清理动态坐标变量
      document.documentElement.style.removeProperty('--transition-x')
      document.documentElement.style.removeProperty('--transition-y')
      document.documentElement.style.removeProperty('--transition-radius')
      isAnimating.value = false
    }
  }

  return {
    // 状态
    isAnimating,
    isDark,
    mode,
    transitionMode,

    // 方法
    toggleThemeWithAnimation,
    setThemeWithAnimation,
    toggleMode,
    setMode,
    getNextMode,
  }
}
