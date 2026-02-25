import { definePreset } from '@primevue/themes'
import Aura from '@primevue/themes/aura'
import type { useSizeStore } from '@/stores/modules/size'
import {
  deepMergeStylesAdvanced,
  deepMergeStylesAdvancedInPlace,
  deepFindAndReplaceProperty,
} from './primevue-theme-engine'
import { generateColorScale, generateBorderRadiusScale } from './primevue-theme-helpers'
import type SizeMode from '@/types/systems/size'
// -----------------------------------------------------------------------------
// 🧱 PrimeVue Preset 架构说明
// -----------------------------------------------------------------------------
//
// 1. 本文件是 PrimeVue @primevue/themes Aura 的“适配层”。
//    - 只复用 Aura 的 primitive / semantic / components 结构，
//      不再直接依赖 semantic.json / primitive.json / components.json 里的色值。
//    - 真正的数据源是：
//      - ThemeCssVars (见 src/types/systems/theme.d.ts, 由 generateThemeVars 计算并写入 :root)
//      - SizeCssVars  (见 src/types/systems/size.d.ts, 尺寸系统负责写入 :root)
//
// 2. 约定：
//    - 不在这里硬编码 Tailwind 色板 (emerald / slate 等)，
//      统一通过 CSS 变量 + color-mix 生成 PrimeVue 所需的 token。
//    - JSON 文件 (semantic.json / primitive.json / components.json) 只作为
//      “参考结构 & 默认键名” 使用；如需修改设计，应优先改本文件中的 TS 逻辑。
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
// -----------------------------------------------------------------------------

// -----------------------------------------------------------------------------
// 🎨 Color Palette Adapter
// 完全对齐架构的配色系统（theme.d.ts ThemeCssVars）
//
// 命名规则：ThemeCssVars 的 key（去掉 '--'）转为驼峰命名
// 例如：'--background' → getBackground, '--primary-foreground' → getPrimaryForeground
//
// 参考：src/types/systems/theme.d.ts ThemeCssVars
// 唯一实现：将 CSS 变量名转为 rgb(var(--xxx))；下面 createColorAdapter 里所有 getXxx 均由此生成，无另一套实现。
//
// Adapter 范围：仅覆盖 button/checkbox 等组件 colorScheme 所需语义（primary/secondary/state 的 default/foreground/hover）。
// 其余 ThemeCssVars（如 primary-light、accent-hover、*-hover-foreground 等）由组件直接使用 rgb(var(--xxx))，与 ThemeCssVars 一致。
// -----------------------------------------------------------------------------

const getRgbVar = (name: string) => `rgb(var(--${name}))`

/**
 * 创建颜色适配器
 * 返回的 getBackground、getPrimaryForeground 等均为 getRgbVar 的调用结果，与 ThemeCssVars 键一一对应。
 */
const createColorAdapter = () => {
  return {
    // === 基础层 ===
    getBackground: getRgbVar('background'),
    getForeground: getRgbVar('foreground'),
    getMuted: getRgbVar('muted'),
    getMutedForeground: getRgbVar('muted-foreground'),
    getBorder: getRgbVar('border'),
    getInput: getRgbVar('input'),
    getRing: getRgbVar('ring'),

    // === 容器层 ===
    getCard: getRgbVar('card'),
    getCardForeground: getRgbVar('card-foreground'),
    getPopover: getRgbVar('popover'),
    getPopoverForeground: getRgbVar('popover-foreground'),

    // === 品牌层 ===
    getPrimary: getRgbVar('primary'),
    getPrimaryForeground: getRgbVar('primary-foreground'),
    getPrimaryHover: getRgbVar('primary-hover'),
    getPrimaryLight: getRgbVar('primary-light'),

    // === 辅助层 ===
    getSecondary: getRgbVar('secondary'),
    getSecondaryForeground: getRgbVar('secondary-foreground'),
    getAccent: getRgbVar('accent'),
    getAccentForeground: getRgbVar('accent-foreground'),

    // === 状态层 ===
    getSuccess: getRgbVar('success'),
    getSuccessForeground: getRgbVar('success-foreground'),
    getSuccessHover: getRgbVar('success-hover'),
    getSuccessLight: getRgbVar('success-light'),
    getWarn: getRgbVar('warn'),
    getWarnForeground: getRgbVar('warn-foreground'),
    getWarnHover: getRgbVar('warn-hover'),
    getWarnLight: getRgbVar('warn-light'),
    getDanger: getRgbVar('danger'),
    getDangerForeground: getRgbVar('danger-foreground'),
    getDangerHover: getRgbVar('danger-hover'),
    getDangerLight: getRgbVar('danger-light'),
    getInfo: getRgbVar('info'),
    getInfoForeground: getRgbVar('info-foreground'),
    getInfoHover: getRgbVar('info-hover'),
    getInfoLight: getRgbVar('info-light'),
    getHelp: getRgbVar('help'),
    getHelpForeground: getRgbVar('help-foreground'),
    getHelpHover: getRgbVar('help-hover'),
    getHelpLight: getRgbVar('help-light'),
  }
}

// -----------------------------------------------------------------------------
// 🧩 Component Color Scheme Logic
// -----------------------------------------------------------------------------

type ColorAdapter = ReturnType<typeof createColorAdapter>

/**
 * 将 Aura 的 (colorType, suffix) 映射到架构对齐的适配器 getter
 *
 * 映射规则：
 * - Primary: '' → getPrimary, 'Text' → getPrimaryForeground, 'Hover'/'Active' → getPrimaryHover, 'Border' → getPrimary
 * - Info: '' → getInfo, 'Text' → getInfoForeground, 'Hover'/'Active' → getInfoHover, 'Border' → getInfo
 * - Secondary: '' → getSecondary, 'Text' → getSecondaryForeground, 'Hover'/'Active' → getSecondary, 'Border' → getSecondary
 * - Success: '' → getSuccess, 'Text' → getSuccessForeground, 'Hover'/'Active' → getSuccessHover, 'Border' → getSuccess
 * - Warn/Help: '' → getWarn, 'Text' → getWarnForeground, 'Hover'/'Active' → getWarnHover, 'Border' → getWarn
 * - Danger: '' → getDanger, 'Text' → getDangerForeground, 'Hover'/'Active' → getDangerHover, 'Border' → getDanger
 * - Contrast: '' → getForeground, 'Text' → getBackground, 'Hover'/'Active' → getForeground, 'Border' → getForeground
 */
const getAdapterKey = (
  colorType: 'Primary' | 'Secondary' | 'Info' | 'Success' | 'Warn' | 'Help' | 'Danger' | 'Contrast',
  suffix: string
): keyof ColorAdapter => {
  // Contrast 特殊处理
  if (colorType === 'Contrast') {
    if (suffix === 'Text') return 'getBackground'
    if (suffix === 'Light') return 'getMuted' // Contrast 无 *-light，用 muted 作为 hover 浅色背景
    return 'getForeground'
  }

  // 映射 Aura colorType 到架构命名（与 PrimeVue severity 对齐：danger 统一命名）
  let mappedType: 'Primary' | 'Secondary' | 'Success' | 'Warn' | 'Danger' | 'Info' | 'Help'
  if (colorType === 'Primary') {
    mappedType = 'Primary'
  } else if (colorType === 'Info') {
    mappedType = 'Info'
  } else if (colorType === 'Warn') {
    mappedType = 'Warn'
  } else if (colorType === 'Help') {
    mappedType = 'Help'
  } else if (colorType === 'Danger') {
    mappedType = 'Danger'
  } else {
    mappedType = colorType as 'Primary' | 'Secondary' | 'Success' | 'Warn' | 'Danger' | 'Help'
  }

  // 映射 suffix 到架构命名
  if (suffix === '') {
    return `get${mappedType}` as keyof ColorAdapter
  }
  if (suffix === 'Text') {
    return `get${mappedType}Foreground` as keyof ColorAdapter
  }
  if (suffix === 'Hover' || suffix === 'Active') {
    // Secondary 没有 hover，返回自身
    if (mappedType === 'Secondary') {
      return `get${mappedType}` as keyof ColorAdapter
    }
    return `get${mappedType}Hover` as keyof ColorAdapter
  }
  if (suffix === 'Border') {
    return `get${mappedType}` as keyof ColorAdapter
  }
  if (suffix === 'Light') {
    // Secondary 无 *-light，用 muted 作为浅色背景回退（Contrast 已在顶部提前返回）
    if (mappedType === 'Secondary') {
      return 'getMuted' as keyof ColorAdapter
    }
    return `get${mappedType}Light` as keyof ColorAdapter
  }

  // 兜底：返回基础色
  return `get${mappedType}` as keyof ColorAdapter
}

const initComponentButtonColorSchemeOptionsItems = (
  colors: ColorAdapter,
  type: 'root' | 'outlined' | 'text' | 'link' = 'root'
) => {
  const getColorOptions = (
    colorType:
      | 'Primary'
      | 'Secondary'
      | 'Info'
      | 'Success'
      | 'Warn'
      | 'Help'
      | 'Danger'
      | 'Contrast'
  ) => {
    // 使用架构对齐的映射函数
    const get = (suffix: string) => {
      const key = getAdapterKey(colorType, suffix)
      return colors[key] || colors[getAdapterKey(colorType, '')]
    }

    switch (type) {
      case 'outlined':
        return {
          // Hover/Active: Light Tint (对齐 Aura，避免实色填充导致红底红字不可读)
          hoverBackground: get('Light'),
          activeBackground: get('Light'),
          hoverBorderColor: colorType === 'Secondary' ? get('Text') : get(''),
          activeBorderColor: colorType === 'Secondary' ? get('Text') : get(''),
          hoverColor: get(''),
          activeColor: get(''),

          borderColor: colorType === 'Secondary' ? get('Text') : get(''),
          color: colorType === 'Secondary' ? get('Text') : get(''),
        }
      case 'text':
        return {
          // Hover/Active: Light Tint (对齐 Aura，避免 *-foreground 为黑导致黑底彩字)
          hoverBackground: get('Light'),
          activeBackground: get('Light'),
          color: colorType === 'Secondary' ? get('Text') : get(''),
        }
      case 'link':
        return {
          color: get('Text'),
          hoverColor: get(''),
          activeColor: get('Hover'),
        }
      default: // root / filled
        return {
          background: get(''),
          hoverBackground: get('Hover'),
          activeBackground: get('Active'),
          borderColor: get('Border') || get(''),
          hoverBorderColor: get('Active'),
          activeBorderColor: get('Hover'),
          color: get('Text'),
          hoverColor: get('Text'),
          activeColor: get('Text'),
        }
    }
  }

  return {
    primary: getColorOptions('Primary'),
    secondary: getColorOptions('Secondary'),
    info: getColorOptions('Info'),
    success: getColorOptions('Success'),
    warn: getColorOptions('Warn'),
    help: getColorOptions('Help'),
    danger: getColorOptions('Danger'),
    contrast: getColorOptions('Contrast'),
  }
}

// -----------------------------------------------------------------------------
// 🛠 Custom Preset Factory
// -----------------------------------------------------------------------------

type RootSizeTokens = {
  sm: Record<string, string>
  md: Record<string, string>
  lg: Record<string, string>
}

// 控件/表单 root.sm、root.md、root.lg 统一使用同一组 Token 名（var(--font-size-*)、var(--spacing-*)）。
// 具体数值由 :root 的 SizeCssVars 在尺寸模式切换时更新（sizeStore.setSize → generateSizeVars → applySizeTheme），
// 故此处不按 mode 区分 token 名；mode 参数保留以兼容调用方及后续扩展。
// 键与 Aura components.json 中 root.sm/root.lg 一致：fontSize、paddingX、paddingY、padding、gap。
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

export const createCustomPreset = (sizeStore: ReturnType<typeof useSizeStore>) => {
  const colors = createColorAdapter()

  // ──────────────────────────────────────────────────────────────────────────
  // 1. PRIMITIVE LAYER: 建立CSS变量 → Token的映射
  // definePreset 与 Aura 为深合并，Aura 自带的 primitive（red/green/sky/emerald/slate 等）会保留，
  // 此处仅补充/覆盖 brand、neutral、success、warning、error、accent、borderRadius，与架构 ThemeCssVars 通过 semantic 引用 rgb(var(--xxx)) 对齐。
  // ──────────────────────────────────────────────────────────────────────────
  const primitiveColors = {
    // 主品牌色 - 从 --primary 映射
    brand: {
      ...generateColorScale('primary', { hasHover: true }),
    },

    // 中性色 - 直接使用CSS变量 (会随亮暗模式自动响应)
    // 这些CSS变量在theme切换时会自动更新,无需分别定义light/dark
    neutral: {
      // 极浅 -> 极深 (语义在darkmode下反转)
      0: 'rgb(var(--background))', // Dynamic background
      50: 'rgb(var(--muted))', // 极浅背景
      100: 'color-mix(in srgb, rgb(var(--muted)), rgb(var(--background)) 50%)',
      200: 'color-mix(in srgb, rgb(var(--border)), rgb(var(--muted)) 50%)',
      300: 'rgb(var(--border))', // 边框
      400: 'color-mix(in srgb, rgb(var(--muted-foreground)), rgb(var(--border)) 50%)',
      500: 'rgb(var(--muted-foreground))', // 次要文字
      600: 'color-mix(in srgb, rgb(var(--foreground)), rgb(var(--muted-foreground)) 50%)',
      700: 'rgb(var(--foreground))', // 主文字
      800: 'color-mix(in srgb, rgb(var(--foreground)), black 20%)',
      900: 'color-mix(in srgb, rgb(var(--foreground)), black 40%)',
      950: 'color-mix(in srgb, rgb(var(--foreground)), black 60%)', // 极深
    },

    // 状态色 - Success
    success: {
      ...generateColorScale('success', { hasHover: true }),
    },

    // 状态色 - Warning
    warning: {
      ...generateColorScale('warn', { hasHover: true }),
    },

    // 状态色 - Error/Danger
    error: {
      ...generateColorScale('danger', { hasHover: true }),
    },

    // 辅助色 - Accent
    accent: {
      ...generateColorScale('accent', { hasHover: false }),
    },

    // 边框圆角
    borderRadius: {
      ...generateBorderRadiusScale(),
    },
  }

  // ──────────────────────────────────────────────────────────────────────────
  // 2. SEMANTIC LAYER: 使用colorScheme结构,用Token引用代替硬编码CSS变量
  // ──────────────────────────────────────────────────────────────────────────
  const semanticColors = {
    // 全局配置（与 SizeCssVars 过渡阶梯统一，尺寸模式切换时过渡时长一致）
    transitionDuration: 'var(--transition-md)',
    focusRing: {
      width: 'calc(var(--spacing-xs) / 2)',
      style: 'solid',
      color: '{brand.500}', // 使用Token引用
      offset: 'calc(var(--spacing-xs) / 2)',
      shadow: 'none',
    },
    disabledOpacity: '0.6',
    iconSize: 'var(--font-size-md)',
    anchorGutter: '0',

    // ────────────────────────────────────────────────────────────────────────
    // ✅ 尺寸系统融合 (Size System Integration)
    // ────────────────────────────────────────────────────────────────────────

    // 表单控件尺寸 (Input, Button, Dropdown...) - Aura 使用 form.field.sm.font.size 路径
    formField: {
      // 默认（md）：取 sm 与 md 的中值，避免横向偏大，同时完全跟随 Size 系统
      // paddingX: 'calc((var(--spacing-sm) + var(--spacing-md)) / 2)',
      paddingX: 'var(--spacing-sm)',
      // 默认（md）：更接近舒适模式的控件高度
      paddingY: 'var(--spacing-xs)',
      borderRadius: 'var(--radius-md)',
      fontSize: 'var(--font-size-md)', // Base font size
      focusRing: {
        width: '0', // Native focus ring handled by focusRing global above or individually
        style: 'none',
        color: 'transparent',
        offset: '0',
        shadow: 'none',
      },
      transitionDuration: 'var(--transition-md)',
      // 响应式尺寸 (sm/lg) - 与 Aura form.field.sm.font.size 路径一致
      sm: {
        fontSize: 'var(--font-size-sm)',
        paddingX: 'var(--spacing-xs)',
        paddingY: 'calc(var(--spacing-xs) / 2)',
      },
      lg: {
        fontSize: 'var(--font-size-lg)',
        paddingX: 'var(--spacing-md)', // 介于 sm 和 md 之间
        paddingY: 'var(--spacing-sm)',
      },
    },

    // 列表项尺寸 (Menu, Select Option...)
    list: {
      padding: 'var(--spacing-xs) var(--spacing-sm)', // Container padding
      gap: 'var(--spacing-xs)', // Item gap
      header: {
        padding: 'var(--spacing-xs) var(--spacing-sm)', // Py Px
      },
      option: {
        padding: 'var(--spacing-xs) var(--spacing-sm)', // Py Px
        borderRadius: 'var(--radius-sm)', // Items usually have smaller radius
      },
      optionGroup: {
        padding: 'var(--spacing-xs) var(--spacing-sm)',
      },
    },

    // 浮层尺寸 (Dialog, Popover, Tooltip...)
    overlay: {
      select: {
        borderRadius: 'var(--radius-md)',
      },
      popover: {
        borderRadius: 'var(--radius-md)',
        padding: 'var(--spacing-md)',
      },
      modal: {
        padding: 'var(--spacing-md)',
      },
    },

    content: {
      borderRadius: 'var(--radius-md)',
    },

    // 遮罩与导航：与尺寸系统过渡/间距/圆角阶梯统一
    mask: {
      transitionDuration: 'var(--transition-lg)', // 与 Aura 0.3s 接近，随尺寸模式
    },
    navigation: {
      list: {
        padding: 'var(--spacing-xs) var(--spacing-sm)',
        gap: 'var(--spacing-xs)',
      },
      item: {
        padding: 'var(--spacing-xs) var(--spacing-sm)',
        borderRadius: 'var(--radius-sm)',
        gap: 'var(--spacing-sm)',
      },
      submenuLabel: {
        padding: 'var(--spacing-xs) var(--spacing-sm)',
      },
      submenuIcon: {
        size: 'var(--font-size-sm)',
      },
    },

    // ✅ 关键: 在colorScheme下定义Primary (Aura要求的结构)
    primary: {
      50: '{brand.50}',
      100: '{brand.100}',
      200: '{brand.200}',
      300: '{brand.300}',
      400: '{brand.400}',
      500: '{brand.500}',
      600: '{brand.600}',
      700: '{brand.700}',
      800: '{brand.800}',
      900: '{brand.900}',
      950: '{brand.950}',
    },

    // 颜色方案: 分别定义light和dark
    colorScheme: {
      light: {
        // Surface (中性背景色阶)
        surface: {
          0: 'rgb(var(--background))', // 使用CSS变量 (light模式是白色)
          50: '{neutral.50}', // 浅灰
          100: '{neutral.100}',
          200: '{neutral.200}',
          300: '{neutral.300}', // 边框
          400: '{neutral.400}',
          500: '{neutral.500}',
          600: '{neutral.600}',
          700: '{neutral.700}', // 文字
          800: '{neutral.800}',
          900: '{neutral.900}',
          950: '{neutral.950}',
        },

        // Primary (主色语义)
        primary: {
          color: '{brand.500}',
          contrastColor: 'rgb(var(--primary-foreground))',
          hoverColor: '{brand.600}',
          activeColor: '{brand.700}',
        },

        // Form Field (表单字段) — 禁用态对齐设计系统 muted/muted-foreground
        formField: {
          background: '{surface.0}',
          disabledBackground: 'rgb(var(--muted))',
          filledBackground: '{surface.50}',
          filledHoverBackground: '{surface.50}',
          filledFocusBackground: '{surface.50}',
          borderColor: '{surface.300}',
          hoverBorderColor: '{surface.400}',
          focusBorderColor: '{brand.500}',
          invalidBorderColor: '{error.500}',
          invalidPlaceholderColor: '{error.600}',
          color: '{surface.700}',
          disabledColor: 'rgb(var(--muted-foreground))',
          placeholderColor: '{surface.500}',
          iconColor: 'rgb(var(--muted-foreground))',
          shadow: 'none',
        },

        // Text (文字颜色)
        text: {
          color: 'rgb(var(--foreground))',
          hoverColor: 'rgb(var(--foreground))',
          mutedColor: 'rgb(var(--muted-foreground))',
          hoverMutedColor: 'rgb(var(--muted-foreground))',
        },

        // Content (内容区域 - 用于Panel, DataTable等)
        content: {
          background: 'rgb(var(--background))',
          hoverBackground: 'rgb(var(--muted))',
          borderColor: 'rgb(var(--border))',
          color: '{text.color}',
          hoverColor: '{text.hover.color}',
        },
      },

      dark: {
        // Surface (暗色模式中性色阶)
        // 注意: neutral已经使用CSS变量,会自动响应dark mode
        surface: {
          0: 'rgb(var(--background))', // 暗色模式背景
          50: '{neutral.50}',
          100: '{neutral.100}',
          200: '{neutral.200}',
          300: '{neutral.300}',
          400: '{neutral.400}',
          500: '{neutral.500}',
          600: '{neutral.600}',
          700: '{neutral.700}',
          800: '{neutral.800}',
          900: '{neutral.900}',
          950: '{neutral.950}',
        },

        // Primary (暗色模式主色 - 使用更亮的档位)
        primary: {
          color: '{brand.400}', // 暗色模式用400更亮
          contrastColor: 'rgb(var(--primary-foreground))',
          hoverColor: '{brand.300}',
          activeColor: '{brand.200}',
        },

        // Form Field (暗色模式表单字段) — 禁用态对齐设计系统 muted/muted-foreground
        formField: {
          background: 'rgb(var(--background))', // 暗色背景
          disabledBackground: 'rgb(var(--muted))',
          filledBackground: '{surface.800}',
          filledHoverBackground: '{surface.800}',
          filledFocusBackground: '{surface.800}',
          borderColor: 'rgb(var(--border))',
          hoverBorderColor: '{brand.400}',
          focusBorderColor: '{brand.400}',
          invalidBorderColor: '{error.400}',
          invalidPlaceholderColor: '{error.600}',
          color: 'rgb(var(--foreground))',
          disabledColor: 'rgb(var(--muted-foreground))',
          placeholderColor: '{surface.400}',
          iconColor: 'rgb(var(--muted-foreground))',
          shadow: 'none',
        },

        // Text (暗色模式文字)
        text: {
          color: 'rgb(var(--foreground))',
          hoverColor: 'rgb(var(--foreground))',
          mutedColor: 'rgb(var(--muted-foreground))',
          hoverMutedColor: 'rgb(var(--muted-foreground))',
        },

        // Content (暗色模式内容区域)
        content: {
          background: 'rgb(var(--background))',
          hoverBackground: 'rgb(var(--muted))',
          borderColor: 'rgb(var(--border))',
          color: '{text.color}',
          hoverColor: '{text.hover.color}',
        },
      },
    },
  }

  // ──────────────────────────────────────────────────────────────────────────
  // 4. COMPONENT LAYER: 仅保留必要的组件特定覆盖
  //    大部分组件现在通过Token引用自动继承样式
  // ──────────────────────────────────────────────────────────────────────────
  const componentColors = {
    scrollpanel: {
      root: {
        transitionDuration: 'var(--transition-md)',
      },
      bar: {
        size: 'var(--spacing-xs)',
        borderRadius: 'var(--radius-sm)',
        focusRing: {
          width: 'calc(var(--spacing-xs) / 2)',
          style: 'solid',
          color: 'rgb(var(--brand-500))',
          offset: 'calc(var(--spacing-xs) / 2)',
          shadow: 'none',
        },
      },
      colorScheme: {
        light: {
          bar: {
            background: 'rgb(var(--muted))',
          },
        },
        dark: {
          bar: {
            background: 'rgb(var(--muted))',
          },
        },
      },
    },
    virtualscroller: {
      loader: {
        mask: {
          background: 'rgb(var(--background))',
          color: 'rgb(var(--muted-foreground))',
        },
        icon: {
          size: 'var(--font-size-md)',
        },
      },
    },
    button: {
      colorScheme: {
        light: {
          root: initComponentButtonColorSchemeOptionsItems(colors, 'root'),
          outlined: initComponentButtonColorSchemeOptionsItems(colors, 'outlined'),
          text: initComponentButtonColorSchemeOptionsItems(colors, 'text'),
          link: initComponentButtonColorSchemeOptionsItems(colors, 'link'),
        },
        dark: {
          root: initComponentButtonColorSchemeOptionsItems(colors, 'root'),
          outlined: initComponentButtonColorSchemeOptionsItems(colors, 'outlined'),
          text: initComponentButtonColorSchemeOptionsItems(colors, 'text'),
          link: initComponentButtonColorSchemeOptionsItems(colors, 'link'),
        },
      },
    },
    // Checkbox - colorScheme structure for light/dark mode backgrounds and borders
    checkbox: {
      colorScheme: {
        light: {
          root: {
            background: colors.getBackground,
            borderColor: 'rgb(var(--input))', // Consistent with input border
            hoverBorderColor: colors.getPrimary,
            checkedBackground: colors.getPrimary,
            checkedBorderColor: colors.getPrimary,
            checkedHoverBackground: colors.getPrimaryHover,
          },
          icon: {
            color: colors.getPrimaryForeground,
          },
        },
        dark: {
          root: {
            background: colors.getBackground,
            borderColor: 'rgb(var(--input))',
            hoverBorderColor: colors.getPrimary,
            checkedBackground: colors.getPrimary,
            checkedBorderColor: colors.getPrimary,
            checkedHoverBackground: colors.getPrimaryHover,
          },
          icon: {
            color: colors.getPrimaryForeground,
          },
        },
      },
    },
    // RadioButton - colorScheme structure for light/dark mode backgrounds and borders
    radiobutton: {
      colorScheme: {
        light: {
          root: {
            background: colors.getBackground,
            borderColor: 'rgb(var(--input))',
            hoverBorderColor: colors.getPrimary,
            checkedBackground: colors.getPrimary,
            checkedBorderColor: colors.getPrimary,
          },
          icon: {
            background: colors.getPrimary,
            checkedHoverBackground: colors.getPrimaryHover,
          },
        },
        dark: {
          root: {
            background: colors.getBackground,
            borderColor: 'rgb(var(--input))',
            hoverBorderColor: colors.getPrimary,
            checkedBackground: colors.getPrimary,
            checkedBorderColor: colors.getPrimary,
          },
          icon: {
            background: colors.getPrimary,
            checkedHoverBackground: colors.getPrimaryHover,
          },
        },
      },
    },
    // ToggleSwitch - OFF/ON 状态与设计系统颜色对齐
    toggleswitch: {
      colorScheme: {
        light: {
          root: {
            // 关闭状态：使用背景色 + 边框，形成「白色胶囊」
            background: 'rgb(var(--background))',
            hoverBackground: 'rgb(var(--background))',
            disabledBackground: 'rgb(var(--input))',
            // 浅色模式下增加边框，让 OFF 状态轮廓更清晰
            borderColor: 'rgb(var(--border))',
            hoverBorderColor: 'rgb(var(--border))',
            checkedBorderColor: 'rgb(var(--primary))',
            checkedHoverBorderColor: 'rgb(var(--primary-hover))',
            // 开启状态：使用主品牌色
            checkedBackground: 'rgb(var(--primary))',
            checkedHoverBackground: 'rgb(var(--primary-hover))',
          },
          handle: {
            // 关闭状态：用 muted 作为圆点，在白色轨道上既清晰又柔和
            background: 'rgb(var(--input))',
            hoverBackground: 'rgb(var(--border))',
            // 开启状态：回到背景色，在主色轨道上形成浅色圆点
            checkedBackground: 'rgb(var(--background))',
            checkedHoverBackground: 'rgb(var(--background))',
          },
        },
        dark: {
          root: {
            // 暗色下关闭状态：用 card 较背景更亮，并加边框，保证轨道可见
            background: 'rgb(var(--card))',
            hoverBackground: 'rgb(var(--card))',
            disabledBackground: 'rgb(var(--input))',
            borderColor: 'rgb(var(--border))',
            hoverBorderColor: 'rgb(var(--border))',
            checkedBackground: 'rgb(var(--primary))',
            checkedHoverBackground: 'rgb(var(--primary-hover))',
          },
          handle: {
            // 深色模式：手柄用 background，与 card 轨道形成对比
            background: 'rgb(var(--input))',
            hoverBackground: 'rgb(var(--border))',
            checkedBackground: 'rgb(var(--background))',
            checkedHoverBackground: 'rgb(var(--background))',
          },
        },
      },
    },
    // DataTable - use colorScheme for proper dark mode text colors
    datatable: {
      headerCell: {
        background: 'rgb(var(--background))',
        borderColor: 'rgb(var(--border))',
        color: 'rgb(var(--foreground))',
        // 表头悬停背景：使用 muted 形成轻微高亮
        hoverBackground: 'rgb(var(--muted))',
        // 表头选中/排序高亮背景：使用 primary-light 实色，避免半透明叠加导致对比度不足
        selectedBackground: 'rgb(var(--muted))',
      },
      bodyCell: {
        borderColor: 'rgb(var(--border))',
        color: 'rgb(var(--foreground))',
      },
      row: {
        background: 'rgb(var(--background))',
      },
      footerCell: {
        background: 'rgb(var(--background))',
        borderColor: 'rgb(var(--border))',
        color: 'rgb(var(--foreground))',
      },
      footer: {
        borderColor: 'rgb(var(--border))',
      },
      // Filter menu 样式：修复筛选菜单配色错乱问题
      filter: {
        overlaySelect: {
          background: 'rgb(var(--popover))',
          borderColor: 'rgb(var(--border))',
          borderRadius: 'var(--radius-md)',
          color: 'rgb(var(--popover-foreground))',
          shadow: 'var(--shadow-md)',
        },
        overlayPopover: {
          background: 'rgb(var(--popover))',
          borderColor: 'rgb(var(--border))',
          borderRadius: 'var(--radius-md)',
          color: 'rgb(var(--popover-foreground))',
          shadow: 'var(--shadow-md)',
          padding: 'var(--spacing-sm)',
          gap: 'var(--spacing-xs)',
        },
        rule: {
          borderColor: 'rgb(var(--border))',
        },
        constraintList: {
          padding: 'var(--spacing-xs)',
          gap: 'var(--spacing-xs)',
        },
        constraint: {
          focusBackground: 'rgb(var(--accent))',
          selectedBackground: 'rgb(var(--primary))',
          selectedFocusBackground: 'rgb(var(--primary))',
          color: 'rgb(var(--popover-foreground))',
          focusColor: 'rgb(var(--accent-foreground))',
          selectedColor: 'rgb(var(--primary-foreground))',
          selectedFocusColor: 'rgb(var(--primary-foreground))',
          separator: {
            borderColor: 'rgb(var(--border))',
          },
          padding: 'var(--spacing-xs) var(--spacing-sm)',
          borderRadius: 'var(--radius-sm)',
        },
      },
      // 斑马纹背景：使用 muted-foreground 的 5% 透明度，在深色背景下形成柔和的浅灰色条纹
      colorScheme: {
        light: {
          row: {
            stripedBackground: 'rgb(var(--muted-foreground)/0.1)',
            hoverBackground: 'rgb(var(--accent)/0.12)',
          },
        },
        dark: {
          row: {
            stripedBackground: 'rgb(var(--muted))',
            hoverBackground: 'rgb(var(--primary)/0.2)',
          },
        },
      },
    },
    // Accordion - 直接覆盖 header/content，融合 ThemeCssVars 配色系统
    accordion: {
      // 与 Aura 结构对齐：root / panel / header / content
      root: {
        borderRadius: 'var(--radius-md)',
      },
      header: {
        padding: 'var(--spacing-md) var(--spacing-sm)',

        // 文本颜色：默认弱前景，悬停/激活使用主前景
        color: 'rgb(var(--muted-foreground))',
        hoverColor: 'rgb(var(--foreground))',
        activeColor: 'rgb(var(--foreground))',
        activeHoverColor: 'rgb(var(--foreground))',

        // 背景：默认 card，悬停/激活使用 muted 形成轻微高亮
        hoverBackground: 'rgb(var(--primary-hover)/0.4)',
        activeBackground: 'rgb(var(--primary)/0.4)',
        activeHoverBackground: 'rgb(var(--primary)/0.4)',
      },
      content: {
        padding: 'var(--spacing-sm) var(--spacing-md)',
      },
    },
    // Panel - use colorScheme for proper dark mode
    panel: {
      colorScheme: {
        light: {
          header: {
            background: 'rgb(var(--background))',
            borderColor: 'rgb(var(--border))',
            color: 'rgb(var(--foreground))',
          },
          content: {
            background: 'rgb(var(--background))',
            borderColor: 'rgb(var(--border))',
            color: 'rgb(var(--foreground))',
          },
        },
        dark: {
          header: {
            background: 'rgb(var(--background))',
            borderColor: 'rgb(var(--border))',
            color: 'rgb(var(--foreground))',
          },
          content: {
            background: 'rgb(var(--background))',
            borderColor: 'rgb(var(--border))',
            color: 'rgb(var(--foreground))',
          },
        },
      },
    },
    // Card - use colorScheme for proper dark mode
    card: {
      colorScheme: {
        light: {
          root: {
            background: 'rgb(var(--background))',
            borderColor: 'rgb(var(--border))',
            color: 'rgb(var(--foreground))',
          },
          title: {
            color: 'rgb(var(--foreground))',
          },
          subtitle: {
            color: 'rgb(var(--muted-foreground))',
          },
          content: {
            color: 'rgb(var(--foreground))',
          },
          body: {
            color: 'rgb(var(--foreground))',
          },
        },
        dark: {
          root: {
            background: 'rgb(var(--background))',
            borderColor: 'rgb(var(--border))',
            color: 'rgb(var(--foreground))',
          },
          title: {
            color: 'rgb(var(--foreground))',
          },
          subtitle: {
            color: 'rgb(var(--muted-foreground))',
          },
          content: {
            color: 'rgb(var(--foreground))',
          },
          body: {
            color: 'rgb(var(--foreground))',
          },
        },
      },
    },
    // Fieldset - use colorScheme for proper dark mode
    fieldset: {
      colorScheme: {
        light: {
          legend: {
            background: 'rgb(var(--background))',
            borderColor: 'rgb(var(--border))',
            color: 'rgb(var(--foreground))',
          },
          content: {
            borderColor: 'rgb(var(--border))',
            color: 'rgb(var(--foreground))',
          },
        },
        dark: {
          legend: {
            background: 'rgb(var(--background))',
            borderColor: 'rgb(var(--border))',
            color: 'rgb(var(--foreground))',
          },
          content: {
            borderColor: 'rgb(var(--border))',
            color: 'rgb(var(--foreground))',
          },
        },
      },
    },
    // Stepper - softer styling
    stepper: {
      step: {
        borderColor: 'rgb(var(--border))',
      },
      stepNumber: {
        background: 'rgb(var(--secondary))',
        color: 'rgb(var(--foreground))',
        activeBackground: 'rgb(var(--primary))',
        activeColor: 'rgb(var(--primary-foreground))',
      },
      stepTitle: {
        color: 'rgb(var(--muted-foreground))',
        activeColor: 'rgb(var(--primary))',
      },
    },
    // InputText and form fields
    inputtext: {
      root: {
        background: 'rgb(var(--background))',
        borderColor: 'rgb(var(--input))',
        hoverBorderColor: 'rgb(var(--primary))',
        focusBorderColor: 'rgb(var(--primary))',
        color: 'rgb(var(--foreground))',
        placeholderColor: 'rgb(var(--muted-foreground))',
        disabledBackground: 'rgb(var(--muted))',
        disabledColor: 'rgb(var(--muted-foreground))',
      },
    },
    // InputNumber
    inputnumber: {
      root: {
        background: 'rgb(var(--background))',
        borderColor: 'rgb(var(--input))',
        hoverBorderColor: 'rgb(var(--primary))',
        focusBorderColor: 'rgb(var(--primary))',
        color: 'rgb(var(--foreground))',
        placeholderColor: 'rgb(var(--muted-foreground))',
        disabledBackground: 'rgb(var(--muted))',
        disabledColor: 'rgb(var(--muted-foreground))',
      },
      colorScheme: {
        light: {
          button: {
            background: 'transparent',
            hoverBackground: 'rgb(var(--muted))',
            activeBackground: 'rgb(var(--muted))',
            borderColor: 'rgb(var(--input))',
            hoverBorderColor: 'rgb(var(--input))',
            activeBorderColor: 'rgb(var(--input))',
            color: 'rgb(var(--muted-foreground))',
            hoverColor: 'rgb(var(--foreground))',
            activeColor: 'rgb(var(--foreground))',
          },
        },
        dark: {
          button: {
            background: 'transparent',
            hoverBackground: 'rgb(var(--muted))',
            activeBackground: 'rgb(var(--muted))',
            borderColor: 'rgb(var(--input))',
            hoverBorderColor: 'rgb(var(--input))',
            activeBorderColor: 'rgb(var(--input))',
            color: 'rgb(var(--muted-foreground))',
            hoverColor: 'rgb(var(--foreground))',
            activeColor: 'rgb(var(--foreground))',
          },
        },
      },
    },
    // InputChips
    inputchips: {
      root: {
        background: 'rgb(var(--background))',
        borderColor: 'rgb(var(--input))',
        hoverBorderColor: 'rgb(var(--primary))',
        focusBorderColor: 'rgb(var(--primary))',
        color: 'rgb(var(--foreground))',
        disabledBackground: 'rgb(var(--muted))',
        disabledColor: 'rgb(var(--muted-foreground))',
      },
      colorScheme: {
        light: {
          chip: {
            background: 'rgb(var(--secondary))',
            color: 'rgb(var(--secondary-foreground))',
          },
        },
        dark: {
          chip: {
            background: 'rgb(var(--secondary))',
            color: 'rgb(var(--secondary-foreground))',
          },
        },
      },
      chip: {
        borderRadius: 'var(--radius-md)',
      },
    },
    // ColorPicker
    colorpicker: {
      root: {
        background: 'rgb(var(--background))',
        borderColor: 'rgb(var(--input))',
        color: 'rgb(var(--foreground))',
        disabledBackground: 'rgb(var(--muted))',
        disabledColor: 'rgb(var(--muted-foreground))',
      },
      preview: {
        background: 'rgb(var(--background))',
        borderColor: 'rgb(var(--input))',
      },
      panel: {
        background: 'rgb(var(--popover))',
        borderColor: 'rgb(var(--border))',
      },
      handle: {
        color: 'rgb(var(--foreground))',
      },
    },
    // Slider
    slider: {
      track: {
        // 未选中轨道：使用中性色，弱化存在感
        background: 'rgb(var(--input))',
        disabledBackground: 'rgb(var(--muted))',
        size: 'var(--spacing-xs)',
        borderRadius: 'var(--radius-md)',
      },
      range: {
        // 已选中轨道：使用主品牌色
        background: 'rgb(var(--primary))',
        borderRadius: 'var(--radius-md)',
      },
      handle: {
        // 外圈：与背景更贴近，形成轻微浮起感
        background: 'rgb(var(--background))',
        hoverBackground: 'rgb(var(--primary-light))',
        disabledBackground: 'rgb(var(--muted))',
        width: 'var(--spacing-lg)',
        height: 'var(--spacing-lg)',
        borderRadius: '50%',
        content: {
          // 内芯：主品牌色，作为视觉焦点
          background: 'rgb(var(--primary))',
          hoverBackground: 'rgb(var(--primary-hover))',
          disabledBackground: 'rgb(var(--muted))',
          width: 'var(--spacing-md)',
          height: 'var(--spacing-md)',
          borderRadius: '50%',
        },
      },
      colorScheme: {
        light: {
          handle: {
            content: {
              background: 'rgb(var(--primary))',
            },
          },
        },
        dark: {
          handle: {
            content: {
              background: 'rgb(var(--primary))',
            },
          },
        },
      },
    },
    // Select/Dropdown
    select: {
      root: {
        background: 'rgb(var(--background))',
        borderColor: 'rgb(var(--input))',
        hoverBorderColor: 'rgb(var(--primary))',
        focusBorderColor: 'rgb(var(--primary))',
        color: 'rgb(var(--foreground))',
        disabledBackground: 'rgb(var(--muted))',
        disabledColor: 'rgb(var(--muted-foreground))',
      },
      dropdown: {
        background: 'rgb(var(--background))',
        borderColor: 'rgb(var(--input))',
        color: 'rgb(var(--muted-foreground))',
      },
      overlay: {
        background: 'rgb(var(--popover))',
        borderColor: 'rgb(var(--border))',
        color: 'rgb(var(--popover-foreground))',
        borderRadius: 'var(--radius-md)',
      },
      option: {
        color: 'rgb(var(--popover-foreground))',
        focusBackground: 'rgb(var(--accent))',
        focusColor: 'rgb(var(--accent-foreground))',
        selectedBackground: 'rgb(var(--primary))',
        selectedColor: 'rgb(var(--primary-foreground))',
        selectedFocusBackground: 'rgb(var(--primary))',
        selectedFocusColor: 'rgb(var(--primary-foreground))',
      },
      optionGroup: {
        background: 'rgb(var(--popover))',
        color: 'rgb(var(--muted-foreground))',
      },
    },
    // Dialog - use colorScheme for proper dark mode
    dialog: {
      colorScheme: {
        light: {
          root: {
            background: 'rgb(var(--popover))',
            borderColor: 'rgb(var(--border))',
          },
          header: {
            background: 'rgb(var(--popover))',
            color: 'rgb(var(--popover-foreground))',
          },
          content: {
            background: 'rgb(var(--popover))',
            color: 'rgb(var(--popover-foreground))',
          },
          footer: {
            background: 'rgb(var(--popover))',
          },
        },
        dark: {
          root: {
            background: 'rgb(var(--popover))',
            borderColor: 'rgb(var(--border))',
          },
          header: {
            background: 'rgb(var(--popover))',
            color: 'rgb(var(--popover-foreground))',
          },
          content: {
            background: 'rgb(var(--popover))',
            color: 'rgb(var(--popover-foreground))',
          },
          footer: {
            background: 'rgb(var(--popover))',
          },
        },
      },
    },
    // Drawer
    drawer: {
      colorScheme: {
        light: {
          root: {
            background: 'rgb(var(--background))',
            borderColor: 'rgb(var(--border))',
          },
          header: {
            background: 'rgb(var(--background))',
            color: 'rgb(var(--foreground))',
          },
          content: {
            background: 'rgb(var(--background))',
            color: 'rgb(var(--foreground))',
          },
        },
        dark: {
          root: {
            background: 'rgb(var(--background))',
            borderColor: 'rgb(var(--border))',
          },
          header: {
            background: 'rgb(var(--background))',
            color: 'rgb(var(--foreground))',
          },
          content: {
            background: 'rgb(var(--background))',
            color: 'rgb(var(--foreground))',
          },
        },
      },
    },
    // Popover - ensure correct background color (popover/card)
    popover: {
      colorScheme: {
        light: {
          root: {
            background: 'rgb(var(--popover))',
            borderColor: 'rgb(var(--border))',
            color: 'rgb(var(--popover-foreground))',
          },
          content: {
            background: 'rgb(var(--popover))',
            color: 'rgb(var(--popover-foreground))',
          },
        },
        dark: {
          root: {
            background: 'rgb(var(--popover))',
            borderColor: 'rgb(var(--border))',
            color: 'rgb(var(--popover-foreground))',
          },
          content: {
            background: 'rgb(var(--popover))',
            color: 'rgb(var(--popover-foreground))',
          },
        },
      },
    },
    // ConfirmPopup - 复用全局 Popover 的配色
    confirmpopup: {
      root: {
        // 直接使用设计系统的 Popover 背景/前景/边框
        background: 'rgb(var(--popover))',
        borderColor: 'rgb(var(--border))',
        color: 'rgb(var(--popover-foreground))',
        borderRadius: 'var(--radius-md)', // 与其他卡片、Popover 保持一致
        // 阴影可以继续使用 Popover 的标准阴影
        // 如果想更轻一些，也可以用 card 的 shadow
      },
      content: {
        // 保持从 Popover 继承的 padding/gap 逻辑即可
        // 这里只强调一下文字前景色
        background: 'rgb(var(--popover))',
        color: 'rgb(var(--popover-foreground))',
      },
      icon: {
        // 图标颜色：用前景色或 warn 色，按你喜好
        color: 'rgb(var(--popover-foreground))',
      },
      footer: {
        padding: 'var(--spacing-md) var(--spacing-md)',
      },
    },
    // Menu
    menu: {
      root: {
        background: 'rgb(var(--popover))',
        borderColor: 'rgb(var(--border))',
        color: 'rgb(var(--popover-foreground))',
        borderRadius: 'var(--radius-md)',
      },
      item: {
        color: 'rgb(var(--popover-foreground))',
        focusBackground: 'rgb(var(--accent))',
        focusColor: 'rgb(var(--accent-foreground))',
      },
    },
    // Menubar - 顶栏横向导航，完全对齐 ThemeCssVars & SizeCssVars
    menubar: {
      root: {
        // 顶栏整体背景/边框由 AdminHeader 控制，这里保持透明
        background: 'transparent',
        borderColor: 'transparent',
        borderRadius: '0',
        // 使用全局前景色，确保在自定义 header 背景上有足够对比度
        color: 'rgb(var(--foreground))',
        gap: 'var(--spacing-sm)',
        // 水平 padding 略放大，使导航点击区更舒适
        padding: '0 var(--spacing-md)',
      },
      baseItem: {
        borderRadius: 'var(--radius-md)',
        // 顶栏主导航项：上下紧凑，左右略宽，符合 Size 系统的舒适模式
        padding: 'var(--spacing-xs) var(--spacing-sm)',
      },
      item: {
        // 方案 B：关闭 PT 背景，由 AdminHeader 自定义 renderer 完全控制，避免双层叠加
        focusBackground: 'transparent',
        activeBackground: 'transparent',
        focusColor: 'transparent',
        activeColor: 'transparent',
        color: 'rgb(var(--muted-foreground))',
        padding: '0',
        borderRadius: 'var(--radius-md)',
        gap: 'var(--spacing-sm)',
        icon: {
          color: 'rgb(var(--muted-foreground))',
          focusColor: 'transparent',
          activeColor: 'transparent',
        },
      },
      submenu: {
        // 下拉菜单：card 背景与 header 区分，radius-md 与 Menu 对齐；gap-md 增加项间呼吸感
        padding: 'var(--spacing-sm)',
        gap: 'var(--spacing-sm)',
        background: 'rgb(var(--card))',
        borderColor: 'rgb(var(--border))',
        borderWidth: '1px',
        borderRadius: 'var(--radius-md)',
        shadow: 'var(--shadow-lg)',
        mobileIndent: 'var(--spacing-md)',
        icon: {
          size: 'var(--font-size-sm)',
          color: 'rgb(var(--muted-foreground))',
          focusColor: 'transparent',
          activeColor: 'transparent',
        },
      },
      separator: {
        borderColor: 'rgb(var(--border))',
      },
      mobileButton: {
        borderRadius: '50%',
        // 移动端菜单按钮尺寸略收一档，避免在小屏顶部显得过于“膨胀”
        size: 'var(--spacing-xl)',
        color: 'rgb(var(--muted-foreground))',
        hoverColor: 'rgb(var(--foreground))',
        hoverBackground: 'rgb(var(--muted))',
        focusRing: {
          width: 'calc(var(--spacing-xs) / 2)',
          style: 'solid',
          color: 'rgb(var(--primary))',
          offset: 'calc(var(--spacing-xs) / 2)',
          shadow: 'none',
        },
      },
    },
    // Breadcrumb
    breadcrumb: {
      root: {
        background: 'transparent',
      },
      item: {
        color: 'rgb(var(--muted-foreground))',
      },
      itemLink: {
        color: 'rgb(var(--foreground))',
        hoverColor: 'rgb(var(--primary))',
      },
      separator: {
        color: 'rgb(var(--muted-foreground))',
      },
    },
    // Paginator
    paginator: {
      root: {
        background: 'transparent',
        borderColor: 'rgb(var(--border))',
      },
      current: {
        background: 'rgb(var(--secondary))',
        color: 'rgb(var(--secondary-foreground))',
      },
    },
    // Listbox - for PickList items and Select dropdowns
    listbox: {
      root: {
        background: 'rgb(var(--popover))',
        borderColor: 'rgb(var(--border))',
        color: 'rgb(var(--popover-foreground))',
      },
      option: {
        color: 'rgb(var(--popover-foreground))',
        focusBackground: 'rgb(var(--accent))',
        focusColor: 'rgb(var(--accent-foreground))',
        selectedBackground: 'rgb(var(--primary))',
        selectedColor: 'rgb(var(--primary-foreground))',
        selectedFocusBackground: 'rgb(var(--primary))',
        selectedFocusColor: 'rgb(var(--primary-foreground))',
      },
      optionGroup: {
        background: 'rgb(var(--popover))',
        color: 'rgb(var(--muted-foreground))',
      },
    },
    // MultiSelect
    multiselect: {
      root: {
        background: 'rgb(var(--background))',
        borderColor: 'rgb(var(--input))',
        hoverBorderColor: 'rgb(var(--primary))',
        focusBorderColor: 'rgb(var(--primary))',
        color: 'rgb(var(--foreground))',
        disabledBackground: 'rgb(var(--muted))',
        disabledColor: 'rgb(var(--muted-foreground))',
      },
      overlay: {
        background: 'rgb(var(--popover))',
        borderColor: 'rgb(var(--border))',
        color: 'rgb(var(--popover-foreground))',
        borderRadius: 'var(--radius-md)',
      },
      option: {
        color: 'rgb(var(--popover-foreground))',
        focusBackground: 'rgb(var(--accent))',
        focusColor: 'rgb(var(--accent-foreground))',
        selectedBackground: 'rgb(var(--primary))',
        selectedColor: 'rgb(var(--primary-foreground))',
      },
      optionGroup: {
        background: 'rgb(var(--popover))',
        color: 'rgb(var(--muted-foreground))',
      },
    },
    // CascadeSelect
    cascadeselect: {
      root: {
        background: 'rgb(var(--background))',
        borderColor: 'rgb(var(--input))',
        hoverBorderColor: 'rgb(var(--primary))',
        focusBorderColor: 'rgb(var(--primary))',
        color: 'rgb(var(--foreground))',
        disabledBackground: 'rgb(var(--muted))',
        disabledColor: 'rgb(var(--muted-foreground))',
      },
      overlay: {
        background: 'rgb(var(--popover))',
        borderColor: 'rgb(var(--border))',
        color: 'rgb(var(--popover-foreground))',
        borderRadius: 'var(--radius-md)',
      },
      list: {
        background: 'rgb(var(--popover))',
        borderColor: 'rgb(var(--border))',
      },
      option: {
        color: 'rgb(var(--popover-foreground))',
        focusBackground: 'rgb(var(--accent))',
        focusColor: 'rgb(var(--accent-foreground))',
      },
    },
    // Tree
    tree: {
      root: {
        transitionDuration: '{transition.duration}',
        padding: 'var(--spacing-xs)',
      },
      node: {
        padding: '0.25rem 0.5rem',
        borderRadius: '{content.border.radius}',
        hoverBackground: '{content.hover.background}',
        selectedBackground: '{highlight.background}',
        color: '{text.color}',
        hoverColor: '{text.hover.color}',
        selectedColor: '{highlight.color}',
        focusRing: {
          width: '{focus.ring.width}',
          style: '{focus.ring.style}',
          color: '{focus.ring.color}',
          offset: '-1px',
          shadow: '{focus.ring.shadow}',
        },
      },
    },
    // TreeSelect
    treeselect: {
      root: {
        background: 'rgb(var(--background))',
        borderColor: 'rgb(var(--input))',
        hoverBorderColor: 'rgb(var(--primary))',
        focusBorderColor: 'rgb(var(--primary))',
        color: 'rgb(var(--foreground))',
        disabledBackground: 'rgb(var(--muted))',
        disabledColor: 'rgb(var(--muted-foreground))',
      },
      overlay: {
        background: 'rgb(var(--popover))',
        borderColor: 'rgb(var(--border))',
        color: 'rgb(var(--popover-foreground))',
        borderRadius: 'var(--radius-md)',
      },
      tree: {
        root: {
          background: 'rgb(var(--popover))',
        },
        node: {
          color: 'rgb(var(--popover-foreground))',
          hoverBackground: 'rgb(var(--accent))',
          selectedBackground: 'rgb(var(--primary))',
          selectedColor: 'rgb(var(--primary-foreground))',
        },
      },
    },
    // AutoComplete
    autocomplete: {
      root: {
        background: 'rgb(var(--background))',
        borderColor: 'rgb(var(--input))',
        hoverBorderColor: 'rgb(var(--primary))',
        focusBorderColor: 'rgb(var(--primary))',
        color: 'rgb(var(--foreground))',
        disabledBackground: 'rgb(var(--muted))',
        disabledColor: 'rgb(var(--muted-foreground))',
      },
      overlay: {
        background: 'rgb(var(--popover))',
        borderColor: 'rgb(var(--border))',
        color: 'rgb(var(--popover-foreground))',
        borderRadius: 'var(--radius-md)',
      },
      list: {
        background: 'rgb(var(--popover))',
        borderColor: 'rgb(var(--border))',
      },
      option: {
        color: 'rgb(var(--popover-foreground))',
        focusBackground: 'rgb(var(--accent))',
        focusColor: 'rgb(var(--accent-foreground))',
        selectedBackground: 'rgb(var(--primary))',
        selectedColor: 'rgb(var(--primary-foreground))',
      },
      colorScheme: {
        light: {
          dropdown: {
            // 容器背景：与输入框保持一致
            background: 'rgb(var(--background))',
            hoverBackground: 'rgb(var(--muted))',
            activeBackground: 'rgb(var(--muted))',
            // 箭头图标颜色：默认次要，悬停/按下提升对比度
            color: 'rgb(var(--muted-foreground))',
            hoverColor: 'rgb(var(--foreground))',
            activeColor: 'rgb(var(--foreground))',
          },
        },
        dark: {
          dropdown: {
            background: 'rgb(var(--background))',
            hoverBackground: 'rgb(var(--muted))',
            activeBackground: 'rgb(var(--muted))',
            color: 'rgb(var(--muted-foreground))',
            hoverColor: 'rgb(var(--foreground))',
            activeColor: 'rgb(var(--foreground))',
          },
        },
      },
    },
    // Password (Input styles) + Overlay
    password: {
      root: {
        borderColor: 'rgb(var(--input))',
        hoverBorderColor: 'rgb(var(--primary))',
        focusBorderColor: 'rgb(var(--primary))',
        disabledBackground: 'rgb(var(--muted))',
        disabledColor: 'rgb(var(--muted-foreground))',
      },
      overlay: {
        background: 'rgb(var(--popover))',
        borderColor: 'rgb(var(--border))',
        color: 'rgb(var(--popover-foreground))',
      },
      strengthMeter: {
        background: 'rgb(var(--muted))',
      },
    },
    // DatePicker / Calendar
    datepicker: {
      root: {
        background: 'rgb(var(--background))',
        borderColor: 'rgb(var(--input))',
        hoverBorderColor: 'rgb(var(--primary))',
        focusBorderColor: 'rgb(var(--primary))',
        color: 'rgb(var(--foreground))',
        disabledBackground: 'rgb(var(--muted))',
        disabledColor: 'rgb(var(--muted-foreground))',
      },
      panel: {
        background: 'rgb(var(--popover))',
        borderColor: 'rgb(var(--border))',
        color: 'rgb(var(--popover-foreground))',
      },
      header: {
        background: 'rgb(var(--popover))',
        borderColor: 'rgb(var(--border))',
        color: 'rgb(var(--popover-foreground))',
      },
      dayView: {
        header: {
          color: 'rgb(var(--muted-foreground))',
        },
      },
      date: {
        color: 'rgb(var(--popover-foreground))',
        hoverBackground: 'rgb(var(--accent))',
        hoverColor: 'rgb(var(--accent-foreground))',
        selectedBackground: 'rgb(var(--primary))',
        selectedColor: 'rgb(var(--primary-foreground))',
      },
    },
    // OrderList
    orderlist: {
      root: {
        background: 'transparent',
      },
      controls: {
        background: 'transparent',
      },
      list: {
        background: 'rgb(var(--background))',
        borderColor: 'rgb(var(--border))',
        color: 'rgb(var(--foreground))',
      },
      header: {
        background: 'rgb(var(--muted))',
        borderColor: 'rgb(var(--border))',
        color: 'rgb(var(--foreground))',
        padding: 'var(--spacing-xs) var(--spacing-sm)',
      },
      option: {
        color: 'rgb(var(--foreground))',
        focusBackground: 'rgb(var(--accent))',
        focusColor: 'rgb(var(--accent-foreground))',
      },
    },
    // PickList
    picklist: {
      root: {
        background: 'transparent',
      },
      list: {
        background: 'rgb(var(--background))',
        borderColor: 'rgb(var(--border))',
        color: 'rgb(var(--foreground))',
      },
      header: {
        background: 'rgb(var(--muted))',
        borderColor: 'rgb(var(--border))',
        color: 'rgb(var(--foreground))',
        padding: 'var(--spacing-xs) var(--spacing-sm)',
      },
      option: {
        color: 'rgb(var(--foreground))',
        focusBackground: 'rgb(var(--accent))',
        focusColor: 'rgb(var(--accent-foreground))',
      },
      controls: {
        background: 'transparent',
      },
    },
    // Tooltip
    tooltip: {
      root: {
        background: 'rgb(var(--primary))',
        color: 'rgb(var(--primary-foreground))',
      },
    },
    // Message
    message: {
      root: {
        borderColor: 'rgb(var(--border))',
      },
      text: {
        // 兜底文字色：高对比前景色
        color: 'rgb(var(--foreground))',
      },
      icon: {
        color: 'rgb(var(--foreground))',
      },
    },
    // Toast - 深色模式使用语义色统一配置 (toastDarkSemantic)
    // Tag
    tag: {
      root: {
        color: 'rgb(var(--primary-foreground))',
      },
    },
    // Chip (used by InputChips tags and standalone Chip)
    chip: {
      colorScheme: {
        light: {
          root: {
            background: 'rgb(var(--secondary))',
            color: 'rgb(var(--secondary-foreground))',
          },
          icon: {
            color: 'rgb(var(--secondary-foreground))',
          },
          removeIcon: {
            color: 'rgb(var(--secondary-foreground))',
          },
        },
        dark: {
          root: {
            background: 'rgb(var(--secondary))',
            color: 'rgb(var(--secondary-foreground))',
          },
          icon: {
            color: 'rgb(var(--secondary-foreground))',
          },
          removeIcon: {
            color: 'rgb(var(--secondary-foreground))',
          },
        },
      },
    },
    // Badge
    badge: {
      root: {
        color: 'rgb(var(--primary-foreground))',
      },
    },
    // ToggleButton
    togglebutton: {
      colorScheme: {
        light: {
          root: {
            background: 'rgb(var(--secondary))',
            borderColor: 'rgb(var(--input))',
            color: 'rgb(var(--secondary-foreground))',
            hoverBackground: 'rgb(var(--accent))',
            hoverBorderColor: 'rgb(var(--primary))',
            checkedBackground: 'rgb(var(--primary))',
            checkedBorderColor: 'rgb(var(--primary))',
            checkedColor: 'rgb(var(--primary-foreground))',
            checkedHoverBackground: 'rgb(var(--primary-hover))',
          },
          icon: {
            color: 'rgb(var(--secondary-foreground))',
            hoverColor: 'rgb(var(--accent-foreground))',
            checkedColor: 'rgb(var(--primary-foreground))',
          },
          content: {
            checkedBackground: 'transparent',
          },
        },
        dark: {
          root: {
            background: 'rgb(var(--secondary))',
            borderColor: 'rgb(var(--input))',
            color: 'rgb(var(--foreground))',
            hoverBackground: 'rgb(var(--accent))',
            hoverBorderColor: 'rgb(var(--border))',
            hoverColor: 'rgb(var(--foreground))',
            checkedBackground: 'rgb(var(--primary))',
            checkedBorderColor: 'rgb(var(--primary))',
            checkedColor: 'rgb(var(--primary-foreground))',
            checkedHoverBackground: 'rgb(var(--primary-hover))',
          },
          icon: {
            color: 'rgb(var(--foreground))',
            hoverColor: 'rgb(var(--accent-foreground))',
            checkedColor: 'rgb(var(--primary-foreground))',
          },
          content: {
            // 普通状态文字：略弱一点的中性前景
            color: 'rgb(var(--muted-foreground))',
            // 悬停时文字：提升为高对比前景色 -> 更明显
            hoverColor: 'rgb(var(--foreground))',
            // 选中项文字：仍用主色前景
            checkedColor: 'rgb(var(--primary-foreground))',
            // 保留原来的 checked 背景设置
            checkedBackground: 'transparent',
          },
        },
      },
    },

    // SplitButton
    splitbutton: {
      root: {
        borderRadius: 'var(--radius-md)',
      },
      button: {
        // Inherits from regular Button, generally fine
      },
      menu: {
        // Dropdown menu follows Menu/Popover styles
      },
    },
    // TieredMenu：使用 ThemeCssVars，确保 active 项文字对比度
    tieredmenu: {
      root: {
        background: 'rgb(var(--card))',
        borderColor: 'rgb(var(--border))',
        color: 'rgb(var(--foreground))',
        borderRadius: 'var(--radius-md)',
      },
      list: {
        padding: 'var(--spacing-xs)',
        gap: 'var(--spacing-xs)',
      },
      item: {
        focusBackground: 'rgb(var(--accent-light))',
        activeBackground: 'rgb(var(--accent))',
        color: 'rgb(var(--foreground))',
        focusColor: 'rgb(var(--accent-light-foreground))',
        activeColor: 'rgb(var(--accent-foreground))',
        padding: 'var(--spacing-sm) var(--spacing-md)',
        borderRadius: 'var(--radius-sm)',
        gap: 'var(--spacing-sm)',
        icon: {
          color: 'rgb(var(--muted-foreground))',
          focusColor: 'rgb(var(--accent-light-foreground))',
          activeColor: 'rgb(var(--accent-foreground))',
        },
      },
      submenuIcon: {
        color: 'rgb(var(--muted-foreground))',
        focusColor: 'rgb(var(--accent-light-foreground))',
        activeColor: 'rgb(var(--accent-foreground))',
      },
      separator: {
        borderColor: 'rgb(var(--border))',
      },
    },
    // PanelMenu：rootList / submenu 统一 gap，保证多级菜单均有纵向间距
    panelmenu: {
      root: {
        gap: 'var(--spacing-xs)',
      },
      panel: {
        background: 'transparent',
        borderColor: 'transparent',
        borderWidth: '0',
      },
      header: {
        background: 'transparent',
        borderColor: 'transparent',
        color: 'rgb(var(--foreground))',
        hoverBackground: 'rgb(var(--accent))',
        hoverColor: 'rgb(var(--accent-foreground))',
        focusBackground: 'rgb(var(--accent))',
        activeBackground: 'transparent', // Usually keep transparent and jsut rotate icon
        borderRadius: 'var(--radius-md)',
      },
      content: {
        background: 'transparent',
        borderColor: 'transparent',
        color: 'rgb(var(--foreground))',
        padding: 'var(--spacing-xs) var(--spacing-sm)',
      },
      rootList: {
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--spacing-xs)',
      },
      submenu: {
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--spacing-xs)',
      },
      item: {
        color: 'rgb(var(--foreground))',
        focusBackground: 'rgb(var(--accent))',
        focusColor: 'rgb(var(--accent-foreground))',
      },
    },
    // TabMenu - 圆角系统融合
    tabmenu: {
      root: {
        background: 'transparent',
        borderColor: 'rgb(var(--border))',
      },
      tablist: {
        borderRadius: 'var(--radius-md)',
      },
      item: {
        background: 'transparent',
        borderColor: 'transparent',
        color: 'rgb(var(--muted-foreground))',
        hoverBackground: 'rgb(var(--accent))',
        hoverColor: 'rgb(var(--accent-foreground))',
        activeBackground: 'transparent',
        activeBorderColor: 'rgb(var(--primary))',
        activeColor: 'rgb(var(--primary))',
        borderRadius: 'var(--radius-sm)',
      },
    },
    // Steps - 圆角系统融合
    steps: {
      root: {
        background: 'transparent',
        borderRadius: 'var(--radius-md)',
      },
      item: {
        // Number/Icon
      },
      separator: {
        borderColor: 'rgb(var(--border))',
      },
    },
    // OverlayPanel
    overlaypanel: {
      root: {
        background: 'rgb(var(--popover))',
        borderColor: 'rgb(var(--border))',
        color: 'rgb(var(--popover-foreground))',
        borderRadius: 'var(--radius-md)',
      },
    },
  }

  // ──────────────────────────────────────────────────────────────────────────
  // 5. FINAL ASSEMBLY: 通过definePreset合并所有层级
  // ──────────────────────────────────────────────────────────────────────────
  const basePreset = definePreset(Aura, {
    primitive: primitiveColors,
    semantic: semanticColors,
    components: componentColors,
  })

  // ──────────────────────────────────────────────────────────────────────────
  // 6. 全局圆角统一为 md (仅 borderRadius)：全站一致，含 overlay.modal；避免整树强制 padding/gap 等过松
  //    间距与字号由 Aura 默认 + semantic (formField/list/overlay) + 组件覆盖 分层控制
  // ──────────────────────────────────────────────────────────────────────────
  const globalSizeTokens: Record<string, string> = {
    borderRadius: 'var(--radius-md)',
  }
  const resultPreset = deepMergeStylesAdvanced(basePreset, globalSizeTokens, {
    deepMerge: true,
    override: true,
  }) as Record<string, any>

  // 不对 root.sm/root.lg 注入的组件（无尺寸模式或完全自定义尺寸）
  const ROOT_SIZE_EXCLUDE = new Set<string>([
    'tag',
    'badge',
    'divider',
    'stepper',
    'breadcrumb',
    'paginator',
    'confirmpopup',
    'overlaypanel',
    'tooltip',
    'message',
    'toast',
    'colorpicker',
  ])

  // 7. 遮罩统一：全 preset 内 mask.background 与架构变量一致
  deepFindAndReplaceProperty(
    resultPreset,
    'mask',
    'background',
    'rgb(var(--muted-foreground) / 0.25)'
  )

  // 8. root.sm / root.lg 默认对所有有 root 的组件补全，仅排除 ROOT_SIZE_EXCLUDE
  const { sm: rootSm, md: rootMd, lg: rootLg } = getRootSizeTokensByMode(sizeStore.sizeName)
  const components = resultPreset.components
  if (components && typeof components === 'object') {
    for (const [name, config] of Object.entries(components)) {
      if (ROOT_SIZE_EXCLUDE.has(name)) continue
      const c = config as Record<string, any> | null
      if (c && typeof c === 'object' && c.root != null) {
        c.root = c.root || {}
        c.root.sm = c.root.sm || {}
        c.root.lg = c.root.lg || {}

        // 仅在组件未定义对应字段时补充，避免覆盖 Aura/组件自身的精细配置
        for (const [key, value] of Object.entries(rootSm)) {
          if (!(key in c.root.sm)) {
            c.root.sm[key] = value
          }
        }
        for (const [key, value] of Object.entries(rootMd)) {
          if (!(key in c.root)) {
            c.root[key] = value
          }
        }
        for (const [key, value] of Object.entries(rootLg)) {
          if (!(key in c.root.lg)) {
            c.root.lg[key] = value
          }
        }
      }
    }
  }

  // 9. Message 深色：与架构语义色完全对齐（background / border / color / closeButton）
  const messageDarkSemantic = {
    info: {
      background: 'rgb(var(--info))',
      borderColor: 'rgb(var(--info))',
      color: 'rgb(var(--info-foreground))',
      closeButton: {
        hoverBackground: 'rgb(var(--muted-foreground) / 0.1)',
        focusRing: { color: 'rgb(var(--info))' },
      },
    },
    success: {
      background: 'rgb(var(--success))',
      borderColor: 'rgb(var(--success))',
      color: 'rgb(var(--success-foreground))',
      closeButton: {
        hoverBackground: 'rgb(var(--muted-foreground) / 0.1)',
        focusRing: { color: 'rgb(var(--success))' },
      },
    },
    warn: {
      background: 'rgb(var(--warn))',
      borderColor: 'rgb(var(--warn))',
      color: 'rgb(var(--warn-foreground))',
      closeButton: {
        hoverBackground: 'rgb(var(--muted-foreground) / 0.1)',
        focusRing: { color: 'rgb(var(--warn))' },
      },
    },
    error: {
      background: 'rgb(var(--danger))',
      borderColor: 'rgb(var(--danger))',
      color: 'rgb(var(--danger-foreground))',
      closeButton: {
        hoverBackground: 'rgb(var(--muted-foreground) / 0.1)',
        focusRing: { color: 'rgb(var(--danger))' },
      },
    },
    secondary: {
      background: 'rgb(var(--secondary))',
      borderColor: 'rgb(var(--secondary))',
      color: 'rgb(var(--secondary-foreground))',
      closeButton: {
        hoverBackground: 'rgb(var(--muted-foreground) / 0.1)',
        focusRing: { color: 'rgb(var(--secondary))' },
      },
    },
    contrast: {
      background: 'rgb(var(--foreground))',
      borderColor: 'rgb(var(--foreground))',
      color: 'rgb(var(--background))',
      closeButton: {
        hoverBackground: 'rgb(var(--background) / 0.15)',
        focusRing: { color: 'rgb(var(--foreground))' },
      },
    },
  }
  if (components?.message) {
    deepMergeStylesAdvancedInPlace(components.message, {
      colorScheme: { dark: messageDarkSemantic },
    })
  }

  // 10. Toast 深色：与架构语义色完全对齐（background / border / color / detailColor / closeButton）
  const toastDarkSemantic = {
    info: {
      background: 'rgb(var(--info))',
      borderColor: 'rgb(var(--info))',
      color: 'rgb(var(--info-foreground))',
      detailColor: 'rgb(var(--info-foreground))',
      closeButton: {
        hoverBackground: 'rgb(var(--muted-foreground) / 0.1)',
        focusRing: { color: 'rgb(var(--info))' },
      },
    },
    success: {
      background: 'rgb(var(--success))',
      borderColor: 'rgb(var(--success))',
      color: 'rgb(var(--success-foreground))',
      detailColor: 'rgb(var(--success-foreground))',
      closeButton: {
        hoverBackground: 'rgb(var(--muted-foreground) / 0.1)',
        focusRing: { color: 'rgb(var(--success))' },
      },
    },
    warn: {
      background: 'rgb(var(--warn))',
      borderColor: 'rgb(var(--warn))',
      color: 'rgb(var(--warn-foreground))',
      detailColor: 'rgb(var(--warn-foreground))',
      closeButton: {
        hoverBackground: 'rgb(var(--muted-foreground) / 0.1)',
        focusRing: { color: 'rgb(var(--warn))' },
      },
    },
    error: {
      background: 'rgb(var(--danger))',
      borderColor: 'rgb(var(--danger))',
      color: 'rgb(var(--danger-foreground))',
      detailColor: 'rgb(var(--danger-foreground))',
      closeButton: {
        hoverBackground: 'rgb(var(--muted-foreground) / 0.1)',
        focusRing: { color: 'rgb(var(--danger))' },
      },
    },
    secondary: {
      background: 'rgb(var(--secondary))',
      borderColor: 'rgb(var(--secondary))',
      color: 'rgb(var(--secondary-foreground))',
      detailColor: 'rgb(var(--secondary-foreground))',
      closeButton: {
        hoverBackground: 'rgb(var(--muted-foreground) / 0.1)',
        focusRing: { color: 'rgb(var(--secondary))' },
      },
    },
    contrast: {
      background: 'rgb(var(--foreground))',
      borderColor: 'rgb(var(--foreground))',
      color: 'rgb(var(--background))',
      detailColor: 'rgb(var(--background))',
      closeButton: {
        hoverBackground: 'rgb(var(--background) / 0.15)',
        focusRing: { color: 'rgb(var(--foreground))' },
      },
    },
  }
  if (components?.toast) {
    deepMergeStylesAdvancedInPlace(components.toast, {
      // 内边距：使用语义 spacing 替代 overlay.popover.padding，更紧凑
      content: {
        padding: 'var(--spacing-sm) var(--spacing-xs) var(--spacing-sm) var(--spacing-sm)',
      },
      // 关闭按钮贴右上角
      colorScheme: { dark: toastDarkSemantic },
    })
  }

  return resultPreset
}
