<script setup lang="ts">
import {
  createExample,
  deleteExample,
  getExampleDetail,
  getExampleList,
  patchExample,
  updateExample,
} from '@/api/modules/example'
import { ref } from 'vue'

interface ExampleItem {
  id: number
  name: string
  description?: string
  createdAt: string
}
export interface ExampleListParams {
  /** 页码，从 1 开始 */
  page?: number
  /** 每页数量，最大 100 */
  pageSize?: number
  /** 搜索关键词 */
  keyword?: string
}
/* 列表查询 */
const listLoading = ref(false)
const listData = ref<{ list: ExampleItem[]; total: number; page: number; pageSize: number } | null>(
  null
)
const listError = ref<string | null>(null)
const queryParams = ref<ExampleListParams>({ page: 1, pageSize: 10, keyword: '' })

const fetchList = async () => {
  listLoading.value = true
  listError.value = null
  listData.value = null

  getExampleList(queryParams.value)
    .then(res => {
      listData.value = res
    })
    .catch(err => {
      listError.value = err instanceof Error ? err.message : '获取列表失败'
    })
    .finally(() => {
      listLoading.value = false
    })
}

/* 获取详情 */
const detailLoading = ref(false)
const detailData = ref<ExampleItem | null>(null)
const detailError = ref<string | null>(null)
const detailId = ref<number>(1)

const fetchDetail = async () => {
  detailLoading.value = true
  detailError.value = null
  detailData.value = null

  getExampleDetail(detailId.value)
    .then(res => {
      detailData.value = res
    })
    .catch(err => {
      detailError.value = err instanceof Error ? err.message : '获取详情失败'
    })
    .finally(() => {
      detailLoading.value = false
    })
}

export interface CreateExampleParams {
  /** 名称（必填） */
  name: string | undefined
  /** 描述（可选） */
  description?: string
}

/* 创建 */
const createLoading = ref(false)
const createResult = ref<string | null>(null)
const createError = ref<string | null>(null)
const createForm = ref<CreateExampleParams>({ name: '新示例', description: '这是一个新示例' })

const handleCreate = async () => {
  createLoading.value = true
  createError.value = null
  createResult.value = null

  createExample(createForm.value)
    .then(res => {
      createResult.value = JSON.stringify(res, null, 2)
      // 刷新列表
      fetchList()
    })
    .catch(err => {
      createError.value = err instanceof Error ? err.message : '创建失败'
    })
    .finally(() => {
      createLoading.value = false
    })
}

export interface UpdateExampleParams {
  /** 示例 ID */
  id: number
  /** 名称（必填） */
  name: string | undefined
  /** 描述（可选） */
  description?: string
}
/* 更新 */
const updateLoading = ref(false)
const updateResult = ref<string | null>(null)
const updateError = ref<string | null>(null)
const updateForm = ref<UpdateExampleParams>({
  id: 1,
  name: '更新后的示例',
  description: '这是更新后的描述',
})

const handleUpdate = async () => {
  updateLoading.value = true
  updateError.value = null
  updateResult.value = null

  updateExample(updateForm.value)
    .then(res => {
      updateResult.value = JSON.stringify(res, null, 2)
      // 刷新列表
      fetchList()
    })
    .catch(err => {
      updateError.value = err instanceof Error ? err.message : '更新失败'
    })
    .finally(() => {
      updateLoading.value = false
    })
}

/* 部分更新 */
const patchLoading = ref(false)
const patchResult = ref<string | null>(null)
const patchError = ref<string | null>(null)
const patchId = ref<number>(1)
const patchData = ref<Partial<CreateExampleParams>>({ name: '部分更新后的名称' })

const handlePatch = async () => {
  patchLoading.value = true
  patchError.value = null
  patchResult.value = null

  patchExample(patchId.value, patchData.value)
    .then(res => {
      patchResult.value = JSON.stringify(res, null, 2)
      // 刷新列表
      fetchList()
    })
    .catch(err => {
      patchError.value = err instanceof Error ? err.message : '部分更新失败'
    })
    .finally(() => {
      patchLoading.value = false
    })
}

/* 删除 */
const deleteLoading = ref(false)
const deleteResult = ref<string | null>(null)
const deleteError = ref<string | null>(null)
const deleteId = ref<number>(1)

const handleDelete = async () => {
  deleteLoading.value = true
  deleteError.value = null
  deleteResult.value = null

  deleteExample(deleteId.value)
    .then(res => {
      deleteResult.value = JSON.stringify(res, null, 2)
      // 刷新列表
      fetchList()
    })
    .catch(err => {
      deleteError.value = err instanceof Error ? err.message : '删除失败'
    })
    .finally(() => {
      deleteLoading.value = false
    })
}

// 初始化加载列表
fetchList()
</script>

<template lang="pug">
.p-paddingl.between-col.justify-start.gap-gapl
  //- CRUD 操作示例
  .between-col.justify-start.gap-gap
    b.fs-appFontSizel CRUD 操作示例
    p.color-text200.fs-appFontSizes 演示完整的增删改查操作

  .grid.grid-cols-1.gap-gap.mb-gapl(class='lg:grid-cols-2')
    //- GET 列表
    .c-card.between
      .flex-1.between-col.items-start.gap-gap
        .flex.items-center.gap-gap
          b GET 列表查询
        b.color-text200.fs-appFontSizes /api/example/list
        .between-start.gap-gap.w-full
          InputText.flex-1(v-model='queryParams.keyword', placeholder='搜索关键词')
          InputNumber.w-20(v-model='queryParams.page', :min='1', placeholder='页码')
          InputNumber.w-24(
            v-model='queryParams.pageSize',
            :min='1',
            :max='100',
            placeholder='每页数量'
          )
        Button(label='查询列表', :loading='listLoading', @click='fetchList')
      .flex-1.full.between-col.justify-start.items-start.gap-gap
        template(v-if='listData || listError')
          template(v-if='listData')
            b.color-text200 请求成功：
            pre.fs-appFontSizes.bg-bg300.p-padding.rounded-rounded.overflow-auto {{ JSON.stringify(listData, null, 2) }}
          template(v-if='listError')
            b.color-dangerColor 请求失败：
            .fs-appFontSizes.color-dangerColor {{ listError }}

    //- GET 详情
    .c-card.between
      .flex-1.between-col.items-start.gap-gap
        .flex.items-center.gap-gap
          b GET 详情查询
        b.color-text200.fs-appFontSizes /api/example/:id
        InputNumber.w-full(v-model='detailId', :min='1', placeholder='ID')
        Button(label='查询详情', :loading='detailLoading', @click='fetchDetail')
      .flex-1.full.between-col.justify-start.items-start.gap-gap
        template(v-if='detailData || detailError')
          template(v-if='detailData')
            b.color-text200 请求成功：
            pre.fs-appFontSizes.bg-bg300.p-padding.rounded-rounded.overflow-auto {{ JSON.stringify(detailData, null, 2) }}
          template(v-if='detailError')
            b.color-dangerColor 请求失败：
            .fs-appFontSizes.color-dangerColor {{ detailError }}

  .grid.grid-cols-1.gap-gap.mb-gapl(class='lg:grid-cols-2')
    //- POST 创建
    .c-card.between
      .flex-1.between-col.items-start.gap-gap
        .flex.items-center.gap-gap
          b POST 创建
        b.color-text200.fs-appFontSizes /api/example/create
        InputText.w-full(v-model='createForm.name', placeholder='名称')
        InputText.w-full(v-model='createForm.description', placeholder='描述（可选）')
        Button(label='创建', :loading='createLoading', @click='handleCreate', severity='success')
      .flex-1.full.between-col.justify-start.items-start.gap-gap
        template(v-if='createResult || createError')
          template(v-if='createResult')
            b.color-text200 ✅ 创建成功：
            pre.fs-appFontSizes.bg-bg300.p-padding.rounded-rounded.overflow-auto {{ createResult }}
          template(v-if='createError')
            b.color-dangerColor ❌ 创建失败：
            .fs-appFontSizes.color-dangerColor {{ createError }}

    //- PUT 更新
    .c-card.between
      .flex-1.between-col.items-start.gap-gap
        .flex.items-center.gap-gap
          b PUT 更新
        b.color-text200.fs-appFontSizes /api/example/update
        InputNumber.w-full(v-model='updateForm.id', :min='1', placeholder='ID')
        InputText.w-full(v-model='updateForm.name', placeholder='名称')
        InputText.w-full(v-model='updateForm.description', placeholder='描述（可选）')
        Button(label='更新', :loading='updateLoading', @click='handleUpdate', severity='warning')
      .flex-1.full.between-col.justify-start.items-start.gap-gap
        template(v-if='updateResult || updateError')
          template(v-if='updateResult')
            b.color-text200 ✅ 更新成功：
            pre.fs-appFontSizes.bg-bg300.p-padding.rounded-rounded.overflow-auto {{ updateResult }}
          template(v-if='updateError')
            b.color-dangerColor ❌ 更新失败：
            .fs-appFontSizes.color-dangerColor {{ updateError }}

  .grid.grid-cols-1.gap-gap.mb-gapl(class='lg:grid-cols-2')
    //- PATCH 部分更新
    .c-card.between
      .flex-1.between-col.items-start.gap-gap
        .flex.items-center.gap-gap
          b PATCH 部分更新
        b.color-text200.fs-appFontSizes /api/example/patch/:id
        InputNumber.w-full(v-model='patchId', :min='1', placeholder='ID')
        InputText.w-full(v-model='patchData.name', placeholder='新名称')
        Button(label='部分更新', :loading='patchLoading', @click='handlePatch', severity='info')
      .flex-1.full.between-col.justify-start.items-start.gap-gap
        template(v-if='patchResult || patchError')
          template(v-if='patchResult')
            b.color-text200 ✅ 更新成功：
            pre.fs-appFontSizes.bg-bg300.p-padding.rounded-rounded.overflow-auto {{ patchResult }}
          template(v-if='patchError')
            b.color-dangerColor ❌ 更新失败：
            .fs-appFontSizes.color-dangerColor {{ patchError }}

    //- DELETE 删除
    .c-card.between
      .flex-1.between-col.items-start.gap-gap
        .flex.items-center.gap-gap
          b DELETE 删除
        b.color-text200.fs-appFontSizes /api/example/:id
        InputNumber.w-full(v-model='deleteId', :min='1', placeholder='ID')
        Button(label='删除', :loading='deleteLoading', @click='handleDelete', severity='danger')
      .flex-1.full.between-col.justify-start.items-start.gap-gap
        template(v-if='deleteResult || deleteError')
          template(v-if='deleteResult')
            b.color-text200 ✅ 删除成功：
            pre.fs-appFontSizes.bg-bg300.p-padding.rounded-rounded.overflow-auto {{ deleteResult }}
          template(v-if='deleteError')
            b.color-dangerColor ❌ 删除失败：
            .fs-appFontSizes.color-dangerColor {{ deleteError }}
</template>
