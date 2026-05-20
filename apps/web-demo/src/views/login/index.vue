<script setup lang="ts">
import { BREAKPOINTS } from '@ccd/design-tokens'
import { useDeviceStore } from '@/stores/modules/system'
import HeaderActions from './components/HeaderActions.vue'
import BrandPanel from './components/BrandPanel.vue'
import LoginForm from './components/LoginForm.vue'
import LoginShell from './components/LoginShell.vue'
import type { LoginLayoutMode, LoginResponsiveState } from './types'

const deviceStore = useDeviceStore()

const viewportWidth = computed(() => deviceStore.width)
const viewportHeight = computed(() => deviceStore.height)
const isLandscape = computed(() => viewportWidth.value >= viewportHeight.value)
const isCompactHeight = computed(() => viewportHeight.value <= 760)

const layoutMode = computed<LoginLayoutMode>(() => {
  if (viewportWidth.value < BREAKPOINTS.md) return 'mobile'
  if (viewportWidth.value < BREAKPOINTS.lg)
    return isLandscape.value ? 'tabletLandscape' : 'tabletPortrait'
  if (!isLandscape.value || viewportHeight.value < 820) return 'desktopPortrait'
  return 'desktopLandscape'
})

const responsiveState = computed<LoginResponsiveState>(() => {
  const mode = layoutMode.value
  const compactHeight = isCompactHeight.value
  const compactColumn = mode === 'tabletPortrait' || mode === 'mobile'
  const compactTwoColumn = mode === 'desktopPortrait' || mode === 'tabletLandscape'
  const fullBrand = mode === 'desktopLandscape' && !compactHeight

  return {
    mode,
    compactHeight,
    showFullBrand: fullBrand,
    showCompactBrand: compactTwoColumn,
    showBrandSummary: compactColumn,
    showFeatureCards: fullBrand && viewportHeight.value >= 780,
    showArchitectureStrip: fullBrand && viewportHeight.value >= 860,
    showQuickRoles: viewportHeight.value >= 720 && mode !== 'mobile',
    compactForm: compactHeight || compactColumn || compactTwoColumn,
  }
})

const pageChromeClass = computed(() =>
  responsiveState.value.compactForm ? 'px-sm pb-sm pt-3xl sm:px-md' : 'px-lg pb-lg pt-3xl'
)

function preventDecorativeSelection(event: Event): void {
  const target = event.target
  if (!(target instanceof HTMLElement)) return
  if (target.closest('input, textarea, [contenteditable="true"]')) return
  event.preventDefault()
}

defineOptions({ name: 'LoginPage' })
</script>

<template>
  <main
    class="relative h-100dvh max-h-100dvh w-full select-none overflow-hidden bg-muted/30 text-foreground"
    @selectstart="preventDecorativeSelection"
  >
    <div class="absolute inset-0 pointer-events-none">
      <div class="absolute left-0 top-0 h-1/2 w-1/2 rounded-full bg-primary/6 blur-3xl" />
      <div class="absolute bottom-0 right-0 h-1/2 w-1/2 rounded-full bg-info/6 blur-3xl" />
      <div class="absolute-center h-2/3 w-2/3 rounded-full bg-card/50 blur-3xl" />
    </div>

    <HeaderActions :compact="responsiveState.compactForm" />

    <div
      class="relative z-content h-100dvh max-h-100dvh min-w-0 col-center"
      :class="pageChromeClass"
    >
      <LoginShell :responsive="responsiveState">
        <BrandPanel :responsive="responsiveState" />
        <LoginForm :responsive="responsiveState" />
      </LoginShell>
    </div>
  </main>
</template>
