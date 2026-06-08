<script setup lang="ts">
defineOptions({ name: 'ExampleIcons' })

import type { FlipDirection, IconAnimation, IconSize } from '@ccd/vue-ui'
import type { WritableComputedRef } from 'vue'
import { computed, nextTick, ref, watch } from 'vue'
import IconControls from './components/IconControls.vue'
import {
  CUSTOM_ICONS,
  IS_LITE_MODE,
  LOGOS_ICONS,
  LUCIDE_ICONS,
  PH_ICONS,
  SOLAR_ICONS,
} from './configs/iconLists.generated'

type TabKey = 'lucide' | 'solar' | 'ph' | 'logos' | 'custom'
const TAB_KEYS = ['lucide', 'solar', 'ph', 'logos', 'custom'] as const
const TAB_KEY_SET: ReadonlySet<string> = new Set(TAB_KEYS)

function isTabKey(value: string | number): value is TabKey {
  return typeof value === 'string' && TAB_KEY_SET.has(value)
}

const INITIAL_DISPLAY_COUNT = 80
const LOAD_MORE_STEP = 80

const FALLBACK_ICONS: Record<TabKey, string[]> = {
  lucide: [
    'i-lucide-house',
    'i-lucide-search',
    'i-lucide-settings',
    'i-lucide-user',
    'i-lucide-bell',
    'i-lucide-heart',
    'i-lucide-star',
    'i-lucide-check',
    'i-lucide-x',
    'i-lucide-plus',
    'i-lucide-minus',
    'i-lucide-arrow-right',
  ],
  solar: [
    'i-solar-home-2-linear',
    'i-solar-magnifer-linear',
    'i-solar-settings-linear',
    'i-solar-user-linear',
    'i-solar-bell-linear',
    'i-solar-heart-linear',
  ],
  ph: ['i-ph-house', 'i-ph-magnifying-glass', 'i-ph-gear', 'i-ph-user', 'i-ph-bell', 'i-ph-heart'],
  logos: ['i-logos-vue', 'i-logos-vitejs', 'i-logos-typescript-icon', 'i-logos-playwright'],
  custom: ['i-custom:custom-juejin'],
}

const ICON_COLLECTIONS: Record<TabKey, string[]> = {
  lucide: LUCIDE_ICONS.length ? LUCIDE_ICONS : FALLBACK_ICONS.lucide,
  solar: SOLAR_ICONS.length ? SOLAR_ICONS : FALLBACK_ICONS.solar,
  ph: PH_ICONS.length ? PH_ICONS : FALLBACK_ICONS.ph,
  logos: LOGOS_ICONS.length ? LOGOS_ICONS : FALLBACK_ICONS.logos,
  custom: CUSTOM_ICONS.length ? CUSTOM_ICONS : FALLBACK_ICONS.custom,
}

const activeTab = ref<TabKey>('lucide')
const activeTabModel: WritableComputedRef<string | number> = computed({
  get: () => activeTab.value,
  set: (value: string | number) => {
    if (isTabKey(value)) activeTab.value = value
  },
})
const displayCount = ref(INITIAL_DISPLAY_COUNT)
const selectedIcon = ref('i-lucide-grid-2x2')
const iconSize = ref<IconSize>('md')
const iconColor = ref<string | undefined>(undefined)
const iconAnimation = ref<IconAnimation | undefined>(undefined)
const iconFlip = ref<FlipDirection | undefined>(undefined)
const iconRotate = ref<string | number>('')
const iconScale = ref<number | undefined>(undefined)
const searchKeyword = ref<string | undefined>('')

const CSS_VAR_PATTERN = /^var\(--[a-zA-Z0-9-_]+\)$/
const SEMANTIC_ICON_COLOR_CLASSES = new Set([
  'text-primary',
  'text-foreground',
  'text-muted-foreground',
  'text-info',
  'text-success',
  'text-warn',
  'text-danger',
])
const normalizedIconColor = computed(() => (iconColor.value ?? '').trim())
const isIconColorValid = computed(() => {
  if (!normalizedIconColor.value) return true
  return (
    CSS_VAR_PATTERN.test(normalizedIconColor.value) ||
    SEMANTIC_ICON_COLOR_CLASSES.has(normalizedIconColor.value)
  )
})
const effectiveIconColor = computed(() =>
  normalizedIconColor.value && isIconColorValid.value ? normalizedIconColor.value : undefined
)
const iconColorHint = computed(() => {
  if (!normalizedIconColor.value || isIconColorValid.value) return ''
  return '当前 color 输入不符合 Icons 约束，预览与代码示例已自动忽略该值。'
})

const currentIcons = computed(() => {
  const icons = ICON_COLLECTIONS[activeTab.value]
  const keyword = (searchKeyword.value ?? '').trim().toLowerCase()
  if (!keyword) return icons
  return icons.filter(icon => icon.toLowerCase().includes(keyword))
})
const displayedIcons = computed(() => currentIcons.value.slice(0, displayCount.value))
const hasMoreIcons = computed(() => displayCount.value < currentIcons.value.length)
const selectedIconCountText = computed(() => {
  if (hasMoreIcons.value)
    return `已显示 ${displayedIcons.value.length} / 共 ${currentIcons.value.length} 个`
  return `共 ${currentIcons.value.length} 个图标`
})

const codeExampleText = computed(() => {
  if (!selectedIcon.value || selectedIcon.value === '未选择') return ''
  return `<Icons\n  name="${selectedIcon.value}"\n  size="${iconSize.value}"${effectiveIconColor.value ? `\n  color="${effectiveIconColor.value}"` : ''}${iconAnimation.value ? `\n  animation="${iconAnimation.value}"` : ''}${iconFlip.value ? `\n  flip="${iconFlip.value}"` : ''}${iconRotate.value !== '' ? `\n  rotate="${iconRotate.value}"` : ''}${iconScale.value !== undefined ? `\n  scale="${iconScale.value}"` : ''}\n/>`
})

function loadMore() {
  displayCount.value = Math.min(displayCount.value + LOAD_MORE_STEP, currentIcons.value.length)
}

function resetControls() {
  iconSize.value = 'md'
  iconColor.value = undefined
  iconAnimation.value = undefined
  iconFlip.value = undefined
  iconRotate.value = ''
  iconScale.value = undefined
}

function selectIcon(icon: string) {
  selectedIcon.value = icon
}

async function copyCodeExample() {
  if (!codeExampleText.value) return
  try {
    await navigator.clipboard.writeText(codeExampleText.value)
    window.$message?.success?.('已复制到剪贴板')
  } catch {
    window.$message?.danger?.('复制失败，请检查浏览器剪贴板权限')
  }
}

watch(
  [() => activeTab.value, () => searchKeyword.value],
  () => {
    displayCount.value = INITIAL_DISPLAY_COUNT
    nextTick(() => {
      const icons = currentIcons.value
      if (icons.length > 0) {
        if (!icons.includes(selectedIcon.value)) {
          selectedIcon.value =
            icons.find(icon => FALLBACK_ICONS.lucide.includes(icon)) ?? icons[0] ?? ''
        }
      } else {
        selectedIcon.value = ''
      }
    })
  },
  { immediate: true }
)

watch(activeTab, () => {
  resetControls()
  searchKeyword.value = ''
})
</script>

<template>
  <div
    id="icons-explorer-page"
    class="layout-full p-md col-stretch gap-md overflow-hidden min-w-0"
    data-testid="icons-explorer-page"
  >
    <header class="shrink-0 glass-panel col-stretch gap-md min-w-0">
      <div class="row-between gap-md min-w-0">
        <div class="row-start gap-sm min-w-0 flex-wrap">
          <div class="glass-icon-box shrink-0">
            <Icons
              name="i-lucide-grid-2x2"
              size="xl"
              class="text-primary"
            />
          </div>
          <div class="col-stretch gap-xs min-w-0">
            <div class="row-start gap-xs min-w-0 flex-wrap">
              <span class="text-lg font-bold text-foreground text-no-wrap">Icon Explorer</span>
              <span class="surface-primary rounded-md px-sm py-xs text-xs font-semibold uppercase">
                COMPONENT
              </span>
            </div>
            <span class="text-sm text-muted-foreground text-ellipsis-1">
              展示所有图标库的图标，并提供功能控制面板
            </span>
          </div>
        </div>
        <span
          v-if="IS_LITE_MODE"
          class="surface-muted rounded-md px-sm py-xs text-xs text-muted-foreground shrink-0"
          data-testid="icons-lite-mode"
        >
          Lite 模式
        </span>
      </div>
    </header>

    <section class="material-elevated col-fill gap-md min-w-0 overflow-hidden">
      <div class="shrink-0 col-stretch gap-md min-w-0">
        <Tabs v-model:value="activeTabModel">
          <TabList class="border-0!">
            <Tab value="lucide">Lucide</Tab>
            <Tab value="solar">Solar</Tab>
            <Tab value="ph">Phosphor</Tab>
            <Tab value="logos">Logos</Tab>
            <Tab value="custom">Custom</Tab>
          </TabList>
        </Tabs>

        <div class="row-start gap-sm min-w-0">
          <span class="i-lucide-search text-lg text-muted-foreground shrink-0" />
          <div
            class="flex-1 min-w-0"
            data-testid="icons-search-input"
          >
            <InputText
              v-model="searchKeyword"
              placeholder="搜索图标..."
              class="w-full min-w-0"
            />
          </div>
          <span
            class="text-muted-foreground text-sm shrink-0"
            data-testid="icons-count"
          >
            {{ selectedIconCountText }}
          </span>
        </div>

        <InlineMessage
          v-if="IS_LITE_MODE"
          severity="warn"
        >
          当前处于构建优化模式（Lite），仅展示常用示例图标。运行 pnpm dev:demo 可查看完整库。
        </InlineMessage>
      </div>

      <div class="col-fill row-start gap-md items-stretch min-w-0 overflow-hidden">
        <div
          class="col-fill bg-muted/20 border border-border/40 rounded-lg min-w-0 overflow-hidden"
          data-testid="icons-grid-scroll"
        >
          <CScrollbar
            native
            class="col-fill"
          >
            <div class="p-md col-stretch gap-md min-w-0">
              <div
                v-if="displayedIcons.length"
                class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-md"
                data-testid="icons-grid"
              >
                <button
                  v-for="icon in displayedIcons"
                  :key="icon"
                  type="button"
                  class="col-center gap-sm p-md cursor-pointer transition-all duration-md hover:border-accent hover:shadow-md bg-transparent border border-border/50 rounded-lg text-foreground"
                  :class="{ 'border-accent shadow-md': selectedIcon === icon }"
                  :data-icon-name="icon"
                  data-testid="icon-card"
                  @click="selectIcon(icon)"
                >
                  <span
                    class="center w-[var(--spacing-3xl)] h-[var(--spacing-3xl)]"
                    data-testid="grid-icon"
                  >
                    <Icons
                      :name="icon"
                      :size="iconSize"
                      :color="effectiveIconColor"
                      :animation="iconAnimation"
                      :flip="iconFlip"
                      :rotate="iconRotate"
                      :scale="iconScale"
                      data-testid="grid-icon-rendered"
                    />
                  </span>
                  <span class="text-xs font-mono break-all line-clamp-2 text-center">
                    {{ icon }}
                  </span>
                </button>
              </div>

              <div
                v-if="displayedIcons.length"
                class="center pt-sm"
              >
                <span data-testid="icons-load-more">
                  <Button
                    v-if="hasMoreIcons"
                    label="加载更多"
                    variant="outlined"
                    size="small"
                    @click="loadMore"
                  />
                </span>
              </div>

              <div
                v-else
                class="col-center py-2xl gap-md text-muted-foreground min-w-0"
                data-testid="icons-empty"
              >
                <Icons
                  name="i-lucide-search-x"
                  size="3xl"
                />
                <span class="text-lg">未找到匹配的图标</span>
              </div>
            </div>
          </CScrollbar>
        </div>

        <aside
          class="w-[35vw] max-w-[520px] min-w-[360px] shrink-0 bg-muted/20 border border-border/40 rounded-lg overflow-hidden"
          data-testid="icons-settings-scroll"
        >
          <CScrollbar
            native
            class="col-fill"
          >
            <div class="p-md col-stretch gap-lg min-w-0">
              <section
                class="icons-preview col-center gap-md p-xl bg-muted rounded-md border border-border/50 min-h-[var(--spacing-5xl)] min-w-0"
                data-testid="icons-preview"
              >
                <span
                  v-if="selectedIcon"
                  data-testid="preview-icon"
                >
                  <Icons
                    :name="selectedIcon"
                    :size="iconSize"
                    :color="effectiveIconColor"
                    :animation="iconAnimation"
                    :flip="iconFlip"
                    :rotate="iconRotate"
                    :scale="iconScale"
                    data-testid="preview-icon-rendered"
                  />
                </span>
                <Icons
                  v-else
                  name="i-lucide-mouse-pointer-click"
                  size="2xl"
                />
                <span class="text-sm font-mono text-muted-foreground break-all text-center">
                  {{ selectedIcon || '请从左侧选择一个图标' }}
                </span>
              </section>

              <section
                v-if="selectedIcon"
                class="col-stretch gap-md min-w-0"
              >
                <div class="row-between gap-sm min-w-0">
                  <label class="text-sm font-medium text-foreground">代码示例</label>
                  <Button
                    type="button"
                    size="small"
                    severity="secondary"
                    aria-label="复制代码"
                    title="复制代码"
                    @click="copyCodeExample"
                  >
                    <Icons
                      name="i-lucide-copy"
                      size="sm"
                    />
                  </Button>
                </div>
                <div class="p-md bg-muted rounded-md border border-border/50">
                  <pre
                    class="text-xs font-mono text-foreground whitespace-pre-wrap break-all m-0"
                    >{{ codeExampleText }}</pre
                  >
                </div>
                <InlineMessage
                  v-if="iconColorHint"
                  severity="warn"
                >
                  {{ iconColorHint }}
                </InlineMessage>
              </section>

              <IconControls
                :icon-name="selectedIcon || '未选择'"
                :size="iconSize"
                :color="iconColor"
                :animation="iconAnimation"
                :flip="iconFlip"
                :rotate="iconRotate"
                :scale="iconScale"
                @update:size="iconSize = $event"
                @update:color="iconColor = $event"
                @update:animation="iconAnimation = $event"
                @update:flip="iconFlip = $event"
                @update:rotate="iconRotate = $event"
                @update:scale="iconScale = $event"
              />
            </div>
          </CScrollbar>
        </aside>
      </div>
    </section>
  </div>
</template>
