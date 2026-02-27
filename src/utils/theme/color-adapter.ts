/**
 * Color Palette Adapter for PrimeVue Preset
 * 完全对齐架构的配色系统（theme.d.ts ThemeCssVars）
 *
 * 参考：src/types/systems/theme.d.ts ThemeCssVars
 * 唯一实现：将 CSS 变量名转为 rgb(var(--xxx))；所有 getXxx 均由此生成。
 */

const getRgbVar = (name: string) => `rgb(var(--${name}))`

/**
 * 创建颜色适配器
 * 返回的 getBackground、getPrimaryForeground 等均为 getRgbVar 的调用结果，与 ThemeCssVars 键一一对应。
 */
export const createColorAdapter = () => {
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

export type ColorAdapter = ReturnType<typeof createColorAdapter>

/**
 * 将 Aura 的 (colorType, suffix) 映射到架构对齐的适配器 getter
 */
export const getAdapterKey = (
  colorType: 'Primary' | 'Secondary' | 'Info' | 'Success' | 'Warn' | 'Help' | 'Danger' | 'Contrast',
  suffix: string
): keyof ColorAdapter => {
  if (colorType === 'Contrast') {
    if (suffix === 'Text') return 'getBackground'
    if (suffix === 'Light') return 'getMuted'
    return 'getForeground'
  }

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

  if (suffix === '') {
    return `get${mappedType}` as keyof ColorAdapter
  }
  if (suffix === 'Text') {
    return `get${mappedType}Foreground` as keyof ColorAdapter
  }
  if (suffix === 'Hover' || suffix === 'Active') {
    if (mappedType === 'Secondary') {
      return `get${mappedType}` as keyof ColorAdapter
    }
    return `get${mappedType}Hover` as keyof ColorAdapter
  }
  if (suffix === 'Border') {
    return `get${mappedType}` as keyof ColorAdapter
  }
  if (suffix === 'Light') {
    if (mappedType === 'Secondary') {
      return 'getMuted' as keyof ColorAdapter
    }
    return `get${mappedType}Light` as keyof ColorAdapter
  }

  return `get${mappedType}` as keyof ColorAdapter
}

/**
 * 初始化 Button 等组件的 colorScheme 选项（root / outlined / text / link）
 */
export const initComponentButtonColorSchemeOptionsItems = (
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
    const get = (suffix: string) => {
      const key = getAdapterKey(colorType, suffix)
      return colors[key] || colors[getAdapterKey(colorType, '')]
    }

    const getAlpha = (suffix: string, alpha: number) => {
      const val = get(suffix)
      return val.replace(/\)$/, ` / ${alpha})`)
    }

    switch (type) {
      case 'outlined':
        return {
          hoverBackground: getAlpha('', 0.08),
          activeBackground: getAlpha('', 0.12),
          hoverBorderColor: colorType === 'Secondary' ? get('Text') : get(''),
          activeBorderColor: colorType === 'Secondary' ? get('Text') : get(''),
          hoverColor: colorType === 'Secondary' ? get('Text') : get(''),
          activeColor: colorType === 'Secondary' ? get('Text') : get(''),
          borderColor: colorType === 'Secondary' ? get('Text') : get(''),
          color: colorType === 'Secondary' ? get('Text') : get(''),
        }
      case 'text':
        return {
          hoverBackground: getAlpha('', 0.12),
          activeBackground: getAlpha('', 0.18),
          color: colorType === 'Secondary' ? get('Text') : get(''),
        }
      case 'link':
        return {
          color: get('Text'),
          hoverColor: get(''),
          activeColor: get('Hover'),
        }
      default:
        return {
          background: get(''),
          hoverBackground: get('Hover'),
          activeBackground: get('Active'),
          borderColor: get(''),
          hoverBorderColor: get(''),
          activeBorderColor: get(''),
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
