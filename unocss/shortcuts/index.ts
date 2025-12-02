import { layoutShortcuts } from './modules/layout'
import { sizeShortcuts } from './modules/size'
import { styleShortcuts } from './modules/style'
import { textShortcuts } from './modules/text'

/**
 * 合并所有快捷方式 - 使用对象格式，确保 VSCode 插件能识别
 */
export const shortcuts = {
  // 布局快捷方式
  ...layoutShortcuts,

  // 文本快捷方式
  ...textShortcuts,

  // 尺寸快捷方式
  ...sizeShortcuts,

  // 样式快捷方式
  ...styleShortcuts,
}
