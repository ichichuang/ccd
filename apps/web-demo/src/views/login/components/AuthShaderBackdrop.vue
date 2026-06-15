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
  --auth-backdrop-primary: 5%;
  --auth-backdrop-accent: 4%;
  --auth-backdrop-line: 1.5%;
  --auth-backdrop-panel: 8%;
  --auth-sweep-duration: 35s;

  background: rgb(var(--background));
}

:global(.dark) .auth-shader-backdrop {
  --auth-backdrop-primary: 10%;
  --auth-backdrop-accent: 8%;
  --auth-backdrop-line: 2%;
  --auth-backdrop-panel: 15%;
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
    radial-gradient(ellipse at 50% 10%, rgb(var(--info) / 3%), transparent 30%),
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
  opacity: 0.45;
  background-image:
    /* Fine Grid */
    linear-gradient(rgb(var(--foreground) / var(--auth-backdrop-line)) 1px, transparent 1px),
    linear-gradient(90deg, rgb(var(--foreground) / var(--auth-backdrop-line)) 1px, transparent 1px),
    /* Subtle Diagonal Shader Lines */
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
    rgb(var(--foreground)) 30%,
    rgb(var(--foreground) / 20%) 80%
  );
}

/* Subtle line sweep - background position sweep */
.auth-shader-backdrop__sweep {
  background: linear-gradient(
    135deg,
    transparent 46%,
    rgb(var(--primary) / 4%) 49%,
    rgb(var(--primary) / 8%) 50%,
    rgb(var(--accent) / 5%) 51%,
    transparent 54%
  );
  background-size: 200% 200%;
  animation: auth-sweep var(--auth-sweep-duration) linear infinite;
  opacity: 0.6;
}

/* Ambient glow zones */
.auth-shader-backdrop__glow {
  position: absolute;
  border-radius: var(--radius-full);
  filter: blur(120px);
  pointer-events: none;
  opacity: 0.3;
  animation: auth-glow-pulse 12s ease-in-out infinite alternate;
}

.auth-shader-backdrop__glow--primary {
  top: 15%;
  left: 20%;
  width: 300px;
  height: 300px;
  background: radial-gradient(circle, rgb(var(--primary) / 10%), transparent 70%);
}

.auth-shader-backdrop__glow--accent {
  bottom: 20%;
  right: 25%;
  width: 250px;
  height: 250px;
  background: radial-gradient(circle, rgb(var(--accent) / 8%), transparent 70%);
  animation-delay: -6s;
}

@keyframes auth-shimmer {
  0%,
  100% {
    opacity: 0.92;
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
    transform: scale(0.97) translate3d(0, 0, 0);
    opacity: 0.25;
  }

  100% {
    transform: scale(1.03) translate3d(3px, -3px, 0);
    opacity: 0.35;
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
    opacity: 0.2;
    background-position: 50% 50%;
  }
}
</style>
