<script setup lang="ts">
/**
 * Icons 组件示例页面
 * 展示所有图标库的图标，并提供功能控制面板
 */
defineOptions({ name: 'ExampleIcons' })

import type { IconSize, IconAnimation, FlipDirection } from '@/components/Icons/utils/types'
import {
  LUCIDE_ICONS,
  SOLAR_ICONS,
  PH_ICONS,
  LOGOS_ICONS,
  CUSTOM_ICONS,
  IS_LITE_MODE,
} from './configs/iconLists.generated'
import IconControls from './components/IconControls.vue'
import { useAppElementSize } from '@/hooks/modules/useAppElementSize'

type TabKey = 'lucide' | 'solar' | 'ph' | 'logos' | 'custom'

const INITIAL_DISPLAY_COUNT = 50
const LOAD_MORE_STEP = 50

const activeTab = ref<TabKey>('lucide')
const activeTabModel = computed({
  get: () => activeTab.value,
  set: (v: string | number) => {
    activeTab.value = v as TabKey
  },
}) as import('vue').Ref<string | number>

const displayCount = ref<number>(INITIAL_DISPLAY_COUNT)
const selectedIcon = ref<string>('')
const iconSize = ref<IconSize>('md')
const iconColor = ref<string | undefined>(undefined)
const iconAnimation = ref<IconAnimation | undefined>(undefined)
const iconFlip = ref<FlipDirection | undefined>(undefined)
const iconRotate = ref<string | number>('')
const iconScale = ref<number | undefined>(undefined)
const searchKeyword = ref<string | undefined>('')

const searchBarRef = useTemplateRef<HTMLElement>('searchBarRef')
const { height: searchBarHeight } = useAppElementSize(searchBarRef)

const leftContentStyle = computed(() => {
  if (searchBarHeight.value === 0) return { flex: '1', minHeight: 0 }
  return { height: `calc(100% - ${searchBarHeight.value}px)`, minHeight: 0 }
})

const codeAreaRef = useTemplateRef<HTMLElement>('codeAreaRef')
const previewAreaRef = useTemplateRef<HTMLElement>('previewAreaRef')
const { height: codeAreaHeight } = useAppElementSize(codeAreaRef)
const { height: previewAreaHeight } = useAppElementSize(previewAreaRef)

const middleContentStyle = computed(() => {
  const totalFixedHeight = codeAreaHeight.value + previewAreaHeight.value
  if (totalFixedHeight === 0) return { flex: '1', minHeight: 0 }
  return { height: `calc(100% - ${totalFixedHeight}px)`, minHeight: 0 }
})

const CSS_VAR_PATTERN = /^var\(--[a-zA-Z0-9-_]+\)$/
const UNO_TEXT_COLOR_CLASS_PATTERN = /^!?text-[a-zA-Z0-9_:/.[\]-]+$/
const normalizedIconColor = computed<string>(() => (iconColor.value ?? '').trim())
const isIconColorValid = computed<boolean>(() => {
  if (!normalizedIconColor.value) return true
  return (
    CSS_VAR_PATTERN.test(normalizedIconColor.value) ||
    UNO_TEXT_COLOR_CLASS_PATTERN.test(normalizedIconColor.value)
  )
})
const effectiveIconColor = computed<string | undefined>(() =>
  normalizedIconColor.value && isIconColorValid.value ? normalizedIconColor.value : undefined
)
const iconColorHint = computed<string>(() => {
  if (!normalizedIconColor.value || isIconColorValid.value) return ''
  return '当前 color 输入不符合 Icons 约束，预览与代码示例已自动忽略该值。'
})

const codeExampleText = computed<string>(() => {
  if (!selectedIcon.value || selectedIcon.value === '未选择') return ''
  return `<Icons
  name="${selectedIcon.value}"
${iconSize.value ? `  size="${iconSize.value}"` : ''}${effectiveIconColor.value ? `\n  color="${effectiveIconColor.value}"` : ''}${iconAnimation.value ? `\n  animation="${iconAnimation.value}"` : ''}${iconFlip.value ? `\n  flip="${iconFlip.value}"` : ''}${iconRotate.value !== undefined && iconRotate.value !== '' ? `\n  rotate="${iconRotate.value}"` : ''}${iconScale.value !== undefined ? `\n  scale="${iconScale.value}"` : ''}
/>`
})

async function copyCodeExample() {
  const text = codeExampleText.value
  if (!text) return
  try {
    await navigator.clipboard.writeText(text)
    window.$message?.success?.('已复制到剪贴板')
  } catch {
    window.$message?.danger?.('复制失败，请检查浏览器剪贴板权限')
  }
}

const currentIcons = computed(() => {
  let icons: readonly string[] = []
  switch (activeTab.value) {
    case 'lucide':
      icons = LUCIDE_ICONS
      break
    case 'solar':
      icons = SOLAR_ICONS
      break
    case 'ph':
      icons = PH_ICONS
      break
    case 'logos':
      icons = LOGOS_ICONS
      break
    case 'custom':
      icons = CUSTOM_ICONS
      break
  }
  if (searchKeyword.value) {
    const keyword = searchKeyword.value.toLowerCase()
    icons = icons.filter(icon => icon.toLowerCase().includes(keyword))
  }
  return icons
})

const displayedIcons = computed(() => currentIcons.value.slice(0, displayCount.value))
const hasMoreIcons = computed(() => displayCount.value < currentIcons.value.length)

function loadMore() {
  displayCount.value = Math.min(displayCount.value + LOAD_MORE_STEP, currentIcons.value.length)
}

watch(
  [() => activeTab.value, () => searchKeyword.value],
  () => {
    displayCount.value = INITIAL_DISPLAY_COUNT
    nextTick(() => {
      const icons = currentIcons.value
      if (icons.length > 0) {
        if (!icons.includes(selectedIcon.value)) selectedIcon.value = icons[0]
      } else {
        selectedIcon.value = ''
      }
    })
  },
  { immediate: true }
)

function resetControls() {
  iconSize.value = 'md'
  iconColor.value = undefined
  iconAnimation.value = undefined
  iconFlip.value = undefined
  iconRotate.value = ''
  iconScale.value = undefined
}

watch(activeTab, () => {
  resetControls()
  searchKeyword.value = ''
})

function openExternalLink(url: string) {
  window.open(url, '_blank')
}
</script>

<template>
  <div
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
                  name="i-lucide-grid-2x2"
                  size="xl"
                  class="text-primary"
                />
              </div>
              <div class="col-stretch gap-xs min-w-0">
                <div class="row-start gap-xs min-w-0 flex-wrap">
                  <span class="text-lg font-bold text-foreground text-no-wrap">Icon Explorer</span>
                  <span
                    class="surface-primary rounded-md px-sm py-xs text-xs font-semibold uppercase"
                  >
                    COMPONENT
                  </span>
                </div>
                <span class="text-sm text-muted-foreground text-ellipsis-1">
                  展示所有图标库的图标，并提供功能控制面板
                </span>
              </div>
            </div>
          </div>
        </header>

        <section class="material-elevated col-stretch gap-md min-w-0">
          <Tabs
            v-model:value="activeTabModel"
            class="col-fill"
          >
            <div class="shrink-0 row-between pr-md min-w-0">
              <TabList class="border-0!">
                <Tab value="lucide">Lucide</Tab>
                <Tab value="solar">Solar</Tab>
                <Tab value="ph">Phosphor</Tab>
                <Tab value="logos">Logos</Tab>
                <Tab value="custom">Custom</Tab>
              </TabList>
            </div>

            <TabPanels class="col-fill overflow-hidden p-0">
              <TabPanel
                :value="activeTab"
                class="col-fill p-md col-stretch gap-md"
              >
                <!-- Lite 模式提示 -->
                <div
                  v-if="IS_LITE_MODE"
                  class="shrink-0 p-md bg-warn/10 border border-warn/30 rounded-md row-start gap-md min-w-0"
                >
                  <Icons
                    name="i-lucide-alert-circle"
                    class="text-warn"
                  />
                  <div class="flex-1 min-w-0">
                    <span class="text-sm font-medium text-warn">
                      当前处于构建优化模式（Lite），仅展示常用示例图标。
                    </span>
                    <span class="text-xs text-muted-foreground ml-sm">
                      运行
                      <code class="code-inline">pnpm dev:demo</code>
                      可查看完整库（Lucide / Solar / Phosphor 等多套图标库）。
                    </span>
                  </div>
                  <Button
                    label="了解更多"
                    size="small"
                    text
                    class="text-xs"
                    @click="openExternalLink('https://antigravity.dev')"
                  />
                </div>

                <div class="flex-1 min-h-0 row-start gap-md items-stretch overflow-hidden min-w-0">
                  <!-- 左侧：图标列表 -->
                  <div class="col-fill min-w-0">
                    <div
                      ref="searchBarRef"
                      class="shrink-0 p-md"
                    >
                      <div class="row-start gap-sm min-w-0">
                        <span class="i-lucide-search text-lg text-muted-foreground" />
                        <InputText
                          v-model="searchKeyword"
                          placeholder="搜索图标..."
                          class="flex-1"
                        />
                        <span class="text-muted-foreground text-sm">
                          <template v-if="hasMoreIcons">
                            已显示 {{ displayedIcons.length }} / 共 {{ currentIcons.length }} 个
                          </template>
                          <template v-else>共 {{ currentIcons.length }} 个图标</template>
                        </span>
                      </div>
                    </div>

                    <div
                      :style="leftContentStyle"
                      class="min-h-0 overflow-hidden"
                    >
                      <!-- 局部滚动：图标列表为高密度区域，保留独立滚动以避免挤压右侧控制面板 -->
                      <CScrollbar class="layout-full">
                        <div class="p-md col-stretch gap-md min-w-0">
                          <div
                            v-if="currentIcons.length > 0"
                            class="col-stretch gap-md min-w-0"
                          >
                            <div
                              class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-md"
                            >
                              <div
                                v-for="icon in displayedIcons"
                                :key="icon"
                                class="col-center gap-sm p-md cursor-pointer transition-all duration-md hover:border-accent hover:shadow-md"
                                :class="{ 'border-accent': selectedIcon === icon }"
                                @click="selectedIcon = icon"
                              >
                                <div class="center w-[var(--spacing-3xl)] h-[var(--spacing-3xl)]">
                                  <Icons
                                    :name="icon"
                                    :size="iconSize"
                                    :color="effectiveIconColor"
                                    :animation="iconAnimation"
                                    :flip="iconFlip"
                                    :rotate="iconRotate"
                                    :scale="iconScale"
                                  />
                                </div>
                                <div class="text-center w-full">
                                  <div
                                    class="text-xs font-mono text-foreground break-all line-clamp-2"
                                  >
                                    {{ icon }}
                                  </div>
                                </div>
                              </div>
                            </div>
                            <div
                              v-if="hasMoreIcons"
                              class="center pt-sm"
                            >
                              <Button
                                label="加载更多"
                                variant="outlined"
                                size="small"
                                @click="loadMore"
                              />
                            </div>
                          </div>

                          <div
                            v-if="currentIcons.length === 0"
                            class="col-center py-2xl gap-md text-muted-foreground min-w-0"
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
                  </div>

                  <!-- 右侧：控制面板 -->
                  <div class="w-[30%] shrink-0 min-h-0 col-stretch gap-lg hidden xl:flex min-w-0">
                    <div
                      ref="codeAreaRef"
                      class="shrink-0"
                    >
                      <div
                        v-if="selectedIcon && selectedIcon !== '未选择'"
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
                      </div>
                    </div>

                    <div
                      :style="middleContentStyle"
                      class="min-h-0 overflow-hidden"
                    >
                      <!-- 局部滚动：控制面板字段较多，保留独立滚动以维持三栏并行可读性 -->
                      <CScrollbar class="layout-full">
                        <div class="p-md">
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
                    </div>

                    <div
                      ref="previewAreaRef"
                      class="shrink-0 col-stretch gap-md min-w-0"
                    >
                      <h3 class="text-md font-semibold text-foreground">预览</h3>
                      <div
                        v-if="selectedIcon"
                        class="col-center gap-md p-xl bg-muted rounded-md border border-border/50 min-h-[var(--spacing-5xl)] min-w-0"
                      >
                        <Icons
                          :name="selectedIcon"
                          :size="iconSize"
                          :color="effectiveIconColor"
                          :animation="iconAnimation"
                          :flip="iconFlip"
                          :rotate="iconRotate"
                          :scale="iconScale"
                        />
                        <div class="text-center">
                          <div class="text-sm font-mono text-muted-foreground break-all">
                            {{ selectedIcon }}
                          </div>
                        </div>
                      </div>
                      <div
                        v-else
                        class="col-center gap-md p-xl bg-muted rounded-md border border-border/50 min-h-[var(--spacing-5xl)] text-muted-foreground min-w-0"
                      >
                        <Icons
                          name="i-lucide-mouse-pointer-click"
                          size="2xl"
                        />
                        <span class="text-sm">请从左侧选择一个图标</span>
                      </div>
                    </div>
                  </div>
                </div>
              </TabPanel>
            </TabPanels>
          </Tabs>
        </section>
      </div>
    </div>
  </div>
</template>
