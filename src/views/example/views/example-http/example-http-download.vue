<script setup lang="ts">
import { downloadFile, getFileInfo, getFileList } from '@/api/modules/download'
import { ref } from 'vue'

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
/* 文件列表 */
const listLoading = ref(false)
const fileList = ref<FileInfo[]>([])
const listError = ref<string | null>(null)

const fetchFileList = async () => {
  listLoading.value = true
  listError.value = null
  fileList.value = []

  getFileList()
    .then(res => {
      fileList.value = res.files
    })
    .catch(err => {
      listError.value = err instanceof Error ? err.message : '获取文件列表失败'
    })
    .finally(() => {
      listLoading.value = false
    })
}

/* 文件信息 */
const infoLoading = ref(false)
const fileInfo = ref<FileInfo | null>(null)
const infoError = ref<string | null>(null)
const infoFilename = ref<string | undefined>('pngsuc.png')

const fetchFileInfo = async () => {
  infoLoading.value = true
  infoError.value = null
  fileInfo.value = null

  getFileInfo(infoFilename.value)
    .then(res => {
      fileInfo.value = res
    })
    .catch(err => {
      infoError.value = err instanceof Error ? err.message : '获取文件信息失败'
    })
    .finally(() => {
      infoLoading.value = false
    })
}

/* 文件下载 */
const downloadLoading = ref(false)
const downloadError = ref<string | null>(null)
const downloadFilename = ref<string | undefined>('pngsuc.png')

const handleDownload = async () => {
  downloadLoading.value = true
  downloadError.value = null

  try {
    await downloadFile(downloadFilename.value)
  } catch (err) {
    downloadError.value = err instanceof Error ? err.message : '下载失败'
  } finally {
    downloadLoading.value = false
  }
}

// 初始化加载文件列表
fetchFileList()
</script>

<template lang="pug">
.p-paddingl.between-col.justify-start.gap-gapl
  //- 文件下载示例
  .between-col.justify-start.gap-gap
    b.fs-appFontSizel 📥 文件下载示例
    p.color-text200.fs-appFontSizes 演示文件列表查询、文件信息获取和文件下载功能

  .grid.grid-cols-1.gap-gap.mb-gapl(class='lg:grid-cols-2')
    //- 文件列表
    .c-card.between
      .flex-1.between-col.items-start.gap-gap
        .flex.items-center.gap-gap
          b 文件列表
        b.color-text200.fs-appFontSizes /api/download/list
        Button(label='刷新列表', :loading='listLoading', @click='fetchFileList', severity='secondary')
      .flex-1.full.between-col.justify-start.items-start.gap-gap
        template(v-if='fileList.length > 0 || listError')
          template(v-if='fileList.length > 0')
            b.color-text200 ✅ 文件列表：
            .between-col.gap-gaps.mt-gap
              .c-card.between-start.gap-gap(v-for='file in fileList', :key='file.filename')
                .flex-1.between-col.items-start.gap-gaps
                  b {{ file.filename }}
                  .fs-appFontSizes.color-text200
                    | 大小：
                    b {{ (file.size / 1024).toFixed(2) }} KB
                  .fs-appFontSizes.color-text200
                    | 创建时间：
                    b {{ new Date(file.createdAt).toLocaleString() }}
                  Button(
                    label='下载',
                    size='small',
                    @click='((downloadFilename = file.filename), handleDownload())',
                    severity='info'
                  )
          template(v-if='listError')
            b.color-dangerColor ❌ 获取失败：
            .fs-appFontSizes.color-dangerColor {{ listError }}

    //- 文件信息
    .c-card.between
      .flex-1.between-col.items-start.gap-gap
        .flex.items-center.gap-gap
          b 文件信息
        b.color-text200.fs-appFontSizes /api/download/info/:filename
        InputText.w-full(v-model='infoFilename', placeholder='文件名')
        Button(label='查询信息', :loading='infoLoading', @click='fetchFileInfo', severity='warning')
      .flex-1.full.between-col.justify-start.items-start.gap-gap
        template(v-if='fileInfo || infoError')
          template(v-if='fileInfo')
            b.color-text200 ✅ 文件信息：
            pre.fs-appFontSizes.bg-bg300.p-padding.rounded-rounded.overflow-auto {{ JSON.stringify(fileInfo, null, 2) }}
          template(v-if='infoError')
            b.color-dangerColor ❌ 查询失败：
            .fs-appFontSizes.color-dangerColor {{ infoError }}

  //- 文件下载
  .c-card.between
    .flex-1.between-col.items-start.gap-gap
      .flex.items-center.gap-gap
        b 文件下载
      b.color-text200.fs-appFontSizes /api/download/file/:filename
      InputText.w-full(v-model='downloadFilename', placeholder='文件名')
      Button(label='下载文件', :loading='downloadLoading', @click='handleDownload', severity='success')
    .flex-1.full.between-col.justify-start.items-start.gap-gap
      template(v-if='downloadError')
        b.color-dangerColor ❌ 下载失败：
        .fs-appFontSizes.color-dangerColor {{ downloadError }}
      template(v-else-if='downloadLoading')
        b.color-text200 ⏳ 正在下载...

  //- 使用说明
  .between-col.justify-start.gap-gap.color-accent100.c-border-accent.p-paddingl
    b.fs-appFontSizex 📖 使用说明
    .between-col.justify-start.gap-gap.fs-appFontSizes
      .between-start.gap-gap
        b 文件列表
        | ：获取服务器上可下载的文件列表
      .between-start.gap-gap
        b 文件信息
        | ：查询指定文件的详细信息（不下载文件）
      .between-start.gap-gap
        b 文件下载
        | ：下载指定文件到本地
      .between-start.gap-gap
        b 可用文件
        | ：当前示例使用 public/file 目录中的文件（pngsuc.png、未命名.et）
</template>
