/**
 * 文件下载接口模块
 * 提供文件列表查询、文件信息获取和文件下载功能
 * @module api/modules/download
 */

import { get } from '@/utils'
import { downloadFile as downloadFileUtil } from '@/utils/modules/http/methods'

/**
 * 文件信息
 */
export interface FileInfo {
  /** 文件名 */
  filename: string
  /** 文件大小（字节） */
  size: number
  /** 创建时间（ISO 字符串） */
  createdAt: string
  /** 修改时间（ISO 字符串） */
  modifiedAt: string
  /** 文件下载 URL */
  url: string
}

/**
 * 文件列表响应
 */
export interface FileListResponse {
  /** 文件列表 */
  files: FileInfo[]
  /** 文件数量 */
  count: number
}

/**
 * 获取文件列表
 * 获取服务器上可下载的文件列表（来自 public/file 目录）
 * @returns Promise<FileListResponse>
 * @example
 * ```typescript
 * const result = await getFileList()
 * // result.files = [{ filename: 'file.png', size: 1024, ... }, ...]
 * ```
 */
export const getFileList = () => get<FileListResponse>('/api/download/list')

/**
 * 获取文件信息
 * 查询指定文件的详细信息（不下载文件）
 * @param filename - 文件名
 * @returns Promise<FileInfo>
 * @example
 * ```typescript
 * const info = await getFileInfo('pngsuc.png')
 * ```
 */
export const getFileInfo = (filename: string | undefined) =>
  get<FileInfo>(`/api/download/info/${encodeURIComponent(filename || '')}`)

/**
 * 获取下载 URL
 * 生成文件的下载 URL
 * @param filename - 文件名
 * @returns 下载 URL 字符串
 * @example
 * ```typescript
 * const url = getDownloadUrl('pngsuc.png')
 * // url = '/api/download/file/pngsuc.png'
 * ```
 */
export const getDownloadUrl = (filename: string) =>
  `/api/download/file/${encodeURIComponent(filename)}`

/**
 * 下载文件
 * 下载指定文件到本地
 * @param filename - 文件名
 * @returns Promise<string> 下载的文件名
 * @example
 * ```typescript
 * await downloadFile('pngsuc.png')
 * ```
 */
export const downloadFile = async (filename: string | undefined) => {
  const url = getDownloadUrl(filename || '')
  return downloadFileUtil(url, filename)
}
