/**
 * 文件上传接口模块
 * 提供单文件、多文件和分片上传功能
 * @module api/modules/upload
 */

import { post } from '@/utils'
import type { UploadConfig } from '@/utils/modules/http/types'

/**
 * 文件上传响应
 */
export interface FileUploadResponse {
  /** 原始文件名 */
  filename: string
  /** 原始文件名（同 filename） */
  originalName: string
  /** 服务器保存的文件名 */
  savedName: string
  /** 文件大小（字节） */
  size: number
  /** 文件类型（MIME） */
  type: string
  /** 文件访问 URL */
  url: string
  /** 上传时间（ISO 字符串） */
  uploadedAt: string
}

/**
 * 多文件上传响应
 */
export interface FilesUploadResponse {
  /** 上传成功的文件列表 */
  files: FileUploadResponse[]
  /** 文件数量 */
  count: number
}

/**
 * 检查分片参数
 * 用于断点续传，检查哪些分片已上传
 */
export interface CheckChunksParams {
  /** 文件唯一标识 */
  fileId: string
  /** 文件名 */
  fileName: string
  /** 文件哈希值 */
  fileHash: string
  /** 总分片数 */
  totalChunks: number
}

/**
 * 检查分片响应
 */
export interface CheckChunksResponse {
  /** 已上传的分片索引数组 */
  uploadedChunks: number[]
}

/**
 * 合并分片参数
 * 所有分片上传完成后，调用此接口合并文件
 */
export interface MergeChunksParams {
  /** 文件唯一标识 */
  fileId: string
  /** 文件名 */
  fileName: string
  /** 文件哈希值 */
  fileHash: string
  /** 总分片数 */
  totalChunks: number
}

/**
 * 合并分片响应
 */
export interface MergeChunksResponse {
  /** 文件唯一标识 */
  fileId: string
  /** 文件名 */
  fileName: string
  /** 服务器保存的文件名 */
  savedName: string
  /** 文件访问 URL */
  url: string
  /** 文件大小（字节） */
  size: number
  /** 上传时间（ISO 字符串） */
  uploadedAt: string
}

/**
 * 单文件上传
 * @param file - 要上传的文件
 * @param config - 上传配置（支持进度回调等）
 * @returns Promise<FileUploadResponse>
 * @example
 * ```typescript
 * const file = document.querySelector('input[type="file"]').files[0]
 * await uploadFile(file, {
 *   onProgress: (progress) => console.log(`上传进度: ${progress}%`)
 * })
 * ```
 */
export const uploadFile = (file: File, config?: UploadConfig) => {
  const formData = new FormData()
  formData.append('file', file)
  return post<FileUploadResponse>('/api/upload/file', formData, config)
}

/**
 * 多文件上传
 * 批量上传多个文件
 * @param files - 要上传的文件数组
 * @param config - 上传配置（支持进度回调等）
 * @returns Promise<FilesUploadResponse>
 * @example
 * ```typescript
 * const files = document.querySelector('input[type="file"]').files
 * await uploadFiles(Array.from(files), {
 *   onProgress: (progress) => console.log(`上传进度: ${progress}%`)
 * })
 * ```
 */
export const uploadFiles = (files: File[], config?: UploadConfig) => {
  const formData = new FormData()
  files.forEach((file, index) => {
    formData.append(`files[${index}]`, file)
  })
  return post<FilesUploadResponse>('/api/upload/files', formData, config)
}

/**
 * 检查已上传的分片
 * 用于断点续传，检查哪些分片已经上传成功
 * @param params - 检查参数
 * @returns Promise<CheckChunksResponse>
 * @example
 * ```typescript
 * const result = await checkChunks({
 *   fileId: 'file-123',
 *   fileName: 'large-file.zip',
 *   fileHash: 'hash-value',
 *   totalChunks: 10
 * })
 * // result.uploadedChunks = [0, 1, 2] // 已上传的分片索引
 * ```
 */
export const checkChunks = (params: CheckChunksParams) =>
  post<CheckChunksResponse>('/api/upload/check', params)

/**
 * 上传单个分片
 * 用于大文件分片上传
 * @param formData - FormData，包含分片文件和相关元数据
 * @param config - 上传配置（支持取消、进度回调等）
 * @returns Promise<{ chunkIndex: number; saved: boolean; uploadedChunks: number[] }>
 * @example
 * ```typescript
 * const formData = new FormData()
 * formData.append('file', chunkBlob)
 * formData.append('fileId', 'file-123')
 * formData.append('chunkIndex', '0')
 * formData.append('totalChunks', '10')
 * await uploadChunk(formData)
 * ```
 */
export const uploadChunk = (formData: FormData, config?: UploadConfig) =>
  post<{ chunkIndex: number; saved: boolean; uploadedChunks: number[] }>(
    '/api/upload/chunk',
    formData,
    config
  )

/**
 * 合并分片
 * 所有分片上传完成后，调用此接口合并文件
 * @param params - 合并参数
 * @returns Promise<MergeChunksResponse>
 * @example
 * ```typescript
 * await mergeChunks({
 *   fileId: 'file-123',
 *   fileName: 'large-file.zip',
 *   fileHash: 'hash-value',
 *   totalChunks: 10
 * })
 * ```
 */
export const mergeChunks = (params: MergeChunksParams) =>
  post<MergeChunksResponse>('/api/upload/merge', params)
