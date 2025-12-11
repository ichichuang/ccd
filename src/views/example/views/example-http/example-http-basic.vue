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

/* post */
const postLoading = ref(false)
const postResult = ref<string | null>(null)
const postError = ref<string | null>(null)

const postTest = async () => {
  postLoading.value = true
  postError.value = null
  postResult.value = null

  testPost({ name: 'test' })
    .then(res => {
      postResult.value = res
    })
    .catch(err => {
      postError.value = err instanceof Error ? err.message : '请求失败'
    })
    .finally(() => {
      postLoading.value = false
    })
}

/* put */
const putLoading = ref(false)
const putResult = ref<string | null>(null)
const putError = ref<string | null>(null)

const putTest = async () => {
  putLoading.value = true
  putError.value = null
  putResult.value = null

  testPut({ name: 'test' })
    .then(res => {
      putResult.value = res
    })
    .catch(err => {
      putError.value = err instanceof Error ? err.message : '请求失败'
    })
    .finally(() => {
      putLoading.value = false
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
  .grid.grid-cols-1.gap-gap(class='sm:grid-cols-2 xl:grid-cols-3')
    .c-card.between
      .flex-1.between-col.items-start.gap-gap
        b HTTP GET 请求
        b.color-text200 /test/get
        Button(label='Send', :loading='gelLoading', @click='getTest')
      .flex-1.full.between-col.justify-start.items-start.gap-gap
        template(v-if='getResult || getError')
          template(v-if='getResult')
            b.color-text200 请求成功：
            .fs-appFontSizes {{ getResult }}
          template(v-if='getError')
            b.color-text200 请求失败：
            .fs-appFontSizes {{ getError }}
    .c-card.between
      .flex-1.between-col.items-start.gap-gap
        b HTTP POST 请求
        b.color-text200 /test/post
        Button(label='Send', :loading='postLoading', @click='postTest')
      .flex-1.full.between-col.justify-start.items-start.gap-gap
        template(v-if='postResult || postError')
          template(v-if='postResult')
            b.color-text200 请求成功：
            .fs-appFontSizes {{ postResult }}
          template(v-if='postError')
            b.color-text200 请求失败：
            .fs-appFontSizes {{ postError }}
    .c-card.between
      .flex-1.between-col.items-start.gap-gap
        b HTTP PUT 请求
        b.color-text200 /test/post
        Button(label='Send', :loading='putLoading', @click='putTest')
      .flex-1.full.between-col.justify-start.items-start.gap-gap
        template(v-if='putResult || putError')
          template(v-if='putResult')
            b.color-text200 请求成功：
            .fs-appFontSizes {{ putResult }}
          template(v-if='putError')
            b.color-text200 请求失败：
            .fs-appFontSizes {{ putError }}
    .c-card.between
      .flex-1.between-col.items-start.gap-gap
        b HTTP DELETE 请求
        b.color-text200 /test/delete
        Button(label='Send', :loading='deleteLoading', @click='deleteTest')
      .flex-1.full.between-col.justify-start.items-start.gap-gap
        template(v-if='deleteResult || deleteError')
          template(v-if='deleteResult')
            b.color-text200 请求成功：
            .fs-appFontSizes {{ deleteResult }}
          template(v-if='deleteError')
            b.color-text200 请求失败：
            .fs-appFontSizes {{ deleteError }}
</template>
