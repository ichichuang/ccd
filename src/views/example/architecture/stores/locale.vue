<script setup lang="ts">
defineOptions({ name: 'ArchitectureStoreLocale' })

const { locale, currentLocale, isChineseLang, isRTL, supportedLocales, switchLocale } = useLocale()
const localeStore = useLocaleStore()

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
    class="animate__animated animate__fadeIn col-stretch gap-md"
    data-archetype="A1-toolbar-content"
  >
    <div class="layout-narrow col-stretch gap-md">
      <section class="material-elevated col-stretch gap-md">
        <div class="row-between">
          <div class="col-stretch gap-xs">
            <h2 class="text-lg font-semibold text-foreground m-0">Locale Store</h2>
            <p class="text-sm text-muted-foreground m-0">
              国际化语言切换 — via useLocale().switchLocale()
            </p>
          </div>
          <div class="row-center gap-sm">
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
        <Divider />

        <div class="col-stretch gap-md">
          <div class="row-between">
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
      </section>

      <section class="material-elevated col-stretch gap-md">
        <h3 class="text-md font-semibold text-foreground m-0">Store Details</h3>
        <Divider />
        <div class="grid grid-cols-1 md:grid-cols-2 gap-md">
          <div class="col-stretch gap-sm">
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
          <div class="col-stretch gap-sm">
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
          switchLocale() 同步更新 Store → 派发 mitt localeChange 事件 → 通知 i18n 刷新翻译。 开启
          followTimezone 时，语言切换同步调整时区。
        </p>
      </section>
    </div>
  </div>
</template>
