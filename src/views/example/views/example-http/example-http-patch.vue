<script setup lang="ts">
import { checkExampleExists, patchExample } from '@/api/modules/example'
import { ref } from 'vue'

/* PATCH 请求 */
const patchId = ref<number>(1)
const patchName = ref<string | undefined>('Updated Name')
const patchLoading = ref(false)
const patchResult = ref<string | null>(null)
const patchError = ref<string | null>(null)

const handlePatch = async () => {
  patchLoading.value = true
  patchError.value = null
  patchResult.value = null

  patchExample(patchId.value, { name: patchName.value })
    .then(res => {
      patchResult.value = JSON.stringify(res, null, 2)
    })
    .catch(err => {
      patchError.value = err instanceof Error ? err.message : '请求失败'
    })
    .finally(() => {
      patchLoading.value = false
    })
}

/* HEAD 请求 */
const headId = ref<number>(1)
const headLoading = ref(false)
const headResult = ref<string | null>(null)
const headError = ref<string | null>(null)

const handleHead = async () => {
  headLoading.value = true
  headError.value = null
  headResult.value = null

  checkExampleExists(headId.value)
    .then(() => {
      headResult.value = `✅ 资源存在 (ID: ${headId.value})`
    })
    .catch(err => {
      headError.value = err instanceof Error ? err.message : '资源不存在'
    })
    .finally(() => {
      headLoading.value = false
    })
}
</script>

<template lang="pug">
.p-paddingl.between-col.justify-start.gap-gapl
  //- PATCH 请求
  .between-col.justify-start.gap-gap
    b.fs-appFontSizel PATCH 请求示例
    p.color-text200.fs-appFontSizes 演示 PATCH 方法的部分更新功能

  .c-card.between
    .flex-1.between-col.items-start.gap-gap
      .flex.items-center.gap-gap
        b HTTP PATCH 请求
        span.fs-appFontSizes.bg-warning100.color-warning400.px-padding.py-padding.rounded-rounded 部分更新
      b.color-text200.fs-appFontSizes /api/example/patch/:id

      .between-col.gap-gaps.w-full
        .between-start.gap-gap.items-center
          label.fs-appFontSizes.w-20 ID:
          InputNumber.flex-1(v-model='patchId', :min='1')
        .between-start.gap-gap.items-center
          label.fs-appFontSizes.w-20 名称:
          InputText.flex-1(v-model='patchName')

      Button(
        label='发送 PATCH 请求',
        :loading='patchLoading',
        @click='handlePatch',
        severity='warning'
      )

    .flex-1.full.between-col.justify-start.items-start.gap-gap
      template(v-if='patchResult || patchError')
        template(v-if='patchResult')
          b.color-text200 ✅ 请求成功：
          pre.fs-appFontSizes.bg-bg300.p-padding.rounded-rounded.overflow-auto {{ patchResult }}
        template(v-if='patchError')
          b.color-dangerColor ❌ 请求失败：
          .fs-appFontSizes.color-dangerColor {{ patchError }}

  //- HEAD 请求
  .between-col.justify-start.gap-gap
    b.fs-appFontSizel HEAD 请求示例
    p.color-text200.fs-appFontSizes 演示 HEAD 方法的资源存在性检查

  .c-card.between
    .flex-1.between-col.items-start.gap-gap
      .flex.items-center.gap-gap
        b HTTP HEAD 请求
        span.fs-appFontSizes.bg-info100.color-info400.px-padding.py-padding.rounded-rounded 仅检查
      b.color-text200.fs-appFontSizes /api/example/:id

      .between-start.gap-gap.items-center.w-full
        label.fs-appFontSizes.w-20 ID:
        InputNumber.flex-1(v-model='headId', :min='1')

      Button(label='检查资源是否存在', :loading='headLoading', @click='handleHead', severity='info')

    .flex-1.full.between-col.justify-start.items-start.gap-gap
      template(v-if='headResult || headError')
        template(v-if='headResult')
          b.color-text200 检查结果：
          .fs-appFontSizes.bg-success100.color-success400.p-padding.rounded-rounded {{ headResult }}
        template(v-if='headError')
          b.color-dangerColor 检查结果：
          .fs-appFontSizes.color-dangerColor {{ headError }}

  //- 使用说明
  .between-col.justify-start.gap-gap.color-accent100.c-border-accent.p-paddingl
    b.fs-appFontSizex 📖 使用说明
    .between-col.justify-start.gap-gap.fs-appFontSizes
      .between-start.gap-gap
        b PATCH 请求
        | ：用于部分更新资源，只更新提供的字段，不影响其他字段
      .between-start.gap-gap
        b HEAD 请求
        | ：用于检查资源是否存在，不返回响应体，节省带宽
      .between-start.gap-gap
        b 使用场景
        | ：PATCH 适合表单部分更新，HEAD 适合资源预检查
      .between-start.gap-gap
        b 与 PUT 的区别
        | ：PUT 是完整替换，PATCH 是部分更新
</template>
