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
    class="login-shell relative w-[min(1220px,100%)]"
    :class="{
      'login-shell--mobile': responsive.isMobile,
      'login-shell--tablet': responsive.isTablet,
      'login-shell--compact': responsive.isCompact,
    }"
    aria-labelledby="login-brand-title"
  >
    <div class="login-shell__inner grid">
      <aside class="login-shell__visual min-w-0">
        <slot name="visual" />
      </aside>
      <div class="login-shell__form min-w-0">
        <div class="login-shell__form-frame">
          <slot />
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.login-shell__inner {
  align-items: stretch;
  grid-template-columns: minmax(0, 1fr) minmax(380px, 460px);
  gap: var(--spacing-xl);
  min-height: min(700px, calc(100vh - var(--safe-top) - var(--safe-bottom) - var(--spacing-3xl)));
}

.login-shell__form {
  display: flex;
  align-items: center;
  justify-content: center;
}

.login-shell__form-frame {
  width: 100%;
}

.login-shell--compact .login-shell__inner {
  gap: var(--spacing-lg);
}

.login-shell--tablet {
  max-width: 860px;
}

.login-shell--tablet .login-shell__inner,
.login-shell--mobile .login-shell__inner {
  grid-template-columns: minmax(0, 1fr);
  min-height: 0;
}

.login-shell--tablet .login-shell__form-frame,
.login-shell--mobile .login-shell__form-frame {
  max-width: 520px;
}

.login-shell--mobile .login-shell__inner {
  gap: var(--spacing-sm);
}

.login-shell--mobile .login-shell__form-frame {
  max-width: 100%;
}
</style>
