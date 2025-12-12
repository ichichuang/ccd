import { FileSystemIconLoader } from '@iconify/utils/lib/loader/node-loaders'
import { presetIcons } from '@unocss/preset-icons'
import { presetAttributify, presetTypography, presetUno } from 'unocss'
import { getCustomIcons } from '../utils/icons'

/**
 * 预设配置
 */
// 获取自定义图标配置
const customIcons = getCustomIcons()
const iconCollections = Object.fromEntries(
  Object.keys(customIcons).map(item => [item, FileSystemIconLoader(`src/assets/icons/${item}`)])
)

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
  presetIcons({
    warn: true,
    prefix: ['i-'],
    extraProperties: {
      display: 'inline-block',
    },
    collections: iconCollections,
  }),
]
