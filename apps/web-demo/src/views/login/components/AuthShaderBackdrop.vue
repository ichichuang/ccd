<script setup lang="ts">
defineOptions({ name: 'AuthShaderBackdrop' })
</script>

<template>
  <div
    class="auth-shader-backdrop absolute inset-0 z-base pointer-events-none overflow-hidden"
    aria-hidden="true"
  >
    <div class="auth-shader-backdrop__field absolute inset-0" />
    <div class="auth-shader-backdrop__lines absolute inset-0" />
    <div class="auth-shader-backdrop__noise absolute inset-0" />
    <div class="auth-shader-backdrop__ripple auth-shader-backdrop__ripple--primary" />
    <div class="auth-shader-backdrop__ripple auth-shader-backdrop__ripple--accent" />
  </div>
</template>

<style scoped>
.auth-shader-backdrop {
  background: rgb(var(--background));
}

.auth-shader-backdrop__field {
  background:
    radial-gradient(circle at 18% 22%, rgb(var(--primary) / 22%), transparent 28%),
    radial-gradient(circle at 78% 70%, rgb(var(--accent) / 18%), transparent 30%),
    radial-gradient(circle at 58% 18%, rgb(var(--info) / 14%), transparent 24%),
    conic-gradient(
      from 220deg at 48% 48%,
      rgb(var(--background) / 0%),
      rgb(var(--primary) / 10%),
      rgb(var(--accent) / 8%),
      rgb(var(--background) / 0%)
    ),
    linear-gradient(
      135deg,
      rgb(var(--background)) 0%,
      rgb(var(--muted) / 48%) 52%,
      rgb(var(--background)) 100%
    );
}

.auth-shader-backdrop__lines {
  opacity: 0.62;
  background-image:
    repeating-linear-gradient(
      108deg,
      transparent 0,
      transparent calc(var(--spacing-xs) * 3),
      rgb(var(--foreground) / 5%) calc(var(--spacing-xs) * 3),
      rgb(var(--foreground) / 5%) calc((var(--spacing-xs) * 3) + 1px)
    ),
    repeating-linear-gradient(
      18deg,
      transparent 0,
      transparent calc(var(--spacing-lg) + var(--spacing-xs)),
      rgb(var(--primary) / 7%) calc(var(--spacing-lg) + var(--spacing-xs)),
      rgb(var(--primary) / 7%) calc(var(--spacing-lg) + var(--spacing-xs) + 1px)
    );
  mask-image: radial-gradient(circle at 48% 44%, rgb(var(--foreground) / 86%), transparent 72%);
  animation: auth-lines-drift calc(var(--transition-5xl) * 36) linear infinite;
}

.auth-shader-backdrop__noise {
  opacity: 0.28;
  background-image:
    radial-gradient(circle at 25% 25%, rgb(var(--foreground) / 8%) 0 1px, transparent 1px),
    radial-gradient(circle at 75% 55%, rgb(var(--background) / 42%) 0 1px, transparent 1px);
  background-size:
    calc(var(--spacing-lg) + var(--spacing-xs)) calc(var(--spacing-lg) + var(--spacing-xs)),
    calc(var(--spacing-xl) + var(--spacing-sm)) calc(var(--spacing-xl) + var(--spacing-sm));
  mix-blend-mode: soft-light;
}

.auth-shader-backdrop__ripple {
  position: absolute;
  border: 1px solid rgb(var(--primary) / 16%);
  border-radius: var(--radius-full);
  opacity: 0.7;
  transform: translate3d(0, 0, 0);
  animation: auth-ripple calc(var(--transition-5xl) * 18) ease-in-out infinite;
}

.auth-shader-backdrop__ripple--primary {
  inset: 10% 42% 18% 6%;
}

.auth-shader-backdrop__ripple--accent {
  inset: 18% 6% 8% 52%;
  border-color: rgb(var(--accent) / 14%);
  animation-delay: calc(var(--transition-5xl) * -6);
}

@keyframes auth-lines-drift {
  from {
    transform: translate3d(0, 0, 0);
  }

  to {
    transform: translate3d(calc(var(--spacing-xl) * -1), var(--spacing-xl), 0);
  }
}

@keyframes auth-ripple {
  0%,
  100% {
    opacity: 0.32;
    transform: scale(0.96);
  }

  50% {
    opacity: 0.72;
    transform: scale(1.04);
  }
}

@media (width <= 768px) {
  .auth-shader-backdrop__lines {
    opacity: 0.34;
    animation: none;
  }

  .auth-shader-backdrop__ripple--accent {
    display: none;
  }
}

@media (prefers-reduced-motion: reduce) {
  .auth-shader-backdrop__lines,
  .auth-shader-backdrop__ripple {
    animation: none;
  }
}
</style>
