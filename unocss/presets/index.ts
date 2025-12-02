import { presetAttributify, presetTypography, presetUno } from 'unocss'

/**
 * 预设配置
 */
export const presets = [
  presetUno({
    // 启用深色模式支持
    dark: 'class',
    // 启用所有变体
    variablePrefix: '--un-',
  }),
  presetAttributify({
    // 属性化前缀
    prefix: 'un-',
    prefixedOnly: false,
  }),
  presetTypography({
    // 排版样式配置
    cssExtend: {
      code: {
        color: 'var(--theme-color)',
      },
      blockquote: {
        'border-left-color': 'var(--theme-color)',
      },
    },
  }),
]
