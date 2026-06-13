<script setup lang="ts">
import type { LoginResponsiveState } from '../types'

defineOptions({ name: 'LoginShell' })

defineProps<{
  responsive: LoginResponsiveState
}>()
</script>

<template>
  <section
    id="login-shell"
    class="login-shell relative w-[min(1120px,100%)] overflow-hidden rounded-lg border border-solid border-border/60 bg-card/96 shadow-lg"
    :class="{
      'login-shell--mobile': responsive.isMobile,
      'login-shell--tablet': responsive.isTablet,
      'login-shell--compact': responsive.isCompact,
    }"
    aria-labelledby="login-brand-title"
  >
    <div class="login-shell__surface absolute inset-0 z-base pointer-events-none" />
    <div class="login-shell__inner relative z-content grid">
      <aside class="login-shell__visual min-w-0 border-0 border-solid border-border/55">
        <slot name="visual" />
      </aside>
      <div class="login-shell__form min-w-0 col-center">
        <div class="w-full max-w-[420px]">
          <slot />
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.login-shell {
  max-height: calc(100vh - var(--safe-top) - var(--safe-bottom) - var(--spacing-2xl));
}

.login-shell__surface {
  background:
    linear-gradient(
      180deg,
      rgb(var(--foreground) / 5%) 0%,
      transparent 28%,
      rgb(var(--primary) / 3%) 100%
    ),
    linear-gradient(
      90deg,
      rgb(var(--primary) / 8%) 0%,
      transparent 42%,
      rgb(var(--accent) / 7%) 100%
    );
}

.login-shell__inner {
  grid-template-columns: minmax(0, 1.08fr) minmax(360px, 420px);
  min-height: min(680px, calc(100vh - var(--safe-top) - var(--safe-bottom) - var(--spacing-2xl)));
}

.login-shell__visual {
  padding: var(--spacing-xl);
  border-right-width: 1px;
}

.login-shell__form {
  padding: var(--spacing-xl);
  background: rgb(var(--background) / 36%);
}

.login-shell--compact .login-shell__visual,
.login-shell--compact .login-shell__form {
  padding: var(--spacing-lg);
}

.login-shell--tablet {
  max-width: 840px;
}

.login-shell--tablet .login-shell__inner,
.login-shell--mobile .login-shell__inner {
  grid-template-columns: minmax(0, 1fr);
  min-height: auto;
}

.login-shell--tablet .login-shell__visual,
.login-shell--mobile .login-shell__visual {
  border-right-width: 0;
  border-bottom-width: 1px;
}

.login-shell--tablet .login-shell__form,
.login-shell--mobile .login-shell__form {
  background: rgb(var(--background) / 42%);
}

.login-shell--mobile {
  max-height: none;
}

.login-shell--mobile .login-shell__visual,
.login-shell--mobile .login-shell__form {
  padding: var(--spacing-md);
}
</style>
