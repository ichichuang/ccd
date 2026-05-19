import { fieldRegistry } from '../engine/registry/FieldRegistry'
import type {
  FieldComponent,
  FieldRegistryItem,
  FieldSchema,
  FieldComponentProps,
} from '../engine/types'
import ProInputText from './components/ProInputText.vue'
import ProSelect from './components/ProSelect.vue'
import ProTextarea from './components/ProTextarea.vue'
import ProInputNumber from './components/ProInputNumber.vue'
import ProSwitch from './components/ProSwitch.vue'
import ProCheckbox from './components/ProCheckbox.vue'
import ProRadio from './components/ProRadio.vue'
import ProDatePicker from './components/ProDatePicker.vue'
import ProMultiSelect from './components/ProMultiSelect.vue'
import ProSlider from './components/ProSlider.vue'
import ProInputMask from './components/ProInputMask.vue'
import ProRating from './components/ProRating.vue'
import ProUpload from './components/ProUpload.vue'

export function registerBuiltinFields(): void {
  // 基础文本输入
  fieldRegistry.register('input', {
    component: ProInputText as FieldComponent<unknown>,
  } as FieldRegistryItem)

  // 下拉选择
  fieldRegistry.register('select', {
    component: ProSelect as FieldComponent<unknown>,
    defaultProps: {
      class: 'w-full',
      optionLabel: 'label',
      optionValue: 'value',
    },
  } as FieldRegistryItem)

  // 多行文本
  fieldRegistry.register('textarea', {
    component: ProTextarea as FieldComponent<unknown>,
    defaultProps: {
      autoResize: true,
    },
  } as FieldRegistryItem)

  // 数值输入（整数 / 货币 / 百分比）
  fieldRegistry.register('number', {
    component: ProInputNumber as FieldComponent<unknown>,
  } as FieldRegistryItem)

  // 布尔开关
  fieldRegistry.register('switch', {
    component: ProSwitch as FieldComponent<unknown>,
    propsMapper: ({
      componentProps,
    }: {
      field: FieldSchema<unknown>
      componentProps: FieldComponentProps<unknown>
    }) => ({
      disabled: componentProps.disabled || componentProps.readonly,
    }),
  } as FieldRegistryItem)

  // 复选框（单选 / 多选）
  fieldRegistry.register('checkbox', {
    component: ProCheckbox as FieldComponent<unknown>,
  } as FieldRegistryItem)

  // 单选组
  fieldRegistry.register('radio', {
    component: ProRadio as FieldComponent<unknown>,
  } as FieldRegistryItem)

  // 日期 / 时间 / 区间选择
  fieldRegistry.register('date', {
    component: ProDatePicker as FieldComponent<unknown>,
  } as FieldRegistryItem)

  // 多选下拉
  fieldRegistry.register('multiselect', {
    component: ProMultiSelect as FieldComponent<unknown>,
    defaultProps: {
      class: 'w-full',
      optionLabel: 'label',
      optionValue: 'value',
    },
  } as FieldRegistryItem)

  // 滑块（单值 / 区间）
  fieldRegistry.register('slider', {
    component: ProSlider as FieldComponent<unknown>,
  } as FieldRegistryItem)

  // 掩码输入
  fieldRegistry.register('mask', {
    component: ProInputMask as FieldComponent<unknown>,
  } as FieldRegistryItem)

  // 星级评分
  fieldRegistry.register('rating', {
    component: ProRating as FieldComponent<unknown>,
  } as FieldRegistryItem)

  // 文件上传
  fieldRegistry.register('upload', {
    component: ProUpload as FieldComponent<unknown>,
    defaultProps: {
      mode: 'basic',
    },
  } as FieldRegistryItem)
}
