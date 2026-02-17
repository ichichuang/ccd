<script setup lang="ts">
/**
 * Toast & Message 完整演示
 * $message：居中纯提示（正中央、无关闭按钮）
 * $toast：6 种 severity、6 种位置、add() 原始 API、清除
 */
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

const TOAST_GROUPS = ['tl', 'tc', 'tr', 'bl', 'bc', 'br'] as const

/** 1. *In 快捷方法：按 severity + 位置 */
function handleSeverityIn(
  method: 'dangerIn' | 'successIn' | 'infoIn' | 'warnIn' | 'secondaryIn' | 'contrastIn',
  pos: ToastPosition,
  summary: string,
  detail: string
) {
  const toast = window.$toast
  if (!toast?.[method]) return
  ;(toast[method] as (p: ToastPosition, s: string, d?: string) => void)(pos, summary, detail)
}

/** 2. add() - 按 severity 调用（默认 group: tr） */
function handleAddBySeverity(
  severity: 'success' | 'info' | 'warn' | 'danger' | 'secondary' | 'contrast',
  summary: string,
  detail: string,
  life?: number
) {
  window.$toast?.add({
    severity,
    summary,
    detail,
    life,
    group: 'tr',
  })
}

/** 3. add() - 粘性 Toast（不传 life，默认 group: tr） */
function handleAddSticky(severity: 'warn' | 'danger' = 'warn') {
  window.$toast?.add({
    severity,
    summary: '粘性 Toast',
    detail: '不传 life，需手动关闭或 clear()',
    group: 'tr',
  })
}

/** 4. add() - 指定 group 到指定位置 */
function handleAddWithGroup(group: string, severity: 'info' | 'success' = 'info', summary: string) {
  window.$toast?.add({
    severity,
    summary,
    detail: `group: ${group}`,
    life: 4000,
    group,
  })
}

/** 5. 清除 */
const handleClear = () => window.$toast?.clear?.()
const handleRemoveGroup = (group: string) => window.$toast?.removeGroup?.(group)

/** Message 居中纯提示（success / danger / info / warn） */
const MESSAGE_TYPES = [
  { key: 'success', label: 'Success', handler: 'success' as const, severity: 'success' as const },
  { key: 'danger', label: 'Danger', handler: 'danger' as const, severity: 'danger' as const },
  { key: 'info', label: 'Info', handler: 'info' as const, severity: 'info' as const },
  { key: 'warn', label: 'Warn', handler: 'warn' as const, severity: 'warn' as const },
] as const

function handleMessage(type: (typeof MESSAGE_TYPES)[number]['handler'], withTitle = false) {
  const api = window.$message
  if (!api?.[type]) return
  if (withTitle) {
    ;(api[type] as (msg: string, title: string) => void)(`${type} 详情内容`, `${type} 标题`)
  } else {
    ;(api[type] as (msg: string) => void)(`${type} 纯提示消息`)
  }
}
</script>

<template>
  <CScrollbar class="h-full p-padding-lg bg-background">
    <div class="w-full max-w-[80vw] mx-auto flex flex-col gap-xl">
      <div class="flex flex-col gap-xs">
        <h1 class="fs-2xl font-bold text-foreground">Toast 完整演示</h1>
        <p class="text-muted-foreground">
          window.$message 居中纯提示（success / danger / info / warn）；window.$toast 6 种
          severity、6 种位置、add() 原始 API、清除。可在非组件环境（拦截器、errorHandler）使用。
        </p>
      </div>

      <!-- 0. Message 居中纯提示（4 种类型） -->
      <section class="flex flex-col gap-md">
        <h2 class="fs-lg font-semibold border-b-default pb-padding-xs">
          0. Message 居中纯提示（4 种类型）
        </h2>
        <p class="text-muted-foreground fs-sm">
          window.$message.success / danger / info / warn(message,
          title?)；正中央展示、无关闭按钮、纯提示
        </p>
        <div class="flex flex-col gap-md">
          <div
            v-for="t in MESSAGE_TYPES"
            :key="t.key"
            class="flex flex-wrap items-center gap-sm"
          >
            <span class="text-muted-foreground fs-sm min-w-[var(--spacing-4xl)]"
              >{{ t.label }}:</span
            >
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

      <!-- 1. 6 种 severity 快捷方法 + 6 种位置 -->
      <section class="flex flex-col gap-md">
        <h2 class="fs-lg font-semibold border-b-default pb-padding-xs">
          1. 快捷方法 *In（6 种 severity × 6 种位置）
        </h2>
        <p class="text-muted-foreground fs-sm">
          dangerIn / successIn / infoIn / warnIn / secondaryIn / contrastIn (position, summary,
          detail?)
        </p>
        <div class="flex flex-col gap-md">
          <div
            v-for="sev in TOAST_SEVERITIES"
            :key="sev.key"
            class="flex flex-wrap items-center gap-sm"
          >
            <span class="text-muted-foreground fs-sm min-w-[var(--spacing-4xl)]"
              >{{ sev.label }}:</span
            >
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

      <!-- 2. add() 原始 API - 6 种 severity -->
      <section class="flex flex-col gap-md">
        <h2 class="fs-lg font-semibold border-b-default pb-padding-xs">
          2. add() 原始 API（6 种 severity）
        </h2>
        <p class="text-muted-foreground fs-sm">
          add({ severity?, summary?, detail?, life?, group? })
        </p>
        <div class="flex flex-wrap gap-md">
          <Button
            label="Danger"
            severity="danger"
            @click="handleAddBySeverity('danger', '危险提示', '操作失败或存在风险', 3000)"
          />
          <Button
            label="Success"
            severity="success"
            @click="handleAddBySeverity('success', '成功提示', '操作已完成', 3000)"
          />
          <Button
            label="Info"
            severity="info"
            @click="handleAddBySeverity('info', '信息提示', '普通说明', 3000)"
          />
          <Button
            label="Warn"
            severity="warn"
            @click="handleAddBySeverity('warn', '警告提示', '请注意检查', 3000)"
          />
          <Button
            label="Secondary"
            severity="secondary"
            outlined
            @click="handleAddBySeverity('secondary', '次要提示', '中性/辅助信息', 3000)"
          />
          <Button
            label="Contrast"
            severity="contrast"
            outlined
            @click="handleAddBySeverity('contrast', '高对比提示', '强调内容', 3000)"
          />
        </div>
      </section>

      <!-- 3. add() 扩展：粘性、自定义 life、group -->
      <section class="flex flex-col gap-md">
        <h2 class="fs-lg font-semibold border-b-default pb-padding-xs">
          3. add() 扩展：粘性、自定义 life、group
        </h2>
        <div class="flex flex-wrap gap-md">
          <Button
            label="粘性 Toast (无 life)"
            severity="warn"
            outlined
            @click="handleAddSticky('warn')"
          />
          <Button
            label="Add Info 8s"
            severity="info"
            outlined
            @click="handleAddBySeverity('info', '8 秒后关闭', 'life: 8000', 8000)"
          />
          <Button
            v-for="g in TOAST_GROUPS"
            :key="g"
            :label="`group: ${g}`"
            size="small"
            severity="secondary"
            outlined
            @click="handleAddWithGroup(g, 'info', `位置 ${g}`)"
          />
        </div>
      </section>

      <!-- 4. 清除 -->
      <section class="flex flex-col gap-md">
        <h2 class="fs-lg font-semibold border-b-default pb-padding-xs">4. 清除</h2>
        <p class="text-muted-foreground fs-sm">clear() 清除所有；removeGroup(group) 清除指定位置</p>
        <div class="flex flex-wrap gap-md items-center">
          <Button
            label="Clear All"
            severity="danger"
            outlined
            @click="handleClear"
          />
          <span class="text-muted-foreground fs-sm">按 group：</span>
          <Button
            v-for="g in TOAST_GROUPS"
            :key="g"
            :label="`Remove ${g}`"
            size="small"
            severity="secondary"
            outlined
            @click="handleRemoveGroup(g)"
          />
        </div>
      </section>
    </div>
  </CScrollbar>
</template>
