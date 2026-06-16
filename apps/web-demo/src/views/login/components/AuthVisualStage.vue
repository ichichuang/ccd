<script setup lang="ts">
import type { LoginResponsiveState } from '../types'
import AuthPalettePicker from './AuthPalettePicker.vue'

defineOptions({ name: 'AuthVisualStage' })

defineProps<{
  responsive: LoginResponsiveState
}>()
</script>

<template>
  <section
    id="auth-visual-stage"
    data-testid="auth-visual-stage"
    class="auth-visual-stage"
    :class="{
      'auth-visual-stage--mobile': responsive.isMobile,
      'auth-visual-stage--tablet': responsive.isTablet,
      'auth-visual-stage--compact': responsive.isCompact,
    }"
  >
    <div class="auth-visual-stage__palette">
      <AuthPalettePicker />
    </div>
  </section>
</template>

<style scoped>
.auth-visual-stage {
  position: relative;
  width: 100%;
  color: rgb(var(--muted-foreground));
  text-align: center;
}

.auth-visual-stage__palette {
  display: flex;
  justify-content: center;
  width: 100%;
}

.auth-visual-stage--compact .auth-visual-stage__palette {
  transform: scale(0.94);
  transform-origin: top center;
}

.auth-visual-stage--mobile .auth-visual-stage__palette {
  transform: scale(0.86);
  transform-origin: top center;
  opacity: 0.78;
}
</style>
