<script setup lang="ts">
defineOptions({ name: 'AuthShaderBackdrop' })
</script>

<template>
  <div
    class="auth-shader-backdrop absolute inset-0 z-base pointer-events-none overflow-hidden"
    aria-hidden="true"
  >
    <!-- Radial gradient field -->
    <div class="auth-shader-backdrop__field absolute inset-0" />

    <!-- Fine grid and diagonal shader lines overlay -->
    <div class="auth-shader-backdrop__grid absolute inset-0" />

    <!-- Subtle slow theme line sweep -->
    <div class="auth-shader-backdrop__sweep absolute inset-0" />

    <!-- Tokenized ambient glows -->
    <div class="auth-shader-backdrop__glow auth-shader-backdrop__glow--primary" />
    <div class="auth-shader-backdrop__glow auth-shader-backdrop__glow--accent" />
  </div>
</template>

<style scoped>
.auth-shader-backdrop {
  --auth-backdrop-primary: 12%;
  --auth-backdrop-accent: 9%;
  --auth-backdrop-line: 5%;
  --auth-backdrop-panel: 22%;
  --auth-sweep-duration: 25s;

  background: rgb(var(--background));
}

:global(.dark) .auth-shader-backdrop {
  --auth-backdrop-primary: 20%;
  --auth-backdrop-accent: 15%;
  --auth-backdrop-line: 6%;
  --auth-backdrop-panel: 42%;
}

/* Base gradient fields with subtle low-frequency shimmer */
.auth-shader-backdrop__field {
  background:
    radial-gradient(
      ellipse at 15% 20%,
      rgb(var(--primary) / var(--auth-backdrop-primary)),
      transparent 38%
    ),
    radial-gradient(
      ellipse at 80% 75%,
      rgb(var(--accent) / var(--auth-backdrop-accent)),
      transparent 40%
    ),
    radial-gradient(ellipse at 50% 10%, rgb(var(--info) / 8%), transparent 30%),
    linear-gradient(
      135deg,
      rgb(var(--background)) 0%,
      rgb(var(--muted) / var(--auth-backdrop-panel)) 50%,
      rgb(var(--background)) 100%
    );
  animation: auth-shimmer 20s ease-in-out infinite;
}

/* Fine grid and subtle diagonal lines */
.auth-shader-backdrop__grid {
  opacity: 0.68;
  background-image:
    /* Fine Grid */
    linear-gradient(rgb(var(--foreground) / var(--auth-backdrop-line)) 1px, transparent 1px),
    linear-gradient(90deg, rgb(var(--foreground) / var(--auth-backdrop-line)) 1px, transparent 1px),
    /* Subtle Diagonal Shader Lines */
    repeating-linear-gradient(
        135deg,
        transparent 0,
        transparent 32px,
        rgb(var(--foreground) / 4%) 32px,
        rgb(var(--foreground) / 4%) 33px
      );
  background-size:
    40px 40px,
    40px 40px,
    100% 100%;
  mask-image: radial-gradient(
    circle at 50% 50%,
    rgb(var(--foreground)) 30%,
    rgb(var(--foreground) / 20%) 80%
  );
}

/* Subtle line sweep - background position sweep */
.auth-shader-backdrop__sweep {
  background: linear-gradient(
    135deg,
    transparent 45%,
    rgb(var(--primary) / 6%) 48%,
    rgb(var(--primary) / 14%) 50%,
    rgb(var(--accent) / 8%) 52%,
    transparent 55%
  );
  background-size: 200% 200%;
  animation: auth-sweep var(--auth-sweep-duration) linear infinite;
  opacity: 0.82;
}

/* Ambient glow zones */
.auth-shader-backdrop__glow {
  position: absolute;
  border-radius: var(--radius-full);
  filter: blur(100px);
  pointer-events: none;
  opacity: 0.45;
  animation: auth-glow-pulse 10s ease-in-out infinite alternate;
}

.auth-shader-backdrop__glow--primary {
  top: 15%;
  left: 20%;
  width: 300px;
  height: 300px;
  background: radial-gradient(circle, rgb(var(--primary) / 16%), transparent 70%);
}

.auth-shader-backdrop__glow--accent {
  bottom: 20%;
  right: 25%;
  width: 250px;
  height: 250px;
  background: radial-gradient(circle, rgb(var(--accent) / 12%), transparent 70%);
  animation-delay: -5s;
}

@keyframes auth-shimmer {
  0%,
  100% {
    opacity: 0.88;
  }

  50% {
    opacity: 1;
  }
}

@keyframes auth-sweep {
  0% {
    background-position: 0% 0%;
  }

  100% {
    background-position: 200% 200%;
  }
}

@keyframes auth-glow-pulse {
  0% {
    transform: scale(0.95) translate3d(0, 0, 0);
    opacity: 0.38;
  }

  100% {
    transform: scale(1.05) translate3d(5px, -5px, 0);
    opacity: 0.48;
  }
}

/* Media query support for reduced motion */
@media (prefers-reduced-motion: reduce) {
  .auth-shader-backdrop__field,
  .auth-shader-backdrop__sweep,
  .auth-shader-backdrop__glow {
    animation: none !important;
  }

  .auth-shader-backdrop__sweep {
    opacity: 0.3;
    background-position: 50% 50%;
  }
}
</style>
