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
    aria-labelledby="login-card-title"
  >
    <div class="login-shell__inner col-center">
      <div class="login-shell__form min-w-0">
        <div class="login-shell__form-frame">
          <slot />
        </div>
      </div>
      <aside class="login-shell__visual min-w-0">
        <slot name="visual" />
      </aside>
    </div>
  </section>
</template>

<style scoped>
.login-shell__inner {
  gap: var(--spacing-lg);
  min-height: min(760px, calc(100dvh - var(--safe-top) - var(--safe-bottom) - var(--spacing-3xl)));
}

.login-shell {
  width: min(720px, 100%);
}

.login-shell__form {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
}

.login-shell__form-frame {
  width: 100%;
  max-width: 500px;
}

.login-shell__visual {
  width: min(100%, 630px);
}

.login-shell--compact .login-shell__inner {
  gap: var(--spacing-md);
}

.login-shell--tablet {
  max-width: 620px;
}

.login-shell--tablet .login-shell__form-frame,
.login-shell--mobile .login-shell__form-frame {
  max-width: 520px;
}

.login-shell--mobile .login-shell__inner {
  gap: var(--spacing-sm);
  min-height: 0;
}

.login-shell--mobile .login-shell__form-frame {
  max-width: 100%;
}

.login-shell--mobile .login-shell__visual {
  width: 100%;
}
</style>
