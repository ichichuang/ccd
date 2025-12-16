<script setup lang="tsx">
// 预留：后续可在此补充“动态列 / 配置驱动”的 VxeTable 示例
</script>

<template lang="pug">
.between-col.justify-start.gap-gapl
  // 动态配置示例占位（主容器，与 basic 保持一致结构）
  .between-col.justify-start.gap-gaps.c-border-primary.p-padding
    b.fs-appFontSizex VxeTable 动态配置示例（占位页面）
    .fs-appFontSizes.color-text2
      | 该页面预留用于展示“动态列 / 动态配置驱动”的 VxeTable 高级示例，目前仅提供布局占位与说明文档。
    .fs-appFontSizes.color-text2
      | 布局结构与其他 VxeTable 示例保持一致，方便后续直接填充脚本与表格内容。

    .c-border-accent.rounded-rounded.p-paddingl.fs-appFontSizes.between-col.items-start.gap-gap
      b.fs-appFontSizex TODO：动态示例内容待补充
      span
        | 可以在此处接入基于配置渲染列/操作区/工具栏等的示例，如：
      ul.list-disc.pl-4
        li 配置化列定义（从后端/配置中心拉取列信息，动态渲染 VxeTable columns）。
        li 动态开关列显示/固定/排序等行为的控制面板。
        li 根据业务场景动态切换数据源与表格行为。

  // 说明文档（独立说明卡片）
  .c-border-accent.p-padding.fs-appFontSizes.between-col.justify-start.items-start.gap-gap
    b.fs-appFontSizex 使用说明
    .between-col.gap-gaps
      div
        b 页面用途：
        ul
          li
            strong 占位说明：
            | 当前文件主要用于占位与布局演示，暂未实现具体表格逻辑。
          li
            strong 后续扩展：
            | 当需要新增 VxeTable 动态配置示例时，可在 script setup 中补充数据与列定义，并在上方内容区域接入 VxeTable 组件。
</template>

<style lang="scss" scoped></style>
