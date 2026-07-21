<script setup lang="ts">
import { createScopedGsapContext, gsap, type ScopedGsapContext } from '@/plugins/animation'

defineOptions({ name: 'AuthShaderBackdrop' })

const backdropRef = ref<HTMLElement | null>(null)
const preferredReducedMotion = usePreferredReducedMotion()

let bubbleDriftMotion: ScopedGsapContext | null = null

onMounted(() => {
  const scope = backdropRef.value
  if (!scope) return

  bubbleDriftMotion = createScopedGsapContext(
    () => {
      const bubbles = Array.from(
        scope.querySelectorAll<HTMLElement>('.auth-glass-bubble')
      )
      const drift = [
        { x: -5, y: -7, scale: 1.008, opacity: 0.95, duration: 24 },
        { x: 5, y: 4, scale: 0.992, opacity: 0.96, duration: 28 },
        { x: -4, y: -6, scale: 1.01, opacity: 0.94, duration: 20 },
        { x: 6, y: 5, scale: 0.995, opacity: 0.95, duration: 22 },
      ]

      if (bubbles.length === 0) return

      gsap.set(bubbles, {
        transformOrigin: '50% 50%',
        willChange: 'transform, opacity',
      })

      bubbles.forEach((bubble, index) => {
        const config = drift[index % drift.length]
        gsap.to(bubble, {
          x: config.x,
          y: config.y,
          scale: config.scale,
          opacity: config.opacity,
          duration: config.duration,
          delay: index * 0.7,
          ease: 'sine.inOut',
          repeat: -1,
          yoyo: true,
          overwrite: 'auto',
        })
      })
    },
    {
      scope,
      isReducedMotion: preferredReducedMotion.value === 'reduce',
    }
  )
})

onBeforeUnmount(() => {
  bubbleDriftMotion?.revert()
  bubbleDriftMotion = null
})
</script>

<template>
  <div
    ref="backdropRef"
    class="auth-shader-backdrop absolute inset-0 z-base pointer-events-none overflow-hidden"
    aria-hidden="true"
  >
    <div class="auth-shader-backdrop__field absolute inset-0" />
    <div class="auth-shader-backdrop__grid absolute inset-0" />
    <div class="auth-shader-backdrop__blueprint auth-shader-backdrop__blueprint--left" />
    <div class="auth-shader-backdrop__blueprint auth-shader-backdrop__blueprint--right" />
    <div class="auth-shader-backdrop__card-glow" />
    <div
      class="auth-shader-backdrop__ice-panel auth-shader-backdrop__ice-panel--left"
    />
    <div
      class="auth-shader-backdrop__ice-panel auth-shader-backdrop__ice-panel--right"
    />
    <div
      class="auth-shader-backdrop__bubble auth-shader-backdrop__bubble--large"
    />
    <div
      class="auth-shader-backdrop__bubble auth-shader-backdrop__bubble--wide"
    />
    <div
      class="auth-shader-backdrop__bubble auth-shader-backdrop__bubble--pearl"
    />
    <div
      class="auth-shader-backdrop__bubble auth-shader-backdrop__bubble--drop"
    />
    <div class="auth-shader-backdrop__glow auth-shader-backdrop__glow--primary" />
    <div class="auth-shader-backdrop__glow auth-shader-backdrop__glow--accent" />
  </div>
</template>

<style scoped>
.auth-shader-backdrop {
  --auth-backdrop-primary: 10%;
  --auth-backdrop-accent: 8%;
  --auth-backdrop-info: 7%;
  --auth-backdrop-success: 5%;
  --auth-backdrop-grid: 4.4%;
  --auth-backdrop-blueprint: 8%;
  --auth-backdrop-panel: 34%;
  --auth-backdrop-bubble: 42%;
  --auth-backdrop-bubble-border: 28%;
  --auth-backdrop-bubble-shadow: 10%;
  --auth-backdrop-highlight: 64%;

  background: rgb(var(--background));
  transition: background-color var(--auth-theme-transition-duration, var(--transition-sm))
    var(--auth-theme-transition-ease, ease-out);
}

:global(.dark) .auth-shader-backdrop {
  --auth-backdrop-primary: 16%;
  --auth-backdrop-accent: 13%;
  --auth-backdrop-info: 12%;
  --auth-backdrop-success: 7%;
  --auth-backdrop-grid: 4%;
  --auth-backdrop-blueprint: 7%;
  --auth-backdrop-panel: 18%;
  --auth-backdrop-bubble: 18%;
  --auth-backdrop-bubble-border: 22%;
  --auth-backdrop-bubble-shadow: 20%;
  --auth-backdrop-highlight: 24%;
}

.auth-shader-backdrop__field {
  background:
    radial-gradient(
      ellipse at 50% 42%,
      rgb(
        var(--auth-primary-r) var(--auth-primary-g) var(--auth-primary-b) /
          var(--auth-backdrop-primary)
      ),
      transparent 34%
    ),
    radial-gradient(
      ellipse at 78% 72%,
      rgb(
        var(--auth-accent-r) var(--auth-accent-g) var(--auth-accent-b) / var(--auth-backdrop-accent)
      ),
      transparent 34%
    ),
    radial-gradient(
      ellipse at 26% 78%,
      rgb(var(--info) / var(--auth-backdrop-info)),
      transparent 31%
    ),
    radial-gradient(
      ellipse at 84% 24%,
      rgb(var(--success) / var(--auth-backdrop-success)),
      transparent 28%
    ),
    linear-gradient(
      180deg,
      rgb(var(--background)) 0%,
      rgb(var(--muted) / var(--auth-backdrop-panel)) 54%,
      rgb(var(--background)) 100%
    );
  transition:
    opacity var(--auth-theme-transition-duration, var(--transition-sm))
      var(--auth-theme-transition-ease, ease-out),
    filter var(--auth-theme-transition-duration, var(--transition-sm))
      var(--auth-theme-transition-ease, ease-out);
}

.auth-shader-backdrop__grid {
  opacity: 0.9;
  background-image:
    linear-gradient(rgb(var(--foreground) / var(--auth-backdrop-grid)) 1px, transparent 1px),
    linear-gradient(90deg, rgb(var(--foreground) / var(--auth-backdrop-grid)) 1px, transparent 1px);
  background-size:
    48px 48px,
    48px 48px;
  mask-image: radial-gradient(
    ellipse at 50% 48%,
    rgb(var(--foreground)) 24%,
    rgb(var(--foreground) / 52%) 68%,
    transparent 100%
  );
  transition:
    opacity var(--auth-theme-transition-duration, var(--transition-sm))
      var(--auth-theme-transition-ease, ease-out),
    filter var(--auth-theme-transition-duration, var(--transition-sm))
      var(--auth-theme-transition-ease, ease-out);
}

.auth-shader-backdrop__blueprint {
  position: absolute;
  width: min(460px, 36vw);
  height: min(300px, 32vh);
  border: 1px solid rgb(var(--foreground) / var(--auth-backdrop-blueprint));
  border-radius: var(--radius-lg);
  opacity: 0.58;
  background-image:
    linear-gradient(rgb(var(--foreground) / var(--auth-backdrop-blueprint)) 1px, transparent 1px),
    linear-gradient(
      90deg,
      rgb(var(--foreground) / var(--auth-backdrop-blueprint)) 1px,
      transparent 1px
    ),
    linear-gradient(
      180deg,
      transparent,
      rgb(var(--info) / var(--auth-backdrop-blueprint)),
      transparent
    );
  background-size:
    34px 34px,
    34px 34px,
    100% 100%;
  box-shadow:
    inset 0 1px 0 rgb(var(--foreground) / 4%),
    0 0 var(--spacing-4xl) rgb(var(--info) / 6%);
  transition:
    border-color var(--auth-theme-transition-duration, var(--transition-sm))
      var(--auth-theme-transition-ease, ease-out),
    box-shadow var(--auth-theme-transition-duration, var(--transition-sm))
      var(--auth-theme-transition-ease, ease-out),
    opacity var(--auth-theme-transition-duration, var(--transition-sm))
      var(--auth-theme-transition-ease, ease-out),
    filter var(--auth-theme-transition-duration, var(--transition-sm))
      var(--auth-theme-transition-ease, ease-out);
}

.auth-shader-backdrop__blueprint--left {
  left: -8%;
  bottom: 10%;
}

.auth-shader-backdrop__blueprint--right {
  right: 4%;
  bottom: 18%;
}

.auth-shader-backdrop__ice-panel {
  position: absolute;
  border: 1px solid rgb(var(--foreground) / 10%);
  background:
    radial-gradient(circle at 22% 18%, rgb(var(--background) / 64%), transparent 18%),
    radial-gradient(
      circle at 78% 82%,
      rgb(var(--auth-accent-r) var(--auth-accent-g) var(--auth-accent-b) / 14%),
      transparent 32%
    ),
    linear-gradient(180deg, rgb(var(--card) / 38%), rgb(var(--background) / 12%));
  box-shadow:
    inset 0 1px 0 rgb(var(--foreground) / 8%),
    inset 0 -1px 0 rgb(var(--auth-primary-r) var(--auth-primary-g) var(--auth-primary-b) / 10%),
    0 var(--spacing-lg) var(--spacing-5xl)
      rgb(var(--auth-primary-r) var(--auth-primary-g) var(--auth-primary-b) / 9%);
  backdrop-filter: blur(28px) saturate(1.18);
  transition:
    border-color var(--auth-theme-transition-duration, var(--transition-sm))
      var(--auth-theme-transition-ease, ease-out),
    box-shadow var(--auth-theme-transition-duration, var(--transition-sm))
      var(--auth-theme-transition-ease, ease-out),
    opacity var(--auth-theme-transition-duration, var(--transition-sm))
      var(--auth-theme-transition-ease, ease-out),
    filter var(--auth-theme-transition-duration, var(--transition-sm))
      var(--auth-theme-transition-ease, ease-out);
}

.auth-shader-backdrop__ice-panel--left {
  left: -13%;
  bottom: -18%;
  width: min(560px, 40vw);
  height: min(430px, 42vh);
  border-radius: 52% 48% 45% 55% / 42% 52% 48% 58%;
}

.auth-shader-backdrop__ice-panel--right {
  top: 9%;
  right: -10%;
  width: min(520px, 37vw);
  height: min(380px, 38vh);
  border-radius: 58% 42% 54% 46% / 44% 58% 42% 56%;
}

.auth-shader-backdrop__card-glow {
  position: absolute;
  top: 9%;
  left: 0;
  right: 0;
  width: min(660px, 76vw);
  height: min(760px, 80vh);
  margin-inline: auto;
  border-radius: var(--radius-2xl);
  background:
    radial-gradient(
      ellipse at 48% 38%,
      rgb(var(--auth-primary-r) var(--auth-primary-g) var(--auth-primary-b) / 12%),
      transparent 54%
    ),
    radial-gradient(
      ellipse at 66% 78%,
      rgb(var(--auth-accent-r) var(--auth-accent-g) var(--auth-accent-b) / 10%),
      transparent 58%
    ),
    radial-gradient(ellipse at 30% 82%, rgb(var(--info) / 8%), transparent 48%);
  filter: blur(48px);
  opacity: 0.88;
  transition:
    opacity var(--auth-theme-transition-duration, var(--transition-sm))
      var(--auth-theme-transition-ease, ease-out),
    filter var(--auth-theme-transition-duration, var(--transition-sm))
      var(--auth-theme-transition-ease, ease-out);
}

:global(.dark) .auth-shader-backdrop__card-glow {
  background:
    radial-gradient(
      ellipse at 48% 40%,
      rgb(var(--auth-primary-r) var(--auth-primary-g) var(--auth-primary-b) / 14%),
      transparent 54%
    ),
    radial-gradient(
      ellipse at 72% 76%,
      rgb(var(--auth-accent-r) var(--auth-accent-g) var(--auth-accent-b) / 14%),
      transparent 56%
    ),
    radial-gradient(ellipse at 30% 82%, rgb(var(--info) / 10%), transparent 48%);
  opacity: 0.76;
}

.auth-shader-backdrop__bubble {
  position: absolute;
  border: 1px solid rgb(var(--foreground) / var(--auth-backdrop-bubble-border));
  background:
    radial-gradient(
      circle at 28% 22%,
      rgb(var(--background) / var(--auth-backdrop-highlight)),
      transparent 16%
    ),
    radial-gradient(
      circle at 68% 74%,
      rgb(var(--auth-accent-r) var(--auth-accent-g) var(--auth-accent-b) / 18%),
      transparent 32%
    ),
    radial-gradient(circle at 72% 20%, rgb(var(--info) / 12%), transparent 28%),
    linear-gradient(
      180deg,
      rgb(var(--card) / var(--auth-backdrop-bubble)),
      rgb(var(--background) / 8%)
    );
  box-shadow:
    inset 0 1px 0 rgb(var(--foreground) / 12%),
    inset 0 -1px 0 rgb(var(--auth-primary-r) var(--auth-primary-g) var(--auth-primary-b) / 14%),
    0 var(--spacing-md) var(--spacing-5xl)
      rgb(
        var(--auth-primary-r) var(--auth-primary-g) var(--auth-primary-b) /
          var(--auth-backdrop-bubble-shadow)
      );
  backdrop-filter: blur(18px) saturate(1.24);
  transition:
    border-color var(--auth-theme-transition-duration, var(--transition-sm))
      var(--auth-theme-transition-ease, ease-out),
    box-shadow var(--auth-theme-transition-duration, var(--transition-sm))
      var(--auth-theme-transition-ease, ease-out),
    opacity var(--auth-theme-transition-duration, var(--transition-sm))
      var(--auth-theme-transition-ease, ease-out),
    filter var(--auth-theme-transition-duration, var(--transition-sm))
      var(--auth-theme-transition-ease, ease-out);
}

.auth-shader-backdrop__bubble::after {
  position: absolute;
  top: 14%;
  left: 16%;
  width: 30%;
  height: 18%;
  content: '';
  border-radius: var(--radius-5xl);
  background: rgb(var(--background) / 38%);
  filter: blur(8px);
  transition:
    background-color var(--auth-theme-transition-duration, var(--transition-sm))
      var(--auth-theme-transition-ease, ease-out),
    filter var(--auth-theme-transition-duration, var(--transition-sm))
      var(--auth-theme-transition-ease, ease-out),
    opacity var(--auth-theme-transition-duration, var(--transition-sm))
      var(--auth-theme-transition-ease, ease-out);
}

.auth-shader-backdrop__bubble--large {
  left: 5%;
  top: 15%;
  width: min(140px, 12vw);
  aspect-ratio: 1;
  border-radius: 48% 52% 46% 54% / 54% 44% 56% 46%;
}

.auth-shader-backdrop__bubble--wide {
  right: 12%;
  top: 16%;
  width: min(380px, 28vw);
  height: min(190px, 20vh);
  border-radius: 58% 42% 54% 46% / 42% 56% 44% 58%;
}

.auth-shader-backdrop__bubble--pearl {
  right: 8%;
  bottom: 20%;
  width: min(130px, 10vw);
  aspect-ratio: 1;
  border-radius: 52% 48% 50% 50% / 46% 54% 48% 52%;
}

.auth-shader-backdrop__bubble--drop {
  left: 16%;
  bottom: 12%;
  width: min(170px, 14vw);
  height: min(230px, 24vh);
  border-radius: 58% 42% 50% 50% / 66% 48% 52% 34%;
}

.auth-shader-backdrop__glow {
  position: absolute;
  border-radius: var(--radius-5xl);
  filter: blur(92px);
  pointer-events: none;
  opacity: 0.3;
  transition:
    opacity var(--auth-theme-transition-duration, var(--transition-sm))
      var(--auth-theme-transition-ease, ease-out),
    filter var(--auth-theme-transition-duration, var(--transition-sm))
      var(--auth-theme-transition-ease, ease-out);
}

.auth-shader-backdrop__glow--primary {
  top: 18%;
  left: 30%;
  width: 360px;
  height: 360px;
  background: radial-gradient(
    circle,
    rgb(var(--auth-primary-r) var(--auth-primary-g) var(--auth-primary-b) / 11%),
    transparent 70%
  );
}

.auth-shader-backdrop__glow--accent {
  right: 18%;
  bottom: 10%;
  width: 360px;
  height: 360px;
  background: radial-gradient(
    circle,
    rgb(var(--auth-accent-r) var(--auth-accent-g) var(--auth-accent-b) / 11%),
    transparent 70%
  );
}

@media (width <= 768px) {
  .auth-shader-backdrop {
    --auth-backdrop-primary: 13%;
    --auth-backdrop-accent: 7%;
    --auth-backdrop-bubble-border: 20%;
  }

  .auth-shader-backdrop__grid {
    background-size:
      48px 48px,
      48px 48px;
    mask-image: linear-gradient(rgb(var(--foreground)), transparent 92%);
  }

  .auth-shader-backdrop__blueprint--right,
  .auth-shader-backdrop__ice-panel--right,
  .auth-shader-backdrop__bubble--large,
  .auth-shader-backdrop__glow--accent {
    display: none;
  }

  .auth-shader-backdrop__blueprint--left {
    left: -34%;
    bottom: 8%;
    width: 380px;
    height: 240px;
    opacity: 0.42;
  }

  .auth-shader-backdrop__card-glow {
    top: 20%;
    width: min(360px, 92vw);
    height: 620px;
    filter: blur(38px);
  }

  .auth-shader-backdrop__ice-panel--left {
    left: -48%;
    bottom: -18%;
    width: 420px;
    height: 360px;
  }

  .auth-shader-backdrop__bubble--wide {
    right: -38%;
    top: -4%;
    width: 340px;
    height: 250px;
  }

  .auth-shader-backdrop__bubble--pearl {
    right: -4%;
    bottom: 3%;
    width: 92px;
  }

  .auth-shader-backdrop__bubble--drop {
    left: -16%;
    bottom: 8%;
    width: 150px;
    height: 210px;
  }

  .auth-shader-backdrop__glow--primary {
    top: 6%;
    left: 4%;
    width: 320px;
    height: 320px;
  }
}
</style>
