<script setup lang="ts">
import { Button } from 'primevue'

const showBasic = () =>
  window.$message.add({
    severity: 'info',
    summary: '基础消息',
    detail: '3 秒后自动关闭',
    iconName: 'fc-info',
  })

const showConvenient = {
  info: () => window.$message.info('信息提示', '这是一条信息提示', 3000, { iconName: 'fc-info' }),
  success: () => window.$message.success('操作成功', '数据已保存', 3000, { iconName: 'fc-ok' }),
  warn: () => window.$message.warn('警告提示', '请注意相关风险', 3000, { iconName: 'fc-idea' }),
  error: () =>
    window.$message.error('操作失败', '网络异常，请稍后重试', 3000, {
      iconName: 'fc-high-priority',
    }),
  secondary: () =>
    window.$message.secondary('次要提示', '这是一条次要提示信息', 3000, { iconName: 'fc-info' }),
  contrast: () =>
    window.$message.contrast('对比提示', '这是一条对比风格提示', 3000, { iconName: 'fc-idea' }),
}

const showSticky = () =>
  window.$message.add({
    severity: 'success',
    summary: '粘性消息',
    detail: 'life = 0 需手动关闭',
    life: 0,
    iconName: 'fc-ok',
  })

const showClosable = () =>
  window.$message.add({
    severity: 'info',
    summary: '可手动关闭',
    detail: 'closable = true + life = 5000',
    closable: true,
    life: 5000,
    iconName: 'ri-time-fill',
  })

const showSmallVariants = () => {
  window.$message.add({
    severity: 'success',
    content: 'Outlined + small',
    variant: 'outlined',
    iconName: 'fc-info',
    size: 'small',
  })
  window.$message.add({
    severity: 'success',
    content: 'Simple + small',
    variant: 'simple',
    iconName: 'fc-idea',
    size: 'small',
  })
}
const showVariants = () => {
  window.$message.add({
    severity: 'info',
    content: 'Outlined',
    variant: 'outlined',
    iconName: 'fc-info',
  })
  window.$message.add({
    severity: 'info',
    content: 'Simple',
    variant: 'simple',
    iconName: 'fc-idea',
  })
}
const showLargeVariants = () => {
  window.$message.add({
    severity: 'warn',
    content: 'Outlined + large',
    variant: 'outlined',
    iconName: 'fc-info',
    size: 'large',
  })
  window.$message.add({
    severity: 'warn',
    content: 'Simple + large',
    variant: 'simple',
    iconName: 'fc-idea',
    size: 'large',
  })
}

const showCallback = () =>
  window.$message.add({
    summary: '带关闭回调',
    detail: '关闭后再弹出一条成功消息',
    onClose: () => window.$message.success('回调已执行', '', 1500, { iconName: 'fc-ok' }),
    closable: true,
    iconName: 'fc-info',
  })

const clearAll = () => window.$message.clear()
</script>

<template lang="pug">
.between-col.justify-start.gap-gap
  .between-col.gap-gapl
  // 基础
  .full.c-card.p-padding.rounded-rounded.between-col.center-start
    .color-accent100.center 基础 Message
    p.color-text200.fs-appFontSizes 最基础的消息展示
    .between.gap-gap
      Button(label='基础', severity='primary', @click='showBasic')
      Button(label='粘性（life=0）', severity='info', @click='showSticky')
      Button(label='可关闭 + 自定义时长', severity='warn', @click='showClosable')

  // 便捷方法（严重级别）
  .full.c-card.p-padding.rounded-rounded.between-col.center-start
    .color-accent100.center 严重级别
    p.color-text200.fs-appFontSizes 通过便捷方法快速显示
    .between.gap-gap
      Button(label='信息', severity='info', text, @click='showConvenient.info')
      Button(label='成功', severity='success', text, @click='showConvenient.success')
      Button(label='警告', severity='warn', text, @click='showConvenient.warn')
      Button(label='错误', severity='danger', text, @click='showConvenient.error')
      Button(label='次要', severity='secondary', text, @click='showConvenient.secondary')
      Button(label='对比', severity='help', text, @click='showConvenient.contrast')

  // 变体与尺寸
  .full.c-card.p-padding.rounded-rounded.between-col.center-start
    .color-accent100.center 变体与尺寸
    p.color-text200.fs-appFontSizes variant + size 示例，带自定义图标
    .between.gap-gap
      Button.fs-appFontSizes(
        label='Outlined + small',
        severity='success',
        size='small',
        @click='showSmallVariants'
      )
      Button(label='Outlined', severity='info', @click='showVariants')
      Button.fs-appFontSizex(
        label='Outlined + large',
        severity='warn',
        size='large',
        @click='showLargeVariants'
      )

  // 回调
  .full.c-card.p-padding.rounded-rounded.between-col.center-start
    .color-accent100.center 关闭回调
    p.color-text200.fs-appFontSizes 关闭后再弹出成功提示
    .between
      Button(label='带回调', severity='secondary', @click='showCallback')

  // 管理
  .full.c-card.p-padding.rounded-rounded.between-col.center-start
    .color-accent100.center 管理
    p.color-text200.fs-appFontSizes 清理所有消息
    .between.gap-gap
      Button(label='清除所有', severity='danger', text, @click='clearAll')
</template>

<style lang="scss" scope></style>
