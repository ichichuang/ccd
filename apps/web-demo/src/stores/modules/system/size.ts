import { defineStore } from 'pinia'
import { SIZE_PRESETS, DEFAULT_SIZE_NAME } from '@ccd/design-tokens'
import { SIZE_PERSIST_KEY } from '@/constants/size'
import { generateSizeVars, applySizeTheme } from '@/utils/theme/sizeEngine'
import { createPiniaEncryptedSerializer } from '@/utils/safeStorage/piniaSerializer'
import { syncAction } from '@/sync/syncAction'
import { DateUtils } from '@/utils/date'
/**
 * 全局尺寸模式（compact / comfortable / loose）
 *
 * - 状态仅 `sizeName`；具体 px/阶梯由 `constants/size` + `sizeScale` + `sizeEngine` 注入 CSS。
 * - 不在此 store 内做 `spacingBase * n`；若需 px 请用 `@/utils/theme/sizeMetrics` + `currentPreset`。
 */
export const useSizeStore = defineStore('size', {
  state: (): SizeStoreState => ({
    sizeName: DEFAULT_SIZE_NAME,
  }),

  getters: {
    currentPreset: (state): SizePreset => {
      return (
        SIZE_PRESETS.find(p => p.name === state.sizeName) ||
        SIZE_PRESETS.find(p => p.name === DEFAULT_SIZE_NAME) ||
        SIZE_PRESETS[0]
      )
    },
  },

  actions: {
    resetState() {
      this.setSize(DEFAULT_SIZE_NAME)
    },

    setSize(name: SizeMode, options: { sync?: boolean } = {}) {
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
      if (options.sync !== false) {
        syncAction('size:update', {
          size: {
            size: this.sizeName,
          },
          updatedAt: DateUtils.nowMs(),
        })
      }
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
