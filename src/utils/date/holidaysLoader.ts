/**
 * date-holidays 动态加载器
 *
 * 职责：延迟加载 date-holidays，避免首包包含该依赖。
 * date-holidays 仅在首次调用 getCountryHolidays / isCountryHoliday 等方法时加载。
 */

// 边界层：date-holidays 实例类型不易精确建模，使用 any 做最小作用域封装
let holidaysApi: any = null
let holidaysApiReady = false
let holidaysApiLoader: Promise<void> | null = null

const ensureHolidaysApi = async (): Promise<void> => {
  if (holidaysApiReady && holidaysApi) {
    return
  }
  if (!holidaysApiLoader) {
    holidaysApiLoader = import('date-holidays')
      .then(module => {
        const holidaysCtor = module.default
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
export const getHolidaysApi = (): any => {
  if (holidaysApiReady && holidaysApi) {
    return holidaysApi
  }
  void ensureHolidaysApi()
  return null
}
