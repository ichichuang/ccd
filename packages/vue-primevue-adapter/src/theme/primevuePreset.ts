import { definePreset } from '@primeuix/themes'
import type { ComponentsDesignTokens } from '@primeuix/themes/types'
import Aura from '@primeuix/themes/aura'
import {
  deepMergeStylesAdvanced,
  deepMergeStylesAdvancedInPlace,
  deepFindAndReplaceProperty,
} from './primevueThemeEngine'
import type { SizeMode } from '@ccd/design-tokens'
import { createColorAdapter } from './colorAdapter'
import { buildPrimitiveLayer } from './presetPrimitive'
import { buildSemanticLayer } from './presetSemantic'
import { buildAllComponents } from './presetComponents'
// -----------------------------------------------------------------------------
// 🧱 PrimeVue Preset 架构说明
// -----------------------------------------------------------------------------
//
// 1. 本文件是 PrimeVue @primeuix/themes Aura 的“适配层”主入口。
//    - 只复用 Aura 的 primitive / semantic / components 结构，
//      不再直接依赖 semantic.json / primitive.json / components.json 里的色值。
//    - 真正的数据源是：
//      - ThemeCssVars (见 src/types/systems/theme.d.ts, 由 generateThemeVars 计算并写入 :root)
//      - SizeCssVars  (见 src/types/systems/size.d.ts, 尺寸系统负责写入 :root)
//
// 2. 模块拆分：
//    - colorAdapter.ts: 颜色适配器
//    - presetPrimitive.ts: Primitive Layer
//    - presetSemantic.ts: Semantic Layer
//    - presetComponents/: Component Layer 分模块（base/form/overlay/data/menu-nav-misc）
//
// 3. 融合范围：仅对架构的配色系统（ThemeCssVars）与尺寸系统（SizeCssVars）做融合；
//    highlight / mask / floatLabel 等保持 Aura 原始，由已覆盖的 primary / surface 等解析。
//
// 4. 语义命名：项目对外 API 用 danger/warn；Aura/PrimeVue 内部（primitiveColors、
//    toastDarkSemantic、messageDarkSemantic 的 key）仍用 error/warning，此处不改。
//
// 5. 尺寸模式与控件/布局缩放：
//    - 尺寸模式（compact / comfortable / loose）通过 sizeStore.setSize → generateSizeVars →
//      applySizeTheme 将整份 SizeCssVars 写入 :root，故 --font-size-*、--spacing-*、
//      --radius-* 及布局变量（--sidebar-width、--header-height 等）均随模式更新。
//    - Preset 仅引用变量名（如 var(--font-size-md)），不随尺寸切换重建；控件根尺寸
//      （按钮/输入框的 sm/md/lg）与布局均由 :root 变量值变化而缩放，无需按 mode 区分 token 名。
//
// 6. SSOT 管辖矩阵（必须遵守）：
//    - PT 层（ptPresets/* + plugins/modules/primevue.ts）:
//      仅负责视觉材质与动效（glass/motion/transition），禁止密度类覆盖（p-*/px-*/py-*）。
//    - Token 层（presetSemantic.ts + presetComponents/*）:
//      负责尺寸与密度（padding/gap/radius），作为全局紧凑度单一真源。
//    - 若同一属性在两层同时定义，以 PT 最终 CSS 优先，属于治理违规，应回收至 Token 层。
// -----------------------------------------------------------------------------

type RootSizeTokens = {
  sm: Record<string, string>
  md: Record<string, string>
  lg: Record<string, string>
}

/** PrimeUIX Preset 组件 Token 允许的标量/嵌套形状（排除 unknown / null / 函数等） */
type PrimeTokenValue = string | number | object | undefined
type PrimePresetRecord = Record<string, PrimeTokenValue>

const ROOT_SIZE_TOKENS: RootSizeTokens = {
  sm: {
    gap: 'var(--spacing-xs)',
    padding: 'var(--spacing-xs)',
    paddingX: 'var(--spacing-xs)',
    paddingY: 'calc(var(--spacing-xs) / 2)',
    fontSize: 'var(--font-size-sm)',
  },
  md: {
    gap: 'var(--spacing-sm)',
    padding: 'var(--spacing-xs) var(--spacing-sm)',
    paddingX: 'var(--spacing-xs)',
    paddingY: 'var(--spacing-xs)',
    fontSize: 'var(--font-size-md)',
  },
  lg: {
    gap: 'var(--spacing-md)',
    padding: 'var(--spacing-md)',
    paddingX: 'var(--spacing-md)',
    paddingY: 'var(--spacing-sm)',
    fontSize: 'var(--font-size-md)',
  },
}

const getRootSizeTokensByMode = (_mode: SizeMode): RootSizeTokens => ROOT_SIZE_TOKENS

let _cachedPreset: PrimePresetRecord | null = null
let _cachedSizeMode: SizeMode | null = null

export interface PrimeVueSizeSource {
  sizeName: SizeMode
}

export const createCustomPreset = (sizeStore: PrimeVueSizeSource) => {
  const mode = sizeStore.sizeName
  if (_cachedPreset !== null && _cachedSizeMode === mode) {
    return _cachedPreset
  }

  const colors = createColorAdapter()
  const primitiveColors = buildPrimitiveLayer()
  const semanticColors = buildSemanticLayer()
  const componentColors = buildAllComponents(colors)

  const basePreset = definePreset(Aura, {
    primitive: primitiveColors as Record<string, PrimeTokenValue>,
    semantic: semanticColors as Record<string, PrimeTokenValue>,
    components: componentColors as ComponentsDesignTokens,
  })

  const globalSizeTokens: Record<string, string> = {
    borderRadius: 'var(--radius-md)',
  }
  const resultPreset = deepMergeStylesAdvanced(basePreset, globalSizeTokens, {
    deepMerge: true,
    override: true,
  }) as PrimePresetRecord

  const ROOT_SIZE_EXCLUDE = new Set<string>([
    'tag',
    'badge',
    'divider',
    'stepper',
    'breadcrumb',
    'paginator',
    'dialog',
    'confirmpopup',
    'overlaypanel',
    'tooltip',
    'message',
    'toast',
    'colorpicker',
  ])

  deepFindAndReplaceProperty(
    resultPreset,
    'mask',
    'background',
    'rgb(var(--muted-foreground) / 0.25)'
  )

  const { sm: rootSm, md: rootMd, lg: rootLg } = getRootSizeTokensByMode(sizeStore.sizeName)
  const components = resultPreset.components as
    | Record<string, Record<string, PrimeTokenValue>>
    | undefined
  if (components && typeof components === 'object') {
    for (const [name, config] of Object.entries(components)) {
      if (ROOT_SIZE_EXCLUDE.has(name)) continue
      const c = config as Record<string, PrimeTokenValue> | null
      if (c && typeof c === 'object' && c.root != null) {
        c.root = (c.root as Record<string, PrimeTokenValue>) || {}
        const root = c.root as Record<string, PrimeTokenValue>
        const rootSmObj = (root.sm as Record<string, string>) || {}
        const rootLgObj = (root.lg as Record<string, string>) || {}
        root.sm = rootSmObj
        root.lg = rootLgObj
        for (const [key, value] of Object.entries(rootSm)) {
          if (!(key in rootSmObj)) {
            rootSmObj[key] = value
          }
        }
        for (const [key, value] of Object.entries(rootMd)) {
          if (!(key in root)) {
            ;(root as Record<string, string>)[key] = value
          }
        }
        for (const [key, value] of Object.entries(rootLg)) {
          if (!(key in rootLgObj)) {
            rootLgObj[key] = value
          }
        }
      }
    }
  }

  // 共享状态色构建器：message 和 toast 的 dark semantic 映射同构，
  // 仅 toast 增加 detailColor 且 background/borderColor 带透明度后缀。
  const CLOSE_BTN_MUTED = {
    hoverBackground: 'rgb(var(--muted-foreground) / 0.1)',
  }
  const CLOSE_BTN_CONTRAST = {
    hoverBackground: 'rgb(var(--background) / 0.15)',
  }

  const buildStatusEntry = (
    cssVar: string,
    fgVar: string,
    closeBtnHover: string,
    focusColor: string,
    bgSuffix = '',
    borderSuffix = ''
  ) => ({
    background: `rgb(var(${cssVar})${bgSuffix})`,
    borderColor: `rgb(var(${cssVar})${borderSuffix})`,
    color: `rgb(var(${fgVar}))`,
    closeButton: {
      hoverBackground: closeBtnHover,
      focusRing: { color: `rgb(var(${focusColor}))` },
    },
  })

  const STATUS_KEYS = [
    { key: 'info', cssVar: '--info', fgVar: '--info-foreground' },
    { key: 'success', cssVar: '--success', fgVar: '--success-foreground' },
    { key: 'warn', cssVar: '--warn', fgVar: '--warn-foreground' },
    { key: 'error', cssVar: '--danger', fgVar: '--danger-foreground' },
    { key: 'secondary', cssVar: '--secondary', fgVar: '--secondary-foreground' },
  ] as const

  const messageDarkSemantic: Record<string, ReturnType<typeof buildStatusEntry>> = {}
  for (const { key, cssVar, fgVar } of STATUS_KEYS) {
    messageDarkSemantic[key] = buildStatusEntry(
      cssVar,
      fgVar,
      CLOSE_BTN_MUTED.hoverBackground,
      cssVar
    )
  }
  messageDarkSemantic.contrast = buildStatusEntry(
    '--foreground',
    '--background',
    CLOSE_BTN_CONTRAST.hoverBackground,
    '--foreground'
  )

  if (components?.message) {
    deepMergeStylesAdvancedInPlace(components.message, {
      colorScheme: { dark: messageDarkSemantic },
    })
  }

  const buildToastStatusEntry = (
    cssVar: string,
    fgVar: string,
    bgOpacity: string,
    borderOpacity: string
  ) => ({
    ...buildStatusEntry(
      cssVar,
      fgVar,
      CLOSE_BTN_MUTED.hoverBackground,
      cssVar,
      bgOpacity,
      borderOpacity
    ),
    detailColor: `rgb(var(${fgVar}))`,
  })

  const toastDarkSemantic: Record<string, ReturnType<typeof buildToastStatusEntry>> = {}
  for (const { key, cssVar, fgVar } of STATUS_KEYS) {
    toastDarkSemantic[key] = buildToastStatusEntry(cssVar, fgVar, ' / 0.6', ' / 0.8')
  }
  toastDarkSemantic.contrast = {
    ...buildStatusEntry(
      '--foreground',
      '--background',
      CLOSE_BTN_CONTRAST.hoverBackground,
      '--foreground',
      ' / 0.8'
    ),
    detailColor: 'rgb(var(--background))',
  }
  toastDarkSemantic.secondary = {
    ...buildStatusEntry(
      '--secondary',
      '--secondary-foreground',
      CLOSE_BTN_MUTED.hoverBackground,
      '--secondary',
      ' / 0.8'
    ),
    detailColor: 'rgb(var(--secondary-foreground))',
  }

  if (components?.toast) {
    deepMergeStylesAdvancedInPlace(components.toast, {
      content: {
        padding: 'var(--spacing-xs)',
      },
      colorScheme: { dark: toastDarkSemantic },
    })
  }

  _cachedPreset = resultPreset
  _cachedSizeMode = mode
  return resultPreset
}
