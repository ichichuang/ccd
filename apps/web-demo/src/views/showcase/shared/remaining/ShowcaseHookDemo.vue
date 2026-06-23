<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import ShowcaseCard from '../ShowcaseCard.vue'
import ShowcaseEmptyState from '../ShowcaseEmptyState.vue'
import ShowcaseSection from '../ShowcaseSection.vue'
import ShowcaseToolbar from '../ShowcaseToolbar.vue'

type HookDemoKind =
  | 'theme-switching'
  | 'locale-switching'
  | 'http-flow'
  | 'auth-permission'
  | 'layout-runtime'
  | 'responsive-device'

type HookRowKey =
  | 'theme'
  | 'transition'
  | 'locale'
  | 'layout'
  | 'device'
  | 'breakpoint'
  | 'orientation'
  | 'permission'

type HookActionKind = 'locale' | 'none' | 'theme'

interface HookDemoConfig {
  action: HookActionKind
  icon: `i-${string}`
}

interface HookRow {
  key: HookRowKey
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

const hookDemoKinds: readonly HookDemoKind[] = [
  'theme-switching',
  'locale-switching',
  'http-flow',
  'auth-permission',
  'layout-runtime',
  'responsive-device',
]

const hookConfigs: Record<HookDemoKind, HookDemoConfig> = {
  'theme-switching': {
    action: 'theme',
    icon: 'i-lucide-moon-star',
  },
  'locale-switching': {
    action: 'locale',
    icon: 'i-lucide-languages',
  },
  'http-flow': {
    action: 'none',
    icon: 'i-lucide-webhook',
  },
  'auth-permission': {
    action: 'none',
    icon: 'i-lucide-shield-check',
  },
  'layout-runtime': {
    action: 'none',
    icon: 'i-lucide-layout-dashboard',
  },
  'responsive-device': {
    action: 'none',
    icon: 'i-lucide-monitor-smartphone',
  },
}

const actionButtonPt = {
  root: {
    class:
      'ring-focus-focus focus:!outline-solid focus:!outline-2 focus:!outline-ring focus:!outline-offset-2',
  },
}

const activeLocale = computed(() => localeRuntime.locale.value)
const currentHook = computed<HookDemoKind>(() => {
  const candidate = props.kind.replace('hook-', '')
  return isHookDemoKind(candidate) ? candidate : 'theme-switching'
})
const currentConfig = computed(() => hookConfigs[currentHook.value])
const currentHookBadge = computed(() => t(`showcase.remaining.hooks.badges.${currentHook.value}`))
const hasAction = computed(() => currentConfig.value.action !== 'none')
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
    key: 'transition',
    labelKey: 'showcase.remaining.hooks.transitionMode',
    value: theme.transitionMode.value,
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
    key: 'device',
    labelKey: 'showcase.remaining.hooks.deviceType',
    value: layout.deviceType.value,
  },
  {
    key: 'breakpoint',
    labelKey: 'showcase.remaining.hooks.breakpoint',
    value: layout.breakpoint.value,
  },
  {
    key: 'orientation',
    labelKey: 'showcase.remaining.hooks.orientation',
    value: layout.orientation.value,
  },
  {
    key: 'permission',
    labelKey: 'showcase.remaining.hooks.permission',
    value: permissionLabel.value,
  },
])

function isHookDemoKind(value: string): value is HookDemoKind {
  return hookDemoKinds.some(kind => kind === value)
}

async function toggleTheme(event: MouseEvent): Promise<void> {
  await theme.toggleThemeWithAnimation(event)
}

async function toggleLocale(): Promise<void> {
  await localeRuntime.switchLocale(activeLocale.value === 'zh-CN' ? 'en-US' : 'zh-CN')
}
</script>

<template>
  <section
    class="col-stretch min-w-0 gap-lg"
    data-testid="showcase-hooks-demo"
  >
    <ShowcaseToolbar
      :title="$t('showcase.remaining.hooks.toolbarTitle')"
      :description="$t('showcase.remaining.hooks.toolbarDescription')"
      :summary="$t(`showcase.remaining.hooks.${currentHook}.description`)"
      data-testid="showcase-hooks-action-toolbar"
    >
      <template #actions>
        <Button
          v-if="currentConfig.action === 'theme'"
          :label="$t('showcase.remaining.hooks.toggleTheme')"
          icon="i-lucide-moon-star"
          severity="primary"
          :loading="theme.isAnimating.value"
          :pt="actionButtonPt"
          data-testid="showcase-hooks-toggle-theme"
          @click="toggleTheme"
        />
        <Button
          v-if="currentConfig.action === 'locale'"
          :label="$t('showcase.remaining.hooks.toggleLocale')"
          icon="i-lucide-languages"
          severity="primary"
          :pt="actionButtonPt"
          data-testid="showcase-hooks-toggle-locale"
          @click="toggleLocale"
        />
        <Tag
          :value="currentHookBadge"
          severity="info"
        />
      </template>

      <ShowcaseEmptyState
        v-if="!hasAction"
        icon="i-lucide-eye"
        :title="$t('showcase.remaining.hooks.readOnlyTitle')"
        :description="$t('showcase.remaining.hooks.readOnlyDescription')"
        data-testid="showcase-hooks-readonly-actions"
      />
    </ShowcaseToolbar>

    <div class="grid min-w-0 grid-cols-1 gap-md xl:grid-cols-2">
      <ShowcaseCard
        :icon="currentConfig.icon"
        :title="$t(`showcase.remaining.hooks.${currentHook}.title`)"
        :description="$t('showcase.remaining.hooks.intentDescription')"
        :tag="currentHookBadge"
        data-testid="showcase-hooks-intent-card"
      >
        <p class="text-sm text-muted-foreground m-0">
          {{ $t(`showcase.remaining.hooks.${currentHook}.description`) }}
        </p>
      </ShowcaseCard>

      <ShowcaseCard
        icon="i-lucide-activity"
        :title="$t('showcase.remaining.hooks.stateTitle')"
        :description="$t('showcase.remaining.hooks.stateDescription')"
        data-testid="showcase-hooks-state-panel"
      >
        <dl
          class="grid min-w-0 grid-cols-1 gap-sm md:grid-cols-2"
          aria-live="polite"
        >
          <div
            v-for="row in rows"
            :key="row.key"
            class="demo-well row-between min-w-0 gap-sm"
          >
            <dt class="text-sm text-muted-foreground">
              {{ $t(row.labelKey) }}
            </dt>
            <dd
              class="code-inline m-0 min-w-0 break-words text-right text-sm font-semibold text-foreground"
              :data-testid="`showcase-hooks-state-${row.key}`"
            >
              {{ row.value }}
            </dd>
          </div>
        </dl>
      </ShowcaseCard>
    </div>

    <ShowcaseSection
      :title="$t('showcase.remaining.hooks.contractTitle')"
      :description="$t('showcase.remaining.hooks.contractDescription')"
      icon="i-lucide-badge-check"
      data-testid="showcase-hooks-contract"
    >
      <div class="grid min-w-0 grid-cols-1 gap-md lg:grid-cols-3">
        <ShowcaseCard
          icon="i-lucide-route"
          :title="$t('showcase.remaining.hooks.contractRuntimeTitle')"
          :description="$t('showcase.remaining.hooks.contractRuntimeDescription')"
          :tag="$t('showcase.remaining.tags.technical')"
        />
        <ShowcaseCard
          icon="i-lucide-braces"
          :title="$t('showcase.remaining.hooks.contractStateTitle')"
          :description="$t('showcase.remaining.hooks.contractStateDescription')"
          :tag="$t('showcase.remaining.tags.technical')"
        />
        <ShowcaseCard
          icon="i-lucide-folder-code"
          :title="$t('showcase.remaining.hooks.contractEvidenceTitle')"
          :description="$t('showcase.remaining.hooks.contractEvidenceDescription')"
          :tag="$t('showcase.remaining.tags.technical')"
        />
      </div>
    </ShowcaseSection>
  </section>
</template>
