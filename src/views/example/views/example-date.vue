<script setup lang="tsx">
import { ALL_TIMEZONES, DATE_FORMATS, DateUtils } from '@#/index'
import { useDateUtils } from '@/hooks'
import { computed, onMounted, onUnmounted, ref } from 'vue'

// 使用 Composable 获取响应式的 DateUtils
const {
  isInitialized,
  getAvailableTimezones,
  getTimezonesByCountry,
  getSupportedHolidayCountries,
} = useDateUtils()

// 获取当前真实时间作为基础
const currentTime = ref(new Date())
const currentTimestamp = ref(Date.now())

// 定时器引用
let timer: NodeJS.Timeout | null = null

// 每秒更新一次当前时间
// 时区相关状态
const currentTz = ref<string>(Intl.DateTimeFormat().resolvedOptions().timeZone)
const selectedCountry = ref<string>('CN')

// 节假日相关状态
const selectedYear = ref<number>(new Date().getFullYear())
const countryHolidays = ref<any[]>([])
const supportedCountries = computed(() => getSupportedHolidayCountries())

// 根据国家获取节假日
const fetchCountryHolidays = (country: string, year: number) => {
  const holidays = DateUtils.getCountryHolidays(country, year, true)
  if (holidays) {
    countryHolidays.value = holidays.slice(0, 10) // 限制显示前10个
  }
}

onMounted(() => {
  const updateTime = () => {
    currentTime.value = new Date()
    currentTimestamp.value = Date.now()
  }

  updateTime()
  timer = setInterval(updateTime, 1000)

  // 设置节假日数据
  DateUtils.setHolidays(2024, [
    { name: '元旦', date: '2024-01-01', type: 'national' },
    { name: '春节', date: '2024-02-10', type: 'national' },
    { name: '劳动节', date: '2024-05-01', type: 'national' },
    { name: '国庆节', date: '2024-10-01', type: 'national' },
  ])

  // 导入2024年中国节假日和调休日
  DateUtils.importPresetHolidays(2024, 'CN')

  fetchCountryHolidays('CN', selectedYear.value)
})

// 组件卸载时清理定时器
onUnmounted(() => {
  if (timer) {
    clearInterval(timer)
    timer = null
  }
})

// 日期计算示例
const dateCalculationExamples = computed(() => {
  const now = currentTime.value
  const nowDayjs = DateUtils.safeParse(now)

  if (!nowDayjs) {
    return null
  }

  return {
    add: {
      addHours: DateUtils.format(nowDayjs.add(3, 'hour'), 'YYYY-MM-DD HH:mm:ss'),
      addDays: DateUtils.format(nowDayjs.add(7, 'day'), 'YYYY-MM-DD HH:mm:ss'),
      addMonths: DateUtils.format(nowDayjs.add(2, 'month'), 'YYYY-MM-DD HH:mm:ss'),
      addYears: DateUtils.format(nowDayjs.add(1, 'year'), 'YYYY-MM-DD HH:mm:ss'),
    },
    subtract: {
      subHours: DateUtils.format(nowDayjs.subtract(3, 'hour'), 'YYYY-MM-DD HH:mm:ss'),
      subDays: DateUtils.format(nowDayjs.subtract(7, 'day'), 'YYYY-MM-DD HH:mm:ss'),
      subMonths: DateUtils.format(nowDayjs.subtract(2, 'month'), 'YYYY-MM-DD HH:mm:ss'),
    },
    startEnd: {
      startOfDay: DateUtils.format(nowDayjs.startOf('day'), 'YYYY-MM-DD HH:mm:ss'),
      endOfDay: DateUtils.format(nowDayjs.endOf('day'), 'YYYY-MM-DD HH:mm:ss'),
      startOfWeek: DateUtils.format(nowDayjs.startOf('week'), 'YYYY-MM-DD HH:mm:ss'),
      endOfWeek: DateUtils.format(nowDayjs.endOf('week'), 'YYYY-MM-DD HH:mm:ss'),
      startOfMonth: DateUtils.format(nowDayjs.startOf('month'), 'YYYY-MM-DD HH:mm:ss'),
      endOfMonth: DateUtils.format(nowDayjs.endOf('month'), 'YYYY-MM-DD HH:mm:ss'),
      startOfYear: DateUtils.format(nowDayjs.startOf('year'), 'YYYY-MM-DD HH:mm:ss'),
      endOfYear: DateUtils.format(nowDayjs.endOf('year'), 'YYYY-MM-DD HH:mm:ss'),
    },
  }
})

// 日期信息提取示例
const dateInfoExamples = computed(() => {
  const now = currentTime.value
  const nowDayjs = DateUtils.safeParse(now)

  if (!nowDayjs) {
    return null
  }

  return {
    basic: {
      year: nowDayjs.year(),
      month: nowDayjs.month() + 1, // dayjs 月份从0开始
      date: nowDayjs.date(),
      hour: nowDayjs.hour(),
      minute: nowDayjs.minute(),
      second: nowDayjs.second(),
      dayOfWeek: nowDayjs.day(),
    },
    extended: {
      dayOfYear: nowDayjs.dayOfYear(),
      weekOfYear: nowDayjs.week(),
      isoWeek: nowDayjs.isoWeek(),
      quarter: nowDayjs.quarter(),
      daysInMonth: nowDayjs.daysInMonth(),
      isLeapYear:
        nowDayjs.year() % 4 === 0 && (nowDayjs.year() % 100 !== 0 || nowDayjs.year() % 400 === 0),
    },
    comparison: {
      isToday: nowDayjs.isSame(nowDayjs, 'day'),
      isThisWeek: nowDayjs.isSame(nowDayjs, 'week'),
      isThisMonth: nowDayjs.isSame(nowDayjs, 'month'),
      isThisYear: nowDayjs.isSame(nowDayjs, 'year'),
    },
  }
})

// 时区转换示例
const timezoneExamples = computed(() => {
  const now = currentTime.value
  const nowDayjs = DateUtils.safeParse(now)

  if (!nowDayjs) {
    return null
  }

  return {
    current: Intl.DateTimeFormat().resolvedOptions().timeZone,
    utc: DateUtils.format(nowDayjs.utc(), 'YYYY-MM-DD HH:mm:ss'),
    timezones: {
      beijing: DateUtils.format(nowDayjs.tz('Asia/Shanghai'), 'YYYY-MM-DD HH:mm:ss'),
      tokyo: DateUtils.format(nowDayjs.tz('Asia/Tokyo'), 'YYYY-MM-DD HH:mm:ss'),
      newYork: DateUtils.format(nowDayjs.tz('America/New_York'), 'YYYY-MM-DD HH:mm:ss'),
      london: DateUtils.format(nowDayjs.tz('Europe/London'), 'YYYY-MM-DD HH:mm:ss'),
      sydney: DateUtils.format(nowDayjs.tz('Australia/Sydney'), 'YYYY-MM-DD HH:mm:ss'),
    },
    offset: nowDayjs.utcOffset(),
    offsetInfo: DateUtils.getTimezoneOffset(currentTz.value),
  }
})

// 时区库示例
const tzdbExamples = computed(() => {
  const tzInfo = ALL_TIMEZONES.find(tz => tz.name === currentTz.value)
  const groupedZones = getAvailableTimezones(true) as Record<string, typeof ALL_TIMEZONES>

  return {
    currentZone: tzInfo,
    totalTimezones: ALL_TIMEZONES.length,
    continents: Object.keys(groupedZones).length,
    countriesWithTimezones: [...new Set(ALL_TIMEZONES.map(tz => tz.countryCode))].length,
    chinaTimezones: getTimezonesByCountry('CN').length,
    usTimezones: getTimezonesByCountry('US').length,
  }
})

// 节假日库示例
const holidayExamples = computed(() => {
  return {
    availableCountries: Object.keys(supportedCountries.value).length,
    currentCountryHolidays: countryHolidays.value.length,
    isTodayHoliday: DateUtils.isCountryHoliday(currentTime.value, selectedCountry.value),
    todayHolidayInfo: DateUtils.getCountryHolidayInfo(currentTime.value, selectedCountry.value),
    isPresetHoliday: DateUtils.isHoliday(currentTime.value),
  }
})

// 获取@vvo/tzdb中的大洲
const continents = computed(() => {
  const groupedByContinent = getAvailableTimezones(true) as Record<string, typeof ALL_TIMEZONES>
  return Object.keys(groupedByContinent).map(continent => ({
    name: continent,
    count: Array.isArray(groupedByContinent[continent]) ? groupedByContinent[continent].length : 0,
  }))
})

// 切换国家并加载节假日
const changeCountry = (country: string) => {
  selectedCountry.value = country
  fetchCountryHolidays(country, selectedYear.value)
}

// 切换时区
const changeTimezone = (timezone: string) => {
  currentTz.value = timezone
  DateUtils.setTimezone(timezone)
}

// 切换年份并更新节假日
const changeYear = (year: number) => {
  selectedYear.value = year
  fetchCountryHolidays(selectedCountry.value, year)
}
</script>

<template lang="pug">
.date-examples.between-col.gap-gaps6
  // 页面标题
  .between-col.gap-gaps.items-center.mb-gap
    .fs-appFontSizel.font-bold.mb-2 📅 DateUtils 示例
    .color-accent100 当前时间: {{ DateUtils.formatI18n(currentTime, 'datetime') }}
    .color-text200.fs-appFontSizes 自动更新，展示所有日期处理方法的实时效果

  .grid.grid-cols-1.gap-gap(class='sm:grid-cols-2 lg:grid-cols-3')
    // 各种日期格式转换
    .c-card.between-col.p-paddings(class='justify-start!')
      .between.fs-appFontSizex
        .mr-gap 🔄
        span 格式转换
      .full.px-padding
        .mb-gap.color-accent100
          p 日期 → 字符串
          p {{ currentTime }}
        .between-col.gap-gaps
          .between-start.gap-gap
            span.color-text300 年:
            span.font-mono {{ DateUtils.format(currentTime, 'YYYY') }}
          .between-start.gap-gap
            span.color-text300 年月:
            span.font-mono {{ DateUtils.format(currentTime, 'YYYY-MM') }}
          .between-start.gap-gap
            span.color-text300 年月日:
            span.font-mono {{ DateUtils.format(currentTime, 'YYYY-MM-DD') }}
          .between-start.gap-gap
            span.color-text300 年月日时分:
            span.font-mono {{ DateUtils.format(currentTime, 'YYYY-MM-DD HH:mm') }}
          .between-start.gap-gap
            span.color-text300 年月日时分秒:
            span.font-mono {{ DateUtils.format(currentTime, 'YYYY-MM-DD HH:mm:ss') }}
          .between-start.gap-gap
            span.color-text300 中文日期:
            span.font-mono {{ DateUtils.format(currentTime, 'YYYY年MM月DD日') }}
          .between-start.gap-gap
            span.color-text300 中文完整:
            span.font-mono {{ DateUtils.format(currentTime, 'YYYY年MM月DD日 HH时mm分ss秒') }}
          .between-start.gap-gap
            span.color-text300 ISO格式:
            span.font-mono.text-xs {{ DateUtils.format(currentTime, 'YYYY-MM-DDTHH:mm:ss.SSSZ') }}
          .between-start.gap-gap
            span.color-text300 时间:
            span.font-mono {{ DateUtils.format(currentTime, 'HH:mm:ss') }}

    // 时间戳转换
    .c-card.between-col.p-paddings(class='justify-start!')
      .between.fs-appFontSizex
        .mr-gap ⏰
        span 时间戳转换
      .full.px-padding
        .mb-gap.color-accent100
          p 时间戳 → 字符串
          p {{ currentTimestamp }}
        .between-col.gap-gaps
          .between-start.gap-gap
            span.color-text300 自动格式:
            span.font-mono {{ DateUtils.formatTimestamp(currentTimestamp) }}
          .between-start.gap-gap
            span.color-text300 年:
            span.font-mono {{ DateUtils.formatTimestamp(currentTimestamp, 'YYYY') }}
          .between-start.gap-gap
            span.color-text300 年月日:
            span.font-mono {{ DateUtils.formatTimestamp(currentTimestamp, 'YYYY-MM-DD') }}
          .between-start.gap-gap
            span.color-text300 年月日时分:
            span.font-mono {{ DateUtils.formatTimestamp(currentTimestamp, 'YYYY-MM-DD HH:mm') }}
          .between-start.gap-gap
            span.color-text300 年月日时分秒:
            span.font-mono {{ DateUtils.formatTimestamp(currentTimestamp, 'YYYY-MM-DD HH:mm:ss') }}
          .between-start.gap-gap
            span.color-text300 中文完整:
            span.font-mono {{ DateUtils.formatTimestamp(currentTimestamp, 'YYYY年MM月DD日 HH时mm分ss秒') }}
      .full.px-padding
        .mb-gap.color-accent100
          p 日期 → 时间戳
          p {{ currentTime }}
        .between-col.gap-gaps
          .between-start.gap-gap
            span.color-text300 毫秒级:
            span.font-mono {{ currentTime.getTime() }}
          .between-start.gap-gap
            span.color-text300 秒级:
            span.font-mono {{ Math.floor(currentTime.getTime() / 1000) }}
          .between-start.gap-gap
            span.color-text300 Unix秒:
            span.font-mono {{ DateUtils.safeParse(currentTime)?.unix() || 0 }}

    // 精度格式化
    .c-card.between-col.p-paddings(class='justify-start!')
      .between.fs-appFontSizex
        .mr-gap 🎯
        span 精度格式化
      .full.px-padding
        .mb-gap.color-accent100
          p 精度格式化
          p {{ currentTimestamp }}
        .between-col.gap-gaps
          .between-start.gap-gap
            span.color-text300 年精度:
            span.font-mono {{ DateUtils.formatTimestampAdvanced(currentTimestamp, { precision: 'year' }) }}
          .between-start.gap-gap
            span.color-text300 月精度:
            span.font-mono {{ DateUtils.formatTimestampAdvanced(currentTimestamp, { precision: 'month' }) }}
          .between-start.gap-gap
            span.color-text300 日精度:
            span.font-mono {{ DateUtils.formatTimestampAdvanced(currentTimestamp, { precision: 'date' }) }}
          .between-start.gap-gap
            span.color-text300 时精度:
            span.font-mono {{ DateUtils.formatTimestampAdvanced(currentTimestamp, { precision: 'hour' }) }}
          .between-start.gap-gap
            span.color-text300 分精度:
            span.font-mono {{ DateUtils.formatTimestampAdvanced(currentTimestamp, { precision: 'minute' }) }}
          .between-start.gap-gap
            span.color-text300 秒精度:
            span.font-mono {{ DateUtils.formatTimestampAdvanced(currentTimestamp, { precision: 'second' }) }}

    // 字符串解析
    .c-card.between-col.p-paddings(class='justify-start!')
      .between.fs-appFontSizex
        .mr-gap 🔍
        span 字符串解析
      .full.px-padding
        .mb-gap.color-accent100
          p 字符串 → 日期
          p 测试不同格式的字符串解析
        .between-col.gap-gaps
          .between-start.gap-gap
            span.color-text300 ISO格式:
            span.font-mono {{ DateUtils.format(DateUtils.safeParse('2024-01-15T14:30:45.000Z') || currentTime, 'YYYY-MM-DD HH:mm:ss') }}
          .between-start.gap-gap
            span.color-text300 标准格式:
            span.font-mono {{ DateUtils.format(DateUtils.safeParse('2024-01-15 14:30:45') || currentTime, 'YYYY-MM-DD HH:mm:ss') }}
          .between-start.gap-gap
            span.color-text300 日期格式:
            span.font-mono {{ DateUtils.format(DateUtils.safeParse('2024-01-15') || currentTime, 'YYYY-MM-DD HH:mm:ss') }}
          .between-start.gap-gap
            span.color-text300 中文格式:
            span.font-mono {{ DateUtils.format(DateUtils.safeParse('2024年1月15日') || currentTime, 'YYYY-MM-DD HH:mm:ss') }}

    // 相对时间
    .c-card.between-col.p-paddings(class='justify-start!')
      .between.fs-appFontSizex
        .mr-gap ⏳
        span 相对时间
      .full.px-padding
        .mb-gap.color-accent100
          p 距离现在
          p {{ currentTime }}
        .between-col.gap-gaps
          .between-start.gap-gap
            span.color-text300 {{ DateUtils.format(new Date(currentTime.getTime() - 60 * 60 * 1000)) }}:
            span.font-mono {{ DateUtils.fromNow(new Date(currentTime.getTime() - 60 * 60 * 1000)) }}
          .between-start.gap-gap
            span.color-text300 {{ DateUtils.format(new Date(currentTime.getTime() - 24 * 60 * 60 * 1000)) }}:
            span.font-mono {{ DateUtils.fromNow(new Date(currentTime.getTime() - 24 * 60 * 60 * 1000)) }}
          .between-start.gap-gap
            span.color-text300 {{ DateUtils.format(new Date(currentTime.getTime() - 7 * 24 * 60 * 60 * 1000)) }}:
            span.font-mono {{ DateUtils.fromNow(new Date(currentTime.getTime() - 7 * 24 * 60 * 60 * 1000)) }}
          .between-start.gap-gap
            span.color-text300 {{ DateUtils.format(new Date(currentTime.getTime() + 60 * 60 * 1000)) }}:
            span.font-mono {{ DateUtils.fromNow(new Date(currentTime.getTime() + 60 * 60 * 1000)) }}
          .between-start.gap-gap
            span.color-text300 {{ DateUtils.format(new Date(currentTime.getTime() + 24 * 60 * 60 * 1000)) }}:
            span.font-mono {{ DateUtils.fromNow(new Date(currentTime.getTime() + 24 * 60 * 60 * 1000)) }}

    // 工作日判断
    .c-card.between-col.p-paddings(class='justify-start!')
      .between.fs-appFontSizex
        .mr-gap 💼
        span 工作日判断
      .full.px-padding
        .mb-gap.color-accent100
          p 当前状态
          p {{ currentTime }}
        .between-col.gap-gaps
          .between-start.gap-gap
            span.color-text300 {{ DateUtils.format(currentTime) }} 是工作日:
            span.font-mono(
              :class='DateUtils.isWeekday(currentTime) ? "text-green-600" : "text-red-600"'
            ) {{ DateUtils.isWeekday(currentTime) ? '是' : '否' }}
          .between-start.gap-gap
            span.color-text300 {{ DateUtils.format(currentTime) }} 是周末:
            span.font-mono(
              :class='DateUtils.isWeekend(currentTime) ? "text-green-600" : "text-red-600"'
            ) {{ DateUtils.isWeekend(currentTime) ? '是' : '否' }}
          .between-start.gap-gap
            span.color-text300 {{ DateUtils.format(currentTime) }} 是工作日(排除节假日):
            span.font-mono(
              :class='DateUtils.isWorkingDay(currentTime) ? "text-green-600" : "text-red-600"'
            ) {{ DateUtils.isWorkingDay(currentTime) ? '是' : '否' }}
          .between-start.gap-gap
            span.color-text300 {{ DateUtils.format(currentTime) }} 是节假日:
            span.font-mono(
              :class='DateUtils.isHoliday(DateUtils.format(currentTime, "YYYY-MM-DD")) ? "text-green-600" : "text-red-600"'
            ) {{ DateUtils.isHoliday(DateUtils.format(currentTime, 'YYYY-MM-DD')) ? '是' : '否' }}
      .full.px-padding
        .mb-gap.color-accent100
          p 工作日计算
          p 基于当前时间
        .between-col.gap-gaps
          .between-start.gap-gap
            span.color-text300 下个工作日:
            span.font-mono {{ DateUtils.format(DateUtils.nextWorkday(currentTime), 'YYYY-MM-DD') }}
          .between-start.gap-gap
            span.color-text300 上个工作日:
            span.font-mono {{ DateUtils.format(DateUtils.prevWorkday(currentTime), 'YYYY-MM-DD') }}

    // 日期计算
    .c-card.between-col.p-paddings(class='justify-start!', v-if='dateCalculationExamples')
      .between.fs-appFontSizex
        .mr-gap 🧮
        span 日期计算
      .full.px-padding
        .mb-gap.color-accent100 加法运算
        .between-col.gap-gaps
          .between-start.gap-gap
            span.color-text300 +3小时:
            span.font-mono {{ dateCalculationExamples.add.addHours }}
          .between-start.gap-gap
            span.color-text300 +7天:
            span.font-mono {{ dateCalculationExamples.add.addDays }}
          .between-start.gap-gap
            span.color-text300 +2月:
            span.font-mono {{ dateCalculationExamples.add.addMonths }}
          .between-start.gap-gap
            span.color-text300 +1年:
            span.font-mono {{ dateCalculationExamples.add.addYears }}
      .full.px-padding
        .mb-gap.color-accent100 减法运算
        .between-col.gap-gaps
          .between-start.gap-gap
            span.color-text300 -3小时:
            span.font-mono {{ dateCalculationExamples.subtract.subHours }}
          .between-start.gap-gap
            span.color-text300 -7天:
            span.font-mono {{ dateCalculationExamples.subtract.subDays }}
          .between-start.gap-gap
            span.color-text300 -2月:
            span.font-mono {{ dateCalculationExamples.subtract.subMonths }}

    // 起始结束时间
    .c-card.between-col.p-paddings(class='justify-start!', v-if='dateCalculationExamples')
      .between.fs-appFontSizex
        .mr-gap 📍
        span 起始结束时间
      .full.px-padding
        .mb-gap.color-accent100 起始结束时间
        .between-col.gap-gaps
          .between-start.gap-gap
            span.color-text300 今天开始:
            span.font-mono {{ dateCalculationExamples.startEnd.startOfDay }}
          .between-start.gap-gap
            span.color-text300 今天结束:
            span.font-mono {{ dateCalculationExamples.startEnd.endOfDay }}
          .between-start.gap-gap
            span.color-text300 本周开始:
            span.font-mono {{ dateCalculationExamples.startEnd.startOfWeek }}
          .between-start.gap-gap
            span.color-text300 本周结束:
            span.font-mono {{ dateCalculationExamples.startEnd.endOfWeek }}
          .between-start.gap-gap
            span.color-text300 本月开始:
            span.font-mono {{ dateCalculationExamples.startEnd.startOfMonth }}
          .between-start.gap-gap
            span.color-text300 本月结束:
            span.font-mono {{ dateCalculationExamples.startEnd.endOfMonth }}
          .between-start.gap-gap
            span.color-text300 今年开始:
            span.font-mono {{ dateCalculationExamples.startEnd.startOfYear }}
          .between-start.gap-gap
            span.color-text300 今年结束:
            span.font-mono {{ dateCalculationExamples.startEnd.endOfYear }}

    // 日期信息
    .c-card.between-col.p-paddings(class='justify-start!', v-if='dateInfoExamples')
      .between.fs-appFontSizex
        .mr-gap ℹ️
        span 日期信息
      .full.px-padding
        .mb-gap.color-accent100 基础信息
        .between-col.gap-gaps
          .between-start.gap-gap
            span.color-text300 年:
            span.font-mono {{ dateInfoExamples.basic.year }}
          .between-start.gap-gap
            span.color-text300 月:
            span.font-mono {{ dateInfoExamples.basic.month }}
          .between-start.gap-gap
            span.color-text300 日:
            span.font-mono {{ dateInfoExamples.basic.date }}
          .between-start.gap-gap
            span.color-text300 时:分:秒:
            span.font-mono {{ dateInfoExamples.basic.hour }}:{{ dateInfoExamples.basic.minute }}:{{ dateInfoExamples.basic.second }}
          .between-start.gap-gap
            span.color-text300 星期:
            span.font-mono {{ dateInfoExamples.basic.dayOfWeek }} (0=周日)
      .full.px-padding
        .mb-gap.color-accent100 扩展信息
        .between-col.gap-gaps
          .between-start.gap-gap
            span.color-text300 一年中第几天:
            span.font-mono {{ dateInfoExamples.extended.dayOfYear }}
          .between-start.gap-gap
            span.color-text300 第几周:
            span.font-mono {{ dateInfoExamples.extended.weekOfYear }}
          .between-start.gap-gap
            span.color-text300 ISO周:
            span.font-mono {{ dateInfoExamples.extended.isoWeek }}
          .between-start.gap-gap
            span.color-text300 第几季度:
            span.font-mono {{ dateInfoExamples.extended.quarter }}
          .between-start.gap-gap
            span.color-text300 本月天数:
            span.font-mono {{ dateInfoExamples.extended.daysInMonth }}
          .between-start.gap-gap
            span.color-text300 是闰年:
            span.font-mono {{ dateInfoExamples.extended.isLeapYear ? '是' : '否' }}

    // 时区转换
    .c-card.between-col.p-paddings(class='justify-start!', v-if='timezoneExamples')
      .between.fs-appFontSizex
        .mr-gap 🌍
        span 时区转换
      .full.px-padding
        .mb-gap.color-accent100 时区信息
        .between-col.gap-gaps
          .between-start.gap-gap
            span.color-text300 当前时区:
            span.font-mono {{ timezoneExamples.current }}
          .between-start.gap-gap
            span.color-text300 UTC时间:
            span.font-mono {{ timezoneExamples.utc }}
          .between-start.gap-gap
            span.color-text300 时区偏移:
            span.font-mono {{ timezoneExamples.offset }}分钟
          .between-start.gap-gap
            span.color-text300 时区偏移(分钟):
            span.font-mono {{ timezoneExamples.offsetInfo }}
      .full.px-padding
        .mb-gap.color-accent100 各时区时间
        .between-col.gap-gaps
          .between-start.gap-gap
            span.color-text300 北京:
            span.font-mono {{ timezoneExamples.timezones.beijing }}
          .between-start.gap-gap
            span.color-text300 东京:
            span.font-mono {{ timezoneExamples.timezones.tokyo }}
          .between-start.gap-gap
            span.color-text300 纽约:
            span.font-mono {{ timezoneExamples.timezones.newYork }}
          .between-start.gap-gap
            span.color-text300 伦敦:
            span.font-mono {{ timezoneExamples.timezones.london }}
          .between-start.gap-gap
            span.color-text300 悉尼:
            span.font-mono {{ timezoneExamples.timezones.sydney }}

    // TZDB 时区库
    .c-card.between-col.p-paddings(class='justify-start!', v-if='tzdbExamples')
      .between.fs-appFontSizex
        .mr-gap 🗺️
        span @vvo/tzdb 时区库
      .full.px-padding
        .mb-gap.color-accent100 时区库信息
        .between-col.gap-gaps
          .between-start.gap-gap
            span.color-text300 当前时区名:
            span.font-mono {{ tzdbExamples.currentZone?.name }}
          .between-start.gap-gap
            span.color-text300 国家代码:
            span.font-mono {{ tzdbExamples.currentZone?.countryCode || '未知' }}
          .between-start.gap-gap
            span.color-text300 总时区数:
            span.font-mono {{ tzdbExamples.totalTimezones }}
          .between-start.gap-gap
            span.color-text300 大洲数量:
            span.font-mono {{ tzdbExamples.continents }}
          .between-start.gap-gap
            span.color-text300 国家数量:
            span.font-mono {{ tzdbExamples.countriesWithTimezones }}
      .full.px-padding
        .mb-gap.color-accent100 各大洲时区
        .between-col.gap-gaps
          .between-start.gap-gap(v-for='continent in continents', :key='continent.name')
            span.color-text300 {{ continent.name }}:
            span.font-mono {{ continent.count }}个时区

    // 智能解析
    .c-card.between-col.p-paddings(class='justify-start!')
      .between.fs-appFontSizex
        .mr-gap 🧠
        span 智能解析
      .full.px-padding
        .mb-gap.color-accent100
          p 智能解析测试
          p 测试不同格式的字符串智能解析
        .between-col.gap-gaps
          .between-col(
            v-for='testInput in ["2024-01-15", "2024/01/15", "01/15/2024", "2024年1月15日", "invalid date"]',
            :key='testInput'
          )
            .between-start.gap-gap.mb-gaps
              span.color-text300 输入: "{{ testInput }}"
              span.text-xs(
                :class='DateUtils.smartParse(testInput).date !== null ? "text-green-600" : "text-red-600"'
              ) {{ Math.round(DateUtils.smartParse(testInput).confidence * 100) }}%
            .between-start.gap-gap
              span.color-text300 结果:
              span.font-mono(
                :class='DateUtils.smartParse(testInput).date !== null ? "text-green-600" : "text-red-600"'
              ) {{ DateUtils.smartParse(testInput).date ? DateUtils.format(DateUtils.smartParse(testInput).date || currentTime, 'YYYY-MM-DD HH:mm:ss') : '解析失败' }}

    // 批量操作
    .c-card.between-col.p-paddings(class='justify-start!')
      .between.fs-appFontSizex
        .mr-gap 📋
        span 批量操作
      .full.px-padding
        .mb-gap.color-accent100
          p 批量格式化
          p 测试数组: [当前时间, 1天前, 1天后, 1周前]
        .color-text300.font-mono {{ DateUtils.batchFormat([currentTime, new Date(currentTime.getTime() - 24 * 60 * 60 * 1000), new Date(currentTime.getTime() + 24 * 60 * 60 * 1000), new Date(currentTime.getTime() - 7 * 24 * 60 * 60 * 1000)], 'MM-DD HH:mm').join(', ') }}
      .full.px-padding
        .mb-gap.color-accent100
          p 日期排序 (升序)
          p 同样的测试数组
        .color-text300.font-mono {{ DateUtils.sort([currentTime, new Date(currentTime.getTime() - 24 * 60 * 60 * 1000), new Date(currentTime.getTime() + 24 * 60 * 60 * 1000), new Date(currentTime.getTime() - 7 * 24 * 60 * 60 * 1000)], 'asc').map(d => DateUtils.format(d, 'MM-DD HH:mm')).join(', ') }}
      .full.px-padding
        .mb-gap.color-accent100
          p 日期去重
          p 重复数组测试
        .color-text300.font-mono {{ DateUtils.unique([currentTime, currentTime, new Date(currentTime.getTime() - 24 * 60 * 60 * 1000), new Date(currentTime.getTime() - 24 * 60 * 60 * 1000)]).map(d => DateUtils.format(d, 'MM-DD HH:mm')).join(', ') }}
      .full.px-padding
        .mb-gap.color-accent100
          p 最值计算
          p 基于测试数组
        .between-col.gap-gaps
          .between-start.gap-gap
            span.color-text300 最早:
            span.font-mono {{ DateUtils.format(DateUtils.min(currentTime, new Date(currentTime.getTime() - 24 * 60 * 60 * 1000), new Date(currentTime.getTime() + 24 * 60 * 60 * 1000), new Date(currentTime.getTime() - 7 * 24 * 60 * 60 * 1000)), 'YYYY-MM-DD HH:mm:ss') }}
          .between-start.gap-gap
            span.color-text300 最晚:
            span.font-mono {{ DateUtils.format(DateUtils.max(currentTime, new Date(currentTime.getTime() - 24 * 60 * 60 * 1000), new Date(currentTime.getTime() + 24 * 60 * 60 * 1000), new Date(currentTime.getTime() - 7 * 24 * 60 * 60 * 1000)), 'YYYY-MM-DD HH:mm:ss') }}

    // 节假日库
    .c-card.between-col.p-paddings(class='justify-start!', v-if='holidayExamples')
      .between.fs-appFontSizex
        .mr-gap 🎌
        span date-holidays 库
      .full.px-padding
        .mb-gap.color-accent100 节假日支持信息
        .between-col.gap-gaps
          .between-start.gap-gap
            span.color-text300 支持国家数:
            span.font-mono {{ holidayExamples.availableCountries }}
          .between-start.gap-gap
            span.color-text300 选中国家:
            span.font-mono {{ selectedCountry }}
          .between-start.gap-gap
            span.color-text300 今天是节假日(库):
            span.font-mono(
              :class='holidayExamples.isTodayHoliday ? "text-green-600" : "text-red-600"'
            ) {{ holidayExamples.isTodayHoliday ? '是' : '否' }}
          .between-start.gap-gap
            span.color-text300 今天是节假日(预设):
            span.font-mono(
              :class='holidayExamples.isPresetHoliday ? "text-green-600" : "text-red-600"'
            ) {{ holidayExamples.isPresetHoliday ? '是' : '否' }}
      .full.px-padding.max-h-60.overflow-auto.c-border
        .mb-gap.color-accent100
          span {{ selectedCountry }} {{ selectedYear }} 节假日
          span.text-xs.ml-2 (前10个)
        .between-col.gap-gaps(v-if='countryHolidays.length')
          .between-start.gap-gap.text-xs(v-for='(holiday, index) in countryHolidays', :key='index')
            span.color-text300 {{ DateUtils.format(holiday.start, 'MM-DD') }}:
            span.font-mono {{ holiday.name }} ({{ holiday.type }})
        .text-red-600(v-else) 无节假日数据
      .full.px-padding
        .mb-gap.color-accent100 切换测试
        .between-col.gap-gaps
          .between-start.gap-gap
            span.color-text300 切换国家:
            .flex.gap-2
              Button(severity='secondary', @click='changeCountry("CN")') 中国
              Button(severity='secondary', @click='changeCountry("US")') 美国
              Button(severity='secondary', @click='changeCountry("JP")') 日本
          .between-start.gap-gap
            span.color-text300 切换年份:
            .flex.gap-2
              Button(severity='secondary', @click='changeYear(2023)') 2023
              Button(severity='secondary', @click='changeYear(2024)') 2024
              Button(severity='secondary', @click='changeYear(2025)') 2025

    // 时区选择器
    .c-card.between-col.p-paddings(class='justify-start!')
      .between.fs-appFontSizex
        .mr-gap 🕒
        span 时区选择器
      .full.px-padding
        .mb-gap.color-accent100 当前时区
        .between-col.gap-gaps
          .between-start.gap-gap
            span.color-text300 选中时区:
            span.font-mono {{ currentTz }}
          .between-start.gap-gap
            span.color-text300 中国时区:
            .flex.gap-2
              Button(severity='secondary', @click='changeTimezone("Asia/Shanghai")') 上海
              Button(severity='secondary', @click='changeTimezone("Asia/Urumqi")') 乌鲁木齐
          .between-start.gap-gap
            span.color-text300 国际时区:
            .flex.gap-2
              Button(severity='secondary', @click='changeTimezone("America/New_York")') 纽约
              Button(severity='secondary', @click='changeTimezone("Europe/London")') 伦敦
              Button(severity='secondary', @click='changeTimezone("Asia/Tokyo")') 东京
              Button(severity='secondary', @click='changeTimezone("UTC")') UTC

    // 系统状态
    .c-card.between-col.p-paddings(class='justify-start!')
      .between.fs-appFontSizex
        .mr-gap ⚙️
        span 系统状态
      .full.px-padding
        .mb-gap.color-accent100
          p 语言设置
          p DateUtils 系统状态
        .between-col.gap-gaps
          .between-start.gap-gap
            span.color-text300 当前语言:
            span.font-mono {{ DateUtils.getCurrentLocale() }}
          .between-start.gap-gap
            span.color-text300 Dayjs语言:
            span.font-mono {{ DateUtils.getLocale() }}
          .between-start.gap-gap
            span.color-text300 当前时区:
            span.font-mono {{ DateUtils.getCurrentTimezone() }}
          .between-start.gap-gap
            span.color-text300 初始化状态:
            span.font-mono(:class='isInitialized ? "text-green-600" : "text-red-600"') {{ isInitialized ? '已初始化' : '未初始化' }}
      .full.px-padding
        .mb-gap.color-accent100
          p 缓存状态
          p 当前缓存统计
        .between-col.gap-gaps
          .between-start.gap-gap
            span.color-text300 缓存大小:
            span.font-mono {{ DateUtils.getCacheStats().size }}
          .between-start.gap-gap
            span.color-text300 缓存键数:
            span.font-mono {{ DateUtils.getCacheStats().keys.length }}
      .full.px-padding
        .mb-gap.color-accent100
          p 常量信息
          p 系统配置
        .between-col.gap-gaps
          .between-start.gap-gap
            span.color-text300 日期格式数:
            span.font-mono {{ Object.keys(DATE_FORMATS).length }}
          .between-start.gap-gap
            span.color-text300 方法总数:
            span.font-mono 60+ 个方法
          .between-start.gap-gap
            span.color-text300 版本:
            span.font-mono 1.1.0
</template>
