/** 仅做聚合导出，无逻辑；类型请从 ./types 或 @/utils/http/types 引用以避免循环 */
export * from './connection'
export * from './instance'
export * from './interceptors'
export * from './methods'
export * from './types'
// 显式导出 uploadManager 相关，避免与 types 中的 UploadManager 接口冲突
export {
  addUploadTask,
  cancelUploadTask,
  getAllUploadTasks,
  getUploadTask,
  pauseUploadTask,
  removeUploadTask,
  resumeUploadTask,
  uploadManager,
} from './uploadManager'
export type { UploadTask } from './uploadManager'
