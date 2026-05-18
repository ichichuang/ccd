<script setup lang="ts">
import { createCoreRuntime } from '@ccd/core'
import { ref } from 'vue'
import { desktopAdapters } from './adapters'

const runtime = createCoreRuntime(desktopAdapters)
const status = ref('Desktop adapters ready')

async function pingCore() {
  await runtime.saveJson('ccd:desktop:status', { value: 'Core runtime injected' })
  const result = await runtime.loadJson('ccd:desktop:status', { value: 'Missing status' })
  status.value = result.value
}
</script>

<template>
  <main class="shell">
    <h1>CCD Desktop</h1>
    <p>{{ status }}</p>
    <button type="button" @click="pingCore">Verify Core Injection</button>
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

button {
  font: inherit;
  padding: 8px 12px;
}
</style>
