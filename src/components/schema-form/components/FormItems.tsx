// @/components/schema-form/components/FormItems.tsx
import { AnimateWrapper } from '@/components/animate-wrapper'
import type { DefineComponent } from 'vue'
import { computed, defineComponent, onMounted, ref, toRaw, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { evalBoolish, isFieldRequired, loadOptions } from '../utils/helper'
import type {
  EvalCtx,
  FieldRenderCtx,
  FormApiLike,
  FormFieldState,
  FormValues,
  LayoutConfig,
  OptionItem,
  SchemaColumnsItem,
  StyleConfig,
} from '../utils/types'

// PrimeVue Components (保留用于特殊处理)
import ProgressSpinner from 'primevue/progressspinner'

// 组件映射表和工具函数
import { getComponentFromMap } from './componentMap'
import { buildComponentProps } from './utils/buildComponentProps'

// 直接打印调试信息（等最终修复后统一清理）
const debugFormItems = (..._args: any[]) => {}

// ==================== Props Interface ====================

interface SchemaFormItemProps {
  column: SchemaColumnsItem
  form: FormApiLike
  disabled: boolean
  optionsCacheTTL: number
  globalLayout: LayoutConfig
  globalStyle?: StyleConfig
  style?: Record<string, string>
  preview?: boolean
}

// ==================== Component Definition ====================

export default defineComponent({
  name: 'SchemaFormItem',
  props: {
    column: { type: Object as () => SchemaColumnsItem, required: true },
    form: { type: Object, required: true },
    disabled: { type: Boolean, default: false },
    optionsCacheTTL: { type: Number, default: 1000 * 60 * 5 },
    globalLayout: { type: Object as () => LayoutConfig, default: () => ({}) },
    globalStyle: { type: Object as () => StyleConfig, default: () => ({}) },
    style: { type: Object as () => Record<string, string>, default: () => ({}) },
    preview: { type: Boolean, default: false },
  },
  setup(props: SchemaFormItemProps) {
    const { t } = useI18n()
    // ==================== Reactive State ====================
    const visible = ref(true)
    const fieldDisabled = ref(!!props.disabled)
    const readonly = ref(false)

    const options = ref<OptionItem[]>([])
    const loading = ref(false)

    // 🔥 核心修复：优化 fieldModelValue 的响应性，确保批量设置时能正确更新
    // 与 Values 面板同源：优先从 form.modelValue 读取（reset/clear 后由 emit 更新，保证 UI 与数据一致）
    const fieldModelValue = computed(() => {
      const fieldName = props.column.field

      // 当 form 带有 modelValue 且包含本字段时，优先使用（与父级 v-model 同源，解决 reset/clear 后展示不同步）
      const modelVal = props.form.modelValue as FormValues | undefined
      if (modelVal && typeof modelVal === 'object' && fieldName in modelVal) {
        return modelVal[fieldName]
      }

      // 预览模式下，若上面未命中，仍从 modelVal 取非空值用于展示
      if (props.preview && modelVal && typeof modelVal === 'object') {
        const value = modelVal[fieldName]
        if (value !== undefined && value !== null) {
          return value
        }
      }

      // 降级：从 form[field].value 获取（PrimeVue Form 字段引用）
      // 这对于 DatePicker 等需要精确响应式更新的组件特别重要
      if (props.form && props.form[fieldName]) {
        const fieldRef = props.form[fieldName]
        if (fieldRef && typeof fieldRef === 'object' && 'value' in fieldRef) {
          const fieldValue = (fieldRef as Record<string, unknown>).value
          // 只有当值不是 undefined 时才返回（null 和空字符串都是有效值）
          if (fieldValue !== undefined) {
            return fieldValue
          }
        }
      }

      // 降级：从 form.values 中获取值
      // form.values 是 PrimeVue Form 提供的、专门用于表示当前所有字段值的响应式对象。
      if (props.form && props.form.values && typeof props.form.values === 'object') {
        const value = props.form.values[fieldName]
        // 在预览模式下，即使值为空字符串或0，也应该显示
        if (props.preview) {
          // 预览模式下，只有 undefined 和 null 才返回 undefined
          if (value !== undefined && value !== null) {
            return value
          }
        } else {
          // 非预览模式下，正常处理
          if (value !== undefined) {
            return value
          }
        }
      }

      // 如果都没有值，返回 undefined
      return undefined
    })

    const syncFieldValue = (value: unknown) => {
      const field = props.column.field
      if (process.env.NODE_ENV === 'development') {
        console.log(`[FormItems] syncFieldValue for ${field}`, {
          value,
          hasSetFieldValue: typeof props.form.setFieldValue === 'function',
        })
      }

      // 🔥 关键修复：只调用 setFieldValue，让 PrimeVue Form 处理所有更新
      // 不要直接修改 form.values，避免状态不一致和响应式失效
      if (props.form && typeof props.form.setFieldValue === 'function') {
        props.form.setFieldValue(field, value)
        return
      }

      // 降级方案：如果 setFieldValue 不可用，尝试其他方式
      // 1. 更新字段的 ref.value
      if (props.form && props.form[field]) {
        const fieldRef = props.form[field]
        if (fieldRef && typeof fieldRef === 'object' && 'value' in fieldRef) {
          ;(fieldRef as Record<string, unknown>).value = value
          return
        }
      }

      // 2. 最后才直接修改 form.values
      if (props.form && props.form.values && typeof props.form.values === 'object') {
        ;(props.form.values as Record<string, unknown>)[field] = value
      }
    }

    const handleModelValueUpdate = (value: unknown) => {
      syncFieldValue(value)
    }

    // ==================== Computed ====================
    const ctx = computed(
      (): EvalCtx => ({
        values: props.form.values || {},
        column: props.column,
      })
    )

    /** 合并布局配置：column.layout > globalLayout > 默认值 */
    const mergedColumnLayout = computed((): LayoutConfig => {
      const columnLayout = props.column.layout || {}
      const globalLayout = props.globalLayout || {}
      const layout = {
        ...globalLayout,
        ...columnLayout, // 表单项配置优先级最高
      }
      return layout
    })

    /** 合并样式配置：column.style > globalStyle > 默认值 */
    const mergedColumnStyle = computed((): StyleConfig => {
      const columnStyle = props.column.style || {}
      const globalStyle = props.globalStyle || {}
      const style = {
        ...globalStyle,
        ...columnStyle, // 表单项配置优先级最高
      }
      return style
    })

    const showLabel = computed(() => mergedColumnLayout.value.showLabel)
    const labelAlign = computed(() => mergedColumnLayout.value.labelAlign)
    const labelPosition = computed(() => mergedColumnLayout.value.labelPosition)
    const labelWidth = computed(() => {
      const width = mergedColumnLayout.value.labelWidth
      if (width === 'auto') {
        return '100%'
      }
      return width
    })

    const labelStyle = computed(() => {
      let width = '100%'

      if (labelAlign.value !== 'top') {
        if (typeof labelWidth.value === 'number') {
          // 确保数字是有效的
          if (isNaN(labelWidth.value) || !isFinite(labelWidth.value)) {
            width = '100px'
          } else {
            width = `${labelWidth.value}px`
          }
        } else if (typeof labelWidth.value === 'string') {
          width = labelWidth.value
        }
      }

      return { width }
    })

    // 检查组件是否应该使用内在宽度（intrinsic width）
    const hasIntrinsicWidth = computed(() => {
      const intrinsicWidthComponents = [
        'ToggleSwitch',
        'Checkbox',
        'Rating',
        'ColorPicker',
        'ToggleButton',
      ]
      return intrinsicWidthComponents.includes(props.column.component)
    })

    const componentStyle = computed((): Record<string, string> => {
      // 🔥 修复：使用 gap-md 后，不再使用 calc 计算宽度，而是让组件自动填充剩余空间
      // 对于 top 对齐，使用 100% 宽度
      if (labelAlign.value === 'top') {
        return { width: '100%' }
      }

      // 对于左右对齐，如果是内在宽度组件（ToggleSwitch 等），不设置 width
      // 让它们使用 CSS 默认值（来自 PrimeVue 的 CSS 变量）
      if (hasIntrinsicWidth.value) {
        return {}
      }

      // 🔥 其他组件（Password, InputNumber, Select 等）使用 width: 100% 填充剩余空间
      // 这些组件是 inline-flex，不会自动拉伸，需要显式设置 width: 100%
      return { width: '100%' }
    })

    // ==================== Methods ====================
    async function evalAll() {
      const result = await evalBoolish(props.column.visible ?? true, ctx.value)
      if (props.column.field === 'adminCode' || props.column.field === 'editableField') {
        console.log(`[FormItems] evalAll for ${props.column.field}`, {
          visible: result,
          ctxValues: toRaw(ctx.value.values),
        })
      }
      visible.value = result
      fieldDisabled.value =
        props.disabled || (await evalBoolish(props.column.disabled ?? false, ctx.value))
      readonly.value = await evalBoolish(props.column.readonly ?? false, ctx.value)

      if (props.column.props?.options) {
        loading.value = true
        try {
          const data = await loadOptions(props.column, ctx.value, props.optionsCacheTTL)
          options.value = data
        } finally {
          loading.value = false
        }
      }
    }

    // ==================== Lifecycle & Watchers ====================
    onMounted(() => {
      evalAll()
      // 确保 DatePicker、ColorPicker 和 Slider 字段提前在 PrimeVue Form 中注册（自定义组件不会自动注册）
      if (
        props.column.component === 'DatePicker' ||
        props.column.component === 'ColorPicker' ||
        props.column.component === 'Slider' ||
        props.column.component === 'Custom'
      ) {
        try {
          const fieldName = props.column.field
          if (props.form && typeof props.form.register === 'function') {
            if (!props.form[fieldName]) {
              props.form.register(fieldName)
              debugFormItems(`[SchemaForm][FormItems] ${props.column.component} registered field`, {
                field: fieldName,
                hasFieldAfter: !!props.form[fieldName],
                hasFormValues: !!props.form.values,
              })
            }
          }
        } catch (_) {
          // 忽略注册异常，后续更新时还有兜底
        }
      }
    })

    // 监听 dependsOn 触发刷新
    watch(
      () => (props.column.dependsOn || []).map((key: string) => (props.form.values || {})[key]),
      () => {
        if (process.env.NODE_ENV === 'development') {
          console.log(`[FormItems] Watch triggered for ${props.column.field}`, {
            dependsOn: props.column.dependsOn,
            values: toRaw(props.form.values),
          })
        }
        evalAll()
      },
      {
        deep: false,
      }
    )

    // 监听全局 disabled 变化，确保开关切换时 fieldDisabled 同步更新
    watch(
      () => props.disabled,
      () => {
        evalAll()
      }
    )

    // ==================== Preview Render ====================
    /** 格式化预览值（返回字符串） */
    function formatPreviewValue(value: unknown, component: string, options: OptionItem[]): string {
      if (value === null || value === undefined || value === '') {
        return '-'
      }

      switch (component) {
        case 'Checkbox':
        case 'ToggleSwitch':
          return value ? t('schemaForm.yes') : t('schemaForm.no')

        case 'Select':
        case 'Listbox':
        case 'RadioButton': {
          const option = options.find(opt => opt.value === value)
          return option ? option.label : String(value)
        }

        case 'MultiSelect':
        case 'SelectButton':
          if (Array.isArray(value)) {
            return value
              .map(v => {
                const option = options.find(opt => opt.value === v)
                return option ? option.label : String(v)
              })
              .join(', ')
          }
          return String(value)

        case 'DatePicker': {
          if (Array.isArray(value)) {
            return value
              .map(v => {
                if (v instanceof Date) {
                  return v.toLocaleDateString('zh-CN')
                }
                if (typeof v === 'number') {
                  return new Date(v).toLocaleDateString('zh-CN')
                }
                if (typeof v === 'string') {
                  return new Date(v).toLocaleDateString('zh-CN')
                }
                return String(v)
              })
              .join(' ~ ')
          }
          if (value instanceof Date) {
            return value.toLocaleDateString('zh-CN')
          }
          if (typeof value === 'number') {
            return new Date(value).toLocaleDateString('zh-CN')
          }
          if (typeof value === 'string') {
            try {
              return new Date(value).toLocaleDateString('zh-CN')
            } catch {
              return String(value)
            }
          }
          return String(value)
        }

        case 'ColorPicker': {
          const colorValue = typeof value === 'string' ? value : String(value)
          return colorValue.startsWith('#')
            ? colorValue.toUpperCase()
            : `#${colorValue.toUpperCase()}`
        }

        case 'Rating': {
          const rating = typeof value === 'number' ? value : 0
          return '★'.repeat(rating) + '☆'.repeat(5 - rating)
        }

        case 'Slider': {
          return typeof value === 'number' ? String(value) : String(value)
        }

        case 'Textarea': {
          return String(value).replace(/\n/g, '<br />')
        }

        case 'InputNumber': {
          // 预览模式下，直接显示数字，不添加千位分隔符
          return typeof value === 'number' ? String(value) : String(value)
        }

        default:
          return String(value)
      }
    }

    /** 预览模式渲染 */
    function renderPreview() {
      const column = props.column
      const value = fieldModelValue.value

      // 加载选项（如果需要），统一规范为 OptionItem[]，避免类型不匹配
      const displayOptions: OptionItem[] = Array.isArray(column.props?.options)
        ? (column.props?.options as OptionItem[])
        : options.value

      const previewText = formatPreviewValue(value, column.component, displayOptions)

      // ColorPicker 特殊处理：显示颜色块和颜色值
      if (column.component === 'ColorPicker' && value) {
        const colorValue = typeof value === 'string' ? value : String(value)
        const hexColor = colorValue.startsWith('#') ? colorValue : `#${colorValue}`
        return (
          <div
            class={[
              'form-item-content',
              'form-item-preview',
              'row-center gap-sm p-padding-md min-h-[var(--font-size-md)] text-primary',
              mergedColumnStyle.value.contentClass || '',
            ].filter(Boolean)}
            style={{
              ...componentStyle.value,
              ...(mergedColumnStyle.value.contentStyle || {}),
            }}
          >
            <div class="row-center gap-sm w-full">
              <div
                class="w-[var(--font-size-sm)] h-[var(--font-size-sm)] rounded-scale-sm border border-border shrink-0"
                style={{ backgroundColor: hexColor }}
              />
              <span>{hexColor.toUpperCase()}</span>
            </div>
          </div>
        )
      }

      // Textarea 特殊处理：支持换行
      if (column.component === 'Textarea') {
        return (
          <div
            class={[
              'form-item-content',
              'form-item-preview',
              'p-padding-md min-h-[var(--font-size-md)] text-primary',
              mergedColumnStyle.value.contentClass || '',
            ].filter(Boolean)}
            style={{
              ...componentStyle.value,
              ...(mergedColumnStyle.value.contentStyle || {}),
            }}
          >
            <div
              class="w-full"
              innerHTML={previewText}
            />
          </div>
        )
      }

      // 默认文本显示
      return (
        <div
          class={[
            'form-item-content',
            'form-item-preview',
            'row-center p-padding-md min-h-[var(--font-size-md)] text-primary',
            mergedColumnStyle.value.contentClass || '',
          ].filter(Boolean)}
          style={{
            ...componentStyle.value,
            ...(mergedColumnStyle.value.contentStyle || {}),
          }}
        >
          <span class="w-full">{previewText}</span>
        </div>
      )
    }

    // ==================== Render Component ====================
    function renderComponent() {
      // 如果是预览模式，直接返回预览渲染
      if (props.preview) {
        return renderPreview()
      }

      const column = props.column

      // 处理自定义组件
      if (column.component === 'Custom') {
        // 🔥 关键修复：使用 toRaw 获取原始的 render 函数，避免响应式包装问题
        const rawProps = column.props ? toRaw(column.props) : null
        const renderFn = rawProps?.render

        // 检查 render 函数是否存在且为函数类型
        if (!renderFn || typeof renderFn !== 'function') {
          if (process.env.NODE_ENV === 'development') {
            console.warn(
              `[FormItems] Custom 组件 "${column.field}" 缺少 render 函数或 render 不是函数`,
              {
                column: toRaw(column),
                props: rawProps,
                renderType: typeof renderFn,
                hasRender: 'render' in (rawProps || {}),
              }
            )
          }
          return (
            <div
              class="form-item-content form-item-error"
              style={componentStyle.value}
            >
              {t('schemaForm.customNoRender')}
            </div>
          )
        }

        // 自定义渲染
        const fieldState = props.form[column.field] as FormFieldState | undefined
        const hasError = !!(
          fieldState?.error ||
          (fieldState?.errors && fieldState.errors.length > 0)
        )
        const isInvalid = !!(
          fieldState?.invalid &&
          (fieldState?.touched || fieldState?.dirty || hasError)
        )

        // 🔥 关键修复：创建正确的 FieldRenderCtx 对象
        const renderCtx: FieldRenderCtx = {
          values: props.form.values || {},
          column: props.column,
          setValue: (value: unknown) => syncFieldValue(value),
        }

        // 🔥 关键修复：使用保存的 renderFn，传入正确的上下文
        try {
          return (
            <div
              class={[
                'form-item-content',
                isInvalid ? 'form-item-content-invalid' : '',
                mergedColumnStyle.value.contentClass || '',
              ].filter(Boolean)}
              style={{
                ...componentStyle.value,
                ...(mergedColumnStyle.value.contentStyle || {}),
              }}
            >
              {renderFn(renderCtx)}
            </div>
          )
        } catch (error) {
          if (process.env.NODE_ENV === 'development') {
            console.error(`[FormItems] Custom 组件 "${column.field}" render 函数执行失败:`, error)
          }
          return (
            <div
              class="form-item-content form-item-error"
              style={componentStyle.value}
            >
              {t('schemaForm.customRenderFailed')}
            </div>
          )
        }
      }

      // 从组件映射表获取组件
      const comp = getComponentFromMap(column.component)

      // 🔥 关键修复：确保 comp 不为 null/undefined，防止 Vue 渲染错误
      if (!comp) {
        if (process.env.NODE_ENV === 'development') {
          console.warn(`[FormItems] 组件 "${column.component}" 未在 componentMap 中找到`)
        }
        return (
          <div
            class="form-item-content form-item-error"
            style={componentStyle.value}
          >
            {t('schemaForm.unsupportedComponent', { component: column.component })}
          </div>
        )
      }

      // 是否校验失败
      const fieldState = props.form[column.field] as FormFieldState | undefined
      const hasError = !!(fieldState?.error || (fieldState?.errors && fieldState.errors.length > 0))
      const isInvalid = !!(
        fieldState?.invalid &&
        (fieldState?.touched || fieldState?.dirty || hasError)
      )

      // 基础属性
      const baseProps: Record<string, unknown> = {
        class: ['form-item-content', isInvalid ? 'form-item-content-invalid' : ''].filter(Boolean),
        style: {
          ...componentStyle.value,
        },
        disabled: fieldDisabled.value,
        readonly: readonly.value,
        placeholder: column.placeholder,
        modelValue: fieldModelValue.value,
      }
      baseProps['onUpdate:modelValue'] = handleModelValueUpdate

      // 安全地过滤 props，排除可能导致问题的属性
      const safeProps = column.props
        ? Object.fromEntries(
            Object.entries(column.props).filter(([key]) => {
              // 排除以 'on' 开头的属性，避免被当作事件处理器
              if (key.startsWith('on')) {
                return false
              }
              // 排除会破坏 Form 受控绑定的值相关属性
              if (
                key === 'value' ||
                key === 'modelValue' ||
                key === 'model-value' ||
                key === 'checked'
              ) {
                return false
              }
              return true
            })
          )
        : {}

      // 选项属性：当 options 为函数时使用已加载的 options.value，否则使用静态数组
      const optionsProps =
        column.props && Array.isArray(column.props.options) ? column.props.options : options.value

      // 构建组件 props
      const componentProps = buildComponentProps({
        column,
        baseProps,
        safeProps,
        mergedColumnStyle,
        componentStyle,
        options: optionsProps,
      })

      // 🔥 CascadeSelect 特殊处理：
      // buildComponentProps 默认会为带 options 的组件设置 optionValue = 'value'
      // 但 Schema 中的 CascadeSelect 示例使用的是层级对象（如 { cname, code, ... }），并没有 value 字段，
      // 如果强行使用 optionValue = 'value'，PrimeVue 会尝试读取 node['value']，结果为 undefined，导致无法正常选中。
      // 这里对 CascadeSelect 做一次兜底：仅当 Schema 未显式配置 optionValue 时，删除自动注入的 optionValue，
      // 让组件恢复 PrimeVue 原生行为（以整条节点对象作为值，或由 Schema 自行配置）。
      if (column.component === 'CascadeSelect') {
        const hasExplicitOptionValue = column.props && 'optionValue' in column.props
        if (!hasExplicitOptionValue && 'optionValue' in componentProps) {
          delete (componentProps as Record<string, unknown>).optionValue
        }
      }

      // ToggleButton 特殊处理：需要明确绑定 onLabel、offLabel 等属性
      if (column.component === 'ToggleButton') {
        const toggleButtonProps: Record<string, unknown> = {
          ...componentProps,
        }
        // 明确绑定这些属性，避免被当作事件处理器
        if (column.props?.onLabel) {
          toggleButtonProps.onLabel = column.props.onLabel
        }
        if (column.props?.offLabel) {
          toggleButtonProps.offLabel = column.props.offLabel
        }
        if (column.props?.onIcon) {
          toggleButtonProps.onIcon = column.props.onIcon
        }
        if (column.props?.offIcon) {
          toggleButtonProps.offIcon = column.props.offIcon
        }
        if (column.props?.ariaLabelledBy) {
          toggleButtonProps.ariaLabelledBy = column.props.ariaLabelledBy
        }
        /* eslint-disable-next-line @typescript-eslint/naming-convention -- Vue JSX requires PascalCase for dynamic component */
        const DynamicComp = comp as DefineComponent<
          Record<string, unknown>,
          Record<string, unknown>,
          unknown
        >
        return <DynamicComp {...(toggleButtonProps as Record<string, unknown>)} />
      }

      /* eslint-disable-next-line @typescript-eslint/naming-convention -- Vue JSX requires PascalCase for dynamic component */
      const DynamicComp = comp as DefineComponent<
        Record<string, unknown>,
        Record<string, unknown>,
        unknown
      >
      // 值从有到空时用 key 强制整组件重挂载，避免 Reset/Clear 后 UI 仍显示上次选中
      // 适用于：DatePicker、CascadeSelect、MultiSelect、Listbox、TreeSelect
      const COMPONENTS_NEED_REMOUNT_ON_CLEAR = [
        'DatePicker',
        'CascadeSelect',
        'MultiSelect',
        'Listbox',
        'TreeSelect',
      ]
      const val = fieldModelValue.value
      const isEmpty =
        COMPONENTS_NEED_REMOUNT_ON_CLEAR.includes(column.component) &&
        (column.component === 'MultiSelect' || column.component === 'Listbox'
          ? val == null || (Array.isArray(val) && val.length === 0)
          : val == null)
      const componentKey = COMPONENTS_NEED_REMOUNT_ON_CLEAR.includes(column.component)
        ? isEmpty
          ? `remount-${column.field}-empty`
          : `remount-${column.field}-${JSON.stringify(val)}`
        : undefined
      return (
        <DynamicComp
          key={componentKey}
          {...(componentProps as Record<string, unknown>)}
        />
      )
    }

    // ==================== Render ====================
    return () => {
      if (!visible.value) {
        return null
      }

      const column = props.column
      // 是否校验失败
      // 显示错误的条件：
      // 1. 字段状态为 invalid
      // 2. 且字段已被 touched 或 dirty（用户交互过）
      // 3. 或者字段有错误信息（提交失败时，即使未 touched 也应该显示）
      const fieldState = props.form[column.field] as FormFieldState | undefined
      const hasError = !!(fieldState?.error || (fieldState?.errors && fieldState.errors.length > 0))
      const isInvalid = !!(
        fieldState?.invalid &&
        (fieldState?.touched || fieldState?.dirty || hasError)
      )
      // 是否必填
      const isRequired = isFieldRequired(column)
      // 是否隐藏
      const isHidden = column.hidden === true
      // 是否保留隐藏字段的值（默认 false）
      const keepHiddenValue = column.hideValue === true
      // 是否保留所占栅格（默认 false）
      const keepBlock = column.hideBlock === true

      // 包裹元素样式（控制是否保留栅格/整体隐藏）
      const itemStyle: Record<string, string> = {
        ...props.style,
      }

      // 内容容器样式（控制内部可视/渲染）
      const contentStyle: Record<string, string> = {
        ...componentStyle.value,
      }

      // 是否需要隐藏 Label（当保留栅格但不保留值时，Label 也应隐藏）
      let hideLabel = false

      if (isHidden) {
        if (keepBlock) {
          // 保留栅格：外层不改变 grid 占位
          if (keepHiddenValue) {
            // 可获取值：渲染但不可见
            itemStyle.visibility = 'hidden'
            hideLabel = true
          } else {
            // 不可获取值：内容不显示（仍渲染外壳以占位）
            contentStyle.display = 'none'
            hideLabel = true
          }
        } else {
          // 不保留栅格
          if (keepHiddenValue) {
            // 可获取值：整体隐藏但仍渲染
            itemStyle.display = 'none'
            hideLabel = true
          } else {
            // 不可获取值：完全不渲染
            return null
          }
        }
      }

      return (
        <div
          class={[
            'form-item mb-margin-lg',
            labelAlign.value === 'top'
              ? 'column-between'
              : labelAlign.value === 'right'
                ? 'row cross-center gap-md flex-row-reverse'
                : 'row cross-center gap-md',
          ].filter(Boolean)}
          style={itemStyle}
          data-field-id={column.field}
        >
          {/* Label */}
          {showLabel.value && column.label && (
            <div
              style={{
                ...labelStyle.value,
                ...(mergedColumnStyle.value.labelStyle || {}), // 自定义标签样式（第一优先级）
                ...(hideLabel ? { display: 'none' } : {}),
              }}
              class={[
                'form-item-label',
                'py-padding-md',
                labelPosition.value === 'top' ? 'column main-center cross-start' : '',
                labelPosition.value === 'bottom' ? 'column main-center cross-end' : '',
                labelPosition.value === 'left' ? 'row main-between cross-start' : '',
                labelPosition.value === 'right' ? 'row main-between cross-end' : '',
                labelPosition.value === 'left-top' ? 'row main-between cross-start' : '',
                labelPosition.value === 'left-bottom' ? 'row main-between cross-end' : '',
                labelPosition.value === 'right-top' ? 'row main-between cross-end items-start' : '',
                labelPosition.value === 'right-bottom'
                  ? 'row main-between cross-end items-end'
                  : '',
                mergedColumnStyle.value.labelClass || '',
              ].filter(Boolean)}
            >
              {column.label}
              {!props.preview && isRequired && <span class="text-destructive ml-1">*</span>}
              {props.preview && '：'}
            </div>
          )}
          {/* 间距元素 - 只在非顶部对齐时显示 */}

          <div
            class={['relative h-auto', labelAlign.value === 'top' ? 'w-full' : 'flex-1'].filter(
              Boolean
            )}
            style={contentStyle}
          >
            {/* Component Container */}
            {renderComponent()}
            {/* Loading Spinner */}
            {!props.preview && loading.value && (
              <ProgressSpinner class="w-[var(--font-size-sm)] h-[var(--font-size-sm)] absolute right-2 top-1/2 -translate-y-1/2" />
            )}
            {/* Help Text */}
            {!props.preview && !isInvalid && column.help && (
              <div
                class={[
                  'absolute top-[calc(100%+2px)] left-0 z-1 text-muted-foreground select-none pl-padding-md pointer-events-none',
                  'fs-xs sm:fs-sm md:fs-md lg:fs-sm',
                ]}
              >
                {column.help}
              </div>
            )}
            {/* Validation Error */}
            {/* Validation Error */}
            {!props.preview && (
              <div class="absolute top-[calc(100%+2px)] min-w-full z-1 text-destructive row main-between cross-start select-none pointer-events-none">
                <AnimateWrapper
                  show={isInvalid}
                  enter="fadeIn"
                  leave="fadeOut"
                  duration="500ms"
                >
                  {isInvalid && (
                    <div
                      class={[
                        'w-full rounded-scale-md pl-padding-md',
                        'fs-xs sm:fs-sm md:fs-md lg:fs-sm',
                      ]}
                    >
                      {(() => {
                        const fieldState = props.form[column.field] as FormFieldState | undefined
                        const err = fieldState?.error
                        if (err && typeof err === 'object' && 'message' in err && err.message) {
                          return err.message
                        }
                        if (typeof err === 'string') {
                          return err
                        }
                        if (
                          fieldState?.errors &&
                          Array.isArray(fieldState.errors) &&
                          fieldState.errors.length > 0
                        ) {
                          return fieldState.errors[0]?.message || t('schemaForm.validationFailed')
                        }
                        return t('schemaForm.validationFailed')
                      })()}
                    </div>
                  )}
                </AnimateWrapper>
              </div>
            )}
          </div>
        </div>
      )
    }
  },
})
