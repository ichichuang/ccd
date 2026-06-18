<script setup lang="ts">
import { useI18n } from 'vue-i18n'

interface HookRow {
  key: string
  labelKey: `showcase.remaining.hooks.${string}`
  value: string
}

defineOptions({ name: 'ShowcaseHookDemo' })

const props = defineProps<{
  kind: string
}>()

const { t } = useI18n()
const theme = useThemeSwitch()
const localeRuntime = useLocale()
const auth = useAuth()
const layout = useLayoutRuntime()

const activeLocale = computed(() => localeRuntime.locale.value)
const currentHook = computed(() => props.kind.replace('hook-', ''))
const permissionLabel = computed(() =>
  auth.hasAuth('*:*:*')
    ? t('showcase.remaining.hooks.permissionAllowed')
    : t('showcase.remaining.hooks.permissionLimited')
)

const rows = computed<HookRow[]>(() => [
  {
    key: 'theme',
    labelKey: 'showcase.remaining.hooks.themeMode',
    value: theme.mode.value,
  },
  {
    key: 'locale',
    labelKey: 'showcase.remaining.hooks.locale',
    value: activeLocale.value,
  },
  {
    key: 'layout',
    labelKey: 'showcase.remaining.hooks.layoutMode',
    value: layout.effectiveMode.value,
  },
  {
    key: 'breakpoint',
    labelKey: 'showcase.remaining.hooks.breakpoint',
    value: layout.breakpoint.value,
  },
  {
    key: 'permission',
    labelKey: 'showcase.remaining.hooks.permission',
    value: permissionLabel.value,
  },
])

async function toggleLocale(): Promise<void> {
  await localeRuntime.switchLocale(activeLocale.value === 'zh-CN' ? 'en-US' : 'zh-CN')
}
</script>

<template>
  <section class="col-stretch min-w-0 gap-md">
    <div class="row-start min-w-0 gap-sm flex-wrap">
      <Button
        v-if="currentHook === 'theme-switching'"
        :label="$t('showcase.remaining.hooks.toggleTheme')"
        severity="primary"
        @click="theme.toggleThemeWithAnimation"
      />
      <Button
        v-if="currentHook === 'locale-switching'"
        :label="$t('showcase.remaining.hooks.toggleLocale')"
        severity="primary"
        @click="toggleLocale"
      />
      <Tag
        :value="$t(`showcase.remaining.hooks.badges.${currentHook}`)"
        severity="info"
      />
    </div>

    <div class="grid min-w-0 grid-cols-1 gap-md md:grid-cols-2 xl:grid-cols-3">
      <article
        v-for="row in rows"
        :key="row.key"
        class="material-solid col-stretch min-w-0 gap-xs p-md"
      >
        <span class="text-sm text-muted-foreground">{{ $t(row.labelKey) }}</span>
        <strong class="text-lg text-foreground font-semibold">{{ row.value }}</strong>
      </article>
    </div>

    <div class="demo-well col-stretch min-w-0 gap-xs">
      <h3 class="text-base font-semibold text-foreground m-0">
        {{ $t(`showcase.remaining.hooks.${currentHook}.title`) }}
      </h3>
      <p class="text-sm text-muted-foreground m-0">
        {{ $t(`showcase.remaining.hooks.${currentHook}.description`) }}
      </p>
    </div>
  </section>
</template>
