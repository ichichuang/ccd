<script setup lang="ts">
import { testGet } from '@!/modules/test'
import { ref } from 'vue'

const loading = ref(false)
const result = ref<string | null>(null)
const error = ref<string | null>(null)

const handleTest = async () => {
  loading.value = true
  error.value = null
  result.value = null

  try {
    const response = await testGet()
    result.value = response
  } catch (err) {
    error.value = err instanceof Error ? err.message : '请求失败'
    console.error('测试接口失败:', err)
  } finally {
    loading.value = false
  }
}
</script>

<template lang="pug">
.example-http-basic
  .test-section
    h2.title HTTP 基础测试
    .description 测试服务端接口连接：https://www.server.wzdxcc.cloudns.org/test/get
    .actions
      Button(label='测试 GET 请求', :loading='loading', @click='handleTest', severity='primary')
    .result(v-if='result || error')
      .success(v-if='result')
        .label 请求成功：
        .value {{ result }}
      .error(v-if='error')
        .label 请求失败：
        .value {{ error }}
</template>

<style lang="scss" scoped>
.example-http-basic {
  padding: 1.5rem;

  .test-section {
    max-width: 800px;
    margin: 0 auto;

    .title {
      font-size: 1.5rem;
      font-weight: 600;
      margin-bottom: 0.5rem;
      color: var(--text-color);
    }

    .description {
      color: var(--text-color-secondary);
      margin-bottom: 1.5rem;
      font-size: 0.875rem;
    }

    .actions {
      margin-bottom: 1.5rem;
    }

    .result {
      margin-top: 1.5rem;
      padding: 1rem;
      border-radius: 0.5rem;
      background-color: var(--surface-ground);

      .success {
        .label {
          font-weight: 600;
          color: var(--green-500);
          margin-bottom: 0.5rem;
        }

        .value {
          padding: 0.75rem;
          background-color: var(--surface-card);
          border-radius: 0.375rem;
          font-family: monospace;
          color: var(--text-color);
          word-break: break-all;
        }
      }

      .error {
        .label {
          font-weight: 600;
          color: var(--red-500);
          margin-bottom: 0.5rem;
        }

        .value {
          padding: 0.75rem;
          background-color: var(--surface-card);
          border-radius: 0.375rem;
          font-family: monospace;
          color: var(--red-500);
          word-break: break-all;
        }
      }
    }
  }
}
</style>
