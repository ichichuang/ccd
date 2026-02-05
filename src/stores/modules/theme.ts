import { defineStore } from 'pinia'
import { THEME_PRESETS, DEFAULT_THEME_NAME, DEFAULT_TRANSITION_DURATION } from '@/constants/theme'
import { generateThemeVars, applyTheme } from '@/utils/theme/engine'
import { isThemeLocked } from '@/hooks/modules/useThemeSwitch'

interface ThemeState {
  mode: ThemeMode
  themeName: string
  transitionMode: ThemeTransitionMode
  transitionDuration: ThemeTransitionDuration
}

export const useThemeStore = defineStore('theme', {
  state: (): ThemeState => ({
    mode: 'auto',
    themeName: DEFAULT_THEME_NAME,
    transitionMode: 'circle',
    transitionDuration: DEFAULT_TRANSITION_DURATION,
  }),

  getters: {
    isDark(state): boolean {
      if (state.mode === 'auto') {
        return window.matchMedia('(prefers-color-scheme: dark)').matches
      }
      return state.mode === 'dark'
    },
  },

  actions: {
    setMode(mode: ThemeMode) {
      this.mode = mode
      this.refreshTheme()
    },

    setTheme(name: string) {
      if (THEME_PRESETS.find(p => p.name === name)) {
        this.themeName = name
        this.refreshTheme()
      }
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
      if (isThemeLocked && isThemeLocked()) {
        return
      }

      // 1. 获取当前系统/模式
      const isDark =
        this.mode === 'auto'
          ? window.matchMedia('(prefers-color-scheme: dark)').matches
          : this.mode === 'dark'

      document.documentElement.classList.toggle('dark', isDark)

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
        localStorage.setItem('theme-mode', this.mode)
      } catch (_) {
        /* ignore */
      }
    },

    init() {
      // 监听系统主题变化
      window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
        if (this.mode === 'auto') this.refreshTheme()
      })
      this.refreshTheme()
    },
  },

  persist: {
    key: `${import.meta.env.VITE_PINIA_PERSIST_KEY_PREFIX}-theme`,
    storage: localStorage,
    // serializer: createPiniaEncryptedSerializer(),
  },
})
