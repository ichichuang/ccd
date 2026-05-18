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

watch(transitionMode, nextMode => {
  transitionModeDraft.value = nextMode
})

const transitionOptions = computed(() => [
  { label: 'curtain', value: 'curtain' as ThemeTransitionMode, icon: 'i-lucide-panel-left' },
  { label: 'diamond', value: 'diamond' as ThemeTransitionMode, icon: 'i-lucide-diamond' },
  { label: 'fade', value: 'fade' as ThemeTransitionMode, icon: 'i-lucide-sun-moon' },
  { label: 'glitch', value: 'glitch' as ThemeTransitionMode, icon: 'i-lucide-sparkles' },
  { label: 'implosion', value: 'implosion' as ThemeTransitionMode, icon: 'i-lucide-minimize-2' },
  { label: 'circle', value: 'circle' as ThemeTransitionMode, icon: 'i-lucide-circle-dot' },
])

const runToggleWithAnimation = async () => {
  await toggleThemeWithAnimation(null, transitionModeDraft.value)
}

const runSetWithAnimation = async (targetMode: ThemeMode) => {
  await setThemeWithAnimation(targetMode, null, transitionModeDraft.value)
}
</script>

<template>
  <div
    id="use-theme-switch-page"
    class="col-stretch"
    data-archetype="A1-toolbar-content"
  >
    <div class="col-stretch gap-md min-h-0 min-w-0">
      <div class="layout-narrow col-stretch gap-md min-w-0">
        <header class="shrink-0 glass-panel col-stretch gap-md min-w-0">
          <div class="row-between gap-md min-w-0">
            <div class="row-start gap-sm min-w-0 flex-wrap">
              <div class="glass-icon-box shrink-0">
                <Icons
                  name="i-lucide-moon-star"
                  size="xl"
                  class="text-primary"
                />
              </div>
              <div class="col-stretch gap-xs min-w-0">
                <div class="row-start gap-xs min-w-0 flex-wrap">
                  <span class="text-lg font-bold text-foreground text-no-wrap">useThemeSwitch</span>
                  <span
                    class="surface-success rounded-md px-sm py-xs text-xs font-semibold uppercase"
                  >
                    HOOK
                  </span>
                </div>
                <span class="text-sm text-muted-foreground text-ellipsis-1">
                  验证 mode / isDark / transitionMode 与动画切换逻辑
                </span>
              </div>
            </div>
            <div class="row-center gap-sm min-w-0">
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

          <div class="col-stretch gap-md min-w-0">
            <div class="row-between min-w-0">
              <span class="text-sm text-muted-foreground">Current State</span>
              <Tag
                :value="`transitionMode=${transitionMode}`"
                severity="secondary"
              />
            </div>
          </div>
        </header>

        <section class="material-elevated col-stretch gap-md min-w-0">
          <div class="row-between min-w-0">
            <h3 class="text-md font-semibold text-foreground m-0">Action Triggers</h3>
            <span class="text-sm text-muted-foreground">无动画 / 带动画</span>
          </div>

          <div class="col-stretch gap-md min-w-0">
            <div class="col-stretch gap-sm min-w-0">
              <div class="text-sm text-muted-foreground">无动画切换</div>
              <div class="row-start flex-wrap gap-sm min-w-0">
                <Button
                  size="small"
                  severity="secondary"
                  label="toggleMode()"
                  @click="toggleMode"
                />
                <Button
                  id="theme-mode-light-direct"
                  size="small"
                  severity="secondary"
                  label="setMode(light)"
                  @click="setMode('light')"
                />
                <Button
                  id="theme-mode-dark-direct"
                  size="small"
                  severity="secondary"
                  label="setMode(dark)"
                  @click="setMode('dark')"
                />
                <Button
                  size="small"
                  severity="secondary"
                  label="setMode(auto)"
                  @click="setMode('auto')"
                />
              </div>
              <div class="text-sm text-muted-foreground">
                nextMode（排除 auto）: {{ getNextMode() }}
              </div>
            </div>

            <div class="col-stretch gap-sm min-w-0">
              <div class="text-sm text-muted-foreground">带动画切换</div>
              <div class="row-start flex-wrap gap-sm items-center min-w-0">
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
              <div class="row-start flex-wrap gap-sm min-w-0">
                <Button
                  id="theme-toggle-animated"
                  size="small"
                  severity="primary"
                  label="toggleThemeWithAnimation()"
                  @click="runToggleWithAnimation"
                />
                <Button
                  id="theme-mode-light-animated"
                  size="small"
                  severity="secondary"
                  label="setThemeWithAnimation('light')"
                  @click="runSetWithAnimation('light')"
                />
                <Button
                  id="theme-mode-dark-animated"
                  size="small"
                  severity="secondary"
                  label="setThemeWithAnimation('dark')"
                  @click="runSetWithAnimation('dark')"
                />
                <Button
                  id="theme-mode-auto-animated"
                  size="small"
                  severity="secondary"
                  label="setThemeWithAnimation('auto')"
                  @click="runSetWithAnimation('auto')"
                />
              </div>
              <div class="text-sm text-muted-foreground">
                当 isAnimating=true 时，请求会按“最新一次为准”排队，避免快速反向点击被吞掉。
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  </div>
</template>
