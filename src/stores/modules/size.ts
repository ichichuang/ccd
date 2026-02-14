import { defineStore } from 'pinia'
import { SIZE_PRESETS, DEFAULT_SIZE_NAME, SIZE_PERSIST_KEY } from '@/constants/size'
import { FONT_SCALE_RATIOS } from '@/constants/sizeScale'
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

    // 字体大小动态化：直接读取当前预设的基准值 (SSOT，对应 --font-size-md)
    getFontSizeValue(): number {
      return this.currentPreset.fontSizeBase
    },
    // 小号字体：与尺寸阶梯 --font-size-sm 一致 (fontSizeBase × FONT_SCALE_RATIOS.sm)
    getFontSizeSmValue(): number {
      return this.currentPreset.fontSizeBase * FONT_SCALE_RATIOS.sm
    },
    // 标题字体动态化：保留兼容，等于 getFontSizeSmValue（原 fontSizeBase+2 语义接近 sm）
    getFontSizesValue(): number {
      return this.getFontSizeSmValue
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
    key: SIZE_PERSIST_KEY,
    storage: localStorage,
    serializer: createPiniaEncryptedSerializer(),
  },
})
