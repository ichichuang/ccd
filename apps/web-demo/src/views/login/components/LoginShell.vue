<script setup lang="ts">
import { createScopedGsapContext, gsap, type ScopedGsapContext } from '@/plugins/animation'
import type { LoginResponsiveState } from '../types'

defineOptions({ name: 'LoginShell' })

defineProps<{
  responsive: LoginResponsiveState
}>()

const shellRef = ref<HTMLElement | null>(null)
const preferredReducedMotion = usePreferredReducedMotion()

let entranceMotion: ScopedGsapContext | null = null

onMounted(() => {
  const scope = shellRef.value
  if (!scope) return

  entranceMotion = createScopedGsapContext(
    () => {
      const card = scope.querySelector<HTMLElement>('.auth-login-card')
      const identityItems = Array.from(
        scope.querySelectorAll<HTMLElement>(
          '.auth-login-card__eyebrow, .auth-login-card__title, .auth-login-card__subtitle'
        )
      )
      const headerActions = scope.querySelector<HTMLElement>('.auth-toolbar')
      const formFields = Array.from(scope.querySelectorAll<HTMLElement>('.login-field-shell'))
      const formFooterItems = Array.from(
        scope.querySelectorAll<HTMLElement>('.login-form-options, .login-submit-button')
      )
      const quickAccounts = scope.querySelector<HTMLElement>('.auth-quick-accounts')
      const paletteOrbs = Array.from(scope.querySelectorAll<HTMLElement>('.auth-palette-orb'))

      if (!card) return

      gsap.set([card], { autoAlpha: 0, y: 16, scale: 0.985 })
      if (identityItems.length > 0) gsap.set(identityItems, { autoAlpha: 0, y: 8 })
      if (headerActions) gsap.set(headerActions, { autoAlpha: 0, y: 6 })
      if (formFields.length > 0) gsap.set(formFields, { autoAlpha: 0, y: 8 })
      if (formFooterItems.length > 0) gsap.set(formFooterItems, { autoAlpha: 0, y: 6 })
      if (quickAccounts) gsap.set(quickAccounts, { autoAlpha: 0, y: 6 })
      if (paletteOrbs.length > 0) gsap.set(paletteOrbs, { autoAlpha: 0, y: 4 })

      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } })

      tl.to(card, { autoAlpha: 1, y: 0, scale: 1, duration: 0.72 })

      if (identityItems.length > 0) {
        tl.to(
          identityItems,
          { autoAlpha: 1, y: 0, duration: 0.48, stagger: 0.055, ease: 'sine.out' },
          '-=0.38'
        )
      }

      if (headerActions) {
        tl.to(headerActions, { autoAlpha: 1, y: 0, duration: 0.42, ease: 'sine.out' }, '-=0.28')
      }

      if (formFields.length > 0) {
        tl.to(
          formFields,
          { autoAlpha: 1, y: 0, duration: 0.48, stagger: 0.06, ease: 'sine.out' },
          '-=0.12'
        )
      }

      if (formFooterItems.length > 0) {
        tl.to(
          formFooterItems,
          { autoAlpha: 1, y: 0, duration: 0.42, stagger: 0.05, ease: 'sine.out' },
          '-=0.06'
        )
      }

      if (quickAccounts) {
        tl.to(quickAccounts, { autoAlpha: 1, y: 0, duration: 0.38, ease: 'sine.out' }, '-=0.04')
      }

      if (paletteOrbs.length > 0) {
        tl.to(
          paletteOrbs,
          { autoAlpha: 1, y: 0, duration: 0.32, stagger: 0.04, ease: 'sine.out' },
          '+=0.04'
        )
      }
    },
    {
      scope,
      isReducedMotion: preferredReducedMotion.value === 'reduce',
    }
  )
})

onBeforeUnmount(() => {
  entranceMotion?.revert()
  entranceMotion = null
})
</script>

<template>
  <section
    id="login-shell"
    ref="shellRef"
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
  transition: color var(--auth-theme-transition-duration, var(--transition-sm))
    var(--auth-theme-transition-ease, ease-out);
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
