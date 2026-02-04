/**
 * 主题切换 Hook（支持多模式动画）
 * 采用策略模式，将动画逻辑与状态管理分离
 * v2.0 - 性能优化版本
 */

import { ref, computed, nextTick } from 'vue'
import { useThemeStore } from '@/stores/modules/theme'
import { THEME_PRESETS, DEFAULT_THEME_NAME } from '@/constants/theme'
import { generateThemeVars, applyTheme } from '@/utils/theme/engine'
import { rgbToHex } from '@/utils/theme/colors'
import {
  getTransitionConfig,
  calculateCircleRadius,
  calculateDiamondRadius,
} from '@/utils/theme/transitions'

type ViewTransition = {
  ready: Promise<void>
  finished: Promise<void>
}

// 主题过渡"代际"计数：清理时仅当仍是当前代才移除 data-transition / is-view-transitioning，避免上一轮 cleanup 误删下一轮已设置的属性导致闪动
let themeTransitionGeneration = 0

// 过渡结束时间戳:动画结束后 500ms 内不启动新过渡，避免双击/快速连点触发「切回去再切回来」的闪动
const THEME_TRANSITION_COOLDOWN_MS = 500
let lastTransitionEndAt = 0

// 过渡锁：防止 store 的 refreshTheme 在动画期间被外部触发
let isThemeTransitionLocked = false
export function isThemeLocked() {
  return isThemeTransitionLocked
}

// 缓存系统主题检测（性能优化）
let systemDarkModeQuery: MediaQueryList | null = null
function getSystemDarkModeQuery(): MediaQueryList {
  if (!systemDarkModeQuery) {
    systemDarkModeQuery = window.matchMedia('(prefers-color-scheme: dark)')
  }
  return systemDarkModeQuery
}

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
    overlay.style.opacity = '0'
    // 监听 transitionend 事件（更准确）
    const cleanup = () => {
      overlay.remove()
      resolve()
    }
    overlay.addEventListener('transitionend', cleanup, { once: true })
    // 备用：固定延迟（防止事件未触发）
    setTimeout(cleanup, duration + 50)
  })
}

/**
 * 注入用于 CSS 动画的动态坐标变量
 * 支持 circle 和 diamond 两种模式
 */
function applyTransitionVariables(event: MouseEvent | null, mode: ThemeTransitionMode) {
  if (event) {
    const { clientX, clientY } = event
    // 根据模式选择不同的半径计算方式
    const radius =
      mode === 'diamond'
        ? calculateDiamondRadius(clientX, clientY)
        : calculateCircleRadius(clientX, clientY)

    document.documentElement.style.setProperty('--transition-x', `${clientX}px`)
    document.documentElement.style.setProperty('--transition-y', `${clientY}px`)
    document.documentElement.style.setProperty('--transition-radius', `${radius}px`)
  } else {
    // 默认从中心开始，使用足够大的半径确保覆盖
    document.documentElement.style.setProperty('--transition-x', '50%')
    document.documentElement.style.setProperty('--transition-y', '50%')
    document.documentElement.style.setProperty('--transition-radius', '150%')
  }
}

/**
 * 原子化全局清理（Grand Unified Fix v5.0）：
 * 统一收尾：此时 recovery class 已在主流程中添加，仅需最终解锁
 */
function cleanupTransitionState(generation?: number) {
  const root = document.documentElement
  if (generation !== undefined && generation !== themeTransitionGeneration) return

  // ═══════════════════════════════════════════════════════════════
  // 仅清除 View Transition 临时变量（x/y/radius），保留尺寸系统 --transition-xs..5xl
  // ═══════════════════════════════════════════════════════════════
  const VIEW_TRANSITION_VARS = ['--transition-x', '--transition-y', '--transition-radius']
  const currentCssText = root.style.cssText
  const cleanedCssText = currentCssText
    .split(';')
    .filter(part => {
      const prop = part.split(':')[0]?.trim()
      return prop && !VIEW_TRANSITION_VARS.includes(prop)
    })
    .join(';')
  root.style.cssText = cleanedCssText

  // ═══════════════════════════════════════════════════════════════
  // 多帧等待后最终解锁 - 确保所有样式计算完成
  // ═══════════════════════════════════════════════════════════════
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setTimeout(() => {
          if (generation !== undefined && generation !== themeTransitionGeneration) return
          root.classList.remove('theme-transition-recovery')
          root.classList.remove('theme-transition')
          root.removeAttribute('data-transition')
          isThemeTransitionLocked = false
        }, 100)
      })
    })
  })
}

export function useThemeSwitch() {
  const themeStore = useThemeStore()
  const isAnimating = ref(false)

  // 计算属性
  const mode = computed(() => themeStore.mode)
  const isDark = computed(() => {
    if (themeStore.mode === 'auto') {
      return getSystemDarkModeQuery().matches
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
    if (Date.now() - lastTransitionEndAt < THEME_TRANSITION_COOLDOWN_MS) return

    // CRITICAL: Lock theme to prevent external refreshTheme calls
    isThemeTransitionLocked = true
    isAnimating.value = true
    const transitionModeToUse = mode || transitionMode.value
    const currentIsDark = isDark.value
    const systemPrefersDark = getSystemDarkModeQuery().matches
    const nextMode = getNextMode()

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

    themeTransitionGeneration++
    const myGeneration = themeTransitionGeneration

    // 获取过渡模式配置
    const config = getTransitionConfig(transitionModeToUse, event)

    // 设置 data-transition 属性
    document.documentElement.setAttribute('data-transition', transitionModeToUse)

    // 注入动态坐标变量，供 CSS keyframes 使用（支持 diamond 模式）
    applyTransitionVariables(event, transitionModeToUse)

    const applyModeChange = () => {
      // CRITICAL: Bypass store's setMode() to avoid triggering refreshTheme()
      // We manually handle theme application to prevent double-refresh flicker
      themeStore.mode = nextMode

      // Manually apply the theme (same logic as store's refreshTheme)
      const isDarkNow = nextMode === 'dark' || (nextMode === 'auto' && systemPrefersDark)

      // ═════════════════════════════════════════════════════════════════
      // 关键修复：同步更新 CSS 变量、dark 类和 color-scheme
      // 必须在同一个同步块中完成，避免单帧不同步
      // ═════════════════════════════════════════════════════════════════
      const preset =
        THEME_PRESETS.find(p => p.name === themeStore.themeName) ||
        THEME_PRESETS.find(p => p.name === DEFAULT_THEME_NAME) ||
        THEME_PRESETS[0]
      const vars = generateThemeVars(preset, isDarkNow)

      // 1. 先应用 CSS 变量
      applyTheme(vars)

      // 2. 再切换 dark 类（同步）
      document.documentElement.classList.toggle('dark', isDarkNow)

      // 3. 强制同步布局
      void document.documentElement.offsetHeight

      // Update localStorage
      try {
        localStorage.setItem('theme-mode', nextMode)
      } catch (_) {
        /* ignore */
      }
    }

    try {
      // ═══════════════════════════════════════════════════════════════
      // 关键修复（v6.0）：在 startViewTransition 之前添加 recovery class
      // 这确保当浏览器捕获 "new" 快照时，元素不会因 CSS transition 而处于
      // 中间状态。元素会立即跳到最终值，快照捕获的就是正确的最终状态。
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
        const willBeDark = nextMode === 'dark' || (nextMode === 'auto' && systemPrefersDark)
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

      // ═══════════════════════════════════════════════════════════════
      // v6.0: recovery class 已在 startViewTransition 之前添加
      // 只需等待动画完成，然后清理
      // ═══════════════════════════════════════════════════════════════
      await transition.finished

      // 移除过渡状态类（recovery 保持到 cleanup 完成）
      document.documentElement.classList.remove('is-view-transitioning')

      // 3. CLEANUP BEHIND THE MASK - 遮罩后方进行清理工作
      if (overlay) {
        await cleanupOverlay(overlay, config.duration)
      }

      cleanupTransitionState(myGeneration)
    } catch (error) {
      console.error('Theme transition failed:', error)
      applyModeChange()
      cleanupTransitionState(myGeneration)
    } finally {
      isAnimating.value = false
      lastTransitionEndAt = Date.now()
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
    // 合并 early return 检查；过渡结束后 500ms 内不启动新过渡，避免双击/快速连点导致「切回去再切回来」闪动
    if (mode.value === targetMode || isAnimating.value) return
    if (Date.now() - lastTransitionEndAt < THEME_TRANSITION_COOLDOWN_MS) return

    // CRITICAL: Lock theme to prevent external refreshTheme calls
    isThemeTransitionLocked = true
    isAnimating.value = true
    const transitionModeToUse = transitionModeOverride || transitionMode.value
    const systemPrefersDark = getSystemDarkModeQuery().matches

    // 检查浏览器支持
    if (!document?.startViewTransition) {
      setMode(targetMode)
      isAnimating.value = false
      return
    }

    themeTransitionGeneration++
    const myGeneration = themeTransitionGeneration

    // 获取过渡模式配置
    const config = getTransitionConfig(transitionModeToUse, event)

    // 设置 data-transition 属性
    document.documentElement.setAttribute('data-transition', transitionModeToUse)

    // 注入动态坐标变量，供 CSS keyframes 使用（支持 diamond 模式）
    applyTransitionVariables(event, transitionModeToUse)

    const applyModeChange = () => {
      // CRITICAL: Bypass store's setMode() to avoid triggering refreshTheme()
      themeStore.mode = targetMode

      // Manually apply the theme (same logic as store's refreshTheme)
      const isDarkNow = targetMode === 'dark' || (targetMode === 'auto' && systemPrefersDark)

      // ═══════════════════════════════════════════════════════════════
      // 关键修复：同步更新 CSS 变量、dark 类
      // 必须在同一个同步块中完成，避免单帧不同步
      // ═══════════════════════════════════════════════════════════════
      const preset =
        THEME_PRESETS.find(p => p.name === themeStore.themeName) ||
        THEME_PRESETS.find(p => p.name === DEFAULT_THEME_NAME) ||
        THEME_PRESETS[0]
      const vars = generateThemeVars(preset, isDarkNow)

      // 1. 先应用 CSS 变量
      applyTheme(vars)

      // 2. 再切换 dark 类（同步）
      document.documentElement.classList.toggle('dark', isDarkNow)

      // 3. 强制同步布局
      void document.documentElement.offsetHeight

      // Update localStorage
      try {
        localStorage.setItem('theme-mode', targetMode)
      } catch (_) {
        /* ignore */
      }
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
        const willBeDark = targetMode === 'dark' || (targetMode === 'auto' && systemPrefersDark)
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

      // ═══════════════════════════════════════════════════════════════
      // v6.0: recovery class 已在 startViewTransition 之前添加
      // ═══════════════════════════════════════════════════════════════
      await transition.finished

      document.documentElement.classList.remove('is-view-transitioning')

      // 3. CLEANUP BEHIND THE MASK
      if (overlay) {
        await cleanupOverlay(overlay, config.duration)
      }

      cleanupTransitionState(myGeneration)
    } catch (error) {
      console.error('Theme transition failed:', error)
      applyModeChange()
      cleanupTransitionState(myGeneration)
    } finally {
      isAnimating.value = false
      lastTransitionEndAt = Date.now()
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
