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
    class="login-shell relative"
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
  grid-template-columns: minmax(0, 1.12fr) minmax(430px, 500px);
  gap: clamp(var(--spacing-lg), 4vw, var(--spacing-4xl));
  min-height: min(760px, calc(100dvh - var(--safe-top) - var(--safe-bottom) - var(--spacing-3xl)));
}

.login-shell {
  width: min(1480px, 100%);
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
  max-width: 900px;
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
