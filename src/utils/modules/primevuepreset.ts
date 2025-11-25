import { useColorStore, useSizeStore } from '@/stores'

// 分配按钮颜色
const initComponentButtonColorSchemeOptionsItems = (
  colorStore: ReturnType<typeof useColorStore>,
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
    switch (type) {
      case 'outlined':
        return {
          hoverBackground:
            colorType === 'Secondary'
              ? colorStore[`get${colorType}Color` as keyof typeof colorStore]
              : colorStore[`get${colorType}ColorText` as keyof typeof colorStore],
          activeBackground:
            colorType === 'Secondary'
              ? colorStore[`get${colorType}Color` as keyof typeof colorStore]
              : colorStore[`get${colorType}ColorActive` as keyof typeof colorStore],
          borderColor:
            colorType === 'Secondary'
              ? colorStore[`get${colorType}ColorText` as keyof typeof colorStore]
              : colorStore[`get${colorType}Color` as keyof typeof colorStore],
          color:
            colorType === 'Secondary'
              ? colorStore[`get${colorType}ColorText` as keyof typeof colorStore]
              : colorStore[`get${colorType}Color` as keyof typeof colorStore],
        }
      case 'text':
        return {
          hoverBackground:
            colorType === 'Secondary'
              ? colorStore[`get${colorType}Color` as keyof typeof colorStore]
              : colorStore[`get${colorType}ColorText` as keyof typeof colorStore],
          activeBackground:
            colorType === 'Secondary'
              ? colorStore[`get${colorType}Color` as keyof typeof colorStore]
              : colorStore[`get${colorType}ColorText` as keyof typeof colorStore],
          color:
            colorType === 'Secondary'
              ? colorStore[`get${colorType}ColorText` as keyof typeof colorStore]
              : colorStore[`get${colorType}Color` as keyof typeof colorStore],
        }
      case 'link':
        return {
          color: colorStore[`get${colorType}ColorText` as keyof typeof colorStore],
          hoverColor: colorStore[`get${colorType}Color` as keyof typeof colorStore],
          activeColor: colorStore[`get${colorType}ColorHover` as keyof typeof colorStore],
        }
      default:
        return {
          background: colorStore[`get${colorType}Color` as keyof typeof colorStore],
          hoverBackground: colorStore[`get${colorType}ColorHover` as keyof typeof colorStore],
          activeBackground: colorStore[`get${colorType}ColorActive` as keyof typeof colorStore],
          borderColor: colorStore[`get${colorType}ColorBorder` as keyof typeof colorStore],
          hoverBorderColor: colorStore[`get${colorType}ColorActive` as keyof typeof colorStore],
          activeBorderColor: colorStore[`get${colorType}ColorHover` as keyof typeof colorStore],
          color: colorStore[`get${colorType}ColorText` as keyof typeof colorStore],
          hoverColor: colorStore[`get${colorType}ColorText` as keyof typeof colorStore],
          activeColor: colorStore[`get${colorType}ColorText` as keyof typeof colorStore],
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

/**
 * 自定义原语颜色
 * @param _colorStore Pinia 颜色状态
 * @param _sizeStore Pinia 尺寸状态
 * @returns 自定义原语颜色
 */
const customPrimitive = (
  _colorStore: ReturnType<typeof useColorStore>,
  _sizeStore: ReturnType<typeof useSizeStore>
) => {
  return {}
}

/**
 * 自定义语义颜色
 * @param colorStore Pinia 颜色状态
 * @param _sizeStore Pinia 尺寸状态
 * @returns 自定义语义颜色
 */
const customSemantic = (
  _colorStore: ReturnType<typeof useColorStore>,
  _sizeStore: ReturnType<typeof useSizeStore>
) => {
  return {}
}

/**
 * 自定义组件颜色
 * @param colorStore Pinia 颜色状态
 * @returns 自定义组件颜色
 */
const customComponent = (colorStore: ReturnType<typeof useColorStore>) => {
  const colorSchemeOptions = {
    root: initComponentButtonColorSchemeOptionsItems(colorStore),
    outlined: initComponentButtonColorSchemeOptionsItems(colorStore, 'outlined'),
    text: initComponentButtonColorSchemeOptionsItems(colorStore, 'text'),
    link: initComponentButtonColorSchemeOptionsItems(colorStore, 'link'),
  }
  return {
    button: {
      colorScheme: {
        light: { ...colorSchemeOptions },
        dark: { ...colorSchemeOptions },
      },
    },
  }
}

/**
 * 自定义预设
 * @param colorStore Pinia 颜色状态
 * @param sizeStore Pinia 尺寸状态
 * @returns 自定义预设
 */
export const customPreset: any = (
  colorStore: ReturnType<typeof useColorStore>,
  sizeStore: ReturnType<typeof useSizeStore>
) => {
  const primitiveColors = customPrimitive(colorStore, sizeStore)
  const semanticColors = customSemantic(colorStore, sizeStore)
  const componentColors = customComponent(colorStore)
  const customPreset = {
    primitive: { ...primitiveColors },
    semantic: { ...semanticColors },
    components: { ...componentColors },
  }
  return customPreset
}
