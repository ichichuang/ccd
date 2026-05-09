import { defineStore } from 'pinia'
import {
  THEME_PRESETS,
  DEFAULT_THEME_NAME,
  DEFAULT_THEME_MODE,
  DEFAULT_TRANSITION_DURATION,
} from '@/constants/theme'
import { RUNTIME_STORAGE_KEYS } from '@/constants/runtime'
import { generateThemeVars, applyTheme } from '@/utils/theme/engine'
import {
  applyThemeModeToRoot,
  getSystemDarkModeQuery,
  resolveThemeModeIsDark,
} from '@/utils/theme/mode'
import { isThemeLocked } from '@/utils/theme/transitions'
import { createPiniaEncryptedSerializer } from '@/utils/safeStorage/piniaSerializer'

// 模块级变量持有 handler 引用，确保 removeEventListener 可精确移除同一函数引用
let _themeMediaQueryHandler: (() => void) | null = null

/** 可选强调色覆盖（hex），未设置时使用 themeName 预设 */
type AccentColorOverride = string | null

interface ThemeState {
  mode: ThemeMode
  themeName: string
  accentColor: AccentColorOverride
  transitionMode: ThemeTransitionMode
  transitionDuration: ThemeTransitionDuration
}

export const useThemeStore = defineStore('theme', {
  state: (): ThemeState => ({
    mode: DEFAULT_THEME_MODE,
    themeName: DEFAULT_THEME_NAME,
    accentColor: null,
    transitionMode: 'curtain',
    transitionDuration: DEFAULT_TRANSITION_DURATION,
  }),

  getters: {
    isDark(state): boolean {
      return resolveThemeModeIsDark(state.mode)
    },
    isGlassMode(state): boolean {
      return state.mode === 'glass'
    },
  },

  actions: {
    resetState() {
      this.mode = DEFAULT_THEME_MODE
      this.themeName = DEFAULT_THEME_NAME
      this.accentColor = null
      this.transitionMode = 'curtain'
      this.transitionDuration = DEFAULT_TRANSITION_DURATION
      this.refreshTheme()
    },

    setMode(mode: ThemeMode) {
      this.mode = mode
      this.refreshTheme()
    },

    setTheme(name: string) {
      if (THEME_PRESETS.find(p => p.name === name)) {
        this.themeName = name
        this.refreshTheme()
      } else {
        console.warn(
          `[Theme Store] Unknown preset "${name}", keeping current theme "${this.themeName}"`
        )
      }
    },

    setAccentColor(color: string | null) {
      this.accentColor = color
      this.refreshTheme()
    },

    setTransitionMode(mode: ThemeTransitionMode) {
      this.transitionMode = mode
    },

    setTransitionDuration(duration: ThemeTransitionDuration) {
      this.transitionDuration = duration
    },

    /**
     * 核心刷新逻辑 (修复持久化数据不一致)
     */
    refreshTheme() {
      // CRITICAL: Skip if theme is locked during transition
      if (isThemeLocked()) {
        return
      }

      // 1. 获取当前系统/模式
      const isDark = resolveThemeModeIsDark(this.mode)
      applyThemeModeToRoot(this.mode, isDark)

      // 2. 查找预设，如果失效则自动纠正 Store 状态
      let preset = THEME_PRESETS.find(p => p.name === this.themeName)
      if (!preset) {
        console.warn(`[Theme Store] 未找到预设 ${this.themeName}，已自动恢复默认主题`)
        this.themeName = DEFAULT_THEME_NAME // 关键修复：同步状态
        preset = THEME_PRESETS.find(p => p.name === DEFAULT_THEME_NAME) || THEME_PRESETS[0]
      }

      // 3. 应用样式变量（引擎按 isDark 取 backgroundDark/backgroundLight）
      const vars = generateThemeVars(preset, isDark)
      applyTheme(vars)

      // 4. 写入明文 theme-mode 供 index.html 首帧脚本读取，避免首屏闪屏
      try {
        localStorage.setItem(RUNTIME_STORAGE_KEYS.themeMode, this.mode)
      } catch (_) {
        /* ignore */
      }
    },

    init() {
      // 监听系统主题变化：存储 handler 引用以便 dispose() 能精确移除（匿名函数无法移除）
      const mediaQuery = getSystemDarkModeQuery()
      if (!mediaQuery) {
        this.refreshTheme()
        return
      }
      _themeMediaQueryHandler = () => {
        if (this.mode === 'auto' || this.mode === 'glass') this.refreshTheme()
      }
      mediaQuery.addEventListener('change', _themeMediaQueryHandler)
      this.refreshTheme()
    },

    /**
     * 清理 matchMedia 监听器。
     * 在应用卸载（HMR 热重载、单测 teardown）时调用，防止监听器累积导致内存泄漏。
     */
    dispose() {
      if (_themeMediaQueryHandler) {
        getSystemDarkModeQuery()?.removeEventListener('change', _themeMediaQueryHandler)
        _themeMediaQueryHandler = null
      }
    },
  },

  persist: {
    key: `${import.meta.env.VITE_PINIA_PERSIST_KEY_PREFIX}-theme`,
    storage: localStorage,
    serializer: createPiniaEncryptedSerializer(),
  },
})
