<script setup lang="ts">
import { testDelete, testGet, testPost, testPut } from '@/api/modules/test'
import { ref } from 'vue'

/* get */
const gelLoading = ref(false)
const getResult = ref<string | null>(null)
const getError = ref<string | null>(null)

const getTest = async () => {
  gelLoading.value = true
  getError.value = null
  getResult.value = null

  testGet()
    .then(res => {
      getResult.value = res
    })
    .catch(err => {
      getError.value = err instanceof Error ? err.message : '请求失败'
    })
    .finally(() => {
      gelLoading.value = false
    })
}

/* post - 普通请求 */
const postLoading = ref(false)
const postResult = ref<string | null>(null)
const postError = ref<string | null>(null)

const postTest = async () => {
  postLoading.value = true
  postError.value = null
  postResult.value = null

  testPost({ name: 'test without encryption' })
    .then(res => {
      postResult.value = JSON.stringify(res, null, 2)
    })
    .catch(err => {
      postError.value = err instanceof Error ? err.message : '请求失败'
    })
    .finally(() => {
      postLoading.value = false
    })
}

/* post - 加密请求 */
const postEncryptLoading = ref(false)
const postEncryptResult = ref<string | null>(null)
const postEncryptError = ref<string | null>(null)

const postEncryptTest = async () => {
  postEncryptLoading.value = true
  postEncryptError.value = null
  postEncryptResult.value = null

  testPost({
    name: 'test with encryption',
    isSafeStorage: true, // ✅ 启用加密传输
  })
    .then(res => {
      postEncryptResult.value = JSON.stringify(res, null, 2)
    })
    .catch(err => {
      postEncryptError.value = err instanceof Error ? err.message : '请求失败'
    })
    .finally(() => {
      postEncryptLoading.value = false
    })
}

/* put - 普通请求 */
const putLoading = ref(false)
const putResult = ref<string | null>(null)
const putError = ref<string | null>(null)

const putTest = async () => {
  putLoading.value = true
  putError.value = null
  putResult.value = null

  testPut({ name: 'test without encryption' })
    .then(res => {
      putResult.value = JSON.stringify(res, null, 2)
    })
    .catch(err => {
      putError.value = err instanceof Error ? err.message : '请求失败'
    })
    .finally(() => {
      putLoading.value = false
    })
}

/* put - 加密请求 */
const putEncryptLoading = ref(false)
const putEncryptResult = ref<string | null>(null)
const putEncryptError = ref<string | null>(null)

const putEncryptTest = async () => {
  putEncryptLoading.value = true
  putEncryptError.value = null
  putEncryptResult.value = null

  testPut({
    name: 'test with encryption',
    isSafeStorage: true, // ✅ 启用加密传输
  })
    .then(res => {
      putEncryptResult.value = JSON.stringify(res, null, 2)
    })
    .catch(err => {
      putEncryptError.value = err instanceof Error ? err.message : '请求失败'
    })
    .finally(() => {
      putEncryptLoading.value = false
    })
}

/* delete */
const deleteLoading = ref(false)
const deleteResult = ref<string | null>(null)
const deleteError = ref<string | null>(null)

const deleteTest = async () => {
  deleteLoading.value = true
  deleteError.value = null
  deleteResult.value = null

  testDelete()
    .then(res => {
      deleteResult.value = res
    })
    .catch(err => {
      deleteError.value = err instanceof Error ? err.message : '请求失败'
    })
    .finally(() => {
      deleteLoading.value = false
    })
}
</script>

<template lang="pug">
.p-paddingl
  //- 基础 HTTP 请求
  .mb-4
    h2.text-2xl.font-bold.mb-2 基础 HTTP 请求
    p.color-text200.mb-4 演示基本的 HTTP 方法（GET、DELETE）

  .grid.grid-cols-1.gap-gap.mb-8(class='lg:grid-cols-2')
    //- GET 请求
    .c-card.between
      .flex-1.between-col.items-start.gap-gap
        .flex.items-center.gap-2
          b HTTP GET 请求
        b.color-text200.text-sm /test/get
        Button(label='发送请求', :loading='gelLoading', @click='getTest')
      .flex-1.full.between-col.justify-start.items-start.gap-gap
        template(v-if='getResult || getError')
          template(v-if='getResult')
            b.color-text200 请求成功：
            pre.fs-appFontSizes.bg-gray-100.p-2.rounded.overflow-auto {{ getResult }}
          template(v-if='getError')
            b.color-red-500 请求失败：
            .fs-appFontSizes.text-red-500 {{ getError }}

    //- DELETE 请求
    .c-card.between
      .flex-1.between-col.items-start.gap-gap
        .flex.items-center.gap-2
          b HTTP DELETE 请求
        b.color-text200.text-sm /test/delete
        Button(label='发送请求', :loading='deleteLoading', @click='deleteTest')
      .flex-1.full.between-col.justify-start.items-start.gap-gap
        template(v-if='deleteResult || deleteError')
          template(v-if='deleteResult')
            b.color-text200 请求成功：
            pre.fs-appFontSizes.bg-gray-100.p-2.rounded.overflow-auto {{ deleteResult }}
          template(v-if='deleteError')
            b.color-red-500 请求失败：
            .fs-appFontSizes.text-red-500 {{ deleteError }}

  //- 数据加密传输
  .mb-4
    h2.text-2xl.font-bold.mb-2 🔐 数据加密传输
    p.color-text200.mb-2 演示带 isSafeStorage 的加密传输功能
    .bg-blue-50.border-l-4.border-blue-500.p-3.mb-4
      p.text-sm
        | 💡
        strong 提示
        | ：添加
        code.bg-blue-100.px-1.rounded(style='padding-top: 0.125rem; padding-bottom: 0.125rem') isSafeStorage: true
        |
        | 参数，请求数据会自动加密传输。
      p.text-sm.mt-1
        | 📝 打开浏览器开发者工具的 Network 标签，查看加密前后的请求数据差异。

  .grid.grid-cols-1.gap-gap(class='lg:grid-cols-2')
    //- POST 请求组
    .space-y-4
      h3.text-xl.font-semibold POST 请求对比

      //- POST 普通请求
      .c-card.between
        .flex-1.between-col.items-start.gap-gap
          .flex.items-center.gap-2
            b POST 请求
            span.text-xs.bg-gray-200.px-2.py-1.rounded 普通传输
          b.color-text200.text-sm /test/post
          code.text-xs.bg-gray-100.p-2.rounded.w-full.break-all { name: "test without encryption" }
          Button(label='发送普通请求', :loading='postLoading', @click='postTest', severity='secondary')
        .flex-1.full.between-col.justify-start.items-start.gap-gap
          template(v-if='postResult || postError')
            template(v-if='postResult')
              b.color-text200 ✅ 响应成功：
              pre.fs-appFontSizes.bg-gray-100.p-2.rounded.overflow-auto(style='max-height: 10rem') {{ postResult }}
            template(v-if='postError')
              b.color-red-500 ❌ 请求失败：
              .fs-appFontSizes.text-red-500 {{ postError }}

      //- POST 加密请求
      .c-card.between.border-2.border-blue-300
        .flex-1.between-col.items-start.gap-gap
          .flex.items-center.gap-2
            b POST 请求
            span.text-xs.bg-blue-500.text-white.px-2.py-1.rounded 🔐 加密传输
          b.color-text200.text-sm /test/post
          code.text-xs.bg-blue-50.p-2.rounded.w-full.break-all { name: "test with encryption", isSafeStorage: true }
          Button(
            label='发送加密请求',
            :loading='postEncryptLoading',
            @click='postEncryptTest',
            severity='info'
          )
        .flex-1.full.between-col.justify-start.items-start.gap-gap
          template(v-if='postEncryptResult || postEncryptError')
            template(v-if='postEncryptResult')
              b.color-text200 ✅ 响应成功（已自动解密）：
              pre.fs-appFontSizes.bg-blue-50.p-2.rounded.overflow-auto(style='max-height: 10rem') {{ postEncryptResult }}
            template(v-if='postEncryptError')
              b.color-red-500 ❌ 请求失败：
              .fs-appFontSizes.text-red-500 {{ postEncryptError }}

    //- PUT 请求组
    .space-y-4
      h3.text-xl.font-semibold PUT 请求对比

      //- PUT 普通请求
      .c-card.between
        .flex-1.between-col.items-start.gap-gap
          .flex.items-center.gap-2
            b PUT 请求
            span.text-xs.bg-gray-200.px-2.py-1.rounded 普通传输
          b.color-text200.text-sm /test/put
          code.text-xs.bg-gray-100.p-2.rounded.w-full.break-all { name: "test without encryption" }
          Button(label='发送普通请求', :loading='putLoading', @click='putTest', severity='secondary')
        .flex-1.full.between-col.justify-start.items-start.gap-gap
          template(v-if='putResult || putError')
            template(v-if='putResult')
              b.color-text200 ✅ 响应成功：
              pre.fs-appFontSizes.bg-gray-100.p-2.rounded.overflow-auto(style='max-height: 10rem') {{ putResult }}
            template(v-if='putError')
              b.color-red-500 ❌ 请求失败：
              .fs-appFontSizes.text-red-500 {{ putError }}

      //- PUT 加密请求
      .c-card.between.border-2.border-blue-300
        .flex-1.between-col.items-start.gap-gap
          .flex.items-center.gap-2
            b PUT 请求
            span.text-xs.bg-blue-500.text-white.px-2.py-1.rounded 🔐 加密传输
          b.color-text200.text-sm /test/put
          code.text-xs.bg-blue-50.p-2.rounded.w-full.break-all { name: "test with encryption", isSafeStorage: true }
          Button(
            label='发送加密请求',
            :loading='putEncryptLoading',
            @click='putEncryptTest',
            severity='info'
          )
        .flex-1.full.between-col.justify-start.items-start.gap-gap
          template(v-if='putEncryptResult || putEncryptError')
            template(v-if='putEncryptResult')
              b.color-text200 ✅ 响应成功（已自动解密）：
              pre.fs-appFontSizes.bg-blue-50.p-2.rounded.overflow-auto(style='max-height: 10rem') {{ putEncryptResult }}
            template(v-if='putEncryptError')
              b.color-red-500 ❌ 请求失败：
              .fs-appFontSizes.text-red-500 {{ putEncryptError }}

  //- 使用说明
  .mt-8.bg-yellow-50.border-l-4.border-yellow-500.p-4
    h3.text-lg.font-semibold.mb-2 📖 使用说明
    ul.list-disc.list-inside.space-y-2.text-sm
      li
        strong 普通传输
        | ：数据明文传输，可在 Network 中直接看到请求内容
      li
        strong 加密传输
        | ：添加
        code.bg-yellow-100.px-1.rounded(style='padding-top: 0.125rem; padding-bottom: 0.125rem') isSafeStorage: true
        | ，数据会被 AES 加密，Network 中看到的是加密后的 Base64 字符串
      li
        strong 自动解密
        | ：服务端接收到加密数据后会自动解密，响应数据也会被加密，前端自动解密
      li
        strong 查看加密数据
        | ：打开 Network → 选择请求 → Payload/Preview 查看加密后的数据（以 U2FsdGVkX1 开头）
</template>
