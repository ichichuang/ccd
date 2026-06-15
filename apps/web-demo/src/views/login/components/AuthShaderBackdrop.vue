<script setup lang="ts">
defineOptions({ name: 'AuthShaderBackdrop' })
</script>

<template>
  <div
    class="auth-shader-backdrop absolute inset-0 z-base pointer-events-none overflow-hidden"
    aria-hidden="true"
  >
    <div class="auth-shader-backdrop__field absolute inset-0" />
    <div class="auth-shader-backdrop__volume absolute inset-0" />
    <div class="auth-shader-backdrop__lines absolute inset-0" />
    <div class="auth-shader-backdrop__scan absolute inset-0" />
    <div class="auth-shader-backdrop__noise absolute inset-0" />
    <div class="auth-shader-backdrop__ripple auth-shader-backdrop__ripple--primary" />
    <div class="auth-shader-backdrop__ripple auth-shader-backdrop__ripple--accent" />
    <div class="auth-shader-backdrop__ripple auth-shader-backdrop__ripple--wide" />
  </div>
</template>

<style scoped>
.auth-shader-backdrop {
  --auth-backdrop-primary: 20%;
  --auth-backdrop-accent: 16%;
  --auth-backdrop-line: 6%;
  --auth-backdrop-panel: 34%;

  background: rgb(var(--background));
}

.auth-shader-backdrop__field {
  background:
    radial-gradient(
      ellipse at 18% 22%,
      rgb(var(--primary) / var(--auth-backdrop-primary)),
      transparent 32%
    ),
    radial-gradient(
      ellipse at 74% 68%,
      rgb(var(--accent) / var(--auth-backdrop-accent)),
      transparent 34%
    ),
    radial-gradient(ellipse at 52% 8%, rgb(var(--info) / 12%), transparent 28%),
    radial-gradient(ellipse at 50% 102%, rgb(var(--success) / 12%), transparent 30%),
    conic-gradient(
      from 228deg at 48% 48%,
      rgb(var(--background) / 0%),
      rgb(var(--primary) / 12%),
      rgb(var(--accent) / 10%),
      rgb(var(--info) / 8%),
      rgb(var(--background) / 0%)
    ),
    linear-gradient(
      135deg,
      rgb(var(--background)) 0%,
      rgb(var(--muted) / var(--auth-backdrop-panel)) 50%,
      rgb(var(--background)) 100%
    );
}

.auth-shader-backdrop__volume {
  opacity: 0.72;
  background:
    linear-gradient(90deg, transparent 5%, rgb(var(--primary) / 7%) 6%, transparent 42%),
    linear-gradient(180deg, transparent 18%, rgb(var(--border) / 18%) 18.2%, transparent 18.4%),
    linear-gradient(90deg, transparent 53%, rgb(var(--accent) / 8%) 53.2%, transparent 92%);
  clip-path: polygon(6% 16%, 58% 16%, 58% 25%, 94% 25%, 94% 92%, 52% 92%, 52% 84%, 7% 84%);
}

.auth-shader-backdrop__lines {
  opacity: 0.72;
  background-image:
    repeating-linear-gradient(
      108deg,
      transparent 0,
      transparent calc(var(--spacing-xs) * 3),
      rgb(var(--foreground) / var(--auth-backdrop-line)) calc(var(--spacing-xs) * 3),
      rgb(var(--foreground) / var(--auth-backdrop-line)) calc((var(--spacing-xs) * 3) + 1px)
    ),
    repeating-linear-gradient(
      12deg,
      transparent 0,
      transparent calc(var(--spacing-lg) + var(--spacing-xs)),
      rgb(var(--primary) / 9%) calc(var(--spacing-lg) + var(--spacing-xs)),
      rgb(var(--primary) / 9%) calc(var(--spacing-lg) + var(--spacing-xs) + 1px)
    );
  mask-image: radial-gradient(circle at 48% 44%, rgb(var(--foreground) / 86%), transparent 72%);
  animation: auth-lines-drift calc(var(--transition-5xl) * 36) linear infinite;
}

.auth-shader-backdrop__scan {
  opacity: 0.22;
  background-image:
    linear-gradient(90deg, transparent, rgb(var(--primary) / 22%), transparent),
    linear-gradient(0deg, transparent, rgb(var(--accent) / 16%), transparent);
  background-size:
    62% 1px,
    1px 54%;
  background-position:
    18% 32%,
    72% 48%;
  background-repeat: no-repeat;
}

.auth-shader-backdrop__noise {
  opacity: 0.24;
  background-image:
    radial-gradient(circle at 25% 25%, rgb(var(--foreground) / 8%) 0 1px, transparent 1px),
    radial-gradient(circle at 75% 55%, rgb(var(--background) / 48%) 0 1px, transparent 1px);
  background-size:
    calc(var(--spacing-lg) + var(--spacing-xs)) calc(var(--spacing-lg) + var(--spacing-xs)),
    calc(var(--spacing-xl) + var(--spacing-sm)) calc(var(--spacing-xl) + var(--spacing-sm));
  mix-blend-mode: soft-light;
}

.auth-shader-backdrop__ripple {
  position: absolute;
  border: 1px solid rgb(var(--primary) / 18%);
  border-radius: var(--radius-xl);
  opacity: 0.62;
  transform: translate3d(0, 0, 0);
  animation: auth-ripple calc(var(--transition-5xl) * 18) ease-in-out infinite;
}

.auth-shader-backdrop__ripple--primary {
  inset: 15% 41% 16% 5%;
}

.auth-shader-backdrop__ripple--accent {
  inset: 24% 6% 7% 52%;
  border-color: rgb(var(--accent) / 16%);
  animation-delay: calc(var(--transition-5xl) * -6);
}

.auth-shader-backdrop__ripple--wide {
  inset: 8% 10% 11% 12%;
  border-color: rgb(var(--info) / 10%);
  border-radius: var(--radius-lg);
  opacity: 0.36;
  animation-delay: calc(var(--transition-5xl) * -10);
}

:global(.dark) .auth-shader-backdrop {
  --auth-backdrop-primary: 26%;
  --auth-backdrop-accent: 20%;
  --auth-backdrop-line: 7%;
  --auth-backdrop-panel: 58%;
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
  .auth-shader-backdrop__volume,
  .auth-shader-backdrop__scan,
  .auth-shader-backdrop__ripple--wide {
    display: none;
  }

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
