<script setup lang="ts">
defineOptions({ name: 'UseThemeSwitch' })

const {
  isAnimating,
  isDark,
  mode,
  transitionMode,
  toggleThemeWithAnimation,
  setThemeWithAnimation,
  toggleMode,
  setMode,
  getNextMode,
} = useThemeSwitch()

const transitionModeDraft = ref<ThemeTransitionMode>(transitionMode.value)

const transitionOptions = computed(() => [
  { label: 'curtain', value: 'curtain' as ThemeTransitionMode, icon: 'i-lucide-panel-left' },
  { label: 'diamond', value: 'diamond' as ThemeTransitionMode, icon: 'i-lucide-diamond' },
  { label: 'fade', value: 'fade' as ThemeTransitionMode, icon: 'i-lucide-sun-moon' },
  { label: 'glitch', value: 'glitch' as ThemeTransitionMode, icon: 'i-lucide-sparkles' },
  { label: 'implosion', value: 'implosion' as ThemeTransitionMode, icon: 'i-lucide-minimize-2' },
  { label: 'circle', value: 'circle' as ThemeTransitionMode, icon: 'i-lucide-circle-dot' },
])

const canRun = computed(() => !isAnimating.value)

const runToggleWithAnimation = async () => {
  if (!canRun.value) return
  await toggleThemeWithAnimation(null, transitionModeDraft.value)
}

const runSetWithAnimation = async (targetMode: ThemeMode) => {
  if (!canRun.value) return
  await setThemeWithAnimation(targetMode, null, transitionModeDraft.value)
}
</script>

<template>
  <div
    class="animate__animated animate__fadeIn col-stretch gap-md"
    data-archetype="A1-toolbar-content"
  >
    <div class="layout-narrow col-stretch gap-md">
      <section class="material-elevated col-stretch gap-md">
        <div class="row-between">
          <div class="col-stretch gap-xs">
            <h2 class="text-lg font-semibold text-foreground m-0">useThemeSwitch Demo</h2>
            <p class="text-sm text-muted-foreground m-0">
              验证 mode / isDark / transitionMode 与动画切换逻辑
            </p>
          </div>
          <div class="row-center gap-sm">
            <Tag
              :value="isAnimating ? 'Animating' : 'Idle'"
              :severity="isAnimating ? 'warn' : 'success'"
            />
            <Tag
              :value="`mode=${mode}`"
              severity="secondary"
            />
            <Tag
              :value="isDark ? 'isDark=true' : 'isDark=false'"
              severity="info"
            />
          </div>
        </div>
        <Divider />

        <div class="col-stretch gap-md">
          <div class="row-between">
            <span class="text-sm text-muted-foreground">Current State</span>
            <Tag
              :value="`transitionMode=${transitionMode}`"
              severity="secondary"
            />
          </div>
        </div>
      </section>

      <section class="material-elevated col-stretch gap-md">
        <div class="row-between">
          <h3 class="text-md font-semibold text-foreground m-0">Action Triggers</h3>
          <span class="text-sm text-muted-foreground">无动画 / 带动画</span>
        </div>
        <Divider />

        <div class="col-stretch gap-md">
          <div class="col-stretch gap-sm">
            <div class="text-sm text-muted-foreground">无动画切换</div>
            <div class="row-start flex-wrap gap-sm">
              <Button
                size="small"
                severity="secondary"
                label="toggleMode()"
                :disabled="!canRun"
                @click="toggleMode"
              />
              <Button
                size="small"
                severity="secondary"
                label="setMode(light)"
                :disabled="!canRun"
                @click="setMode('light')"
              />
              <Button
                size="small"
                severity="secondary"
                label="setMode(dark)"
                :disabled="!canRun"
                @click="setMode('dark')"
              />
              <Button
                size="small"
                severity="secondary"
                label="setMode(auto)"
                :disabled="!canRun"
                @click="setMode('auto')"
              />
            </div>
            <div class="text-sm text-muted-foreground">
              nextMode（排除 auto）: {{ getNextMode() }}
            </div>
          </div>

          <Divider />

          <div class="col-stretch gap-sm">
            <div class="text-sm text-muted-foreground">带动画切换</div>
            <div class="row-start flex-wrap gap-sm items-center">
              <Tag
                :value="`transitionModeDraft=${transitionModeDraft}`"
                severity="secondary"
              />
              <SelectButton
                v-model="transitionModeDraft"
                :options="transitionOptions"
                option-label="label"
                option-value="value"
              />
            </div>
            <div class="row-start flex-wrap gap-sm">
              <Button
                size="small"
                severity="primary"
                label="toggleThemeWithAnimation()"
                :disabled="!canRun"
                @click="runToggleWithAnimation"
              />
              <Button
                size="small"
                severity="secondary"
                label="setThemeWithAnimation('light')"
                :disabled="!canRun"
                @click="runSetWithAnimation('light')"
              />
              <Button
                size="small"
                severity="secondary"
                label="setThemeWithAnimation('dark')"
                :disabled="!canRun"
                @click="runSetWithAnimation('dark')"
              />
              <Button
                size="small"
                severity="secondary"
                label="setThemeWithAnimation('auto')"
                :disabled="!canRun"
                @click="runSetWithAnimation('auto')"
              />
            </div>
            <div class="text-sm text-muted-foreground">
              当 isAnimating=true 时按钮会禁用，避免重复触发导致状态错乱。
            </div>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>
