<script setup lang="ts">
/**
 * Icons 组件示例页面
 * 展示所有图标库的图标，并提供功能控制面板
 */
import { Tabs, TabList, Tab, TabPanels, TabPanel } from 'primevue'
import { ref, computed, watch, nextTick } from 'vue'
import type { IconSize, IconAnimation, FlipDirection } from '@/components/Icons/utils/types'
import { Icons } from '@/components/Icons'
import { LUCIDE_ICONS, MDI_ICONS, LOGOS_ICONS, CUSTOM_ICONS } from './configs/iconLists'
import IconControls from './components/IconControls.vue'
import { useAppElementSize } from '@/hooks/modules/useAppElementSize'

type TabKey = 'lucide' | 'mdi' | 'logos' | 'custom'

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

const searchBarRef = ref<HTMLElement | null>(null)
const { height: searchBarHeight } = useAppElementSize(searchBarRef)

const leftContentStyle = computed(() => {
  if (searchBarHeight.value === 0) return { flex: '1', minHeight: 0 }
  return { height: `calc(100% - ${searchBarHeight.value}px)`, minHeight: 0 }
})

const codeAreaRef = ref<HTMLElement | null>(null)
const previewAreaRef = ref<HTMLElement | null>(null)
const { height: codeAreaHeight } = useAppElementSize(codeAreaRef)
const { height: previewAreaHeight } = useAppElementSize(previewAreaRef)

const middleContentStyle = computed(() => {
  const totalFixedHeight = codeAreaHeight.value + previewAreaHeight.value
  if (totalFixedHeight === 0) return { flex: '1', minHeight: 0 }
  return { height: `calc(100% - ${totalFixedHeight}px)`, minHeight: 0 }
})

const codeExampleText = computed<string>(() => {
  if (!selectedIcon.value || selectedIcon.value === '未选择') return ''
  return `<Icons
  name="${selectedIcon.value}"
${iconSize.value ? `  size="${iconSize.value}"` : ''}${iconColor.value ? `\n  color="${iconColor.value}"` : ''}${iconAnimation.value ? `\n  animation="${iconAnimation.value}"` : ''}${iconFlip.value ? `\n  flip="${iconFlip.value}"` : ''}${iconRotate.value !== undefined && iconRotate.value !== '' ? `\n  rotate="${iconRotate.value}"` : ''}${iconScale.value !== undefined ? `\n  scale="${iconScale.value}"` : ''}
/>`
})

async function copyCodeExample() {
  const text = codeExampleText.value
  if (!text) return
  try {
    await navigator.clipboard.writeText(text)
    window.$toast?.successIn?.('top-right', '已复制', '已复制到剪贴板')
  } catch {
    const ok = document.execCommand('copy', false, text)
    if (ok) window.$toast?.successIn?.('top-right', '已复制', '已复制到剪贴板')
  }
}

const currentIcons = computed(() => {
  let icons: string[] = []
  switch (activeTab.value) {
    case 'lucide':
      icons = LUCIDE_ICONS
      break
    case 'mdi':
      icons = MDI_ICONS
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
</script>

<template>
  <div class="h-full flex flex-col min-h-0">
    <Tabs
      v-model:value="activeTabModel"
      class="flex-1 min-h-0 flex flex-col"
    >
      <div class="shrink-0 flex justify-between items-center border-b-default pr-md">
        <TabList class="border-0!">
          <Tab value="lucide">Lucide</Tab>
          <Tab value="mdi">MDI</Tab>
          <Tab value="logos">Logos</Tab>
          <Tab value="custom">Custom</Tab>
        </TabList>
      </div>

      <TabPanels class="flex-1 min-h-0 flex flex-col overflow-hidden p-0">
        <TabPanel
          :value="activeTab"
          class="flex-1 min-h-0 flex flex-col p-padding-md"
        >
          <div class="flex-1 min-h-0 flex flex-row gap-md items-stretch">
            <!-- 左侧：图标列表 -->
            <div class="flex-1 min-h-0 flex flex-col">
              <div
                ref="searchBarRef"
                class="shrink-0 p-padding-md"
              >
                <div class="flex gap-sm items-center">
                  <span class="i-lucide-search fs-lg text-muted-foreground" />
                  <InputText
                    v-model="searchKeyword"
                    placeholder="搜索图标..."
                    class="flex-1"
                  />
                  <span class="text-muted-foreground fs-sm">
                    <template v-if="hasMoreIcons"
                      >已显示 {{ displayedIcons.length }} / 共
                      {{ currentIcons.length }} 个</template
                    >
                    <template v-else>共 {{ currentIcons.length }} 个图标</template>
                  </span>
                </div>
              </div>

              <div
                :style="leftContentStyle"
                class="min-h-0 overflow-hidden"
              >
                <CScrollbar class="layout-full">
                  <div class="p-padding-md flex flex-col gap-md">
                    <div
                      v-if="currentIcons.length > 0"
                      class="flex flex-col gap-md"
                    >
                      <div
                        class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-md"
                      >
                        <div
                          v-for="icon in displayedIcons"
                          :key="icon"
                          class="flex flex-col items-center gap-sm p-padding-md bg-card component-border rounded-scale-md cursor-pointer transition-all duration-scale-md hover:border-primary hover:shadow-md"
                          :class="{ 'border-primary': selectedIcon === icon }"
                          @click="selectedIcon = icon"
                        >
                          <div
                            class="flex items-center justify-center w-[var(--spacing-3xl)] h-[var(--spacing-3xl)]"
                          >
                            <Icons
                              :name="icon"
                              :size="iconSize"
                              :color="iconColor"
                              :animation="iconAnimation"
                              :flip="iconFlip"
                              :rotate="iconRotate"
                              :scale="iconScale"
                            />
                          </div>
                          <div class="text-center w-full">
                            <div class="fs-xs font-mono text-foreground break-all line-clamp-2">
                              {{ icon }}
                            </div>
                          </div>
                        </div>
                      </div>
                      <div
                        v-if="hasMoreIcons"
                        class="flex justify-center pt-sm"
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
                      class="flex flex-col items-center justify-center py-padding-2xl gap-md text-muted-foreground"
                    >
                      <Icons
                        name="i-lucide-search-x"
                        size="3xl"
                      />
                      <span class="fs-lg">未找到匹配的图标</span>
                    </div>
                  </div>
                </CScrollbar>
              </div>
            </div>

            <!-- 右侧：控制面板 -->
            <div class="w-80 shrink-0 min-h-0 flex flex-col gap-lg hidden xl:flex">
              <div
                ref="codeAreaRef"
                class="shrink-0"
              >
                <div
                  v-if="selectedIcon && selectedIcon !== '未选择'"
                  class="flex flex-col gap-md"
                >
                  <div class="flex items-center justify-between gap-sm">
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
                  <div class="p-padding-md bg-muted rounded-scale-md border border-border/50">
                    <pre
                      class="fs-xs font-mono text-foreground whitespace-pre-wrap break-all m-0"
                      >{{ codeExampleText }}</pre
                    >
                  </div>
                </div>
              </div>

              <div
                :style="middleContentStyle"
                class="min-h-0 overflow-hidden"
              >
                <CScrollbar class="layout-full">
                  <div class="p-padding-md">
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
                class="shrink-0 flex flex-col gap-md"
              >
                <h3 class="fs-md font-semibold text-foreground">预览</h3>
                <div
                  v-if="selectedIcon"
                  class="flex flex-col items-center justify-center gap-md p-padding-xl bg-muted rounded-scale-md border border-border/50 min-h-[var(--spacing-5xl)]"
                >
                  <Icons
                    :name="selectedIcon"
                    :size="iconSize"
                    :color="iconColor"
                    :animation="iconAnimation"
                    :flip="iconFlip"
                    :rotate="iconRotate"
                    :scale="iconScale"
                  />
                  <div class="text-center">
                    <div class="fs-sm font-mono text-muted-foreground break-all">
                      {{ selectedIcon }}
                    </div>
                  </div>
                </div>
                <div
                  v-else
                  class="flex flex-col items-center justify-center gap-md p-padding-xl bg-muted rounded-scale-md border border-border/50 min-h-[var(--spacing-5xl)] text-muted-foreground"
                >
                  <Icons
                    name="i-lucide-mouse-pointer-click"
                    size="2xl"
                  />
                  <span class="fs-sm">请从左侧选择一个图标</span>
                </div>
              </div>
            </div>
          </div>
        </TabPanel>
      </TabPanels>
    </Tabs>
  </div>
</template>
