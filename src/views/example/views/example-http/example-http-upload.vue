<script setup lang="ts">
import { uploadFile, uploadFiles } from '@/api/modules/upload'
import { ref } from 'vue'

/* 单文件上传 */
const singleFileLoading = ref(false)
const singleFileResult = ref<string | null>(null)
const singleFileError = ref<string | null>(null)
const singleFile = ref<File | null>(null)

const handleSingleUpload = async () => {
  if (!singleFile.value) {
    singleFileError.value = '请选择文件'
    return
  }

  singleFileLoading.value = true
  singleFileError.value = null
  singleFileResult.value = null

  uploadFile(singleFile.value, {
    onProgress: progress => {
      console.log('上传进度:', progress)
    },
  })
    .then(res => {
      singleFileResult.value = JSON.stringify(res, null, 2)
    })
    .catch(err => {
      singleFileError.value = err instanceof Error ? err.message : '上传失败'
    })
    .finally(() => {
      singleFileLoading.value = false
    })
}

const handleSingleFileChange = (event: { files: File[] }) => {
  if (event.files && event.files.length > 0) {
    singleFile.value = event.files[0]
  }
}

/* 多文件上传 */
const multipleFilesLoading = ref(false)
const multipleFilesResult = ref<string | null>(null)
const multipleFilesError = ref<string | null>(null)
const multipleFiles = ref<File[]>([])

const handleMultipleUpload = async () => {
  if (multipleFiles.value.length === 0) {
    multipleFilesError.value = '请选择文件'
    return
  }

  multipleFilesLoading.value = true
  multipleFilesError.value = null
  multipleFilesResult.value = null

  uploadFiles(multipleFiles.value, {
    onProgress: progress => {
      console.log('上传进度:', progress)
    },
  })
    .then(res => {
      multipleFilesResult.value = JSON.stringify(res, null, 2)
    })
    .catch(err => {
      multipleFilesError.value = err instanceof Error ? err.message : '上传失败'
    })
    .finally(() => {
      multipleFilesLoading.value = false
    })
}

const handleMultipleFilesChange = (event: { files: File[] }) => {
  if (event.files && event.files.length > 0) {
    multipleFiles.value = event.files
  }
}
</script>

<template lang="pug">
.p-paddingl.between-col.justify-start.gap-gapl
  //- 文件上传示例
  .between-col.justify-start.gap-gap
    b.fs-appFontSizel 📤 文件上传示例
    p.color-text200.fs-appFontSizes 演示单文件和多文件上传功能

  .grid.grid-cols-1.gap-gap.mb-gapl(class='lg:grid-cols-2')
    //- 单文件上传
    .c-card.between
      .flex-1.between-col.items-start.gap-gap
        .flex.items-center.gap-gap
          b 单文件上传
        b.color-text200.fs-appFontSizes /api/upload/file
        FileUpload(
          mode='basic',
          :auto='false',
          :multiple='false',
          @select='handleSingleFileChange',
          accept='*'
        )
        template(v-if='singleFile')
          .fs-appFontSizes.color-text200
            | 已选择：
            b {{ singleFile.name }}
            |
            | ({{ (singleFile.size / 1024).toFixed(2) }} KB)
        Button(
          label='上传文件',
          :loading='singleFileLoading',
          @click='handleSingleUpload',
          severity='success'
        )
      .flex-1.full.between-col.justify-start.items-start.gap-gap
        template(v-if='singleFileResult || singleFileError')
          template(v-if='singleFileResult')
            b.color-text200 ✅ 上传成功：
            pre.fs-appFontSizes.bg-bg300.p-padding.rounded-rounded.overflow-auto {{ singleFileResult }}
          template(v-if='singleFileError')
            b.color-dangerColor ❌ 上传失败：
            .fs-appFontSizes.color-dangerColor {{ singleFileError }}

    //- 多文件上传
    .c-card.between
      .flex-1.between-col.items-start.gap-gap
        .flex.items-center.gap-gap
          b 多文件上传
        b.color-text200.fs-appFontSizes /api/upload/files
        FileUpload(
          mode='basic',
          :auto='false',
          :multiple='true',
          @select='handleMultipleFilesChange',
          accept='*'
        )
        template(v-if='multipleFiles.length > 0')
          .fs-appFontSizes.color-text200
            | 已选择
            b {{ multipleFiles.length }}
            | 个文件：
          .fs-appFontSizes.color-text200(v-for='file in multipleFiles', :key='file.name')
            | • {{ file.name }} ({{ (file.size / 1024).toFixed(2) }} KB)
        Button(
          label='批量上传',
          :loading='multipleFilesLoading',
          @click='handleMultipleUpload',
          severity='info'
        )
      .flex-1.full.between-col.justify-start.items-start.gap-gap
        template(v-if='multipleFilesResult || multipleFilesError')
          template(v-if='multipleFilesResult')
            b.color-text200 ✅ 上传成功：
            pre.fs-appFontSizes.bg-bg300.p-padding.rounded-rounded.overflow-auto {{ multipleFilesResult }}
          template(v-if='multipleFilesError')
            b.color-dangerColor ❌ 上传失败：
            .fs-appFontSizes.color-dangerColor {{ multipleFilesError }}

  //- 使用说明
  .between-col.justify-start.gap-gap.color-accent100.c-border-accent.p-paddingl
    b.fs-appFontSizex 📖 使用说明
    .between-col.justify-start.gap-gap.fs-appFontSizes
      .between-start.gap-gap
        b 单文件上传
        | ：选择单个文件后点击上传按钮
      .between-start.gap-gap
        b 多文件上传
        | ：可以同时选择多个文件进行批量上传
      .between-start.gap-gap
        b 上传进度
        | ：上传过程中会在控制台输出进度信息
      .between-start.gap-gap
        b 文件限制
        | ：当前示例不限制文件类型和大小，实际项目中应添加相应限制
</template>
