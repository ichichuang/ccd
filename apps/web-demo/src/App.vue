<script setup lang="ts">
import { createCoreRuntime } from '@ccd/core'
import { ref } from 'vue'
import { webAdapters } from './adapters'

const runtime = createCoreRuntime(webAdapters)
const savedMessage = ref('')

async function saveMessage() {
  await runtime.saveJson('ccd:web-demo:message', { value: savedMessage.value })
}

async function loadMessage() {
  const result = await runtime.loadJson('ccd:web-demo:message', { value: '' })
  savedMessage.value = result.value
}

void loadMessage()
</script>

<template>
  <main class="shell">
    <h1>CCD Web Demo</h1>
    <p>Web runtime injects browser adapters into <code>@ccd/core</code>.</p>
    <label>
      Demo message
      <input v-model="savedMessage" />
    </label>
    <button type="button" @click="saveMessage">Save via Core Runtime</button>
  </main>
</template>

<style scoped>
.shell {
  max-width: 720px;
  margin: 48px auto;
  display: grid;
  gap: 16px;
  font-family: system-ui, sans-serif;
}

input,
button {
  font: inherit;
  padding: 8px 12px;
}
</style>
