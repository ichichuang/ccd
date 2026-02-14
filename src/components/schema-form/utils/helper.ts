// @/components/schema-form/utils/helper.ts
/**
 * helper.ts
 * - options 缓存（内存）
 * - 字符串 rules -> Yup 简单转换（常用规则）
 * - evalBoolish：计算 visible/disabled/readonly 支持函数或布尔
 * - colClass：col 配置 -> UnoCSS 类（基于 12 栅格）
 */
import * as yup from 'yup'
import { DEFAULT_OPTIONS_CACHE_TTL, getResponsiveSpan } from './constants'
import type { EvalCtx, LayoutConfig, OptionItem, SchemaColumnsItem } from './types'

/** 简单内存缓存：Map<key, {expires,data}> */
const memoryCache = new Map<string, { expires: number; data: OptionItem[] }>()

export function cacheSet(key: string, data: OptionItem[], ttl = DEFAULT_OPTIONS_CACHE_TTL) {
  memoryCache.set(key, { expires: Date.now() + ttl, data })
}
export function cacheGet(key: string) {
  const item = memoryCache.get(key)
  if (!item) {
    return null
  }
  if (item.expires < Date.now()) {
    memoryCache.delete(key)
    return null
  }
  return item.data
}

/** 评估 visible/disabled/readonly（布尔、字符串或函数） */
export async function evalBoolish(
  value: boolean | string | ((ctx: EvalCtx) => boolean | Promise<boolean>) | undefined,
  ctx: EvalCtx
) {
  if (value === undefined) {
    return true
  }
  if (typeof value === 'boolean') {
    return value
  }
  if (typeof value === 'string') {
    // 字符串转换为布尔值
    return value === 'true' || value === '1' || value === 'yes'
  }
  if (typeof value === 'function') {
    const r = await value(ctx)
    return !!r
  }
  return true
}

/** 简单的 rules 字符串解析转 Yup（覆盖常见规则） */
export function buildYupFromRuleString(
  componentHint: string | undefined,
  ruleStr: string
): yup.AnySchema {
  let base: any = yup.mixed()
  // 根据组件 hint 选择初始类型
  if (componentHint === 'DatePicker') {
    base = yup.date().typeError('日期格式不正确')
  } else if (componentHint === 'InputNumber' || componentHint === 'Slider') {
    base = yup.number()
  } else {
    base = yup.string()
  }

  for (const part of ruleStr.split('|')) {
    if (!part) {
      continue
    }
    if (part === 'required') {
      base = base.required('必填项')
    } else if (part.startsWith('min:')) {
      const n = Number(part.split(':')[1])
      if (base.min) {
        base = base.min(n, `至少 ${n}`)
      }
    } else if (part.startsWith('max:')) {
      const n = Number(part.split(':')[1])
      if (base.max) {
        base = base.max(n, `最多 ${n}`)
      }
    } else if (part === 'email') {
      base = (base as any).email?.('邮箱格式不正确') ?? base
    } else if (part === 'integer' && base.integer) {
      base = base.integer('必须为整数')
    }
  }
  return base
}

/** 将 field.props.options 加载（支持静态数组或函数），并使用内存缓存 */
export async function loadOptions(
  field: SchemaColumnsItem,
  ctx: EvalCtx,
  cacheTTL = DEFAULT_OPTIONS_CACHE_TTL
) {
  const options = field.props?.options
  if (!options) {
    return []
  }
  if (Array.isArray(options)) {
    return options
  }
  // options 是函数
  let cacheKey: string
  try {
    const depValues = field.dependsOn?.map((k: string) => ctx.values[k] ?? null) ?? []
    cacheKey = `${field.field}:${JSON.stringify(depValues)}`
  } catch {
    cacheKey = `${field.field}:${Date.now()}`
  }
  const cached = cacheGet(cacheKey)
  if (cached) {
    return cached
  }
  // 此处约定非数组的 options 为函数，显式断言类型以满足 TypeScript
  const loader = options as (context: EvalCtx) => Promise<OptionItem[]> | OptionItem[]
  const data = await loader(ctx)
  cacheSet(cacheKey, data, cacheTTL)
  return data
}

/** col -> 内联样式（12 栅格） */
export function colStyle(layout: LayoutConfig, width: number): Record<string, string> {
  const span = getResponsiveSpan(width, layout?.cols)
  return { gridColumn: `span ${span} / span ${span}` }
}

/** 检查字段是否必填 */
export function isFieldRequired(field: SchemaColumnsItem): boolean {
  const rules = field.rules

  if (!rules) {
    return false
  }

  // 处理字符串规则
  if (typeof rules === 'string') {
    return rules.includes('required')
  }

  // 处理函数规则 - 函数规则通常表示必填验证
  if (typeof rules === 'function') {
    return true
  }

  // 处理数组规则
  if (Array.isArray(rules)) {
    return rules.some(rule => {
      if (typeof rule === 'string') {
        return rule.includes('required')
      }
      // 函数规则通常表示必填验证
      if (typeof rule === 'function') {
        return true
      }
      // 对于 Yup Schema，检查是否包含 required 验证
      if (rule && typeof rule === 'object' && 'spec' in rule) {
        const yupRule = rule as any
        return (
          yupRule.spec?.presence === 'required' ||
          yupRule.spec?.tests?.some((test: any) => test.OPTIONS?.name === 'required')
        )
      }
      return false
    })
  }

  // 处理 Yup Schema
  if (rules && typeof rules === 'object' && 'spec' in rules) {
    const yupRule = rules as any
    return (
      yupRule.spec?.presence === 'required' ||
      yupRule.spec?.tests?.some((test: any) => test.OPTIONS?.name === 'required')
    )
  }

  return false
}
