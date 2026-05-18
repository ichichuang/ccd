/** 仅做聚合导出，无逻辑；类型请从 ./types 或 @/utils/http/types 引用以避免循环 */
export * from './connection'
export * from './instance'
export * from './interceptors'
export * from './methods'
export * from './types'
export {
  addUploadTask,
  cancelUploadTask,
  getAllUploadTasks,
  getUploadManager,
  getUploadTask,
  pauseUploadTask,
  removeUploadTask,
  resumeUploadTask,
} from './uploadManager'
export type { UploadTask } from './uploadManager'
