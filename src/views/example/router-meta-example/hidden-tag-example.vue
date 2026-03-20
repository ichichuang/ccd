<script setup lang="ts">
// 本页无额外逻辑，主要展示 meta.hiddenTag 效果
</script>

<template>
  <div class="p-lg space-y-margin-md">
    <h2 class="text-xl font-semibold row-y-center gap-sm">
      <Icons
        name="i-lucide-tag"
        size="lg"
        class="text-primary"
      />
      <span>隐藏标签页示例（meta.hiddenTag）</span>
    </h2>

    <div class="shadow-soft rounded-scale p-md space-y-margin-sm">
      <div class="text-md font-medium">本路由 meta.hiddenTag = true</div>
      <p class="text-muted-foreground text-sm">
        当前页面访问后不会添加到多标签栏中。适合详情页、弹窗内嵌等不希望增加标签的场景。
      </p>
      <p class="text-muted-foreground text-sm">请观察顶部的标签栏：本页应不会出现新标签。</p>
    </div>
  </div>
</template>
