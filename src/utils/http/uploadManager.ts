import { HTTP_CONFIG } from '@/constants/http'
import { post } from './methods'
import type {
  ChunkInfo,
  UploadManager as IUploadManager,
  UploadChunkConfig,
  UploadTask,
} from './types'

/**
 * 计算文件哈希值 - 使用更高效的方式
 */
async function calculateFileHash(file: File): Promise<string> {
  // 对于大文件，只计算前1MB的哈希
  const maxSize = 1024 * 1024 // 1MB
  const chunk = file.slice(0, Math.min(file.size, maxSize))

  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = e => {
      try {
        const arrayBuffer = e.target?.result as ArrayBuffer
        const uint8Array = new Uint8Array(arrayBuffer)

        // 使用简单的哈希算法
        let hash = 0
        for (let i = 0; i < uint8Array.length; i++) {
          hash = ((hash << 5) - hash + uint8Array[i]) & 0xffffffff
        }

        // 转换为16进制字符串
        const hashString = hash.toString(16).padStart(8, '0')
        resolve(`${file.name}_${file.size}_${hashString}`)
      } catch (_error) {
        reject(new Error($t('http.upload.hashCalculationFailed')))
      }
    }

    reader.onerror = _error => {
      reject(new Error($t('http.upload.fileReadFailed')))
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
    this.uploadQueue = []
  }

  /**
   * 添加上传任务
   */
  addTask(file: File, config?: UploadChunkConfig): string {
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
      startTime: new Date(),
      cancelToken: new AbortController(),
    }

    this.tasks.set(taskId, task)
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
      task.status = 'pending'
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
    if (task && task.status === 'pending') {
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

    while (this.uploadQueue.length > 0) {
      const taskId = this.uploadQueue.shift()!
      const task = this.tasks.get(taskId)

      if (!task || task.status === 'cancelled') {
        continue
      }

      try {
        await this.uploadTask(task)
      } catch (error) {
        task.status = 'failed'
        this.updateTaskProgress(task)
        throw error
      }
    }

    this.isProcessing = false
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
      const concurrentChunks = HTTP_CONFIG.defaultConcurrentChunks
      const chunks = [...pendingChunks]

      for (let i = 0; i < chunks.length; i += concurrentChunks) {
        const batch = chunks.slice(i, i + concurrentChunks)
        await Promise.all(batch.map(chunk => this.uploadChunk(task, chunk)))

        // 检查任务状态
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
    } catch (_error) {
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
      })

      // 分片上传成功
      task.uploadedChunks.add(chunk.chunkIndex)
      task.failedChunks.delete(chunk.chunkIndex)

      // 更新进度
      this.updateTaskProgress(task)
    } catch (error) {
      task.failedChunks.add(chunk.chunkIndex)

      throw error
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
    const uploadedCount = task.uploadedChunks.size
    const totalCount = task.chunks.length
    task.progress = Math.round((uploadedCount / totalCount) * 100)
  }

  /**
   * 生成任务ID
   */
  private generateTaskId(): string {
    return `upload_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }
}

// 创建全局上传管理器实例
export const uploadManager = new UploadManager()

// 导出便捷方法
export const addUploadTask = (file: File, config?: UploadChunkConfig) =>
  uploadManager.addTask(file, config)
export const removeUploadTask = (taskId: string) => uploadManager.removeTask(taskId)
export const cancelUploadTask = (taskId: string) => uploadManager.cancelTask(taskId)
export const pauseUploadTask = (taskId: string) => uploadManager.pauseTask(taskId)
export const resumeUploadTask = (taskId: string) => uploadManager.resumeTask(taskId)
export const getUploadTask = (taskId: string) => uploadManager.getTask(taskId)
export const getAllUploadTasks = () => uploadManager.getAllTasks()
export type { UploadTask } from './types'
