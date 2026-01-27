import { defineStore } from 'pinia'
import { SIZE_PRESETS, DEFAULT_SIZE_NAME } from '@/constants/size'
import { generateSizeVars, applySizeTheme } from '@/utils/theme/sizeEngine'
import { createPiniaEncryptedSerializer } from '@/utils/safeStorage/piniaSerializer'

export const useSizeStore = defineStore('size', {
  state: (): SizeStoreState => ({
    sizeName: DEFAULT_SIZE_NAME as SizeMode,
  }),

  getters: {
    currentPreset: (state): SizePreset => {
      return (
        SIZE_PRESETS.find(p => p.name === state.sizeName) ||
        SIZE_PRESETS.find(p => p.name === DEFAULT_SIZE_NAME) ||
        SIZE_PRESETS[0]
      )
    },

    // --- 图表专用动态 Getters (兼容旧逻辑) ---
    getGap(): number {
      return this.currentPreset.spacingBase * 4
    },
    getGapl(): number {
      return this.currentPreset.spacingBase * 8
    },
    getPaddingsValue(): number {
      return this.currentPreset.spacingBase * 4
    },

    // 字体大小动态化：直接读取当前预设的基准值 (SSOT)
    getFontSizeValue(): number {
      return this.currentPreset.fontSizeBase
    },
    // 标题字体动态化 (+2px)
    getFontSizesValue(): number {
      return this.currentPreset.fontSizeBase + 2
    },
  },

  actions: {
    setSize(name: SizeMode) {
      let preset = SIZE_PRESETS.find(p => p.name === name)

      if (!preset) {
        console.warn(`[Size Store] 无效尺寸 ${name}，已重置为默认`)
        preset = SIZE_PRESETS.find(p => p.name === DEFAULT_SIZE_NAME) || SIZE_PRESETS[0]
        this.sizeName = preset.name
      } else {
        this.sizeName = name
      }

      const vars = generateSizeVars(preset)
      applySizeTheme(vars)
    },

    init() {
      this.setSize(this.sizeName)
    },
  },

  persist: {
    key: `${import.meta.env.VITE_PINIA_PERSIST_KEY_PREFIX}-size`,
    storage: localStorage,
    serializer: createPiniaEncryptedSerializer(),
  },
})
