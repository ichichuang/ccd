<script setup lang="ts">
import { createCoreRuntime } from '@ccd/core'
import { generateIdFromKey } from '@ccd/shared-utils'
import { useAppElementSize } from '@ccd/vue-hooks'
import { Icons } from '@ccd/vue-ui'
import Button from 'primevue/button'
import { ref, useTemplateRef } from 'vue'
import { desktopAdapters } from '../adapters'

const runtime = createCoreRuntime(desktopAdapters)
const shellRef = useTemplateRef<HTMLElement>('shellRef')
const shellSize = useAppElementSize(shellRef, undefined, { mode: 'throttle', delay: 200 })
const status = ref('Desktop runtime ready')
const statusKey = generateIdFromKey('ccd:desktop:status')

async function verifyRuntime() {
  await runtime.saveJson(statusKey, { value: 'Core runtime injected' })
  const result = await runtime.loadJson(statusKey, { value: 'Missing status' })
  status.value = result.value
}
</script>

<template>
  <main
    ref="shellRef"
    class="min-h-screen col-center gap-lg bg-background text-foreground font-sans p-xl"
  >
    <section class="glass-shell col-center gap-md text-center p-xl max-w-[720px] w-full">
      <Icons
        name="monitor"
        size="4xl"
        class="text-primary"
      />
      <div class="col-center gap-sm">
        <h1 class="m-0 text-2xl font-semibold">CCD Desktop</h1>
        <p class="m-0 text-muted-foreground">
          {{ status }}
        </p>
        <p class="m-0 text-xs text-muted-foreground">
          Route /#/home · Shell {{ Math.round(shellSize.width.value) }} ×
          {{ Math.round(shellSize.height.value) }}
        </p>
      </div>
      <Button
        type="button"
        label="Verify Core Injection"
        @click="verifyRuntime"
      />
    </section>
  </main>
</template>
