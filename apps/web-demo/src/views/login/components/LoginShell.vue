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
    <div
      class="login-shell__mobile-brand col-center"
      aria-hidden="true"
    >
      <span class="login-shell__mobile-mark">CCD</span>
    </div>

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
  position: relative;
  gap: var(--spacing-md);
  min-height: min(760px, calc(100dvh - var(--safe-top) - var(--safe-bottom) - var(--spacing-xl)));
}

.login-shell {
  width: min(780px, 100%);
}

.login-shell__mobile-brand {
  display: none;
}

.login-shell__form {
  position: absolute;
  top: 50%;
  left: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  transform: translate(-50%, -50%);
}

.login-shell__form-frame {
  width: 100%;
  max-width: 540px;
}

.login-shell__visual {
  position: absolute;
  top: calc(50% + 330px);
  left: 50%;
  width: min(100%, 520px);
  transform: translateX(-50%);
}

.login-shell--compact .login-shell__inner {
  gap: var(--spacing-sm);
}

.login-shell--compact .login-shell__visual {
  top: calc(50% + 310px);
}

.login-shell--tablet {
  max-width: 620px;
}

.login-shell--tablet .login-shell__form-frame,
.login-shell--mobile .login-shell__form-frame {
  max-width: 520px;
}

.login-shell--mobile .login-shell__inner {
  position: static;
  gap: calc(var(--spacing-lg) + var(--spacing-xs));
  min-height: 0;
}

.login-shell--mobile {
  width: min(366px, calc(100vw - var(--spacing-2xl)));
  padding-top: var(--spacing-2xl);
}

.login-shell--mobile .login-shell__mobile-brand {
  display: flex;
  gap: var(--spacing-xs);
  margin-bottom: calc(var(--spacing-lg) + var(--spacing-xs));
}

.login-shell__mobile-mark {
  color: rgb(var(--foreground) / 94%);
  font-size: var(--font-size-2xl);
  font-weight: 800;
  letter-spacing: 0;
  line-height: 1;
}

:global(.dark) .login-shell__mobile-mark {
  color: rgb(var(--card-foreground) / 92%);
}

.login-shell--mobile .login-shell__form-frame {
  max-width: 100%;
}

.login-shell--mobile .login-shell__visual {
  position: static;
  width: 100%;
  transform: none;
}

.login-shell--mobile .login-shell__form {
  position: static;
  transform: none;
}
</style>
