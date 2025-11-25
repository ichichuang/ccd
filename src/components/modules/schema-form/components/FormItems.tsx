// @/components/schema-form/components/FormItems.tsx
import { AnimateWrapper } from '@/components/modules/animate-wrapper'
import { computed, defineComponent, onMounted, ref, watch } from 'vue'
import { evalBoolish, isFieldRequired, loadOptions } from '../utils/helper'
import type {
  EvalCtx,
  LayoutConfig,
  OptionItem,
  SchemaColumnsItem,
  StyleConfig,
} from '../utils/types'

// PrimeVue Components
import AutoComplete from 'primevue/autocomplete'
import CascadeSelect from 'primevue/cascadeselect'
import Checkbox from 'primevue/checkbox'
import ColorPicker from 'primevue/colorpicker'
import InputGroup from 'primevue/inputgroup'
import InputGroupAddon from 'primevue/inputgroupaddon'
import InputMask from 'primevue/inputmask'
import InputNumber from 'primevue/inputnumber'
import InputText from 'primevue/inputtext'
import Listbox from 'primevue/listbox'
import MultiSelect from 'primevue/multiselect'
import Password from 'primevue/password'
import ProgressSpinner from 'primevue/progressspinner'
import RadioButton from 'primevue/radiobutton'
import RadioButtonGroup from 'primevue/radiobuttongroup'
import Rating from 'primevue/rating'
import Select from 'primevue/select'
import SelectButton from 'primevue/selectbutton'
import Slider from 'primevue/slider'
import Textarea from 'primevue/textarea'
import ToggleButton from 'primevue/togglebutton'
import ToggleSwitch from 'primevue/toggleswitch'
import TreeSelect from 'primevue/treeselect'

// Custom Components
import { DatePicker } from '@/components/modules/date-picker'
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
  },
  setup(props: SchemaFormItemProps) {
    // ==================== Reactive State ====================
    const visible = ref(true)
    const fieldDisabled = ref(!!props.disabled)
    const readonly = ref(false)

    const options = ref<OptionItem[]>([])
    const loading = ref(false)
    const autoCompleteSuggestions = ref<OptionItem[]>([])

    // 为 DatePicker 创建响应式的 modelValue 引用
    // 这样当 form.values 变化时，DatePicker 能自动更新
    const datePickerModelValue = computed(() => {
      if (props.form && props.form.values && typeof props.form.values === 'object') {
        return props.form.values[props.column.field]
      }
      if (props.form && props.form[props.column.field]) {
        const fieldRef = props.form[props.column.field]
        if (fieldRef && typeof fieldRef === 'object' && 'value' in fieldRef) {
          return fieldRef.value
        }
        return props.form[props.column.field]
      }
      return undefined
    })

    // 为 ColorPicker 创建响应式的 modelValue 引用
    // 这样当 form.values 变化时，ColorPicker 能自动更新
    const colorPickerModelValue = computed(() => {
      if (props.form && props.form.values && typeof props.form.values === 'object') {
        const value = props.form.values[props.column.field]
        // 如果值是字符串且没有 # 前缀，添加 # 前缀（PrimeVue ColorPicker 需要 # 前缀）
        if (typeof value === 'string' && value && !value.startsWith('#')) {
          return `#${value}`
        }
        return value
      }
      if (props.form && props.form[props.column.field]) {
        const fieldRef = props.form[props.column.field]
        if (fieldRef && typeof fieldRef === 'object' && 'value' in fieldRef) {
          const value = fieldRef.value
          if (typeof value === 'string' && value && !value.startsWith('#')) {
            return `#${value}`
          }
          return value
        }
        const value = props.form[props.column.field]
        if (typeof value === 'string' && value && !value.startsWith('#')) {
          return `#${value}`
        }
        return value
      }
      return undefined
    })

    // 监听 form.values 的变化，确保 DatePicker 能响应式更新
    watch(
      () => {
        if (props.form && props.form.values && typeof props.form.values === 'object') {
          return props.form.values[props.column.field]
        }
        return undefined
      },
      newValue => {
        if (props.column.component === 'DatePicker') {
          debugFormItems('[SchemaForm][FormItems] DatePicker form.values watcher', {
            field: props.column.field,
            newValue,
            hasFormValues: !!(props.form && props.form.values),
            formValuesKeys: props.form && props.form.values ? Object.keys(props.form.values) : [],
          })
        }
      },
      { immediate: true, deep: true }
    )

    const fieldModelValue = computed(() => {
      if (props.form && props.form.values && typeof props.form.values === 'object') {
        return props.form.values[props.column.field]
      }
      const fieldRef = props.form?.[props.column.field]
      if (fieldRef && typeof fieldRef === 'object' && 'value' in fieldRef) {
        return fieldRef.value
      }
      if (fieldRef !== undefined) {
        return fieldRef
      }
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
      refreshAutoCompleteSuggestions()
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

    function getAutoCompleteBaseOptions(): OptionItem[] {
      if (Array.isArray(props.column.props?.options)) {
        return [...(props.column.props?.options as OptionItem[])]
      }
      return [...options.value]
    }

    function refreshAutoCompleteSuggestions() {
      if (props.column.component !== 'AutoComplete') {
        return
      }
      autoCompleteSuggestions.value = getAutoCompleteBaseOptions()
    }

    function filterAutoCompleteSuggestions(query: string) {
      const baseOptions = getAutoCompleteBaseOptions()
      if (!query) {
        autoCompleteSuggestions.value = baseOptions
        return
      }
      const lower = query.toLowerCase()
      autoCompleteSuggestions.value = baseOptions.filter(item =>
        String(item.label ?? '')
          .toLowerCase()
          .includes(lower)
      )
    }

    // ==================== Render Component ====================
    function renderComponent() {
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

      // 使用 PrimeVue Form 的 name 属性绑定
      const componentProps = {
        ...baseProps,
        ...safeProps,
        name: column.field, // PrimeVue Form 使用 name 属性绑定字段
        class: [
          ...baseProps.class,
          mergedColumnStyle.value.contentClass || '', // 自定义内容类名（第一优先级）
        ].filter(Boolean),
        style: {
          ...baseProps.style,
          ...(mergedColumnStyle.value.contentStyle || {}), // 自定义内容样式（第一优先级）
        },
      }

      // 选项属性 - 只从 props 中获取
      const optionsProps = column.props?.options || options.value

      switch (column.component) {
        case 'AutoComplete': {
          const autoCompleteProps: Record<string, any> = { ...componentProps }

          if (autoCompleteProps.optionLabel === undefined) {
            autoCompleteProps.optionLabel = 'label'
          }
          if (autoCompleteProps.optionValue === undefined) {
            autoCompleteProps.optionValue = 'value'
          }

          const userCompleteMethod = autoCompleteProps.completeMethod
          const userOnFocus = autoCompleteProps.onFocus
          const hasCustomComplete = typeof userCompleteMethod === 'function'

          if (!hasCustomComplete) {
            if (autoCompleteSuggestions.value.length === 0) {
              autoCompleteSuggestions.value = getAutoCompleteBaseOptions()
            }
            autoCompleteProps.suggestions = autoCompleteSuggestions.value
            autoCompleteProps.completeMethod = (event: { query?: string }) => {
              filterAutoCompleteSuggestions((event?.query ?? '').toString())
            }
            autoCompleteProps.onFocus = (event: any) => {
              filterAutoCompleteSuggestions('')
              if (typeof userOnFocus === 'function') {
                userOnFocus(event)
              }
            }
          } else {
            autoCompleteProps.completeMethod = (event: any) => {
              userCompleteMethod(event)
            }
            if (autoCompleteProps.suggestions === undefined) {
              autoCompleteProps.suggestions = getAutoCompleteBaseOptions()
            }
            if (typeof userOnFocus === 'function') {
              autoCompleteProps.onFocus = (event: any) => {
                userOnFocus(event)
              }
            }
          }

          return <AutoComplete {...autoCompleteProps} />
        }
        case 'CascadeSelect':
          return (
            <CascadeSelect
              {...componentProps}
              options={optionsProps}
              optionGroupLabel="label"
              optionGroupChildren="children"
              class={[
                ...baseProps.class,
                mergedColumnStyle.value.contentClass || '', // 自定义内容类名（第一优先级）
              ].filter(Boolean)}
              style={{
                ...baseProps.style,
                ...(mergedColumnStyle.value.contentStyle || {}), // 自定义内容样式（第一优先级）
              }}
            />
          )

        case 'Checkbox':
          return <Checkbox {...componentProps} />

        case 'ColorPicker': {
          // ColorPicker 使用 v-model，需要手动同步值到 form.values
          const format = (componentProps as any).format ?? 'hex'

          // 定义更新回调函数
          const handleColorPickerUpdate = (value: any) => {
            let normalizedValue = value
            if (format === 'hex' && typeof value === 'string') {
              normalizedValue = value.replace(/^#/, '').toLowerCase()
            }
            syncFieldValue(normalizedValue)
          }

          // 构建 props，排除可能冲突的事件处理器和值相关属性
          const restComponentProps: Record<string, any> = {}
          for (const key in componentProps) {
            if (
              key !== 'onUpdateModelValue' &&
              key !== 'onUpdate:modelValue' &&
              key !== 'onChange' &&
              key !== 'modelValue' &&
              key !== 'format' &&
              !key.startsWith('on')
            ) {
              restComponentProps[key] = (componentProps as any)[key]
            }
          }

          const colorPickerProps = {
            ...restComponentProps,
            // 保留 name 属性，确保 PrimeVue Form 能识别并管理此字段
            name: column.field,
            format,
          }

          // 在 Vue 3 JSX 中，update:modelValue 事件需要使用对象形式绑定
          const colorPickerEventHandlers: Record<string, any> = {}
          colorPickerEventHandlers['onUpdate:modelValue'] = handleColorPickerUpdate

          // 在 JSX 中直接使用 computed 的值，确保响应式更新
          return (
            <ColorPicker
              {...colorPickerProps}
              {...colorPickerEventHandlers}
              modelValue={colorPickerModelValue.value}
              class={[
                ...baseProps.class,
                mergedColumnStyle.value.contentClass || '', // 自定义内容类名（第一优先级）
              ].filter(Boolean)}
              style={{
                ...baseProps.style,
                ...(mergedColumnStyle.value.contentStyle || {}), // 自定义内容样式（第一优先级）
              }}
            />
          )
        }

        case 'DatePicker': {
          // DatePicker 使用 v-model，需要手动同步值到 form.values
          const valueFormat = (componentProps as any).valueFormat ?? 'timestamp'

          // 定义更新回调函数
          debugFormItems('[SchemaForm][FormItems] DatePicker initial check', {
            field: column.field,
            datePickerModelValue: datePickerModelValue.value,
            formValues: props.form?.values,
            formField: props.form?.[column.field],
            hasValue:
              datePickerModelValue.value !== undefined && datePickerModelValue.value !== null,
          })
          const handleDatePickerUpdate = (value: any) => {
            debugFormItems('[SchemaForm][FormItems] onUpdateModelValue CALLED', {
              field: column.field,
              value,
              valueType: typeof value,
              isArray: Array.isArray(value),
              formKeys: props.form ? Object.keys(props.form) : [],
              hasFormValues: !!(props.form && props.form.values),
            })
            syncFieldValue(value)
          }

          // 构建 props，排除可能冲突的事件处理器和值相关属性
          // 注意：在 TypeScript 中，我们需要明确类型以避免解构错误
          const restComponentProps: Record<string, any> = {}
          for (const key in componentProps) {
            if (
              key !== 'onUpdateModelValue' &&
              key !== 'onUpdate:modelValue' &&
              key !== 'onChange' &&
              key !== 'modelValue' &&
              key !== 'valueFormat' &&
              !key.startsWith('on')
            ) {
              restComponentProps[key] = (componentProps as any)[key]
            }
          }

          const datePickerProps = {
            ...restComponentProps,
            // 保留 name 属性，确保 PrimeVue Form 能识别并管理此字段
            name: column.field,
            valueFormat,
          }

          debugFormItems('[SchemaForm][FormItems] DatePicker render', {
            field: column.field,
            currentModelValue: datePickerModelValue.value,
            hasHandler: typeof handleDatePickerUpdate === 'function',
            datePickerPropsKeys: Object.keys(datePickerProps),
            handlerType: typeof handleDatePickerUpdate,
            hasFormValues: !!(props.form && props.form.values),
            formValuesKeys: props.form && props.form.values ? Object.keys(props.form.values) : [],
            formFieldValue: props.form ? props.form[column.field] : undefined,
          })

          // 在 Vue 3 JSX 中，update:modelValue 事件需要使用对象形式绑定
          // 使用方括号语法来避免 ESLint 错误
          const datePickerEventHandlers: Record<string, any> = {}
          datePickerEventHandlers['onUpdate:modelValue'] = handleDatePickerUpdate

          // 在 JSX 中直接使用 computed 的值，确保响应式更新
          return (
            <DatePicker
              {...datePickerProps}
              {...datePickerEventHandlers}
              modelValue={datePickerModelValue.value}
              class={[
                ...baseProps.class,
                mergedColumnStyle.value.contentClass || '', // 自定义内容类名（第一优先级）
              ].filter(Boolean)}
              style={{
                ...baseProps.style,
                ...(mergedColumnStyle.value.contentStyle || {}), // 自定义内容样式（第一优先级）
              }}
            />
          )
        }

        case 'Editor':
          return <div>不支持的组件类型: {column.component}</div>
        case 'InputGroup': {
          // InputGroup 需要特殊处理，因为它需要包含 InputGroupAddon 和实际的输入组件
          const { addonBefore, addonAfter, ...otherProps } = column.props || {}
          return (
            <InputGroup
              {...otherProps}
              class={[
                ...baseProps.class,
                mergedColumnStyle.value.contentClass || '', // 自定义内容类名（第一优先级）
              ].filter(Boolean)}
              style={{
                ...baseProps.style,
                ...(mergedColumnStyle.value.contentStyle || {}), // 自定义内容样式（第一优先级）
              }}
            >
              {addonBefore && <InputGroupAddon>{addonBefore}</InputGroupAddon>}
              <InputText
                {...baseProps}
                name={column.field}
                placeholder={column.placeholder}
              />
              {addonAfter && <InputGroupAddon>{addonAfter}</InputGroupAddon>}
            </InputGroup>
          )
        }

        case 'InputMask':
          return <InputMask {...componentProps} />

        case 'InputNumber':
          return <InputNumber {...componentProps} />

        case 'InputText':
          return <InputText {...componentProps} />

        /* case 'KeyFilter':
          return <KeyFilter {...componentProps} /> */

        case 'Listbox':
          return (
            <Listbox
              {...componentProps}
              options={optionsProps}
              optionLabel="label"
              optionValue="value"
              class={[
                ...baseProps.class,
                mergedColumnStyle.value.contentClass || '', // 自定义内容类名（第一优先级）
              ].filter(Boolean)}
              style={{
                ...baseProps.style,
                ...(mergedColumnStyle.value.contentStyle || {}), // 自定义内容样式（第一优先级）
              }}
            />
          )

        case 'MultiSelect':
          return (
            <MultiSelect
              {...componentProps}
              options={optionsProps}
              optionLabel="label"
              optionValue="value"
              class={[
                ...baseProps.class,
                mergedColumnStyle.value.contentClass || '', // 自定义内容类名（第一优先级）
              ].filter(Boolean)}
              style={{
                ...baseProps.style,
                ...(mergedColumnStyle.value.contentStyle || {}), // 自定义内容样式（第一优先级）
              }}
            />
          )

        case 'Password':
          return <Password {...componentProps} />

        case 'RadioButton': {
          // RadioButton 需要特殊处理，使用 RadioButtonGroup 包装多个选项
          return (
            <RadioButtonGroup
              name={column.field}
              class={[
                ...baseProps.class,
                mergedColumnStyle.value.contentClass || '', // 自定义内容类名（第一优先级）
              ].filter(Boolean)}
              style={{
                ...baseProps.style,
                ...(mergedColumnStyle.value.contentStyle || {}), // 自定义内容样式（第一优先级）
              }}
            >
              {optionsProps.map((option: any, index: number) => (
                <div
                  key={option.value}
                  class="flex items-center gap-2"
                >
                  <RadioButton
                    inputId={`${column.field}_${index}`}
                    value={option.value}
                    disabled={fieldDisabled.value}
                  />
                  <label for={`${column.field}_${index}`}>{option.label}</label>
                </div>
              ))}
            </RadioButtonGroup>
          )
        }

        case 'Rating':
          return <Rating {...componentProps} />

        case 'Select':
          return (
            <Select
              {...componentProps}
              options={optionsProps}
              optionLabel="label"
              optionValue="value"
              class={[
                ...baseProps.class,
                mergedColumnStyle.value.contentClass || '', // 自定义内容类名（第一优先级）
              ].filter(Boolean)}
              style={{
                ...baseProps.style,
                ...(mergedColumnStyle.value.contentStyle || {}), // 自定义内容样式（第一优先级）
              }}
            />
          )

        case 'SelectButton':
          return (
            <SelectButton
              {...componentProps}
              options={optionsProps}
              optionLabel="label"
              optionValue="value"
              class={[
                ...baseProps.class,
                mergedColumnStyle.value.contentClass || '', // 自定义内容类名（第一优先级）
              ].filter(Boolean)}
              style={{
                ...baseProps.style,
                ...(mergedColumnStyle.value.contentStyle || {}), // 自定义内容样式（第一优先级）
              }}
            />
          )

        case 'Slider': {
          // Slider 需要单独处理事件绑定，避免 JSX 中的事件名解析问题
          const sliderValue = fieldModelValue.value

          // 定义更新回调函数
          const handleSliderUpdate = (value: any) => {
            syncFieldValue(value)
          }

          // 构建 props，排除事件处理器
          const restComponentProps: Record<string, any> = {}
          for (const key in componentProps) {
            if (
              key !== 'onUpdateModelValue' &&
              key !== 'onUpdate:modelValue' &&
              key !== 'onChange' &&
              key !== 'onValueChange' &&
              key !== 'onSlideend' &&
              key !== 'modelValue' &&
              !key.startsWith('on')
            ) {
              restComponentProps[key] = (componentProps as any)[key]
            }
          }

          const sliderProps = {
            ...restComponentProps,
            name: column.field,
          }

          // 🔥 关键：监听多个事件以确保实时更新
          // - change: 拖动过程中实时触发（实时更新的关键）
          // - update:modelValue: 标准 v-model 事件（拖动结束或值变化）
          // - slideend: 拖动结束时触发（确保最终值）
          const sliderEventHandlers: Record<string, any> = {}
          sliderEventHandlers['onUpdate:modelValue'] = handleSliderUpdate
          sliderEventHandlers['onChange'] = handleSliderUpdate // 实时更新的关键
          sliderEventHandlers['onSlideend'] = (event: any) => {
            // slideend 事件携带 { originalEvent, value }
            if (event && typeof event === 'object' && 'value' in event) {
              handleSliderUpdate(event.value)
            }
          }

          return (
            <Slider
              {...sliderProps}
              {...sliderEventHandlers}
              modelValue={sliderValue}
              class={[...baseProps.class, mergedColumnStyle.value.contentClass || ''].filter(
                Boolean
              )}
              style={{
                ...baseProps.style,
                ...(mergedColumnStyle.value.contentStyle || {}),
              }}
            />
          )
        }

        case 'Textarea':
          return <Textarea {...componentProps} />

        case 'ToggleButton': {
          // 为 ToggleButton 单独处理属性，避免 onLabel 等被当作事件处理器
          const toggleButtonProps: any = {
            class: [
              ...baseProps.class,
              mergedColumnStyle.value.contentClass || '', // 自定义内容类名（第一优先级）
            ].filter(Boolean),
            style: {
              ...baseProps.style,
              ...(mergedColumnStyle.value.contentStyle || {}), // 自定义内容样式（第一优先级）
            },
            disabled: baseProps.disabled,
            readonly: baseProps.readonly,
            placeholder: baseProps.placeholder,
            name: column.field,
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
          return <ToggleButton {...toggleButtonProps} />
        }

        case 'ToggleSwitch':
          return <ToggleSwitch {...componentProps} />

        case 'TreeSelect': {
          // TreeSelect 需要 TreeNode 格式的数据，需要转换
          const treeNodes = optionsProps.map((item: any) => ({
            key: item.value,
            label: item.label,
            data: item.value,
            children:
              item.children?.map((child: any) => ({
                key: child.value,
                label: child.label,
                data: child.value,
                children:
                  child.children?.map((grandChild: any) => ({
                    key: grandChild.value,
                    label: grandChild.label,
                    data: grandChild.value,
                  })) || [],
              })) || [],
          }))

          return (
            <TreeSelect
              {...componentProps}
              modelValue={props.form.values?.[column.field]}
              options={treeNodes}
              class={[
                ...baseProps.class,
                mergedColumnStyle.value.contentClass || '', // 自定义内容类名（第一优先级）
              ].filter(Boolean)}
              style={{
                ...baseProps.style,
                ...(mergedColumnStyle.value.contentStyle || {}), // 自定义内容样式（第一优先级）
              }}
            />
          )
        }

        /* 自定义渲染 */
        case 'Custom':
          return (
            <div
              class={[
                ...baseProps.class,
                mergedColumnStyle.value.contentClass || '', // 自定义内容类名（第一优先级）
              ].filter(Boolean)}
              style={{
                ...baseProps.style,
                ...(mergedColumnStyle.value.contentStyle || {}), // 自定义内容样式（第一优先级）
              }}
            >
              {column.props?.render(componentProps)}
            </div>
          )

        default:
          return <div>不支持的组件类型: {column.component}</div>
      }
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
              {isRequired && (
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
            {loading.value && (
              <ProgressSpinner class="w-appFontSizex h-appFontSizex absolute right-2 top-1/2 -translate-y-1/2" />
            )}
            {/* Help Text */}
            {!isInvalid && column.help && (
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
          </div>
        </div>
      )
    }
  },
})
