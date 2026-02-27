/**
 * 日期工具常量与预设
 */
import type { Holiday, Locale, TimestampPrecision } from './types'

// ===== 默认值 =====
export const DEFAULT_LOCALE: Locale = 'zh-CN'
export const DEFAULT_TIMEZONE = 'Asia/Shanghai'

// ===== 格式与精度 =====
export const DATE_FORMATS = {
  date: 'YYYY-MM-DD',
  time: 'HH:mm:ss',
  datetime: 'YYYY-MM-DD HH:mm:ss',
  datetimeMinute: 'YYYY-MM-DD HH:mm',
  iso: 'YYYY-MM-DDTHH:mm:ss.SSSZ',
  chineseDate: 'YYYY年MM月DD日',
  chineseDatetime: 'YYYY年MM月DD日 HH:mm:ss',
  shortDate: 'M/D/YYYY',
  longDate: 'dddd, MMMM D, YYYY',
  time12: 'h:mm A',
  datetime12: 'YYYY-MM-DD h:mm A',
} as const

export type DateFormatKeys = keyof typeof DATE_FORMATS
export type DateFormatValues = (typeof DATE_FORMATS)[DateFormatKeys]

export const PRECISION_FORMATS: Record<TimestampPrecision, string> = {
  year: 'YYYY',
  month: 'YYYY-MM',
  date: 'YYYY-MM-DD',
  hour: 'YYYY-MM-DD HH',
  minute: 'YYYY-MM-DD HH:mm',
  second: 'YYYY-MM-DD HH:mm:ss',
  millisecond: 'YYYY-MM-DD HH:mm:ss.SSS',
} as const

export const TIMESTAMP_THRESHOLD = 1_000_000_000_000 as const
export const CACHE_DEFAULTS = {
  ttl: 5 * 60 * 1000,
  maxSize: 1000,
  enabled: true,
} as const

// ===== 日期范围预设 =====
export const DATE_RANGES = {
  today: 'today',
  yesterday: 'yesterday',
  tomorrow: 'tomorrow',
  thisWeek: 'thisWeek',
  lastWeek: 'lastWeek',
  nextWeek: 'nextWeek',
  thisMonth: 'thisMonth',
  lastMonth: 'lastMonth',
  nextMonth: 'nextMonth',
  thisQuarter: 'thisQuarter',
  lastQuarter: 'lastQuarter',
  nextQuarter: 'nextQuarter',
  thisYear: 'thisYear',
  lastYear: 'lastYear',
  nextYear: 'nextYear',
} as const

export type DateRangePreset = keyof typeof DATE_RANGES

// ===== 节假日预设 =====
export const CHINA_HOLIDAYS_2024: Holiday[] = [
  { name: '元旦', date: '2024-01-01', type: 'national', recurring: false, country: 'CN' },
  { name: '春节', date: '2024-02-10', type: 'national', recurring: false, country: 'CN' },
  { name: '春节', date: '2024-02-11', type: 'national', recurring: false, country: 'CN' },
  { name: '春节', date: '2024-02-12', type: 'national', recurring: false, country: 'CN' },
  { name: '春节', date: '2024-02-13', type: 'national', recurring: false, country: 'CN' },
  { name: '春节', date: '2024-02-14', type: 'national', recurring: false, country: 'CN' },
  { name: '春节', date: '2024-02-15', type: 'national', recurring: false, country: 'CN' },
  { name: '春节', date: '2024-02-16', type: 'national', recurring: false, country: 'CN' },
  { name: '春节', date: '2024-02-17', type: 'national', recurring: false, country: 'CN' },
  { name: '清明节', date: '2024-04-04', type: 'national', recurring: false, country: 'CN' },
  { name: '清明节', date: '2024-04-05', type: 'national', recurring: false, country: 'CN' },
  { name: '清明节', date: '2024-04-06', type: 'national', recurring: false, country: 'CN' },
  { name: '劳动节', date: '2024-05-01', type: 'national', recurring: false, country: 'CN' },
  { name: '劳动节', date: '2024-05-02', type: 'national', recurring: false, country: 'CN' },
  { name: '劳动节', date: '2024-05-03', type: 'national', recurring: false, country: 'CN' },
  { name: '劳动节', date: '2024-05-04', type: 'national', recurring: false, country: 'CN' },
  { name: '劳动节', date: '2024-05-05', type: 'national', recurring: false, country: 'CN' },
  { name: '端午节', date: '2024-06-10', type: 'national', recurring: false, country: 'CN' },
  { name: '中秋节', date: '2024-09-15', type: 'national', recurring: false, country: 'CN' },
  { name: '中秋节', date: '2024-09-16', type: 'national', recurring: false, country: 'CN' },
  { name: '中秋节', date: '2024-09-17', type: 'national', recurring: false, country: 'CN' },
  { name: '国庆节', date: '2024-10-01', type: 'national', recurring: false, country: 'CN' },
  { name: '国庆节', date: '2024-10-02', type: 'national', recurring: false, country: 'CN' },
  { name: '国庆节', date: '2024-10-03', type: 'national', recurring: false, country: 'CN' },
  { name: '国庆节', date: '2024-10-04', type: 'national', recurring: false, country: 'CN' },
  { name: '国庆节', date: '2024-10-05', type: 'national', recurring: false, country: 'CN' },
  { name: '国庆节', date: '2024-10-06', type: 'national', recurring: false, country: 'CN' },
  { name: '国庆节', date: '2024-10-07', type: 'national', recurring: false, country: 'CN' },
  { name: '春节调休', date: '2024-02-04', type: 'workday', recurring: false, country: 'CN' },
  { name: '春节调休', date: '2024-02-18', type: 'workday', recurring: false, country: 'CN' },
  { name: '劳动节调休', date: '2024-04-28', type: 'workday', recurring: false, country: 'CN' },
  { name: '劳动节调休', date: '2024-05-11', type: 'workday', recurring: false, country: 'CN' },
  { name: '国庆节调休', date: '2024-09-29', type: 'workday', recurring: false, country: 'CN' },
  { name: '国庆节调休', date: '2024-10-12', type: 'workday', recurring: false, country: 'CN' },
]

export const INTERNATIONAL_HOLIDAYS: Holiday[] = [
  { name: "New Year's Day", date: '01-01', type: 'international', recurring: true },
  { name: "Valentine's Day", date: '02-14', type: 'international', recurring: true },
  { name: "International Women's Day", date: '03-08', type: 'international', recurring: true },
  { name: 'Labor Day', date: '05-01', type: 'international', recurring: true },
  { name: "Children's Day", date: '06-01', type: 'international', recurring: true },
  { name: 'Christmas', date: '12-25', type: 'international', recurring: true },
]

// ===== 内部映射（dateUtils 使用） =====
export const LOCALE_MODULES = {
  en: () => import('dayjs/locale/en.js'),
  zhCn: () => import('dayjs/locale/zh-cn.js'),
} as const

export const LOCALE_MAP: Record<Locale, keyof typeof LOCALE_MODULES> = {
  ['en-US']: 'en',
  ['zh-CN']: 'zhCn',
} as const

export const DAYJS_LOCALE_MAP: Record<Locale, string> = {
  ['en-US']: 'en',
  ['zh-CN']: 'zh-cn',
} as const

export const WEEKDAY_NAMES = {
  short: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] as const,
  long: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'] as const,
  chinese: ['日', '一', '二', '三', '四', '五', '六'] as const,
} as const

export const MONTH_NAMES = {
  short: [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ] as const,
  long: [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ] as const,
  chinese: ['一', '二', '三', '四', '五', '六', '七', '八', '九', '十', '十一', '十二'] as const,
} as const

export type WeekdayFormat = keyof typeof WEEKDAY_NAMES
export type MonthFormat = keyof typeof MONTH_NAMES
export type LocaleModule = keyof typeof LOCALE_MODULES
