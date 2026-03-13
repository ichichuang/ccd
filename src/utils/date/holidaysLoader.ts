/**
 * date-holidays 动态加载器
 *
 * 职责：延迟加载 date-holidays，避免首包包含该依赖。
 * date-holidays 仅在首次调用 getCountryHolidays / isCountryHoliday 等方法时加载。
 */

/** date-holidays 实例最小接口（第三方库无完整类型，边界处使用 any 桥接） */
export interface HolidaysApiLike {
  init: (...args: unknown[]) => void
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  getHolidays?: (year?: string | number) => any[]
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  getCountries?: () => any
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  isHoliday?: (date: Date) => any
  [key: string]: unknown
}

let holidaysApi: HolidaysApiLike | null = null
let holidaysApiReady = false
let holidaysApiLoader: Promise<void> | null = null

const ensureHolidaysApi = async (): Promise<void> => {
  if (holidaysApiReady && holidaysApi) {
    return
  }
  if (!holidaysApiLoader) {
    holidaysApiLoader = import('date-holidays')
      .then(module => {
        const holidaysCtor = module.default as unknown as new () => HolidaysApiLike
        holidaysApi = new holidaysCtor()
        holidaysApi.init('CN')
        holidaysApiReady = true
      })
      .catch(error => {
        console.error('Failed to load date-holidays:', error)
        holidaysApiReady = false
        holidaysApi = null
      })
  }
  await holidaysApiLoader
}

/**
 * 获取 date-holidays API 实例（未加载完成时返回 null）
 */
export const getHolidaysApi = (): HolidaysApiLike | null => {
  if (holidaysApiReady && holidaysApi) {
    return holidaysApi
  }
  void ensureHolidaysApi()
  return null
}
