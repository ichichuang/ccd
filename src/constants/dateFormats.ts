/**
 * 日期格式字符串 SSOT：再导出 `DateFormatEnum`，并补充业务/Demo 用到的少量字面量。
 * 展示逻辑仍须通过 useDateUtils / DateUtils（见 integrations/05-date-time）。
 */
export { DateFormatEnum } from '@/utils/date/types'

/** 无时区后缀的本地 ISO 片段（常见于 Demo 时钟展示） */
export const DATETIME_LOCAL_ISO = 'YYYY-MM-DDTHH:mm:ss'
