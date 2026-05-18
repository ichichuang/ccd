<script setup lang="ts">
/**
 * LoadingFallback - 纯 CSS 旋转指示器
 * 在 Lottie 异步 chunk 加载完成前立即显示。零 JS 依赖。
 * 视觉风格复用 layouts/index.vue 中 .pure-css-loader。
 */
</script>

<template>
  <div class="layout-full flex items-center justify-center">
    <div
      class="loading-fallback-spinner"
      role="status"
      aria-label="Loading"
    />
  </div>
</template>

<style scoped>
.loading-fallback-spinner {
  position: relative;
  width: 48px;
  height: 48px;
  border-radius: 50%;
}

.loading-fallback-spinner::before,
.loading-fallback-spinner::after {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: 50%;
  box-sizing: border-box;
}

.loading-fallback-spinner::before {
  border: 4px solid rgb(var(--primary) / 20%);
  border-top-color: rgb(var(--primary));
  animation: loading-fallback-spin 0.9s linear infinite;
}

.loading-fallback-spinner::after {
  border: 4px solid transparent;
  border-right-color: rgb(var(--primary) / 65%);
  transform: scale(0.72);
  animation: loading-fallback-spin-reverse 1.2s linear infinite;
  opacity: 0.9;
}

@keyframes loading-fallback-spin {
  to {
    transform: rotate(360deg);
  }
}

@keyframes loading-fallback-spin-reverse {
  to {
    transform: scale(0.72) rotate(-360deg);
  }
}
</style>
