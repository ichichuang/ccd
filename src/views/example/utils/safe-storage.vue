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

const pageReady = ref<boolean>(true)
</script>

<template>
  <div
    class="col-stretch"
    data-archetype="A1-toolbar-content"
  >
    <AnimateWrapper
      :show="pageReady"
      enter="fadeInUp"
      leave="fadeOut"
    >
      <div class="col-stretch gap-md min-h-0 min-w-0">
        <div class="layout-narrow col-stretch gap-md min-w-0">
          <header class="shrink-0 glass-panel col-stretch gap-md min-w-0">
            <div class="row-between gap-md min-w-0">
              <div class="row-start gap-sm min-w-0 flex-wrap">
                <div class="glass-icon-box shrink-0">
                  <Icons
                    name="i-lucide-hard-drive"
                    size="xl"
                    class="text-primary"
                  />
                </div>
                <div class="col-stretch gap-xs min-w-0">
                  <div class="row-start gap-xs min-w-0 flex-wrap">
                    <span class="text-lg font-bold text-foreground text-no-wrap">Safe Storage</span>
                    <span
                      class="surface-info rounded-md px-sm py-xs text-xs font-semibold uppercase"
                    >
                      UTIL
                    </span>
                  </div>
                  <span class="text-sm text-muted-foreground text-ellipsis-1">
                    明文（可为 JSON）→ 加密/压缩 → 解密/解压验证
                  </span>
                </div>
              </div>
            </div>
          </header>

          <section class="material-elevated col-stretch gap-md min-w-0">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-md min-w-0">
              <div class="col-stretch gap-md min-w-0">
                <div class="col-stretch gap-xs min-w-0">
                  <label class="text-xs text-muted-foreground">Plaintext</label>
                  <Textarea
                    v-model="plainText"
                    auto-resize
                    rows="6"
                    placeholder='输入字符串或 JSON，例如 {"a":1}'
                  />
                </div>

                <div class="col-stretch gap-xs min-w-0">
                  <label class="text-xs text-muted-foreground">Secret Key (可选)</label>
                  <InputText
                    v-model="secretInput"
                    placeholder="留空则使用默认密钥（来自 VITE_APP_SECRET）"
                  />
                </div>

                <div class="text-xs text-muted-foreground">
                  提示：空 secret 将被视为不传（使用默认密钥）。
                </div>
              </div>

              <div class="col-stretch gap-md min-w-0">
                <div class="col-stretch gap-xs min-w-0">
                  <label class="text-xs text-muted-foreground">Encrypted Output</label>
                  <Textarea
                    :model-value="encryptedOutput"
                    auto-resize
                    rows="6"
                    disabled
                  />
                </div>

                <div class="col-stretch gap-xs min-w-0">
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
              </div>
            </div>
          </section>
        </div>
      </div>
    </AnimateWrapper>
  </div>
</template>
