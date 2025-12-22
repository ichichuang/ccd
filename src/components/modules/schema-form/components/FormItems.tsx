// @/components/schema-form/components/FormItems.tsx
import { AnimateWrapper } from '@/components/layout/animate-wrapper'
import { useColorStore, useSizeStore } from '@/stores'
import { computed, defineComponent, h, onMounted, ref, toRaw, watch } from 'vue'
import { evalBoolish, isFieldRequired, loadOptions } from '../utils/helper'
import type {
  EvalCtx,
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
  form: any
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
    // ==================== Stores ====================
    const colorStore = useColorStore()
    const sizeStore = useSizeStore()

    // ==================== Reactive State ====================
    const visible = ref(true)
    const fieldDisabled = ref(!!props.disabled)
    const readonly = ref(false)

    const options = ref<OptionItem[]>([])
    const loading = ref(false)

    // 🔥 核心修复：彻底简化 fieldModelValue，只从 form.values 中获取值
    // 移除对 props.form[props.column.field] 的访问，避免昂贵的计算和循环依赖
    const fieldModelValue = computed(() => {
      // 预览模式下，优先从 form.modelValue 获取（如果 SchemaForm 传递了的话）
      if (
        props.preview &&
        props.form &&
        props.form.modelValue &&
        typeof props.form.modelValue === 'object'
      ) {
        const value = props.form.modelValue[props.column.field]
        // 预览模式下，只有 undefined 和 null 才返回 undefined，其他值（包括空字符串、0、false）都应该显示
        if (value !== undefined && value !== null) {
          return value
        }
      }

      // 🔥 核心修改：只从 form.values 中获取值！
      // form.values 是 PrimeVue Form 提供的、专门用于表示当前所有字段值的响应式对象。
      // 这是最直接、最正确的来源。
      if (props.form && props.form.values && typeof props.form.values === 'object') {
        const value = props.form.values[props.column.field]
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

      // 如果 form.values 不存在，返回 undefined
      return undefined
    })

    const syncFieldValue = (value: any) => {
      const field = props.column.field

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
          ;(fieldRef as Record<string, any>).value = value
          return
        }
      }

      // 2. 最后才直接修改 form.values
      if (props.form && props.form.values && typeof props.form.values === 'object') {
        ;(props.form.values as Record<string, any>)[field] = value
      }
    }

    const handleModelValueUpdate = (value: any) => {
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

    const componentStyle = computed(() => {
      let labelWidthNum = 0

      if (typeof labelWidth.value === 'number') {
        labelWidthNum = labelWidth.value
      } else if (labelWidth.value === 'auto') {
        labelWidthNum = 0
      } else if (typeof labelWidth.value === 'string') {
        // 安全地解析字符串中的数字
        const match = labelWidth.value.match(/(\d+(?:\.\d+)?)/)
        labelWidthNum = match ? parseFloat(match[1]) : 0
      }

      // 确保 labelWidthNum 是有效数字
      if (isNaN(labelWidthNum) || !isFinite(labelWidthNum)) {
        labelWidthNum = 0
      }

      // 现在使用独立的间距元素，所以不需要在宽度计算中减去 gap
      return {
        width: labelAlign.value === 'top' ? '100%' : `calc(100% - ${labelWidthNum}px)`,
      }
    })

    // ==================== Methods ====================
    async function evalAll() {
      visible.value = await evalBoolish(props.column.visible ?? true, ctx.value)
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
        props.column.component === 'Slider'
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
        evalAll()
      },
      {
        deep: false,
      }
    )

    // ==================== Preview Render ====================
    /** 格式化预览值（返回字符串） */
    function formatPreviewValue(value: any, component: string, options: OptionItem[]): string {
      if (value === null || value === undefined || value === '') {
        return '-'
      }

      switch (component) {
        case 'Checkbox':
        case 'ToggleSwitch':
          return value ? '是' : '否'

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

      // 加载选项（如果需要）
      const displayOptions = column.props?.options || options.value

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
              mergedColumnStyle.value.contentClass || '',
            ].filter(Boolean)}
            style={{
              ...componentStyle.value,
              ...(mergedColumnStyle.value.contentStyle || {}),
              padding: `${sizeStore.getPaddingsValue}px ${sizeStore.getPaddingsValue}px`,
              minHeight: `${sizeStore.getFontSizeValue}px`,
              display: 'flex',
              alignItems: 'center',
              color: colorStore.getText100,
            }}
          >
            <div class="flex items-center gap-gaps w-full">
              <div
                style={{
                  width: `${sizeStore.getFontSizeValue}px`,
                  height: `${sizeStore.getFontSizeValue}px`,
                  backgroundColor: hexColor,
                  border: `1px solid ${colorStore.getBg300}`,
                  borderRadius: `${sizeStore.getRoundedValue}px`,
                  flexShrink: 0,
                }}
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
              mergedColumnStyle.value.contentClass || '',
            ].filter(Boolean)}
            style={{
              ...componentStyle.value,
              ...(mergedColumnStyle.value.contentStyle || {}),
              padding: `${sizeStore.getPaddingsValue}px ${sizeStore.getPaddingsValue}px`,
              minHeight: `${sizeStore.getFontSizeValue}px`,
              color: colorStore.getText100,
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
            mergedColumnStyle.value.contentClass || '',
          ].filter(Boolean)}
          style={{
            ...componentStyle.value,
            ...(mergedColumnStyle.value.contentStyle || {}),
            padding: `${sizeStore.getPaddingsValue}px ${sizeStore.getPaddingsValue}px`,
            minHeight: `${sizeStore.getFontSizeValue}px`,
            display: 'flex',
            alignItems: 'center',
            color: colorStore.getText100,
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
              自定义组件缺少 render 函数
            </div>
          )
        }

        // 自定义渲染
        const fieldState = props.form[column.field]
        const hasError = !!(
          fieldState?.error ||
          (fieldState?.errors && fieldState.errors.length > 0)
        )
        const isInvalid = !!(
          fieldState?.invalid &&
          (fieldState?.touched || fieldState?.dirty || hasError)
        )

        const baseProps: Record<string, any> = {
          class: ['form-item-content', isInvalid ? 'form-item-content-invalid' : ''].filter(
            Boolean
          ),
          style: {
            ...componentStyle.value,
          },
          disabled: fieldDisabled.value,
          readonly: readonly.value,
          placeholder: column.placeholder,
          modelValue: fieldModelValue.value,
          name: column.field,
        }

        // 🔥 关键修复：保留 render 函数，不被过滤
        const safeProps = column.props
          ? Object.fromEntries(
              Object.entries(column.props).filter(([key]) => {
                // 保留 render 函数
                if (key === 'render') {
                  return true
                }
                if (key.startsWith('on')) {
                  return false
                }
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

        const componentProps = {
          ...baseProps,
          ...safeProps,
          class: [...baseProps.class, mergedColumnStyle.value.contentClass || ''].filter(Boolean),
          style: {
            ...baseProps.style,
            ...(mergedColumnStyle.value.contentStyle || {}),
          },
        }

        // 🔥 关键修复：使用保存的 renderFn，确保它是函数
        try {
          return (
            <div
              class={componentProps.class}
              style={componentProps.style}
            >
              {renderFn(componentProps)}
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
              自定义组件渲染失败
            </div>
          )
        }
      }

      // 从组件映射表获取组件
      const component = getComponentFromMap(column.component)

      // 🔥 关键修复：确保 component 不为 null/undefined，防止 Vue 渲染错误
      if (!component) {
        if (process.env.NODE_ENV === 'development') {
          console.warn(`[FormItems] 组件 "${column.component}" 未在 componentMap 中找到`)
        }
        return (
          <div
            class="form-item-content form-item-error"
            style={componentStyle.value}
          >
            不支持的组件类型: {column.component}
          </div>
        )
      }

      // 是否校验失败
      const fieldState = props.form[column.field]
      const hasError = !!(fieldState?.error || (fieldState?.errors && fieldState.errors.length > 0))
      const isInvalid = !!(
        fieldState?.invalid &&
        (fieldState?.touched || fieldState?.dirty || hasError)
      )

      // 基础属性
      const baseProps: Record<string, any> = {
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

      // 选项属性
      const optionsProps = column.props?.options || options.value

      // 构建组件 props
      const componentProps = buildComponentProps({
        column,
        baseProps,
        safeProps,
        mergedColumnStyle,
        componentStyle,
        options: optionsProps,
      })

      // ToggleButton 特殊处理：需要明确绑定 onLabel、offLabel 等属性
      if (column.component === 'ToggleButton') {
        const toggleButtonProps: Record<string, any> = {
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
        return h(component, toggleButtonProps)
      }

      // 使用 h 函数渲染组件
      return h(component, componentProps)
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
      const fieldState = props.form[column.field]
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
        marginBottom: '24px',
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
            'form-item',
            labelAlign.value === 'top'
              ? 'between-col'
              : labelAlign.value === 'right'
                ? 'between-start flex-row-reverse'
                : 'between-start', // 改为 between-start 而不是 between
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
                'py-paddings',
                labelPosition.value === 'top' ? 'center-start' : '',
                labelPosition.value === 'bottom' ? 'center-end' : '',
                labelPosition.value === 'left' ? 'between-start' : '',
                labelPosition.value === 'right' ? 'between-end' : '',
                labelPosition.value === 'left-top' ? 'between-start items-start' : '',
                labelPosition.value === 'left-bottom' ? 'between-start items-end' : '',
                labelPosition.value === 'right-top' ? 'between-end items-start' : '',
                labelPosition.value === 'right-bottom' ? 'between-end items-end' : '',
                mergedColumnStyle.value.labelClass || '', // 自定义标签类名（第一优先级）
              ].filter(Boolean)}
            >
              {column.label}
              {props.preview && '：'}
              {!props.preview && isRequired && (
                <div
                  class={[
                    'fs-appFontSizes mb-6',
                    isInvalid ? 'color-dangerColor' : 'color-dangerActiveColor',
                  ]}
                >
                  &nbsp;*
                </div>
              )}
            </div>
          )}
          {/* 间距元素 - 只在非顶部对齐时显示 */}

          <div
            class={['relative w-full ha'].filter(Boolean)}
            style={contentStyle}
          >
            {/* Component Container */}
            {renderComponent()}
            {/* Loading Spinner */}
            {!props.preview && loading.value && (
              <ProgressSpinner class="w-appFontSizex h-appFontSizex absolute right-2 top-1/2 -translate-y-1/2" />
            )}
            {/* Help Text */}
            {!props.preview && !isInvalid && column.help && (
              <div
                class={[
                  'absolute top-[calc(100%+2px)] left-0 z-1 color-bg300 select-none pl-paddings pointer-events-none',
                  'fs-10 sm:fs-12 md:fs-14 lg:fs-12',
                ]}
              >
                {column.help}
              </div>
            )}
            {/* Validation Error */}
            {!props.preview && (
              <AnimateWrapper
                class="absolute top-[calc(100%+2px)] min-w-full z-1 color-dangerColor between-start! select-none pointer-events-none"
                show={isInvalid}
                enter="fadeIn"
                leave="fadeOut"
                duration="500ms"
              >
                {isInvalid && (
                  <div
                    class={['full rounded-rounded pl-paddings', 'fs-10 sm:fs-12 md:fs-14 lg:fs-12']}
                  >
                    {(() => {
                      const fieldState = props.form[column.field]
                      // 优先使用 error.message（单个错误）
                      if (fieldState?.error?.message) {
                        return fieldState.error.message
                      }
                      // 其次使用 errors[0].message（多个错误中的第一个）
                      if (
                        fieldState?.errors &&
                        Array.isArray(fieldState.errors) &&
                        fieldState.errors.length > 0
                      ) {
                        return fieldState.errors[0]?.message || '验证失败'
                      }
                      // 最后使用 error（字符串格式）
                      if (fieldState?.error && typeof fieldState.error === 'string') {
                        return fieldState.error
                      }
                      return '验证失败'
                    })()}
                  </div>
                )}
              </AnimateWrapper>
            )}
          </div>
        </div>
      )
    }
  },
})
