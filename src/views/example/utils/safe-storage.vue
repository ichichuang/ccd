<script setup lang="ts">
defineOptions({ name: 'UtilsSafeStorage' })

import { decompressAndDecryptSync, encryptAndCompressSync } from '@/utils/safeStorage'

function parseJsonOrString(input: string): unknown {
  const raw = input.trim()
  if (!raw) return ''
  try {
    const parsed: unknown = JSON.parse(raw)
    return parsed
  } catch {
    return input
  }
}

function formatUnknownForDisplay(value: unknown): string {
  if (value === null) return '—'
  if (typeof value === 'string') return value || '—'
  try {
    const json = JSON.stringify(value, null, 2)
    return json || '—'
  } catch {
    return String(value)
  }
}

const plainText = ref<string>('{"hello":"world"}')
const secretInput = ref<string | undefined>('')

const effectiveSecret = computed<string | undefined>(() => {
  const v = (secretInput.value ?? '').trim()
  return v ? v : undefined
})

const encryptedOutput = ref<string>('—')
const decryptedOutput = ref<string>('—')

const parsedPlain = computed<unknown>(() => parseJsonOrString(plainText.value))

watchEffect(() => {
  try {
    const secret = effectiveSecret.value
    const encrypted = encryptAndCompressSync(parsedPlain.value, secret)
    encryptedOutput.value = encrypted || '—'

    if (!encryptedOutput.value || encryptedOutput.value === '—') {
      decryptedOutput.value = '—'
      return
    }

    const decrypted = decompressAndDecryptSync<unknown>(encryptedOutput.value, secret)
    decryptedOutput.value = decrypted === null ? '—' : formatUnknownForDisplay(decrypted)
  } catch {
    encryptedOutput.value = '—'
    decryptedOutput.value = '—'
  }
})
</script>

<template>
  <div
    class="col-stretch gap-md"
    data-archetype="A1-toolbar-content"
  >
    <div class="layout-narrow col-stretch gap-md">
      <div class="material-elevated md:p-xl col-stretch gap-md">
        <div class="row-between">
          <div class="col-stretch gap-xs">
            <h1 class="text-lg font-semibold text-foreground m-0">SafeStorage Live Tester</h1>
            <p class="text-sm text-muted-foreground m-0">
              明文（可为 JSON）→ 加密/压缩 → 解密/解压验证
            </p>
          </div>
        </div>

        <Divider />

        <div class="grid grid-cols-1 md:grid-cols-2 gap-md">
          <section class="col-stretch gap-md">
            <div class="col-stretch gap-xs">
              <label class="text-xs text-muted-foreground">Plaintext</label>
              <Textarea
                v-model="plainText"
                auto-resize
                rows="6"
                placeholder='输入字符串或 JSON，例如 {"a":1}'
              />
            </div>

            <div class="col-stretch gap-xs">
              <label class="text-xs text-muted-foreground">Secret Key (可选)</label>
              <InputText
                v-model="secretInput"
                placeholder="留空则使用默认密钥（来自 VITE_APP_SECRET）"
              />
            </div>

            <div class="text-xs text-muted-foreground">
              提示：空 secret 将被视为不传（使用默认密钥）。
            </div>
          </section>

          <section class="col-stretch gap-md">
            <div class="col-stretch gap-xs">
              <label class="text-xs text-muted-foreground">Encrypted Output</label>
              <Textarea
                :model-value="encryptedOutput"
                auto-resize
                rows="6"
                disabled
              />
            </div>

            <div class="col-stretch gap-xs">
              <label class="text-xs text-muted-foreground">Decrypted Verification</label>
              <Textarea
                :model-value="decryptedOutput"
                auto-resize
                rows="6"
                disabled
              />
            </div>

            <div class="text-xs text-muted-foreground">
              输出不一致（显示为空/—）通常表示 secret 错误或数据损坏。
            </div>
          </section>
        </div>
      </div>
    </div>
  </div>
</template>
