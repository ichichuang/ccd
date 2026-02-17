// @/components/SchemaForm/components/componentMap.ts
/**
 * 组件映射表
 * 用于动态组件渲染，替代 FormItems.tsx 中的巨型 switch 语句
 */

import type { Component } from 'vue'

// PrimeVue Components
import CascadeSelect from 'primevue/cascadeselect'
import Checkbox from 'primevue/checkbox'
import InputGroupAddon from 'primevue/inputgroupaddon'
import InputMask from 'primevue/inputmask'
import InputNumber from 'primevue/inputnumber'
import InputText from 'primevue/inputtext'
import Listbox from 'primevue/listbox'
import MultiSelect from 'primevue/multiselect'
import Password from 'primevue/password'
import RadioButtonGroup from 'primevue/radiobuttongroup'
import Rating from 'primevue/rating'
import Select from 'primevue/select'
import SelectButton from 'primevue/selectbutton'
import Textarea from 'primevue/textarea'
import ToggleButton from 'primevue/togglebutton'
import ToggleSwitch from 'primevue/toggleswitch'

// Custom Components

// Wrapper Components
import WrappedAutoComplete from './wrappers/WrappedAutoComplete.vue'
import WrappedColorPicker from './wrappers/WrappedColorPicker.vue'
import WrappedDatePicker from './wrappers/WrappedDatePicker.vue'
import WrappedInputGroup from './wrappers/WrappedInputGroup.vue'
import WrappedRadioButton from './wrappers/WrappedRadioButton.vue'
import WrappedSlider from './wrappers/WrappedSlider.vue'
import WrappedTreeSelect from './wrappers/WrappedTreeSelect.vue'

/**
 * 组件映射类型定义
 * key: 组件名称（字符串）
 * value: Vue 组件
 */
export type ComponentMap = Record<string, Component>

/**
 * 基础组件映射表
 * 包含所有 PrimeVue 和自定义组件的映射
 */

export const componentMap: ComponentMap = {
  // PrimeVue 基础组件
  CascadeSelect,
  Checkbox,
  InputGroupAddon,
  InputMask,
  InputNumber,
  InputText,
  Listbox,
  MultiSelect,
  Password,
  RadioButtonGroup,
  Rating,
  Select,
  SelectButton,
  Textarea,
  ToggleButton,
  ToggleSwitch,

  // 使用包装器组件的特殊组件
  AutoComplete: WrappedAutoComplete,
  ColorPicker: WrappedColorPicker,
  DatePicker: WrappedDatePicker,
  InputGroup: WrappedInputGroup,
  RadioButton: WrappedRadioButton,
  Slider: WrappedSlider,
  TreeSelect: WrappedTreeSelect,
}

/**
 * 获取组件映射
 * @param componentName - 组件名称
 * @returns Vue 组件或 undefined
 */
export function getComponentFromMap(componentName: string): Component | undefined {
  return componentMap[componentName]
}

/**
 * 检查组件是否存在于映射表中
 * @param componentName - 组件名称
 * @returns 是否存在
 */
export function hasComponentInMap(componentName: string): boolean {
  return componentName in componentMap
}
