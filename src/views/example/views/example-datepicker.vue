<script setup lang="ts">
import { DateUtils } from '@#/index'
import { COMMON_PRESET_RANGES, DatePicker, type DateValue } from '@/components/modules/date-picker'
import { computed, ref } from 'vue'

// 单选/范围/不同模式：统一使用 DateValue 以兼容组件的 emits 类型
const dateSingleBasic = ref<DateValue>(Date.now())
const dateSingleLimited = ref<DateValue>(null)
const dateSingleControlled = ref<DateValue>(null)
const dateRange = ref<DateValue>(null)
const dateTime = ref<DateValue>(null)
const timeOnly = ref<DateValue>(null)
const monthOnly = ref<DateValue>(null)
const yearOnly = ref<DateValue>(null)
const weekOnly = ref<DateValue>(null)
const quarterOnly = ref<DateValue>(null)

// 不同 valueFormat 示例（同样使用 DateValue 以避免类型冲突）
const tsValue = ref<DateValue>(null)
const isoValue = ref<DateValue>(null)

// 占位符与清空/事件示例
const placeholderExample = ref<DateValue>(null)
const clearableExample = ref<DateValue>(null)
const time12h = ref<DateValue>(null)
const timeRange = ref<DateValue>(null)
const eventLog = ref<string[]>([])
const onChange = (v: DateValue) => {
  eventLog.value.unshift(`change: ${JSON.stringify(v)}`)
  if (eventLog.value.length > 6) {
    eventLog.value.pop()
  }
}
const onOpen = () => {
  eventLog.value.unshift('open')
  if (eventLog.value.length > 6) {
    eventLog.value.pop()
  }
}
const onClose = () => {
  eventLog.value.unshift('close')
  if (eventLog.value.length > 6) {
    eventLog.value.pop()
  }
}

// 限制范围（示例：最近 30 天内）
const minDateVal: Date = (() => {
  const d = new Date()
  d.setDate(d.getDate() - 30)
  d.setHours(0, 0, 0, 0)
  return d
})()
const maxDateVal: Date = (() => {
  const d = new Date()
  d.setHours(23, 59, 59, 999)
  return d
})()

// 预设范围
const presets = [
  COMMON_PRESET_RANGES.today,
  COMMON_PRESET_RANGES.last7Days,
  COMMON_PRESET_RANGES.last30Days,
]

// 引用组件方法（open/close/clear）
const dpRef = ref<{ open: () => void; close: () => void; clear: () => void } | null>(null)
const openPanel = () => dpRef.value?.open?.()
const closePanel = () => dpRef.value?.close?.()
const clearValue = () => dpRef.value?.clear?.()

// 其他功能示例
const disabledExample = ref<DateValue>(null)
const customClassExample = ref<DateValue>(null)
const customStyleExample = ref<DateValue>(null)
const placementExample = ref<DateValue>(null)
const localeTextsExample = ref<DateValue>(null)
const inlineExample = ref<DateValue>(null)
const displayFormatExample = ref<DateValue>(null)
const displayFormatDate = ref<DateValue>(null)
const displayFormatTime = ref<DateValue>(null)
const displayFormatRange = ref<DateValue>(null)
const disabledDatesSingle = ref<DateValue>(null)
const disabledDatesRange = ref<DateValue>(null)
const disabledWeekends = ref<DateValue>(null)
const limitedYear = ref<DateValue>(null)

// 禁用区间（最近5天）起止时间，避免在模板内书写复杂表达式导致语法问题
const disabledRangeStart = (() => {
  const s = new Date()
  s.setDate(s.getDate() - 5)
  s.setHours(0, 0, 0, 0)
  return s
})()
const disabledRangeEnd = (() => {
  const e = new Date()
  e.setDate(e.getDate() - 1)
  e.setHours(23, 59, 59, 999)
  return e
})()

// 禁用日期的函数，用于禁用最近5天
const isDisabledDate = (date: Date) => {
  return date >= disabledRangeStart && date <= disabledRangeEnd
}

// 本地化日期格式示例
const localizedDateExample = ref<DateValue>(null)
const localizedDateTimeExample = ref<DateValue>(null)
const localizedTimeExample = ref<DateValue>(null)
const localizedRangeExample = ref<DateValue>(null)

// 计算本地化显示格式
const localizedDisplayFormat = computed(() => {
  const currentLocale = DateUtils.getCurrentLocale()
  switch (currentLocale) {
    case 'zh-CN':
      return 'yyyy年MM月dd日'
    case 'zh-TW':
      return 'yyyy年MM月dd日'
    case 'en-US':
    default:
      return 'MM/dd/yyyy'
  }
})

const localizedDateTimeFormat = computed(() => {
  const currentLocale = DateUtils.getCurrentLocale()
  switch (currentLocale) {
    case 'zh-CN':
      return 'yyyy年MM月dd日 HH:mm:ss'
    case 'zh-TW':
      return 'yyyy年MM月dd日 HH:mm:ss'
    case 'en-US':
    default:
      return 'MM/dd/yyyy HH:mm:ss'
  }
})

const localizedTimeFormat = computed(() => {
  const currentLocale = DateUtils.getCurrentLocale()
  switch (currentLocale) {
    case 'zh-CN':
      return 'HH时mm分ss秒'
    case 'zh-TW':
      return 'HH時mm分ss秒'
    case 'en-US':
    default:
      return 'HH:mm:ss'
  }
})

// 格式化选中的日期为本地化格式
const formatLocalizedDate = (date: DateValue) => {
  if (!date) {
    return '未选择'
  }
  const parsedDate = DateUtils.safeParse(date as Date)
  if (!parsedDate) {
    return '无效日期'
  }
  return DateUtils.format(parsedDate, localizedDisplayFormat.value)
}

const formatLocalizedDateTime = (date: DateValue) => {
  if (!date) {
    return '未选择'
  }
  const parsedDate = DateUtils.safeParse(date as Date)
  if (!parsedDate) {
    return '无效日期'
  }
  return DateUtils.format(parsedDate, localizedDateTimeFormat.value)
}

const formatLocalizedTime = (date: DateValue) => {
  if (!date) {
    return '未选择'
  }
  const parsedDate = DateUtils.safeParse(date as Date)
  if (!parsedDate) {
    return '无效日期'
  }
  return DateUtils.format(parsedDate, localizedTimeFormat.value)
}

const formatLocalizedRange = (range: DateValue) => {
  if (!range || !Array.isArray(range) || range.length !== 2) {
    return '未选择范围'
  }
  const [start, end] = range as [Date, Date]
  const startDate = DateUtils.safeParse(start)
  const endDate = DateUtils.safeParse(end)
  if (!startDate || !endDate) {
    return '无效日期范围'
  }
  return `${DateUtils.format(startDate, localizedDisplayFormat.value)} - ${DateUtils.format(endDate, localizedDisplayFormat.value)}`
}
</script>
<template lang="pug">
.between-col.p-padding.gap-gap
  .c-card.between-col.gap-gaps.p-padding
    .w-full.color-accent100.between-start.mb-gap 单选（Date）
    .full.grid.gap-gap.grid-cols-2(class='sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 xxl:grid-cols-6')
      DatePicker(v-model='dateSingleBasic', mode='date', value-format='timestamp')
    .fs-appFontSizes 当前值： {{ String(dateSingleBasic) }}

  .c-card.between-col.gap-gaps.p-padding
    .w-full.color-accent100.between-start.mb-gap 范围选择（Date[]）
    .full.grid.gap-gap.grid-cols-2(class='sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 xxl:grid-cols-6')
      DatePicker(v-model='dateRange', :range='true', :presets='presets', value-format='timestamp')
    .fs-appFontSizes 当前值： {{ JSON.stringify(dateRange) }}

  .c-card.between-col.gap-gaps.p-padding
    .w-full.color-accent100.between-start.mb-gap 禁用日期（disabledDates）
    .full.between-start
      .pr-padding(class='w-50%') 禁用固定日期（元旦）
      DatePicker(
        v-model='disabledDatesSingle',
        mode='date',
        :disabled-dates='[new Date(new Date().getFullYear(), 0, 1)]',
        value-format='timestamp'
      )
    .fs-appFontSizes 当前值： {{ String(disabledDatesSingle) }}
    .full.between-start
      .pr-padding(class='w-50%') 禁用最近 5 天（区间）
      DatePicker(
        v-model='disabledDatesRange',
        :range='true',
        mode='date',
        :disabled-dates='isDisabledDate',
        value-format='timestamp'
      )
    .fs-appFontSizes 当前值： {{ String(disabledDatesRange) }}

  .c-card.between-col.gap-gaps.p-padding
    .w-full.color-accent100.between-start.mb-gap 禁用星期（disabledWeekDays）
    .full.between-start
      .pr-padding(class='w-50%') 禁用周末（六/日）
      DatePicker(
        v-model='disabledWeekends',
        mode='date',
        :disabled-week-days='[0, 6]',
        value-format='timestamp'
      )
    .fs-appFontSizes 当前值： {{ String(disabledWeekends) }}

  .c-card.between-col.gap-gaps.p-padding
    .w-full.color-accent100.between-start.mb-gap 最小/最大日期限制（最近30天）
    .full.between-start
      .pr-padding(class='w-50%') 最小日期限制
      DatePicker(
        v-model='dateSingleLimited',
        mode='date',
        :min-date='minDateVal',
        :max-date='maxDateVal',
        value-format='timestamp'
      )
    .fs-appFontSizes 当前值： {{ String(dateSingleLimited) }}
  .c-card.between-col.gap-gaps.p-padding
    .w-full.color-accent100.between-start.mb-gap 年份范围（yearRange）
    .full.between-start
      .pr-padding(class='w-50%') 仅可选 2020-2025 年
      DatePicker(
        v-model='limitedYear',
        mode='year',
        :year-range='[2020, 2025]',
        value-format='timestamp'
      )
    .fs-appFontSizes 当前值： {{ String(limitedYear) }}

  .c-card.between-col.gap-gaps.p-padding
    .w-full.color-accent100.between-start.mb-gap 时间范围（Time[]）
    .full.grid.gap-gap.grid-cols-2(class='sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 xxl:grid-cols-6')
      DatePicker(
        v-model='timeRange',
        :range='true',
        mode='time',
        :is-24='true',
        :enable-seconds='false',
        value-format='timestamp'
      )
    .fs-appFontSizes 当前值： {{ JSON.stringify(timeRange) }}

  .c-card.between-col.gap-gaps.p-padding
    .w-full.color-accent100.between-start.mb-gap 不同模式
    .full.grid.gap-gap.grid-cols-2(class='sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 xxl:grid-cols-6')
      //- 日期时间
      DatePicker(
        v-model='dateTime',
        mode='datetime',
        :enable-seconds='true',
        value-format='timestamp'
      )
      //- 仅时间
      DatePicker(
        v-model='timeOnly',
        mode='time',
        :enable-seconds='false',
        :is-24='true',
        value-format='timestamp'
      )
      //- 仅时间（12 小时制）
      DatePicker(
        v-model='time12h',
        mode='time',
        :is-24='false',
        :enable-seconds='false',
        value-format='timestamp'
      )
      //- 月份
      DatePicker(v-model='monthOnly', mode='month', value-format='timestamp')
      //- 年份
      DatePicker(v-model='yearOnly', mode='year')
      //- 周
      DatePicker(v-model='weekOnly', mode='week')
      //- 季度（以月份面板近似）
      DatePicker(v-model='quarterOnly', mode='quarter', value-format='timestamp')

  .c-card.between-col.gap-gaps.p-padding
    .w-full.color-accent100.between-start.mb-gap 不同值格式（valueFormat）
    .full.grid.gap-gap.grid-cols-2(class='sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 xxl:grid-cols-6')
      //- 时间戳
      DatePicker(
        v-model='tsValue',
        mode='datetime',
        value-format='timestamp',
        :enable-seconds='true'
      )
      //- ISO 字符串
      DatePicker(v-model='isoValue', mode='datetime', value-format='iso', :enable-seconds='true')
    .fs-appFontSizes 时间戳： {{ String(tsValue) }}
    .fs-appFontSizes ISO： {{ String(isoValue) }}

  .c-card.between-col.gap-gaps.p-padding
    .w-full.color-accent100.between-start.mb-gap 调用组件方法
    .full.flex.between-start.gap-gap.mb-gap
      Button(severity='primary', @click='openPanel') 打开
      Button(severity='danger', @click='closePanel') 关闭
      Button(severity='warning', @click='clearValue') 清空
    DatePicker(ref='dpRef', v-model='dateSingleControlled', mode='date', value-format='timestamp')

  .c-card.between-col.gap-gaps.p-padding
    .w-full.color-accent100.between-start.mb-gap 禁用状态
    .full.grid.gap-gap.grid-cols-2(class='sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 xxl:grid-cols-6')
      DatePicker(
        v-model='disabledExample',
        mode='date',
        :disabled='true',
        value-format='timestamp'
      )
    .fs-appFontSizes 当前值： {{ String(disabledExample) }}

  .c-card.between-col.gap-gaps.p-padding
    .w-full.color-accent100.between-start.mb-gap 自定义样式和类名
    .full.between-start
      DatePicker(
        v-model='customClassExample',
        mode='date',
        custom-class='w-400! bg-warnColor center c-border-accent',
        value-format='timestamp'
      )
      DatePicker(
        v-model='customStyleExample',
        mode='date',
        :input-style='{ width: "400px", border: "2px solid #007bff" }',
        value-format='timestamp'
      )
    .fs-appFontSizes 自定义类名： {{ String(customClassExample) }}
    .fs-appFontSizes 自定义样式： {{ String(customStyleExample) }}

  .c-card.between-col.gap-gaps.p-padding
    .w-full.color-accent100.between-start.mb-gap 弹层定位
    .full.between-start
      .pr-padding(class='w-50%') 左侧弹层
      DatePicker(
        v-model='placementExample',
        mode='date',
        placement='left',
        value-format='timestamp'
      )
    .fs-appFontSizes 当前值： {{ String(placementExample) }}
    .full.between-start
      .pr-padding(class='w-50%') 中间弹层
      DatePicker(
        v-model='placementExample',
        mode='date',
        placement='bottom',
        value-format='timestamp'
      )
    .fs-appFontSizes 当前值： {{ String(placementExample) }}
    .full.between-start
      .pr-padding(class='w-50%') 右侧弹层
      DatePicker(
        v-model='placementExample',
        mode='date',
        placement='right',
        value-format='timestamp'
      )
    .fs-appFontSizes 当前值： {{ String(placementExample) }}

  .c-card.between-col.gap-gaps.p-padding
    .w-full.color-accent100.between-start.mb-gap 自定义文案
    .full.grid.gap-gap.grid-cols-2(class='sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 xxl:grid-cols-6')
      DatePicker(
        v-model='localeTextsExample',
        mode='date',
        :locale-texts='{ placeholder: "自定义占位符", clearLabel: "清除" }',
        value-format='timestamp'
      )
    .fs-appFontSizes 当前值： {{ String(localeTextsExample) }}

  .c-card.between-col.gap-gaps.p-padding
    .w-full.color-accent100.between-start.mb-gap 占位符与清空/事件回调
    .full.grid.gap-gap.grid-cols-2(class='sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 xxl:grid-cols-6')
      //- 占位符
      DatePicker(
        v-model='placeholderExample',
        mode='date',
        placeholder='请选择一个日期',
        value-format='timestamp'
      )
      //- 不可清空
      DatePicker(
        v-model='clearableExample',
        mode='date',
        :clearable='false',
        value-format='timestamp'
      )
      //- 事件演示（open/close/change）
      DatePicker(
        v-model='dateSingleControlled',
        mode='date',
        @change='onChange',
        @open='onOpen',
        @close='onClose',
        value-format='timestamp'
      )
    .fs-appFontSizes 事件： {{ eventLog.join(' | ') }}

  .c-card.between-col.gap-gaps.p-padding
    .w-full.color-accent100.between-start.mb-gap 内联模式
    .grid.gap-gap.grid-cols-1
      DatePicker(v-model='inlineExample', mode='date', :inline='true', value-format='timestamp')
    .fs-appFontSizes 当前值： {{ String(inlineExample) }}

  .c-card.between-col.gap-gaps.p-padding
    .w-full.color-accent100.between-start.mb-gap 自定义显示格式
    .full.grid.gap-gap.grid-cols-2(class='sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 xxl:grid-cols-6')
      DatePicker(
        v-model='displayFormatExample',
        mode='datetime',
        display-format='yyyy年MM月dd日 HH:mm:ss',
        value-format='timestamp'
      )
      //- 仅日期（自定义显示）
      DatePicker(
        v-model='displayFormatDate',
        mode='date',
        display-format='yyyy-MM-dd',
        value-format='timestamp'
      )
      //- 仅时间（自定义显示）
      DatePicker(
        v-model='displayFormatTime',
        mode='time',
        display-format='HH:mm',
        :is-24='true',
        value-format='timestamp'
      )
      //- 范围（自定义显示）
      DatePicker(
        v-model='displayFormatRange',
        :range='true',
        mode='date',
        display-format='MM/dd/yyyy',
        value-format='timestamp'
      )
    .fs-appFontSizes 当前值： {{ String(displayFormatExample) }}
    .fs-appFontSizes 当前值（日期）： {{ String(displayFormatDate) }}
    .fs-appFontSizes 当前值（时间）： {{ String(displayFormatTime) }}
    .fs-appFontSizes 当前值（范围）： {{ JSON.stringify(displayFormatRange) }}

  .c-card.between-col.gap-gaps.p-padding
    .w-full.color-accent100.between-start.mb-gap 本地化日期格式
    .fs-appFontSizes.mb-gap.color-accent100
      | 根据当前语言自动显示对应的日期格式
      br
      | 当前语言：{{ DateUtils.getCurrentLocale() }}
    .full.grid.gap-gap.grid-cols-2(class='sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 xxl:grid-cols-6')
      //- 本地化日期格式
      DatePicker(
        v-model='localizedDateExample',
        mode='date',
        :display-format='localizedDisplayFormat',
        value-format='timestamp'
      )
      //- 本地化日期时间格式
      DatePicker(
        v-model='localizedDateTimeExample',
        mode='datetime',
        :display-format='localizedDateTimeFormat',
        value-format='timestamp'
      )
      //- 本地化时间格式
      DatePicker(
        v-model='localizedTimeExample',
        mode='time',
        :display-format='localizedTimeFormat',
        value-format='timestamp'
      )
      //- 本地化范围格式
      DatePicker(
        v-model='localizedRangeExample',
        :range='true',
        mode='date',
        :display-format='localizedDisplayFormat',
        value-format='timestamp'
      )
    .fs-appFontSizes
      | 日期格式：{{ formatLocalizedDate(localizedDateExample) }}
    .fs-appFontSizes.mt-gaps
      | 日期时间格式：{{ formatLocalizedDateTime(localizedDateTimeExample) }}
    .fs-appFontSizes.mt-gaps
      | 时间格式：{{ formatLocalizedTime(localizedTimeExample) }}
    .fs-appFontSizes.mt-gaps
      | 范围格式：{{ formatLocalizedRange(localizedRangeExample) }}
</template>
