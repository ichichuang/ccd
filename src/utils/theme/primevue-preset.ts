import { definePreset } from '@primevue/themes'
import Aura from '@primevue/themes/aura'
import type { useSizeStore } from '@/stores/modules/size'
import { deepMergeStylesAdvanced } from './primevue-theme-engine'
import { generateColorScale, generateBorderRadiusScale } from './primevue-theme-helpers'

// -----------------------------------------------------------------------------
// 🎨 Color Palette Adapter
// Adapts the Hex-based ColorStore interface from the reference implementation
// to CCD's CSS Variable system.
// -----------------------------------------------------------------------------

const getVar = (name: string) => `var(--${name})`
const getRgbVar = (name: string) => `rgb(var(--${name}))`

/**
 * Creates a "Virtual Color Store" that returns CSS variable references
 * matching the interface expected by the ported preset logic.
 */
const createColorAdapter = () => {
  return {
    // Basic backgrounds
    getBg100: getRgbVar('background'), // Default bg
    getBg200: getRgbVar('muted'), // Secondary/Hover bg
    getBg300: getVar('border'), // Border color equivalent

    // Text colors
    getText100: getRgbVar('foreground'),
    getText200: getRgbVar('muted-foreground'),

    // Primary
    getPrimaryColor: getRgbVar('primary'),
    getPrimaryColorText: getRgbVar('primary-foreground'),
    getPrimaryColorHover: getRgbVar('primary-hover'),
    getPrimaryColorActive: getRgbVar('primary-hover'), // Mapping active to hover for simplicity if no dedicated var
    getPrimaryColorBorder: getRgbVar('primary'),

    // Secondary (Muted/Secondary in CCD)
    getSecondaryColor: getRgbVar('secondary'),
    getSecondaryColorText: getRgbVar('secondary-foreground'),
    getSecondaryColorHover: getRgbVar('secondary'), // Secondary usually static
    getSecondaryColorActive: getRgbVar('secondary'),

    // Accent
    getAccentColor: getRgbVar('accent'),
    getAccentColorText: getRgbVar('accent-foreground'),

    // Status: Info (Mapped to Primary for CCD as simpler system)
    getInfoColor: getRgbVar('primary'),
    getInfoColorText: getRgbVar('primary-foreground'),
    getInfoColorHover: getRgbVar('primary-hover'),
    getInfoColorActive: getRgbVar('primary-hover'),

    // Status: Success
    getSuccessColor: getRgbVar('success'),
    getSuccessColorText: getRgbVar('success-foreground'),
    getSuccessColorHover: getRgbVar('success-hover'),
    getSuccessColorActive: getRgbVar('success-hover'),

    // Status: Warn
    getWarnColor: getRgbVar('warn'),
    getWarnColorText: getRgbVar('warn-foreground'),
    getWarnColorHover: getRgbVar('warn-hover'),
    getWarnColorActive: getRgbVar('warn-hover'),

    // Status: Danger/Destructive
    getDangerColor: getRgbVar('destructive'),
    getDangerColorText: getRgbVar('destructive-foreground'),
    getDangerColorHover: getRgbVar('destructive-hover'),
    getDangerColorActive: getRgbVar('destructive-hover'),

    // Contrast
    getContrastColor: getRgbVar('foreground'),
    getContrastColorText: getRgbVar('background'),
    getContrastColorHover: getRgbVar('foreground'),
    getContrastColorActive: getRgbVar('foreground'),

    // Utility 100/200 placeholders if needed
    getPrimary100: getRgbVar('primary'),
    getAccent100: getRgbVar('accent'),
    getAccent200: getRgbVar('accent'),
  }
}

// -----------------------------------------------------------------------------
// 🧩 Component Color Scheme Logic
// Ported from AUDS-new/utils/modules/primevuepreset.ts
// -----------------------------------------------------------------------------

type ColorAdapter = ReturnType<typeof createColorAdapter>

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
    // Dynamic key access for adapter
    const get = (suffix: string) => {
      const key = `get${colorType}Color${suffix}` as keyof ColorAdapter
      return colors[key] || colors[`get${colorType}Color` as keyof ColorAdapter]
    }

    switch (type) {
      case 'outlined':
        return {
          hoverBackground: colorType === 'Secondary' ? get('') : get('Text'), // Inverted logic for compatibility
          activeBackground: colorType === 'Secondary' ? get('') : get('Active'),
          borderColor: colorType === 'Secondary' ? get('Text') : get(''),
          color: colorType === 'Secondary' ? get('Text') : get(''),
          // Background is transparent by default in Aura for outlined
        }
      case 'text':
        return {
          hoverBackground: colorType === 'Secondary' ? get('') : get('Text'),
          activeBackground: colorType === 'Secondary' ? get('') : get('Text'),
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
    help: getColorOptions('Warn'), // Fallback for Help
    danger: getColorOptions('Danger'),
    contrast: getColorOptions('Contrast'),
  }
}

// -----------------------------------------------------------------------------
// 🛠 Custom Preset Factory
// -----------------------------------------------------------------------------

export const createCustomPreset = (_sizeStore: ReturnType<typeof useSizeStore>) => {
  const colors = createColorAdapter()

  // ──────────────────────────────────────────────────────────────────────────
  // 1. PRIMITIVE LAYER: 建立CSS变量 → Token的映射
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

    // 状态色 - Error/Destructive
    error: {
      ...generateColorScale('destructive', { hasHover: true }),
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
    // 全局配置
    transitionDuration: '0.2s',
    focusRing: {
      width: '2px',
      style: 'solid',
      color: '{brand.500}', // 使用Token引用
      offset: '2px',
      shadow: 'none',
    },
    disabledOpacity: '0.6',
    iconSize: '1rem',
    anchorGutter: '0',

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

        // Form Field (表单字段)
        formField: {
          background: '{surface.0}',
          disabledBackground: '{surface.200}',
          filledBackground: '{surface.50}',
          filledHoverBackground: '{surface.50}',
          filledFocusBackground: '{surface.50}',
          borderColor: '{surface.300}',
          hoverBorderColor: '{surface.400}',
          focusBorderColor: '{brand.500}',
          invalidBorderColor: '{error.500}',
          color: '{surface.700}',
          disabledColor: '{surface.500}',
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

        // Form Field (暗色模式表单字段)
        formField: {
          background: 'rgb(var(--background))', // 暗色背景
          disabledBackground: '{surface.700}',
          filledBackground: '{surface.800}',
          filledHoverBackground: '{surface.800}',
          filledFocusBackground: '{surface.800}',
          borderColor: 'rgb(var(--border))',
          hoverBorderColor: '{brand.400}',
          focusBorderColor: '{brand.400}',
          invalidBorderColor: '{error.400}',
          color: 'rgb(var(--foreground))',
          disabledColor: '{surface.400}',
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
  // 3. SIZE CONFIGURATION: 全局尺寸配置
  // ──────────────────────────────────────────────────────────────────────────
  const customSize = {
    borderRadius: 'var(--radius)',
    gap: 'var(--spacing-sm)',
    padding: 'var(--spacing-sm)',
  }

  // ──────────────────────────────────────────────────────────────────────────
  // 4. COMPONENT LAYER: 仅保留必要的组件特定覆盖
  //    大部分组件现在通过Token引用自动继承样式
  // ──────────────────────────────────────────────────────────────────────────
  const componentColors = {
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
            background: colors.getBg100, // Dynamic background
            borderColor: 'rgb(var(--input))', // Consistent with input border
            hoverBorderColor: colors.getPrimaryColor,
            checkedBackground: colors.getPrimaryColor,
            checkedBorderColor: colors.getPrimaryColor,
            checkedHoverBackground: colors.getPrimaryColorHover,
          },
          icon: {
            color: colors.getPrimaryColorText,
          },
        },
        dark: {
          root: {
            background: colors.getBg100, // Matches background in dark mode
            borderColor: 'rgb(var(--input))',
            hoverBorderColor: colors.getPrimaryColor,
            checkedBackground: colors.getPrimaryColor,
            checkedBorderColor: colors.getPrimaryColor,
            checkedHoverBackground: colors.getPrimaryColorHover,
          },
          icon: {
            color: colors.getPrimaryColorText,
          },
        },
      },
    },
    // RadioButton - colorScheme structure for light/dark mode backgrounds and borders
    radiobutton: {
      colorScheme: {
        light: {
          root: {
            background: colors.getBg100,
            borderColor: 'rgb(var(--input))',
            hoverBorderColor: colors.getPrimaryColor,
            checkedBackground: colors.getPrimaryColor,
            checkedBorderColor: colors.getPrimaryColor,
          },
          icon: {
            background: colors.getPrimaryColor,
            checkedHoverBackground: colors.getPrimaryColorHover,
          },
        },
        dark: {
          root: {
            background: colors.getBg100,
            borderColor: 'rgb(var(--input))',
            hoverBorderColor: colors.getPrimaryColor,
            checkedBackground: colors.getPrimaryColor,
            checkedBorderColor: colors.getPrimaryColor,
          },
          icon: {
            background: colors.getPrimaryColor,
            checkedHoverBackground: colors.getPrimaryColorHover,
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
            background: 'rgb(var(--card))',
            hoverBackground: 'rgb(var(--card))',
            // 开启状态：回到背景色，在主色轨道上形成浅色圆点
            checkedBackground: 'rgb(var(--background))',
            checkedHoverBackground: 'rgb(var(--background))',
          },
        },
        dark: {
          root: {
            // 暗色下关闭状态：同样用 muted，较背景更亮一档，避免“隐身”
            background: 'rgb(var(--muted))',
            hoverBackground: 'rgb(var(--muted))',
            checkedBackground: 'rgb(var(--primary))',
            checkedHoverBackground: 'rgb(var(--primary-hover))',
          },
          handle: {
            // 深色模式下手柄用背景色，落在略亮的 muted 轨道上，有清晰对比
            background: 'rgb(var(--background))',
            hoverBackground: 'rgb(var(--background))',
            checkedBackground: 'rgb(var(--background))',
            checkedHoverBackground: 'rgb(var(--background))',
          },
        },
      },
    },
    // DataTable - use colorScheme for proper dark mode text colors
    datatable: {
      colorScheme: {
        light: {
          headerCell: {
            background: 'rgb(var(--background))',
            borderColor: 'rgb(var(--muted))',
            color: 'rgb(var(--foreground))',
          },
          bodyCell: {
            borderColor: 'rgb(var(--muted))',
            color: 'rgb(var(--foreground))',
          },
          row: {
            background: 'rgb(var(--background))',
            hoverBackground: 'rgb(var(--muted))',
            stripedBackground: 'rgb(var(--muted))',
          },
          footerCell: {
            background: 'rgb(var(--background))',
            borderColor: 'rgb(var(--muted))',
            color: 'rgb(var(--foreground))',
          },
        },
        dark: {
          headerCell: {
            background: 'rgb(var(--background))',
            borderColor: 'rgb(var(--muted))',
            color: 'rgb(var(--foreground))',
          },
          bodyCell: {
            borderColor: 'rgb(var(--muted))',
            color: 'rgb(var(--foreground))',
          },
          row: {
            background: 'rgb(var(--background))',
            hoverBackground: 'rgb(var(--muted))',
            stripedBackground: 'rgb(var(--muted))',
          },
          footerCell: {
            background: 'rgb(var(--background))',
            borderColor: 'rgb(var(--muted))',
            color: 'rgb(var(--foreground))',
          },
        },
      },
    },
    // Tabs - use colorScheme for proper dark mode
    tabs: {
      colorScheme: {
        light: {
          tablist: {
            borderColor: 'rgb(var(--muted))',
          },
          tab: {
            color: 'rgb(var(--muted-foreground))',
            hoverColor: 'rgb(var(--foreground))',
            activeColor: 'rgb(var(--primary))',
          },
          activeBar: {
            background: 'rgb(var(--primary))',
          },
          tabpanel: {
            background: 'rgb(var(--background))',
            color: 'rgb(var(--foreground))',
          },
        },
        dark: {
          tablist: {
            borderColor: 'rgb(var(--muted))',
          },
          tab: {
            color: 'rgb(var(--muted-foreground))',
            hoverColor: 'rgb(var(--foreground))',
            activeColor: 'rgb(var(--primary))',
          },
          activeBar: {
            background: 'rgb(var(--primary))',
          },
          tabpanel: {
            background: 'rgb(var(--background))',
            color: 'rgb(var(--foreground))',
          },
        },
      },
    },
    // Accordion - use colorScheme for proper dark mode
    accordion: {
      colorScheme: {
        light: {
          header: {
            background: 'rgb(var(--background))',
            borderColor: 'rgb(var(--muted))',
            color: 'rgb(var(--foreground))',
            hoverBackground: 'rgb(var(--muted))',
          },
          content: {
            background: 'rgb(var(--background))',
            borderColor: 'rgb(var(--muted))',
            color: 'rgb(var(--foreground))',
          },
        },
        dark: {
          header: {
            background: 'rgb(var(--background))',
            borderColor: 'rgb(var(--muted))',
            color: 'rgb(var(--foreground))',
            hoverBackground: 'rgb(var(--muted))',
          },
          content: {
            background: 'rgb(var(--background))',
            borderColor: 'rgb(var(--muted))',
            color: 'rgb(var(--foreground))',
          },
        },
      },
    },
    // Panel - use colorScheme for proper dark mode
    panel: {
      colorScheme: {
        light: {
          header: {
            background: 'rgb(var(--background))',
            borderColor: 'rgb(var(--muted))',
            color: 'rgb(var(--foreground))',
          },
          content: {
            background: 'rgb(var(--background))',
            borderColor: 'rgb(var(--muted))',
            color: 'rgb(var(--foreground))',
          },
        },
        dark: {
          header: {
            background: 'rgb(var(--background))',
            borderColor: 'rgb(var(--muted))',
            color: 'rgb(var(--foreground))',
          },
          content: {
            background: 'rgb(var(--background))',
            borderColor: 'rgb(var(--muted))',
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
            borderColor: 'rgb(var(--muted))',
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
            borderColor: 'rgb(var(--muted))',
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
            borderColor: 'rgb(var(--muted))',
            color: 'rgb(var(--foreground))',
          },
          content: {
            borderColor: 'rgb(var(--muted))',
            color: 'rgb(var(--foreground))',
          },
        },
        dark: {
          legend: {
            background: 'rgb(var(--background))',
            borderColor: 'rgb(var(--muted))',
            color: 'rgb(var(--foreground))',
          },
          content: {
            borderColor: 'rgb(var(--muted))',
            color: 'rgb(var(--foreground))',
          },
        },
      },
    },
    // Divider - soft
    divider: {
      borderColor: colors.getBg200,
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
        borderRadius: 'var(--radius)',
      },
    },
    // ColorPicker
    colorpicker: {
      root: {
        background: 'rgb(var(--background))',
        borderColor: 'rgb(var(--input))',
        color: 'rgb(var(--foreground))',
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
        background: 'rgb(var(--muted))',
      },
      range: {
        // 已选中轨道：使用主品牌色
        background: 'rgb(var(--primary))',
      },
      handle: {
        // 外圈：与背景更贴近，形成轻微浮起感
        background: 'rgb(var(--background))',
        hoverBackground: 'rgb(var(--primary-light))',
        content: {
          // 内芯：主品牌色，作为视觉焦点
          background: 'rgb(var(--primary))',
          hoverBackground: 'rgb(var(--primary-hover))',
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
        borderRadius: 'var(--radius)',
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
        borderRadius: 'var(--radius)', // 与其他卡片、Popover 保持一致
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
        // 布局相关依然使用原有 gap/padding（可以不覆写）
        // gap: '0.5rem',
        // padding: '...'
      },
    },
    // Menu
    menu: {
      root: {
        background: 'rgb(var(--popover))',
        borderColor: 'rgb(var(--border))',
        color: 'rgb(var(--popover-foreground))',
        borderRadius: 'var(--radius)',
      },
      item: {
        color: 'rgb(var(--popover-foreground))',
        focusBackground: 'rgb(var(--accent))',
        focusColor: 'rgb(var(--accent-foreground))',
      },
    },
    // Menubar
    menubar: {
      root: {
        background: 'rgb(var(--background))',
        borderColor: 'rgb(var(--border))',
      },
      item: {
        color: 'rgb(var(--foreground))',
        focusBackground: 'rgb(var(--accent))',
        focusColor: 'rgb(var(--accent-foreground))',
        activeBackground: 'rgb(var(--accent))',
        activeColor: 'rgb(var(--accent-foreground))',
        borderRadius: 'var(--radius)',
        overflow: 'hidden', // Fix ripple overflow
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
      },
      overlay: {
        background: 'rgb(var(--popover))',
        borderColor: 'rgb(var(--border))',
        color: 'rgb(var(--popover-foreground))',
        borderRadius: 'var(--radius)',
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
      },
      overlay: {
        background: 'rgb(var(--popover))',
        borderColor: 'rgb(var(--border))',
        color: 'rgb(var(--popover-foreground))',
        borderRadius: 'var(--radius)',
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
    // TreeSelect
    treeselect: {
      root: {
        background: 'rgb(var(--background))',
        borderColor: 'rgb(var(--input))',
        hoverBorderColor: 'rgb(var(--primary))',
        focusBorderColor: 'rgb(var(--primary))',
        color: 'rgb(var(--foreground))',
      },
      overlay: {
        background: 'rgb(var(--popover))',
        borderColor: 'rgb(var(--border))',
        color: 'rgb(var(--popover-foreground))',
        borderRadius: 'var(--radius)',
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
      },
      overlay: {
        background: 'rgb(var(--popover))',
        borderColor: 'rgb(var(--border))',
        color: 'rgb(var(--popover-foreground))',
        borderRadius: 'var(--radius)',
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
        padding: '0.75rem 1rem',
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
        padding: '0.75rem 1rem',
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
      // 修补 Aura 在暗色模式下彩色文字对比度不足的问题
      colorScheme: {
        dark: {
          // 信息提示：保持蓝色背景，只提升文字为浅色
          info: {
            color: 'rgb(var(--foreground))',
          },
          // 成功提示：绿色背景 + 浅色文字
          success: {
            color: 'rgb(var(--foreground))',
          },
          // 警告提示：黄色背景 + 浅色文字
          warn: {
            color: 'rgb(var(--foreground))',
          },
          // 错误提示：红色背景 + 浅色文字
          error: {
            color: 'rgb(var(--foreground))',
          },
          // 次要提示：灰色背景 + 浅色文字
          secondary: {
            color: 'rgb(var(--foreground))',
          },
          // contrast 在暗色模式下本身就是浅底深字，一般不需要强制覆盖；
          // 如需统一风格，可在此再增加 contrast 配置。
        },
      },
    },
    // Toast
    // 在 components 对象中，紧跟在 message 旁边增加一个 toast 配置

    toast: {
      // 不改 root/icon/summary/detail 等结构，只修补暗色配色
      colorScheme: {
        dark: {
          info: {
            // 正文：同样用前景色，或者保留 surface.0 也可以
            detailColor: 'rgb(var(--foreground))',
          },
          success: {
            detailColor: 'rgb(var(--foreground))',
          },
          warn: {
            detailColor: 'rgb(var(--foreground))',
          },
          error: {
            detailColor: 'rgb(var(--foreground))',
          },
        },
      },
    },
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
    // SelectButton
    selectbutton: {
      // 基础外观（主要针对浅色模式）
      root: {
        borderRadius: 'var(--radius)',
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
      // 深色模式单独控制 hover/选中，保证文字对比度
      colorScheme: {
        dark: {
          root: {
            // 未选中常态
            background: 'rgb(var(--secondary))',
            borderColor: 'rgb(var(--input))',
            color: 'rgb(var(--foreground))',
            // 悬停：使用 muted 背景 + 前景文字
            hoverBackground: 'rgb(var(--muted))',
            hoverBorderColor: 'rgb(var(--border))',
            hoverColor: 'rgb(var(--foreground))',
            // 选中态：主色背景 + 主色前景
            checkedBackground: 'rgb(var(--primary))',
            checkedBorderColor: 'rgb(var(--primary))',
            checkedColor: 'rgb(var(--primary-foreground))',
            checkedHoverBackground: 'rgb(var(--primary-hover))',
          },
        },
      },
    },
    // SplitButton
    splitbutton: {
      root: {
        borderRadius: 'var(--radius)',
      },
      button: {
        // Inherits from regular Button, generally fine
      },
      menu: {
        // Dropdown menu follows Menu/Popover styles
      },
    },
    // TieredMenu
    tieredmenu: {
      root: {
        background: 'rgb(var(--popover))',
        borderColor: 'rgb(var(--border))',
        color: 'rgb(var(--popover-foreground))',
        borderRadius: 'var(--radius)',
      },
      item: {
        color: 'rgb(var(--popover-foreground))',
        focusBackground: 'rgb(var(--accent))',
        focusColor: 'rgb(var(--accent-foreground))',
        activeBackground: 'rgb(var(--accent))', // For submenu
        activeColor: 'rgb(var(--accent-foreground))',
      },
    },
    // PanelMenu
    panelmenu: {
      root: {
        gap: '0.25rem',
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
        borderRadius: 'var(--radius)',
      },
      content: {
        background: 'transparent',
        borderColor: 'transparent',
        color: 'rgb(var(--foreground))',
        padding: '0 0 0 1rem',
      },
      item: {
        color: 'rgb(var(--foreground))',
        focusBackground: 'rgb(var(--accent))',
        focusColor: 'rgb(var(--accent-foreground))',
      },
    },
    // TabMenu
    tabmenu: {
      root: {
        background: 'transparent',
        borderColor: 'rgb(var(--border))',
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
      },
    },
    // Steps
    steps: {
      root: {
        background: 'transparent',
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
        borderRadius: 'var(--radius)',
      },
    },
  }

  // ──────────────────────────────────────────────────────────────────────────
  // 5. FINAL ASSEMBLY: 通过definePreset合并所有层级
  // ──────────────────────────────────────────────────────────────────────────
  console.log('Aura Original: ', Aura)
  const basePreset = definePreset(Aura, {
    primitive: primitiveColors,
    semantic: semanticColors,
    components: componentColors,
  })

  // 应用全局尺寸配置
  return deepMergeStylesAdvanced(basePreset, customSize, {
    deepMerge: true,
    override: true,
  })
}
