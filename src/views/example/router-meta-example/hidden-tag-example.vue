<script setup lang="ts">
// 本页无额外逻辑，主要展示 meta.hiddenTag 效果
</script>

<template>
  <div class="p-padding-lg space-y-margin-md">
    <h2 class="fs-xl font-semibold flex items-center gap-sm">
      <Icons
        name="i-lucide-tag"
        size="lg"
        class="text-primary"
      />
      <span>隐藏标签页示例（meta.hiddenTag）</span>
    </h2>

    <div class="component-border rounded-scale p-padding-md space-y-margin-sm">
      <div class="fs-md font-medium">本路由 meta.hiddenTag = true</div>
      <p class="text-muted-foreground fs-sm">
        当前页面访问后不会添加到多标签栏中。适合详情页、弹窗内嵌等不希望增加标签的场景。
      </p>
      <p class="text-muted-foreground fs-sm">请观察顶部的标签栏：本页应不会出现新标签。</p>
    </div>
  </div>
</template>
