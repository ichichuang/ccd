<script setup lang="ts">
import Button from 'primevue/button'

/** 1. window.$message - Element Plus 风格 */
const handleMessageSuccess = () => {
  window.$message?.success('操作成功，数据已保存')
}

const handleMessageError = () => {
  window.$message?.error('发生错误，请稍后重试')
}

const handleMessageInfo = () => {
  window.$message?.info('这是一条普通提示')
}

const handleMessageWarning = () => {
  window.$message?.warning('请注意，此操作不可逆')
}

/** 1.2 $message 带 title */
const handleMessageWithTitle = () => {
  window.$message?.success('数据已同步到云端', '同步完成')
}

const handleMessageErrorWithTitle = () => {
  window.$message?.error('网络超时，请检查连接', '请求失败')
}

/** 2. window.$toast - 按 severity + 位置 */
const handleToastErrorIn = (pos: ToastPosition = 'top-left') => {
  window.$toast?.errorIn(pos, '错误标题', '这是错误详情内容')
}

const handleToastSuccessIn = (pos: ToastPosition = 'top-right') => {
  window.$toast?.successIn(pos, '成功', '操作已完成')
}

const handleToastInfoIn = (pos: ToastPosition = 'top-right') => {
  window.$toast?.infoIn(pos, '信息', '这是一条信息提示')
}

const handleToastWarnIn = (pos: ToastPosition = 'top-left') => {
  window.$toast?.warnIn(pos, '警告', '请注意检查输入')
}

/** 3. window.$toast.add - 原始 API */
const handleToastAdd = () => {
  window.$toast?.add({
    severity: 'info',
    summary: '自定义 Toast',
    detail: '通过 add() 直接调用，可传 life、group 等',
    life: 5000,
  })
}

const handleToastAddSecondary = () => {
  window.$toast?.add({
    severity: 'secondary',
    summary: 'Secondary 类型',
    detail: 'severity 支持 success/info/warn/error/secondary/contrast',
  })
}

const handleToastAddContrast = () => {
  window.$toast?.add({
    severity: 'contrast',
    summary: 'Contrast 类型',
    detail: '适用于特殊强调场景',
  })
}

/** 4. window.$toast.clear - 清除所有 */
const handleToastClear = () => {
  window.$toast?.clear?.()
}

/** 5. window.$toast.removeGroup - 清除指定 group */
const TOAST_GROUPS = ['tl', 'tc', 'tr', 'bl', 'bc', 'br'] as const
const handleToastRemoveGroup = (group: string) => {
  window.$toast?.removeGroup?.(group)
}
</script>

<template>
  <CScrollbar class="h-full p-padding-lg bg-surface-ground">
    <div class="max-w-6xl mx-auto flex flex-col gap-gap-xl">
      <div class="flex flex-col gap-gap-xs">
        <h1 class="fs-2xl font-bold text-foreground">Toast & Message Full Demo</h1>
        <p class="text-muted-foreground">
          全局 window.$toast / window.$message 演示，可在非组件环境（如 HTTP
          拦截器、错误处理）中使用。
        </p>
      </div>

      <!-- 1. window.$message - Element Plus 风格 -->
      <section class="flex flex-col gap-gap-md">
        <h2 class="fs-lg font-semibold border-b border-border pb-padding-xs">
          1. window.$message（Element Plus 风格）
        </h2>
        <div class="flex flex-wrap gap-gap-md">
          <Button
            label="Success"
            severity="success"
            @click="handleMessageSuccess"
          />
          <Button
            label="Error"
            severity="danger"
            @click="handleMessageError"
          />
          <Button
            label="Info"
            severity="info"
            @click="handleMessageInfo"
          />
          <Button
            label="Warning"
            severity="warning"
            @click="handleMessageWarning"
          />
        </div>
        <p class="text-muted-foreground fs-sm">
          success(message, title?) / error(message, title?) / info(message, title?) /
          warning(message, title?)
        </p>
        <div class="flex flex-wrap gap-gap-md">
          <Button
            label="Success + Title"
            severity="success"
            outlined
            @click="handleMessageWithTitle"
          />
          <Button
            label="Error + Title"
            severity="danger"
            outlined
            @click="handleMessageErrorWithTitle"
          />
        </div>
      </section>

      <!-- 2. window.$toast - errorIn / successIn / infoIn / warnIn -->
      <section class="flex flex-col gap-gap-md">
        <h2 class="fs-lg font-semibold border-b border-border pb-padding-xs">
          2. window.$toast - 按 severity + 位置
        </h2>
        <p class="text-muted-foreground fs-sm">
          errorIn(position, summary, detail?) / successIn / infoIn / warnIn；支持 6
          种位置：左上、上中、右上、左下、下中、右下
        </p>
        <div class="flex flex-wrap gap-gap-sm">
          <Button
            label="左上"
            size="small"
            severity="secondary"
            @click="() => handleToastSuccessIn('top-left')"
          />
          <Button
            label="上中"
            size="small"
            severity="secondary"
            @click="() => handleToastSuccessIn('top-center')"
          />
          <Button
            label="右上"
            size="small"
            severity="secondary"
            @click="() => handleToastSuccessIn('top-right')"
          />
          <Button
            label="左下"
            size="small"
            severity="secondary"
            @click="() => handleToastSuccessIn('bottom-left')"
          />
          <Button
            label="下中"
            size="small"
            severity="secondary"
            @click="() => handleToastSuccessIn('bottom-center')"
          />
          <Button
            label="右下"
            size="small"
            severity="secondary"
            @click="() => handleToastSuccessIn('bottom-right')"
          />
        </div>
        <div class="flex flex-wrap gap-gap-md">
          <Button
            label="Error (左上)"
            severity="danger"
            @click="() => handleToastErrorIn('top-left')"
          />
          <Button
            label="Success (右上)"
            severity="success"
            @click="() => handleToastSuccessIn('top-right')"
          />
          <Button
            label="Info (上中)"
            severity="info"
            @click="() => handleToastInfoIn('top-center')"
          />
          <Button
            label="Warn (左下)"
            severity="warning"
            @click="() => handleToastWarnIn('bottom-left')"
          />
        </div>
      </section>

      <!-- 3. window.$toast.add - 原始 API -->
      <section class="flex flex-col gap-gap-md">
        <h2 class="fs-lg font-semibold border-b border-border pb-padding-xs">
          3. window.$toast.add（原始 API）
        </h2>
        <p class="text-muted-foreground fs-sm">
          add({ severity?, summary?, detail?, life?, group? })
        </p>
        <div class="flex flex-wrap gap-gap-md">
          <Button
            label="Add Info (5s)"
            severity="info"
            outlined
            @click="handleToastAdd"
          />
          <Button
            label="Add Secondary"
            severity="secondary"
            outlined
            @click="handleToastAddSecondary"
          />
          <Button
            label="Add Contrast"
            severity="contrast"
            outlined
            @click="handleToastAddContrast"
          />
        </div>
      </section>

      <!-- 4. window.$toast - clear / removeGroup -->
      <section class="flex flex-col gap-gap-md">
        <h2 class="fs-lg font-semibold border-b border-border pb-padding-xs">
          4. window.$toast - 清除
        </h2>
        <p class="text-muted-foreground fs-sm">
          clear() 清除所有（内部调用 removeAllGroups）；removeGroup(group) 清除指定位置
        </p>
        <div class="flex flex-wrap gap-gap-md items-center">
          <Button
            label="Clear All"
            severity="danger"
            outlined
            @click="handleToastClear"
          />
          <span class="text-muted-foreground fs-sm">按 group 清除：</span>
          <Button
            v-for="g in TOAST_GROUPS"
            :key="g"
            :label="`Remove ${g}`"
            size="small"
            severity="secondary"
            outlined
            @click="handleToastRemoveGroup(g)"
          />
        </div>
      </section>
    </div>
  </CScrollbar>
</template>
