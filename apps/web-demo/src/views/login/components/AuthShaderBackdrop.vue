<script setup lang="ts">
defineOptions({ name: 'AuthShaderBackdrop' })
</script>

<template>
  <div
    class="auth-shader-backdrop absolute inset-0 z-base pointer-events-none overflow-hidden"
    aria-hidden="true"
  >
    <div class="auth-shader-backdrop__field absolute inset-0" />
    <div class="auth-shader-backdrop__grid absolute inset-0" />
    <div class="auth-shader-backdrop__sweep absolute inset-0" />
    <div class="auth-shader-backdrop__glow auth-shader-backdrop__glow--primary" />
    <div class="auth-shader-backdrop__glow auth-shader-backdrop__glow--accent" />
  </div>
</template>

<style scoped>
.auth-shader-backdrop {
  --auth-backdrop-primary: 5%;
  --auth-backdrop-accent: 4%;
  --auth-backdrop-line: 2%;
  --auth-backdrop-panel: 8%;
  --auth-sweep-duration: 42s;

  background: rgb(var(--background));
}

:global(.dark) .auth-shader-backdrop {
  --auth-backdrop-primary: 10%;
  --auth-backdrop-accent: 8%;
  --auth-backdrop-line: 3%;
  --auth-backdrop-panel: 15%;
}

.auth-shader-backdrop__field {
  background:
    radial-gradient(
      ellipse at 50% 46%,
      rgb(var(--primary) / var(--auth-backdrop-primary)),
      transparent 34%
    ),
    radial-gradient(
      ellipse at 72% 68%,
      rgb(var(--accent) / var(--auth-backdrop-accent)),
      transparent 40%
    ),
    radial-gradient(ellipse at 35% 34%, rgb(var(--info) / 3%), transparent 28%),
    linear-gradient(
      135deg,
      rgb(var(--background)) 0%,
      rgb(var(--muted) / var(--auth-backdrop-panel)) 50%,
      rgb(var(--background)) 100%
    );
}

.auth-shader-backdrop__grid {
  opacity: 0.5;
  background-image:
    linear-gradient(rgb(var(--foreground) / var(--auth-backdrop-line)) 1px, transparent 1px),
    linear-gradient(90deg, rgb(var(--foreground) / var(--auth-backdrop-line)) 1px, transparent 1px),
    repeating-linear-gradient(
      135deg,
      transparent 0,
      transparent 48px,
      rgb(var(--foreground) / 0.8%) 48px,
      rgb(var(--foreground) / 0.8%) 49px
    );
  background-size:
    48px 48px,
    48px 48px,
    100% 100%;
  mask-image: radial-gradient(
    circle at 50% 50%,
    rgb(var(--foreground)) 24%,
    rgb(var(--foreground) / 20%) 78%
  );
}

.auth-shader-backdrop__sweep {
  background: linear-gradient(
    135deg,
    transparent 43%,
    rgb(var(--primary) / 5%) 49%,
    rgb(var(--primary) / 12%) 50%,
    rgb(var(--accent) / 7%) 51%,
    transparent 57%
  );
  background-size: 200% 200%;
  background-position: 50% 50%;
  animation: auth-sweep var(--auth-sweep-duration) linear infinite;
  opacity: 0.76;
}

.auth-shader-backdrop__glow {
  position: absolute;
  border-radius: var(--radius-full);
  filter: blur(96px);
  pointer-events: none;
  opacity: 0.24;
}

.auth-shader-backdrop__glow--primary {
  top: 24%;
  left: 34%;
  width: 320px;
  height: 320px;
  background: radial-gradient(circle, rgb(var(--primary) / 10%), transparent 70%);
}

.auth-shader-backdrop__glow--accent {
  right: 28%;
  bottom: 16%;
  width: 280px;
  height: 280px;
  background: radial-gradient(circle, rgb(var(--accent) / 8%), transparent 70%);
}

@keyframes auth-sweep {
  0% {
    background-position: 0% 0%;
  }

  100% {
    background-position: 200% 200%;
  }
}

@media (prefers-reduced-motion: reduce) {
  .auth-shader-backdrop__sweep {
    animation: none !important;
  }

  .auth-shader-backdrop__sweep {
    opacity: 0.2;
    background-position: 50% 50%;
  }
}
</style>
