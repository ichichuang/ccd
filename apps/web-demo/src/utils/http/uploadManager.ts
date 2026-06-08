/**
 * UploadManager - 大文件分片上传、断点续传
 * 业务层当前无引用；属基础设施，供未来上传功能使用。
 * 若无上传需求可考虑懒加载引入以减小首包。
 */
import { appLogger } from '@/adapters/logger.adapter'
import { UPLOAD_TASK_PREFIX } from '@/constants/business'
import { HTTP_CONFIG } from '@/constants/http'
import { t } from '@/locales'
import { DateUtils } from '@/utils/date'
import { post } from './methods'
import type {
  ChunkInfo,
  UploadManager as IUploadManager,
  UploadChunkConfig,
  UploadTask,
} from './types'

type InternalUploadTask = UploadTask & { config?: UploadChunkConfig }

async function calculateFileHash(file: File): Promise<string> {
  if (file.size === 0) {
    return `empty_${file.name}_0`
  }

  if (typeof crypto !== 'undefined' && crypto.subtle) {
    try {
      const buffer = await file.arrayBuffer()
      const hashBuffer = await crypto.subtle.digest('SHA-256', buffer)
      const hashArray = new Uint8Array(hashBuffer)
      const hashHex = Array.from(hashArray)
        .map(b => b.toString(16).padStart(2, '0'))
        .join('')
      return `${file.name}_${file.size}_${hashHex}`
    } catch {
      // fall through to fallback
    }
  }

  const maxSize = 1024 * 1024
  const chunk = file.slice(0, Math.min(file.size, maxSize))
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e: ProgressEvent<FileReader>) => {
      try {
        const arrayBuffer = e.target?.result as ArrayBuffer
        const uint8Array = new Uint8Array(arrayBuffer)
        // Use two independent 32-bit hashes to produce a 64-bit combined hash,
        // reducing collision risk for breakpoint resume chunk checks.
        let hash1 = 0
        let hash2 = 0x9e3779b9 // golden ratio seed
        for (let i = 0; i < uint8Array.length; i++) {
          hash1 = ((hash1 << 5) - hash1 + uint8Array[i]) & 0xffffffff
          hash2 = ((hash2 << 7) ^ (hash2 >>> 11) ^ uint8Array[i]) & 0xffffffff
        }
        const hashString = hash1.toString(16).padStart(8, '0') + hash2.toString(16).padStart(8, '0')
        resolve(`${file.name}_${file.size}_${hashString}`)
      } catch (_error) {
        reject(new Error(t('http.upload.hashCalculationFailed')))
      }
    }
    reader.onerror = () => {
      reject(new Error(t('http.upload.fileReadFailed')))
    }
    reader.readAsArrayBuffer(chunk)
  })
}

/**
 * 将文件分割为块
 */
function splitFileIntoChunks(file: File, chunkSize: number = HTTP_CONFIG.defaultChunkSize): Blob[] {
  const chunks: Blob[] = []
  let start = 0

  while (start < file.size) {
    const end = Math.min(start + chunkSize, file.size)
    chunks.push(file.slice(start, end))
    start = end
  }

  return chunks
}

/**
 * 文件上传管理器
 * 支持大文件分片上传、断点续传、暂停/恢复功能
 */
export class UploadManager implements IUploadManager {
  public tasks: Map<string, UploadTask> = new Map()
  private uploadQueue: string[] = []
  private isProcessing = false
  private beforeUnloadHandler?: () => void
  private taskConfigs = new Map<string, UploadChunkConfig | undefined>()
  private taskLoadedBytes = new Map<string, number>()
  private taskChunkLoadedBytes = new Map<string, Map<number, number>>()

  constructor() {
    this.setupBeforeUnloadHandler()
  }

  /**
   * 设置页面卸载处理器
   */
  private setupBeforeUnloadHandler(): void {
    this.beforeUnloadHandler = () => {
      this.tasks.forEach(task => {
        if (task.cancelToken) {
          task.cancelToken.abort()
        }
      })
    }

    window.addEventListener('beforeunload', this.beforeUnloadHandler)
  }

  /**
   * 清理资源
   */
  destroy(): void {
    // 移除事件监听器
    if (this.beforeUnloadHandler) {
      window.removeEventListener('beforeunload', this.beforeUnloadHandler)
      this.beforeUnloadHandler = undefined
    }

    // 取消所有任务
    this.tasks.forEach(task => {
      if (task.cancelToken) {
        task.cancelToken.abort()
      }
    })

    this.tasks.clear()
    this.taskConfigs.clear()
    this.taskLoadedBytes.clear()
    this.taskChunkLoadedBytes.clear()
    this.uploadQueue = []
  }

  /**
   * 添加上传任务
   */
  addTask(file: File, config?: UploadChunkConfig): string {
    if (file.size > HTTP_CONFIG.maxFileSize) {
      throw new Error(
        t('http.upload.fileSizeExceeded', {
          max: String(Math.round(HTTP_CONFIG.maxFileSize / (1024 * 1024))),
        })
      )
    }
    const taskId = this.generateTaskId()
    const chunkSize = config?.chunkSize || HTTP_CONFIG.defaultChunkSize // 2MB
    const chunks = splitFileIntoChunks(file, chunkSize)

    const task: UploadTask = {
      id: taskId,
      file,
      chunks: chunks.map((chunk, index) => ({
        chunkIndex: index,
        totalChunks: chunks.length,
        chunkSize: chunk.size,
        fileSize: file.size,
        chunk,
        fileId: taskId,
        fileName: file.name,
        fileHash: '', // 将在上传时计算
      })),
      uploadedChunks: new Set(),
      failedChunks: new Set(),
      status: 'pending',
      progress: 0,
      startTime: DateUtils.now().toDate(),
      cancelToken: new AbortController(),
    }

    ;(task as InternalUploadTask).config = config
    this.tasks.set(taskId, task)
    this.taskConfigs.set(taskId, config)
    this.taskLoadedBytes.set(taskId, 0)
    this.taskChunkLoadedBytes.set(taskId, new Map())
    this.uploadQueue.push(taskId)

    // 开始处理队列
    this.processQueue()

    return taskId
  }

  /**
   * 移除上传任务
   */
  removeTask(taskId: string): void {
    const task = this.tasks.get(taskId)
    if (task) {
      if (task.cancelToken) {
        task.cancelToken.abort()
      }
      this.tasks.delete(taskId)
      this.taskConfigs.delete(taskId)
      this.taskLoadedBytes.delete(taskId)
      this.taskChunkLoadedBytes.delete(taskId)
      this.uploadQueue = this.uploadQueue.filter(id => id !== taskId)
    }
  }

  /**
   * 取消上传任务
   */
  cancelTask(taskId: string): void {
    const task = this.tasks.get(taskId)
    if (task && task.status !== 'completed' && task.status !== 'cancelled') {
      task.status = 'cancelled'
      if (task.cancelToken) {
        task.cancelToken.abort()
      }
    }
  }

  /**
   * 暂停上传任务
   */
  pauseTask(taskId: string): void {
    const task = this.tasks.get(taskId)
    if (task && (task.status === 'uploading' || task.status === 'pending')) {
      task.status = 'paused'
      if (task.cancelToken) {
        task.cancelToken.abort()
        task.cancelToken = new AbortController()
      }
    }
  }

  /**
   * 恢复上传任务
   */
  resumeTask(taskId: string): void {
    const task = this.tasks.get(taskId)
    if (task && (task.status === 'pending' || task.status === 'paused')) {
      // 重新加入队列
      if (!this.uploadQueue.includes(taskId)) {
        this.uploadQueue.push(taskId)
      }
      this.processQueue()
    }
  }

  /**
   * 获取上传任务
   */
  getTask(taskId: string): UploadTask | undefined {
    return this.tasks.get(taskId)
  }

  /**
   * 获取所有上传任务
   */
  getAllTasks(): UploadTask[] {
    return Array.from(this.tasks.values())
  }

  /**
   * 处理上传队列
   */
  private async processQueue(): Promise<void> {
    if (this.isProcessing || this.uploadQueue.length === 0) {
      return
    }

    this.isProcessing = true
    try {
      while (this.uploadQueue.length > 0) {
        const taskId = this.uploadQueue.shift()!
        const task = this.tasks.get(taskId)

        if (!task || task.status === 'cancelled') {
          continue
        }

        try {
          await this.uploadTask(task)
        } catch (_error) {
          task.status = 'failed'
          this.updateTaskProgress(task)
        }
      }
    } finally {
      this.isProcessing = false
    }
  }

  /**
   * 上传单个任务
   */
  private async uploadTask(task: UploadTask): Promise<void> {
    if (task.status === 'cancelled') {
      return
    }

    task.status = 'uploading'

    try {
      // 计算文件哈希
      if (!task.chunks[0].fileHash) {
        task.chunks[0].fileHash = await calculateFileHash(task.file)
        task.chunks.forEach((chunk: ChunkInfo) => {
          chunk.fileHash = task.chunks[0].fileHash
        })
      }

      // 检查是否已上传
      const uploadedChunks = await this.checkUploadedChunks(task)
      task.uploadedChunks = new Set(uploadedChunks)
      uploadedChunks.forEach(chunkIndex => {
        const chunk = task.chunks[chunkIndex]
        if (chunk) {
          this.setChunkLoadedBytes(task, chunkIndex, chunk.chunkSize)
        }
      })
      this.updateTaskProgress(task)

      // 上传未完成的分片
      const pendingChunks = task.chunks.filter(
        (chunk: ChunkInfo) => !task.uploadedChunks.has(chunk.chunkIndex)
      )

      if (pendingChunks.length === 0) {
        // 所有分片都已上传，开始合并
        await this.mergeChunks(task)
        return
      }

      // 并发上传分片
      const concurrentChunks =
        (task as InternalUploadTask).config?.concurrentChunks ?? HTTP_CONFIG.defaultConcurrentChunks
      const chunks = [...pendingChunks]

      for (let i = 0; i < chunks.length; i += concurrentChunks) {
        const batch = chunks.slice(i, i + concurrentChunks)
        const results = await Promise.allSettled(batch.map(chunk => this.uploadChunk(task, chunk)))
        const failures = results.filter((r): r is PromiseRejectedResult => r.status === 'rejected')
        if (failures.length > 0) {
          task.status = 'failed'
          this.updateTaskProgress(task)
          throw failures[0].reason
        }

        if (task.status !== 'uploading') {
          return
        }
      }

      // 所有分片上传完成，开始合并
      await this.mergeChunks(task)
    } catch (error) {
      task.status = 'failed'
      this.updateTaskProgress(task)
      throw error
    }
  }

  /**
   * 检查已上传的分片
   */
  private async checkUploadedChunks(task: UploadTask): Promise<number[]> {
    try {
      const response = await post<{ uploadedChunks: number[] }>(HTTP_CONFIG.uploadEndpoints.check, {
        fileId: task.id,
        fileName: task.file.name,
        fileHash: task.chunks[0].fileHash,
        totalChunks: task.chunks.length,
      })

      return response.uploadedChunks || []
    } catch (error) {
      // Server errors (5xx) indicate a transient issue — log and return [] to trigger full re-upload.
      // Client errors (4xx) likely mean the upload session is gone — also re-upload.
      appLogger.warn(
        '[UploadManager] checkUploadedChunks failed, falling back to full upload:',
        error
      )
      return []
    }
  }

  /**
   * 上传单个分片
   */
  private async uploadChunk(task: UploadTask, chunk: ChunkInfo): Promise<void> {
    if (task.status === 'cancelled') {
      return
    }

    const taskConfig = this.getTaskConfig(task)
    try {
      const formData = new FormData()
      formData.append('file', chunk.chunk)
      formData.append('fileId', chunk.fileId)
      formData.append('fileName', chunk.fileName)
      formData.append('fileHash', chunk.fileHash)
      formData.append('chunkIndex', chunk.chunkIndex.toString())
      formData.append('totalChunks', chunk.totalChunks.toString())
      formData.append('chunkSize', chunk.chunkSize.toString())
      formData.append('fileSize', chunk.fileSize.toString())

      await post(HTTP_CONFIG.uploadEndpoints.chunk, formData, {
        signal: task.cancelToken?.signal,
        deduplicate: false,
      })

      // 分片上传成功
      task.uploadedChunks.add(chunk.chunkIndex)
      task.failedChunks.delete(chunk.chunkIndex)
      this.setChunkLoadedBytes(task, chunk.chunkIndex, chunk.chunkSize)
      taskConfig?.onChunkProgress?.(chunk.chunkIndex, 100)
      taskConfig?.onChunkSuccess?.(chunk.chunkIndex, {
        chunkIndex: chunk.chunkIndex,
        fileId: chunk.fileId,
      })

      // 更新进度
      this.updateTaskProgress(task)
    } catch (error) {
      task.failedChunks.add(chunk.chunkIndex)
      taskConfig?.onChunkProgress?.(chunk.chunkIndex, 0)
      taskConfig?.onChunkError?.(
        chunk.chunkIndex,
        error instanceof Error ? error : new Error(t('http.upload.chunkUploadFailed'))
      )

      throw error
    } finally {
      this.updateTaskProgress(task)
    }
  }

  /**
   * 合并分片
   */
  private async mergeChunks(task: UploadTask): Promise<void> {
    if (task.status === 'cancelled') {
      return
    }

    task.status = 'merging'

    try {
      await post(HTTP_CONFIG.uploadEndpoints.merge, {
        fileId: task.id,
        fileName: task.file.name,
        fileHash: task.chunks[0].fileHash,
        totalChunks: task.chunks.length,
      })

      // 文件上传完成
      task.status = 'completed'
      task.progress = 100
      this.taskLoadedBytes.set(task.id, task.file.size)
      this.getTaskConfig(task)?.onProgress?.(100)
      this.updateTaskProgress(task)
    } catch (error) {
      task.status = 'failed'

      throw error
    }
  }

  /**
   * 更新任务进度
   */
  private updateTaskProgress(task: UploadTask): void {
    const loadedBytes = this.taskLoadedBytes.get(task.id) ?? 0
    const totalBytes = task.file.size || task.chunks.reduce((sum, item) => sum + item.chunkSize, 0)
    const progress =
      totalBytes > 0 ? Math.min(100, Math.round((loadedBytes / totalBytes) * 100)) : 0
    task.progress = progress
    this.getTaskConfig(task)?.onProgress?.(progress)
  }

  private getTaskConfig(task: UploadTask): UploadChunkConfig | undefined {
    return this.taskConfigs.get(task.id)
  }

  private setChunkLoadedBytes(task: UploadTask, chunkIndex: number, loadedBytes: number): void {
    const chunkLoadedMap = this.taskChunkLoadedBytes.get(task.id) ?? new Map<number, number>()
    chunkLoadedMap.set(chunkIndex, Math.max(0, loadedBytes))
    this.taskChunkLoadedBytes.set(task.id, chunkLoadedMap)

    let totalLoadedBytes = 0
    chunkLoadedMap.forEach(value => {
      totalLoadedBytes += value
    })
    this.taskLoadedBytes.set(task.id, totalLoadedBytes)
  }

  /**
   * 生成任务ID
   */
  private generateTaskId(): string {
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
      return `${UPLOAD_TASK_PREFIX}${crypto.randomUUID()}`
    }
    return `${UPLOAD_TASK_PREFIX}${DateUtils.nowMs()}_${Math.random().toString(36).slice(2, 11)}`
  }
}

let _uploadManager: UploadManager | undefined

export function getUploadManager(): UploadManager {
  if (!_uploadManager) {
    _uploadManager = new UploadManager()
  }
  return _uploadManager
}

export const addUploadTask = (file: File, config?: UploadChunkConfig) =>
  getUploadManager().addTask(file, config)
export const removeUploadTask = (taskId: string) => getUploadManager().removeTask(taskId)
export const cancelUploadTask = (taskId: string) => getUploadManager().cancelTask(taskId)
export const pauseUploadTask = (taskId: string) => getUploadManager().pauseTask(taskId)
export const resumeUploadTask = (taskId: string) => getUploadManager().resumeTask(taskId)
export const getUploadTask = (taskId: string) => getUploadManager().getTask(taskId)
export const getAllUploadTasks = () => getUploadManager().getAllTasks()
export type { UploadTask } from './types'
