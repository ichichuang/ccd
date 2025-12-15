<script setup lang="ts">
import {
  addUploadTask,
  cancelUploadTask,
  getUploadTask,
  pauseUploadTask,
  removeUploadTask,
  resumeUploadTask,
  type UploadTask,
} from '@/utils/modules/http/uploadManager'
import { onUnmounted, ref, watch } from 'vue'

/* 分片上传 */
type UploadStatus =
  | 'idle'
  | 'uploading'
  | 'paused'
  | 'merging'
  | 'completed'
  | 'failed'
  | 'cancelled'

const chunkFile = ref<File | null>(null)
const currentTaskId = ref<string | null>(null)
const uploadTask = ref<UploadTask | null>(null)
const uploadProgress = ref(0)
const uploadStatus = ref<UploadStatus>('idle')
const uploadError = ref<string | null>(null)
const uploadResult = ref<string | null>(null)

// 定时更新上传进度
let progressTimer: ReturnType<typeof setInterval> | null = null

const mapTaskStatusToUploadStatus = (status: UploadTask['status']): UploadStatus => {
  if (status === 'pending') {
    return 'paused'
  }
  if (status === 'merging') {
    return 'merging'
  }
  return status as UploadStatus
}

const updateProgress = () => {
  if (currentTaskId.value) {
    const task = getUploadTask(currentTaskId.value)
    if (task) {
      uploadTask.value = task
      uploadProgress.value = task.progress
      uploadStatus.value = mapTaskStatusToUploadStatus(task.status)

      if (task.status === 'completed') {
        uploadResult.value = JSON.stringify(
          {
            fileId: task.id,
            fileName: task.file.name,
            fileSize: task.file.size,
            totalChunks: task.chunks.length,
            uploadedAt: new Date().toISOString(),
          },
          null,
          2
        )
        uploadStatus.value = 'completed'
        if (progressTimer) {
          clearInterval(progressTimer)
          progressTimer = null
        }
      } else if (task.status === 'failed') {
        uploadError.value = '上传失败'
        uploadStatus.value = 'failed'
        if (progressTimer) {
          clearInterval(progressTimer)
          progressTimer = null
        }
      } else if (task.status === 'cancelled') {
        uploadStatus.value = 'cancelled'
        if (progressTimer) {
          clearInterval(progressTimer)
          progressTimer = null
        }
      }
    }
  }
}

const handleChunkFileChange = (event: { files: File[] }) => {
  if (event.files && event.files.length > 0) {
    chunkFile.value = event.files[0]
    // 重置状态
    currentTaskId.value = null
    uploadTask.value = null
    uploadProgress.value = 0
    uploadStatus.value = 'idle'
    uploadError.value = null
    uploadResult.value = null
  }
}

const handleChunkUpload = async () => {
  if (!chunkFile.value) {
    uploadError.value = '请选择文件'
    return
  }

  try {
    uploadError.value = null
    uploadResult.value = null
    uploadStatus.value = 'uploading'

    // 添加上传任务
    const taskId = addUploadTask(chunkFile.value, {
      chunkSize: 2 * 1024 * 1024, // 2MB 每片
      concurrentChunks: 3, // 并发上传3个分片
      onChunkProgress: (chunkIndex, progress) => {
        console.log(`分片 ${chunkIndex} 进度: ${progress}%`)
      },
      onChunkSuccess: chunkIndex => {
        console.log(`分片 ${chunkIndex} 上传成功`)
      },
      onChunkError: (chunkIndex, error) => {
        console.error(`分片 ${chunkIndex} 上传失败:`, error)
      },
      onMergeProgress: progress => {
        console.log(`合并进度: ${progress}%`)
      },
    })

    currentTaskId.value = taskId

    // 开始定时更新进度
    if (progressTimer) {
      clearInterval(progressTimer)
    }
    progressTimer = setInterval(updateProgress, 500)
  } catch (error) {
    uploadError.value = error instanceof Error ? error.message : '启动上传失败'
    uploadStatus.value = 'failed'
  }
}

const handlePause = () => {
  if (currentTaskId.value) {
    pauseUploadTask(currentTaskId.value)
    uploadStatus.value = 'paused'
  }
}

const handleResume = () => {
  if (currentTaskId.value) {
    resumeUploadTask(currentTaskId.value)
    uploadStatus.value = 'uploading'
    // 重新启动进度更新
    if (!progressTimer) {
      progressTimer = setInterval(updateProgress, 500)
    }
  }
}

const handleCancel = () => {
  if (currentTaskId.value) {
    cancelUploadTask(currentTaskId.value)
    uploadStatus.value = 'cancelled'
    if (progressTimer) {
      clearInterval(progressTimer)
      progressTimer = null
    }
  }
}

const handleRemove = () => {
  if (currentTaskId.value) {
    removeUploadTask(currentTaskId.value)
    currentTaskId.value = null
    uploadTask.value = null
    uploadProgress.value = 0
    uploadStatus.value = 'idle'
    uploadError.value = null
    uploadResult.value = null
    if (progressTimer) {
      clearInterval(progressTimer)
      progressTimer = null
    }
  }
}

// 监听任务状态变化
watch(
  () => currentTaskId.value,
  () => {
    updateProgress()
  }
)

// 组件卸载时清理定时器
onUnmounted(() => {
  if (progressTimer) {
    clearInterval(progressTimer)
    progressTimer = null
  }
})
</script>

<template lang="pug">
.p-paddingl.between-col.justify-start.gap-gapl
  //- 分片上传示例
  .between-col.justify-start.gap-gap
    b.fs-appFontSizel 📦 分片上传示例
    p.color-text200.fs-appFontSizes 演示大文件分片上传、断点续传、暂停/恢复功能

  .c-card.between
    .flex-1.between-col.items-start.gap-gap
      .flex.items-center.gap-gap
        b 分片上传
        span.fs-appFontSizes.bg-success100.color-success400.px-padding.py-padding.rounded-rounded(
          v-if='uploadStatus === "completed"'
        ) 已完成
        span.fs-appFontSizes.bg-warning100.color-warning400.px-padding.py-padding.rounded-rounded(
          v-else-if='uploadStatus === "uploading"'
        ) 上传中
        span.fs-appFontSizes.bg-info100.color-info400.px-padding.py-padding.rounded-rounded(
          v-else-if='uploadStatus === "paused"'
        ) 已暂停
        span.fs-appFontSizes.bg-danger100.color-danger400.px-padding.py-padding.rounded-rounded(
          v-else-if='uploadStatus === "failed"'
        ) 失败
        span.fs-appFontSizes.bg-bg300.px-padding.py-padding.rounded-rounded(
          v-else-if='uploadStatus === "cancelled"'
        ) 已取消
        span.fs-appFontSizes.bg-bg300.px-padding.py-padding.rounded-rounded(v-else) 待上传
      b.color-text200.fs-appFontSizes /api/upload/chunk
      FileUpload(
        mode='basic',
        :auto='false',
        :multiple='false',
        @select='handleChunkFileChange',
        accept='*',
        :disabled='uploadStatus === "uploading" || uploadStatus === "merging"'
      )
      template(v-if='chunkFile')
        .fs-appFontSizes.color-text200
          | 已选择：
          b {{ chunkFile.name }}
          |
          | ({{ (chunkFile.size / 1024 / 1024).toFixed(2) }} MB)
        .fs-appFontSizes.color-text200
          | 分片大小：2MB，预计分片数：
          b {{ Math.ceil(chunkFile.size / (2 * 1024 * 1024)) }}

      //- 进度条
      template(v-if='uploadTask && uploadStatus !== "idle"')
        .w-full.between-col.gap-gaps
          .between-start.gap-gap.w-full
            b.fs-appFontSizes 上传进度：
            span.fs-appFontSizes {{ uploadProgress }}%
          .w-full.h-4.bg-bg300.rounded-rounded.overflow-hidden
            .h-full.bg-primary400.transition-all(:style='{ width: `${uploadProgress}%` }')
          .fs-appFontSizes.color-text200
            | 已上传：
            b {{ uploadTask.uploadedChunks.size }}
            | /
            b {{ uploadTask.chunks.length }}
            | 个分片

      //- 操作按钮
      .between-start.gap-gap.w-full
        Button(
          label='开始上传',
          :loading='uploadStatus === "uploading" || uploadStatus === "merging"',
          :disabled='!chunkFile || uploadStatus === "uploading" || uploadStatus === "merging"',
          @click='handleChunkUpload',
          severity='success'
        )
        Button(
          label='暂停',
          :disabled='uploadStatus !== "uploading"',
          @click='handlePause',
          severity='warning'
        )
        Button(
          label='恢复',
          :disabled='uploadStatus !== "paused"',
          @click='handleResume',
          severity='info'
        )
        Button(
          label='取消',
          :disabled='uploadStatus === "idle" || uploadStatus === "completed" || uploadStatus === "cancelled"',
          @click='handleCancel',
          severity='danger'
        )
        Button(
          label='清除',
          :disabled='uploadStatus === "uploading" || uploadStatus === "merging"',
          @click='handleRemove',
          severity='secondary'
        )

    .flex-1.full.between-col.justify-start.items-start.gap-gap
      template(v-if='uploadTask')
        b.color-text200 任务详情：
        .between-col.gap-gaps
          .c-card.between-start.gap-gap
            .flex-1.between-col.items-start.gap-gaps
              .between-start.gap-gap
                b 任务ID：
                span {{ uploadTask.id }}
              .between-start.gap-gap
                b 文件名：
                span {{ uploadTask.file.name }}
              .between-start.gap-gap
                b 文件大小：
                span {{ (uploadTask.file.size / 1024 / 1024).toFixed(2) }} MB
              .between-start.gap-gap
                b 总分片数：
                span {{ uploadTask.chunks.length }}
              .between-start.gap-gap
                b 已上传分片：
                span {{ uploadTask.uploadedChunks.size }}
              .between-start.gap-gap
                b 失败分片：
                span {{ uploadTask.failedChunks.size }}
              .between-start.gap-gap
                b 状态：
                span {{ uploadTask.status }}
              .between-start.gap-gap
                b 开始时间：
                span {{ new Date(uploadTask.startTime).toLocaleString() }}

      template(v-if='uploadResult || uploadError')
        template(v-if='uploadResult')
          b.color-text200 ✅ 上传成功：
          pre.fs-appFontSizes.bg-bg300.p-padding.rounded-rounded.overflow-auto {{ uploadResult }}
        template(v-if='uploadError')
          b.color-dangerColor ❌ 上传失败：
          .fs-appFontSizes.color-dangerColor {{ uploadError }}

  //- 使用说明
  .between-col.justify-start.gap-gap.color-accent100.c-border-accent.p-paddingl
    b.fs-appFontSizex 📖 使用说明
    .between-col.justify-start.gap-gap.fs-appFontSizes
      .between-start.gap-gap
        b 分片上传
        | ：大文件会被自动分割为多个分片（默认2MB/片）进行上传
      .between-start.gap-gap
        b 断点续传
        | ：上传失败后重新上传，会自动跳过已上传的分片
      .between-start.gap-gap
        b 暂停/恢复
        | ：可以随时暂停上传，稍后恢复继续上传
      .between-start.gap-gap
        b 并发上传
        | ：默认同时上传3个分片，提高上传速度
      .between-start.gap-gap
        b 自动合并
        | ：所有分片上传完成后，服务器会自动合并文件
      .between-start.gap-gap
        b 适用场景
        | ：适合上传大文件（>10MB），提供更好的用户体验和稳定性
</template>
