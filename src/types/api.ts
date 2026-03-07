/**
 * 全局 API 标准响应结构
 * 后端统一包装格式，业务层取 data 使用
 */

export interface ApiResponse<T = unknown> {
  code: number
  message: string
  data: T
}
