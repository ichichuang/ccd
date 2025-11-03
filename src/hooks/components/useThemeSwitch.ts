import { useColorStore } from '@/stores'
import { useI18nModeOptions } from '@/utils'
import { computed, ref } from 'vue'

type ViewTransition = {
  ready: Promise<void>
  finished: Promise<void>
}

// 缓存计算半径的函数
const calculateRadius = (x: number, y: number): number => {
  const maxX = Math.max(x, window.innerWidth - x)
  const maxY = Math.max(y, window.innerHeight - y)
  return Math.hypot(maxX, maxY)
}

// 创建淡入淡出蒙层
const createFadeOverlay = (color: string, duration: number) => {
  const overlay = document.createElement('div')
  overlay.className = 'theme-fade-overlay'
  overlay.style.background = color
  overlay.style.position = 'fixed'
  overlay.style.inset = '0'
  overlay.style.zIndex = '2000'
  overlay.style.opacity = '0'
  overlay.style.pointerEvents = 'none'
  overlay.style.transition = `opacity ${duration}ms ease`
  document.body.appendChild(overlay)
  return overlay
}

export const useThemeSwitch = () => {
  const colorStore = useColorStore()
  const isAnimating = ref(false)

  // 计算属性
  const modeOptions = useI18nModeOptions()
  const mode = computed(() => colorStore.getMode)
  const isDark = computed(() => colorStore.isDark)

  // 设置模式
  const setMode = (value: Mode) => {
    colorStore.setMode(value)
  }

  // 获取下一个模式（排除 auto 自动模式）
  const getNextMode = (): Mode => {
    // 🎯 直接切换到相反模式，不需要循环逻辑
    const currentIsDark = isDark.value
    return currentIsDark ? 'light' : 'dark'
  }

  // 获取下一个模式（包含 auto 自动模式）
  const getNextModeWithAuto = (): Mode => {
    const currentMode = mode.value

    // 如果当前是 auto，根据实际显示的模式切换到相反的固定模式
    if (currentMode === 'auto') {
      return isDark.value ? 'light' : 'dark'
    }

    // 如果是固定模式，循环切换：light -> dark -> auto -> light
    const modeSequence: Mode[] = ['light', 'dark', 'auto']
    const currentIndex = modeSequence.indexOf(currentMode)
    const nextIndex = (currentIndex + 1) % modeSequence.length
    return modeSequence[nextIndex]
  }

  // 切换模式（排除 auto）
  const toggleMode = () => {
    const nextMode = getNextMode()
    setMode(nextMode)
  }

  // 切换模式（包含 auto）
  const toggleModeWithAuto = () => {
    const nextMode = getNextModeWithAuto()
    setMode(nextMode)
  }

  // 主题切换核心函数（带动画）
  const toggleThemeWithAnimation = async (
    event: MouseEvent,
    includeAuto: boolean = false,
    duration: number = 400
  ) => {
    // 防止动画期间重复点击
    if (isAnimating.value) {
      return
    }
    isAnimating.value = true

    // 获取当前状态（在 DOM 变化之前）
    const currentIsDark = isDark.value

    // 根据是否包含自适应模式，选择不同的切换函数
    const toggleFunction = includeAuto ? toggleModeWithAuto : toggleMode

    // 计算切换后的模式
    const nextMode = includeAuto ? getNextModeWithAuto() : getNextMode()
    const willBeDark =
      nextMode === 'dark' ||
      (nextMode === 'auto' && window.matchMedia('(prefers-color-scheme: dark)').matches)

    // 检查是否需要跳过动画
    // 当切换到自适应模式时，如果当前是深色且系统也是深色，则跳过动画
    const shouldSkipAnimation =
      nextMode === 'auto' &&
      currentIsDark &&
      window.matchMedia('(prefers-color-scheme: dark)').matches

    // 如果需要跳过动画，直接切换模式
    if (shouldSkipAnimation) {
      toggleFunction()
      isAnimating.value = false
      return
    }

    // 缓存动画配置
    const animationConfig = {
      duration: duration,
      easing: 'cubic-bezier(0.4, 0, 0.2, 1)', // 使用更平滑的缓动函数
    }

    // 如果浏览器不支持 startViewTransition，降级处理
    if (!document?.startViewTransition) {
      toggleFunction()
      isAnimating.value = false
      return
    }

    try {
      // 🎯 关键修复：在切换前缓存当前背景色
      const oldBg = getComputedStyle(document.documentElement).getPropertyValue('--bg100')
      document.documentElement.style.setProperty('--bg100-old', oldBg)

      // 在切换前添加预处理类
      document.documentElement.classList.add('theme-transition')

      const transition = document.startViewTransition(async () => {
        // 确保在快照阶段同步根元素的深浅色类，避免外部异步更新导致的层错位
        toggleFunction()
        document.documentElement.classList.toggle('dark', willBeDark)

        // 🎯 关键修复：切换后缓存新背景色
        const newBg = getComputedStyle(document.documentElement).getPropertyValue('--bg100')
        document.documentElement.style.setProperty('--bg100-new', newBg)
      }) as ViewTransition

      await transition.ready

      // 🎯 使用目标主题色创建 overlay（这里不是死板的黑/白）
      const targetBg = getComputedStyle(document.documentElement).getPropertyValue('--bg100-new')
      const overlay = createFadeOverlay(targetBg, duration)

      // 启动 overlay 动画
      requestAnimationFrame(() => {
        overlay.style.opacity = '0.15' // 淡淡的就行，避免喧宾夺主
      })

      const { clientX, clientY } = event
      const radius = calculateRadius(clientX, clientY)

      const from = `circle(0px at ${clientX}px ${clientY}px)`
      const to = `circle(${radius}px at ${clientX}px ${clientY}px)`
      // 统一在 new 层上做 clip-path 动画（new 层永远在上层，避免空窗期）
      const keyframes = [from, to]
      const targetPseudo = '::view-transition-new(root)'

      document.documentElement.animate(
        { clipPath: keyframes },
        { ...animationConfig, pseudoElement: targetPseudo }
      )

      // 等待过渡完成后移除预处理类、蒙层和临时变量
      await transition.finished

      // 🎯 移除 overlay
      overlay.style.opacity = '0'
      setTimeout(() => overlay.remove(), duration)

      document.documentElement.classList.remove('theme-transition')
      // 清理临时背景色变量
      document.documentElement.style.removeProperty('--bg100-old')
      document.documentElement.style.removeProperty('--bg100-new')
    } catch (error) {
      console.error('Theme transition failed:', error)
      toggleFunction()
      document.documentElement.classList.remove('theme-transition')
      // 清理临时变量
      document.documentElement.style.removeProperty('--bg100-old')
      document.documentElement.style.removeProperty('--bg100-new')
    } finally {
      isAnimating.value = false
    }
  }

  // 简单切换函数（无动画）
  const toggleTheme = (includeAuto: boolean = false) => {
    const toggleFunction = includeAuto ? toggleModeWithAuto : toggleMode
    toggleFunction()
  }

  // 设置特定模式（带动画）
  const setThemeWithAnimation = async (
    themeValue: string,
    event: MouseEvent,
    duration: number = 400
  ) => {
    // 防止动画期间重复点击
    if (isAnimating.value) {
      return
    }
    isAnimating.value = true

    // 获取当前状态（在 DOM 变化之前）
    const currentIsDark = isDark.value
    const willBeDark = themeValue === 'dark'

    console.log('Theme transition START:', {
      currentMode: currentIsDark ? 'dark' : 'light',
      targetMode: themeValue,
      willBeDark,
      hasViewTransitions: !!document?.startViewTransition,
    })

    // 缓存动画配置
    const animationConfig = {
      duration: duration,
      easing: willBeDark
        ? 'cubic-bezier(0.8, -0.6, 0.2, 1.5)' // 收缩时带弹性
        : 'cubic-bezier(0.2, 0.8, 0.4, 1.2)', // 扩展时柔和
    }

    // 如果浏览器不支持 startViewTransition，降级处理
    if (!document?.startViewTransition) {
      setMode(themeValue as Mode)
      isAnimating.value = false
      return
    }

    try {
      // 🎯 关键修复：在切换前缓存当前背景色
      const oldBg = getComputedStyle(document.documentElement).getPropertyValue('--bg100')
      document.documentElement.style.setProperty('--bg100-old', oldBg)

      // 在切换前添加预处理类
      document.documentElement.classList.add('theme-transition')

      const transition = document.startViewTransition(async () => {
        setMode(themeValue as Mode)
        // 与目标主题同步根元素类
        document.documentElement.classList.toggle('dark', willBeDark)

        // 🎯 关键修复：切换后缓存新背景色
        const newBg = getComputedStyle(document.documentElement).getPropertyValue('--bg100')
        document.documentElement.style.setProperty('--bg100-new', newBg)
      }) as ViewTransition

      await transition.ready

      // 🎯 使用目标主题色创建 overlay（这里不是死板的黑/白）
      const targetBg = getComputedStyle(document.documentElement).getPropertyValue('--bg100-new')
      const overlay = createFadeOverlay(targetBg, duration)

      // 启动 overlay 动画
      requestAnimationFrame(() => {
        overlay.style.opacity = '0.15' // 淡淡的就行，避免喧宾夺主
      })

      const { clientX, clientY } = event
      const radius = calculateRadius(clientX, clientY)

      const from = `circle(0px at ${clientX}px ${clientY}px)`
      const to = `circle(${radius}px at ${clientX}px ${clientY}px)`
      // 统一在 new 层上做 clip-path 动画（new 层永远在上层，避免空窗期）
      const keyframes = [from, to]
      const targetPseudo = '::view-transition-new(root)'

      document.documentElement.animate(
        { clipPath: keyframes },
        { ...animationConfig, pseudoElement: targetPseudo }
      )

      // 等待过渡完成后移除预处理类、蒙层和临时变量
      await transition.finished

      // 🎯 移除 overlay
      overlay.style.opacity = '0'
      setTimeout(() => overlay.remove(), duration)

      document.documentElement.classList.remove('theme-transition')
      // 清理临时背景色变量
      document.documentElement.style.removeProperty('--bg100-old')
      document.documentElement.style.removeProperty('--bg100-new')
    } catch (error) {
      console.error('Theme transition failed:', error)
      setMode(themeValue as Mode)
      document.documentElement.classList.remove('theme-transition')
      // 清理临时变量
      document.documentElement.style.removeProperty('--bg100-old')
      document.documentElement.style.removeProperty('--bg100-new')
    } finally {
      isAnimating.value = false
    }
  }

  return {
    // 状态
    isAnimating,
    isDark,
    mode,
    modeOptions,

    // 方法
    toggleThemeWithAnimation,
    toggleTheme,
    setThemeWithAnimation,
    setMode,
    toggleMode,
    toggleModeWithAuto,
    getNextMode,
    getNextModeWithAuto,
  }
}
