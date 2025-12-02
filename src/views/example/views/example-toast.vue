<script setup lang="tsx">
import { Button } from 'primevue'
// 便捷方法
const showInfo = () => window.$toast.info('信息提示', '这是一条信息提示')
const showSuccess = () => window.$toast.success('操作成功', '数据已成功保存')
const showWarn = () => window.$toast.warn('警告提示', '请注意相关风险')
const showError = () => window.$toast.error('操作失败', '网络异常，请稍后重试')
const showSecondary = () => window.$toast.secondary('次要提示', '这是一条次要提示信息')
const showContrast = () => window.$toast.contrast('对比提示', '这是一条对比风格提示')

// 基础/自定义
const showBasic = () =>
  window.$toast.add({
    severity: 'info',
    summary: '基础消息',
    detail: '最基础的 Toast 展示',
    life: 1000,
  })
const showSticky = () =>
  window.$toast.add({ severity: 'info', summary: '粘性消息', detail: '需要手动清除' })
const showCustomLife = () =>
  window.$toast.add({
    severity: 'success',
    summary: '自定义生命周期',
    detail: '8 秒消失',
    life: 8000,
  })

// 位置（通过 group）
const showTopLeft = () => window.$toast.infoIn('top-left', '左上角', '显示在左上角')
const showBottomLeft = () => window.$toast.successIn('bottom-left', '左下角', '显示在左下角')
const showBottomRight = () => window.$toast.successIn('bottom-right', '右下角', '显示在右下角')
const showTopCenter = () => window.$toast.warnIn('top-center', '顶部居中', '显示在顶部居中')
const showBottomCenter = () => window.$toast.errorIn('bottom-center', '底部居中', '显示在底部居中')
const showCenter = () => window.$toast.infoIn('center', '屏幕居中', '显示在屏幕正中央')

// 带关闭回调
const showWithCallback = () =>
  window.$toast.add({
    severity: 'info',
    summary: '带回调的消息',
    detail: '关闭时会执行回调',
    onClose: () => window.$toast.success('回调执行', '消息已关闭并触发回调'),
  })

// Loading / Progress
const showLoading = () => {
  window.$toast.loading('正在处理...', '请稍候')
  setTimeout(() => {
    window.$toast.clear()
    window.$toast.success('完成', '任务完成')
  }, 2000)
}

const showProgress = () => {
  let p = 0
  const timer = setInterval(() => {
    p += 10
    window.$toast.progress('上传中', p, '模拟上传进度')
    if (p >= 100) {
      clearInterval(timer)
      setTimeout(() => {
        window.$toast.clear()
        window.$toast.success('上传完成', '文件已上传')
      }, 400)
    }
  }, 200)
}

// 管理
const clearAll = () => window.$toast.clear()
const clearTopLeft = () => window.$toast.clear('top-left')
const clearBottomLeft = () => window.$toast.clear('bottom-left')
const clearBottomRight = () => window.$toast.clear('bottom-right')
const clearTopCenter = () => window.$toast.clear('top-center')
const clearBottomCenter = () => window.$toast.clear('bottom-center')
const clearCenter = () => window.$toast.clear('center')

// 自定义内容（message 插槽）示例：使用 TSX 组件作为 renderer（全局模板）
const registerCustomMessage = () => {
  const customMessage = (slotProps: any) => {
    const m = slotProps?.message || {}
    return (
      <div class="flex flex-col items-start flex-auto">
        <div class="flex items-center gap-2">
          <img
            class="w-appFontSizel rounded-full"
            src="https://primefaces.org/cdn/primevue/images/avatar/amyelsner.png"
          />
          <span class="font-bold mx-gap">Amy Elsner</span>
        </div>
        <div class="font-medium text-lg my-4">{m.summary ?? '自定义模板'}</div>
        <div class="between gap-gaps">
          <Button
            severity="success"
            onClick={() => {
              window.$toast.info('已回复')
              window.$toast.remove(m)
            }}
          >
            批准
          </Button>
          <Button
            severity="danger"
            onClick={() => window.$toast.remove(m)}
          >
            取消
          </Button>
        </div>
      </div>
    )
  }
  window.$toast.registerTemplate('top-center', 'message', customMessage)
  window.$toast.addIn('top-center', {
    severity: 'contrast',
    summary: 'Can you send me the report?',
  })
}
const unregisterCustomMessage = () => window.$toast.unregisterTemplate('top-center')

// 单条自定义容器示例（不影响其它同组 toast）
const showCustomMessage = () => {
  const container = ({ message, 'close-callback': closeCallback }: any) => (
    <section class="between-col p-padding">
      <span>{message.summary}</span>
      <div class="flex gap-gaps justify-end">
        <Button
          severity="danger"
          onClick={() => closeCallback()}
        >
          了解
        </Button>
      </div>
    </section>
  )
  window.$toast.customIn('top-center', container, {
    severity: 'success',
    summary: '这是一条自定义容器',
    life: 0,
  })
}
</script>

<template lang="pug">
.between-col.gap-gapl
  // 基础示例
  .full.c-card.p-padding.rounded-rounded.between-col.center-start
    .fs-16.font-semibold.center 基础 Toast
    p.color-text200 最基础的 Toast 展示
    .between
      Button(label='基础', severity='primary', @click='showBasic')
      Button(label='粘性', severity='info', text, @click='showSticky')
      Button(label='8s 生命周期', severity='secondary', text, @click='showCustomLife')

  // 便捷方法（不同严重级别）
  .full.c-card.p-padding.rounded-rounded.between-col.center-start
    .fs-16.font-semibold.center 严重级别
    p.color-text200 快速显示不同类型的消息
    .between
      Button(label='信息', severity='info', text, @click='showInfo')
      Button(label='成功', severity='success', text, @click='showSuccess')
      Button(label='警告', severity='warn', text, @click='showWarn')
      Button(label='错误', severity='danger', text, @click='showError')
      Button(label='次要', severity='secondary', text, @click='showSecondary')
      Button(label='对比', severity='help', text, @click='showContrast')

  // 不同位置
  .full.c-card.p-padding.rounded-rounded.between-col.center-start
    .fs-16.font-semibold.center 不同位置
    p.color-text200 通过 group 控制位置显示
    .between.gap-gap
      Button(label='左上角', severity='info', text, @click='showTopLeft')
      Button(label='左下角', severity='success', text, @click='showBottomLeft')
      Button(label='右下角', severity='success', text, @click='showBottomRight')
      Button(label='顶部居中', severity='warn', text, @click='showTopCenter')
      Button(label='底部居中', severity='danger', text, @click='showBottomCenter')
      Button(label='屏幕居中', severity='secondary', text, @click='showCenter')

  // 回调 / 扩展
  .full.c-card.p-padding.rounded-rounded.between-col.center-start
    .fs-16.font-semibold.center 回调与扩展
    p.color-text200 关闭时触发回调的消息
    .between
      Button(label='带关闭回调', severity='info', @click='showWithCallback')

  // 加载与进度
  .full.c-card.p-padding.rounded-rounded.between-col.center-start
    .fs-16.font-semibold.center 加载与进度
    p.color-text200 展示加载状态与模拟进度
    .between.gap-gap
      Button(label='Loading', severity='primary', @click='showLoading')
      Button(label='Progress', severity='success', @click='showProgress')

  // 自定义内容（message 模板 / 单条 container）
  .full.c-card.p-padding.rounded-rounded.between-col.center-start
    .fs-16.font-semibold.center 自定义内容
    p.color-text200 两种方式：全局 message 模板 或 单条自定义 container
    .between.gap-gap
      Button(label='注册并展示 message 模板', severity='contrast', @click='registerCustomMessage')
      Button(label='取消模板', severity='secondary', text, @click='unregisterCustomMessage')
      Button(label='单条自定义 container', severity='success', @click='showCustomMessage')

  // 管理
  .full.c-card.p-padding.rounded-rounded.between-col.center-start
    .fs-16.font-semibold.center 管理
    p.color-text200 清理所有或指定位置消息
    .between.gap-gap
      Button(label='清除所有', severity='danger', text, @click='clearAll')
      Button(label='清除左上角', severity='info', text, @click='clearTopLeft')
      Button(label='清除左下角', severity='success', text, @click='clearBottomLeft')
      Button(label='清除右下角', severity='success', text, @click='clearBottomRight')
      Button(label='清除顶部居中', severity='warn', text, @click='clearTopCenter')
      Button(label='清除底部居中', severity='danger', text, @click='clearBottomCenter')
      Button(label='清除屏幕居中', severity='secondary', text, @click='clearCenter')
</template>

<style lang="scss" scope></style>
