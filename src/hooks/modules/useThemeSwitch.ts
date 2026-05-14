/**
 * 主题切换 Hook（支持多模式动画）
 * 采用策略模式，将动画逻辑与状态管理分离
 * v2.0 - 性能优化版本
 */

import type { Ref, ComputedRef } from 'vue'
import { useThemeStore } from '@/stores/modules/system'
import { THEME_PRESETS, DEFAULT_THEME_NAME } from '@/constants/theme'
import { RUNTIME_STORAGE_KEYS } from '@/constants/runtime'
import { RUNTIME_E2E_EVENTS } from '@/constants/runtime'
import { generateThemeVars, applyTheme } from '@/utils/theme/engine'
import { rgbToHex } from '@/utils/theme/colors'
import {
  applyThemeModeToRoot,
  getSystemPrefersDark,
  resolveThemeModeIsDark,
} from '@/utils/theme/mode'
import { dispatchRuntimeE2EEvent, isVisualE2EMode } from '@/utils/runtime/e2e'
import {
  getTransitionConfig,
  calculateCircleRadius,
  calculateDiamondRadius,
  setThemeLocked,
  resolveTransitionMode,
} from '@/utils/theme/transitions'

type ViewTransition = {
  ready: Promise<void>
  finished: Promise<void>
}

interface ThemeTransitionRequest {
  targetMode: ThemeMode
  event: MouseEvent | null
  transitionModeOverride: ThemeTransitionMode | null
}

// 主题过渡"代际"计数：清理时仅当仍是当前代才移除 data-transition / is-view-transitioning，避免上一轮 cleanup 误删下一轮已设置的属性导致闪动
let themeTransitionGeneration = 0

// 主题动画状态需要在所有 useThemeSwitch() 调用点之间共享，否则 Settings/Header/Login
// 会各自认为“当前没在动画”，导致一部分入口锁住、一部分入口还能继续触发。
const sharedIsAnimating = ref(false)
let activeTransitionTarget: ThemeMode | null = null
let pendingThemeTransitionRequest: ThemeTransitionRequest | null = null

// 过渡锁已抽离至 @/utils/theme/transitions，避免 theme store ↔ useThemeSwitch 循环依赖
export { isThemeLocked } from '@/utils/theme/transitions'

/**
 * 创建淡入淡出蒙层
 */
function createFadeOverlay(_color: string, duration: number) {
  const overlay = document.createElement('div')
  overlay.className = 'theme-fade-overlay'
  overlay.style.background = _color
  overlay.style.position = 'fixed'
  overlay.style.inset = '0'
  overlay.style.zIndex = '2000'
  overlay.style.opacity = '0'
  overlay.style.pointerEvents = 'none'
  overlay.style.transition = `opacity ${duration}ms ease`
  document.body.appendChild(overlay)
  return overlay
}

/**
 * 清理蒙层（使用 Promise 确保动画完成后再清理）
 */
function cleanupOverlay(overlay: HTMLElement, duration: number): Promise<void> {
  return new Promise(resolve => {
    let cleaned = false
    let fallbackTimer: ReturnType<typeof globalThis.setTimeout> | null = null
    overlay.style.opacity = '0'
    const cleanup = () => {
      if (cleaned) return
      cleaned = true
      if (fallbackTimer !== null) {
        globalThis.clearTimeout(fallbackTimer)
      }
      overlay.remove()
      resolve()
    }
    overlay.addEventListener('transitionend', cleanup, { once: true })
    fallbackTimer = globalThis.setTimeout(cleanup, duration + 50)
  })
}

/** 注入过渡时长 CSS 变量，供各 mode 的 SCSS 使用 */
function applyTransitionDurationVariable(durationMs: number) {
  document.documentElement.style.setProperty('--theme-transition-duration', `${durationMs}ms`)
}

/**
 * 注入用于 CSS 动画的动态坐标变量
 * 支持 circle 和 diamond 两种模式
 */
function applyTransitionVariables(_event: MouseEvent | null, mode: ThemeTransitionMode) {
  // fade 专用短路：不做任何几何半径计算，也不注入 --transition-x/y/radius
  if (mode === 'fade') return

  const centerX = window.innerWidth / 2
  const centerY = window.innerHeight / 2
  const radius =
    mode === 'diamond'
      ? calculateDiamondRadius(centerX, centerY)
      : calculateCircleRadius(centerX, centerY)

  document.documentElement.style.setProperty('--transition-x', `${centerX}px`)
  document.documentElement.style.setProperty('--transition-y', `${centerY}px`)
  document.documentElement.style.setProperty('--transition-radius', `${radius}px`)
}

/**
 * 原子化全局清理（Grand Unified Fix v5.0）：
 * 统一收尾：此时 recovery class 已在主流程中添加，仅需最终解锁
 *
 * 使用链式 rAF 替代嵌套，配合 generation 守卫避免跨代误删。
 */
function cleanupTransitionState(generation?: number): Promise<void> {
  const root = document.documentElement
  if (generation !== undefined && generation !== themeTransitionGeneration) {
    return Promise.resolve()
  }

  return new Promise(resolve => {
    const VIEW_TRANSITION_VARS = ['--transition-x', '--transition-y', '--transition-radius']
    const currentCssText: string = root.style.cssText
    const cleanedCssText: string = currentCssText
      .split(';')
      .map(s => s.trim())
      .filter(part => {
        const prop: string | undefined = part.split(':')[0]?.trim()
        return prop && !VIEW_TRANSITION_VARS.includes(prop)
      })
      .join('; ')
    root.style.cssText = cleanedCssText

    let frameCount = 0

    const onFrame = (): void => {
      if (generation !== undefined && generation !== themeTransitionGeneration) {
        resolve()
        return
      }
      frameCount++
      if (frameCount < 3) {
        globalThis.requestAnimationFrame(onFrame)
        return
      }
      globalThis.setTimeout(() => {
        if (generation !== undefined && generation !== themeTransitionGeneration) {
          resolve()
          return
        }
        root.classList.remove('theme-transition-recovery')
        root.classList.remove('theme-transition')
        root.removeAttribute('data-transition')
        setThemeLocked(false)
        resolve()
      }, 100)
    }

    globalThis.requestAnimationFrame(onFrame)
  })
}

export interface UseThemeSwitchReturn {
  isAnimating: Ref<boolean>
  isDark: ComputedRef<boolean>
  mode: ComputedRef<ThemeMode>
  transitionMode: ComputedRef<ThemeTransitionMode>
  toggleThemeWithAnimation: (
    event?: MouseEvent | null,
    mode?: ThemeTransitionMode | null
  ) => Promise<void>
  setThemeWithAnimation: (
    targetMode: ThemeMode,
    event?: MouseEvent | null,
    transitionModeOverride?: ThemeTransitionMode | null
  ) => Promise<void>
  toggleMode: () => void
  setMode: (newMode: ThemeMode) => void
  getNextMode: () => ThemeMode
}

export function useThemeSwitch(): UseThemeSwitchReturn {
  const themeStore = useThemeStore()
  const isAnimating = computed(() => sharedIsAnimating.value)

  // 计算属性
  const mode = computed(() => themeStore.mode)
  const isDark = computed(() => resolveThemeModeIsDark(themeStore.mode))
  const transitionMode = computed(() => themeStore.transitionMode)
  const transitionDuration = computed(() => themeStore.transitionDuration)

  const beginThemeTransitionSignal = (transition: ThemeTransitionMode): void => {
    const root = document.documentElement
    root.dataset.themeTransitioning = 'true'
    root.dataset.themeTransitionMode = transition
    dispatchRuntimeE2EEvent(RUNTIME_E2E_EVENTS.themeTransitionStart, {
      mode: themeStore.mode,
      transition,
    })
  }

  const endThemeTransitionSignal = (targetMode: ThemeMode): void => {
    const root = document.documentElement
    root.dataset.themeTransitioning = 'false'
    root.dataset.themeMode = targetMode
    dispatchRuntimeE2EEvent(RUNTIME_E2E_EVENTS.themeTransitionEnd, {
      mode: targetMode,
    })
  }

  const applyModeSnapshot = (targetMode: ThemeMode, systemPrefersDark: boolean): void => {
    themeStore.mode = targetMode

    const isDarkNow = resolveThemeModeIsDark(targetMode, systemPrefersDark)
    const preset =
      THEME_PRESETS.find(p => p.name === themeStore.themeName) ||
      THEME_PRESETS.find(p => p.name === DEFAULT_THEME_NAME) ||
      THEME_PRESETS[0]
    const vars = generateThemeVars(preset, isDarkNow)

    applyTheme(vars)
    applyThemeModeToRoot(targetMode, isDarkNow)
    void document.documentElement.offsetHeight

    try {
      localStorage.setItem(RUNTIME_STORAGE_KEYS.themeMode, targetMode)
    } catch (_) {
      /* ignore */
    }
  }

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
    const currentMode = activeTransitionTarget ?? mode.value
    const currentIsDark = resolveThemeModeIsDark(currentMode)
    return currentIsDark ? 'light' : 'dark'
  }

  /**
   * 切换主题模式（无动画）
   */
  const toggleMode = () => {
    const nextMode = getNextMode()
    setMode(nextMode)
  }

  const queueThemeTransition = (
    targetMode: ThemeMode,
    event: MouseEvent | null,
    transitionModeOverride: ThemeTransitionMode | null
  ): void => {
    pendingThemeTransitionRequest = {
      targetMode,
      event,
      transitionModeOverride,
    }
  }

  const dequeueThemeTransition = (): ThemeTransitionRequest | null => {
    const request = pendingThemeTransitionRequest
    pendingThemeTransitionRequest = null
    return request
  }

  const runThemeTransition = async (
    targetMode: ThemeMode,
    event: MouseEvent | null = null,
    transitionModeOverride: ThemeTransitionMode | null = null
  ): Promise<void> => {
    const transitionModeToUse = resolveTransitionMode(
      transitionModeOverride || transitionMode.value
    )
    const systemPrefersDark = getSystemPrefersDark()
    const visualE2EMode = isVisualE2EMode()

    if (!document?.startViewTransition || visualE2EMode) {
      setThemeLocked(true)
      sharedIsAnimating.value = true
      activeTransitionTarget = targetMode
      themeTransitionGeneration++
      try {
        beginThemeTransitionSignal(transitionModeToUse)
        applyModeSnapshot(targetMode, systemPrefersDark)
        endThemeTransitionSignal(targetMode)
      } finally {
        sharedIsAnimating.value = false
        activeTransitionTarget = null
        setThemeLocked(false)
      }
      return
    }

    setThemeLocked(true)
    sharedIsAnimating.value = true
    activeTransitionTarget = targetMode
    themeTransitionGeneration++
    const myGeneration = themeTransitionGeneration

    // 获取过渡模式配置（含自定义时长）
    const config = getTransitionConfig(transitionModeToUse, event, transitionDuration.value)

    // 注入过渡时长 CSS 变量，供各 mode 的 SCSS animation 使用
    applyTransitionDurationVariable(config.duration)

    // 设置 data-transition 属性
    document.documentElement.setAttribute('data-transition', transitionModeToUse)

    // 注入动态坐标变量，供 CSS keyframes 使用（支持 diamond 模式）
    applyTransitionVariables(event, transitionModeToUse)
    beginThemeTransitionSignal(transitionModeToUse)

    const applyModeChange = () => {
      applyModeSnapshot(targetMode, systemPrefersDark)
    }

    try {
      // ═══════════════════════════════════════════════════════════════
      // 关键修复（v6.0）：在 startViewTransition 之前添加 recovery class
      // ═══════════════════════════════════════════════════════════════
      document.documentElement.classList.add('theme-transition')
      document.documentElement.classList.add('is-view-transitioning')
      document.documentElement.classList.add('theme-transition-recovery') // 关键：提前添加

      const transition = document.startViewTransition(async () => {
        applyModeChange()
        await nextTick()
      }) as ViewTransition

      await transition.ready

      // 计算目标颜色用于蒙层（如果需要）
      let overlay: HTMLElement | null = null
      if (config.overlay && config.overlay.opacity > 0) {
        const willBeDark = resolveThemeModeIsDark(targetMode, systemPrefersDark)
        const preset =
          THEME_PRESETS.find(p => p.name === themeStore.themeName) ||
          THEME_PRESETS.find(p => p.name === DEFAULT_THEME_NAME) ||
          THEME_PRESETS[0]
        const newBg = rgbToHex(generateThemeVars(preset, willBeDark)['--background'])
        const { opacity } = config.overlay
        overlay = createFadeOverlay(newBg, config.duration)
        requestAnimationFrame(() => {
          if (overlay && typeof opacity === 'number') {
            overlay.style.opacity = String(opacity)
          }
        })
      }

      await transition.finished

      document.documentElement.classList.remove('is-view-transitioning')

      if (overlay) {
        await cleanupOverlay(overlay, config.duration)
      }

      await cleanupTransitionState(myGeneration)
    } catch (error) {
      console.error('Theme transition failed:', error)
      applyModeChange()
      await cleanupTransitionState(myGeneration)
    } finally {
      sharedIsAnimating.value = false
      activeTransitionTarget = null
      endThemeTransitionSignal(targetMode)

      const queuedRequest = dequeueThemeTransition()
      if (queuedRequest && queuedRequest.targetMode !== themeStore.mode) {
        queueMicrotask(() => {
          void requestThemeTransition(
            queuedRequest.targetMode,
            queuedRequest.event,
            queuedRequest.transitionModeOverride
          )
        })
      }
    }
  }

  const requestThemeTransition = async (
    targetMode: ThemeMode,
    event: MouseEvent | null = null,
    transitionModeOverride: ThemeTransitionMode | null = null
  ): Promise<void> => {
    if (sharedIsAnimating.value) {
      const effectiveMode = activeTransitionTarget ?? mode.value
      if (targetMode !== effectiveMode) {
        queueThemeTransition(targetMode, event, transitionModeOverride)
      }
      return
    }

    if (mode.value === targetMode) return

    await runThemeTransition(targetMode, event, transitionModeOverride)
    themeStore.syncThemePreference()
  }

  /**
   * 核心动画逻辑：使用 View Transition API 切换到指定模式
   */
  const toggleThemeWithAnimation = async (
    event: MouseEvent | null = null,
    mode: ThemeTransitionMode | null = null
  ) => {
    const nextMode = getNextMode()
    await requestThemeTransition(nextMode, event, mode)
  }

  /**
   * 切换到指定模式并播放动画
   */
  const setThemeWithAnimation = async (
    targetMode: ThemeMode,
    event: MouseEvent | null = null,
    transitionModeOverride: ThemeTransitionMode | null = null
  ) => {
    await requestThemeTransition(targetMode, event, transitionModeOverride)
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
