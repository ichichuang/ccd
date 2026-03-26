<script setup lang="ts">
// 本页使用 meta.transition 自定义进场/离场动画
// 配置了 fadeInRight / fadeOutLeft，与其他页面的默认 fade 不同
</script>

<template>
  <div class="p-lg col-stretch gap-md">
    <h2 class="text-xl font-semibold row-start items-center gap-sm">
      <Icons
        name="i-lucide-sparkles"
        size="lg"
        class="text-primary"
      />
      <span>路由过渡动画示例（meta.transition）</span>
    </h2>

    <div class="material-elevated col-stretch gap-sm">
      <div class="text-md font-medium">本路由 meta.transition 配置</div>
      <pre class="text-muted-foreground text-sm font-mono whitespace-pre-wrap">{{
        JSON.stringify(
          {
            name: 'fade-slide',
            enterTransition: 'animate__animated animate__fadeInRight animate__fast',
            leaveTransition: 'animate__animated animate__fadeOutLeft animate__fast',
            duration: '400ms',
          },
          null,
          2
        )
      }}</pre>
      <p class="text-muted-foreground text-sm">
        进出本页时应有「右进左出」的滑动效果，与默认的淡入淡出不同。需确保布局设置中已开启「路由过渡」。
      </p>
    </div>
  </div>
</template>
