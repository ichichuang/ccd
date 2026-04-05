<script setup lang="ts">
/**
 * Toast & Message 示例（V2）
 * - 禁用 raw `window.$toast.add/clear/removeGroup`
 * - 统一走内部抽象：`window.$message.*` 与 `window.$toast.*In`
 */
const pageReady = ref<boolean>(true)

const TOAST_SEVERITIES = [
  { key: 'danger', label: 'Danger', handler: 'dangerIn', severity: 'danger' as const },
  { key: 'success', label: 'Success', handler: 'successIn', severity: 'success' as const },
  { key: 'info', label: 'Info', handler: 'infoIn', severity: 'info' as const },
  { key: 'warn', label: 'Warn', handler: 'warnIn', severity: 'warn' as const },
  { key: 'secondary', label: 'Secondary', handler: 'secondaryIn', severity: 'secondary' as const },
  { key: 'contrast', label: 'Contrast', handler: 'contrastIn', severity: 'contrast' as const },
] as const

const TOAST_POSITIONS: ToastPosition[] = [
  'top-left',
  'top-center',
  'top-right',
  'bottom-left',
  'bottom-center',
  'bottom-right',
]

const POSITION_LABELS: Record<ToastPosition, string> = {
  'top-left': '左上',
  'top-center': '上中',
  'top-right': '右上',
  'bottom-left': '左下',
  'bottom-center': '下中',
  'bottom-right': '右下',
}

const MESSAGE_TYPES = [
  { key: 'success', label: 'Success', handler: 'success' as const, severity: 'success' as const },
  { key: 'danger', label: 'Danger', handler: 'danger' as const, severity: 'danger' as const },
  { key: 'info', label: 'Info', handler: 'info' as const, severity: 'info' as const },
  { key: 'warn', label: 'Warn', handler: 'warn' as const, severity: 'warn' as const },
] as const

function handleSeverityIn(
  method: 'dangerIn' | 'successIn' | 'infoIn' | 'warnIn' | 'secondaryIn' | 'contrastIn',
  pos: ToastPosition,
  summary: string,
  detail: string
): void {
  const toast = window.$toast
  if (!toast?.[method]) return
  ;(toast[method] as (p: ToastPosition, s: string, d?: string) => void)(pos, summary, detail)
}

function handleMessage(type: (typeof MESSAGE_TYPES)[number]['handler'], withTitle = false): void {
  const api = window.$message
  if (!api?.[type]) return
  if (withTitle) {
    ;(api[type] as (msg: string, title: string) => void)(`${type} 详情内容`, `${type} 标题`)
    return
  }
  ;(api[type] as (msg: string) => void)(`${type} 纯提示消息`)
}
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
                    name="i-lucide-bell"
                    size="xl"
                    class="text-primary"
                  />
                </div>
                <div class="col-stretch gap-xs min-w-0">
                  <div class="row-start gap-xs min-w-0 flex-wrap">
                    <span class="text-lg font-bold text-foreground text-no-wrap">
                      Toast Notifications
                    </span>
                    <span
                      class="surface-primary rounded-md px-sm py-xs text-xs font-semibold uppercase"
                    >
                      COMPONENT
                    </span>
                  </div>
                  <span class="text-sm text-muted-foreground text-ellipsis-1">
                    当前示例仅保留内部抽象接口：`window.$message.*` 与 `window.$toast.*In`，不再演示
                    raw `add/clear/removeGroup`。
                  </span>
                </div>
              </div>
            </div>
          </header>

          <section class="material-elevated col-stretch gap-md min-w-0">
            <h2 class="text-lg font-semibold">1. Message 居中纯提示（4 种类型）</h2>
            <div class="col-stretch gap-md min-w-0">
              <div
                v-for="t in MESSAGE_TYPES"
                :key="t.key"
                class="row-start flex-wrap gap-md rounded-sm bg-muted p-sm min-w-0"
              >
                <span class="text-muted-foreground text-sm min-w-[var(--spacing-4xl)]">
                  {{ t.label }}:
                </span>
                <Button
                  label="纯消息"
                  size="small"
                  :severity="t.severity"
                  outlined
                  @click="handleMessage(t.handler, false)"
                />
                <Button
                  label="消息 + 标题"
                  size="small"
                  :severity="t.severity"
                  outlined
                  @click="handleMessage(t.handler, true)"
                />
              </div>
            </div>
          </section>

          <section class="material-elevated col-stretch gap-md min-w-0">
            <h2 class="text-lg font-semibold">2. Toast 快捷方法（6 种 severity × 6 种位置）</h2>
            <div class="col-stretch gap-md min-w-0">
              <div
                v-for="sev in TOAST_SEVERITIES"
                :key="sev.key"
                class="row-start flex-wrap gap-md rounded-sm bg-muted p-sm min-w-0"
              >
                <span class="text-muted-foreground text-sm min-w-[var(--spacing-4xl)]">
                  {{ sev.label }}:
                </span>
                <Button
                  v-for="pos in TOAST_POSITIONS"
                  :key="pos"
                  :label="POSITION_LABELS[pos]"
                  size="small"
                  :severity="sev.severity"
                  outlined
                  @click="
                    handleSeverityIn(
                      sev.handler,
                      pos,
                      `${sev.label} 提示`,
                      `位置: ${POSITION_LABELS[pos]}`
                    )
                  "
                />
              </div>
            </div>
          </section>
        </div>
      </div>
    </AnimateWrapper>
  </div>
</template>
