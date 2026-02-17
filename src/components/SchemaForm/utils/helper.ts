// @/components/SchemaForm/utils/helper.ts
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

/** 解析后的单条规则（规则元数据单一来源，供 validateStringRules 与 buildYupFromRuleString 共用） */
export interface ParsedRule {
  name: string
  arg?: number
  rawArg?: string
}

/** 规则错误文案 i18n key（与 validateStringRules / buildYupFromRuleString 一致） */
const RULE_MESSAGE_KEYS = {
  required: 'schemaForm.validation.required',
  minChars: 'schemaForm.validation.minChars',
  minLength: 'schemaForm.validation.minLength',
  minValue: 'schemaForm.validation.minValue',
  maxChars: 'schemaForm.validation.maxChars',
  maxLength: 'schemaForm.validation.maxLength',
  maxValue: 'schemaForm.validation.maxValue',
  email: 'schemaForm.validation.email',
  url: 'schemaForm.validation.url',
  pattern: 'schemaForm.validation.pattern',
  invalidPattern: 'schemaForm.validation.invalidPattern',
  integer: 'schemaForm.validation.integer',
  dateType: 'schemaForm.validation.dateType',
} as const

/** 获取校验规则错误文案（使用 i18n） */
function getRuleMessage(
  key: keyof typeof RULE_MESSAGE_KEYS,
  t: (key: string, params?: Record<string, unknown>) => string,
  params?: { n?: number }
): string {
  const i18nKey = RULE_MESSAGE_KEYS[key]
  return params?.n !== undefined ? t(i18nKey, { n: params.n }) : t(i18nKey)
}

/**
 * 解析规则字符串为元数据（single source of truth）
 * 供 validateStringRules 和 buildYupFromRuleString 共用
 */
export function parseRuleString(ruleStr: string): ParsedRule[] {
  const out: ParsedRule[] = []
  for (const part of ruleStr.split('|')) {
    if (!part) continue
    if (part === 'required' || part === 'email' || part === 'integer' || part === 'url') {
      out.push({ name: part })
    } else if (part.startsWith('min:')) {
      const n = Number(part.split(':')[1])
      out.push({ name: 'min', arg: n })
    } else if (part.startsWith('max:')) {
      const n = Number(part.split(':')[1])
      out.push({ name: 'max', arg: n })
    } else if (part.startsWith('minLength:')) {
      const n = Number(part.split(':')[1])
      out.push({ name: 'minLength', arg: n })
    } else if (part.startsWith('maxLength:')) {
      const n = Number(part.split(':')[1])
      out.push({ name: 'maxLength', arg: n })
    } else if (part.startsWith('pattern:')) {
      // pattern:/^...$/
      const pattern = part.substring('pattern:'.length)
      out.push({ name: 'pattern', rawArg: pattern })
    }
  }
  return out
}

/** 评估字符串规则（基于 parseRuleString，与 buildYupFromRuleString 共享规则语义） */
export function validateStringRules(
  rules: string,
  value: unknown,
  t: (key: string, params?: Record<string, unknown>) => string
): string | null {
  const parsed = parseRuleString(rules)

  for (const rule of parsed) {
    if (rule.name === 'required') {
      if (
        value === null ||
        value === undefined ||
        (typeof value === 'string' && value.trim() === '')
      ) {
        return getRuleMessage('required', t)
      }
    } else if (rule.name === 'min' && rule.arg !== undefined) {
      if (typeof value === 'string' && value.length < rule.arg) {
        return getRuleMessage('minChars', t, { n: rule.arg })
      }
      if (typeof value === 'number' && value < rule.arg) {
        return getRuleMessage('minValue', t, { n: rule.arg })
      }
    } else if (rule.name === 'max' && rule.arg !== undefined) {
      if (typeof value === 'string' && value.length > rule.arg) {
        return getRuleMessage('maxChars', t, { n: rule.arg })
      }
      if (typeof value === 'number' && value > rule.arg) {
        return getRuleMessage('maxValue', t, { n: rule.arg })
      }
    } else if (rule.name === 'minLength' && rule.arg !== undefined) {
      if (typeof value === 'string' && value.length < rule.arg) {
        return getRuleMessage('minLength', t, { n: rule.arg })
      }
      if (Array.isArray(value) && value.length < rule.arg) {
        return getRuleMessage('minLength', t, { n: rule.arg })
      }
    } else if (rule.name === 'maxLength' && rule.arg !== undefined) {
      if (typeof value === 'string' && value.length > rule.arg) {
        return getRuleMessage('maxLength', t, { n: rule.arg })
      }
      if (Array.isArray(value) && value.length > rule.arg) {
        return getRuleMessage('maxLength', t, { n: rule.arg })
      }
    } else if (rule.name === 'email' && value) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(value as string)) {
        return getRuleMessage('email', t)
      }
    } else if (rule.name === 'url' && value) {
      try {
        new URL(value as string)
      } catch {
        return getRuleMessage('url', t)
      }
    } else if (rule.name === 'pattern' && rule.rawArg && value) {
      try {
        // 尝试解析正则字符串，如 "/^...$/i" 或 "^...$"
        let regex: RegExp
        const match = rule.rawArg.match(/^\/(.*)\/([a-z]*)$/)
        if (match) {
          regex = new RegExp(match[1], match[2])
        } else {
          regex = new RegExp(rule.rawArg)
        }
        if (!regex.test(value as string)) {
          return getRuleMessage('pattern', t)
        }
      } catch {
        return getRuleMessage('invalidPattern', t)
      }
    } else if (rule.name === 'integer' && value) {
      if (!Number.isInteger(Number(value))) {
        return getRuleMessage('integer', t)
      }
    }
  }

  return null
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

/** 根据 parseRuleString 结果构建 Yup Schema（与 validateStringRules 共享规则语义与文案） */
export function buildYupFromRuleString(
  componentHint: string | undefined,
  ruleStr: string,
  t: (key: string, params?: Record<string, unknown>) => string
): yup.AnySchema {
  let base: yup.StringSchema | yup.NumberSchema | yup.DateSchema | yup.MixedSchema = yup.mixed()
  if (componentHint === 'DatePicker') {
    base = yup.date().typeError(getRuleMessage('dateType', t))
  } else if (componentHint === 'InputNumber' || componentHint === 'Slider') {
    base = yup.number()
  } else {
    base = yup.string()
  }

  const parsed = parseRuleString(ruleStr)
  for (const rule of parsed) {
    if (rule.name === 'required') {
      base = base.required(getRuleMessage('required', t))
    } else if (rule.name === 'min' && rule.arg !== undefined) {
      if (componentHint === 'InputNumber' || componentHint === 'Slider') {
        base = (base as yup.NumberSchema).min(
          rule.arg,
          getRuleMessage('minValue', t, { n: rule.arg })
        )
      } else if (componentHint !== 'DatePicker') {
        base = (base as yup.StringSchema).min(
          rule.arg,
          getRuleMessage('minChars', t, { n: rule.arg })
        )
      }
    } else if (rule.name === 'max' && rule.arg !== undefined) {
      if (componentHint === 'InputNumber' || componentHint === 'Slider') {
        base = (base as yup.NumberSchema).max(
          rule.arg,
          getRuleMessage('maxValue', t, { n: rule.arg })
        )
      } else if (componentHint !== 'DatePicker') {
        base = (base as yup.StringSchema).max(
          rule.arg,
          getRuleMessage('maxChars', t, { n: rule.arg })
        )
      }
    } else if (rule.name === 'minLength' && rule.arg !== undefined) {
      if (
        componentHint !== 'InputNumber' &&
        componentHint !== 'Slider' &&
        componentHint !== 'DatePicker'
      ) {
        base = (base as yup.StringSchema).min(
          rule.arg,
          getRuleMessage('minLength', t, { n: rule.arg })
        )
      }
    } else if (rule.name === 'maxLength' && rule.arg !== undefined) {
      if (
        componentHint !== 'InputNumber' &&
        componentHint !== 'Slider' &&
        componentHint !== 'DatePicker'
      ) {
        base = (base as yup.StringSchema).max(
          rule.arg,
          getRuleMessage('maxLength', t, { n: rule.arg })
        )
      }
    } else if (rule.name === 'email') {
      if ('email' in base && typeof (base as yup.StringSchema).email === 'function') {
        base = (base as yup.StringSchema).email(getRuleMessage('email', t))
      }
    } else if (rule.name === 'url') {
      if ('url' in base && typeof (base as yup.StringSchema).url === 'function') {
        base = (base as yup.StringSchema).url(getRuleMessage('url', t))
      }
    } else if (rule.name === 'pattern' && rule.rawArg) {
      if ('matches' in base) {
        try {
          let regex: RegExp
          const match = rule.rawArg.match(/^\/(.*)\/([a-z]*)$/)
          if (match) {
            regex = new RegExp(match[1], match[2])
          } else {
            regex = new RegExp(rule.rawArg)
          }
          base = (base as yup.StringSchema).matches(regex, getRuleMessage('pattern', t))
        } catch {
          // ignore
        }
      }
    } else if (rule.name === 'integer' && 'integer' in base) {
      base = (base as yup.NumberSchema).integer(getRuleMessage('integer', t))
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

/** col -> 内联样式（12 栅格）；优先使用 layout.span，否则按 cols/断点推算 */
export function colStyle(layout: LayoutConfig, width: number): Record<string, string> {
  const explicitSpan =
    layout?.span != null && layout.span >= 1 && layout.span <= 12 ? Math.round(layout.span) : null
  const span = explicitSpan ?? getResponsiveSpan(width, layout?.cols)
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

  // 处理函数规则 — 函数规则不自动标记为 required
  // 函数规则可能是任意自定义验证，仅在包含 'required' 字符串规则时才标记
  if (typeof rules === 'function') {
    return false
  }

  // 处理数组规则
  if (Array.isArray(rules)) {
    return rules.some(rule => {
      if (typeof rule === 'string') {
        return rule.includes('required')
      }
      // 函数规则不自动标记为 required
      if (typeof rule === 'function') {
        return false
      }
      // 对于 Yup Schema，检查是否包含 required 验证
      if (rule && typeof rule === 'object' && 'spec' in rule) {
        const yupRule = rule as {
          spec?: { presence?: string; tests?: Array<{ OPTIONS?: { name?: string } }> }
        }
        return (
          yupRule.spec?.presence === 'required' ||
          yupRule.spec?.tests?.some(test => test.OPTIONS?.name === 'required')
        )
      }
      return false
    })
  }

  // 处理 Yup Schema
  if (rules && typeof rules === 'object' && 'spec' in rules) {
    const yupRule = rules as {
      spec?: { presence?: string; tests?: Array<{ OPTIONS?: { name?: string } }> }
    }
    return (
      (yupRule.spec?.presence === 'required' ||
        yupRule.spec?.tests?.some(test => test.OPTIONS?.name === 'required')) ??
      false
    )
  }

  return false
}
