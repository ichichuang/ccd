// @/components/SchemaForm/utils/formatPreview.ts
/**
 * 预览模式值格式化工具
 * 从 FormItems.tsx 提取，支持通过映射器扩展新组件格式化逻辑
 */

import type { OptionItem } from './types'

type PreviewFormatter = (value: unknown, options: OptionItem[]) => string

/**
 * 组件类型 → 预览格式化器映射
 * 使用 Map 避免 PascalCase 键名的 eslint 命名规范冲突
 * 新增组件只需在此添加一行
 */
const PREVIEW_FORMATTERS: Map<string, PreviewFormatter> = new Map([
  ['Checkbox', value => (value ? '是' : '否')],
  ['ToggleSwitch', value => (value ? '是' : '否')],
  ['InputText', value => String(value)],
  ['Password', () => '••••••'],
  ['InputMask', value => String(value)],
  ['InputGroup', value => String(value)],

  [
    'AutoComplete',
    (value, options) => {
      // 如果 value 是对象且有 label 属性，直接显示
      if (value && typeof value === 'object' && 'label' in value) {
        return String((value as Record<string, unknown>).label)
      }
      const option = options.find(opt => opt.value === value)
      return option ? option.label : String(value)
    },
  ],

  [
    'Select',
    (value, options) => {
      const option = options.find(opt => opt.value === value)
      return option ? option.label : String(value)
    },
  ],
  [
    'Listbox',
    (value, options) => {
      const option = options.find(opt => opt.value === value)
      return option ? option.label : String(value)
    },
  ],
  [
    'RadioButton',
    (value, options) => {
      const option = options.find(opt => opt.value === value)
      return option ? option.label : String(value)
    },
  ],

  [
    'MultiSelect',
    (value, options) => {
      if (Array.isArray(value)) {
        return value
          .map(v => {
            const option = options.find(opt => opt.value === v)
            return option ? option.label : String(v)
          })
          .join(', ')
      }
      return String(value)
    },
  ],
  [
    'SelectButton',
    (value, options) => {
      if (Array.isArray(value)) {
        return value
          .map(v => {
            const option = options.find(opt => opt.value === v)
            return option ? option.label : String(v)
          })
          .join(', ')
      }
      return String(value)
    },
  ],

  [
    'CascadeSelect',
    (value, options) => {
      // 尝试从 value 对象中获取显示文本
      if (value && typeof value === 'object') {
        if ('label' in value) return String((value as Record<string, unknown>).label)
        if ('cname' in value) return String((value as Record<string, unknown>).cname)
        if ('name' in value) return String((value as Record<string, unknown>).name)
      }
      // 递归查找选项
      const find = (opts: OptionItem[], v: unknown): string | null => {
        for (const o of opts) {
          if (o.value === v) return o.label
          if (o.children) {
            const r = find(o.children as OptionItem[], v)
            if (r) return r
          }
        }
        return null
      }
      return find(options, value) ?? String(value)
    },
  ],
  [
    'TreeSelect',
    (value, options) => {
      // TreeSelect value 通常是 { [key]: true } 格式，或者单个值
      if (value && typeof value === 'object') {
        const keys = Object.keys(value)
        if (keys.length > 0) {
          const find = (opts: OptionItem[], k: string): string | null => {
            for (const o of opts) {
              const nodeKey = String(o.key ?? o.value)
              if (nodeKey === k) return o.label
              if (o.children) {
                const r = find(o.children as OptionItem[], k)
                if (r) return r
              }
            }
            return null
          }
          return keys.map(k => find(options, k) ?? k).join(', ')
        }
      }
      return String(value)
    },
  ],

  [
    'DatePicker',
    value => {
      const formatDate = (v: unknown): string => {
        if (v instanceof Date) return v.toLocaleDateString('zh-CN')
        if (typeof v === 'number') return new Date(v).toLocaleDateString('zh-CN')
        if (typeof v === 'string') {
          try {
            return new Date(v).toLocaleDateString('zh-CN')
          } catch {
            return String(v)
          }
        }
        return String(v)
      }
      if (Array.isArray(value)) {
        return value.map(formatDate).join(' ~ ')
      }
      return formatDate(value)
    },
  ],

  [
    'ColorPicker',
    value => {
      const colorValue = typeof value === 'string' ? value : String(value)
      return colorValue.startsWith('#') ? colorValue.toUpperCase() : `#${colorValue.toUpperCase()}`
    },
  ],

  [
    'Rating',
    value => {
      const rating = typeof value === 'number' ? value : 0
      return '★'.repeat(rating) + '☆'.repeat(5 - rating)
    },
  ],

  ['Slider', value => String(value)],
  ['Textarea', value => String(value).replace(/\n/g, '<br />')],
  ['InputNumber', value => String(value)],
])

/** 预览格式化可选 i18n（用于布尔等文案国际化） */
export interface FormatPreviewI18n {
  /** 布尔值展示（Checkbox / ToggleSwitch），未传时使用默认「是/否」 */
  formatBoolean?: (value: boolean) => string
  /** 日期 locale（默认 'zh-CN'） */
  dateLocale?: string
  /** 日期格式选项（传入 toLocaleDateString 的第二参数） */
  dateFormatOptions?: Intl.DateTimeFormatOptions
}

/**
 * 格式化预览值
 * @param value - 字段值
 * @param component - 组件类型名
 * @param options - 可选项列表（用于 Select 等组件）
 * @param i18n - 可选国际化（如 formatBoolean 用于 Checkbox/ToggleSwitch）
 */
export function formatPreviewValue(
  value: unknown,
  component: string,
  options: OptionItem[] = [],
  i18n?: FormatPreviewI18n
): string {
  if (value === null || value === undefined || value === '') {
    return '-'
  }

  if (component === 'Checkbox' || component === 'ToggleSwitch') {
    if (i18n?.formatBoolean) {
      return i18n.formatBoolean(Boolean(value))
    }
  }

  const formatter = PREVIEW_FORMATTERS.get(component)
  if (formatter) {
    if (component === 'DatePicker' && i18n) {
      // 特殊处理：DatePicker 传入 i18n 配置
      // 但 PREVIEW_FORMATTERS 签名不含 i18n，这里通过闭包或扩展 formatter 签名?
      // 简单起见，我们在 PREVIEW_FORMATTERS 外部处理，或者临时修改 DatePicker formatter
      // 更好的方式是直接在这里处理 DatePicker，或者让 PREVIEW_FORMATTERS 接受第三个参数
      // 考虑到 PREVIEW_FORMATTERS 是通用映射，我们在这里拦截 DatePicker
      const formatDate = (v: unknown): string => {
        const locale = i18n.dateLocale || 'zh-CN'
        const opts = i18n.dateFormatOptions
        if (v instanceof Date) return v.toLocaleDateString(locale, opts)
        if (typeof v === 'number') return new Date(v).toLocaleDateString(locale, opts)
        if (typeof v === 'string') {
          try {
            return new Date(v).toLocaleDateString(locale, opts)
          } catch {
            return String(v)
          }
        }
        return String(v)
      }
      if (Array.isArray(value)) {
        return value.map(formatDate).join(' ~ ')
      }
      return formatDate(value)
    }
    return formatter(value, options)
  }

  return String(value)
}
