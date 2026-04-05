<script setup lang="ts">
defineOptions({ name: 'ArchitectureStoreLocale' })

const { locale, currentLocale, isChineseLang, isRTL, supportedLocales, switchLocale } = useLocale()
const localeStore = useLocaleStore()

const pageReady = ref<boolean>(true)
const switching = ref(false)

async function onSwitch(key: typeof locale.value): Promise<void> {
  if (switching.value) return
  switching.value = true
  try {
    await switchLocale(key)
  } finally {
    switching.value = false
  }
}
</script>

<template>
  <div
    class="col-stretch"
    data-archetype="A1-toolbar-content"
  >
    <AnimateWrapper
      :show="pageReady"
      enter="fadeInUp"
      leave="fadeOut"
    >
      <div class="col-stretch gap-md min-h-0 min-w-0">
        <div class="layout-narrow col-stretch gap-md min-w-0">
          <header class="shrink-0 glass-panel col-stretch gap-md min-w-0">
            <div class="row-between gap-md min-w-0">
              <div class="row-start gap-sm min-w-0 flex-wrap">
                <div class="glass-icon-box shrink-0">
                  <Icons
                    name="i-lucide-languages"
                    size="xl"
                    class="text-primary"
                  />
                </div>
                <div class="col-stretch gap-xs min-w-0">
                  <div class="row-start gap-xs min-w-0 flex-wrap">
                    <span class="text-lg font-bold text-foreground text-no-wrap">Locale Store</span>
                    <span
                      class="surface-primary rounded-md px-sm py-xs text-xs font-semibold uppercase"
                    >
                      STORE
                    </span>
                  </div>
                  <span class="text-sm text-muted-foreground text-ellipsis-1">
                    国际化语言切换 — via useLocale().switchLocale()
                  </span>
                </div>
              </div>
              <div class="row-center gap-sm shrink-0">
                <Tag
                  :value="`locale: ${locale}`"
                  severity="secondary"
                />
                <Tag
                  :value="switching ? 'switching…' : 'idle'"
                  :severity="switching ? 'warn' : 'success'"
                />
              </div>
            </div>

            <div class="col-stretch gap-md min-w-0">
              <div class="row-between min-w-0">
                <span class="text-sm text-muted-foreground">Current Language</span>
                <Tag
                  :value="currentLocale?.name ?? '—'"
                  severity="primary"
                />
              </div>
              <div class="row-start flex-wrap gap-sm">
                <Button
                  v-for="loc in supportedLocales"
                  :key="loc.key"
                  :label="`${loc.flag} ${loc.name}`"
                  size="small"
                  :severity="locale === loc.key ? 'primary' : 'secondary'"
                  :loading="switching"
                  @click="onSwitch(loc.key)"
                />
              </div>
            </div>
          </header>

          <section class="glass-card col-stretch gap-md min-w-0">
            <div class="row-between gap-sm min-w-0 shrink-0">
              <div class="row-start gap-xs min-w-0">
                <Icons
                  name="i-lucide-settings"
                  size="sm"
                  class="text-muted-foreground"
                />
                <span class="text-sm font-semibold text-foreground text-no-wrap">
                  Store Details
                </span>
              </div>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-md min-w-0">
              <div class="col-stretch gap-sm min-w-0">
                <div class="row-between">
                  <span class="text-sm text-muted-foreground">isChineseLang</span>
                  <Tag
                    :value="`${isChineseLang}`"
                    :severity="isChineseLang ? 'success' : 'secondary'"
                  />
                </div>
                <div class="row-between">
                  <span class="text-sm text-muted-foreground">isRTL</span>
                  <Tag
                    :value="`${isRTL}`"
                    :severity="isRTL ? 'warn' : 'secondary'"
                  />
                </div>
                <div class="row-between">
                  <span class="text-sm text-muted-foreground">followTimezone</span>
                  <Tag
                    :value="`${localeStore.isFollowTimezone}`"
                    severity="info"
                  />
                </div>
                <div class="row-between">
                  <span class="text-sm text-muted-foreground">loading</span>
                  <Tag
                    :value="`${localeStore.loading}`"
                    :severity="localeStore.loading ? 'warn' : 'secondary'"
                  />
                </div>
              </div>
              <div class="col-stretch gap-sm min-w-0">
                <span class="text-sm text-muted-foreground">Available Locales</span>
                <div class="row-start flex-wrap gap-xs">
                  <Tag
                    v-for="loc in supportedLocales"
                    :key="loc.key"
                    :value="`${loc.flag} ${loc.key} (${loc.direction})`"
                    :severity="locale === loc.key ? 'primary' : 'secondary'"
                  />
                </div>
              </div>
            </div>
            <p class="text-sm text-muted-foreground m-0">
              switchLocale() 同步更新 Store → 派发 mitt localeChange 事件 → 通知 i18n 刷新翻译。
              开启 followTimezone 时，语言切换同步调整时区。
            </p>
          </section>
        </div>
      </div>
    </AnimateWrapper>
  </div>
</template>
